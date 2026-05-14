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
  markEventAttendance,
  cancelEvent,
  type EventResponse,
  type UserResponse,
  type NewConvertResponse,
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

type Tab = "first-timers" | "e-members" | "new-converts";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EventDetailClient() {
  const router = useRouter();
  const params = useParams();
  const paramId = params.id as string;
  const [id, setId] = useState(paramId);

  // Read real ID from the browser URL — handles Netlify static rewrites where
  // the pre-built placeholder HTML (ev-1, ev-2…) is served for a real UUID path.
  // We always prefer the URL so the correct event is loaded.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 1] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect Netlify static placeholder IDs (ev-1, ev-2, …) — never fetch with these.
  const isPlaceholder = (v: string) => /^ev-\d+$/.test(v);

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

  // IDs currently being marked attended (first-timers and new-converts)
  const [markingFtId,    setMarkingFtId]    = useState<string | null>(null);
  const [ftAttendError,  setFtAttendError]  = useState("");
  const [markingNcId,    setMarkingNcId]    = useState<string | null>(null);
  const [ncAttendError,  setNcAttendError]  = useState("");

  // ── Load event ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // If we still have a placeholder ID, exit loading state so the page isn't
    // permanently stuck on "Loading…" while waiting for the URL effect.
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

  // Load data when tab changes — skip placeholder IDs and re-fire when id becomes a real UUID.
  useEffect(() => {
    if (!id || isPlaceholder(id)) return;
    if (activeTab === "first-timers") loadFirstTimers(ftPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, ftPage, id]);

  useEffect(() => {
    if (!id || isPlaceholder(id)) return;
    if (activeTab === "e-members") loadEMembers(emPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, emPage, id]);

  useEffect(() => {
    if (!id || isPlaceholder(id)) return;
    if (activeTab === "new-converts") loadNewConverts(ncPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, ncPage, id]);

  // ── Mark attendance (e-members) ───────────────────────────────────────────
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

  // ── Mark attendance (first-timers) ────────────────────────────────────────
  const handleMarkFtAttendance = async (userId: string) => {
    setMarkingFtId(userId);
    setFtAttendError("");
    try {
      await markEventAttendance(id, userId);
      await loadFirstTimers(ftPage);
    } catch (err) {
      setFtAttendError(err instanceof Error ? err.message : "Failed to mark attendance.");
    } finally {
      setMarkingFtId(null);
    }
  };

  // ── Mark attendance (new-converts) ────────────────────────────────────────
  const handleMarkNcAttendance = async (userId: string) => {
    setMarkingNcId(userId);
    setNcAttendError("");
    try {
      await markEventAttendance(id, userId);
      await loadNewConverts(ncPage);
    } catch (err) {
      setNcAttendError(err instanceof Error ? err.message : "Failed to mark attendance.");
    } finally {
      setMarkingNcId(null);
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
  // Show loading while fetching OR while still holding a placeholder ID
  // (the URL effect will swap it for the real UUID momentarily).
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
              <p className="mt-1 text-sm font-medium text-[#111827]">
                {fmtDate(event.createdOn)}
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
        <>
          {ftAttendError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {ftAttendError}
            </div>
          )}
          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F3F4F6]">
                  <th className="px-4 py-3 text-sm font-bold text-[#000080]">Name</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-sm font-bold text-[#000080]">Email</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-sm font-bold text-[#000080]">Phone</th>
                  <th className="px-4 py-3"/>
                </tr>
              </thead>
              <tbody>
                {ftLoading ? (
                  <tr><td colSpan={4} className="py-8 text-center text-sm text-gray-400">Loading…</td></tr>
                ) : ftError ? (
                  <tr><td colSpan={4} className="py-8 text-center text-sm text-red-500">
                    {ftError} — <button className="underline" onClick={() => loadFirstTimers(ftPage)}>Retry</button>
                  </td></tr>
                ) : firstTimers.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-sm text-gray-400">No first timers recorded for this event.</td></tr>
                ) : (
                  firstTimers.map(ft => (
                    <tr key={ft.id} className="border-b border-[#F3F4F6]">
                      <td className="px-4 py-3 font-medium text-[#111827]">{fullName(ft)}</td>
                      <td className="hidden sm:table-cell px-4 py-3 text-[#374151]">{ft.email ?? "—"}</td>
                      <td className="hidden sm:table-cell px-4 py-3 text-[#374151]">{ft.phoneNumber ?? "—"}</td>
                      <td className="px-4 py-3">
                        <button
                          disabled={markingFtId === ft.id}
                          onClick={() => handleMarkFtAttendance(ft.id)}
                          className="rounded-lg border border-[#000080] px-3 py-1.5 text-xs font-medium text-[#000080] hover:bg-[#000080] hover:text-white disabled:opacity-50 transition-colors"
                        >
                          {markingFtId === ft.id ? "Marking…" : "Mark Attended"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {ftTotalPages > 1 && (
            <PageButtons page={ftPage} totalPages={ftTotalPages} total={ftTotal} onChange={setFtPage} />
          )}
        </>
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
        <>
          {ncAttendError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {ncAttendError}
            </div>
          )}
          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F3F4F6]">
                  <th className="px-4 py-3 text-sm font-bold text-[#000080]">Name</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-sm font-bold text-[#000080]">Email</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-sm font-bold text-[#000080]">Phone</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-sm font-bold text-[#000080]">Class Stage</th>
                  <th className="px-4 py-3"/>
                </tr>
              </thead>
              <tbody>
                {ncLoading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400">Loading…</td></tr>
                ) : ncError ? (
                  <tr><td colSpan={5} className="py-8 text-center text-sm text-red-500">
                    {ncError} — <button className="underline" onClick={() => loadNewConverts(ncPage)}>Retry</button>
                  </td></tr>
                ) : newConverts.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400">No new converts recorded for this event.</td></tr>
                ) : (
                  newConverts.map(nc => (
                    <tr key={nc.id} className="border-b border-[#F3F4F6]">
                      <td className="px-4 py-3 font-medium text-[#111827]">{fullName(nc)}</td>
                      <td className="hidden sm:table-cell px-4 py-3 text-[#374151]">{nc.email ?? "—"}</td>
                      <td className="hidden sm:table-cell px-4 py-3 text-[#374151]">{nc.phoneNumber ?? "—"}</td>
                      <td className="hidden sm:table-cell px-4 py-3 text-[#374151]">{nc.believerClassStage ?? "—"}</td>
                      <td className="px-4 py-3">
                        <button
                          disabled={markingNcId === nc.id}
                          onClick={() => handleMarkNcAttendance(nc.id)}
                          className="rounded-lg border border-[#000080] px-3 py-1.5 text-xs font-medium text-[#000080] hover:bg-[#000080] hover:text-white disabled:opacity-50 transition-colors"
                        >
                          {markingNcId === nc.id ? "Marking…" : "Mark Attended"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {ncTotalPages > 1 && (
            <PageButtons page={ncPage} totalPages={ncTotalPages} total={ncTotal} onChange={setNcPage} />
          )}
        </>
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
