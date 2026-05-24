"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import {
  getAnnouncements,
  getSystemSettings,
  updateSystemSettings,
  approveAnnouncements,
  declineAnnouncement,
  type AnnouncementResponse,
  type SystemSettings,
} from "@/lib/api";
import { Download, X, ChevronLeft, ChevronRight, Check } from "lucide-react";

type Tab = "RECEIVED" | "APPROVED" | "DECLINED";

function fmtDateOnly(s?: string): string {
  if (!s) return "—";
  const parts = s.split("T")[0].split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts;
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return s;
}

function fmtDate(s?: string): string {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("en-GB", {
      day: "2-digit",
      weekday: "long",
      month: "long",
      year: "numeric",
    });
  } catch {
    return s;
  }
}

function submitterName(a: AnnouncementResponse) {
  const by = a.submittedBy;
  if (!by) return "Unknown";
  return `${by.firstName || ""} ${by.lastName || ""}`.trim() || by.email || "Unknown";
}

// ─── Download selected as PDF ─────────────────────────────────────────────────
async function downloadAsPdf(
  selected: AnnouncementResponse[],
  tabLabel: string,
) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = 210;
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = margin;

  const NAVY = [0, 0, 128] as [number, number, number];
  const GRAY = [107, 114, 128] as [number, number, number];
  const BLACK = [17, 24, 39] as [number, number, number];
  const LINE = [229, 231, 235] as [number, number, number];

  const addPage = () => {
    doc.addPage();
    y = margin;
  };

  const checkY = (needed: number) => {
    if (y + needed > 280) addPage();
  };

  // Title
  doc.setFontSize(18);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.text("Altar Announcements", margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${tabLabel} · ${selected.length} announcement${selected.length !== 1 ? "s" : ""} · Printed ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`,
    margin,
    y,
  );
  y += 5;

  // Header rule
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  selected.forEach((a, idx) => {
    // Estimate height needed
    const subjectLines = doc.splitTextToSize(a.subject || "—", contentW);
    const contentLines = doc.splitTextToSize(a.content || "", contentW - 4);
    const blockH = 6 + subjectLines.length * 5.5 + 5 + contentLines.length * 4.8 + 10;
    checkY(blockH);

    // Index badge
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "normal");
    doc.text(`${idx + 1} of ${selected.length}`, margin, y);
    y += 5;

    // Subject
    doc.setFontSize(12);
    doc.setTextColor(...BLACK);
    doc.setFont("helvetica", "bold");
    const sLines = doc.splitTextToSize(a.subject || "—", contentW);
    doc.text(sLines, margin, y);
    y += sLines.length * 5.5;

    // Meta
    const meta = [
      `Submitted by: ${submitterName(a)}`,
      a.startDate ? `Starts: ${fmtDate(a.startDate)}` : null,
      a.endDate ? `Ends: ${fmtDate(a.endDate)}` : null,
      a.createdOn ? `Submitted: ${fmtDate(a.createdOn)}` : null,
    ]
      .filter(Boolean)
      .join("   ·   ");

    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "normal");
    const metaLines = doc.splitTextToSize(meta, contentW);
    doc.text(metaLines, margin, y);
    y += metaLines.length * 4.5 + 3;

    // Content
    doc.setFontSize(9.5);
    doc.setTextColor(...BLACK);
    const cLines = doc.splitTextToSize(a.content || "", contentW - 4);
    cLines.forEach((line: string) => {
      if (y > 278) addPage();
      doc.text(line, margin + 2, y);
      y += 4.8;
    });

    // Decline reason
    if (a.announcementStatus === "DECLINED" && a.reasonForDecline) {
      y += 2;
      checkY(10);
      doc.setFontSize(8.5);
      doc.setTextColor(220, 38, 38);
      const rLines = doc.splitTextToSize(
        `Reason for decline: ${a.reasonForDecline}`,
        contentW - 4,
      );
      doc.text(rLines, margin + 2, y);
      y += rLines.length * 4.5;
    }

    y += 4;
    // Separator
    if (idx < selected.length - 1) {
      checkY(8);
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y);
      y += 8;
    }
  });

  const tabSafe = tabLabel.toLowerCase().replace(/\s+/g, "-");
  doc.save(`altar-announcements-${tabSafe}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AnnouncementsPageClient() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("RECEIVED");
  const [items, setItems] = useState<AnnouncementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Settings
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [deadlineInput, setDeadlineInput] = useState("");
  const [showDeadlineEdit, setShowDeadlineEdit] = useState(false);
  const [savingDeadline, setSavingDeadline] = useState(false);
  const [deadlineMsg, setDeadlineMsg] = useState("");

  // Per-row action state
  const [actioning, setActioning] = useState<string | null>(null);

  // Decline Modal
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [selectedIdForDecline, setSelectedIdForDecline] = useState<string | null>(null);

  // ── NEW: Read modal & selection ──────────────────────────────────────────
  const [readItem, setReadItem] = useState<AnnouncementResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);

  // Close read modal on Escape
  useEffect(() => {
    if (!readItem) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setReadItem(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [readItem]);

  // Reset selection when tab changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [tab]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(items.map((a) => a.id)));
  };

  const deselectAll = () => setSelectedIds(new Set());

  const allSelected = items.length > 0 && items.every((a) => selectedIds.has(a.id));

  const tabLabel =
    tab === "RECEIVED" ? "Pending" : tab === "APPROVED" ? "Approved" : "Declined";

  const handleDownload = async () => {
    const selected = items.filter((a) => selectedIds.has(a.id));
    if (!selected.length) return;
    setDownloading(true);
    try {
      await downloadAsPdf(selected, tabLabel);
    } finally {
      setDownloading(false);
    }
  };

  // Navigate inside read modal
  const readIdx = readItem ? items.findIndex((a) => a.id === readItem.id) : -1;
  const goReadPrev = () => { if (readIdx > 0) setReadItem(items[readIdx - 1]); };
  const goReadNext = () => { if (readIdx < items.length - 1) setReadItem(items[readIdx + 1]); };

  // ── Load data ──────────────────────────────────────────────────────────────
  const load = useCallback(async (page: number, currentTab: Tab) => {
    setLoading(true);
    setError("");
    try {
      const [res, settings] = await Promise.all([
        getAnnouncements(page - 1, 20, currentTab),
        getSystemSettings().catch(() => null),
      ]);
      setItems(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.totalElements || 0);
      setCurrentPage(page);

      if (settings) {
        setSystemSettings(settings);
        if (settings.announcementDeadline) {
          setDeadlineInput(settings.announcementDeadline);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load announcements.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1, tab);
  }, [tab, load]);

  const handlePageChange = (page: number) => {
    load(page, tab);
    setSelectedIds(new Set());
  };

  // ── Save deadline ──────────────────────────────────────────────────────────
  const handleSaveDeadline = async () => {
    if (!deadlineInput) return;
    setSavingDeadline(true);
    setDeadlineMsg("");
    try {
      const payload: SystemSettings = {
        noOfDaysBeforeTriggeringFollowup: systemSettings?.noOfDaysBeforeTriggeringFollowup || 0,
        memberPerFollowupPersonnel: systemSettings?.memberPerFollowupPersonnel || 0,
        ...systemSettings,
        announcementDeadline: deadlineInput,
      };
      await updateSystemSettings(payload);
      setSystemSettings(payload);
      setShowDeadlineEdit(false);
      setDeadlineMsg("Deadline saved.");
      setTimeout(() => setDeadlineMsg(""), 3000);
    } catch (err) {
      setDeadlineMsg(err instanceof Error ? err.message : "Failed to save deadline.");
    } finally {
      setSavingDeadline(false);
    }
  };

  // ── Approve ────────────────────────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    setActioning(id);
    try {
      await approveAnnouncements([id]);
      setItems((prev) => prev.filter((a) => a.id !== id));
      setTotalItems((prev) => Math.max(0, prev - 1));
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve.");
    } finally {
      setActioning(null);
    }
  };

  // ── Decline ────────────────────────────────────────────────────────────────
  const openDeclineModal = (id: string) => {
    setSelectedIdForDecline(id);
    setDeclineReason("");
    setDeclineModalOpen(true);
  };

  const closeDeclineModal = () => {
    setDeclineModalOpen(false);
    setSelectedIdForDecline(null);
    setDeclineReason("");
  };

  const submitDecline = async () => {
    if (!selectedIdForDecline) return;
    const id = selectedIdForDecline;
    setActioning(id);
    closeDeclineModal();
    try {
      await declineAnnouncement(id, declineReason || "No reason provided");
      setItems((prev) => prev.filter((a) => a.id !== id));
      setTotalItems((prev) => Math.max(0, prev - 1));
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decline.");
    } finally {
      setActioning(null);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Announcements"
        subtitle="Manage announcement submissions"
        actions={
          <Button variant="primary" onClick={() => router.push("/announcements/add")}>
            Create Announcement
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Deadline banner ──────────────────────────────────────────────── */}
      <div className="mb-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">Submission Deadline</p>
            {systemSettings?.announcementDeadline ? (
              <p className={`mt-1 text-sm font-semibold ${new Date() > new Date(systemSettings.announcementDeadline) ? "text-red-600" : "text-[#111827] dark:text-slate-100"}`}>
                {fmtDateOnly(systemSettings.announcementDeadline)}{" "}
                {new Date() > new Date(systemSettings.announcementDeadline) ? "— Closed" : "— Open"}
              </p>
            ) : (
              <p className="mt-1 text-sm text-[#9CA3AF] dark:text-slate-400">
                No deadline set — submissions open indefinitely
              </p>
            )}
          </div>
          <Button variant="secondary" onClick={() => setShowDeadlineEdit((v) => !v)}>
            {showDeadlineEdit ? "Cancel" : systemSettings?.announcementDeadline ? "Edit Deadline" : "Set Deadline"}
          </Button>
        </div>

        {showDeadlineEdit && (
          <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-[#F3F4F6] pt-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6B7280] dark:text-slate-400">
                Deadline (Date)
              </label>
              <input
                type="date"
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
                className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2 text-sm text-[#374151] dark:text-slate-300 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
              />
            </div>
            <Button variant="primary" onClick={handleSaveDeadline} disabled={savingDeadline || !deadlineInput}>
              {savingDeadline ? "Saving…" : "Save Deadline"}
            </Button>
          </div>
        )}

        {deadlineMsg && (
          <p className="mt-2 text-xs text-[#000080] dark:text-indigo-400">{deadlineMsg}</p>
        )}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="mb-4 border-b border-[#E5E7EB] dark:border-slate-700">
        <div className="flex gap-8">
          {(["RECEIVED", "APPROVED", "DECLINED"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "border-b-2 border-[#000080] text-[#000080] dark:text-indigo-400"
                  : "text-[#6B7280] dark:text-slate-400 hover:text-[#374151] dark:hover:text-slate-300"
              }`}
            >
              {t === "RECEIVED" ? "Pending" : t === "APPROVED" ? "Approved" : "Declined"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Selection toolbar ─────────────────────────────────────────────── */}
      {!loading && items.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {/* Select all toggle */}
          <button
            onClick={allSelected ? deselectAll : selectAll}
            className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-[#374151] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-colors ${
                allSelected
                  ? "border-[#000080] bg-[#000080] dark:border-indigo-500 dark:bg-indigo-500"
                  : "border-[#D1D5DB] dark:border-slate-600"
              }`}
            >
              {allSelected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
            </span>
            {allSelected ? "Deselect all" : "Select all"}
          </button>

          {selectedIds.size > 0 && (
            <>
              <span className="text-xs text-[#6B7280] dark:text-slate-400">
                {selectedIds.size} selected
              </span>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 rounded-lg bg-[#000080] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#000066] disabled:opacity-60 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                {downloading ? "Generating PDF…" : "Download PDF"}
              </button>
              <button
                onClick={deselectAll}
                className="text-xs text-[#6B7280] dark:text-slate-400 hover:text-[#374151] dark:hover:text-slate-300 underline"
              >
                Clear
              </button>
            </>
          )}

          <p className="ml-auto text-xs text-[#9CA3AF] dark:text-slate-500">
            Double-click a card to read full message
          </p>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400 dark:text-slate-500">
          Loading announcements…
        </div>
      ) : (
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 py-16 text-center text-sm text-gray-400 dark:text-slate-500">
              No {tab === "RECEIVED" ? "pending" : tab === "APPROVED" ? "approved" : "declined"} announcements.
            </div>
          ) : (
            <>
              {items.map((a) => (
                <AnnouncementCard
                  key={a.id}
                  item={a}
                  actioning={actioning === a.id}
                  selected={selectedIds.has(a.id)}
                  onToggleSelect={() => toggleSelect(a.id)}
                  onDoubleClick={() => setReadItem(a)}
                  onApprove={tab === "RECEIVED" ? () => handleApprove(a.id) : undefined}
                  onDecline={tab === "RECEIVED" ? () => openDeclineModal(a.id) : undefined}
                />
              ))}

              {totalPages > 1 && (
                <div className="mt-6 border-t border-[#E5E7EB] dark:border-slate-700 pt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Decline Modal ────────────────────────────────────────────────── */}
      {declineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold text-[#111827] dark:text-slate-100">
              Decline Announcement
            </h3>
            <p className="mb-4 text-sm text-[#6B7280] dark:text-slate-400">
              Please provide a reason for declining this announcement. This will be recorded.
            </p>
            <textarea
              className="mb-4 w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2 text-sm text-[#374151] dark:text-slate-300 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
              rows={4}
              placeholder="Reason for decline..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
            <div className="flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={closeDeclineModal}>Cancel</Button>
              <Button variant="danger" onClick={submitDecline}>Decline</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Read Modal ───────────────────────────────────────────────────── */}
      {readItem && (
        <ReadModal
          item={readItem}
          selected={selectedIds.has(readItem.id)}
          onToggleSelect={() => toggleSelect(readItem.id)}
          onClose={() => setReadItem(null)}
          hasPrev={readIdx > 0}
          hasNext={readIdx < items.length - 1}
          onPrev={goReadPrev}
          onNext={goReadNext}
          index={readIdx + 1}
          total={items.length}
        />
      )}
    </DashboardLayout>
  );
}

// ─── Read Modal ───────────────────────────────────────────────────────────────
function ReadModal({
  item,
  selected,
  onToggleSelect,
  onClose,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  index,
  total,
}: {
  item: AnnouncementResponse;
  selected: boolean;
  onToggleSelect: () => void;
  onClose: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  index: number;
  total: number;
}) {
  const by = item.submittedBy;
  const name = by
    ? `${by.firstName || ""} ${by.lastName || ""}`.trim() || by.email || "Unknown"
    : "Unknown";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex w-full max-w-2xl flex-col rounded-2xl bg-white dark:bg-slate-800 shadow-2xl"
        style={{ maxHeight: "calc(100vh - 64px)" }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] dark:border-slate-700 px-6 py-4">
          <div className="flex-1 min-w-0">
            <p className="mb-1 text-xs font-medium text-[#6B7280] dark:text-slate-400">
              {index} of {total}
            </p>
            <h2 className="text-base font-bold text-[#111827] dark:text-slate-100 leading-snug">
              {item.subject || "Untitled"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-[#9CA3AF] dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Meta */}
        <div className="border-b border-[#F3F4F6] dark:border-slate-700/50 px-6 py-3 flex flex-wrap gap-x-6 gap-y-1">
          <MetaItem label="Submitted by" value={name} />
          {item.startDate && <MetaItem label="Starts" value={fmtDate(item.startDate)} />}
          {item.endDate && <MetaItem label="Ends" value={fmtDate(item.endDate)} />}
          {item.createdOn && <MetaItem label="Submitted" value={fmtDate(item.createdOn)} />}
          {item.announcementStatus && (
            <MetaItem
              label="Status"
              value={
                item.announcementStatus === "RECEIVED" ? "Pending"
                : item.announcementStatus === "APPROVED" ? "Approved"
                : "Declined"
              }
            />
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="whitespace-pre-wrap text-sm leading-7 text-[#374151] dark:text-slate-300">
            {item.content || "No content."}
          </p>
          {item.announcementStatus === "DECLINED" && item.reasonForDecline && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3">
              <p className="text-xs font-semibold text-red-600 mb-0.5">Reason for decline</p>
              <p className="text-sm text-red-700">{item.reasonForDecline}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-[#E5E7EB] dark:border-slate-700 px-6 py-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] dark:border-slate-700 text-[#6B7280] dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] dark:border-slate-700 text-[#6B7280] dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Select for download */}
          <button
            onClick={onToggleSelect}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selected
                ? "bg-[#000080] text-white hover:bg-[#000066] dark:bg-indigo-600 dark:hover:bg-indigo-700"
                : "border border-[#E5E7EB] dark:border-slate-700 text-[#374151] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            }`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-colors ${
                selected
                  ? "border-white bg-white"
                  : "border-[#D1D5DB] dark:border-slate-500"
              }`}
            >
              {selected && <Check className="h-2.5 w-2.5 text-[#000080]" strokeWidth={3} />}
            </span>
            {selected ? "Selected for download" : "Select for download"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-500">
        {label}
      </span>
      <p className="text-xs text-[#374151] dark:text-slate-300">{value}</p>
    </div>
  );
}

// ─── Card sub-component ───────────────────────────────────────────────────────
function AnnouncementCard({
  item,
  actioning,
  selected,
  onToggleSelect,
  onDoubleClick,
  onApprove,
  onDecline,
}: {
  item: AnnouncementResponse;
  actioning: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onDoubleClick: () => void;
  onApprove?: () => void;
  onDecline?: () => void;
}) {
  const by = item.submittedBy;
  const name = by
    ? `${by.firstName || ""} ${by.lastName || ""}`.trim() || by.email || "Unknown"
    : "Unknown";

  // Track double-click without triggering single-click actions
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleClick = (e: React.MouseEvent) => {
    // Don't interfere with clicks on interactive children
    if ((e.target as HTMLElement).closest("button, input, a")) return;
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onDoubleClick();
    } else {
      clickTimer.current = setTimeout(() => {
        clickTimer.current = null;
      }, 280);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative rounded-xl border bg-white dark:bg-slate-800 p-5 cursor-pointer transition-all duration-150 select-none ${
        selected
          ? "border-[#000080] dark:border-indigo-500 ring-1 ring-[#000080] dark:ring-indigo-500 shadow-sm"
          : "border-[#E5E7EB] dark:border-slate-700 hover:border-[#9CA3AF] dark:hover:border-slate-500 hover:shadow-sm"
      }`}
      title="Double-click to read full message"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
          className="absolute left-4 top-4 shrink-0"
          aria-label={selected ? "Deselect" : "Select"}
        >
          <span
            className={`flex h-[18px] w-[18px] items-center justify-center rounded border-2 transition-colors ${
              selected
                ? "border-[#000080] bg-[#000080] dark:border-indigo-500 dark:bg-indigo-500"
                : "border-[#D1D5DB] dark:border-slate-600 group-hover:border-[#9CA3AF]"
            }`}
          >
            {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
          </span>
        </button>

        <div className="flex-1 min-w-0 pl-7">
          <h3 className="text-sm font-bold text-[#111827] dark:text-slate-100">{item.subject}</h3>
          <p className="mt-0.5 text-xs text-[#6B7280] dark:text-slate-400">
            Submitted by {name}
            {item.startDate ? ` · Starts: ${fmtDate(item.startDate)}` : ""}
            {item.endDate ? ` · Ends: ${fmtDate(item.endDate)}` : ""}
            {item.createdOn ? ` · Submitted: ${fmtDate(item.createdOn)}` : ""}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#374151] dark:text-slate-300">
            <ExpandableText text={item.content} max={250} />
          </p>
          {item.announcementStatus === "DECLINED" && item.reasonForDecline && (
            <p className="mt-2 text-xs text-red-600">
              Reason for decline: {item.reasonForDecline}
            </p>
          )}
          <p className="mt-2 text-[10px] text-[#9CA3AF] dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
            Double-click to read full message
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          {onApprove && (
            <button
              onClick={(e) => { e.stopPropagation(); onApprove(); }}
              disabled={actioning}
              className="rounded-lg bg-[#000080] px-4 py-2 text-xs font-medium text-white hover:bg-[#000066] disabled:opacity-50 transition-colors"
            >
              {actioning ? "…" : "Approve"}
            </button>
          )}
          {onDecline && (
            <button
              onClick={(e) => { e.stopPropagation(); onDecline(); }}
              disabled={actioning}
              className="rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:bg-red-900/20 disabled:opacity-50 transition-colors"
            >
              {actioning ? "…" : "Decline"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ExpandableText({ text, max = 200 }: { text: string; max?: number }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  if (text.length <= max) return <span>{text}</span>;

  return (
    <span>
      {expanded ? text : text.slice(0, max) + "..."}
      <button
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        className="ml-2 font-medium text-[#000080] dark:text-indigo-400 hover:underline"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </span>
  );
}
