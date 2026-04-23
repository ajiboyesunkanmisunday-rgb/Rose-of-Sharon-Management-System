"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { trainingSchedules } from "@/lib/mock-data";
import { ScheduleStatus } from "@/lib/types";

const statusColor = (status: ScheduleStatus): string => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Upcoming":
      return "bg-blue-100 text-blue-800";
    case "Completed":
      return "bg-gray-100 text-gray-600";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function ScheduleDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [showCancelModal, setShowCancelModal] = useState(false);

  const schedule =
    trainingSchedules.find((s) => s.id === id) || trainingSchedules[0];

  const handleCancel = () => {
    console.log("Cancel schedule:", schedule.id);
    setShowCancelModal(false);
    router.push("/trainings/schedules");
  };

  const details = [
    { label: "Course", value: schedule.course },
    { label: "Instructor", value: schedule.instructor },
    { label: "Start Date", value: schedule.startDate },
    { label: "End Date", value: schedule.endDate },
    { label: "Day / Time", value: schedule.dayTime },
    { label: "Venue", value: schedule.venue },
    { label: "Capacity", value: String(schedule.capacity) },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Trainings"
        subtitle={schedule.course}
        backHref="/trainings/schedules"
      />

      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-[#111827]">{schedule.course}</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(schedule.status)}`}>
            {schedule.status}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {details.map((d) => (
            <div key={d.label}>
              <p className="text-xs font-medium text-[#6B7280]">{d.label}</p>
              <p className="mt-1 text-sm font-medium text-[#111827]">{d.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/trainings/schedules")}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => router.push(`/trainings/schedules/${id}/edit`)}
        >
          Edit
        </Button>
        <Button variant="danger" onClick={() => setShowCancelModal(true)}>
          Cancel Schedule
        </Button>
      </div>

      <DeleteConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        message="Are you sure you want to cancel this schedule?"
      />
    </DashboardLayout>
  );
}
