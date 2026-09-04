"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import { getTrainingEvents, type TrainingEventResponse } from "@/lib/api";
import { GraduationCap } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  BAPTISM: "Water Baptism",
  WORKERS_IN_TRAINING: "Workers in Training",
  SCHOOL_OF_DISCIPLES: "School of Disciples",
  SCHOOL_OF_MINISTRY: "School of Ministry",
};

const CATEGORY_COLORS: Record<string, string> = {
  BAPTISM: "bg-[#DBEAFE] dark:bg-blue-900/30 text-[#2563EB]",
  WORKERS_IN_TRAINING: "bg-[#DCFCE7] dark:bg-green-900/30 text-[#16A34A] dark:text-green-300",
  SCHOOL_OF_DISCIPLES: "bg-[#EDE9FE] dark:bg-purple-900/30 text-[#7C3AED] dark:text-purple-400",
  SCHOOL_OF_MINISTRY: "bg-[#FEF9C3] dark:bg-yellow-900/30 text-[#CA8A04] dark:text-yellow-300",
};

function getStatus(dateStr?: string): "Upcoming" | "Completed" {
  if (!dateStr) return "Upcoming";
  return new Date(dateStr) > new Date() ? "Upcoming" : "Completed";
}

const STATUS_BADGE: Record<string, string> = {
  Upcoming: "bg-[#DBEAFE] dark:bg-blue-900/30 text-[#2563EB]",
  Completed: "bg-[#F3F4F6] dark:bg-slate-700/30 text-[#6B7280] dark:text-slate-400",
};

export default function CoursesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<TrainingEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTrainingEvents()
      .then(setEvents)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load courses."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return events;
    const q = search.toLowerCase();
    return events.filter(
      (e) =>
        (e.name ?? "").toLowerCase().includes(q) ||
        (e.teacher ?? "").toLowerCase().includes(q) ||
        (CATEGORY_LABELS[e.trainingCategory ?? ""] ?? "").toLowerCase().includes(q)
    );
  }, [search, events]);

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] dark:bg-indigo-900/30">
          <GraduationCap className="h-6 w-6 text-[#000080] dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Training Courses</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Manage church training programs and courses</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchBar value={search} onChange={setSearch} onSearch={() => {}} placeholder="Search courses..." />
        </div>
        <Button
          variant="primary"
          onClick={() => router.push("/trainings/courses/add")}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Add Course
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-32 items-center justify-center text-sm text-gray-400 dark:text-slate-500">
          Loading courses…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => {
            const status = getStatus(event.date);
            const categoryLabel = CATEGORY_LABELS[event.trainingCategory ?? ""] ?? event.trainingCategory ?? "—";
            const categoryColor = CATEGORY_COLORS[event.trainingCategory ?? ""] ?? "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400";
            return (
              <div
                key={event.id}
                className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-[#000080] dark:text-indigo-400 leading-tight">
                    {event.name || categoryLabel}
                  </h3>
                  {event.isExam && (
                    <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Exam
                    </span>
                  )}
                </div>

                <span className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColor}`}>
                  {categoryLabel}
                </span>

                {event.teacher && (
                  <p className="mb-2 text-xs text-[#6B7280] dark:text-slate-400">
                    Instructor: <strong className="text-[#374151] dark:text-slate-300">{event.teacher}</strong>
                  </p>
                )}

                {event.location && (
                  <p className="mb-2 text-xs text-[#6B7280] dark:text-slate-400">
                    Venue: <strong className="text-[#374151] dark:text-slate-300">{event.location}</strong>
                  </p>
                )}

                {event.date && (
                  <p className="mb-4 text-xs text-[#6B7280] dark:text-slate-400">
                    Date: <strong className="text-[#374151] dark:text-slate-300">{new Date(event.date).toLocaleDateString()}</strong>
                  </p>
                )}

                {event.set && (
                  <p className="mb-4 text-xs text-[#6B7280] dark:text-slate-400">
                    Set: <strong className="text-[#374151] dark:text-slate-300">{event.set}</strong>
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[status]}`}>
                    {status}
                  </span>
                  <button
                    onClick={() => router.push(`/trainings/courses/${event.id}`)}
                    className="text-sm font-medium text-[#000080] dark:text-indigo-400 transition-colors hover:text-[#000066] hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
          {!loading && filtered.length === 0 && (
            <div className="col-span-3 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center text-sm text-gray-400 dark:text-slate-500">
              No courses found.
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
