"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";

type EventStatus = "Upcoming" | "Ongoing" | "Completed";
type EventCategory = "Service" | "Conference" | "Training" | "Social";

interface ChurchEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  category: EventCategory;
  attendees: number;
  status: EventStatus;
}

const mockEvents: ChurchEvent[] = [
  {
    id: "ev1",
    name: "Sunday Worship Service",
    date: "Apr 19, 2026",
    location: "Main Auditorium",
    category: "Service",
    attendees: 450,
    status: "Upcoming",
  },
  {
    id: "ev2",
    name: "Annual Church Conference",
    date: "May 1-3, 2026",
    location: "Convention Center",
    category: "Conference",
    attendees: 1200,
    status: "Upcoming",
  },
  {
    id: "ev3",
    name: "Leadership Training Workshop",
    date: "Apr 25, 2026",
    location: "Fellowship Hall",
    category: "Training",
    attendees: 85,
    status: "Upcoming",
  },
  {
    id: "ev4",
    name: "Youth Fun Day",
    date: "Apr 18, 2026",
    location: "Church Grounds",
    category: "Social",
    attendees: 120,
    status: "Upcoming",
  },
  {
    id: "ev5",
    name: "Midweek Bible Study",
    date: "Apr 15, 2026",
    location: "Room 201",
    category: "Service",
    attendees: 95,
    status: "Ongoing",
  },
  {
    id: "ev6",
    name: "Workers Training Seminar",
    date: "Apr 10, 2026",
    location: "Training Room",
    category: "Training",
    attendees: 60,
    status: "Completed",
  },
  {
    id: "ev7",
    name: "Easter Celebration Service",
    date: "Mar 29, 2026",
    location: "Main Auditorium",
    category: "Service",
    attendees: 800,
    status: "Completed",
  },
  {
    id: "ev8",
    name: "Church Picnic & Fellowship",
    date: "Mar 22, 2026",
    location: "City Park",
    category: "Social",
    attendees: 200,
    status: "Completed",
  },
];

const statusColors: Record<EventStatus, string> = {
  Upcoming: "bg-blue-100 text-blue-800",
  Ongoing: "bg-green-100 text-green-800",
  Completed: "bg-gray-100 text-gray-600",
};

const ITEMS_PER_PAGE = 5;

export default function EventManagementPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredEvents = useMemo(() => {
    if (!search.trim()) return mockEvents;
    const query = search.toLowerCase();
    return mockEvents.filter(
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

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Event Management</h1>
      </div>

      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-72">
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
          onClick={() => {}}
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

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Event Name</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Date</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Location</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Category</th>
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
                <td className="px-4 py-3 text-sm text-[#374151]">{event.attendees.toLocaleString()}</td>
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
                      { label: "View", onClick: () => console.log("View:", event.id) },
                      { label: "Edit", onClick: () => console.log("Edit:", event.id) },
                      { label: "Cancel", onClick: () => console.log("Cancel:", event.id) },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {paginatedEvents.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredEvents.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </DashboardLayout>
  );
}
