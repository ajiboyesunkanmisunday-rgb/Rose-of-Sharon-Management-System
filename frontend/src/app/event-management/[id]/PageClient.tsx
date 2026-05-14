"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import QRCodeModal from "@/components/user-management/QRCodeModal";
import EventBroadcastModal from "@/components/events/EventBroadcastModal";
import {
  getEvent,
  cancelEvent,
  type EventResponse,
  type UserResponse,
} from "@/lib/api";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { SkeletonProfile } from "@/components/ui/Skeleton";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtEpoch(ms?: number | string | null): string {
  const n = Number(ms);
  if (!ms || isNaN(n) || n === 0) return "—";
  const d = new Date(n);
  if (isNaN(d.getTime())) return "—";
  let h = d.getHours();
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mm} ${ap}`;
}

function fmtDate(raw?: string | null): string {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fullName(u: { firstName?: string; middleName?: string; lastName?: string }) {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

const categoryColors: Record<string, string> = {
  SERVICE:         "bg-blue-100 text-blue-800",
  SPECIAL_SERVICE: "bg-purple-100 text-purple-800",
  CONFERENCE:      "bg-indigo-100 text-indigo-800",
  WEDDING:         "bg-pink-100 text-pink-800",
  FUNERAL:         "bg-gray-100 text-gray-600",
};

type Tab = "first-timers" | "second-timers";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EventDetailClient() {
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

  const isPlaceholder = (v: string) => /^ev-\d+$/.test(v);

  const [event,        setEvent]        = useState<EventResponse | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [eventError,   setEventError]   = useState("");

  const [activeTab, setActiveTab] = useState<Tab>("first-timers");

  const [showDeleteModal,    setShowDeleteModal]    = useState(false);
  const [showQRModal,        setShowQRModal]        = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [cancelling,         setCancelling]         = useState(false);

  // ── Load event ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || isPlaceholder(id)) {
      setLoadingEvent(false);
      return;
    }
    setLoadingEvent(true);
    setEventError("");
    getEvent(id)
      .then(setEvent)
      .catch(err => setEventError(err instanceof Error ? err.message : "Failed to load event."))
      .finally(() => setLoadingEvent(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Cancel event ──────────────────────────────────────────────────────────
  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelEvent(id);
      setShowDeleteModal(false);
      router.push("/event-management");
    } catch (err) {
      setEventError(err instanceof Error ? err.message : "Failed to cancel event.");
      setShowDeleteModal(false);
    } finally {
      setCancelling(false);
    }
  };

  // ── Attendee data comes directly from the event response ──────────────────
  // event.firstTimers  = first-timers who registered on this event's date
  // event.secondTimers = second-timers who returned on this event's date
  const firstTimers:  UserResponse[] = event?.firstTimers  ?? [];
  const secondTimers: UserResponse[] = event?.secondTimers ?? [];

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loadingEvent || isPlaceholder(id)) {
    return (
      <DashboardLayout>
        <PageHeader title="Event Management" subtitle="Loading…" backHref="/event-management" />
        <SkeletonProfile />
      </DashboardLayout>
    );
  }

  if (eventError || !event) {
    return (
      <DashboardLayout>
        <PageHeader title="Event Management" subtitle="Event Not Found" backHref="/event-management" />
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-6 text-sm text-red-700">
          <p className="font-medium text-base mb-1">Unable to load event</p>
          <p className="text-red-600">{eventError || "This event could not be found or may have been removed."}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => {
              setEventError("");
              setLoadingEvent(true);
              getEvent(id)
                .then(setEvent)
                .catch(err => setEventError(err instanceof Error ? err.message : "Failed to load event."))
                .finally(() => setLoadingEvent(false));
            }}>
              Retry
            </Button>
            <Button variant="secondary" onClick={() => router.push("/event-management")}>
              Back to Events
            </Button>
            <Button variant="primary" onClick={() => router.push("/event-management/add")}>
              Create New Event
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "first-timers",  label: "First Timers",  count: firstTimers.length  },
    { key: "second-timers", label: "Second Timers", count: secondTimers.length },
  ];

  const activeRows = activeTab === "first-timers" ? firstTimers : secondTimers;

  return (
    <DashboardLayout>
      <PageHeader
        title="Event Management"
        subtitle={event.title}
        backHref="/event-management"
      />
      <Breadcrumbs items={[
        { label: "Event Management", href: "/event-management" },
        { label: event.title },
      ]} />

      {/* ── Event info card ──────────────────────────────────────────────── */}
      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {event.isCanceled ? (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">Cancelled</span>
              ) : (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">Active</span>
              )}
              {event.eventCategory && (
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${categoryColors[event.eventCategory] ?? "bg-gray-100 text-gray-600"}`}>
                  {event.eventCategory.replace(/_/g, " ")}
                </span>
              )}
              {event.locationType && (
                <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#374151]">
                  {event.locationType.charAt(0) + event.locationType.slice(1).toLowerCase()}
                </span>
              )}
              {event.requiresRegistration && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
                  Registration required
                </span>
              )}
            </div>
            <h2 className="mt-3 text-xl font-bold text-[#111827]">{event.title}</h2>
            {event.topic && (
              <p className="mt-1 text-sm text-[#6B7280]">
                Topic: <span className="font-medium text-[#374151]">{event.topic}</span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => setShowBroadcastModal(true)}>Broadcast</Button>
            <Button variant="secondary" onClick={() => setShowQRModal(true)}>QR Code</Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Date</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{fmtDate(event.date)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Start Time</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{fmtEpoch(event.startTime)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">End Time</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{fmtEpoch(event.endTime)}</p>
          </div>
          {event.preacher && (
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Preacher / Speaker</p>
              <p className="mt-1 text-sm font-medium text-[#111827]">{event.preacher}</p>
            </div>
          )}
          {(event.city || event.state) && (
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Location</p>
              <p className="mt-1 text-sm font-medium text-[#111827]">
                {[event.street, event.city, event.state].filter(Boolean).join(", ")}
              </p>
            </div>
          )}
          {event.virtualMeetingLink && (
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Virtual Link</p>
              <a href={event.virtualMeetingLink} target="_blank" rel="noopener noreferrer"
                className="mt-1 block text-sm font-medium text-[#000080] underline truncate">
                {event.virtualMeetingLink}
              </a>
            </div>
          )}
          {event.createdOn && (
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Created</p>
              <p className="mt-1 text-sm font-medium text-[#111827]">{fmtDate(event.createdOn)}</p>
            </div>
          )}
        </div>

        {event.additionalInstructions && (
          <div className="mt-4 border-t border-[#F3F4F6] pt-4">
            <p className="text-xs font-medium text-[#6B7280]">Additional Information</p>
            <p className="mt-1 text-sm text-[#374151]">{event.additionalInstructions}</p>
          </div>
        )}
      </div>

      {/* ── Attendance header ────────────────────────────────────────────── */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-bold text-[#111827]">Attendance</h3>
        <p className="text-xs text-[#6B7280]">
          Showing visitors registered on <span className="font-medium">{fmtDate(event.date)}</span>
        </p>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="mb-4 flex items-center gap-6 overflow-x-auto border-b border-[#E5E7EB]">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[#000080] text-[#000080]"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            {tab.label}
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              activeTab === tab.key ? "bg-[#000080] text-white" : "bg-[#F3F4F6] text-[#6B7280]"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Attendee table ────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-3 text-sm font-bold text-[#000080]">Name</th>
              <th className="hidden sm:table-cell px-4 py-3 text-sm font-bold text-[#000080]">Phone</th>
              <th className="hidden sm:table-cell px-4 py-3 text-sm font-bold text-[#000080]">Email</th>
              <th className="hidden md:table-cell px-4 py-3 text-sm font-bold text-[#000080]">
                {activeTab === "first-timers" ? "First Visit" : "Second Visit"}
              </th>
              <th className="px-4 py-3 text-sm font-bold text-[#000080]">Status</th>
            </tr>
          </thead>
          <tbody>
            {activeRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <p className="text-sm text-[#9CA3AF]">
                      No {activeTab === "first-timers" ? "first timers" : "second timers"} recorded for this event.
                    </p>
                    <p className="text-xs text-[#C4C4C4]">
                      {activeTab === "first-timers" ? "First timers" : "Second timers"} who registered on {fmtDate(event.date)} will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              activeRows.map((person) => {
                const serviceDate = activeTab === "first-timers"
                  ? person.firstTimeService?.date
                  : person.secondTimeService?.date;
                return (
                  <tr
                    key={person.id}
                    className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/user-management/${activeTab}/${person.id}`)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#111827]">{fullName(person)}</p>
                      <p className="text-xs text-[#9CA3AF] sm:hidden">{person.phoneNumber ?? "—"}</p>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-[#374151]">{person.phoneNumber ?? "—"}</td>
                    <td className="hidden sm:table-cell px-4 py-3 text-[#374151]">{person.email ?? "—"}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-[#374151]">
                      {serviceDate ? fmtDate(serviceDate) : fmtDate(event.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                        ✓ Attended
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Summary strip ────────────────────────────────────────────────── */}
      {activeRows.length > 0 && (
        <p className="mt-3 text-xs text-[#9CA3AF]">
          {activeRows.length} {activeTab === "first-timers" ? "first timer" : "second timer"}{activeRows.length !== 1 ? "s" : ""} attended this event.
        </p>
      )}

      {/* ── Footer actions ───────────────────────────────────────────────── */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/event-management")}>
          Back
        </Button>
        <Button variant="primary" onClick={() => router.push(`/event-management/${id}/edit`)}>
          Edit
        </Button>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)} disabled={cancelling}>
          Cancel Event
        </Button>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleCancel}
        message="Are you sure you want to cancel this event? Attendees will be notified."
      />
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        value={`/events/${id}/check-in`}
        title="Event Check-in QR Code"
      />
      <EventBroadcastModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        eventName={event.title}
      />
    </DashboardLayout>
  );
}
