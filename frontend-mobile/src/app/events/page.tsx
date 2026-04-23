"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import SearchField from "@/components/ui/SearchField";
import Chip from "@/components/ui/Chip";
import { allEvents } from "@/lib/mock-data";
import { EventStatus } from "@/lib/types";
import { CalendarDays, MapPin } from "lucide-react";

const STATUSES: (EventStatus | "All")[] = ["All", "Upcoming", "Ongoing", "Completed", "Cancelled"];

const statusColor: Record<EventStatus, string> = {
  Upcoming: "bg-blue-100 text-blue-700",
  Ongoing: "bg-green-100 text-green-700",
  Completed: "bg-gray-100 text-gray-600",
  Cancelled: "bg-red-100 text-red-700",
};

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EventStatus | "All">("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allEvents.filter(
      (e) =>
        (status === "All" || e.status === status) &&
        (!q ||
          e.name.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)),
    );
  }, [search, status]);

  return (
    <AppShell title="Events" subtitle={`${filtered.length} events`}>
      <SearchField value={search} onChange={setSearch} placeholder="Search events..." />

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {STATUSES.map((s) => (
          <Chip key={s} label={s} active={status === s} onClick={() => setStatus(s)} />
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {filtered.map((e) => (
          <li key={e.id}>
            <Link
              href={`/events/${e.id}`}
              className="press block rounded-2xl border border-[#E5E7EB] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-[#0F172A]">{e.name}</p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColor[e.status]}`}
                >
                  {e.status}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-[#6B7280]">
                <span className="flex items-center gap-1">
                  <CalendarDays size={14} /> {e.date}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} /> {e.location}
                </span>
              </div>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
            No events.
          </li>
        )}
      </ul>
    </AppShell>
  );
}
