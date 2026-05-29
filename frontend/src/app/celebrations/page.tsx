"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import DateRangePicker from "@/components/ui/DateRangePicker";
import StatusFilterTabs from "@/components/ui/StatusFilterTabs";
import {
  getBirthdays,
  getWeddingAnniversaries,
  getCelebrations,
  markCelebrationsAsTreated,
  type UserResponse,
  type CelebrationResponse,
} from "@/lib/api";
import { PartyPopper, Download } from "lucide-react";

type Tab = "birthdays" | "anniversaries" | "thanksgiving";
type ThanksgivingStatus = "All" | "PENDING" | "TREATED";
type ExportFormat = "csv" | "excel" | "pdf" | "word";

const ITEMS_PER_PAGE = 50;
const CELEB_PER_PAGE = 10;
const CARDS_PER_PAGE = 12;

// ── Avatar helpers (matches directory style) ────────────────────────────────

const avatarBgColors = [
  "bg-[#B5B5F3]", "bg-[#BFDBFE]", "bg-[#BBF7D0]",
  "bg-[#FDE68A]", "bg-[#FECACA]", "bg-[#DDD6FE]",
  "bg-[#A7F3D0]", "bg-[#FED7AA]",
];

function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return avatarBgColors[Math.abs(hash) % avatarBgColors.length];
}

