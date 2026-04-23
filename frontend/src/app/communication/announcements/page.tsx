"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { allAnnouncements } from "@/lib/mock-data";
import { AnnouncementStatus } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

const statusColors: Record<AnnouncementStatus, string> = {
  Published: "bg-green-100 text-green-800",
  Scheduled: "bg-blue-100 text-blue-800",
  Draft: "bg-gray-100 text-gray-700",
};

export default function AnnouncementsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return allAnnouncements;
    const q = search.toLowerCase();
    return allAnnouncements.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.audience.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q)
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    console.log("Delete announcement:", selectedId);
    setShowDeleteModal(false);
    setSelectedId(null);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Communication</h1>
        <h2 className="text-[22px] font-bold text-[#000080]">Announcements</h2>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={() => setCurrentPage(1)}
            placeholder="Search announcements..."
          />
        </div>
        <Button
          variant="primary"
          onClick={() => router.push("/communication/announcements/add")}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Create Announcement
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Title</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Audience</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Scheduled Date</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Status</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Created By</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((a) => (
              <tr
                key={a.id}
                className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                style={{ height: "56px" }}
              >
                <td className="px-4 py-3 font-medium text-[#111827]">{a.title}</td>
                <td className="px-4 py-3 text-[#374151]">{a.audience}</td>
                <td className="px-4 py-3 text-[#374151]">{a.scheduledDate}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[a.status]}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#374151]">{a.createdBy}</td>
                <td className="px-4 py-3">
                  <ActionDropdown
                    actions={[
                      {
                        label: "View",
                        onClick: () => router.push(`/communication/announcements/${a.id}`),
                      },
                      {
                        label: "Edit",
                        onClick: () => router.push(`/communication/announcements/${a.id}/edit`),
                      },
                      {
                        label: "Delete",
                        onClick: () => handleDeleteClick(a.id),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No announcements found.
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
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this announcement?"
      />
    </DashboardLayout>
  );
}
