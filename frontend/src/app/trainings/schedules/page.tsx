"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";

const schedules = [
  { id: "sch-1", course: "Water Baptism Class", instructor: "Pastor David", startDate: "04/01/2026", endDate: "05/15/2026", dayTime: "Saturdays, 10:00 AM", venue: "Main Hall", status: "Active" },
  { id: "sch-2", course: "New Believers Foundation", instructor: "Deaconess Grace", startDate: "04/10/2026", endDate: "06/10/2026", dayTime: "Sundays, 2:00 PM", venue: "Room 3", status: "Active" },
  { id: "sch-3", course: "Leadership Training", instructor: "Pastor James", startDate: "05/01/2026", endDate: "07/30/2026", dayTime: "Wednesdays, 6:00 PM", venue: "Conference Room", status: "Upcoming" },
  { id: "sch-4", course: "Marriage Counseling", instructor: "Pastor & Mrs. Adeyemi", startDate: "03/01/2026", endDate: "03/30/2026", dayTime: "Fridays, 5:00 PM", venue: "Counseling Room", status: "Completed" },
  { id: "sch-5", course: "Sunday School Teachers", instructor: "Elder Samuel", startDate: "04/15/2026", endDate: "06/15/2026", dayTime: "Saturdays, 9:00 AM", venue: "Room 2", status: "Active" },
  { id: "sch-6", course: "Youth Ministry Training", instructor: "Brother Emmanuel", startDate: "05/10/2026", endDate: "07/10/2026", dayTime: "Fridays, 4:00 PM", venue: "Youth Center", status: "Upcoming" },
];

const ITEMS_PER_PAGE = 10;

export default function TrainingSchedulesPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return schedules;
    const q = search.toLowerCase();
    return schedules.filter(
      (s) =>
        s.course.toLowerCase().includes(q) ||
        s.instructor.toLowerCase().includes(q) ||
        s.venue.toLowerCase().includes(q)
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const statusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Upcoming":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Trainings</h1>
        <h2 className="text-[22px] font-bold text-[#000080]">Schedules</h2>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={() => setCurrentPage(1)}
            placeholder="Search schedules..."
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Course</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Instructor</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Start Date</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">End Date</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Day/Time</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Venue</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Status</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((s) => (
              <tr
                key={s.id}
                className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                style={{ height: "56px" }}
              >
                <td className="px-4 py-3 font-medium text-[#111827]">{s.course}</td>
                <td className="px-4 py-3 text-[#374151]">{s.instructor}</td>
                <td className="px-4 py-3 text-[#374151]">{s.startDate}</td>
                <td className="px-4 py-3 text-[#374151]">{s.endDate}</td>
                <td className="px-4 py-3 text-[#374151]">{s.dayTime}</td>
                <td className="px-4 py-3 text-[#374151]">{s.venue}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(s.status)}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ActionDropdown
                    actions={[
                      { label: "Edit", onClick: () => console.log("Edit", s.id) },
                      { label: "Cancel", onClick: () => console.log("Cancel", s.id) },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No schedules found.
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
          onPageChange={setCurrentPage}
        />
      </div>
    </DashboardLayout>
  );
}
