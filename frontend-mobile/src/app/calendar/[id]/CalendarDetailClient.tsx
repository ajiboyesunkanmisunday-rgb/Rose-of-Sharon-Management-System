"use client";

import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import { calendarEvents } from "@/lib/mock-data";
import type { CalendarEventCategory } from "@/lib/types";
import { CalendarDays, Clock, MapPin, Share2, Bell } from "lucide-react";

const catColor: Record<CalendarEventCategory, string> = {
  Service: "bg-blue-100 text-blue-700",
  "Bible Study": "bg-purple-100 text-purple-700",
  Youth: "bg-amber-100 text-amber-700",
  Birthday: "bg-pink-100 text-pink-700",
  Meeting: "bg-emerald-100 text-emerald-700",
  Other: "bg-gray-100 text-gray-700",
};

export default function CalendarDetailClient({ id }: { id: string }) {
  const e = calendarEvents.find((x) => x.id === id);
  if (!e) {
    return (
      <AppShell title="Event" showBack>
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-12 text-center text-sm text-[#6B7280]">
          Event not found.
          <div className="mt-4">
            <Link href="/calendar" className="text-[#000080] underline">Back to Calendar</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const dt = new Date(e.date + "T00:00:00");

  return (
    <AppShell title="Calendar Event" showBack>
      <div className="rounded-2xl bg-gradient-to-b from-[#000080] to-[#1a1aa6] p-5 text-white">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${catColor[e.category]}`}>
          {e.category}
        </span>
        <h1 className="mt-3 text-lg font-semibold">{e.name}</h1>
        <div className="mt-3 space-y-1 text-xs text-[#B5B5F3]">
          <p className="flex items-center gap-2"><CalendarDays size={14} /> {dt.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
          <p className="flex items-center gap-2"><Clock size={14} /> {e.time}</p>
          {e.location && <p className="flex items-center gap-2"><MapPin size={14} /> {e.location}</p>}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="press flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white py-3 text-xs font-semibold text-[#000080]">
          <Bell size={14} /> Remind me
        </button>
        <button className="press flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white py-3 text-xs font-semibold text-[#000080]">
          <Share2 size={14} /> Share
        </button>
      </div>

      {e.description && (
        <div className="mt-5">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Description
          </p>
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#374151]">
            {e.description}
          </div>
        </div>
      )}
    </AppShell>
  );
}
