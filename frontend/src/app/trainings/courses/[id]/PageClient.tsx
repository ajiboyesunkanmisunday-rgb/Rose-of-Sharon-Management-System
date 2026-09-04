"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getTrainingEvent, type TrainingEventResponse } from "@/lib/api";

const CATEGORY_LABELS: Record<string, string> = {
  BAPTISM: "Water Baptism",
  WORKERS_IN_TRAINING: "Workers in Training",
  SCHOOL_OF_DISCIPLES: "School of Disciples",
  SCHOOL_OF_MINISTRY: "School of Ministry",
};

const STATUS_BADGE: Record<string, string> = {
  Upcoming: "bg-[#DBEAFE] dark:bg-blue-900/30 text-[#2563EB]",
  Completed: "bg-[#F3F4F6] dark:bg-slate-700/30 text-[#6B7280] dark:text-slate-400",
};

function getStatus(dateStr?: string): "Upcoming" | "Completed" {
  if (!dateStr) return "Upcoming";
  return new Date(dateStr) > new Date() ? "Upcoming" : "Completed";
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const paramId = params.id as string;

  const [id, setId] = useState(paramId);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 1] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [event, setEvent] = useState<TrainingEventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getTrainingEvent(id)
      .then(setEvent)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load course."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-sm text-gray-400 dark:text-slate-500">
          Loading…
        </div>
      </DashboardLayout>
    );
  }

  if (error || !event) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-400 dark:text-slate-500">{error || "Course not found."}</p>
        </div>
      </DashboardLayout>
    );
  }

  const status = getStatus(event.date);
  const categoryLabel = CATEGORY_LABELS[event.trainingCategory ?? ""] ?? event.trainingCategory ?? "—";

  const details = [
    { label: "Course Name", value: event.name || categoryLabel },
    { label: "Category", value: categoryLabel },
    { label: "Instructor / Teacher", value: event.teacher || "—" },
    { label: "Date", value: event.date ? new Date(event.date).toLocaleDateString() : "—" },
    { label: "Venue / Location", value: event.location || "—" },
    { label: "Set", value: event.set || "—" },
    { label: "Exam Session", value: event.isExam ? "Yes" : "No" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/trainings/courses")}
            className="flex items-center text-[#000080] dark:text-indigo-400 transition-colors hover:text-[#000066]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-[#000080] dark:text-indigo-400">
            {event.name || categoryLabel}
          </h2>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[status]}`}>
            {status}
          </span>
          {event.isExam && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
              Exam
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {details.map((d) => (
            <div key={d.label}>
              <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">{d.label}</p>
              <p className="mt-1 text-sm font-semibold text-[#111827] dark:text-slate-100">{d.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={() => router.push("/trainings/courses")}
          className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-[#374151] dark:text-slate-300 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:bg-slate-700/50"
        >
          Back
        </button>
      </div>
    </DashboardLayout>
  );
}
