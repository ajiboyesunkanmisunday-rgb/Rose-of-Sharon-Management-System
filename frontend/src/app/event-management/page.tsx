"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { getEvents, searchEvents, cancelEvent, type EventResponse } from "@/lib/api";
import { CalendarClock } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { SkeletonRow } from "@/components/ui/Skeleton";

const ITEMS_PER_PAGE = 10;

const categoryColors: Record<string, string> = {
  SERVICE: "bg-blue-100 text-blue-800",
  SPECIAL_SERVICE: "bg-indigo-100 text-indigo-800",
  CONFERENCE: "bg-purple-100 text-purple-800",
  WEDDING: "bg-pink-100 text-pink-800",
  FUNERAL: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400",
};

const locationTypeColors: Record<string, string> = {
  VIRTUAL: "bg-blue-100 text-blue-800",
  HYBRID: "bg-purple-100 text-purple-800",
  PHYSICAL: "bg-green-100 text-green-800",
};

function categoryLabel(cat?: string): string {
  if (!cat) return "—";
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function locationLabel(event: EventResponse): string {
  if (event.locationType === "VIRTUAL") return "Virtual";
  const parts = [event.city, event.state].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

function fmtDate(raw?: string | null): string {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw; // fallback to raw if unparseable
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const EVENT_CATEGORIES = [
  { value: "",               label: "All Categories" },
  { value: "SERVICE",        label: "Service" },
  { value: "SPECIAL_SERVICE",label: "Special Service" },
  { value: "CONFERENCE",     label: "Conference" },
  { value: "WEDDING",        label: "Wedding" },
  { value: "FUNERAL",        label: "Funeral" },
];

export default function EventManagementPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [events, setEvents] = useState<EventResponse[]>([]);
  const [allEvents, setAllEvents] = useState<EventResponse[]>([]); // for client-side filter
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // ── Filters ──────────────────────────────────────────────────────────────
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom, setDateFrom]             = useState("");
  const [dateTo, setDateTo]                 = useState("");

  const fetchEvents = useCallback(async (page: number, query: string) => {
    setLoading(true);
    setApiError("");
    try {
      let res;
      if (query.trim()) {
        res = await searchEvents(query.trim(), page - 1, ITEMS_PER_PAGE);
      } else {
        res = await getEvents(page - 1, ITEMS_PER_PAGE);
      }
      setAllEvents(res.content ?? []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.totalElements || 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load events.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply client-side category + date filters
  useEffect(() => {
    let filtered = allEvents;
    if (categoryFilter) {
      filtered = filtered.filter((e) => e.eventCategory === categoryFilter);
    }
    if (dateFrom) {
      filtered = filtered.filter((e) => e.date && e.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter((e) => e.date && e.date <= dateTo);
    }
    setEvents(filtered);
  }, [allEvents, categoryFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchEvents(currentPage, search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchEvents(1, search);
  };

  const handleCancelClick = (id: string) => {
    setSelectedId(id);
    setCancelError("");
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedId) return;
    setCancelling(true);
    setCancelError("");
    try {
      await cancelEvent(selectedId);
      setShowCancelModal(false);
      setSelectedId(null);
      addToast("Event cancelled successfully.", "success");
      fetchEvents(currentPage, search);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to cancel event.";
      setCancelError(msg);
      addToast(msg, "error");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDE9FE] dark:bg-purple-900/30">
          <CalendarClock className="h-6 w-6 text-[#7C3AED] dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Event Management</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Create, manage, and track church events and services</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-64">
          <SearchBar
            value={search}
            onChange={(val) => setSearch(val)}
            onSearch={handleSearch}
            placeholder="Search events..."
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-[#374151] dark:text-slate-300 dark:text-slate-100 outline-none focus:border-[#000080] dark:focus:border-indigo-500 focus:ring-1 focus:ring-[#000080] dark:focus:ring-indigo-500"
          >
            {EVENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-[#374151] dark:text-slate-300 dark:text-slate-100 outline-none focus:border-[#000080] dark:focus:border-indigo-500 focus:ring-1 focus:ring-[#000080] dark:focus:ring-indigo-500"
            title="From date"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-[#374151] dark:text-slate-300 dark:text-slate-100 outline-none focus:border-[#000080] dark:focus:border-indigo-500 focus:ring-1 focus:ring-[#000080] dark:focus:ring-indigo-500"
            title="To date"
          />
          {(categoryFilter || dateFrom || dateTo) && (
            <button
              onClick={() => { setCategoryFilter(""); setDateFrom(""); setDateTo(""); }}
              className="text-xs text-[#6B7280] dark:text-slate-400 hover:text-red-500 underline"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV */}
          <button
            onClick={() => {
              const rows = [
                ["Title", "Date", "Category", "Location", "Preacher", "Status"],
                ...events.map((e) => [
                  e.title,
                  e.date ?? "",
                  e.eventCategory ?? "",
                  e.locationType === "VIRTUAL" ? "Virtual" : [e.city, e.state].filter(Boolean).join(", "),
                  e.preacher ?? "",
                  e.isCanceled ? "Cancelled" : "Active",
                ]),
              ];
              const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "events.csv"; a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm font-medium text-[#374151] dark:text-slate-300 dark:text-slate-200 hover:bg-[#F3F4F6] dark:bg-slate-700/30 dark:hover:bg-slate-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export CSV
          </button>
          <Button
            variant="primary"
            onClick={() => router.push("/event-management/add")}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          >
            Create Event
          </Button>
        </div>
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={() => fetchEvents(currentPage, search)}>
            Retry
          </button>
        </div>
      )}

      {/* Mobile card view */}
      <div className="sm:hidden space-y-3 mb-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-2">
              <div className="skeleton h-4 w-40" /><div className="skeleton h-3 w-24" />
            </div>
          ))
        ) : events.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-8">No events found.</p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              onClick={() => router.push(`/event-management/${event.id}`)}
              className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 cursor-pointer hover:bg-gray-50 dark:bg-slate-700/50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDE9FE] dark:bg-purple-900/30">
                <CalendarClock className="h-5 w-5 text-[#7C3AED] dark:text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#111827] dark:text-slate-100 truncate">{event.title}</p>
                <p className="text-xs text-[#6B7280] dark:text-slate-400">{fmtDate(event.date)} · {locationLabel(event)}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[event.eventCategory ?? ""] ?? "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400"}`}>
                    {categoryLabel(event.eventCategory)}
                  </span>
                  {event.isCanceled ? (
                    <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Cancelled</span>
                  ) : (
                    <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Active</span>
                  )}
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <ActionDropdown
                  actions={[
                    { label: "View", onClick: () => router.push(`/event-management/${event.id}`) },
                    { label: "Edit", onClick: () => router.push(`/event-management/${event.id}/edit`) },
                    ...(event.isCanceled ? [] : [{ label: "Cancel Event", onClick: () => handleCancelClick(event.id) }]),
                  ]}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Table — hidden on mobile */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] dark:bg-slate-700/30">
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Event Title</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Date</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Location</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Category</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Type</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Preacher</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Status</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} columns={8} />)
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">No events found.</td>
              </tr>
            ) : (
              events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-[#F3F4F6] dark:border-slate-700 transition-colors hover:bg-gray-50 dark:bg-slate-700/50 dark:hover:bg-slate-700/50 cursor-pointer"
                  style={{ height: "56px" }}
                  onClick={() => router.push(`/event-management/${event.id}`)}
                >
                  <td className="px-4 py-3 text-sm font-medium text-[#374151] dark:text-slate-300">{event.title}</td>
                  <td className="px-4 py-3 text-sm text-[#374151] dark:text-slate-300">{fmtDate(event.date)}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">
                    {locationLabel(event)}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${categoryColors[event.eventCategory ?? ""] ?? "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400"}`}>
                      {categoryLabel(event.eventCategory)}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3">
                    {event.locationType ? (
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${locationTypeColors[event.locationType] ?? "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400"}`}>
                        {event.locationType.charAt(0) + event.locationType.slice(1).toLowerCase()}
                      </span>
                    ) : (
                      <span className="text-xs text-[#9CA3AF] dark:text-slate-500">—</span>
                    )}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">
                    {event.preacher ?? <span className="text-[#9CA3AF] dark:text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {event.isCanceled ? (
                      <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                        Cancelled
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <ActionDropdown
                      actions={[
                        { label: "View",  onClick: () => router.push(`/event-management/${event.id}`) },
                        { label: "Edit",  onClick: () => router.push(`/event-management/${event.id}/edit`) },
                        ...(event.isCanceled ? [] : [{ label: "Cancel Event", onClick: () => handleCancelClick(event.id) }]),
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={(p) => { setCurrentPage(p); fetchEvents(p, search); }}
        />
      </div>

      <DeleteConfirmModal
        isOpen={showCancelModal}
        onClose={() => { setShowCancelModal(false); setCancelError(""); }}
        onConfirm={handleConfirmCancel}
        message={
          cancelError
            ? `Error: ${cancelError} — Click confirm to try again.`
            : "Are you sure you want to cancel this event? Attendees will be notified."
        }
        confirmLabel={cancelling ? "Cancelling…" : "Cancel Event"}
        confirmDisabled={cancelling}
      />
    </DashboardLayout>
  );
}
