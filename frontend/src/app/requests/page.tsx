"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import StatusFilterTabs from "@/components/ui/StatusFilterTabs";
import BulkActionsBar from "@/components/ui/BulkActionsBar";
import Modal from "@/components/ui/Modal";
import { allRequests, followUpOfficers } from "@/lib/mock-data";

type CategoryFilter =
  | "All"
  | "Prayer"
  | "Counseling"
  | "Complaint"
  | "Suggestion";

type StatusFilter = "All" | "Received" | "Assigned" | "In Progress" | "Resolved";

const ITEMS_PER_PAGE = 10;

const categoryTabs: { key: CategoryFilter; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Prayer", label: "Prayer" },
  { key: "Counseling", label: "Counseling" },
  { key: "Complaint", label: "Complaints" },
  { key: "Suggestion", label: "Suggestions" },
];

const statusFilterOptions: { value: StatusFilter; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Received", label: "Received" },
  { value: "Assigned", label: "Assigned" },
  { value: "In Progress", label: "In Progress" },
  { value: "Resolved", label: "Resolved" },
];

const categoryBadgeColors: Record<string, string> = {
  Prayer: "bg-[#16A34A] text-white",
  Counseling: "bg-[#000080] text-white",
  Complaint: "bg-[#DC2626] text-white",
  Suggestion: "bg-[#CA8A04] text-white",
};

const statusBadgeColors: Record<string, string> = {
  Received: "bg-[#F3F4F6] text-[#6B7280]",
  Assigned: "bg-[#DBEAFE] text-[#1D4ED8]",
  "In Progress": "bg-[#FEF9C3] text-[#CA8A04]",
  Resolved: "bg-[#DCFCE7] text-[#16A34A]",
};

export default function RequestsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("All");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>("Received");
  const [bulkOfficer, setBulkOfficer] = useState<string>(followUpOfficers[0]?.id || "");

  const filteredRequests = useMemo(() => {
    let filtered = allRequests;
    if (activeCategory !== "All") {
      filtered = filtered.filter((r) => r.category === activeCategory);
    }
    if (activeStatus !== "All") {
      filtered = filtered.filter((r) => r.status === activeStatus);
    }
    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.content.toLowerCase().includes(query) ||
          (r.submittedBy && r.submittedBy.toLowerCase().includes(query)) ||
          r.assignedTo.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [search, activeCategory, activeStatus]);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = () => setCurrentPage(1);

  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set(selectedRows);
    paginatedRequests.forEach((r) => (checked ? newSelected.add(r.id) : newSelected.delete(r.id)));
    setSelectedRows(newSelected);
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelectedRows(newSelected);
  };

  const allPageSelected =
    paginatedRequests.length > 0 &&
    paginatedRequests.every((r) => selectedRows.has(r.id));

  const applyBulkStatus = () => {
    console.log("Bulk update status:", Array.from(selectedRows), "->", bulkStatus);
    setShowStatusModal(false);
    setSelectedRows(new Set());
  };

  const applyBulkAssign = () => {
    console.log("Bulk assign:", Array.from(selectedRows), "->", bulkOfficer);
    setShowAssignModal(false);
    setSelectedRows(new Set());
  };

  const selectStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Requests</h1>
      </div>

      {/* Category Tabs */}
      <div className="mb-4 flex items-center border-b border-[#E5E7EB]">
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

      {/* Status filter pills */}
      <div className="mb-4">
        <StatusFilterTabs
          options={statusFilterOptions}
          active={activeStatus}
          onChange={(v) => {
            setActiveStatus(v);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
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
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          >
            New Request
          </Button>
        </div>
      </div>

      {/* Bulk actions */}
      <BulkActionsBar
        count={selectedRows.size}
        onClear={() => setSelectedRows(new Set())}
        labelSingular="request"
        labelPlural="requests"
        actions={[
          { label: "Update Status", onClick: () => setShowStatusModal(true) },
          { label: "Assign", onClick: () => setShowAssignModal(true) },
        ]}
      />

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
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Type</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Subject</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Submitted By</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Date</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Status</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Assigned To</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.map((request) => (
              <tr key={request.id} className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50" style={{ height: "56px" }}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(request.id)}
                    onChange={() => handleSelectRow(request.id)}
                    className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] focus:ring-[#000080]"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${categoryBadgeColors[request.category] || "bg-gray-200 text-gray-700"}`}>
                    {request.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">{request.title}</td>
                <td className="px-4 py-3 text-sm">
                  {request.submittedBy && request.submittedBy.trim() !== "" ? (
                    <span className="text-[#374151]">{request.submittedBy}</span>
                  ) : (
                    <span className="italic text-gray-400">Anonymous</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">{request.date}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusBadgeColors[request.status] || "bg-gray-200 text-gray-700"}`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">{request.assignedTo}</td>
                <td className="px-4 py-3">
                  <ActionDropdown
                    actions={[
                      { label: "View", onClick: () => router.push(`/requests/${request.id}`) },
                      { label: "Edit", onClick: () => router.push(`/requests/${request.id}`) },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {paginatedRequests.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredRequests.length} onPageChange={setCurrentPage} />
      </div>

      {/* Status modal */}
      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Update Status">
        <label className="mb-1 block text-sm font-medium text-[#374151]">Status</label>
        <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className={selectStyles}>
          <option value="Received">Received</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={applyBulkStatus}>Apply</Button>
        </div>
      </Modal>

      {/* Assign modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Officer">
        <label className="mb-1 block text-sm font-medium text-[#374151]">Officer</label>
        <select value={bulkOfficer} onChange={(e) => setBulkOfficer(e.target.value)} className={selectStyles}>
          {followUpOfficers.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={applyBulkAssign}>Apply</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
