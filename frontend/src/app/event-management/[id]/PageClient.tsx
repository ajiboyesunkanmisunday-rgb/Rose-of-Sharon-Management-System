"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import QRCodeModal from "@/components/user-management/QRCodeModal";
import EventBroadcastModal from "@/components/events/EventBroadcastModal";
import {
  getEvent,
  getEventFirstTimers,
  getEventEMembers,
  getEventNewConverts,
  markEMemberEventAttendance,
  cancelEvent,
  type EventResponse,
  type UserResponse,
  type NewConvertResponse,
} from "@/lib/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtEpoch(ms?: number): string {
  if (!ms) return "—";
  const d = new Date(ms);
  let h = d.getHours();
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mm} ${ap}`;
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

type Tab = "first-timers" | "e-members" | "new-converts";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EventDetailClient() {
  const router = useRouter();
  const params = useParams();
  const paramId = params.id as string;
  const [id, setId] = useState(paramId);

  // Read real ID from the browser URL — handles Netlify static rewrites where
  // the pre-built placeholder HTML is served for a real UUID path.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 1] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [event,        setEvent]        = useState<EventResponse | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [eventError,   setEventError]   = useState("");

  const [activeTab, setActiveTab] = useState<Tab>("first-timers");

  const [showDeleteModal,    setShowDeleteModal]    = useState(false);
  const [showQRModal,        setShowQRModal]        = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [cancelling,         setCancelling]         = useState(false);

  // ── First Timers state ────────────────────────────────────────────────────
  const [firstTimers,    setFirstTimers]    = useState<UserResponse[]>([]);
  const [ftLoading,      setFtLoading]      = useState(false);
  const [ftError,        setFtError]        = useState("");
  const [ftPage,         setFtPage]         = useState(0);
  const [ftTotalPages,   setFtTotalPages]   = useState(1);
  const [ftTotal,        setFtTotal]        = useState(0);

  // ── E-Members state ───────────────────────────────────────────────────────
  const [eMembers,       setEMembers]       = useState<UserResponse[]>([]);
  const [emLoading,      setEmLoading]      = useState(false);
  const [emError,        setEmError]        = useState("");
  const [emPage,         setEmPage]         = useState(0);
  const [emTotalPages,   setEmTotalPages]   = useState(1);
  const [emTotal,        setEmTotal]        = useState(0);
  const [markingId,      setMarkingId]      = useState<string | null>(null);

  // ── New Converts state ────────────────────────────────────────────────────
  const [newConverts,    setNewConverts]    = useState<NewConvertResponse[]>([]);
  const [ncLoading,      setNcLoading]      = useState(false);
  const [ncError,        setNcError]        = useState("");
  const [ncPage,         setNcPage]         = useState(0);
  const [ncTotalPages,   setNcTotalPages]   = useState(1);
  const [ncTotal,        setNcTotal]        = useState(0);

  // ── Load event ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoadingEvent(true);
    setEventError("");
    getEvent(id)
      .then(setEvent)
      .catch(err => setEventError(err instanceof Error ? err.message : "Failed to load event."))
      .finally(() => setLoadingEvent(false));
  }, [id]);

  // ── Load first timers ─────────────────────────────────────────────────────
  const loadFirstTimers = useCallback(async (page: number) => {
    setFtLoading(true);
    setFtError("");
    try {
      const res = await getEventFirstTimers(id, page, 20);
      setFirstTimers(res.content ?? []);
      setFtTotalPages(res.totalPages ?? 1);
      setFtTotal(res.totalElements ?? 0);
    } catch (err) {
      setFtError(err instanceof Error ? err.message : "Failed to load first timers.");
    } finally {
      setFtLoading(false);
    }
  }, [id]);

  // ── Load E-Members ────────────────────────────────────────────────────────
  const loadEMembers = useCallback(async (page: number) => {
    setEmLoading(true);
    setEmError("");
    try {
      const res = await getEventEMembers(id, page, 20);
      setEMembers(res.content ?? []);
      setEmTotalPages(res.totalPages ?? 1);
      setEmTotal(res.totalElements ?? 0);
    } catch (err) {
      setEmError(err instanceof Error ? err.message : "Failed to load e-members.");
    } finally {
      setEmLoading(false);
    }
  }, [id]);

  // ── Load New Converts ─────────────────────────────────────────────────────
  const loadNewConverts = useCallback(async (page: number) => {
    setNcLoading(true);
    setNcError("");
    try {
      const res = await getEventNewConverts(id, page, 20);
      setNewConverts(res.content ?? []);
      setNcTotalPages(res.totalPages ?? 1);
      setNcTotal(res.totalElements ?? 0);
    } catch (err) {
      setNcError(err instanceof Error ? err.message : "Failed to load new converts.");
    } finally {
      setNcLoading(false);
    }
  }, [id]);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "first-timers") loadFirstTimers(ftPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, ftPage]);

  useEffect(() => {
    if (activeTab === "e-members") loadEMembers(emPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, emPage]);

  useEffect(() => {
    if (activeTab === "new-converts") loadNewConverts(ncPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, ncPage]);

  // ── Mark attendance ───────────────────────────────────────────────────────
  const handleMarkAttendance = async (eMemberId: string) => {
    setMarkingId(eMemberId);
    try {
      await markEMemberEventAttendance(id, eMemberId);
      await loadEMembers(emPage);
    } catch (err) {
      setEmError(err instanceof Error ? err.message : "Failed to mark attendance.");
    } finally {
      setMarkingId(null);
    }
  };

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

  // ── Loading / error state for event ──────────────────────────────────────
  if (loadingEvent) {
    return (
      <DashboardLayout>
        <PageHeader title="Event Management" subtitle="Loading…" backHref="/event-management" />
        <div className="py-12 text-center text-sm text-gray-400">Loading event details…</div>
      </DashboardLayout>
    );
  }

  if (eventError || !event) {
    return (
      <DashboardLayout>
        <PageHeader title="Event Management" subtitle="Error" backHref="/event-management" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {eventError || "Event not found."}
          <button className="ml-2 font-medium underline" onClick={() => router.push("/event-management")}>
            Go back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "first-timers",  label: "First Timers"   },
    { key: "e-members",     label: "E-Members Attendance" },
    { key: "new-converts",  label: "New Converts"   },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Event Management"
        subtitle={event.title}
        backHref="/event-management"
      />

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
            <p className="mt-1 text-sm font-medium text-[#111827]">{event.date || "—"}</p>
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
              <p className="mt-1 text-sm font-medium text-[#111827]">
                {new Date(event.createdOn).toLocaleDateString()}
              </p>
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

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center gap-6 overflow-x-auto border-b border-[#E5E7EB]">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[#000080] text-[#000080]"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── First Timers tab ───────────────────────────────────────────────── */}
      {activeTab === "first-timers" && (
        <AttendeeTable<UserResponse>
          rows={firstTimers}
          loading={ftLoading}
          error={ftError}
          currentPage={ftPage}
          totalPages={ftTotalPages}
          totalItems={ftTotal}
          onPageChange={setFtPage}
          onRetry={() => loadFirstTimers(ftPage)}
          columns={[
            { label: "Name",   render: r => fullName(r) },
            { label: "Email",  render: r => r.email ?? "—" },
            { label: "Phone",  render: r => r.phoneNumber ?? "—" },
          ]}
          emptyText="No first timers recorded for this event."
        />
      )}

      {/* ── E-Members Attendance tab ───────────────────────────────────────── */}
      {activeTab === "e-members" && (
        <>
          {emError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {emError} — <button className="font-medium underline" onClick={() => loadEMembers(emPage)}>Retry</button>
            </div>
          )}
          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F3F4F6]">
                  <th className="px-4 py-3 text-sm font-bold text-[#000080]">Name</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-sm font-bold text-[#000080]">Email</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-sm font-bold text-[#000080]">Phone</th>
                  <th className="px-4 py-3 text-sm font-bold text-[#000080]">Attendance</th>
                  <th className="px-4 py-3"/>
                </tr>
              </thead>
              <tbody>
                {emLoading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400">Loading…</td></tr>
                ) : eMembers.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400">No e-members recorded for this event.</td></tr>
                ) : (
                  eMembers.map(em => (
                    <tr key={em.id} className="border-b border-[#F3F4F6]">
                      <td className="px-4 py-3 font-medium text-[#111827]">{fullName(em)}</td>
                      <td className="hidden sm:table-cell px-4 py-3 text-[#374151]">{em.email ?? "—"}</td>
                      <td className="hidden sm:table-cell px-4 py-3 text-[#374151]">{em.phoneNumber ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          Present
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          disabled={markingId === em.id}
                          onClick={() => handleMarkAttendance(em.id)}
                          className="rounded-lg border border-[#000080] px-3 py-1.5 text-xs font-medium text-[#000080] hover:bg-[#000080] hover:text-white disabled:opacity-50 transition-colors"
                        >
                          {markingId === em.id ? "Marking…" : "Mark Attended"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {emTotalPages > 1 && (
            <PageButtons page={emPage} totalPages={emTotalPages} total={emTotal} onChange={setEmPage} />
          )}
        </>
      )}

      {/* ── New Converts tab ───────────────────────────────────────────────── */}
      {activeTab === "new-converts" && (
        <AttendeeTable<NewConvertResponse>
          rows={newConverts}
          loading={ncLoading}
          error={ncError}
          currentPage={ncPage}
          totalPages={ncTotalPages}
          totalItems={ncTotal}
          onPageChange={setNcPage}
          onRetry={() => loadNewConverts(ncPage)}
          columns={[
            { label: "Name",           render: r => fullName(r) },
            { label: "Email",          render: r => r.email ?? "—" },
            { label: "Phone",          render: r => r.phoneNumber ?? "—" },
            { label: "Class Stage",    render: r => r.believerClassStage ?? "—" },
          ]}
          emptyText="No new converts recorded for this event."
        />
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
        value={`https://rosms.app/events/${id}/check-in`}
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

