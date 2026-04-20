"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { allRequests } from "@/lib/mock-data";
import { Request } from "@/lib/types";

type CategoryFilter =
  | "All"
  | "Prayer"
  | "Counseling"
  | "Complaint"
  | "Suggestion";

const ITEMS_PER_PAGE = 10;

const categoryTabs: { key: CategoryFilter; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Prayer", label: "Prayer" },
  { key: "Counseling", label: "Counseling" },
  { key: "Complaint", label: "Complaints" },
  { key: "Suggestion", label: "Suggestions" },
];

const categoryBadgeColors: Record<string, string> = {
  Prayer: "bg-[#16A34A] text-white",
  Counseling: "bg-[#000080] text-white",
  Complaint: "bg-[#DC2626] text-white",
  Suggestion: "bg-[#CA8A04] text-white",
};

const statusBadgeColors: Record<string, string> = {
  Treated: "bg-[#DCFCE7] text-[#16A34A]",
  "In Progress": "bg-[#FEF9C3] text-[#CA8A04]",
  "Not treated": "bg-[#FEE2E2] text-[#DC2626]",
};

export default function RequestsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] =
    useState<CategoryFilter>("All");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );

  const filteredRequests = useMemo(() => {
    let filtered = allRequests;

    // Category filter
    if (activeCategory !== "All") {
      filtered = filtered.filter((r) => r.category === activeCategory);
    }

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.content.toLowerCase().includes(query) ||
          r.submittedBy.toLowerCase().includes(query) ||
          r.assignedTo.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [search, activeCategory]);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedRows);
      paginatedRequests.forEach((r) => newSelected.add(r.id));
      setSelectedRows(newSelected);
    } else {
      const newSelected = new Set(selectedRows);
      paginatedRequests.forEach((r) => newSelected.delete(r.id));
      setSelectedRows(newSelected);
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const allPageSelected =
    paginatedRequests.length > 0 &&
    paginatedRequests.every((r) => selectedRows.has(r.id));

  const handleDeleteClick = (id: string) => {
    setSelectedRequestId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    console.log("Delete request:", selectedRequestId);
    setShowDeleteModal(false);
    setSelectedRequestId(null);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Requests</h1>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 flex items-center border-b border-[#E5E7EB]">
        <div className="flex gap-8">
          {categoryTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveCategory(tab.key);
                setCurrentPage(1);
              }}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeCategory === tab.key
                  ? "border-b-2 border-[#000080] text-[#000080]"
                  : "text-[#6B7280] hover:text-[#374151]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top bar: search + actions */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={handleSearch}
            placeholder="Search requests..."
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => router.push("/requests/add")}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          >
            New Request
          </Button>
        </div>
      </div>

      {/* Selected count indicator */}
      {selectedRows.size > 0 && (
        <div className="mb-2 text-sm text-gray-500">
          {selectedRows.size} request{selectedRows.size > 1 ? "s" : ""} selected
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] focus:ring-[#000080]"
                />
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Type
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Subject
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Submitted By
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Date
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Status
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Assigned To
              </th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.map((request) => (
              <tr
                key={request.id}
                className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                style={{ height: "56px" }}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(request.id)}
                    onChange={() => handleSelectRow(request.id)}
                    className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] focus:ring-[#000080]"
                  />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      categoryBadgeColors[request.category] ||
                      "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {request.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {request.title}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {request.submittedBy}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {request.date}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      statusBadgeColors[request.status] ||
                      "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {request.assignedTo}
                </td>
                <td className="px-4 py-3">
                  <ActionDropdown
                    actions={[
                      {
                        label: "View",
                        onClick: () =>
                          router.push(`/requests/${request.id}`),
                      },
                      {
                        label: "Update Status",
                        onClick: () =>
                          router.push(`/requests/${request.id}`),
                      },
                      {
                        label: "Assign",
                        onClick: () =>
                          router.push(`/requests/${request.id}`),
                      },
                      {
                        label: "Delete",
                        onClick: () => handleDeleteClick(request.id),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {paginatedRequests.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No requests found.
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
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedRequestId(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </DashboardLayout>
  );
}
