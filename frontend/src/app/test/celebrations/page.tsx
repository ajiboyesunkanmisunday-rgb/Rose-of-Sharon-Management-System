"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createCelebration } from "@/lib/api";
import { ArrowLeft, Star, CheckCircle, ExternalLink, AlertTriangle, Send, ChevronDown } from "lucide-react";

function getStoredUser(): { id: string; firstName: string; lastName: string } | null {
  try { return JSON.parse(localStorage.getItem("rosms_user") ?? "null"); } catch { return null; }
}

interface Submission { type: string; date: string; submittedAt: string; status: "ok" | "error"; message: string; }

const CELEBRATION_TYPES = [
  { value: "BIRTHDAY",          label: "Birthday" },
  { value: "WEDDING_ANNIVERSARY",label: "Wedding Anniversary" },
  { value: "CHILD_DEDICATION",  label: "Child Dedication" },
  { value: "WEDDING",           label: "Wedding" },
  { value: "GRADUATION",        label: "Graduation" },
  { value: "OTHER",             label: "Other" },
];

export default function CelebrationTestPage() {
  const router = useRouter();
  const [type,       setType]       = useState("BIRTHDAY");
  const [date,       setDate]       = useState("");
  const [notes,      setNotes]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history,    setHistory]    = useState<Submission[]>([]);

  const handleSubmit = async () => {
    if (!type || !date) return;
    const user = getStoredUser();
    if (!user) { alert("No logged-in user found. Please log in first."); return; }
    setSubmitting(true);
    try {
      await createCelebration({ userId: user.id, type, date, notes: notes.trim() || undefined });
      const label = CELEBRATION_TYPES.find((t) => t.value === type)?.label ?? type;
      setHistory((p) => [{ type: label, date, submittedAt: new Date().toLocaleTimeString(), status: "ok", message: "Created successfully." }, ...p]);
      setDate(""); setNotes("");
    } catch (e) {
      setHistory((p) => [{ type, date, submittedAt: new Date().toLocaleTimeString(), status: "error", message: e instanceof Error ? e.message : "Unknown error." }, ...p]);
    } finally { setSubmitting(false); }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/test")} className="text-[#000080] dark:text-indigo-400 hover:text-[#000066]"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
          <Star className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-[24px] font-bold">Celebration Announcement <span className="text-sm font-semibold text-purple-600">[TEST]</span></h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Simulates a member announcing a celebration event on the public website</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700">
                <span className="font-semibold">Simulating public website form.</span>{" "}
                Calls real API. Verify in{" "}
                <button onClick={() => router.push("/celebrations")} className="font-semibold underline">Celebrations</button>.
              </p>
            </div>

            <h2 className="mb-1 text-base font-bold text-[#111827] dark:text-slate-100">Share a Celebration</h2>
            <p className="mb-5 text-xs text-[#6B7280] dark:text-slate-400">Let us celebrate this special moment with you.</p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Celebration Type *</label>
                <div className="relative">
                  <select value={type} onChange={(e) => setType(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2.5 pr-8 text-sm text-[#111827] dark:text-slate-100 outline-none focus:border-purple-400">
                    {CELEBRATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] dark:text-slate-400" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Date *</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2.5 text-sm outline-none focus:border-purple-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Additional Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional details you'd like to share…" rows={4}
                  className="w-full resize-none rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2.5 text-sm outline-none focus:border-purple-400" />
              </div>
            </div>

            <button onClick={handleSubmit} disabled={submitting || !type || !date}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
              <Send className="h-4 w-4" />
              {submitting ? "Submitting…" : "Submit Celebration"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#374151] dark:text-slate-300">What to Verify</h3>
            <ul className="space-y-1.5 text-xs text-[#6B7280] dark:text-slate-400">
              {["Celebration appears in the Celebrations list", "Type and date are correct", "Status shows as PENDING/untreated", "Can be marked as treated", "Notes are preserved"].map((item) => (
                <li key={item} className="flex items-start gap-1.5"><span className="mt-0.5 text-[#D1D5DB]">☐</span>{item}</li>
              ))}
            </ul>
            <button onClick={() => router.push("/celebrations")}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2 text-xs font-medium hover:bg-[#F9FAFB]">
              <ExternalLink className="h-3 w-3" /> Open Celebrations Admin
            </button>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#374151] dark:text-slate-300">This Session</h3>
            {history.length === 0 ? <p className="text-xs text-[#9CA3AF] dark:text-slate-400">No submissions yet.</p> : (
              <ul className="space-y-2">
                {history.map((h, i) => (
                  <li key={i} className={`rounded-lg border px-3 py-2 text-xs ${h.status === "ok" ? "border-green-200 bg-green-50 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:bg-red-900/20"}`}>
                    <div className="flex items-center gap-1.5">
                      {h.status === "ok" ? <CheckCircle className="h-3 w-3 text-green-600" /> : <AlertTriangle className="h-3 w-3 text-red-500" />}
                      <span className="font-semibold">{h.type}</span>
                      <span className="ml-auto text-[#9CA3AF] dark:text-slate-400">{h.date}</span>
                    </div>
                    <p className={h.status === "ok" ? "text-green-700" : "text-red-600"}>{h.message}</p>
                    <p className="text-[10px] text-[#9CA3AF] dark:text-slate-400">{h.submittedAt}</p>
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
