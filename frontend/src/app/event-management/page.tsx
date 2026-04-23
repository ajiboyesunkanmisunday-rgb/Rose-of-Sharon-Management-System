"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { allEvents } from "@/lib/mock-data";
import { EventStatus, EventType } from "@/lib/types";

const statusColors: Record<EventStatus, string> = {
  Upcoming: "bg-blue-100 text-blue-800",
  Ongoing: "bg-green-100 text-green-800",
  Completed: "bg-gray-100 text-gray-600",
  Cancelled: "bg-red-100 text-red-800",
};

const typeColors: Record<EventType, string> = {
  Virtual: "bg-blue-100 text-blue-800",
  Hybrid: "bg-purple-100 text-purple-800",
  Physical: "bg-green-100 text-green-800",
};

const ITEMS_PER_PAGE = 10;

export default function EventManagementPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    if (!search.trim()) return allEvents;
    const query = search.toLowerCase();
    return allEvents.filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        e.location.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query)
    );
  }, [search]);

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
            onChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            onSearch={() => setCurrentPage(1)}
            placeholder="Search events..."
          />
        </div>
        <Button
          variant="primary"
          onClick={() => router.push("/event-management/add")}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Create Event
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Event Name</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Date</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Location</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Category</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Type</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Attendees</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Status</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedEvents.map((event) => (
              <tr
                key={event.id}
                className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                style={{ height: "56px" }}
              >
                <td className="px-4 py-3 text-sm font-medium text-[#374151]">{event.name}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{event.date}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{event.location}</td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#374151]">
                    {event.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {event.type ? (
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${typeColors[event.type]}`}>
                      {event.type}
                    </span>
                  ) : (
                    <span className="text-xs text-[#9CA3AF]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {event.attendees.toLocaleString()}
                  {event.capacity > 0 && (
                    <span className="text-[#9CA3AF]"> / {event.capacity.toLocaleString()}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColors[event.status]}`}
                  >
                    {event.status}
                  </span>
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
            ))}
            {paginatedEvents.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredEvents.length}
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
