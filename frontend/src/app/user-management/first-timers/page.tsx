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
import BulkImportModal from "@/components/user-management/BulkImportModal";
import Modal from "@/components/ui/Modal";
import { firstTimers } from "@/lib/mock-data";
import { toCSV, downloadCSV } from "@/lib/csv";

const ITEMS_PER_PAGE = 10;

export default function FirstTimersPage() {
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
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [selectedTimerId, setSelectedTimerId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterService, setFilterService] = useState("");
  const [filterAssigned, setFilterAssigned] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const filteredTimers = useMemo(() => {
    let result = firstTimers;
    if (filterService) result = result.filter((ft) => ft.serviceAttended === filterService);
    if (filterAssigned) result = result.filter((ft) => ft.assignedFollowUp === filterAssigned);
    if (filterDateFrom || filterDateTo) {
      result = result.filter((ft) => {
        const parts = ft.date.split("/");
        if (parts.length !== 3) return true;
        const d = `${parts[2]}-${parts[0].padStart(2,"0")}-${parts[1].padStart(2,"0")}`;
        if (filterDateFrom && d < filterDateFrom) return false;
        if (filterDateTo && d > filterDateTo) return false;
        return true;
      });
    }
    if (!search.trim()) return result;
    const query = search.toLowerCase();
    return result.filter(
      (ft) =>
        ft.name.toLowerCase().includes(query) ||
        ft.email.toLowerCase().includes(query) ||
        ft.phone.includes(query)
    );
  }, [search, filterService, filterAssigned, filterDateFrom, filterDateTo]);

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
      paginatedTimers.forEach((ft) => newSelected.add(ft.id));
      setSelectedRows(newSelected);
    } else {
      const newSelected = new Set(selectedRows);
      paginatedTimers.forEach((ft) => newSelected.delete(ft.id));
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
    paginatedTimers.every((ft) => selectedRows.has(ft.id));

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
    console.log("Bulk delete first timers:", Array.from(selectedRows));
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
      filteredTimers.map((ft) => ({
        id: ft.id,
        name: ft.name,
        email: ft.email,
        phone: ft.phone,
        serviceAttended: ft.serviceAttended,
        assignedFollowUp: ft.assignedFollowUp,
        date: ft.date,
        calls: ft.calls,
        visits: ft.visits,
      }))
    );
    downloadCSV(
      csv,
      `first-timers-export-${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">User Management</h1>
        <h2 className="text-[22px] font-bold text-[#000080]">First Timers</h2>
      </div>

      {/* Top bar: search + actions */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={handleSearch}
            placeholder="Search..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedRows.size > 0 && (
            <ActionDropdown actions={bulkActions} />
          )}

          <Link href="/user-management/first-timers/add">
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
              Add First Timer
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
          ><span className="hidden sm:inline">QR Code</span></Button>

          <Button onClick={() => setShowFilter(!showFilter)}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            }
          ><span className="hidden sm:inline">Filter</span></Button>

          <Button onClick={handleExport}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            }
          ><span className="hidden sm:inline">Export</span></Button>

          <Button
            variant="primary"
            onClick={() => setShowBulkImportModal(true)}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            }
          >
            <span className="hidden sm:inline">Bulk Import</span>
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="mb-4 flex flex-wrap items-end gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
          <div className="flex flex-col">
            <label className="mb-1 block text-xs font-medium text-[#374151]">Service Attended</label>
            <select value={filterService} onChange={(e) => { setFilterService(e.target.value); setCurrentPage(1); }} className="h-[42px] rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]">
              <option value="">All Services</option>
              <option value="Sunday Service">Sunday Service</option>
              <option value="Wednesday Service">Wednesday Service</option>
              <option value="Friday Service">Friday Service</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 block text-xs font-medium text-[#374151]">Assigned Officer</label>
            <select value={filterAssigned} onChange={(e) => { setFilterAssigned(e.target.value); setCurrentPage(1); }} className="h-[42px] rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]">
              <option value="">All Officers</option>
              <option value="Shola Damson">Shola Damson</option>
              <option value="Aisha Bello">Aisha Bello</option>
              <option value="David Okoro">David Okoro</option>
              <option value="Grace Adeyemi">Grace Adeyemi</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 block text-xs font-medium text-[#374151]">From</label>
            <input type="date" value={filterDateFrom} onChange={(e) => { setFilterDateFrom(e.target.value); setCurrentPage(1); }} className="h-[42px] rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]" />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 block text-xs font-medium text-[#374151]">To</label>
            <input type="date" value={filterDateTo} onChange={(e) => { setFilterDateTo(e.target.value); setCurrentPage(1); }} className="h-[42px] rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]" />
          </div>
          <button onClick={() => { setFilterService(""); setFilterAssigned(""); setFilterDateFrom(""); setFilterDateTo(""); setCurrentPage(1); }} className="h-[42px] rounded-lg border border-[#E5E7EB] px-4 text-sm text-[#374151] hover:bg-gray-50">Clear</button>
        </div>
      )}

      {/* Selected count indicator */}
      {selectedRows.size > 0 && (
        <div className="mb-2 text-sm text-gray-500">
          {selectedRows.size} first timer{selectedRows.size > 1 ? "s" : ""}{" "}
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
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Email</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">
                Service Attended
              </th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">
                Assigned Follow-up
              </th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Date</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Calls</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Visits</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedTimers.map((ft) => (
              <tr
                key={ft.id}
                className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50 cursor-pointer"
                style={{ height: "56px" }}
                onDoubleClick={() => router.push(`/user-management/first-timers/${ft.id}`)}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(ft.id)}
                    onChange={() => handleSelectRow(ft.id)}
                    className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] focus:ring-[#000080]"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">{ft.name}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{ft.phone}</td>
                <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">{ft.email}</td>
                <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                  {ft.serviceAttended}
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                  {ft.assignedFollowUp}
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">{ft.date}</td>
                <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">{ft.calls}</td>
                <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">{ft.visits}</td>
                <td className="px-4 py-3">
                  <ActionDropdown
                    actions={[
                      {
                        label: "View",
                        onClick: () =>
                          router.push(
                            `/user-management/first-timers/${ft.id}`
                          ),
                      },
                      {
                        label: "Edit",
                        onClick: () =>
                          router.push(
                            `/user-management/first-timers/${ft.id}/edit`
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
                          console.log("Add visit report:", ft.id),
                      },
                      {
                        label: "Assign Follow-up",
                        onClick: () => {
                          setSelectedTimerId(ft.id);
                          setShowSingleAssignModal(true);
                        },
                      },
                      {
                        label: "Convert to Second Timer",
                        onClick: () =>
                          console.log("Convert to second timer:", ft.id),
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
                  No first timers found.
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
          totalItems={filteredTimers.length}
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
        message={`Are you sure you want to delete ${selectedRows.size} selected first timer${selectedRows.size === 1 ? "" : "s"}?`}
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

      <BulkImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        onImport={(rows) => {
          console.log("Bulk import First Timers:", rows);
          setShowBulkImportModal(false);
        }}
        module="First Timers"
        templateHeaders={["firstName","middleName","lastName","gender","countryCode","phone","email","serviceAttended","date"]}
        templateSampleRow={["Alex","","Johnson","Male","+1","5551234567","alex@example.com","Sunday Service","2026-04-20"]}
      />
    </DashboardLayout>
  );
}
