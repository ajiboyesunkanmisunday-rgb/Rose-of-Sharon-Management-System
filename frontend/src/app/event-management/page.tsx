"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { getEvents, type EventResponse } from "@/lib/api";

const ITEMS_PER_PAGE = 10;

const statusColors: Record<string, string> = {
  Upcoming: "bg-blue-100 text-blue-800",
  Ongoing: "bg-green-100 text-green-800",
  Completed: "bg-gray-100 text-gray-600",
  Cancelled: "bg-red-100 text-red-800",
};

const typeColors: Record<string, string> = {
  Virtual: "bg-blue-100 text-blue-800",
  Hybrid: "bg-purple-100 text-purple-800",
  Physical: "bg-green-100 text-green-800",
};

export default function EventManagementPage() {
  const router = useRouter();

  // Data
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // UI state
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchEvents = useCallback(async (page: number) => {
    setLoading(true);
    setApiError("");
    try {
      const res = await getEvents(page - 1, ITEMS_PER_PAGE);
      setEvents(res.content);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.totalElements || 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load events.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage, fetchEvents]);

  const displayedEvents = search.trim()
    ? events.filter((e) => {
        const q = search.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          (e.location ?? "").toLowerCase().includes(q) ||
          (e.category ?? "").toLowerCase().includes(q)
        );
      })
    : events;

  const handleCancelClick = (id: string) => {
    setSelectedId(id);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    console.log("Cancel event:", selectedId);
    setShowCancelModal(false);
    setSelectedId(null);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Event Management</h1>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={(val) => { setSearch(val); setCurrentPage(1); }}
            onSearch={() => setCurrentPage(1)}
            placeholder="Search events..."
          />
        </div>
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

      {/* Error banner */}
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={() => fetchEvents(currentPage)}>
            Retry
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Event Name</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Date</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Location</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Category</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Type</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Attendees</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Status</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  Loading events…
                </td>
              </tr>
            ) : displayedEvents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No events found.
                </td>
              </tr>
            ) : (
              displayedEvents.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                  style={{ height: "56px" }}
                >
                  <td className="px-4 py-3 text-sm font-medium text-[#374151]">{event.name}</td>
                  <td className="px-4 py-3 text-sm text-[#374151]">{event.eventDate}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">{event.location}</td>
                  <td className="hidden sm:table-cell px-4 py-3">
                    <span className="inline-block rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#374151]">
                      {event.category}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3">
                    {event.type ? (
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${typeColors[event.type] ?? "bg-gray-100 text-gray-600"}`}>
                        {event.type}
                      </span>
                    ) : (
                      <span className="text-xs text-[#9CA3AF]">—</span>
                    )}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151]">
                    {(event.attendees ?? 0).toLocaleString()}
                    {(event.capacity ?? 0) > 0 && (
                      <span className="text-[#9CA3AF]"> / {event.capacity!.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {event.status ? (
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColors[event.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {event.status}
                      </span>
                    ) : (
                      <span className="text-xs text-[#9CA3AF]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ActionDropdown
                      actions={[
                        { label: "View", onClick: () => router.push(`/event-management/${event.id}`) },
                        { label: "Edit", onClick: () => router.push(`/event-management/${event.id}/edit`) },
                        { label: "Cancel Event", onClick: () => handleCancelClick(event.id) },
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
          onPageChange={setCurrentPage}
        />
      </div>

      <DeleteConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        message="Are you sure you want to cancel this event? Attendees will be notified."
      />
    </DashboardLayout>
  );
}
