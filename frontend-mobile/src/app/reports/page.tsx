"use client";

import { useState } from "react";
import AppShell from "@/components/shell/AppShell";
import {
  Users,
  UserPlus,
  HandHeart,
  BookOpen,
  Calendar,
  MessageSquare,
  PartyPopper,
  DollarSign,
  ChevronRight,
} from "lucide-react";

const CATEGORIES = [
  { id: "members", label: "Members", icon: Users, color: "bg-indigo-100 text-indigo-700" },
  { id: "first-timers", label: "First Timers", icon: UserPlus, color: "bg-blue-100 text-blue-700" },
  { id: "follow-ups", label: "Follow-ups", icon: HandHeart, color: "bg-rose-100 text-rose-700" },
  { id: "trainings", label: "Trainings", icon: BookOpen, color: "bg-amber-100 text-amber-700" },
  { id: "events", label: "Events", icon: Calendar, color: "bg-green-100 text-green-700" },
  { id: "communication", label: "Communication", icon: MessageSquare, color: "bg-purple-100 text-purple-700" },
  { id: "celebrations", label: "Celebrations", icon: PartyPopper, color: "bg-pink-100 text-pink-700" },
  { id: "finance", label: "Finance", icon: DollarSign, color: "bg-emerald-100 text-emerald-700" },
];

export default function ReportsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const current = CATEGORIES.find((c) => c.id === selected);

  if (!current) {
    return (
      <AppShell title="Reports" subtitle="Choose a category">
        <ul className="space-y-2">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.id}>
                <button
                  onClick={() => setSelected(c.id)}
                  className="press flex w-full items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 text-left"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.color}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0F172A]">{c.label}</p>
                    <p className="mt-0.5 text-xs text-[#6B7280]">View {c.label.toLowerCase()} reports</p>
                  </div>
                  <ChevronRight size={18} className="text-[#9CA3AF]" />
                </button>
              </li>
            );
          })}
        </ul>
      </AppShell>
    );
  }

  const INPUT =
    "w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#000080]";

  return (
    <AppShell
      title={`${current.label} Report`}
      showBack
      topRight={
        <button
          onClick={() => setSelected(null)}
          className="press rounded-full bg-[#F4F5FB] px-3 py-1 text-[11px] font-semibold text-[#000080]"
        >
          Change
        </button>
      }
    >
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
        <p className="mb-2 text-xs font-semibold text-[#374151]">Date Range</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-[11px] text-[#6B7280]">From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={INPUT}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] text-[#6B7280]">To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={INPUT}
            />
          </label>
        </div>
        <button className="press mt-3 w-full rounded-xl bg-[#000080] py-3 text-sm font-semibold text-white">
          Generate Report
        </button>
      </div>

      <h2 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
        Overview
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total", value: "—" },
          { label: "This Month", value: "—" },
          { label: "New", value: "—" },
          { label: "Change", value: "—" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-[#E5E7EB] bg-white p-4"
          >
            <p className="text-xs text-[#6B7280]">{s.label}</p>
            <p className="mt-1 text-xl font-bold text-[#000080]">{s.value}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-8 text-center text-xs text-[#6B7280]">
        Select a date range and generate the report to see detailed stats.
      </p>
    </AppShell>
  );
}
