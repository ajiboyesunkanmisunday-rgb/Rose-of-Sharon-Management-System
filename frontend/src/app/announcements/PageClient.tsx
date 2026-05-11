"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import {
  getAnnouncements,
  getAnnouncementSettings,
  setAnnouncementDeadline,
  approveAnnouncement,
  discardAnnouncement,
  type AnnouncementSubmission,
} from "@/lib/api";

type Tab = "pending" | "approved";

function fmtDate(s?: string) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return s;
  }
}

// ─── PDF download ─────────────────────────────────────────────────────────────
function downloadPDF(items: AnnouncementSubmission[]) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Approved Announcements</title>
<style>
body{font-family:Georgia,serif;margin:60px;color:#111}
h1{color:#000080;border-bottom:2px solid #000080;padding-bottom:10px;margin-bottom:30px}
.item{margin-bottom:28px;padding-bottom:24px;border-bottom:1px solid #e5e7eb}
.item h2{color:#000080;font-size:16px;margin:0 0 4px}
.meta{color:#6b7280;font-size:12px;margin-bottom:10px}
p{line-height:1.7;margin:0}
</style></head><body>
<h1>Approved Announcements</h1>
${items.map(a => `<div class="item">
<h2>${escHtml(a.title)}</h2>
<div class="meta">Submitted by ${escHtml(a.submitterName)}${a.submitterEmail ? ` · ${escHtml(a.submitterEmail)}` : ""}</div>
<p>${escHtml(a.content).replace(/\n/g, "<br>")}</p>
</div>`).join("")}
</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 600);
}

function downloadWord(items: AnnouncementSubmission[]) {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Approved Announcements</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>body{font-family:Georgia;margin:60px;color:#111}
h1{color:#000080}h2{color:#000080;font-size:14pt}
p.meta{color:#666;font-size:10pt}.divider{border-bottom:1pt solid #e5e7eb;margin:18pt 0}</style>
</head><body>
<h1>Approved Announcements</h1>
${items.map(a => `<h2>${escHtml(a.title)}</h2>
<p class="meta">Submitted by ${escHtml(a.submitterName)}${a.submitterEmail ? ` · ${escHtml(a.submitterEmail)}` : ""}</p>
<p>${escHtml(a.content).replace(/\n/g, "<br>")}</p>
<div class="divider"></div>`).join("")}
</body></html>`;
  const blob = new Blob(["﻿", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `announcements-${new Date().toISOString().slice(0, 10)}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AnnouncementsPageClient() {
  const [tab, setTab] = useState<Tab>("pending");
  const [items, setItems] = useState<AnnouncementSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Deadline
  const [deadline, setDeadline] = useState("");           // ISO string from API
  const [deadlineInput, setDeadlineInput] = useState(""); // datetime-local value
  const [showDeadlineEdit, setShowDeadlineEdit] = useState(false);
  const [savingDeadline, setSavingDeadline] = useState(false);
  const [deadlineMsg, setDeadlineMsg] = useState("");

  // Per-row action state
  const [actioning, setActioning] = useState<string | null>(null);

  // ── Load data ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [anns, settings] = await Promise.allSettled([
        getAnnouncements(),
        getAnnouncementSettings(),
      ]);
      if (anns.status === "fulfilled") setItems(anns.value);
      else setError("Could not load announcements. The backend may not have implemented this feature yet.");
      if (settings.status === "fulfilled") {
        setDeadline(settings.value.deadline ?? "");
        // Convert ISO to datetime-local format (YYYY-MM-DDTHH:mm)
        if (settings.value.deadline) {
          const d = new Date(settings.value.deadline);
          const pad = (n: number) => String(n).padStart(2, "0");
          setDeadlineInput(
            `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
          );
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Save deadline ──────────────────────────────────────────────────────────
  const handleSaveDeadline = async () => {
    if (!deadlineInput) return;
    setSavingDeadline(true);
    setDeadlineMsg("");
    try {
      const iso = new Date(deadlineInput).toISOString();
      await setAnnouncementDeadline(iso);
      setDeadline(iso);
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
      await approveAnnouncement(id);
      setItems((prev) =>
        prev.map((a) => a.id === id ? { ...a, status: "APPROVED" } : a)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve.");
    } finally {
      setActioning(null);
    }
  };

  // ── Discard ────────────────────────────────────────────────────────────────
  const handleDiscard = async (id: string) => {
    if (!confirm("Discard this announcement? This cannot be undone.")) return;
    setActioning(id);
    try {
      await discardAnnouncement(id);
      setItems((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to discard.");
    } finally {
      setActioning(null);
    }
  };

  const pending  = items.filter((a) => a.status === "PENDING");
  const approved = items.filter((a) => a.status === "APPROVED");

  const isDeadlinePassed = deadline ? new Date() > new Date(deadline) : false;

  return (
    <DashboardLayout>
      <PageHeader title="Announcements" subtitle="Manage announcement submissions" />

      {/* ── Deadline banner ──────────────────────────────────────────────── */}
      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Submission Deadline</p>
            {deadline ? (
              <p className={`mt-1 text-sm font-semibold ${isDeadlinePassed ? "text-red-600" : "text-[#111827]"}`}>
                {fmtDate(deadline)} {isDeadlinePassed ? "— Closed" : "— Open"}
              </p>
            ) : (
              <p className="mt-1 text-sm text-[#9CA3AF]">No deadline set — submissions open indefinitely</p>
            )}
          </div>
          <Button variant="secondary" onClick={() => setShowDeadlineEdit((v) => !v)}>
            {showDeadlineEdit ? "Cancel" : deadline ? "Edit Deadline" : "Set Deadline"}
          </Button>
        </div>

        {showDeadlineEdit && (
          <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-[#F3F4F6] pt-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#6B7280]">
                Deadline (date &amp; time)
              </label>
              <input
                type="datetime-local"
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
                className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
              />
            </div>
            <Button variant="primary" onClick={handleSaveDeadline} disabled={savingDeadline || !deadlineInput}>
              {savingDeadline ? "Saving…" : "Save Deadline"}
            </Button>
          </div>
        )}

        {deadlineMsg && (
          <p className="mt-2 text-xs text-[#000080]">{deadlineMsg}</p>
        )}
      </div>

      {/* ── Submission link ───────────────────────────────────────────────── */}
      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-[#374151]">
        <span className="font-medium text-[#000080]">Public submission link: </span>
        <span className="font-mono text-xs break-all">
          {typeof window !== "undefined" ? `${window.location.origin}/announcements/submit` : "/announcements/submit"}
        </span>
        <button
          onClick={() => {
            const url = `${window.location.origin}/announcements/submit`;
            navigator.clipboard.writeText(url).catch(() => {});
          }}
          className="ml-3 text-xs font-medium text-[#000080] underline hover:text-[#000066]"
        >
          Copy
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="mb-4 border-b border-[#E5E7EB]">
        <div className="flex gap-8">
          {(["pending", "approved"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "border-b-2 border-[#000080] text-[#000080]"
                  : "text-[#6B7280] hover:text-[#374151]"
              }`}
            >
              {t === "pending" ? `Pending (${pending.length})` : `Approved (${approved.length})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading announcements…</div>
      ) : (
        <>
          {/* ── Pending tab ────────────────────────────────────────────────── */}
          {tab === "pending" && (
            <div className="space-y-4">
              {pending.length === 0 ? (
                <div className="rounded-xl border border-[#E5E7EB] bg-white py-16 text-center text-sm text-gray-400">
                  No pending announcements.
                </div>
              ) : (
                pending.map((a) => (
                  <AnnouncementCard
                    key={a.id}
                    item={a}
                    actioning={actioning === a.id}
                    onApprove={() => handleApprove(a.id)}
                    onDiscard={() => handleDiscard(a.id)}
                  />
                ))
              )}
            </div>
          )}

          {/* ── Approved tab ───────────────────────────────────────────────── */}
          {tab === "approved" && (
            <>
              {approved.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <Button variant="primary" onClick={() => downloadPDF(approved)}>
                    Download PDF
                  </Button>
                  <Button variant="secondary" onClick={() => downloadWord(approved)}>
                    Download Word (.doc)
                  </Button>
                </div>
              )}
              <div className="space-y-4">
                {approved.length === 0 ? (
                  <div className="rounded-xl border border-[#E5E7EB] bg-white py-16 text-center text-sm text-gray-400">
                    No approved announcements yet. Approve items from the Pending tab.
                  </div>
                ) : (
                  approved.map((a) => (
                    <AnnouncementCard
                      key={a.id}
                      item={a}
                      actioning={actioning === a.id}
                      onDiscard={() => handleDiscard(a.id)}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

// ─── Card sub-component ───────────────────────────────────────────────────────
function AnnouncementCard({
  item,
  actioning,
  onApprove,
  onDiscard,
}: {
  item: AnnouncementSubmission;
  actioning: boolean;
  onApprove?: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[#111827]">{item.title}</h3>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            {item.submitterName}
            {item.submitterEmail ? ` · ${item.submitterEmail}` : ""}
            {item.submitterPhone ? ` · ${item.submitterPhone}` : ""}
            {item.createdAt ? ` · ${fmtDate(item.createdAt)}` : ""}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">
            {item.content}
          </p>
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
          <button
            onClick={onDiscard}
            disabled={actioning}
            className="rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {actioning ? "…" : "Discard"}
          </button>
        </div>
      </div>
    </div>
  );
}
