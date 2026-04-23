"use client";

import AppShell from "@/components/shell/AppShell";
import { trainingSchedules } from "@/lib/mock-data";
import { CalendarDays, MapPin, Users, User2, Clock } from "lucide-react";

export default function PageClient({ id }: { id: string }) {
  const s = trainingSchedules.find((x) => x.id === id);
  if (!s) {
    return (
      <AppShell title="Schedule" showBack>
        <p className="text-sm text-[#6B7280]">Schedule not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Schedule" showBack>
      <div className="rounded-2xl bg-gradient-to-br from-[#000080] to-[#3B3BAE] p-5 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
          <CalendarDays size={22} />
        </div>
        <h1 className="mt-3 text-lg font-semibold">{s.course}</h1>
        <p className="mt-1 text-xs text-white/75">{s.dayTime}</p>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="press flex-1 rounded-xl bg-[#000080] py-2.5 text-xs font-semibold text-white">
          Register
        </button>
        <button className="press flex-1 rounded-xl border border-[#E5E7EB] bg-white py-2.5 text-xs font-semibold text-[#000080]">
          Edit
        </button>
      </div>

      <section className="mt-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
          Details
        </h2>
        <div className="rounded-xl border border-[#E5E7EB] bg-white px-3">
          <Row icon={<User2 size={16} />} label="Instructor" value={s.instructor} />
          <Row icon={<MapPin size={16} />} label="Venue" value={s.venue} />
          <Row icon={<Users size={16} />} label="Capacity" value={String(s.capacity)} />
          <Row icon={<Clock size={16} />} label="Day / Time" value={s.dayTime} />
          <Row icon={<CalendarDays size={16} />} label="Start" value={s.startDate} />
          <Row icon={<CalendarDays size={16} />} label="End" value={s.endDate} />
        </div>
      </section>
    </AppShell>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#F1F2F6] py-2.5 last:border-0">
      <span className="text-[#000080]">{icon}</span>
      <span className="flex-1 text-xs text-[#6B7280]">{label}</span>
      <span className="text-sm font-medium text-[#0F172A]">{value}</span>
    </div>
  );
}
