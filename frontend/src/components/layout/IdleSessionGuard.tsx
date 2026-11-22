"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { logoutUser } from "@/lib/api";

const IDLE_MINUTES = Number(process.env.NEXT_PUBLIC_IDLE_LOGOUT_MINUTES) > 0
  ? Number(process.env.NEXT_PUBLIC_IDLE_LOGOUT_MINUTES)
  : 5;
const IDLE_MS = IDLE_MINUTES * 60_000;
const WARNING_MS = Math.min(60_000, IDLE_MS / 2);
const ACTIVITY_KEY = "rosms_last_activity";
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "scroll", "touchstart", "wheel"] as const;

const RING_RADIUS = 52;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function lastActivity(): number {
  const stored = Number(localStorage.getItem(ACTIVITY_KEY));
  return Number.isFinite(stored) && stored > 0 ? stored : Date.now();
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * Signs the user out after a period without activity. During the last minute a
 * countdown dialog offers to keep the session going or to sign out at once.
 * Activity is shared between browser tabs through localStorage.
 */
export default function IdleSessionGuard() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const staySignedInRef = useRef<HTMLButtonElement>(null);
  const warning = remaining !== null;

  const markActive = useCallback(() => {
    localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
    setRemaining(null);
  }, []);

  useEffect(() => {
    localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
    let lastWrite = Date.now();

    // The dialog only closes through its own button; activity elsewhere is ignored once the warning is up.
    const onActivity = () => {
      const now = Date.now();
      if (now - lastWrite < 1000) return;
      if (now - lastActivity() > IDLE_MS - WARNING_MS) return;
      lastWrite = now;
      localStorage.setItem(ACTIVITY_KEY, String(now));
    };
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    const tick = () => {
      const left = IDLE_MS - (Date.now() - lastActivity());
      if (left <= 0) {
        logoutUser();
      } else if (left <= WARNING_MS) {
        setRemaining(left);
      } else {
        setRemaining(null);
      }
    };
    const interval = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener("visibilitychange", tick);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (warning) staySignedInRef.current?.focus();
  }, [warning]);

  if (remaining === null) return null;

  const progress = Math.min(1, remaining / WARNING_MS);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="idle-title"
        aria-describedby="idle-desc"
        className="page-enter w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-slate-800"
      >
        <div className="relative mx-auto h-32 w-32">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="60" cy="60" r={RING_RADIUS} fill="none" strokeWidth="8" className="stroke-[#E5E7EB] dark:stroke-slate-700" />
            <circle
              cx="60"
              cy="60"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={RING_LENGTH * (1 - progress)}
              className={progress > 0.35 ? "stroke-[#000080] dark:stroke-indigo-400" : "stroke-red-600"}
              style={{ transition: "stroke-dashoffset 0.25s linear, stroke 0.3s ease" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-semibold tabular-nums text-[#111827] dark:text-white">
            {formatRemaining(remaining)}
          </span>
        </div>

        <h2 id="idle-title" className="mt-5 text-lg font-semibold text-[#111827] dark:text-white">
          Are you still there?
        </h2>
        <p id="idle-desc" className="mt-1 text-sm text-[#6B7280] dark:text-slate-400">
          For your security you will be logged out soon because there has been no activity.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <button
            ref={staySignedInRef}
            type="button"
            onClick={markActive}
            className="flex-1 rounded-xl bg-[#000080] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#000066] dark:bg-indigo-600 dark:hover:bg-indigo-700"
          >
            Continue session
          </button>
          <button
            type="button"
            onClick={logoutUser}
            className="flex-1 rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
