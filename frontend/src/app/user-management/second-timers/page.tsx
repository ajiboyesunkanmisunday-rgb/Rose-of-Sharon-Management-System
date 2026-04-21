"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import AddNotesModal from "@/components/user-management/AddNotesModal";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import AssignFollowUpModal from "@/components/user-management/AssignFollowUpModal";
import Modal from "@/components/ui/Modal";
import { secondTimers } from "@/lib/mock-data";
import { toCSV, downloadCSV } from "@/lib/csv";

const ITEMS_PER_PAGE = 10;

export default function SecondTimersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Modal states
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showCallReportModal, setShowCallReportModal] = useState(false);
  const [callReport, setCallReport] = useState("");
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [showSingleAssignModal, setShowSingleAssignModal] = useState(false);
  const [selectedTimerId, setSelectedTimerId] = useState<string | null>(null);

  const filteredTimers = useMemo(() => {
    if (!search.trim()) return secondTimers;
    const query = search.toLowerCase();
    return secondTimers.filter(
      (st) =>
        st.name.toLowerCase().includes(query) ||
        st.email.toLowerCase().includes(query) ||
        st.phone.includes(query)
    );
  }, [search]);

  const totalPages = Math.ceil(filteredTimers.length / ITEMS_PER_PAGE);
  const paginatedTimers = filteredTimers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedRows);
      paginatedTimers.forEach((st) => newSelected.add(st.id));
      setSelectedRows(newSelected);
    } else {
      const newSelected = new Set(selectedRows);
      paginatedTimers.forEach((st) => newSelected.delete(st.id));
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
    paginatedTimers.length > 0 &&
    paginatedTimers.every((st) => selectedRows.has(st.id));

  const handleSaveCallReport = () => {
    console.log("Save call report:", callReport);
    setCallReport("");
    setShowCallReportModal(false);
  };

  const bulkActions = [
    {
      label: "Send SMS",
      onClick: () => console.log("Bulk SMS:", Array.from(selectedRows)),
    },
    {
      label: "Send Email",
      onClick: () => console.log("Bulk Email:", Array.from(selectedRows)),
    },
    {
      label: "Assign Follow-up",
      onClick: () => setShowBulkAssignModal(true),
    },
    {
      label: "Delete",
      onClick: () => setShowBulkDeleteModal(true),
    },
  ];

  const handleBulkDeleteConfirm = () => {
    console.log("Bulk delete second timers:", Array.from(selectedRows));
    setSelectedRows(new Set());
    setShowBulkDeleteModal(false);
  };

  const handleBulkAssign = (officerId: string, note: string) => {
    console.log("Bulk assign follow-up:", Array.from(selectedRows), officerId, note);
    setSelectedRows(new Set());
    setShowBulkAssignModal(false);
  };

  const handleSingleAssign = (officerId: string, note: string) => {
    console.log("Assign follow-up:", selectedTimerId, officerId, note);
    setShowSingleAssignModal(false);
    setSelectedTimerId(null);
  };

  const handleExport = () => {
    const csv = toCSV(
      filteredTimers.map((st) => ({
        id: st.id,
        name: st.name,
        email: st.email,
        phone: st.phone,
        serviceAttended: st.serviceAttended,
        assignedFollowUp: st.assignedFollowUp,
        date: st.date,
        calls: st.calls,
        visits: st.visits,
      }))
    );
    downloadCSV(
      csv,
      `second-timers-export-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">User Management</h1>
        <h2 className="text-[22px] font-bold text-[#000080]">Second Timers</h2>
      </div>

      {/* Top bar: search + actions */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={handleSearch}
            placeholder="Search..."
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedRows.size > 0 && (
            <ActionDropdown actions={bulkActions} />
          )}

          <Link href="/user-management/second-timers/add">
            <Button
              variant="primary"
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
              Add Second Timer
            </Button>
          </Link>

          <Button onClick={() => {}}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            }
          >QR Code</Button>

          <Button onClick={() => {}}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            }
          >Filter &amp; Export</Button>

          <Button onClick={handleExport}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            }
          >Export</Button>
        </div>
      </div>

      {/* Selected count indicator */}
      {selectedRows.size > 0 && (
        <div className="mb-2 text-sm text-gray-500">
          {selectedRows.size} second timer{selectedRows.size > 1 ? "s" : ""}{" "}
          selected
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
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Name</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Phone</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Email</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Service Attended
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Assigned Follow-up
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Date</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Calls</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Visits</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedTimers.map((st) => (
              <tr
                key={st.id}
                className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                style={{ height: "56px" }}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(st.id)}
                    onChange={() => handleSelectRow(st.id)}
                    className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] focus:ring-[#000080]"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">{st.name}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{st.phone}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{st.email}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {st.serviceAttended}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {st.assignedFollowUp}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">{st.date}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{st.calls}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{st.visits}</td>
                <td className="px-4 py-3">
                  <ActionDropdown
                    actions={[
                      {
                        label: "View",
                        onClick: () =>
                          router.push(
                            `/user-management/second-timers/${st.id}`
                          ),
                      },
                      {
                        label: "Add Notes",
                        onClick: () => setShowNotesModal(true),
                      },
                      {
                        label: "Add Call Report",
                        onClick: () => setShowCallReportModal(true),
                      },
                      {
                        label: "Add Visit Report",
                        onClick: () =>
                          console.log("Add visit report:", st.id),
                      },
                      {
                        label: "Assign Follow-up",
                        onClick: () => {
                          setSelectedTimerId(st.id);
                          setShowSingleAssignModal(true);
                        },
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {paginatedTimers.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No second timers found.
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

      {/* Add Notes Modal */}
      <AddNotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
      />

      {/* Add Call Report Modal */}
      <Modal
        isOpen={showCallReportModal}
        onClose={() => setShowCallReportModal(false)}
        title="Add Call Report"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Report
            </label>
            <textarea
              value={callReport}
              onChange={(e) => setCallReport(e.target.value)}
              placeholder="Enter Report"
              rows={5}
              className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-gray-400 focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
            />
          </div>
          <button
            onClick={handleSaveCallReport}
            className="w-full rounded-lg bg-[#000080] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#000066]"
          >
            Save
          </button>
        </div>
      </Modal>

      <DeleteConfirmModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDeleteConfirm}
        message={`Are you sure you want to delete ${selectedRows.size} selected second timer${selectedRows.size === 1 ? "" : "s"}?`}
      />

      <AssignFollowUpModal
        isOpen={showBulkAssignModal}
        onClose={() => setShowBulkAssignModal(false)}
        onAssign={handleBulkAssign}
        memberCount={selectedRows.size}
      />

      <AssignFollowUpModal
        isOpen={showSingleAssignModal}
        onClose={() => {
          setShowSingleAssignModal(false);
          setSelectedTimerId(null);
        }}
        onAssign={handleSingleAssign}
        memberCount={1}
      />
    </DashboardLayout>
  );
}
