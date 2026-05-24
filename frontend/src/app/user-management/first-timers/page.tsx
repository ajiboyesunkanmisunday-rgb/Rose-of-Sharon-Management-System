"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import NoLongerMemberModal from "@/components/user-management/NoLongerMemberModal";
import AssignFollowUpModal from "@/components/user-management/AssignFollowUpModal";
import BulkImportModal from "@/components/user-management/BulkImportModal";
import QRCodeModal from "@/components/user-management/QRCodeModal";
import Modal from "@/components/ui/Modal";
import {
  getFirstTimers,
  searchFirstTimers,
  deleteFirstTimersBulk,
  addCallReport,
  addVisitReport,
  assignFollowUp,
  convertToSecondTimer,
  markUserAsInactive,
  type UserResponse,
} from "@/lib/api";
import { toCSV, downloadCSV } from "@/lib/csv";
import { UserPlus } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { SkeletonRow } from "@/components/ui/Skeleton";

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
  const [activeSearch, setActiveSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Modal states
  const [showCallReportModal, setShowCallReportModal] = useState(false);
  const [showVisitReportModal, setShowVisitReportModal] = useState(false);
  const [callReport, setCallReport] = useState("");
  const [visitReport, setVisitReport] = useState("");
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [showSingleAssignModal, setShowSingleAssignModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [showInactiveSingleModal, setShowInactiveSingleModal] = useState(false);
  const [showInactiveBulkModal, setShowInactiveBulkModal] = useState(false);
  const [selectedTimerId, setSelectedTimerId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterService, setFilterService] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const fetchTimers = useCallback(async (page: number, q = "") => {
    setLoading(true);
    setApiError("");
    try {
      const res = q.trim()
        ? await searchFirstTimers(q.trim(), page - 1, ITEMS_PER_PAGE)
        : await getFirstTimers(page - 1, ITEMS_PER_PAGE);
      setTimers(res.content ?? []);
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
    fetchTimers(currentPage, activeSearch);
  }, [currentPage, activeSearch, fetchTimers]);

  // Live search — update activeSearch 400ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSearch(search);
      if (search !== activeSearch) setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  // Client-side filter on current page data (date/service filters only)
  const displayedTimers = timers.filter((ft) => {
    if (filterService && ft.serviceAttended !== filterService) return false;
    if (filterDateFrom || filterDateTo) {
      const d = ft.firstTimeService?.date ?? ft.createdOn ?? "";
      if (filterDateFrom && d < filterDateFrom) return false;
      if (filterDateTo && d > filterDateTo) return false;
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

  const handleSaveVisitReport = async () => {
    if (!selectedTimerId) return;
    setActionLoading(true);
    setActionError("");
    try {
      await addVisitReport(selectedTimerId, visitReport);
      setVisitReport("");
      setShowVisitReportModal(false);
      setSelectedTimerId(null);
      fetchTimers(currentPage);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to save visit report.");
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

  const handleMarkInactive = async (reason: string) => {
    if (!selectedTimerId) return;
    setActionLoading(true);
    setActionError("");
    try {
      await markUserAsInactive(selectedTimerId, reason);
      setShowInactiveSingleModal(false);
      setSelectedTimerId(null);
      fetchTimers(currentPage);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to mark as inactive.");
      setShowInactiveSingleModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkMarkInactive = async (reason: string) => {
    setActionLoading(true);
    setActionError("");
    try {
      await Promise.allSettled(
        Array.from(selectedRows).map((id) => markUserAsInactive(id, reason))
      );
      setSelectedRows(new Set());
      setShowInactiveBulkModal(false);
      fetchTimers(currentPage);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to mark as inactive.");
      setShowInactiveBulkModal(false);
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
    { label: "Mark as Inactive", onClick: () => setShowInactiveBulkModal(true) },
    { label: "Delete", onClick: () => setShowBulkDeleteModal(true) },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF7ED] dark:bg-orange-900/30">
          <UserPlus className="h-6 w-6 text-[#EA580C] dark:text-orange-400" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">First Timers</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Track and follow up with first-time visitors</p>
        </div>
      </div>

      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={(val) => setSearch(val)}
            onSearch={() => { setActiveSearch(search); setCurrentPage(1); }}
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
            variant="secondary"
            onClick={() => setShowQRCodeModal(true)}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h7v7"/>
              </svg>
            }
          >
            <span className="hidden sm:inline">QR Code</span>
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
        <div className="mb-4 flex flex-wrap items-end gap-4 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="flex flex-col">
            <label className="mb-1 block text-xs font-medium text-[#374151] dark:text-slate-300">Service Attended</label>
            <select
              value={filterService}
              onChange={(e) => { setFilterService(e.target.value); setCurrentPage(1); }}
              className="h-[42px] rounded-lg border border-[#E5E7EB] dark:border-slate-700 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-[#374151] dark:text-slate-300 dark:text-slate-100 outline-none focus:border-[#000080] dark:focus:border-indigo-500 focus:ring-1 focus:ring-[#000080] dark:focus:ring-indigo-500"
            >
              <option value="">All Services</option>
              <option value="Sunday Service">Sunday Service</option>
              <option value="Tuesday Service">Tuesday Service</option>
              <option value="Thursday Service">Thursday Service</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 block text-xs font-medium text-[#374151] dark:text-slate-300">From</label>
            <input type="date" value={filterDateFrom} onChange={(e) => { setFilterDateFrom(e.target.value); setCurrentPage(1); }} className="h-[42px] rounded-lg border border-[#E5E7EB] dark:border-slate-700 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-[#374151] dark:text-slate-300 dark:text-slate-100 outline-none focus:border-[#000080] dark:focus:border-indigo-500 focus:ring-1 focus:ring-[#000080] dark:focus:ring-indigo-500" />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 block text-xs font-medium text-[#374151] dark:text-slate-300">To</label>
            <input type="date" value={filterDateTo} onChange={(e) => { setFilterDateTo(e.target.value); setCurrentPage(1); }} className="h-[42px] rounded-lg border border-[#E5E7EB] dark:border-slate-700 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-[#374151] dark:text-slate-300 dark:text-slate-100 outline-none focus:border-[#000080] dark:focus:border-indigo-500 focus:ring-1 focus:ring-[#000080] dark:focus:ring-indigo-500" />
          </div>
          <button
            onClick={() => { setFilterService(""); setFilterDateFrom(""); setFilterDateTo(""); setCurrentPage(1); }}
            className="h-[42px] rounded-lg border border-[#E5E7EB] dark:border-slate-700 dark:border-slate-600 px-4 text-sm text-[#374151] dark:text-slate-300 hover:bg-gray-50 dark:bg-slate-700/50 dark:hover:bg-slate-700"
          >
            Clear
          </button>
        </div>
      )}

      {/* API error */}
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={() => fetchTimers(currentPage, activeSearch)}>
            Retry
          </button>
        </div>
      )}

      {/* Action error */}
      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {selectedRows.size > 0 && (
        <div className="mb-2 text-sm text-gray-500 dark:text-slate-400">
          {selectedRows.size} first timer{selectedRows.size > 1 ? "s" : ""} selected
        </div>
      )}

      {/* Table */}
      {/* Mobile card view */}
      <div className="sm:hidden space-y-3 mb-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-2">
              <div className="skeleton h-4 w-32" /><div className="skeleton h-3 w-24" />
            </div>
          ))
        ) : displayedTimers.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-8">No first timers found.</p>
        ) : (
          displayedTimers.map((ft) => (
            <div
              key={ft.id}
              onClick={() => router.push(`/user-management/first-timers/${ft.id}`)}
              className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 cursor-pointer hover:bg-gray-50 dark:bg-slate-700/50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <UserAvatar
                id={ft.id}
                firstName={ft.firstName}
                lastName={ft.lastName}
                profilePictureUrl={ft.profilePictureUrl}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#111827] dark:text-slate-100 truncate">{fullName(ft)}</p>
                <p className="text-xs text-[#6B7280] dark:text-slate-400">{ft.phoneNumber}</p>
                <p className="text-xs text-[#9CA3AF] dark:text-slate-500">Calls: {ft.noOfCalls ?? 0} · Visits: {ft.noOfVisits ?? 0}</p>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <ActionDropdown
                  actions={[
                    { label: "View", onClick: () => router.push(`/user-management/first-timers/${ft.id}`) },
                    { label: "Edit", onClick: () => router.push(`/user-management/first-timers/${ft.id}/edit`) },
                    { label: "Add Call Report", onClick: () => { setSelectedTimerId(ft.id); setShowCallReportModal(true); } },
                    { label: "Add Visit Report", onClick: () => { setSelectedTimerId(ft.id); setShowVisitReportModal(true); } },
                  ]}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Table — hidden on mobile */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] dark:bg-slate-700/30">
              <th className="px-4 py-4">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] dark:text-indigo-400 focus:ring-[#000080]"
                />
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Name</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Phone</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Email</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Service Attended</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Assigned Follow-up</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Calls</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Visits</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} columns={9} />)
            ) : displayedTimers.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">No first timers found.</td>
              </tr>
            ) : (
              displayedTimers.map((ft) => (
                <tr
                  key={ft.id}
                  className="border-b border-[#F3F4F6] dark:border-slate-700 transition-colors hover:bg-gray-50 dark:bg-slate-700/50 dark:hover:bg-slate-700/50 cursor-pointer"
                  style={{ height: "56px" }}
                  onClick={() => router.push(`/user-management/first-timers/${ft.id}`)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(ft.id)}
                      onChange={() => handleSelectRow(ft.id)}
                      className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] dark:text-indigo-400 focus:ring-[#000080]"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-[#374151] dark:text-slate-300 max-w-[200px]"><span className="block truncate">{fullName(ft)}</span></td>
                  <td className="px-4 py-3 text-sm text-[#374151] dark:text-slate-300">{ft.phoneNumber}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">{ft.email}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">
                    {ft.serviceAttended || <span className="text-[#9CA3AF] dark:text-slate-500">—</span>}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">
                    {ft.assignedFollowUp ? fullName(ft.assignedFollowUp) : <span className="text-[#9CA3AF] dark:text-slate-500">—</span>}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">{ft.noOfCalls ?? 0}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">{ft.noOfVisits ?? 0}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <ActionDropdown
                      actions={[
                        { label: "View", onClick: () => router.push(`/user-management/first-timers/${ft.id}`) },
                        { label: "Edit", onClick: () => router.push(`/user-management/first-timers/${ft.id}/edit`) },
                        {
                          label: "Add Call Report",
                          onClick: () => { setSelectedTimerId(ft.id); setShowCallReportModal(true); },
                        },
                        {
                          label: "Add Visit Report",
                          onClick: () => { setSelectedTimerId(ft.id); setShowVisitReportModal(true); },
                        },
                        {
                          label: "Assign Follow-up",
                          onClick: () => { setSelectedTimerId(ft.id); setShowSingleAssignModal(true); },
                        },
                        {
                          label: "Convert to Second Timer",
                          onClick: () => handleConvertToSecondTimer(ft.id),
                        },
                        {
                          label: "Mark as Inactive",
                          onClick: () => { setSelectedTimerId(ft.id); setShowInactiveSingleModal(true); },
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

      {/* Add Call Report Modal */}
      <Modal
        isOpen={showCallReportModal}
        onClose={() => { setShowCallReportModal(false); setSelectedTimerId(null); setCallReport(""); }}
        title="Add Call Report"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Report</label>
            <textarea
              value={callReport}
              onChange={(e) => setCallReport(e.target.value)}
              placeholder="Enter Report"
              rows={5}
              className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none placeholder:text-gray-400 dark:text-slate-500 focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
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

      {/* Add Visit Report Modal */}
      <Modal
        isOpen={showVisitReportModal}
        onClose={() => { setShowVisitReportModal(false); setSelectedTimerId(null); setVisitReport(""); }}
        title="Add Visit Report"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">Report</label>
            <textarea
              value={visitReport}
              onChange={(e) => setVisitReport(e.target.value)}
              placeholder="Enter Report"
              rows={5}
              className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none placeholder:text-gray-400 dark:text-slate-500 focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
            />
          </div>
          <button
            onClick={handleSaveVisitReport}
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

      <QRCodeModal
        isOpen={showQRCodeModal}
        onClose={() => setShowQRCodeModal(false)}
        value="/user-management/first-timers/add"
        title="First Timer Registration QR Code"
      />

      <NoLongerMemberModal
        isOpen={showInactiveSingleModal}
        onClose={() => { setShowInactiveSingleModal(false); setSelectedTimerId(null); }}
        onConfirm={handleMarkInactive}
      />

      <NoLongerMemberModal
        isOpen={showInactiveBulkModal}
        onClose={() => setShowInactiveBulkModal(false)}
        onConfirm={handleBulkMarkInactive}
        count={selectedRows.size}
      />
    </DashboardLayout>
  );
}
