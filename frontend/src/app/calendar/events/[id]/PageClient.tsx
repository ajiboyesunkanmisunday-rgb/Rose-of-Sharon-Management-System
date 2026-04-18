"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { calendarEvents } from "@/lib/mock-data";
import { CalendarEventCategory } from "@/lib/types";

const categoryColors: Record<CalendarEventCategory, string> = {
  Service: "bg-[#000080] text-white",
  "Bible Study": "bg-green-500 text-white",
  Youth: "bg-purple-500 text-white",
  Birthday: "bg-orange-500 text-white",
  Meeting: "bg-yellow-500 text-white",
  Other: "bg-gray-500 text-white",
};

export default function CalendarEventDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const event = calendarEvents.find((e) => e.id === id) || calendarEvents[0];

  const handleDelete = () => {
    console.log("Delete calendar event:", event.id);
    setShowDeleteModal(false);
    router.push("/calendar");
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Calendar"
        subtitle={event.name}
        backHref="/calendar"
      />

      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${categoryColors[event.category]}`}>
          {event.category}
        </span>
        <h2 className="mt-3 text-xl font-bold text-[#111827]">{event.name}</h2>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Date</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Time</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{event.time}</p>
          </div>
          {event.location && (
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Location</p>
              <p className="mt-1 text-sm font-medium text-[#111827]">{event.location}</p>
            </div>
          )}
        </div>

        {event.description && (
          <div className="mt-6 border-t border-[#F3F4F6] pt-4">
            <p className="text-xs font-medium text-[#6B7280]">Description</p>
            <p className="mt-1 text-sm text-[#374151]">{event.description}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/calendar")}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => router.push(`/calendar/events/${id}/edit`)}
        >
          Edit
        </Button>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Delete
        </Button>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this event?"
      />
    </DashboardLayout>
  );
}
