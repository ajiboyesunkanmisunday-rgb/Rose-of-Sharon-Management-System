"use client";

import Link from "next/link";
import { useState } from "react";
import AppShell from "@/components/shell/AppShell";
import { KeyRound, ChevronRight, Smartphone, LogOut } from "lucide-react";

export default function SecuritySettingsPage() {
  const [twoFA, setTwoFA] = useState(false);
  const [biometric, setBiometric] = useState(true);

  const sessions = [
    { id: "s1", device: "iPhone 15 Pro", location: "Lagos, Nigeria", lastActive: "Now" },
    { id: "s2", device: "MacBook Pro", location: "Lagos, Nigeria", lastActive: "2 hours ago" },
    { id: "s3", device: "Chrome on Windows", location: "Abuja, Nigeria", lastActive: "3 days ago" },
  ];

  return (
    <AppShell title="Security" showBack>
      <div className="mb-5">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
          Password
        </p>
        <Link
          href="/profile/change-password"
          className="press flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3F4FF] text-[#000080]">
            <KeyRound size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#0F172A]">Change Password</p>
            <p className="text-xs text-[#6B7280]">Last changed 14 days ago</p>
          </div>
          <ChevronRight size={18} className="text-[#9CA3AF]" />
        </Link>
      </div>

      <div className="mb-5">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
          Authentication
        </p>
        <ul className="divide-y divide-[#F1F2F7] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
          <ToggleRow label="Two-factor Authentication" hint="Require a code when signing in" on={twoFA} onChange={setTwoFA} />
          <ToggleRow label="Biometric Unlock" hint="Use Face ID or fingerprint" on={biometric} onChange={setBiometric} />
        </ul>
      </div>

      <div className="mb-5">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
          Active Sessions
        </p>
        <ul className="divide-y divide-[#F1F2F7] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3F4FF] text-[#000080]">
                <Smartphone size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#0F172A]">{s.device}</p>
                <p className="truncate text-xs text-[#6B7280]">{s.location} · {s.lastActive}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <button className="press mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white py-3.5 text-sm font-semibold text-red-600">
        <LogOut size={18} /> Sign out all other sessions
      </button>
    </AppShell>
  );
}

function ToggleRow({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#0F172A]">{label}</p>
        <p className="truncate text-xs text-[#6B7280]">{hint}</p>
      </div>
      <button
        onClick={() => onChange(!on)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-[#000080]" : "bg-[#E5E7EB]"}`}
        aria-label={`Toggle ${label}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </li>
  );
}
