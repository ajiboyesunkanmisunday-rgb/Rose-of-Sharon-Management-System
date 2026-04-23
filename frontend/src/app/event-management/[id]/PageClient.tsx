"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import QRCodeModal from "@/components/user-management/QRCodeModal";
import EventBroadcastModal from "@/components/events/EventBroadcastModal";
import { allEvents } from "@/lib/mock-data";
import { EventStatus, EventType } from "@/lib/types";

const typeColors: Record<EventType, string> = {
  Virtual: "bg-blue-100 text-blue-800",
  Hybrid: "bg-purple-100 text-purple-800",
  Physical: "bg-green-100 text-green-800",
};

type Tab = "attendees" | "schedule";

const statusColors: Record<EventStatus, string> = {
  Upcoming: "bg-blue-100 text-blue-800",
  Ongoing: "bg-green-100 text-green-800",
  Completed: "bg-gray-100 text-gray-600",
  Cancelled: "bg-red-100 text-red-800",
};

const mockAttendees = [
  { id: "a-1", name: "John Michael", email: "john123@gmail.com", phone: "08011252365", registeredDate: "04/05/2026", checkedIn: true },
  { id: "a-2", name: "Sarah Bamidele", email: "sarah345@gmail.com", phone: "09037311234", registeredDate: "04/06/2026", checkedIn: true },
  { id: "a-3", name: "David Okonkwo", email: "david@gmail.com", phone: "08023456789", registeredDate: "04/07/2026", checkedIn: false },
  { id: "a-4", name: "Grace Adeyemi", email: "grace@gmail.com", phone: "08034567890", registeredDate: "04/08/2026", checkedIn: true },
  { id: "a-5", name: "Emmanuel Nwosu", email: "emm@gmail.com", phone: "08045678901", registeredDate: "04/09/2026", checkedIn: false },
];

export default function EventDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("attendees");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  const event = allEvents.find((e) => e.id === id) || allEvents[0];

  const handleDelete = () => {
    console.log("Delete event:", event.id);
    setShowDeleteModal(false);
    router.push("/event-management");
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "attendees", label: `Attendees (${event.attendees})` },
    { key: "schedule", label: "Schedule" },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Event Management"
        subtitle={event.name}
        backHref="/event-management"
      />

      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[event.status]}`}>
                {event.status}
              </span>
              <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#374151]">
                {event.category}
              </span>
              {event.type && (
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${typeColors[event.type]}`}>
                  {event.type}
                </span>
              )}
              {event.requiresRegistration && (
                <span className="rounded-full bg-[#B5B5F3]/30 px-3 py-1 text-xs font-medium text-[#000080]">
                  Registration required
                </span>
              )}
            </div>
            <h2 className="mt-3 text-xl font-bold text-[#111827]">{event.name}</h2>
            {event.topic && (
              <p className="mt-1 text-sm text-[#6B7280]">Topic: <span className="font-medium text-[#374151]">{event.topic}</span></p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => setShowBroadcastModal(true)}>
              Broadcast
            </Button>
            <Button variant="secondary" onClick={() => setShowQRModal(true)}>
              QR Code
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Event Date</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{event.eventDate || event.date}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Time</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{event.startTime} – {event.endTime}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Location</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{event.location}</p>
          </div>
          {event.createdDate && (
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Created Date</p>
              <p className="mt-1 text-sm font-medium text-[#111827]">{event.createdDate}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Capacity</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{event.capacity.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Attendees</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{event.attendees.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Created By</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{event.createdBy}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-[#F3F4F6] pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Expected Attendance Breakdown</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-[#F9FAFB] p-3">
              <p className="text-xs text-[#6B7280]">New Converts</p>
              <p className="mt-1 text-lg font-bold text-[#000080]">{event.newConvertsCount ?? 0}</p>
            </div>
            <div className="rounded-lg bg-[#F9FAFB] p-3">
              <p className="text-xs text-[#6B7280]">First Timers</p>
              <p className="mt-1 text-lg font-bold text-[#000080]">{event.firstTimersCount ?? 0}</p>
            </div>
            <div className="rounded-lg bg-[#F9FAFB] p-3">
              <p className="text-xs text-[#6B7280]">Second Timers</p>
              <p className="mt-1 text-lg font-bold text-[#000080]">{event.secondTimersCount ?? 0}</p>
            </div>
            <div className="rounded-lg bg-[#F9FAFB] p-3">
              <p className="text-xs text-[#6B7280]">E-Members</p>
              <p className="mt-1 text-lg font-bold text-[#000080]">{event.eMembersCount ?? 0}</p>
            </div>
          </div>
        </div>

        {event.description && (
          <div className="mt-6 border-t border-[#F3F4F6] pt-4">
            <p className="text-xs font-medium text-[#6B7280]">Description</p>
            <p className="mt-1 text-sm text-[#374151]">{event.description}</p>
          </div>
        )}
      </div>

      <div className="mb-6 flex items-center gap-8 border-b border-[#E5E7EB]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[#000080] text-[#000080]"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "attendees" && (
        <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#F3F4F6]">
                <th className="px-4 py-3 text-sm font-bold text-[#000080]">Name</th>
                <th className="hidden sm:table-cell px-4 py-3 text-sm font-bold text-[#000080]">Email</th>
                <th className="hidden sm:table-cell px-4 py-3 text-sm font-bold text-[#000080]">Phone</th>
                <th className="px-4 py-3 text-sm font-bold text-[#000080]">Registered</th>
                <th className="px-4 py-3 text-sm font-bold text-[#000080]">Check-in</th>
              </tr>
            </thead>
            <tbody>
              {mockAttendees.map((a) => (
                <tr key={a.id} className="border-b border-[#F3F4F6]">
                  <td className="px-4 py-3 font-medium text-[#111827]">{a.name}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-[#374151]">{a.email}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-[#374151]">{a.phone}</td>
                  <td className="px-4 py-3 text-[#374151]">{a.registeredDate}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${a.checkedIn ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {a.checkedIn ? "Checked in" : "Not yet"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "schedule" && (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#000080] px-3 py-1 text-xs font-semibold text-white">
                {event.startTime}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">Event begins</p>
                <p className="text-xs text-[#6B7280]">Welcome and opening remarks</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#000080] px-3 py-1 text-xs font-semibold text-white">
                {event.endTime}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">Event ends</p>
                <p className="text-xs text-[#6B7280]">Closing and fellowship</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/event-management")}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => router.push(`/event-management/${id}/edit`)}
        >
          Edit
        </Button>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Cancel Event
        </Button>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to cancel this event? Attendees will be notified."
      />

      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        value={`https://rosms.app/events/${event.id}/check-in`}
        title="Event Check-in QR Code"
      />

      <EventBroadcastModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        eventName={event.name}
      />
    </DashboardLayout>
  );
}
