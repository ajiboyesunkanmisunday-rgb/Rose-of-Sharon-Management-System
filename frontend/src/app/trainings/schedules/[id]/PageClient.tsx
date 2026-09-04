"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { getTrainingEvent, deleteTrainingEvent, type TrainingEventResponse } from "@/lib/api";

const CATEGORY_LABELS: Record<string, string> = {
  BAPTISM: "Water Baptism",
  WORKERS_IN_TRAINING: "Workers in Training",
  SCHOOL_OF_DISCIPLES: "School of Disciples",
  SCHOOL_OF_MINISTRY: "School of Ministry",
};

function getStatus(dateStr?: string): "Upcoming" | "Completed" {
  if (!dateStr) return "Upcoming";
  return new Date(dateStr) > new Date() ? "Upcoming" : "Completed";
}

const STATUS_BADGE: Record<string, string> = {
  Upcoming: "bg-blue-100 text-blue-800",
  Completed: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400",
};

export default function ScheduleDetailClient() {
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getTrainingEvent(id)
      .then(setEvent)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load schedule."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteTrainingEvent(id);
      router.push("/trainings/schedules");
    } catch {
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-sm text-gray-400 dark:text-slate-500">Loading…</div>
      </DashboardLayout>
    );
  }

  if (error || !event) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-400 dark:text-slate-500">{error || "Schedule not found."}</p>
        </div>
      </DashboardLayout>
    );
  }

  const status = getStatus(event.date);
  const categoryLabel = CATEGORY_LABELS[event.trainingCategory ?? ""] ?? event.trainingCategory ?? "—";

  const details = [
    { label: "Session Name", value: event.name || categoryLabel },
    { label: "Category", value: categoryLabel },
    { label: "Instructor / Teacher", value: event.teacher || "—" },
    { label: "Date", value: event.date ? new Date(event.date).toLocaleDateString() : "—" },
    { label: "Venue / Location", value: event.location || "—" },
    { label: "Set", value: event.set || "—" },
    { label: "Exam Session", value: event.isExam ? "Yes" : "No" },
  ];

  return (
    <DashboardLayout>
      <PageHeader title="Trainings" subtitle={event.name || categoryLabel} backHref="/trainings/schedules" />

      <div className="mb-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold text-[#111827] dark:text-slate-100">{event.name || categoryLabel}</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[status]}`}>
            {status}
          </span>
          {event.isExam && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">Exam</span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {details.map((d) => (
            <div key={d.label}>
              <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">{d.label}</p>
              <p className="mt-1 text-sm font-medium text-[#111827] dark:text-slate-100">{d.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/trainings/schedules")}>Back</Button>
        <Button variant="primary" onClick={() => router.push(`/trainings/schedules/${id}/edit`)}>Edit</Button>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete</Button>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this training schedule?"
      />
    </DashboardLayout>
  );
}
