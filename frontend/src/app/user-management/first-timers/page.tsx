"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  getFirstTimers,
  deleteFirstTimersBulk,
  addCallReport,
  addNote,
  assignFollowUp,
  convertToSecondTimer,
  type UserResponse,
} from "@/lib/api";
import { toCSV, downloadCSV } from "@/lib/csv";

const ITEMS_PER_PAGE = 10;

function fullName(u: UserResponse): string {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ");
}

export default function FirstTimersPage() {
  const router = useRouter();

  // Data
  const [timers, setTimers] = useState<UserResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // UI
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

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
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const fetchTimers = useCallback(async (page: number) => {
    setLoading(true);
    setApiError("");
    try {
      const res = await getFirstTimers(page - 1, ITEMS_PER_PAGE);
      setTimers(res.content);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.totalElements || 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load first timers.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimers(currentPage);
  }, [currentPage, fetchTimers]);

  // Client-side filter on current page data
  const displayedTimers = timers.filter((ft) => {
    if (filterService && ft.serviceAttended !== filterService) return false;
    if (filterDateFrom || filterDateTo) {
      const d = ft.firstTimeService?.date ?? ft.createdOn ?? "";
      if (filterDateFrom && d < filterDateFrom) return false;
      if (filterDateTo && d > filterDateTo) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        fullName(ft).toLowerCase().includes(q) ||
        (ft.email ?? "").toLowerCase().includes(q) ||
        (ft.phoneNumber ?? "").includes(q)
      );
    }
    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    const next = new Set(selectedRows);
    displayedTimers.forEach((ft) => (checked ? next.add(ft.id) : next.delete(ft.id)));
    setSelectedRows(next);
  };

  const handleSelectRow = (id: string) => {
    const next = new Set(selectedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedRows(next);
  };

  const allPageSelected =
    displayedTimers.length > 0 && displayedTimers.every((ft) => selectedRows.has(ft.id));

  const handleSaveCallReport = async () => {
    if (!selectedTimerId) return;
    setActionLoading(true);
    setActionError("");
    try {
      await addCallReport(selectedTimerId, callReport);
      setCallReport("");
      setShowCallReportModal(false);
      setSelectedTimerId(null);
      fetchTimers(currentPage);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to save call report.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNote = async (note: string) => {
    if (!selectedTimerId) return;
    setActionLoading(true);
    try {
      await addNote(selectedTimerId, note);
      setShowNotesModal(false);
      setSelectedTimerId(null);
    } catch {
      // modal handles its own error display
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      await deleteFirstTimersBulk(Array.from(selectedRows));
      setSelectedRows(new Set());
      setShowBulkDeleteModal(false);
      fetchTimers(currentPage);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete.");
      setShowBulkDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAssign = async (officerId: string, note: string) => {
    setActionLoading(true);
    try {
      await Promise.all(
        Array.from(selectedRows).map((id) => assignFollowUp(id, officerId, note))
      );
      setSelectedRows(new Set());
      setShowBulkAssignModal(false);
      fetchTimers(currentPage);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to assign follow-up.");
      setShowBulkAssignModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSingleAssign = async (officerId: string, note: string) => {
    if (!selectedTimerId) return;
    setActionLoading(true);
    try {
      await assignFollowUp(selectedTimerId, officerId, note);
      setShowSingleAssignModal(false);
      setSelectedTimerId(null);
      fetchTimers(currentPage);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to assign follow-up.");
      setShowSingleAssignModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToSecondTimer = async (id: string) => {
    setActionLoading(true);
    setActionError("");
    try {
      await convertToSecondTimer(id);
      fetchTimers(currentPage);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to convert.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = () => {
    const csv = toCSV(
      displayedTimers.map((ft) => ({
        id: ft.id,
        firstName: ft.firstName,
        middleName: ft.middleName ?? "",
        lastName: ft.lastName,
        email: ft.email,
        phone: ft.phoneNumber,
        serviceAttended: ft.serviceAttended ?? "",
        assignedFollowUp: ft.assignedFollowUp ? fullName(ft.assignedFollowUp) : "",
        calls: ft.noOfCalls ?? 0,
        visits: ft.noOfVisits ?? 0,
      }))
    );
    downloadCSV(csv, `first-timers-export-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const bulkActions = [
    { label: "Assign Follow-up", onClick: () => setShowBulkAssignModal(true) },
    { label: "Delete", onClick: () => setShowBulkDeleteModal(true) },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">User Management</h1>
        <h2 className="text-[22px] font-bold text-[#000080]">First Timers</h2>
      </div>

      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={(val) => { setSearch(val); setCurrentPage(1); }}
            onSearch={() => setCurrentPage(1)}
            placeholder="Search..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedRows.size > 0 && <ActionDropdown actions={bulkActions} />}

          <Link href="/user-management/first-timers/add">
            <Button
              variant="primary"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            >
              Add First Timer
            </Button>
          </Link>

          <Button
            onClick={() => setShowFilter(!showFilter)}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            }
          >
            <span className="hidden sm:inline">Filter</span>
          </Button>

          <Button
            onClick={handleExport}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            }
          >
            <span className="hidden sm:inline">Export</span>
          </Button>

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
            <select
              value={filterService}
              onChange={(e) => { setFilterService(e.target.value); setCurrentPage(1); }}
              className="h-[42px] rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
            >
              <option value="">All Services</option>
              <option value="Sunday Service">Sunday Service</option>
              <option value="Tuesday Service">Tuesday Service</option>
              <option value="Thursday Service">Thursday Service</option>
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
          <button
            onClick={() => { setFilterService(""); setFilterDateFrom(""); setFilterDateTo(""); setCurrentPage(1); }}
            className="h-[42px] rounded-lg border border-[#E5E7EB] px-4 text-sm text-[#374151] hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      )}

      {/* API error */}
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={() => fetchTimers(currentPage)}>
            Retry
          </button>
        </div>
      )}

      {/* Action error */}
      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {selectedRows.size > 0 && (
        <div className="mb-2 text-sm text-gray-500">
          {selectedRows.size} first timer{selectedRows.size > 1 ? "s" : ""} selected
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
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Service Attended</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Assigned Follow-up</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Calls</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Visits</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">Loading first timers…</td>
              </tr>
            ) : displayedTimers.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">No first timers found.</td>
              </tr>
            ) : (
              displayedTimers.map((ft) => (
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
                  <td className="px-4 py-3 text-sm text-[#374151]">{fullName(ft)}</td>
                  <td className="px-4 py-3 text-sm text-[#374151]">{ft.phoneNumber}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">{ft.email}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                    {ft.serviceAttended || <span className="text-[#9CA3AF]">—</span>}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                    {ft.assignedFollowUp ? fullName(ft.assignedFollowUp) : <span className="text-[#9CA3AF]">—</span>}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">{ft.noOfCalls ?? 0}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">{ft.noOfVisits ?? 0}</td>
                  <td className="px-4 py-3">
                    <ActionDropdown
                      actions={[
                        { label: "View", onClick: () => router.push(`/user-management/first-timers/${ft.id}`) },
                        { label: "Edit", onClick: () => router.push(`/user-management/first-timers/${ft.id}/edit`) },
                        {
                          label: "Add Notes",
                          onClick: () => { setSelectedTimerId(ft.id); setShowNotesModal(true); },
                        },
                        {
                          label: "Add Call Report",
                          onClick: () => { setSelectedTimerId(ft.id); setShowCallReportModal(true); },
                        },
                        {
                          label: "Assign Follow-up",
                          onClick: () => { setSelectedTimerId(ft.id); setShowSingleAssignModal(true); },
                        },
                        {
                          label: "Convert to Second Timer",
                          onClick: () => handleConvertToSecondTimer(ft.id),
                        },
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

      {/* Add Notes Modal */}
      <AddNotesModal
        isOpen={showNotesModal}
        onClose={() => { setShowNotesModal(false); setSelectedTimerId(null); }}
        onSave={handleSaveNote}
      />

      {/* Add Call Report Modal */}
      <Modal
        isOpen={showCallReportModal}
        onClose={() => { setShowCallReportModal(false); setSelectedTimerId(null); setCallReport(""); }}
        title="Add Call Report"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Report</label>
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
            disabled={actionLoading}
            className="w-full rounded-lg bg-[#000080] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#000066] disabled:opacity-50"
          >
            {actionLoading ? "Saving…" : "Save"}
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
        onClose={() => { setShowSingleAssignModal(false); setSelectedTimerId(null); }}
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