function initials(u: { firstName?: string; lastName?: string }) {
  return `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

// ── Name / date helpers ─────────────────────────────────────────────────────

function fullName(u?: { firstName?: string; middleName?: string; lastName?: string } | null) {
  if (!u) return "—";
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

function monthName(m?: number) {
  if (!m) return "—";
  return new Date(2000, m - 1, 1).toLocaleDateString("en-US", { month: "short" });
}

function fmtBirthdayDate(u: UserResponse) {
  if (!u.dayOfBirth || !u.monthOfBirth) return "—";
  const year = u.yearOfBirth ? ` ${u.yearOfBirth}` : "";
  return `${monthName(u.monthOfBirth)} ${u.dayOfBirth}${year}`;
}

function fmtWeddingDate(u: UserResponse) {
  if (!u.dayOfWedding || !u.monthOfWedding) return "—";
  const year = u.yearOfWedding ? ` ${u.yearOfWedding}` : "";
  return `${monthName(u.monthOfWedding)} ${u.dayOfWedding}${year}`;
}

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Returns Monday of the current week */
function thisWeekStartISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

/** Returns Sunday of the current week */
function thisWeekEndISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function isoToParts(iso: string) {
  const [, mm, dd] = iso.split("-").map(Number);
  return { day: dd, month: mm };
}


// ── Export row type ──────────────────────────────────────────────────────────

type ExportRow = Record<string, string>;

function buildBirthdayRows(users: UserResponse[]): ExportRow[] {
  return users.map((u) => ({
    "Full Name": fullName(u),
    "Date of Birth": fmtBirthdayDate(u),
    "Phone Number": u.phoneNumber ?? "—",
    "Email Address": u.email ?? "—",
    "_photoUrl": u.profilePictureUrl ?? "",
  }));
}

function buildAnniversaryRows(users: UserResponse[]): ExportRow[] {
  return users.map((u) => ({
    "Full Name": fullName(u) + (u.spouse ? ` & ${fullName(u.spouse)}` : ""),
    "Wedding Anniversary Date": fmtWeddingDate(u),
    "Phone Number": u.phoneNumber ?? "—",
    "Email Address": u.email ?? "—",
    "_photoUrl": u.couplePictureUrl ?? u.profilePictureUrl ?? "",
  }));
}

// ── Image fetch helper with extension detection ───────────────────────────────

async function fetchImageData(url: string): Promise<{ buffer: ArrayBuffer; ext: string } | null> {
  if (!url) return null;
  const candidates = [
    `/.netlify/functions/img-proxy?url=${encodeURIComponent(url)}`,
    url,
  ];
  for (const u of candidates) {
    try {
      const r = await fetch(u);
      if (!r.ok) continue;
      const buf = await r.arrayBuffer();
      const ct = r.headers.get("content-type") ?? "";
      let ext = "jpg";
      if (ct.includes("png")) ext = "png";
      else if (ct.includes("gif")) ext = "gif";
      else if (ct.includes("webp")) ext = "webp";
      else {
        const urlPath = url.split("?")[0].toLowerCase();
        if (urlPath.endsWith(".png")) ext = "png";
        else if (urlPath.endsWith(".gif")) ext = "gif";
        else if (urlPath.endsWith(".webp")) ext = "webp";
        else ext = "jpg";
      }
      return { buffer: buf, ext };
    } catch { continue; }
  }
  return null;
}

/** Convert a celebrant's full name to a safe filename stem, e.g. "Mr John Doe" → "Mr_John_Doe" */
function nameToFileStem(name: string): string {
  return name.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "_") || "Celebrant";
}

/** Download the document blob (and any photos) as a ZIP archive. */
async function downloadAsZip(
  docBlob: Blob,
  docFilename: string,
  photos: Array<{ name: string; buffer: ArrayBuffer; ext: string }>,
) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  zip.file(docFilename, docBlob);

  const photoFolder = zip.folder("photos");
  if (photoFolder) {
    for (const p of photos) {
      photoFolder.file(`${p.name}.${p.ext}`, p.buffer);
    }
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${docFilename.replace(/\.[^.]+$/, "")}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Collect photos for all rows that have a _photoUrl. */
async function collectPhotos(rows: ExportRow[]): Promise<Array<{ name: string; buffer: ArrayBuffer; ext: string }>> {
  const results = await Promise.all(
    rows.map(async (r) => {
      const photoUrl = r["_photoUrl"];
      if (!photoUrl) return null;
      const data = await fetchImageData(photoUrl);
      if (!data) return null;
      return { name: nameToFileStem(r["Full Name"] ?? "Celebrant"), buffer: data.buffer, ext: data.ext };
    })
  );
  return results.filter((x): x is NonNullable<typeof x> => x !== null);
}

// ── Core export function ─────────────────────────────────────────────────────

async function exportData(
  format: ExportFormat,
  rows: ExportRow[],
  filename: string,
  dateColumn: string,
) {
  if (rows.length === 0) return;

  const columns = ["Full Name", dateColumn, "Phone Number", "Email Address"];

  // ── CSV ──────────────────────────────────────────────────────────────────
  if (format === "csv") {
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const header = columns.map(escape).join(",");
    const body = rows
      .map((r) => columns.map((c) => escape(r[c] ?? "")).join(","))
      .join("\n");
    const docBlob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
    const photos = await collectPhotos(rows);

    if (photos.length > 0) {
      await downloadAsZip(docBlob, `${filename}.csv`, photos);
    } else {
      const url = URL.createObjectURL(docBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    return;
  }

  // ── Excel ────────────────────────────────────────────────────────────────
  if (format === "excel") {
    const { utils, write } = await import("xlsx");
    const ws = utils.json_to_sheet(
      rows.map((r) =>
        columns.reduce<Record<string, string>>((acc, c) => { acc[c] = r[c] ?? ""; return acc; }, {})
      ),
      { header: columns }
    );
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Celebrants");
    const xlsxBuf = write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
    const docBlob = new Blob([xlsxBuf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const photos = await collectPhotos(rows);

    if (photos.length > 0) {
      await downloadAsZip(docBlob, `${filename}.xlsx`, photos);
    } else {
      const url = URL.createObjectURL(docBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    }
    return;
  }

  // ── PDF ──────────────────────────────────────────────────────────────────
  if (format === "pdf") {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 128);
    doc.text(filename.replace(/_/g, " "), 14, 16);
    doc.setTextColor(0, 0, 0);

    autoTable(doc, {
      startY: 24,
      head: [columns],
      body: rows.map((r) => columns.map((c) => r[c] ?? "")),
      styles: { fontSize: 10, cellPadding: 4, valign: "middle" },
      headStyles: { fillColor: [0, 0, 128], textColor: 255, fontStyle: "bold", fontSize: 11 },
      rowPageBreak: "avoid",
    });

    const photos = await collectPhotos(rows);

    if (photos.length > 0) {
      const pdfOutput = doc.output("blob");
      await downloadAsZip(pdfOutput, `${filename}.pdf`, photos);
    } else {
      doc.save(`${filename}.pdf`);
    }
    return;
  }

  // ── Word ─────────────────────────────────────────────────────────────────
  if (format === "word") {
    const {
      Document, Packer, Paragraph, Table, TableRow, TableCell,
      TextRun, WidthType, AlignmentType, BorderStyle,
    } = await import("docx");

    const borderStyle = { style: BorderStyle.SINGLE, size: 4, color: "E5E7EB" };
    const tableBorders = {
      top: borderStyle, bottom: borderStyle,
      left: borderStyle, right: borderStyle,
      insideHorizontal: borderStyle, insideVertical: borderStyle,
    };

    const headerCells = columns.map(
      (col) =>
        new TableCell({
          shading: { fill: "000080" },
          children: [
            new Paragraph({
              children: [new TextRun({ text: col, bold: true, color: "FFFFFF", size: 18 })],
            }),
          ],
        })
    );

    const dataRows = rows.map((r) => {
      const cells = columns.map((c) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: r[c] ?? "—", size: 18 })],
            }),
          ],
        })
      );
      return new TableRow({ children: cells });
    });

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tableBorders,
      rows: [new TableRow({ children: headerCells, tableHeader: true }), ...dataRows],
    });

    const wordDoc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: filename.replace(/_/g, " "), bold: true, size: 32, color: "000080" }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
            }),
            table,
          ],
        },
      ],
    });

    const docBlob = await Packer.toBlob(wordDoc);
    const photos = await collectPhotos(rows);

    if (photos.length > 0) {
      await downloadAsZip(docBlob, `${filename}.docx`, photos);
    } else {
      const { saveAs } = await import("file-saver");
      saveAs(docBlob, `${filename}.docx`);
    }
    return;
  }
}

// ── Export dropdown ──────────────────────────────────────────────────────────

function ExportMenu({ onExport, disabled }: { onExport: (fmt: ExportFormat) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => onExport("excel")}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#000080] bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-[#000080] dark:text-indigo-400 hover:bg-[#000080]/5 disabled:opacity-40"
    >
      <Download className="h-4 w-4" />
      Export
    </button>
  );
}

// ── Birthday card (directory-style) ─────────────────────────────────────────

function BirthdayCard({ u }: { u: UserResponse }) {
  const bg = avatarColor(u.id);
  const name = fullName(u);
  const date = fmtBirthdayDate(u);
  const phone = u.phoneNumber
    ? `+${u.countryCode ?? ""} ${u.phoneNumber}`.trim()
    : null;

  return (
    <div className="flex flex-col rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5 transition-shadow hover:shadow-md">
      {/* Avatar + badge */}
      <div className="mb-3 flex items-start justify-between">
        {u.profilePictureUrl ? (
          <img
            src={u.profilePictureUrl}
            alt={name}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full ${bg} text-lg font-bold text-[#000080] dark:text-indigo-400`}
          >
            {initials(u)}
          </div>
        )}
        <span className="rounded-full bg-pink-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-pink-700">
          🎂 Birthday
        </span>
      </div>

      {/* Info */}
      <h3 className="text-sm font-bold text-[#111827] dark:text-slate-100">{name}</h3>
      <p className="mt-0.5 text-xs font-medium text-[#6B7280] dark:text-slate-400">🗓 {date}</p>
      {phone && <p className="mt-1 text-xs text-[#374151] dark:text-slate-300">📞 {phone}</p>}
      {u.email && (
        <p className="mt-0.5 truncate text-xs text-[#000080] dark:text-indigo-400">{u.email}</p>
      )}
    </div>
  );
}

