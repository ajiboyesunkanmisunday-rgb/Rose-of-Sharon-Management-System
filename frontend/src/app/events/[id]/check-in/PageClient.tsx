"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import {
  getEvent,
  getEMembers,
  markEMemberEventAttendance,
  type UserResponse,
  type EventResponse,
} from "@/lib/api";

const ROSE_NAVY = "#000080";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fullName(u: { firstName?: string; middleName?: string; lastName?: string }) {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CheckInPageClient() {
  const params  = useParams();
  const paramId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const [eventId, setEventId] = useState(paramId);

  // Sync real ID from URL (Netlify placeholder fix)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      // path: /events/{id}/check-in → id is second-to-last segment
      const idx = parts.indexOf("check-in");
      const urlId = idx > 0 ? parts[idx - 1] : "";
      if (urlId && urlId !== eventId) setEventId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPlaceholder = (v: string) => /^ev-\d+$/.test(v);

  const [event, setEvent] = useState<EventResponse | null>(null);

  // Search
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 350);
  const [allMembers, setAllMembers] = useState<UserResponse[]>([]);
  const [membersLoaded, setMembersLoaded] = useState(false);

  const [selected, setSelected] = useState<UserResponse | null>(null);
  const [marking,  setMarking]  = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg,   setErrorMsg]   = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  // ── Load event info ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!eventId || isPlaceholder(eventId)) return;
    getEvent(eventId)
      .then(setEvent)
      .catch(() => {}); // non-fatal — just won't show event title
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // ── Load all e-members once (for client-side search) ────────────────────
  useEffect(() => {
    if (membersLoaded) return;
    getEMembers(0, 500)
      .then((res) => setAllMembers(res.content ?? []))
      .catch(() => {})
      .finally(() => setMembersLoaded(true));
  }, [membersLoaded]);

  // ── Filter results ───────────────────────────────────────────────────────
  const results = useCallback(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return allMembers.filter((m) => {
      const name  = fullName(m).toLowerCase();
      const email = (m.email ?? "").toLowerCase();
      const phone = (m.phoneNumber ?? "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    }).slice(0, 10);
  }, [debouncedQuery, allMembers]);

  const matches = results();

  // ── Mark attendance ───────────────────────────────────────────────────────
  const handleMark = async () => {
    if (!selected || !eventId || isPlaceholder(eventId)) return;
    setMarking(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await markEMemberEventAttendance(eventId, selected.id);
      setSuccessMsg(`✓ ${fullName(selected)} marked as attended!`);
      setSelected(null);
      setQuery("");
      setTimeout(() => setSuccessMsg(""), 4000);
      inputRef.current?.focus();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to mark attendance. Please try again.");
    } finally {
      setMarking(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div style={{ backgroundColor: ROSE_NAVY }} className="px-6 py-8 text-center text-white">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-white dark:bg-slate-800/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold">Service Check-In</h1>
        {event ? (
          <p className="mt-1 text-sm text-white/80">{event.title}</p>
        ) : !isPlaceholder(eventId) ? (
          <p className="mt-1 text-sm text-white/60">Loading event…</p>
        ) : null}
      </div>

      {/* Body */}
      <div className="mx-auto max-w-lg px-4 py-8">
        {/* Success banner */}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm font-medium text-green-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {successMsg}
          </div>
        )}

        {/* Error banner */}
        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="rounded-2xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <p className="mb-4 text-sm text-[#6B7280] dark:text-slate-400">
            Search for your name below, then tap it to select and confirm your attendance.
          </p>

          {/* Search input */}
          <div className="relative mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] dark:text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); setErrorMsg(""); }}
              placeholder="Type name, email or phone…"
              autoComplete="off"
              className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 py-3 pl-10 pr-4 text-sm text-[#374151] dark:text-slate-300 outline-none placeholder:text-[#9CA3AF] dark:text-slate-400 focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(""); setSelected(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] dark:text-slate-400 hover:text-[#374151] dark:text-slate-300"
              >
                ×
              </button>
            )}
          </div>

          {/* Loading members hint */}
          {!membersLoaded && (
            <p className="text-center text-xs text-[#9CA3AF] dark:text-slate-400">Loading members list…</p>
          )}

          {/* Results list */}
          {debouncedQuery.trim().length >= 2 && matches.length === 0 && membersLoaded && (
            <div className="rounded-lg border border-[#F3F4F6] bg-[#F9FAFB] px-4 py-4 text-center text-sm text-[#9CA3AF] dark:text-slate-400">
              No members found for &ldquo;{debouncedQuery}&rdquo;
            </div>
          )}

          {matches.length > 0 && (
            <ul className="mb-4 divide-y divide-[#F3F4F6] rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
              {matches.map((m) => {
                const isSelected = selected?.id === m.id;
                return (
                  <li
                    key={m.id}
                    onClick={() => setSelected(isSelected ? null : m)}
                    className={`flex cursor-pointer items-center justify-between px-4 py-3.5 transition-colors ${
                      isSelected
                        ? "bg-[#EFF6FF] font-medium"
                        : "hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <div>
                      <p className={`text-sm ${isSelected ? "text-[#000080] dark:text-indigo-400" : "text-[#111827] dark:text-slate-100"}`}>
                        {fullName(m)}
                      </p>
                      {(m.email || m.phoneNumber) && (
                        <p className="mt-0.5 text-xs text-[#6B7280] dark:text-slate-400">
                          {[m.email, m.phoneNumber].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-[#000080] dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Selected summary + confirm button */}
          {selected && (
            <div className="rounded-xl border border-[#000080]/20 bg-[#EFF6FF] px-4 py-4">
              <p className="text-sm text-[#6B7280] dark:text-slate-400">Selected</p>
              <p className="mt-0.5 text-base font-bold text-[#000080] dark:text-indigo-400">{fullName(selected)}</p>
              {selected.email && <p className="text-xs text-[#6B7280] dark:text-slate-400">{selected.email}</p>}
              <button
                onClick={handleMark}
                disabled={marking}
                style={{ backgroundColor: ROSE_NAVY }}
                className="mt-4 w-full rounded-lg px-4 py-3 text-sm font-bold text-white transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {marking ? "Marking Attendance…" : "I Attended This Service ✓"}
              </button>
            </div>
          )}

          {!selected && debouncedQuery.trim().length < 2 && (
            <div className="rounded-lg bg-[#F9FAFB] px-4 py-6 text-center text-xs text-[#9CA3AF] dark:text-slate-400">
              Type at least 2 characters to search
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-[#9CA3AF] dark:text-slate-400">
          Rose of Sharon Church · Service Check-In
        </p>
      </div>
    </main>
  );
}
