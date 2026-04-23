"use client";

import AppShell from "@/components/shell/AppShell";
import { trainingCourses } from "@/lib/mock-data";
import { BookOpen, CalendarDays, Clock, Tag, User2 } from "lucide-react";

export default function PageClient({ id }: { id: string }) {
  const c = trainingCourses.find((x) => x.id === id);
  if (!c) {
    return (
      <AppShell title="Course" showBack>
        <p className="text-sm text-[#6B7280]">Course not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Course" showBack>
      <div className="rounded-2xl bg-gradient-to-br from-[#000080] to-[#3B3BAE] p-5 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
          <BookOpen size={22} />
        </div>
        <h1 className="mt-3 text-lg font-semibold">{c.name}</h1>
        <p className="mt-1 text-xs text-white/75">{c.category}</p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Enrolled" value={c.currentStudents} />
          <Stat label="Applications" value={c.applications} />
          <Stat label="Past" value={c.pastStudents} />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="press flex-1 rounded-xl bg-[#000080] py-2.5 text-xs font-semibold text-white">
          Enroll
        </button>
        <button className="press flex-1 rounded-xl border border-[#E5E7EB] bg-white py-2.5 text-xs font-semibold text-[#000080]">
          Edit
        </button>
      </div>

      <section className="mt-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
          About
        </h2>
        <p className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#374151]">
          {c.description}
        </p>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
          Details
        </h2>
        <div className="rounded-xl border border-[#E5E7EB] bg-white px-3">
          <Row icon={<User2 size={16} />} label="Instructor" value={c.instructor} />
          <Row icon={<Clock size={16} />} label="Duration" value={c.duration} />
          <Row icon={<Tag size={16} />} label="Status" value={c.status} />
          {c.startDate && (
            <Row icon={<CalendarDays size={16} />} label="Start" value={c.startDate} />
          )}
          {c.endDate && (
            <Row icon={<CalendarDays size={16} />} label="End" value={c.endDate} />
          )}
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/15 p-2.5 text-center">
      <p className="text-base font-bold">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-white/75">{label}</p>
    </div>
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