// ── Anniversary card (directory-style) ──────────────────────────────────────

function AnniversaryCard({ u }: { u: UserResponse }) {
  const bg = avatarColor(u.id);
  const coupleName = fullName(u) + (u.spouse ? ` & ${fullName(u.spouse)}` : "");
  const date = fmtWeddingDate(u);
  const phone = u.phoneNumber
    ? `+${u.countryCode ?? ""} ${u.phoneNumber}`.trim()
    : null;

  return (
    <div className="flex flex-col rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5 transition-shadow hover:shadow-md">
      {/* Avatar + badge */}
      <div className="mb-3 flex items-start justify-between">
        {u.couplePictureUrl || u.profilePictureUrl ? (
          <img
            src={u.couplePictureUrl ?? u.profilePictureUrl!}
            alt={coupleName}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full ${bg} text-lg font-bold text-[#000080] dark:text-indigo-400`}
          >
            {initials(u)}
          </div>
        )}
        <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-700">
          💍 Anniversary
        </span>
      </div>

      {/* Info */}
      <h3 className="text-sm font-bold text-[#111827] dark:text-slate-100 leading-snug">{coupleName}</h3>
      <p className="mt-0.5 text-xs font-medium text-[#6B7280] dark:text-slate-400">🗓 {date}</p>
      {phone && <p className="mt-1 text-xs text-[#374151] dark:text-slate-300">📞 {phone}</p>}
      {u.email && (
        <p className="mt-0.5 truncate text-xs text-[#000080] dark:text-indigo-400">{u.email}</p>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CelebrationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("birthdays");

  // Read ?tab= URL param after mount (useSearchParams can't be used in static export
  // without a Suspense boundary, so we read window.location directly).
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as Tab | null;
      if (tab && (["birthdays", "anniversaries", "thanksgiving"] as Tab[]).includes(tab)) {
        setActiveTab(tab);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [search, setSearch] = useState("");

  // Birthdays
  const [birthdays, setBirthdays] = useState<UserResponse[]>([]);
  const [bdLoading, setBdLoading] = useState(false);
  const [bdError, setBdError] = useState("");
  const [bFrom, setBFrom] = useState(thisWeekStartISO);
  const [bTo, setBTo] = useState(thisWeekEndISO);
  const [bdPage, setBdPage] = useState(1);

  // Anniversaries
  const [anniversaries, setAnniversaries] = useState<UserResponse[]>([]);
  const [annLoading, setAnnLoading] = useState(false);
  const [annError, setAnnError] = useState("");
  const [aFrom, setAFrom] = useState(thisWeekStartISO);
  const [aTo, setATo] = useState(thisWeekEndISO);
  const [annPage, setAnnPage] = useState(1);

  // Thanksgiving (Celebrations)
  const [celebrations, setCelebrations] = useState<CelebrationResponse[]>([]);
  const [celebLoading, setCelebLoading] = useState(false);
  const [celebError, setCelebError] = useState("");
  const [celebPage, setCelebPage] = useState(1);
  const [celebTotalPages, setCelebTotalPages] = useState(1);
  const [celebTotalItems, setCelebTotalItems] = useState(0);
  const [tgStatus, setTgStatus] = useState<ThanksgivingStatus>("All");

  // Exporting state
  const [exporting, setExporting] = useState(false);

  const tabs: { key: Tab; label: string }[] = [
    { key: "birthdays", label: "Birthdays" },
    { key: "anniversaries", label: "Wedding Anniversaries" },
    { key: "thanksgiving", label: "Thanksgiving" },
  ];

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchBirthdays = useCallback(async (from: string, to: string) => {
    setBdLoading(true); setBdError("");
    try {
      const f = isoToParts(from); const t = isoToParts(to);
      const res = await getBirthdays(f.day, f.month, t.day, t.month, 0, ITEMS_PER_PAGE);
      setBirthdays(res.content ?? []);
    } catch (err) {
      setBdError(err instanceof Error ? err.message : "Failed to load birthdays.");
    } finally { setBdLoading(false); }
  }, []);

  const fetchAnniversaries = useCallback(async (from: string, to: string) => {
    setAnnLoading(true); setAnnError("");
    try {
      const f = isoToParts(from); const t = isoToParts(to);
      const res = await getWeddingAnniversaries(f.day, f.month, t.day, t.month, 0, ITEMS_PER_PAGE);
      setAnniversaries(res.content ?? []);
    } catch (err) {
      setAnnError(err instanceof Error ? err.message : "Failed to load anniversaries.");
    } finally { setAnnLoading(false); }
  }, []);

  const fetchCelebrations = useCallback(async (page: number) => {
    setCelebLoading(true); setCelebError("");
    try {
      const res = await getCelebrations(page - 1, CELEB_PER_PAGE);
      setCelebrations(res.content ?? []);
      setCelebTotalPages(res.totalPages ?? 1);
      setCelebTotalItems(res.totalElements ?? 0);
    } catch (err) {
      setCelebError(err instanceof Error ? err.message : "Failed to load thanksgiving entries.");
    } finally { setCelebLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === "birthdays") fetchBirthdays(bFrom, bTo);
  }, [activeTab, bFrom, bTo, fetchBirthdays]);

  useEffect(() => {
    if (activeTab === "anniversaries") fetchAnniversaries(aFrom, aTo);
  }, [activeTab, aFrom, aTo, fetchAnniversaries]);

  useEffect(() => {
    if (activeTab === "thanksgiving") fetchCelebrations(celebPage);
  }, [activeTab, celebPage, fetchCelebrations]);

  // ── Filter ──────────────────────────────────────────────────────────────────

  const q = search.toLowerCase().trim();

  const filteredBirthdays = birthdays.filter((u) =>
    !q || fullName(u).toLowerCase().includes(q)
  );

  const filteredAnniversaries = anniversaries.filter((u) => {
    if (!q) return true;
    return (
      fullName(u).toLowerCase().includes(q) ||
      (u.spouse ? fullName(u.spouse).toLowerCase().includes(q) : false)
    );
  });

  const filteredCelebrations = celebrations.filter((c) => {
    if (tgStatus !== "All" && c.celebrationStatus !== tgStatus) return false;
    if (!q) return true;
    return fullName(c.requester).toLowerCase().includes(q);
  });

  // Pagination for card grids
  const bdTotalPages = Math.max(1, Math.ceil(filteredBirthdays.length / CARDS_PER_PAGE));
  const safeBdPage = Math.min(bdPage, bdTotalPages);
  const paginatedBirthdays = filteredBirthdays.slice(
    (safeBdPage - 1) * CARDS_PER_PAGE, safeBdPage * CARDS_PER_PAGE
  );

  const annTotalPages = Math.max(1, Math.ceil(filteredAnniversaries.length / CARDS_PER_PAGE));
  const safeAnnPage = Math.min(annPage, annTotalPages);
  const paginatedAnniversaries = filteredAnniversaries.slice(
    (safeAnnPage - 1) * CARDS_PER_PAGE, safeAnnPage * CARDS_PER_PAGE
  );

  // ── Mark treated ─────────────────────────────────────────────────────────────

  const handleMarkTreated = async (id: string) => {
    try {
      await markCelebrationsAsTreated([id]);
      fetchCelebrations(celebPage);
    } catch (err) {
      console.error("Mark treated failed:", err);
    }
  };

  // ── Export ────────────────────────────────────────────────────────────────────

  const handleBirthdayExport = async (fmt: ExportFormat) => {
    setExporting(true);
    try {
      await exportData(fmt, buildBirthdayRows(filteredBirthdays), "Birthdays_Celebrants", "Date of Birth");
    } finally { setExporting(false); }
  };

  const handleAnniversaryExport = async (fmt: ExportFormat) => {
    setExporting(true);
    try {
      await exportData(fmt, buildAnniversaryRows(filteredAnniversaries), "Anniversary_Celebrants", "Wedding Anniversary Date");
    } finally { setExporting(false); }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7]">
              <PartyPopper className="h-6 w-6 text-[#D97706]" />
            </div>
            <div>
              <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Celebrations</h1>
              <p className="text-sm text-[#6B7280] dark:text-slate-400">Birthdays, anniversaries, and thanksgiving celebrations</p>
            </div>
          </div>
          {activeTab === "thanksgiving" && (
            <Button
              variant="primary"
              onClick={() => router.push("/celebrations/add?type=Thanksgiving")}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            >
              Add Thanksgiving Request
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-6 border-b border-[#E5E7EB] dark:border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSearch(""); }}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[#000080] text-[#000080] dark:text-indigo-400"
                : "text-[#6B7280] dark:text-slate-400 hover:text-[#374151] dark:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Birthdays ────────────────────────────────────────────────────────── */}
      {activeTab === "birthdays" && (
        <>
          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-full sm:w-72">
                <SearchBar value={search} onChange={(v) => { setSearch(v); setBdPage(1); }} onSearch={() => {}} placeholder="Search birthdays…" />
              </div>
              <DateRangePicker from={bFrom} to={bTo} onFromChange={(v) => { setBFrom(v); setBdPage(1); }} onToChange={(v) => { setBTo(v); setBdPage(1); }} />
            </div>
            <ExportMenu onExport={handleBirthdayExport} disabled={exporting || filteredBirthdays.length === 0} />
          </div>

          {/* Stats */}
          {!bdLoading && filteredBirthdays.length > 0 && (
            <div className="mb-4 flex items-center gap-2 text-sm text-[#6B7280] dark:text-slate-400">
              <span className="font-medium text-[#000080] dark:text-indigo-400">{filteredBirthdays.length}</span>
              {filteredBirthdays.length === 1 ? " birthday" : " birthdays"} in this period
            </div>
          )}

          {bdError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
              {bdError} — <button className="font-medium underline" onClick={() => fetchBirthdays(bFrom, bTo)}>Retry</button>
            </div>
          )}

          {bdLoading ? (
            <div className="flex h-48 items-center justify-center gap-2 text-gray-400 dark:text-slate-500">
              <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading…
            </div>
          ) : filteredBirthdays.length === 0 ? (
            <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center text-sm text-gray-400 dark:text-slate-500">
              No birthdays found for this period.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedBirthdays.map((u) => (
                  <BirthdayCard key={u.id} u={u} />
                ))}
              </div>
              <div className="mt-6">
                <Pagination
                  currentPage={safeBdPage}
                  totalPages={bdTotalPages}
                  totalItems={filteredBirthdays.length}
                  onPageChange={setBdPage}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* ── Anniversaries ─────────────────────────────────────────────────────── */}
      {activeTab === "anniversaries" && (
        <>
          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-full sm:w-72">
                <SearchBar value={search} onChange={(v) => { setSearch(v); setAnnPage(1); }} onSearch={() => {}} placeholder="Search anniversaries…" />
              </div>
              <DateRangePicker from={aFrom} to={aTo} onFromChange={(v) => { setAFrom(v); setAnnPage(1); }} onToChange={(v) => { setATo(v); setAnnPage(1); }} />
            </div>
            <ExportMenu onExport={handleAnniversaryExport} disabled={exporting || filteredAnniversaries.length === 0} />
          </div>

          {/* Stats */}
          {!annLoading && filteredAnniversaries.length > 0 && (
            <div className="mb-4 flex items-center gap-2 text-sm text-[#6B7280] dark:text-slate-400">
              <span className="font-medium text-[#000080] dark:text-indigo-400">{filteredAnniversaries.length}</span>
              {filteredAnniversaries.length === 1 ? " anniversary" : " anniversaries"} in this period
            </div>
          )}

          {annError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
              {annError} — <button className="font-medium underline" onClick={() => fetchAnniversaries(aFrom, aTo)}>Retry</button>
            </div>
          )}

          {annLoading ? (
            <div className="flex h-48 items-center justify-center gap-2 text-gray-400 dark:text-slate-500">
              <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading…
            </div>
          ) : filteredAnniversaries.length === 0 ? (
            <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center text-sm text-gray-400 dark:text-slate-500">
              No anniversaries found for this period.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedAnniversaries.map((u) => (
                  <AnniversaryCard key={u.id} u={u} />
                ))}
              </div>
              <div className="mt-6">
                <Pagination
                  currentPage={safeAnnPage}
                  totalPages={annTotalPages}
                  totalItems={filteredAnniversaries.length}
                  onPageChange={setAnnPage}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* ── Thanksgiving ──────────────────────────────────────────────────────── */}
      {activeTab === "thanksgiving" && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="w-full sm:w-72">
              <SearchBar value={search} onChange={setSearch} onSearch={() => {}} placeholder="Search thanksgiving…" />
            </div>
          </div>

          <div className="mb-4">
            <StatusFilterTabs
              options={[
                { value: "All", label: "All" },
                { value: "PENDING", label: "Pending" },
                { value: "TREATED", label: "Treated" },
              ]}
              active={tgStatus}
              onChange={(v) => setTgStatus(v as ThanksgivingStatus)}
            />
          </div>

          {celebError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
              {celebError} — <button className="font-medium underline" onClick={() => fetchCelebrations(celebPage)}>Retry</button>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F3F4F6] dark:bg-slate-700/30">
                  <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Name</th>
                  <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Type</th>
                  <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Submitted</th>
                  <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Date</th>
                  <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Status</th>
                  <th className="px-4 py-4" />
                </tr>
              </thead>
              <tbody>
                {celebLoading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">Loading…</td></tr>
                ) : filteredCelebrations.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">No thanksgiving entries found.</td></tr>
                ) : (
                  filteredCelebrations.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[#F3F4F6] hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:bg-slate-700/50 cursor-pointer"
                      style={{ height: "56px" }}
                      onClick={() => router.push(`/celebrations/${row.id}`)}
                    >
                      <td className="px-4 py-3 text-sm text-[#374151] dark:text-slate-300">{fullName(row.requester)}</td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">
                        {(row.celebrationType ?? "—").replace(/_/g, " ")}
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">{fmtDate(row.createdOn)}</td>
                      <td className="px-4 py-3 text-sm text-[#374151] dark:text-slate-300">{fmtDate(row.date)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          row.celebrationStatus === "TREATED"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {(row.celebrationStatus ?? "PENDING").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <ActionDropdown
                          actions={[
                            { label: "View", onClick: () => router.push(`/celebrations/${row.id}`) },
                            ...(row.celebrationStatus !== "TREATED"
                              ? [{ label: "Mark as Treated", onClick: () => handleMarkTreated(row.id) }]
                              : []),
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={celebPage}
              totalPages={celebTotalPages}
              totalItems={celebTotalItems}
              onPageChange={setCelebPage}
            />
          </div>
        </>
      )}

    </DashboardLayout>
  );
}
