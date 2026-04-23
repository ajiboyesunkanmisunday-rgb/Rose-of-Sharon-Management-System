"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import Chip from "@/components/ui/Chip";
import { calendarEvents } from "@/lib/mock-data";
import type { CalendarEventCategory } from "@/lib/types";
import { CalendarDays, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

const CATS: (CalendarEventCategory | "All")[] = ["All", "Service", "Bible Study", "Youth", "Birthday", "Meeting", "Other"];

const catColor: Record<CalendarEventCategory, string> = {
  Service: "bg-blue-100 text-blue-700",
  "Bible Study": "bg-purple-100 text-purple-700",
  Youth: "bg-amber-100 text-amber-700",
  Birthday: "bg-pink-100 text-pink-700",
  Meeting: "bg-emerald-100 text-emerald-700",
  Other: "bg-gray-100 text-gray-700",
};

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(d: Date) {
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

export default function CalendarPage() {
  const [cat, setCat] = useState<(CalendarEventCategory) | "All">("All");
  const [month, setMonth] = useState(() => new Date(2026, 3, 1));

  const filtered = useMemo(() => {
    const key = monthKey(month);
    return calendarEvents
      .filter((e) => e.date.startsWith(key))
      .filter((e) => cat === "All" || e.category === cat)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [cat, month]);

  // Group by date
  const grouped = useMemo(() => {
    const g = new Map<string, typeof filtered>();
    for (const ev of filtered) {
      const arr = g.get(ev.date) || [];
      arr.push(ev);
      g.set(ev.date, arr);
    }
    return Array.from(g.entries());
  }, [filtered]);

  const go = (delta: number) => {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  };

  return (
    <AppShell title="Calendar" subtitle={`${filtered.length} events`}>
      <div className="flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white px-2 py-2">
        <button onClick={() => go(-1)} className="press rounded-xl p-2 text-[#000080]" aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-semibold text-[#0F172A]">{formatMonth(month)}</p>
        <button onClick={() => go(1)} className="press rounded-xl p-2 text-[#000080]" aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {CATS.map((c) => (
          <Chip key={c} label={c} active={cat === c} onClick={() => setCat(c)} />
        ))}
      </div>

      <div className="mt-4 space-y-5">
        {grouped.map(([date, items]) => {
          const dt = new Date(date + "T00:00:00");
          return (
            <section key={date}>
              <div className="mb-2 flex items-baseline gap-2 px-1">
                <p className="text-sm font-semibold text-[#0F172A]">
                  {dt.toLocaleDateString(undefined, { weekday: "long" })}
                </p>
                <p className="text-xs text-[#6B7280]">
                  {dt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </p>
              </div>
              <ul className="space-y-2">
                {items.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/calendar/${e.id}`}
                      className="press block rounded-2xl border border-[#E5E7EB] bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-[#0F172A]">{e.name}</p>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${catColor[e.category]}`}>
                          {e.category}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B7280]">
                        <span className="flex items-center gap-1"><Clock size={12} /> {e.time}</span>
                        {e.location && <span className="flex items-center gap-1"><MapPin size={12} /> {e.location}</span>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {grouped.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
            <CalendarDays size={24} className="mx-auto mb-2 text-[#9CA3AF]" />
            No events this month.
          </div>
        )}
      </div>
    </AppShell>
  );
}
