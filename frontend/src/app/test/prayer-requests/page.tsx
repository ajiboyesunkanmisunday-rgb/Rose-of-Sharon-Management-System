"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createPrayerRequest, createCounselingRequest, createSuggestion } from "@/lib/api";
import { ArrowLeft, Heart, CheckCircle, ExternalLink, AlertTriangle, Send } from "lucide-react";

function getStoredUser(): { id: string; firstName: string; lastName: string } | null {
  try { return JSON.parse(localStorage.getItem("rosms_user") ?? "null"); } catch { return null; }
}

type RequestType = "prayer" | "counseling" | "suggestion";
interface Submission { subject: string; type: RequestType; submittedAt: string; status: "ok" | "error"; message: string; }

const TYPE_CONFIG: Record<RequestType, { label: string; placeholder: string; color: string }> = {
  prayer:     { label: "Prayer Request",    placeholder: "Describe what you need prayer for…",                 color: "#EF4444" },
  counseling: { label: "Counseling Request",placeholder: "Briefly describe what you would like counsel on…",   color: "#8B5CF6" },
  suggestion: { label: "Suggestion",        placeholder: "Share your suggestion for the church or leadership…", color: "#0EA5E9" },
};

export default function PrayerRequestTestPage() {
  const router = useRouter();
  const [type,       setType]       = useState<RequestType>("prayer");
  const [subject,    setSubject]    = useState("");
  const [content,    setContent]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history,    setHistory]    = useState<Submission[]>([]);

  const cfg = TYPE_CONFIG[type];

  const handleSubmit = async () => {
    if (!subject.trim() || !content.trim()) return;
    const user = getStoredUser();
    if (!user) { alert("No logged-in user found. Please log in first."); return; }
    setSubmitting(true);
    const body = { userId: user.id, subject: subject.trim(), content: content.trim() };
    try {
      const fn = type === "prayer" ? createPrayerRequest : type === "counseling" ? createCounselingRequest : createSuggestion;
      await fn(body);
      setHistory((p) => [{ subject: subject.trim(), type, submittedAt: new Date().toLocaleTimeString(), status: "ok", message: "Created successfully." }, ...p]);
      setSubject(""); setContent("");
    } catch (e) {
      setHistory((p) => [{ subject: subject.trim(), type, submittedAt: new Date().toLocaleTimeString(), status: "error", message: e instanceof Error ? e.message : "Unknown error." }, ...p]);
    } finally { setSubmitting(false); }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/test")} className="text-[#000080] hover:text-[#000066]">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
          <Heart className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-[24px] font-bold">Prayer &amp; Counseling Request <span className="text-sm font-semibold text-red-500">[TEST]</span></h1>
          <p className="text-sm text-[#6B7280]">Simulates a member submitting a request on the public website</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
            <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700">
                <span className="font-semibold">Simulating public website form.</span>{" "}
                Calls real API. Verify in{" "}
                <button onClick={() => router.push("/prayer-requests")} className="font-semibold underline">Prayer Requests</button>{" "}
                or{" "}
                <button onClick={() => router.push("/workflows")} className="font-semibold underline">Workflows</button>.
              </p>
            </div>

            {/* Type tabs */}
            <div className="mb-5 flex rounded-xl border border-[#E5E7EB] p-1 bg-[#F9FAFB]">
              {(["prayer", "counseling", "suggestion"] as RequestType[]).map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold capitalize transition-all ${type === t ? "bg-white shadow text-[#111827]" : "text-[#6B7280] hover:text-[#374151]"}`}>
                  {TYPE_CONFIG[t].label}
                </button>
              ))}
            </div>

            <h2 className="mb-1 text-base font-bold text-[#111827]">{cfg.label}</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Subject *</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)}
                  placeholder={`Brief subject for your ${type}…`}
                  className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Details *</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)}
                  placeholder={cfg.placeholder} rows={5}
                  className="w-full resize-none rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-red-300 focus:ring-1 focus:ring-red-300" />
              </div>
            </div>

            <button onClick={handleSubmit} disabled={submitting || !subject.trim() || !content.trim()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: cfg.color }}>
              <Send className="h-4 w-4" />
              {submitting ? "Submitting…" : `Submit ${cfg.label}`}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#374151]">What to Verify</h3>
            <ul className="space-y-1.5 text-xs text-[#6B7280]">
              {["Request appears in the correct list (Prayer/Counseling/Suggestion)", "Subject and content are correct", "Status shows as RECEIVED or PENDING", "Can be assigned to an officer", "Appears on the workflow board"].map((item) => (
                <li key={item} className="flex items-start gap-1.5"><span className="mt-0.5 text-[#D1D5DB]">☐</span>{item}</li>
              ))}
            </ul>
            <div className="mt-3 flex flex-col gap-2">
              <button onClick={() => router.push("/prayer-requests")}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-medium hover:bg-[#F9FAFB]">
                <ExternalLink className="h-3 w-3" /> Prayer Requests Admin
              </button>
              <button onClick={() => router.push("/workflows")}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-medium hover:bg-[#F9FAFB]">
                <ExternalLink className="h-3 w-3" /> Workflow Board
              </button>
            </div>
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
                      <span className="ml-auto text-[#9CA3AF] capitalize">{h.type}</span>
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
