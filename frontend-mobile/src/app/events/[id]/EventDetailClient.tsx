"use client";

import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import { allEvents } from "@/lib/mock-data";
import type { EventStatus } from "@/lib/types";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users as UsersIcon,
  Share2,
  Bell,
  CheckCircle2,
  Info,
} from "lucide-react";

const statusColor: Record<EventStatus, string> = {
  Upcoming: "bg-blue-100 text-blue-700",
  Ongoing: "bg-green-100 text-green-700",
  Completed: "bg-gray-200 text-gray-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function EventDetailClient({ id }: { id: string }) {
  const e = allEvents.find((x) => x.id === id);
  if (!e) {
    return (
      <AppShell title="Event" showBack>
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-12 text-center text-sm text-[#6B7280]">
          Event not found.
          <div className="mt-4">
            <Link href="/events" className="text-[#000080] underline">Back to Events</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const capacityPct = e.capacity > 0 ? Math.min(100, Math.round((e.attendees / e.capacity) * 100)) : 0;

  const attendees: Array<{ label: string; value: number }> = [
    { label: "E-Members", value: e.eMembersCount ?? 0 },
    { label: "First Timers", value: e.firstTimersCount ?? 0 },
    { label: "Second Timers", value: e.secondTimersCount ?? 0 },
    { label: "New Converts", value: e.newConvertsCount ?? 0 },
  ];

  return (
    <AppShell title="Event" showBack>
      <div className="rounded-2xl bg-gradient-to-b from-[#000080] to-[#1a1aa6] p-5 text-white">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white ring-1 ring-white/20">
            {e.category}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColor[e.status]}`}>
            {e.status}
          </span>
        </div>
        <h1 className="mt-3 text-lg font-semibold leading-snug">{e.name}</h1>
        {e.topic && <p className="mt-1 text-xs text-[#B5B5F3]">{e.topic}</p>}
        <div className="mt-3 space-y-1 text-xs text-[#B5B5F3]">
          <p className="flex items-center gap-2"><CalendarDays size={14} /> {e.date}</p>
          <p className="flex items-center gap-2"><Clock size={14} /> {e.startTime} – {e.endTime}</p>
          <p className="flex items-center gap-2"><MapPin size={14} /> {e.location}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button className="press flex flex-col items-center justify-center gap-1 rounded-xl border border-[#E5E7EB] bg-white py-3 text-[11px] font-semibold text-[#000080]">
          <CheckCircle2 size={16} /> Register
        </button>
        <button className="press flex flex-col items-center justify-center gap-1 rounded-xl border border-[#E5E7EB] bg-white py-3 text-[11px] font-semibold text-[#000080]">
          <Bell size={16} /> Remind
        </button>
        <button className="press flex flex-col items-center justify-center gap-1 rounded-xl border border-[#E5E7EB] bg-white py-3 text-[11px] font-semibold text-[#000080]">
          <Share2 size={16} /> Share
        </button>
      </div>

      <Section title="Description" icon={Info}>
        <p className="text-sm leading-relaxed text-[#374151]">{e.description}</p>
      </Section>

      <Section title="Capacity" icon={UsersIcon}>
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold text-[#0F172A]">
            {e.attendees} <span className="text-xs font-normal text-[#6B7280]">of {e.capacity}</span>
          </p>
          <p className="text-xs font-medium text-[#000080]">{capacityPct}%</p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F1F2F7]">
          <div className="h-full rounded-full bg-[#000080]" style={{ width: `${capacityPct}%` }} />
        </div>
      </Section>

      <Section title="Attendee Breakdown" icon={UsersIcon}>
        <ul className="grid grid-cols-2 gap-2">
          {attendees.map((a) => (
            <li key={a.label} className="rounded-xl bg-[#F3F4FF] px-3 py-2">
              <p className="text-[11px] text-[#6B7280]">{a.label}</p>
              <p className="text-base font-semibold text-[#000080]">{a.value}</p>
            </li>
          ))}
        </ul>
      </Section>

      <div className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-4 text-xs text-[#6B7280]">
        <p>Created by <span className="font-medium text-[#374151]">{e.createdBy}</span></p>
        {e.createdDate && <p className="mt-0.5">Created on {e.createdDate}</p>}
        {e.type && <p className="mt-0.5">Type: {e.type}</p>}
      </div>
    </AppShell>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <p className="mb-2 flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
        <Icon size={12} /> {title}
      </p>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
        {children}
      </div>
    </div>
  );
}
