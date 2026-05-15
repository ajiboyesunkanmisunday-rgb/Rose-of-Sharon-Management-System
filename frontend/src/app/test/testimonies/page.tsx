"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createTestimony } from "@/lib/api";
import { ArrowLeft, Star, CheckCircle, ExternalLink, AlertTriangle, Send } from "lucide-react";

function getStoredUser(): { id: string; firstName: string; lastName: string } | null {
  try { return JSON.parse(localStorage.getItem("rosms_user") ?? "null"); } catch { return null; }
}

interface Submission { id?: string; subject: string; submittedAt: string; status: "ok" | "error"; message: string; }

export default function TestimonyTestPage() {
  const router = useRouter();
  const [subject,   setSubject]   = useState("");
  const [content,   setContent]   = useState("");
  const [state,     setState]     = useState("");
  const [country,   setCountry]   = useState("Nigeria");
  const [submitting, setSubmitting] = useState(false);
  const [history,   setHistory]   = useState<Submission[]>([]);

  const handleSubmit = async () => {
    if (!subject.trim() || !content.trim()) return;
    const user = getStoredUser();
    if (!user) { alert("No logged-in user found. Please log in first."); return; }
    setSubmitting(true);
    try {
      const res = await createTestimony({
        subject: subject.trim(),
        content: content.trim(),
        userId: user.id,
        state: state.trim() || undefined,
        country: country.trim() || undefined,
      });
      setHistory((p) => [{ id: res.id, subject: subject.trim(), submittedAt: new Date().toLocaleTimeString(), status: "ok", message: "Created successfully." }, ...p]);
      setSubject(""); setContent(""); setState("");
    } catch (e) {
      setHistory((p) => [{ subject: subject.trim(), submittedAt: new Date().toLocaleTimeString(), status: "error", message: e instanceof Error ? e.message : "Unknown error." }, ...p]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/test")} className="text-[#000080] hover:text-[#000066]">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
          <Star className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-[24px] font-bold text-[#000000]">Testimony Submission <span className="text-sm font-semibold text-amber-600">[TEST]</span></h1>
          <p className="text-sm text-[#6B7280]">Simulates a member submitting a testimony on the public website</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700">
                <span className="font-semibold">Simulating public website form.</span>{" "}
                Submission calls the real API. Verify the record appears in{" "}
                <button onClick={() => router.push("/testimonies")} className="font-semibold underline">Testimonies</button>.
              </p>
            </div>

            <h2 className="mb-1 text-base font-bold text-[#111827]">Share Your Testimony</h2>
            <p className="mb-5 text-xs text-[#6B7280]">Tell us how God has been faithful in your life.</p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Subject *</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. God healed my daughter"
                  className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#111827] outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Your Testimony *</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)}
                  placeholder="Share what God has done for you…"
                  rows={5}
                  className="w-full resize-none rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#111827] outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#374151]">State</label>
                  <input value={state} onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Lagos"
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#111827] outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#374151]">Country</label>
                  <input value={country} onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#111827] outline-none focus:border-amber-400" />
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !subject.trim() || !content.trim()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Submitting…" : "Submit Testimony"}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* What to verify */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#374151]">What to Verify</h3>
            <ul className="space-y-1.5 text-xs text-[#6B7280]">
              {["Testimony appears in the Testimonies list", "Subject and content are correct", "Status shows as RECEIVED/unread", "Can be marked as featured", "Can be marked as read"].map((item) => (
                <li key={item} className="flex items-start gap-1.5"><span className="mt-0.5 text-[#D1D5DB]">☐</span>{item}</li>
              ))}
            </ul>
            <button
              onClick={() => router.push("/testimonies")}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-medium text-[#374151] hover:bg-[#F9FAFB]"
            >
              <ExternalLink className="h-3 w-3" /> Open Testimonies Admin
            </button>
          </div>

          {/* Submission history */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#374151]">This Session</h3>
            {history.length === 0 ? (
              <p className="text-xs text-[#9CA3AF]">No submissions yet.</p>
            ) : (
              <ul className="space-y-2">
                {history.map((h, i) => (
                  <li key={i} className={`rounded-lg border px-3 py-2 text-xs ${h.status === "ok" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                    <div className="flex items-center gap-1.5">
                      {h.status === "ok" ? <CheckCircle className="h-3 w-3 text-green-600" /> : <AlertTriangle className="h-3 w-3 text-red-500" />}
                      <span className="font-semibold text-[#111827]">{h.subject}</span>
                    </div>
                    <p className={`mt-0.5 ${h.status === "ok" ? "text-green-700" : "text-red-600"}`}>{h.message}</p>
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
