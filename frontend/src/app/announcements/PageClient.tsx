"use client";

import { useState, useEffect, useCallback } from "react";
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

type Tab = "RECEIVED" | "APPROVED" | "DECLINED";

function fmtDateOnly(s?: string) {
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

function fmtDate(s?: string) {
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
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(
    null
  );
  const [deadlineInput, setDeadlineInput] = useState("");

  const [showDeadlineEdit, setShowDeadlineEdit] = useState(false);
  const [savingDeadline, setSavingDeadline] = useState(false);
  const [deadlineMsg, setDeadlineMsg] = useState("");

  // Per-row action state
  const [actioning, setActioning] = useState<string | null>(null);

  // Decline Modal state
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [selectedIdForDecline, setSelectedIdForDecline] = useState<
    string | null
  >(null);

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
      setError(
        err instanceof Error ? err.message : "Could not load announcements."
      );
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
  };

  // ── Save deadline ──────────────────────────────────────────────────────────
  const handleSaveDeadline = async () => {
    if (!deadlineInput) return;
    setSavingDeadline(true);
    setDeadlineMsg("");
    try {
      const payload: SystemSettings = {
        noOfDaysBeforeTriggeringFollowup:
          systemSettings?.noOfDaysBeforeTriggeringFollowup || 0,
        memberPerFollowupPersonnel:
          systemSettings?.memberPerFollowupPersonnel || 0,
        ...systemSettings,
        announcementDeadline: deadlineInput,
      };
      await updateSystemSettings(payload);
      setSystemSettings(payload);
      setShowDeadlineEdit(false);
      setDeadlineMsg("Deadline saved.");
      setTimeout(() => setDeadlineMsg(""), 3000);
    } catch (err) {
      setDeadlineMsg(
        err instanceof Error ? err.message : "Failed to save deadline."
      );
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to approve.";
      setError(msg);
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
          <Button
            variant="primary"
            onClick={() => router.push("/announcements/add")}
          >
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
            <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">
              Submission Deadline
            </p>
            {systemSettings?.announcementDeadline ? (
              <p
                className={`mt-1 text-sm font-semibold ${
                  new Date() > new Date(systemSettings.announcementDeadline)
                    ? "text-red-600"
                    : "text-[#111827] dark:text-slate-100"
                }`}
              >
                {fmtDateOnly(systemSettings.announcementDeadline)}{" "}
                {new Date() > new Date(systemSettings.announcementDeadline)
                  ? "— Closed"
                  : "— Open"}
              </p>
            ) : (
              <p className="mt-1 text-sm text-[#9CA3AF] dark:text-slate-400">
                No deadline set — submissions open indefinitely
              </p>
            )}
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowDeadlineEdit((v) => !v)}
          >
            {showDeadlineEdit
              ? "Cancel"
              : systemSettings?.announcementDeadline
              ? "Edit Deadline"
              : "Set Deadline"}
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
            <Button
              variant="primary"
              onClick={handleSaveDeadline}
              disabled={savingDeadline || !deadlineInput}
            >
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
                  : "text-[#6B7280] dark:text-slate-400 hover:text-[#374151] dark:text-slate-300"
              }`}
            >
              {t === "RECEIVED"
                ? "Pending"
                : t === "APPROVED"
                ? "Approved"
                : "Declined"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400 dark:text-slate-500">
          Loading announcements…
        </div>
      ) : (
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 py-16 text-center text-sm text-gray-400 dark:text-slate-500">
              No{" "}
              {tab === "RECEIVED"
                ? "pending"
                : tab === "APPROVED"
                ? "approved"
                : "declined"}{" "}
              announcements.
            </div>
          ) : (
            <>
              {items.map((a) => (
                <AnnouncementCard
                  key={a.id}
                  item={a}
                  actioning={actioning === a.id}
                  onApprove={
                    tab === "RECEIVED" ? () => handleApprove(a.id) : undefined
                  }
                  onDecline={
                    tab === "RECEIVED"
                      ? () => openDeclineModal(a.id)
                      : undefined
                  }
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
              Please provide a reason for declining this announcement. This will
              be recorded.
            </p>
            <textarea
              className="mb-4 w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2 text-sm text-[#374151] dark:text-slate-300 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
              rows={4}
              placeholder="Reason for decline..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
            <div className="flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={closeDeclineModal}>
                Cancel
              </Button>
              <Button variant="danger" onClick={submitDecline}>
                Decline
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// ─── Card sub-component ───────────────────────────────────────────────────────
function AnnouncementCard({
  item,
  actioning,
  onApprove,
  onDecline,
}: {
  item: AnnouncementResponse;
  actioning: boolean;
  onApprove?: () => void;
  onDecline?: () => void;
}) {
  const by = item.submittedBy;
  const submitterName = by
    ? `${by.firstName || ""} ${by.lastName || ""}`.trim() || by.email
    : "Unknown";

  return (
    <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[#111827] dark:text-slate-100">{item.subject}</h3>
          <p className="mt-0.5 text-xs text-[#6B7280] dark:text-slate-400">
            Submitted by {submitterName}
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
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          {onApprove && (
            <button
              onClick={onApprove}
              disabled={actioning}
              className="rounded-lg bg-[#000080] px-4 py-2 text-xs font-medium text-white hover:bg-[#000066] disabled:opacity-50 transition-colors"
            >
              {actioning ? "…" : "Approve"}
            </button>
          )}
          {onDecline && (
            <button
              onClick={onDecline}
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
        onClick={() => setExpanded(!expanded)}
        className="ml-2 font-medium text-[#000080] dark:text-indigo-400 hover:underline"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </span>
  );
}
