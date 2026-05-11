"use client";

import { useState, useEffect } from "react";
import {
  getAnnouncementSettings,
  submitAnnouncement,
} from "@/lib/api";

export default function AnnouncementSubmitClient() {
  const [deadline, setDeadline] = useState<string | null>(null);
  const [deadlineLoaded, setDeadlineLoaded] = useState(false);

  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [phone,   setPhone]   = useState("");
  const [title,   setTitle]   = useState("");
  const [content, setContent] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState("");

  useEffect(() => {
    getAnnouncementSettings()
      .then((s) => setDeadline(s.deadline ?? null))
      .catch(() => setDeadline(null))
      .finally(() => setDeadlineLoaded(true));
  }, []);

  const isPastDeadline = deadline ? new Date() > new Date(deadline) : false;

  function fmtDeadline(s: string) {
    try {
      return new Date(s).toLocaleString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return s; }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await submitAnnouncement({
        submitterName:  name.trim(),
        submitterEmail: email.trim() || undefined,
        submitterPhone: phone.trim() || undefined,
        title:          title.trim(),
        content:        content.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F9FAFB] p-6">
        <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#111827]">Announcement Submitted!</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Your announcement has been received and is pending review by the admin.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setName(""); setEmail(""); setPhone("");
              setTitle(""); setContent("");
            }}
            className="mt-6 rounded-lg bg-[#000080] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#000066] transition-colors"
          >
            Submit Another
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F9FAFB] px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#000080]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#111827]">Submit an Announcement</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Your announcement will be reviewed before being published.
          </p>
        </div>

        {/* Deadline notice */}
        {deadlineLoaded && (
          <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            isPastDeadline
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-blue-100 bg-blue-50 text-[#374151]"
          }`}>
            {isPastDeadline ? (
              <>
                <strong>Submissions are now closed.</strong> The deadline was{" "}
                {deadline ? fmtDeadline(deadline) : "unknown"}.
              </>
            ) : deadline ? (
              <>Deadline: <strong>{fmtDeadline(deadline)}</strong></>
            ) : (
              "Submissions are currently open."
            )}
          </div>
        )}

        {isPastDeadline ? null : (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151]">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your full name"
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
              />
            </div>

            {/* Email + Phone row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#374151]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#374151]">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151]">
                Announcement Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Brief title for your announcement"
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
              />
            </div>

            {/* Content */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151]">
                Announcement Details <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={5}
                placeholder="Write your full announcement here…"
                className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080] resize-none"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !name.trim() || !title.trim() || !content.trim()}
              className="w-full rounded-lg bg-[#000080] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#000066] disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit Announcement"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
