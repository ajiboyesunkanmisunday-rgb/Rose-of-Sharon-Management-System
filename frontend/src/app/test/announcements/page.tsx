"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createAnnouncement } from "@/lib/api";
import { ArrowLeft, Megaphone, CheckCircle, ExternalLink, AlertTriangle, Send } from "lucide-react";

function getStoredUser(): { id: string; firstName: string; lastName: string } | null {
  try { return JSON.parse(localStorage.getItem("rosms_user") ?? "null"); } catch { return null; }
}

interface Submission { subject: string; submittedAt: string; status: "ok" | "error"; message: string; }

export default function AnnouncementTestPage() {
  const router = useRouter();
  const [subject,    setSubject]    = useState("");
  const [content,    setContent]    = useState("");
  const [startDate,  setStartDate]  = useState("");
  const [endDate,    setEndDate]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history,    setHistory]    = useState<Submission[]>([]);

  const handleSubmit = async () => {
    if (!subject.trim() || !content.trim()) return;
    const user = getStoredUser();
    setSubmitting(true);
    try {
      await createAnnouncement({
        subject: subject.trim(),
        content: content.trim(),
        submittedBy: user?.id,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setHistory((p) => [{ subject: subject.trim(), submittedAt: new Date().toLocaleTimeString(), status: "ok", message: "Submitted — awaiting admin approval (RECEIVED)." }, ...p]);
      setSubject(""); setContent(""); setStartDate(""); setEndDate("");
    } catch (e) {
      setHistory((p) => [{ subject: subject.trim(), submittedAt: new Date().toLocaleTimeString(), status: "error", message: e instanceof Error ? e.message : "Unknown error." }, ...p]);
    } finally { setSubmitting(false); }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/test")} className="text-[#000080] hover:text-[#000066]"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
          <Megaphone className="h-5 w-5 text-sky-600" />
        </div>
        <div>
          <h1 className="text-[24px] font-bold">Announcement Request <span className="text-sm font-semibold text-sky-600">[TEST]</span></h1>
          <p className="text-sm text-[#6B7280]">Simulates a member submitting an announcement for admin approval</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
            <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700">
                <span className="font-semibold">Simulating public website form.</span>{" "}
                Submitted announcements enter the admin queue with status RECEIVED.
                Verify in{" "}
                <button onClick={() => router.push("/communication/announcements")} className="font-semibold underline">Announcements</button>.
              </p>
            </div>

            <h2 className="mb-1 text-base font-bold text-[#111827]">Submit an Announcement</h2>
            <p className="mb-5 text-xs text-[#6B7280]">Your announcement will be reviewed by the admin team before being published.</p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Subject *</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Youth Camp Registration Open"
                  className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-sky-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Announcement Content *</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the full announcement text here…" rows={5}
                  className="w-full resize-none rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-sky-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#374151]">Display From</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-sky-400" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#374151]">Display Until</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-sky-400" />
                </div>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={submitting || !subject.trim() || !content.trim()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50">
              <Send className="h-4 w-4" />
              {submitting ? "Submitting…" : "Submit Announcement"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#374151]">What to Verify</h3>
            <ul className="space-y-1.5 text-xs text-[#6B7280]">
              {["Announcement appears in the queue with RECEIVED status", "Subject and content are correct", "Date range is saved correctly", "Admin can approve it", "Admin can decline it with a reason", "Status updates to APPROVED / DECLINED after action"].map((item) => (
                <li key={item} className="flex items-start gap-1.5"><span className="mt-0.5 text-[#D1D5DB]">☐</span>{item}</li>
              ))}
            </ul>
            <button onClick={() => router.push("/communication/announcements")}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-medium hover:bg-[#F9FAFB]">
              <ExternalLink className="h-3 w-3" /> Open Announcements Admin
            </button>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#374151]">This Session</h3>
            {history.length === 0 ? <p className="text-xs text-[#9CA3AF]">No submissions yet.</p> : (
              <ul className="space-y-2">
                {history.map((h, i) => (
                  <li key={i} className={`rounded-lg border px-3 py-2 text-xs ${h.status === "ok" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                    <div className="flex items-center gap-1.5">
                      {h.status === "ok" ? <CheckCircle className="h-3 w-3 text-green-600" /> : <AlertTriangle className="h-3 w-3 text-red-500" />}
                      <span className="font-semibold">{h.subject}</span>
                    </div>
                    <p className={h.status === "ok" ? "text-green-700" : "text-red-600"}>{h.message}</p>
                    <p className="text-[10px] text-[#9CA3AF]">{h.submittedAt}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
