"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import SearchField from "@/components/ui/SearchField";
import Chip from "@/components/ui/Chip";
import { trainingCourses, trainingSchedules } from "@/lib/mock-data";
import { BookOpen, CalendarDays, MapPin, Users } from "lucide-react";

type Tab = "Courses" | "Schedules";

const courseStatusColor: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Upcoming: "bg-blue-100 text-blue-700",
  Completed: "bg-gray-100 text-gray-600",
  Cancelled: "bg-red-100 text-red-700",
};

export default function TrainingsPage() {
  const [tab, setTab] = useState<Tab>("Courses");
  const [search, setSearch] = useState("");

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return trainingCourses.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q),
    );
  }, [search]);

  const filteredSchedules = useMemo(() => {
    const q = search.trim().toLowerCase();
    return trainingSchedules.filter(
      (s) =>
        !q ||
        s.course.toLowerCase().includes(q) ||
        s.instructor.toLowerCase().includes(q) ||
        s.venue.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <AppShell
      title="Trainings"
      subtitle={
        tab === "Courses"
          ? `${filteredCourses.length} courses`
          : `${filteredSchedules.length} schedules`
      }
    >
      <div className="mb-3 flex gap-2">
        {(["Courses", "Schedules"] as Tab[]).map((t) => (
          <Chip key={t} label={t} active={tab === t} onClick={() => setTab(t)} />
        ))}
      </div>

      <SearchField value={search} onChange={setSearch} placeholder={`Search ${tab.toLowerCase()}...`} />

      {tab === "Courses" ? (
        <ul className="mt-4 space-y-2">
          {filteredCourses.map((c) => (
            <li key={c.id}>
              <Link
                href={`/trainings/courses/${c.id}`}
                className="press block rounded-2xl border border-[#E5E7EB] bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B5B5F3] text-[#000080]">
                    <BookOpen size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-[#0F172A]">{c.name}</p>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${courseStatusColor[c.status]}`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[#6B7280]">
                      {c.category} · {c.duration}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-[#6B7280]">
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {c.currentStudents} enrolled
                      </span>
                      <span>· {c.instructor}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {filteredCourses.length === 0 && (
            <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
              No courses.
            </li>
          )}
        </ul>
      ) : (
        <ul className="mt-4 space-y-2">
          {filteredSchedules.map((s) => (
            <li key={s.id}>
              <Link
                href={`/trainings/schedules/${s.id}`}
                className="press block rounded-2xl border border-[#E5E7EB] bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B5B5F3] text-[#000080]">
                    <CalendarDays size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-[#0F172A]">{s.course}</p>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${courseStatusColor[s.status]}`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[#6B7280]">{s.dayTime}</p>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-[#6B7280]">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {s.venue}
                      </span>
                      <span>· Cap {s.capacity}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {filteredSchedules.length === 0 && (
            <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
              No schedules.
            </li>
          )}
        </ul>
      )}
    </AppShell>
  );
}