// ─── Reusable attendee table ──────────────────────────────────────────────────

interface Col<T> { label: string; render: (row: T) => string; }

function AttendeeTable<T extends { id: string }>({
  rows, loading, error, currentPage, totalPages, totalItems,
  onPageChange, onRetry, columns, emptyText,
}: {
  rows: T[];
  loading: boolean;
  error: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (p: number) => void;
  onRetry: () => void;
  columns: Col<T>[];
  emptyText: string;
}) {
  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error} — <button className="font-medium underline" onClick={onRetry}>Retry</button>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              {columns.map(c => (
                <th key={c.label} className="px-4 py-3 text-sm font-bold text-[#000080]">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length} className="py-8 text-center text-sm text-gray-400">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="py-8 text-center text-sm text-gray-400">{emptyText}</td></tr>
            ) : (
              rows.map(row => (
                <tr key={row.id} className="border-b border-[#F3F4F6]">
                  {columns.map(c => (
                    <td key={c.label} className="px-4 py-3 text-[#374151]">{c.render(row)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <PageButtons page={currentPage} totalPages={totalPages} total={totalItems} onChange={onPageChange} />
      )}
    </>
  );
}

function PageButtons({ page, totalPages, total, onChange }: {
  page: number; totalPages: number; total: number; onChange: (p: number) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-[#6B7280]">
      <span>{total} total</span>
      <div className="flex items-center gap-2">
        <button disabled={page === 0} onClick={() => onChange(page - 1)}
          className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-40">
          ‹ Prev
        </button>
        <span>Page {page + 1} of {totalPages}</span>
        <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}
          className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-40">
          Next ›
        </button>
      </div>
    </div>
  );
}
