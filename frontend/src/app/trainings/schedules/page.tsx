"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { trainingSchedules } from "@/lib/mock-data";
import { ScheduleStatus } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

const statusColor = (status: ScheduleStatus): string => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Upcoming":
      return "bg-blue-100 text-blue-800";
    case "Completed":
      return "bg-gray-100 text-gray-600";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export default function TrainingSchedulesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return trainingSchedules;
    const q = search.toLowerCase();
    return trainingSchedules.filter(
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

  const handleCancelClick = (id: string) => {
    setSelectedId(id);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    console.log("Cancel schedule:", selectedId);
    setShowCancelModal(false);
    setSelectedId(null);
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
        <Button
          variant="primary"
          onClick={() => router.push("/trainings/schedules/add")}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Add Schedule
        </Button>
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
                      { label: "View", onClick: () => router.push(`/trainings/schedules/${s.id}`) },
                      { label: "Edit", onClick: () => router.push(`/trainings/schedules/${s.id}/edit`) },
                      { label: "Cancel", onClick: () => handleCancelClick(s.id) },
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
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>

      <DeleteConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        message="Are you sure you want to cancel this schedule?"
      />
    </DashboardLayout>
  );
}
