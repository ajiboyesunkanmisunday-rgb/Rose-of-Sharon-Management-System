"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { getEvent, cancelEvent, type EventResponse } from "@/lib/api";

const categoryColors: Record<string, string> = {
  Service: "bg-[#000080] text-white",
  "Bible Study": "bg-green-500 text-white",
  Youth: "bg-purple-500 text-white",
  Birthday: "bg-orange-500 text-white",
  Meeting: "bg-yellow-500 text-white",
  Other: "bg-gray-500 text-white",
  SERVICE: "bg-[#000080] text-white",
  SPECIAL_SERVICE: "bg-purple-500 text-white",
  CONFERENCE: "bg-indigo-500 text-white",
  WEDDING: "bg-pink-500 text-white",
  FUNERAL: "bg-gray-500 text-white",
};

function fmtEpoch(ms?: number): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function CalendarEventDetailClient() {
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

  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadEvent = useCallback(async () => {
    if (!id || id.startsWith("cal-")) return;
    setLoading(true);
    setError("");
    try {
      const data = await getEvent(id);
      setEvent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load event.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadEvent(); }, [loadEvent]);

  const handleDelete = async () => {
    setCancelling(true);
    try {
      await cancelEvent(id);
    } catch {
      // ignore — navigate away anyway
    } finally {
      setCancelling(false);
      setShowDeleteModal(false);
      router.push("/calendar");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageHeader title="Calendar" subtitle="Loading…" backHref="/calendar" />
        <div className="py-12 text-center text-sm text-gray-400">Loading event details…</div>
      </DashboardLayout>
    );
  }

  if (error || !event) {
    return (
      <DashboardLayout>
        <PageHeader title="Calendar" subtitle="Error" backHref="/calendar" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Event not found."}
          <button className="ml-2 font-medium underline" onClick={loadEvent}>Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  const category = event.eventCategory ?? "";
  const date = event.date
    ? new Date(event.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";
  const timeRange = event.startTime
    ? `${fmtEpoch(event.startTime)}${event.endTime ? ` – ${fmtEpoch(event.endTime)}` : ""}`
    : "—";
  const location = [event.street, event.city, event.state].filter(Boolean).join(", ") || event.virtualMeetingLink || "";

  return (
    <DashboardLayout>
      <PageHeader
        title="Calendar"
        subtitle={event.title}
        backHref="/calendar"
      />

      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${categoryColors[category] ?? "bg-gray-500 text-white"}`}>
          {category.replace(/_/g, " ")}
        </span>
        <h2 className="mt-3 text-xl font-bold text-[#111827]">{event.title}</h2>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Date</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{date}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Time</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{timeRange}</p>
          </div>
          {location && (
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Location</p>
              <p className="mt-1 text-sm font-medium text-[#111827]">{location}</p>
            </div>
          )}
          {event.preacher && (
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Preacher / Speaker</p>
              <p className="mt-1 text-sm font-medium text-[#111827]">{event.preacher}</p>
            </div>
          )}
          {event.topic && (
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Topic</p>
              <p className="mt-1 text-sm font-medium text-[#111827]">{event.topic}</p>
            </div>
          )}
        </div>

        {event.additionalInstructions && (
          <div className="mt-6 border-t border-[#F3F4F6] pt-4">
            <p className="text-xs font-medium text-[#6B7280]">Description</p>
            <p className="mt-1 text-sm text-[#374151]">{event.additionalInstructions}</p>
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
        <Button variant="danger" onClick={() => setShowDeleteModal(true)} disabled={cancelling}>
          {cancelling ? "Cancelling…" : "Delete"}
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
