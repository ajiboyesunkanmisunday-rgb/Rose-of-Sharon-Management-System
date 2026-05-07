"use client";

import { useState, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  getBirthdays,
  getWeddingAnniversaries,
  getMembers,
  getEMembers,
  getFirstTimers,
  getSecondTimers,
  getNewConverts,
  getAllGroups,
  type UserResponse,
  type NewConvertResponse,
  type GroupResponse,
} from "@/lib/api";
import {
  ChevronRight, ChevronLeft, Download, FileText, FileSpreadsheet,
  Printer, RefreshCw, Users, UserCheck, UserPlus, HeartHandshake,
  Cake, Heart, Church, Building2, CalendarDays, BarChart2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type ReportTab = "membership" | "celebrations" | "attendance";
type ReportId  =
  | "members" | "e-members" | "first-timers" | "second-timers" | "new-converts"
  | "birthdays" | "weddings" | "church-anniversary" | "departmental"
  | "event-attendance";

interface ReportDef   {
  id: ReportId;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}
interface CategoryDef { title: string; description: string; icon: React.ReactNode; reports: ReportDef[]; }

/** Normalised row used by every membership report table */
interface ReportRow {
  id:          string;
  fullName:    string;
  email:       string;
  phone:       string;
  gender:      string;
  dobDisplay:  string;     // date of birth or celebration date
  joinedDate:  string;     // createdOn formatted
  group:       string;
  userType:    string;
  extra:       string;     // type-specific extra field
  // Raw birthday values for filtering (not shown in table)
  bdayDay?:   number;
  bdayMonth?: number;
}

// ─── Catalogue ───────────────────────────────────────────────────────────────
const CATALOGUE: Record<ReportTab, CategoryDef[]> = {
  membership: [{
    title: "Membership",
    description: "Generate membership reports and track the growth of your church members.",
    icon: <Users className="h-5 w-5" />,
    reports: [
      {
        id: "members", title: "Members Report",
        description: "Full list of all registered members in the ministry.",
        icon: <Users className="h-5 w-5" />, iconBg: "bg-[#EEF2FF]", iconColor: "text-[#000080]",
      },
      {
        id: "e-members", title: "E-Members Report",
        description: "Full list of all registered e-members in the ministry.",
        icon: <UserCheck className="h-5 w-5" />, iconBg: "bg-[#F0FDF4]", iconColor: "text-[#16A34A]",
      },
      {
        id: "first-timers", title: "First Timers Report",
        description: "All first-time visitors and their service attendance details.",
        icon: <UserPlus className="h-5 w-5" />, iconBg: "bg-[#FFF7ED]", iconColor: "text-[#EA580C]",
      },
      {
        id: "second-timers", title: "Second Timers Report",
        description: "All second-time visitors and follow-up information.",
        icon: <UserPlus className="h-5 w-5" />, iconBg: "bg-[#FDF4FF]", iconColor: "text-[#9333EA]",
      },
      {
        id: "new-converts", title: "New Converts Report",
        description: "All new converts, including believer class progression.",
        icon: <HeartHandshake className="h-5 w-5" />, iconBg: "bg-[#FFF1F2]", iconColor: "text-[#E11D48]",
      },
    ],
  }],
  celebrations: [{
    title: "Celebrations",
    description: "Identify and minister to members celebrating birthdays, anniversaries, and milestones.",
    icon: <Cake className="h-5 w-5" />,
    reports: [
      {
        id: "birthdays", title: "Birthday Report",
        description: "Members celebrating birthdays within the selected period.",
        icon: <Cake className="h-5 w-5" />, iconBg: "bg-[#FCE7F3]", iconColor: "text-[#DB2777]",
      },
      {
        id: "weddings", title: "Wedding Anniversary Report",
        description: "Members celebrating wedding anniversaries within the selected period.",
        icon: <Heart className="h-5 w-5" />, iconBg: "bg-[#FEF3C7]", iconColor: "text-[#D97706]",
      },
      {
        id: "church-anniversary", title: "Church Anniversary Report",
        description: "Annual celebration report — Rose of Sharon, est. June 1996.",
        icon: <Church className="h-5 w-5" />, iconBg: "bg-[#EEF2FF]", iconColor: "text-[#000080]",
      },
      {
        id: "departmental", title: "Departmental Anniversary",
        description: "Departments and their founding anniversaries.",
        icon: <Building2 className="h-5 w-5" />, iconBg: "bg-[#F0FDF4]", iconColor: "text-[#16A34A]",
      },
    ],
  }],
  attendance: [{
    title: "Attendance",
    description: "Track and review attendance records across all services and events.",
    icon: <CalendarDays className="h-5 w-5" />,
    reports: [
      {
        id: "event-attendance", title: "Event Attendance Report",
        description: "Attendance records for services and events within a date range.",
        icon: <CalendarDays className="h-5 w-5" />, iconBg: "bg-[#F0FDF4]", iconColor: "text-[#0891B2]",
      },
    ],
  }],
};

const MEMBERSHIP_REPORT_IDS: ReportId[] = ["members","e-members","first-timers","second-timers","new-converts"];

// ─── Static data ─────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  { name: "Pastoral Team",         founded: new Date(1997, 0, 1)  },
  { name: "Deacons & Deaconesses", founded: new Date(1997, 2, 15) },
  { name: "Music & Choir",         founded: new Date(1997, 5, 1)  },
  { name: "Youth Fellowship",      founded: new Date(1998, 8, 1)  },
  { name: "Children's Ministry",   founded: new Date(1998, 8, 1)  },
  { name: "Ushering Department",   founded: new Date(1998, 0, 1)  },
  { name: "Women's Fellowship",    founded: new Date(1998, 2, 8)  },
  { name: "Men's Fellowship",      founded: new Date(1998, 2, 19) },
  { name: "Media & Technical",     founded: new Date(2010, 0, 1)  },
  { name: "Welfare Committee",     founded: new Date(2000, 0, 1)  },
];

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const GENDERS = ["All","Male","Female"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtDOB(day?: number, month?: number, year?: number) {
  if (!day || !month) return "—";
  return `${MONTH_NAMES[(month-1)]} ${day}${year ? `, ${year}` : ""}`;
}
function fmtPhone(code?: string, num?: string) {
  if (!num) return "—";
  return `+${code ?? ""} ${num}`.trim();
}
function daysInMonth(month: number) { return new Date(2024, month, 0).getDate(); }

// ─── Normalisers ─────────────────────────────────────────────────────────────
function userToRow(u: UserResponse, type: string): ReportRow {
  return {
    id:         u.id,
    fullName:   [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—",
    email:      u.email ?? "—",
    phone:      fmtPhone(u.countryCode, u.phoneNumber),
    gender:     u.sex ?? "—",
    dobDisplay: fmtDOB(u.dayOfBirth, u.monthOfBirth, u.yearOfBirth),
    joinedDate: fmtDate(u.createdOn),
    group:      u.groups?.map((g) => g.name).join(", ") || "—",
    userType:   type,
    extra:      u.maritalStatus ?? "",
    bdayDay:    u.dayOfBirth,
    bdayMonth:  u.monthOfBirth,
  };
}

function convertToRow(u: NewConvertResponse): ReportRow {
  return {
    id:         u.id,
    fullName:   [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—",
    email:      u.email ?? "—",
    phone:      fmtPhone(u.countryCode, u.phoneNumber),
    gender:     u.sex ?? "—",
    dobDisplay: "—",
    joinedDate: fmtDate(u.createdOn),
    group:      "—",
    userType:   "New Convert",
    extra:      u.believerClassStage ?? "",
  };
}

function celebToRow(u: UserResponse): ReportRow {
  return {
    ...userToRow(u, u.userType ?? "Member"),
    dobDisplay: fmtDOB(u.dayOfBirth, u.monthOfBirth, u.yearOfBirth),
  };
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────
/** Fetches up to `maxPages` pages and concatenates content */
async function fetchAllPages<T>(
  fetcher: (page: number, size: number) => Promise<{ content?: T[]; totalPages?: number }>,
  pageSize = 200,
  maxPages = 10,
): Promise<T[]> {
  const first = await fetcher(0, pageSize);
  const rows  = [...(first.content ?? [])];
  const total = first.totalPages ?? 1;
  const pages = Math.min(total, maxPages);
  if (pages > 1) {
    const rest = await Promise.all(
      Array.from({ length: pages - 1 }, (_, i) => fetcher(i + 1, pageSize))
    );
    rest.forEach((r) => rows.push(...(r.content ?? [])));
  }
  return rows;
}

// ─── Export ──────────────────────────────────────────────────────────────────
function dlBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

function buildCSV(rows: ReportRow[], cols: (keyof ReportRow)[], headers: string[]) {
  const head = headers.join(",");
  const body = rows.map((r) => cols.map((c) => `"${String(r[c]).replace(/"/g,'""')}"`).join(",")).join("\n");
  return head + "\n" + body;
}

function exportCSV(rows: ReportRow[], title: string, cols: (keyof ReportRow)[], headers: string[]) {
  dlBlob(buildCSV(rows, cols, headers), `${title}.csv`, "text/csv");
}

function exportExcel(rows: ReportRow[], title: string, cols: (keyof ReportRow)[], headers: string[]) {
  const th = (s: string) => `<th style="background:#000080;color:#fff;padding:6px 10px;text-align:left">${s}</th>`;
  const td = (s: string) => `<td style="padding:5px 10px;border:1px solid #ddd">${s}</td>`;
  const html = `<html><head><meta charset="UTF-8"/></head><body>
    <h2 style="color:#000080">${title}</h2>
    <p style="color:#6B7280;font-size:12px">Generated: ${new Date().toLocaleString("en-GB")} &nbsp;|&nbsp; Total: ${rows.length}</p>
    <table style="border-collapse:collapse;font-family:Arial;font-size:13px">
      <thead><tr>${headers.map(th).join("")}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${cols.map((c) => td(String(r[c]))).join("")}</tr>`).join("")}</tbody>
    </table></body></html>`;
  dlBlob("﻿" + html, `${title}.xls`, "application/vnd.ms-excel;charset=UTF-8");
}

function exportTXT(rows: ReportRow[], title: string) {
  const sep = "─".repeat(80);
  const lines = [
    `REPORT: ${title}`,
    `Generated: ${new Date().toLocaleString("en-GB")}`,
    `Total Records: ${rows.length}`,
    sep,
    ...rows.map((r, i) =>
      `${String(i+1).padStart(4," ")}. ${r.fullName.padEnd(30)} ${r.phone.padEnd(18)} ${r.email}`
    ),
    sep,
  ];
  dlBlob(lines.join("\n"), `${title}.txt`, "text/plain");
}

function exportPDF(title: string) {
  const el = document.getElementById("report-print-area");
  if (!el) return;
  const w = window.open("","_blank");
  if (!w) return;
  w.document.write(`<html><head><title>${title}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:24px;color:#111}
      h2{color:#000080;margin-bottom:4px}
      p.meta{color:#6B7280;font-size:12px;margin-bottom:16px}
      table{border-collapse:collapse;width:100%;font-size:12px}
      th{background:#000080;color:#fff;padding:8px 10px;text-align:left}
      td{padding:6px 10px;border:1px solid #ddd}
      tr:nth-child(even) td{background:#F9FAFB}
      @media print{button{display:none}}
    </style></head><body>
    <h2>${title}</h2>
    <p class="meta">Generated: ${new Date().toLocaleString("en-GB")}</p>`);
  w.document.write(el.innerHTML);
  w.document.write("</body></html>");
  w.document.close();
  w.focus();
  w.print();
  w.close();
}

// ─── Column definitions per report ───────────────────────────────────────────
type ColDef = { key: keyof ReportRow; label: string };

const MEMBER_COLS: ColDef[] = [
  { key: "fullName",   label: "Full Name"   },
  { key: "email",      label: "Email"       },
  { key: "phone",      label: "Phone"       },
  { key: "gender",     label: "Gender"      },
  { key: "group",      label: "Group"       },
  { key: "joinedDate", label: "Date Joined" },
];
const VISITOR_COLS: ColDef[] = [
  { key: "fullName",   label: "Full Name"  },
  { key: "email",      label: "Email"      },
  { key: "phone",      label: "Phone"      },
  { key: "gender",     label: "Gender"     },
  { key: "joinedDate", label: "Date"       },
];
const CONVERT_COLS: ColDef[] = [
  { key: "fullName",   label: "Full Name"       },
  { key: "email",      label: "Email"           },
  { key: "phone",      label: "Phone"           },
  { key: "gender",     label: "Gender"          },
  { key: "extra",      label: "Believer Class"  },
  { key: "joinedDate", label: "Date"            },
];
const CELEB_COLS: ColDef[] = [
  { key: "fullName",   label: "Full Name"  },
  { key: "email",      label: "Email"      },
  { key: "phone",      label: "Phone"      },
  { key: "gender",     label: "Gender"     },
  { key: "dobDisplay", label: "Date"       },
  { key: "group",      label: "Group"      },
];

function colsForReport(id: ReportId): ColDef[] {
  if (id === "members" || id === "e-members") return MEMBER_COLS;
  if (id === "new-converts")                  return CONVERT_COLS;
  if (id === "birthdays" || id === "weddings") return CELEB_COLS;
  return VISITOR_COLS;
}

// ─── Date Range helpers ───────────────────────────────────────────────────────
interface DateRange { startDay: number; startMonth: number; endDay: number; endMonth: number; }
function thisWeekRange(): DateRange {
  const today = new Date(); const day = today.getDay();
  const mon = new Date(today); mon.setDate(today.getDate() - ((day + 6) % 7));
  const sun = new Date(mon);   sun.setDate(mon.getDate() + 6);
  return { startDay: mon.getDate(), startMonth: mon.getMonth()+1, endDay: sun.getDate(), endMonth: sun.getMonth()+1 };
}
function nextWeekRange(): DateRange {
  const mon = new Date(); mon.setDate(mon.getDate() - ((mon.getDay()+6)%7) + 7);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return { startDay: mon.getDate(), startMonth: mon.getMonth()+1, endDay: sun.getDate(), endMonth: sun.getMonth()+1 };
}
function thisMonthRange(): DateRange {
  const m = new Date().getMonth()+1;
  return { startDay: 1, startMonth: m, endDay: daysInMonth(m), endMonth: m };
}
function nextMonthRange(): DateRange {
  const nm = (new Date().getMonth()+2 > 12) ? 1 : new Date().getMonth()+2;
  return { startDay: 1, startMonth: nm, endDay: daysInMonth(nm), endMonth: nm };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ExportBar({ rows, title, cols, onPDF }: {
  rows: ReportRow[]; title: string; cols: ColDef[]; onPDF: () => void;
}) {
  const keys    = cols.map((c) => c.key);
  const headers = cols.map((c) => c.label);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <p className="text-sm font-medium text-[#374151]">
        <span className="font-bold text-[#000080]">{rows.length}</span> record{rows.length !== 1 ? "s" : ""} found
      </p>
      <div className="flex flex-wrap gap-2">
        {[
          { label: "CSV",       icon: <Download className="h-3.5 w-3.5" />,        fn: () => exportCSV(rows, title, keys, headers)   },
          { label: "Excel",     icon: <FileSpreadsheet className="h-3.5 w-3.5" />, fn: () => exportExcel(rows, title, keys, headers) },
          { label: "TXT",       icon: <FileText className="h-3.5 w-3.5" />,        fn: () => exportTXT(rows, title)                  },
          { label: "PDF/Print", icon: <Printer className="h-3.5 w-3.5" />,         fn: onPDF                                         },
        ].map((btn) => (
          <button key={btn.label} onClick={btn.fn}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition
              ${btn.label === "PDF/Print"
                ? "border-[#000080] bg-[#000080] text-white hover:bg-[#000066]"
                : "border-[#E5E7EB] bg-white text-[#374151] hover:border-[#000080] hover:text-[#000080]"}`}>
            {btn.icon} {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReportTable({ rows, cols, title }: { rows: ReportRow[]; cols: ColDef[]; title: string }) {
  return (
    <div id="report-print-area" className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">#</th>
            {cols.map((c) => (
              <th key={c.key} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB]">
              <td className="px-4 py-3 text-[#9CA3AF]">{i+1}</td>
              {cols.map((c) => (
                <td key={c.key} className="px-4 py-3 text-[#374151]">
                  {c.key === "fullName"
                    ? <span className="font-medium text-[#111827]">{row[c.key]}</span>
                    : c.key === "userType"
                      ? <span className="rounded-full bg-[#EEF2FF] px-2.5 py-0.5 text-xs font-medium text-[#000080]">{String(row[c.key])}</span>
                      : String(row[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="py-12 text-center text-sm text-[#9CA3AF]">No records found for the selected filters.</p>
      )}
    </div>
  );
}

// ─── Styled input primitives ─────────────────────────────────────────────────
const inputCls = "w-full rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] shadow-sm outline-none transition focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10";
const selectCls = "w-full rounded-lg border border-[#D1D5DB] bg-white px-3.5 py-2.5 text-sm text-[#111827] shadow-sm outline-none transition focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 cursor-pointer";

function FilterSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[#000080]">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-widest text-[#374151]">{title}</span>
      </div>
      {children}
    </div>
  );
}

function MembershipFilters({
  search, onSearch,
  gender, onGender,
  group, onGroup, groups,
  bdayFrom, onBdayFrom,
  bdayTo, onBdayTo,
  joinedYear, onJoinedYear,
}: {
  search: string; onSearch: (v: string) => void;
  gender: string; onGender: (v: string) => void;
  group:  string; onGroup:  (v: string) => void; groups: GroupResponse[];
  bdayFrom:   { day: number; month: number } | null;
  onBdayFrom: (v: { day: number; month: number } | null) => void;
  bdayTo:     { day: number; month: number } | null;
  onBdayTo:   (v: { day: number; month: number } | null) => void;
  joinedYear: string; onJoinedYear: (v: string) => void;
}) {
  const [bdayOpen, setBdayOpen] = useState(false);
  const hasFilters = search || gender !== "All" || group || bdayFrom || bdayTo || joinedYear;

  const searchIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
  const calIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
  const personIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
  const groupIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );

  const bdaySummary = bdayFrom
    ? `${MONTH_NAMES[bdayFrom.month-1]} ${bdayFrom.day}${bdayTo ? ` — ${MONTH_NAMES[bdayTo.month-1]} ${bdayTo.day}` : ""}`
    : null;

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-5">
      <div className="space-y-5">

        {/* Row 1: Search */}
        <FilterSection title="Search" icon={searchIcon}>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" value={search} onChange={(e) => onSearch(e.target.value)}
              placeholder="Search by name or email…"
              className={`${inputCls} pl-9`}
            />
            {search && (
              <button onClick={() => onSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
        </FilterSection>

        {/* Row 2: Gender + Group */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FilterSection title="Gender" icon={personIcon}>
            <div className="flex gap-2">
              {GENDERS.map((g) => (
                <button key={g} onClick={() => onGender(g)}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition ${
                    gender === g
                      ? "border-[#000080] bg-[#000080] text-white"
                      : "border-[#D1D5DB] bg-white text-[#374151] hover:border-[#000080] hover:text-[#000080]"
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Group / Department" icon={groupIcon}>
            <select value={group} onChange={(e) => onGroup(e.target.value)} className={selectCls}>
              <option value="">All Groups</option>
              {groups.map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
            </select>
          </FilterSection>
        </div>

        {/* Row 3: Birthday range + Date Joined */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Birthday range */}
          <FilterSection title="Birthday Range" icon={calIcon}>
            <button
              onClick={() => setBdayOpen((o) => !o)}
              className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm shadow-sm transition ${
                bdaySummary
                  ? "border-[#000080] bg-[#EEF2FF] text-[#000080] font-medium"
                  : "border-[#D1D5DB] bg-white text-[#9CA3AF] hover:border-[#000080]"
              }`}>
              <span>{bdaySummary ?? "Select birthday range…"}</span>
              <svg className={`h-4 w-4 transition-transform ${bdayOpen ? "rotate-180" : ""}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>

            {bdayOpen && (
              <div className="mt-2 rounded-xl border border-[#000080]/20 bg-white p-4 shadow-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">From</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="mb-1 block text-[10px] text-[#9CA3AF]">Day</label>
                        <input type="number" min={1} max={31}
                          value={bdayFrom?.day ?? ""}
                          onChange={(e) => onBdayFrom({ day: Number(e.target.value), month: bdayFrom?.month ?? 1 })}
                          placeholder="1" className={inputCls} />
                      </div>
                      <div className="flex-[2]">
                        <label className="mb-1 block text-[10px] text-[#9CA3AF]">Month</label>
                        <select value={bdayFrom?.month ?? ""}
                          onChange={(e) => onBdayFrom({ day: bdayFrom?.day ?? 1, month: Number(e.target.value) })}
                          className={selectCls}>
                          <option value="">Month</option>
                          {MONTH_NAMES.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">To</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="mb-1 block text-[10px] text-[#9CA3AF]">Day</label>
                        <input type="number" min={1} max={31}
                          value={bdayTo?.day ?? ""}
                          onChange={(e) => onBdayTo({ day: Number(e.target.value), month: bdayTo?.month ?? 12 })}
                          placeholder="31" className={inputCls} />
                      </div>
                      <div className="flex-[2]">
                        <label className="mb-1 block text-[10px] text-[#9CA3AF]">Month</label>
                        <select value={bdayTo?.month ?? ""}
                          onChange={(e) => onBdayTo({ day: bdayTo?.day ?? 31, month: Number(e.target.value) })}
                          className={selectCls}>
                          <option value="">Month</option>
                          {MONTH_NAMES.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-between">
                  <button onClick={() => { onBdayFrom(null); onBdayTo(null); setBdayOpen(false); }}
                    className="text-xs text-red-500 underline hover:text-red-700">
                    Clear
                  </button>
                  <button onClick={() => setBdayOpen(false)}
                    className="rounded-lg bg-[#000080] px-3 py-1 text-xs font-semibold text-white hover:bg-[#000066]">
                    Apply
                  </button>
                </div>
              </div>
            )}
          </FilterSection>

          {/* Date Joined year */}
          <FilterSection title="Year Joined" icon={calIcon}>
            <input type="number" min={1990} max={new Date().getFullYear()}
              value={joinedYear} onChange={(e) => onJoinedYear(e.target.value)}
              placeholder={`e.g. ${new Date().getFullYear()}`}
              className={inputCls} />
            <p className="mt-1 text-[11px] text-[#9CA3AF]">Filter by the year the person joined</p>
          </FilterSection>
        </div>

        {hasFilters && (
          <div className="flex justify-end border-t border-[#E5E7EB] pt-3">
            <button
              onClick={() => { onSearch(""); onGender("All"); onGroup(""); onBdayFrom(null); onBdayTo(null); onJoinedYear(""); setBdayOpen(false); }}
              className="flex items-center gap-1.5 text-xs font-medium text-[#000080] underline underline-offset-2 hover:text-[#000066]">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CelebrationFilters({
  dateRange, onDateRange, gender, onGender,
}: {
  dateRange: DateRange; onDateRange: (r: DateRange) => void;
  gender: string; onGender: (v: string) => void;
}) {
  const quick = [
    { label: "This Week",  fn: thisWeekRange  },
    { label: "Next Week",  fn: nextWeekRange  },
    { label: "This Month", fn: thisMonthRange },
    { label: "Next Month", fn: nextMonthRange },
  ];

  const calIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
  const personIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-5 space-y-6">
      {/* Quick select */}
      <FilterSection title="Quick Select" icon={calIcon}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {quick.map((q) => (
            <button key={q.label} onClick={() => onDateRange(q.fn())}
              className="rounded-lg border border-[#D1D5DB] bg-white px-3 py-2.5 text-center text-sm font-medium text-[#374151] shadow-sm transition hover:border-[#000080] hover:bg-[#F0F2FF] hover:text-[#000080] hover:shadow">
              {q.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Date range */}
      <FilterSection title="Custom Date Range" icon={calIcon}>
        <div className="rounded-xl border border-[#000080]/20 bg-white p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* From */}
            <div>
              <p className="mb-2 text-xs font-semibold text-[#6B7280]">FROM</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">Day</label>
                  <input type="number" min={1} max={31}
                    value={dateRange.startDay}
                    onChange={(e) => onDateRange({ ...dateRange, startDay: Number(e.target.value) })}
                    className={inputCls} />
                </div>
                <div className="flex-[2]">
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">Month</label>
                  <select value={dateRange.startMonth}
                    onChange={(e) => onDateRange({ ...dateRange, startMonth: Number(e.target.value) })}
                    className={selectCls}>
                    {MONTH_NAMES.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>
            {/* To */}
            <div>
              <p className="mb-2 text-xs font-semibold text-[#6B7280]">TO</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">Day</label>
                  <input type="number" min={1} max={31}
                    value={dateRange.endDay}
                    onChange={(e) => onDateRange({ ...dateRange, endDay: Number(e.target.value) })}
                    className={inputCls} />
                </div>
                <div className="flex-[2]">
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">Month</label>
                  <select value={dateRange.endMonth}
                    onChange={(e) => onDateRange({ ...dateRange, endMonth: Number(e.target.value) })}
                    className={selectCls}>
                    {MONTH_NAMES.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
          {/* Summary badge */}
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-[#000080]">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {MONTH_NAMES[dateRange.startMonth-1]} {dateRange.startDay} — {MONTH_NAMES[dateRange.endMonth-1]} {dateRange.endDay}
            </span>
          </div>
        </div>
      </FilterSection>

      {/* Gender */}
      <FilterSection title="Gender" icon={personIcon}>
        <div className="flex gap-2">
          {GENDERS.map((g) => (
            <button key={g} onClick={() => onGender(g)}
              className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition ${
                gender === g
                  ? "border-[#000080] bg-[#000080] text-white shadow-sm"
                  : "border-[#D1D5DB] bg-white text-[#374151] hover:border-[#000080] hover:text-[#000080]"
              }`}>
              {g}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const today = new Date();

  // Navigation
  const [activeTab,      setActiveTab]      = useState<ReportTab>("membership");
  const [selectedReport, setSelectedReport] = useState<ReportId | null>(null);

  // Fetch state
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [rawRows,      setRawRows]      = useState<ReportRow[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [totalFetched, setTotalFetched] = useState(0);

  // Available groups (loaded on first membership report open)
  const [allGroups, setAllGroups] = useState<GroupResponse[]>([]);

  // Membership filters
  const [memSearch,      setMemSearch]      = useState("");
  const [memGender,      setMemGender]      = useState("All");
  const [memGroup,       setMemGroup]       = useState("");
  const [memBdayFrom,    setMemBdayFrom]    = useState<{ day: number; month: number } | null>(null);
  const [memBdayTo,      setMemBdayTo]      = useState<{ day: number; month: number } | null>(null);
  const [memJoinedYear,  setMemJoinedYear]  = useState("");

  // Celebration filters
  const [dateRange, setDateRange] = useState<DateRange>(thisMonthRange());
  const [celebGender, setCelebGender] = useState("All");

  // Departmental filter
  const [selectedDept, setSelectedDept] = useState("all");

  const currentDef = CATALOGUE[activeTab].flatMap((c) => c.reports).find((r) => r.id === selectedReport);
  const cols        = selectedReport ? colsForReport(selectedReport) : MEMBER_COLS;

  const isMembership  = selectedReport !== null && MEMBERSHIP_REPORT_IDS.includes(selectedReport);
  const isCelebration = selectedReport === "birthdays" || selectedReport === "weddings";
  const isChurch      = selectedReport === "church-anniversary";
  const isDeptl       = selectedReport === "departmental";
  const isAttendance  = selectedReport === "event-attendance";

  // ── Client-side filtering ──
  const filteredRows = useMemo(() => {
    let rows = rawRows;
    if (isMembership) {
      if (memSearch.trim()) {
        const q = memSearch.toLowerCase();
        rows = rows.filter((r) =>
          r.fullName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
        );
      }
      if (memGender !== "All") {
        rows = rows.filter((r) => r.gender.toLowerCase() === memGender.toLowerCase());
      }
      if (memGroup) {
        rows = rows.filter((r) => r.group.includes(memGroup));
      }
      // Birthday range filter
      if (memBdayFrom || memBdayTo) {
        rows = rows.filter((r) => {
          if (!r.bdayDay || !r.bdayMonth) return false;
          const bVal = r.bdayMonth * 100 + r.bdayDay;
          const fVal = memBdayFrom ? memBdayFrom.month * 100 + memBdayFrom.day : 0;
          const tVal = memBdayTo   ? memBdayTo.month   * 100 + memBdayTo.day   : 9999;
          return bVal >= fVal && bVal <= tVal;
        });
      }
      // Date joined year filter
      if (memJoinedYear.trim()) {
        rows = rows.filter((r) => r.joinedDate.includes(memJoinedYear.trim()));
      }
    }
    if (isCelebration && celebGender !== "All") {
      rows = rows.filter((r) => r.gender.toLowerCase() === celebGender.toLowerCase());
    }
    return rows;
  }, [rawRows, isMembership, isCelebration, memSearch, memGender, memGroup,
      memBdayFrom, memBdayTo, memJoinedYear, celebGender]);

  // ── Fetch groups once ──
  const ensureGroups = useCallback(async () => {
    if (allGroups.length > 0) return;
    try {
      const gs = await getAllGroups();
      setAllGroups(Array.isArray(gs) ? gs : []);
    } catch { /* silent */ }
  }, [allGroups.length]);

  // ── Generate ──
  const generate = useCallback(async () => {
    if (!selectedReport) return;
    setLoading(true); setError(""); setRawRows([]); setHasGenerated(true); setTotalFetched(0);
    try {
      let rows: ReportRow[] = [];

      if (selectedReport === "members") {
        const data = await fetchAllPages((p, s) => getMembers(p, s));
        rows = data.map((u) => userToRow(u, "Member"));
      }
      else if (selectedReport === "e-members") {
        const data = await fetchAllPages((p, s) => getEMembers(p, s));
        rows = data.map((u) => userToRow(u, "E-Member"));
      }
      else if (selectedReport === "first-timers") {
        const data = await fetchAllPages((p, s) => getFirstTimers(p, s));
        rows = data.map((u) => userToRow(u, "First Timer"));
      }
      else if (selectedReport === "second-timers") {
        const data = await fetchAllPages((p, s) => getSecondTimers(p, s));
        rows = data.map((u) => userToRow(u, "Second Timer"));
      }
      else if (selectedReport === "new-converts") {
        const data = await fetchAllPages((p, s) => getNewConverts(p, s));
        rows = (data as NewConvertResponse[]).map(convertToRow);
      }
      else if (selectedReport === "birthdays") {
        const r = await getBirthdays(dateRange.startDay, dateRange.startMonth, dateRange.endDay, dateRange.endMonth, 0, 500);
        rows = (r.content ?? []).map(celebToRow);
      }
      else if (selectedReport === "weddings") {
        const r = await getWeddingAnniversaries(dateRange.startDay, dateRange.startMonth, dateRange.endDay, dateRange.endMonth, 0, 500);
        rows = (r.content ?? []).map(celebToRow);
      }

      setRawRows(rows);
      setTotalFetched(rows.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedReport, dateRange]);

  const openReport = (id: ReportId) => {
    setSelectedReport(id);
    setRawRows([]); setHasGenerated(false); setError("");
    setMemSearch(""); setMemGender("All"); setMemGroup("");
    setMemBdayFrom(null); setMemBdayTo(null); setMemJoinedYear("");
    setDateRange(thisMonthRange()); setCelebGender("All");
    if (MEMBERSHIP_REPORT_IDS.includes(id)) ensureGroups();
  };

  const back = () => {
    setSelectedReport(null); setRawRows([]); setHasGenerated(false); setError("");
  };

  // ── Church anniversary data ──
  const churchFounded = new Date(1996, 5, 15);
  const yearsOld      = today.getFullYear() - churchFounded.getFullYear();
  const nextAnniv     = new Date(today.getFullYear(), 5, 15);
  if (nextAnniv < today) nextAnniv.setFullYear(today.getFullYear() + 1);
  const daysToAnniv   = Math.ceil((nextAnniv.getTime() - today.getTime()) / 86400000);

  // ═══════════════════════════════════════════════════════════════════
  // Detail view
  // ═══════════════════════════════════════════════════════════════════
  if (selectedReport) {
    return (
      <DashboardLayout>
        {/* Back nav */}
        <div className="mb-6 flex items-center gap-4">
          <button onClick={back}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] transition hover:bg-[#F3F4F6]">
            <ChevronLeft className="h-5 w-5" />
          </button>
          {currentDef && (
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${currentDef.iconBg}`}>
              <span className={currentDef.iconColor}>{currentDef.icon}</span>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Reports</p>
            <h1 className="text-[22px] font-bold text-[#000000]">{currentDef?.title}</h1>
          </div>
        </div>

        {/* ── Membership reports ── */}
        {isMembership && (
          <div className="space-y-5">
            {/* Filters card */}
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                <h2 className="text-base font-bold text-[#111827]">Filters</h2>
              </div>
              <MembershipFilters
                search={memSearch}     onSearch={setMemSearch}
                gender={memGender}     onGender={setMemGender}
                group={memGroup}       onGroup={setMemGroup}       groups={allGroups}
                bdayFrom={memBdayFrom} onBdayFrom={setMemBdayFrom}
                bdayTo={memBdayTo}     onBdayTo={setMemBdayTo}
                joinedYear={memJoinedYear} onJoinedYear={setMemJoinedYear}
              />
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <button onClick={generate} disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-[#000080] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#000066] disabled:opacity-60">
                  {loading ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" /> Generating…</>
                  ) : (
                    "Generate Report"
                  )}
                </button>
                {hasGenerated && !loading && (
                  <span className="text-xs text-[#6B7280]">
                    {totalFetched} total record{totalFetched !== 1 ? "s" : ""} fetched
                    {filteredRows.length !== totalFetched && ` · ${filteredRows.length} shown after filters`}
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {hasGenerated && !loading && !error && (
              <div>
                <ExportBar
                  rows={filteredRows}
                  title={currentDef?.title ?? ""}
                  cols={cols}
                  onPDF={() => exportPDF(currentDef?.title ?? "")}
                />
                <ReportTable rows={filteredRows} cols={cols} title={currentDef?.title ?? ""} />
              </div>
            )}
          </div>
        )}

        {/* ── Birthday / Wedding ── */}
        {isCelebration && (
          <div className="space-y-5">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                <h2 className="text-base font-bold text-[#111827]">Report Filters</h2>
              </div>
              <CelebrationFilters
                dateRange={dateRange} onDateRange={setDateRange}
                gender={celebGender}  onGender={setCelebGender}
              />
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button onClick={generate} disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-[#000080] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#000066] disabled:opacity-60">
                  {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Generating…</> : "Generate Report"}
                </button>
                {hasGenerated && !loading && (
                  <span className="text-xs text-[#6B7280]">
                    {filteredRows.length} record{filteredRows.length !== 1 ? "s" : ""} found
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            {hasGenerated && !loading && !error && (
              <div>
                <ExportBar
                  rows={filteredRows}
                  title={currentDef?.title ?? ""}
                  cols={cols}
                  onPDF={() => exportPDF(currentDef?.title ?? "")}
                />
                <ReportTable rows={filteredRows} cols={cols} title={currentDef?.title ?? ""} />
              </div>
            )}
          </div>
        )}

        {/* ── Church Anniversary ── */}
        {isChurch && (
          <div className="space-y-5">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold text-[#000080]">
                    Rose of Sharon — {yearsOld}th Anniversary
                  </h2>
                  <p className="mt-1 text-sm text-[#6B7280]">Founded: June 15, 1996</p>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    Next anniversary: June 15, {nextAnniv.getFullYear()} —{" "}
                    <span className="font-semibold text-[#000080]">{daysToAnniv} days away</span>
                  </p>
                </div>
                <div className="rounded-xl bg-[#000080] px-10 py-6 text-center text-white shadow-md">
                  <p className="text-5xl font-bold">{yearsOld}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider opacity-80">Years of Ministry</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="mb-1 text-sm font-semibold text-[#374151]">June Birthday Report</h2>
              <p className="mb-4 text-xs text-[#6B7280]">
                Generate a list of all members celebrating birthdays during the church anniversary month (June).
              </p>
              <button
                onClick={() => { openReport("birthdays"); setDateRange({ startDay: 1, startMonth: 6, endDay: 30, endMonth: 6 }); }}
                className="rounded-lg bg-[#000080] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#000066]">
                View June Birthday Report →
              </button>
            </div>
          </div>
        )}

        {/* ── Departmental ── */}
        {isDeptl && (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-[#374151]">Department Anniversaries</h2>
            <div className="mb-5 flex flex-wrap gap-2">
              <button onClick={() => setSelectedDept("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition
                  ${selectedDept === "all" ? "bg-[#000080] text-white" : "border border-[#E5E7EB] text-[#374151] hover:border-[#000080]"}`}>
                All
              </button>
              {DEPARTMENTS.map((d) => (
                <button key={d.name} onClick={() => setSelectedDept(d.name)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition
                    ${selectedDept === d.name ? "bg-[#000080] text-white" : "border border-[#E5E7EB] text-[#374151] hover:border-[#000080]"}`}>
                  {d.name}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    {["Department","Founded","Years Active","Anniversary Month"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEPARTMENTS.filter((d) => selectedDept === "all" || d.name === selectedDept).map((d) => (
                    <tr key={d.name} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB]">
                      <td className="px-4 py-3 font-medium text-[#111827]">{d.name}</td>
                      <td className="px-4 py-3 text-[#374151]">
                        {d.founded.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-[#EEF2FF] px-2.5 py-0.5 text-xs font-medium text-[#000080]">
                          {today.getFullYear() - d.founded.getFullYear()} yrs
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#374151]">{MONTH_NAMES[d.founded.getMonth()]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 rounded-lg bg-[#F9FAFB] px-4 py-3 text-xs text-[#6B7280]">
              ℹ️ Individual member joining dates per department will be available once the backend exposes that field in the group membership response.
            </p>
          </div>
        )}

        {/* ── Attendance (Coming Soon) ── */}
        {isAttendance && (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF2FF]">
              <FileText className="h-7 w-7 text-[#000080]" />
            </div>
            <h2 className="text-base font-semibold text-[#111827]">Event Attendance Report</h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              Attendance tracking data will be available once the event attendance API is fully connected.
            </p>
          </div>
        )}
      </DashboardLayout>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // Catalogue list view
  // ═══════════════════════════════════════════════════════════════════
  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4]">
          <BarChart2 className="h-6 w-6 text-[#059669]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000]">Reports</h1>
          <p className="text-sm text-[#6B7280]">Generate and export detailed reports for your church ministry</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="mb-6 flex gap-1 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-1">
        {(["membership","celebrations","attendance"] as ReportTab[]).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium capitalize transition
              ${activeTab === t ? "bg-white text-[#000080] shadow-sm" : "text-[#6B7280] hover:text-[#374151]"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Category blocks */}
      <div className="space-y-6">
        {CATALOGUE[activeTab].map((cat) => (
          <div key={cat.title} className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
            <div className="border-b-2 border-[#000080] bg-[#F0F2FF] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#000080] text-white">
                  {cat.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#000080]">{cat.title}</h2>
                  <p className="text-sm text-[#4B5563]">{cat.description}</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-[#E5E7EB]">
              {cat.reports.map((r) => (
                <button key={r.id} onClick={() => openReport(r.id)}
                  className="group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#F9FAFB]">
                  {/* Icon box */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${r.iconBg}`}>
                    <span className={r.iconColor}>{r.icon}</span>
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111827] group-hover:text-[#000080]">{r.title}</p>
                    <p className="mt-0.5 text-xs text-[#6B7280]">{r.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#9CA3AF] transition group-hover:translate-x-0.5 group-hover:text-[#000080]" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
