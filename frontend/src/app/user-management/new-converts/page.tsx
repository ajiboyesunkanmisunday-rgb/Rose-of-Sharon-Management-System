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
import MarkAttendanceModal from "@/components/user-management/MarkAttendanceModal";
import BulkImportModal from "@/components/user-management/BulkImportModal";
import QRCodeModal from "@/components/user-management/QRCodeModal";
import Modal from "@/components/ui/Modal";
import {
  getNewConverts,
  deleteNewConvertsBulk,
  addCallReport,
  addVisitReport,
  updateBelieversClass,
  updateBelieversClassBulk,
  toBelieverClassStage,
  markUserAsInactive,
  type NewConvertResponse,
} from "@/lib/api";
import { toCSV, downloadCSV } from "@/lib/csv";
import { Sparkles } from "lucide-react";
import UserAvatar from "@/components/ui/UserAvatar";
import { SkeletonRow } from "@/components/ui/Skeleton";

const ITEMS_PER_PAGE = 10;

const BELIEVERS_CLASSES = ["All", "Not started", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"] as const;
type BelieversClassFilter = (typeof BELIEVERS_CLASSES)[number];

function fullName(u: NewConvertResponse): string {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ");
}

export default function NewConvertsPage() {
  const router = useRouter();

  // Data
  const [converts, setConverts] = useState<NewConvertResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // UI
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [believersClassFilter, setBelieversClassFilter] = useState<BelieversClassFilter>("All");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  // Modal states
  const [showCallReportModal, setShowCallReportModal] = useState(false);
  const [showVisitReportModal, setShowVisitReportModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [showInactiveSingleModal, setShowInactiveSingleModal] = useState(false);
  const [showInactiveBulkModal, setShowInactiveBulkModal] = useState(false);
  const [showBulkClassModal, setShowBulkClassModal] = useState(false);
  const [bulkClassStage, setBulkClassStage] = useState("");
  const [callReport, setCallReport] = useState("");
  const [visitReport, setVisitReport] = useState("");
  const [selectedConvertId, setSelectedConvertId] = useState<string | null>(null);

  const fetchConverts = useCallback(async (page: number) => {
    setLoading(true);
    setApiError("");
    try {
      const res = await getNewConverts(page - 1, ITEMS_PER_PAGE);
      setConverts(res.content ?? []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.totalElements || 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load new converts.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConverts(currentPage);
  }, [currentPage, fetchConverts]);

  const displayedConverts = converts.filter((nc) => {
    if (believersClassFilter !== "All") {
      const cls = nc.believerClassStage || "Not started";
      if (cls !== believersClassFilter) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        fullName(nc).toLowerCase().includes(q) ||
        (nc.email ?? "").toLowerCase().includes(q) ||
        (nc.phoneNumber ?? "").includes(q)
      );
    }
    return true;
  });

  const selectedConvert: NewConvertResponse | null = converts.find((nc) => nc.id === selectedConvertId) ?? null;

  const handleSelectAll = (checked: boolean) => {
    const next = new Set(selectedRows);
    displayedConverts.forEach((nc) => (checked ? next.add(nc.id) : next.delete(nc.id)));
    setSelectedRows(next);
  };

  const handleSelectRow = (id: string) => {
    const next = new Set(selectedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedRows(next);
  };

  const allPageSelected =
    displayedConverts.length > 0 && displayedConverts.every((nc) => selectedRows.has(nc.id));

  const handleSaveCallReport = async () => {
    if (!selectedConvertId) return;
    setActionLoading(true);
    setActionError("");
    try {
      await addCallReport(selectedConvertId, callReport);
      setCallReport("");
      setShowCallReportModal(false);
      setSelectedConvertId(null);
      fetchConverts(currentPage);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save call report.";
      setActionError(
        msg.toLowerCase().includes("user not found") || msg.toLowerCase().includes("not found")
          ? "Call reports for New Converts are not yet supported by the backend. Please ask the backend team to enable notes for the new_converts table."
          : msg
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveVisitReport = async () => {
    if (!selectedConvertId) return;
    setActionLoading(true);
    setActionError("");
    try {
      await addVisitReport(selectedConvertId, visitReport);
      setVisitReport("");
      setShowVisitReportModal(false);
      setSelectedConvertId(null);
      fetchConverts(currentPage);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save visit report.";
      setActionError(
        msg.toLowerCase().includes("user not found") || msg.toLowerCase().includes("not found")
          ? "Visit reports for New Converts are not yet supported by the backend. Please ask the backend team to enable notes for the new_converts table."
          : msg
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      await deleteNewConvertsBulk(Array.from(selectedRows));
      setSelectedRows(new Set());
      setShowBulkDeleteModal(false);
      fetchConverts(currentPage);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete.");
      setShowBulkDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveAttendance = async (highestClass: string) => {
    if (!selectedConvertId) return;
    setActionLoading(true);
    try {
      await updateBelieversClass(selectedConvertId, toBelieverClassStage(highestClass));
      setShowAttendanceModal(false);
      setSelectedConvertId(null);
      fetchConverts(currentPage);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update believers class.");
      setShowAttendanceModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkInactive = async (reason: string) => {
    if (!selectedConvertId) return;
    setActionLoading(true);
    setActionError("");
    try {
      await markUserAsInactive(selectedConvertId, reason);
      setShowInactiveSingleModal(false);
      setSelectedConvertId(null);
      fetchConverts(currentPage);
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
      fetchConverts(currentPage);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to mark as inactive.");
      setShowInactiveBulkModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkClassUpdate = async () => {
    if (!bulkClassStage) return;
    setActionLoading(true);
    setActionError("");
    try {
      await updateBelieversClassBulk(Array.from(selectedRows), toBelieverClassStage(bulkClassStage));
      setShowBulkClassModal(false);
      setBulkClassStage("");
      setSelectedRows(new Set());
      fetchConverts(currentPage);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update believers class.");
      setShowBulkClassModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = () => {
    const csv = toCSV(
      displayedConverts.map((nc) => ({
        id: nc.id,
        firstName: nc.firstName,
        middleName: nc.middleName ?? "",
        lastName: nc.lastName,
        email: nc.email,
        phone: nc.phoneNumber,
        serviceAttended: nc.service?.title ?? "",
        believersClass: nc.believerClassStage ?? "Not started",
        createdOn: nc.createdOn ?? "",
      }))
    );
    downloadCSV(csv, `new-converts-export-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const CLASS_OPTIONS_BULK = ["Class 1", "Class 2", "Class 3", "Class 4", "Completed"];

  const bulkActions = [
    { label: "Update Believers Class", onClick: () => setShowBulkClassModal(true) },
    { label: "Mark as Inactive", onClick: () => setShowInactiveBulkModal(true) },
    { label: "Delete", onClick: () => setShowBulkDeleteModal(true) },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FDF4FF]">
          <Sparkles className="h-6 w-6 text-[#A21CAF]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">New Converts</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Disciple and track growth of newly saved members</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-72">
            <SearchBar
              value={search}
              onChange={(val) => { setSearch(val); setCurrentPage(1); }}
              onSearch={() => setCurrentPage(1)}
              placeholder="Search..."
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="believers-class-filter" className="whitespace-nowrap text-sm font-medium text-[#374151] dark:text-slate-300">
              Believers Class
            </label>
            <select
              id="believers-class-filter"
              value={believersClassFilter}
              onChange={(e) => { setBelieversClassFilter(e.target.value as BelieversClassFilter); setCurrentPage(1); }}
              className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-[#374151] dark:text-slate-300 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
            >
              {BELIEVERS_CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedRows.size > 0 && <ActionDropdown actions={bulkActions} />}

          <Link href="/user-management/new-converts/add">
            <Button
              variant="primary"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            >
              Add New Convert
            </Button>
          </Link>

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

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={() => fetchConverts(currentPage)}>Retry</button>
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {selectedRows.size > 0 && (
        <div className="mb-2 text-sm text-gray-500 dark:text-slate-400">
          {selectedRows.size} new convert{selectedRows.size > 1 ? "s" : ""} selected
        </div>
      )}

      {/* Mobile card view */}
      <div className="sm:hidden space-y-3 mb-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-2">
              <div className="skeleton h-4 w-36" /><div className="skeleton h-3 w-24" />
            </div>
          ))
        ) : displayedConverts.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-slate-500 py-8">No new converts found.</p>
        ) : (
          displayedConverts.map((nc) => (
            <div
              key={nc.id}
              onClick={() => router.push(`/user-management/new-converts/${nc.id}`)}
              className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:bg-slate-700/50 transition-colors"
            >
              <UserAvatar
                id={nc.id}
                firstName={nc.firstName}
                lastName={nc.lastName}
                profilePictureUrl={nc.profilePictureUrl}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111827] dark:text-slate-100 truncate">{fullName(nc)}</p>
                <p className="text-xs text-[#6B7280] dark:text-slate-400 truncate">{nc.phoneNumber}</p>
                <p className="text-xs text-[#9CA3AF] dark:text-slate-400">{nc.believerClassStage || "Not started"}</p>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <ActionDropdown
                  actions={[
                    { label: "View", onClick: () => router.push(`/user-management/new-converts/${nc.id}`) },
                    { label: "Add Call Report", onClick: () => { setSelectedConvertId(nc.id); setShowCallReportModal(true); } },
                    { label: "Add Visit Report", onClick: () => { setSelectedConvertId(nc.id); setShowVisitReportModal(true); } },
                    { label: "Mark Class Attendance", onClick: () => { setSelectedConvertId(nc.id); setShowAttendanceModal(true); } },
                    { label: "Mark as Inactive", onClick: () => { setSelectedConvertId(nc.id); setShowInactiveSingleModal(true); } },
                  ]}
                />
              </div>
            </div>
          ))
        )}
      </div>

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
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Believers Class</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Date Added</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} columns={8} />)
            ) : displayedConverts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">No new converts found.</td>
              </tr>
            ) : (
              displayedConverts.map((nc) => (
                <tr
                  key={nc.id}
                  className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:bg-slate-700/50 cursor-pointer"
                  style={{ height: "56px" }}
                  onClick={() => router.push(`/user-management/new-converts/${nc.id}`)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(nc.id)}
                      onChange={() => handleSelectRow(nc.id)}
                      className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] dark:text-indigo-400 focus:ring-[#000080]"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-[#374151] dark:text-slate-300 max-w-[200px]"><span className="block truncate">{fullName(nc)}</span></td>
                  <td className="px-4 py-3 text-sm text-[#374151] dark:text-slate-300">{nc.phoneNumber}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">{nc.email}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">
                    {nc.service?.title || <span className="text-[#9CA3AF] dark:text-slate-400">—</span>}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">
                    {nc.believerClassStage || "Not started"}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">
                    {nc.createdOn ? nc.createdOn.slice(0, 10) : <span className="text-[#9CA3AF] dark:text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <ActionDropdown
                      actions={[
                        { label: "View", onClick: () => router.push(`/user-management/new-converts/${nc.id}`) },
                        {
                          label: "Add Call Report",
                          onClick: () => { setSelectedConvertId(nc.id); setShowCallReportModal(true); },
                        },
                        {
                          label: "Add Visit Report",
                          onClick: () => { setSelectedConvertId(nc.id); setShowVisitReportModal(true); },
                        },
                        {
                          label: "Mark Class Attendance",
                          onClick: () => { setSelectedConvertId(nc.id); setShowAttendanceModal(true); },
                        },
                        {
                          label: "Mark as Inactive",
                          onClick: () => { setSelectedConvertId(nc.id); setShowInactiveSingleModal(true); },
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

      <Modal
        isOpen={showCallReportModal}
        onClose={() => { setShowCallReportModal(false); setSelectedConvertId(null); setCallReport(""); }}
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

      <Modal
        isOpen={showVisitReportModal}
        onClose={() => { setShowVisitReportModal(false); setSelectedConvertId(null); setVisitReport(""); }}
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
        message={`Are you sure you want to delete ${selectedRows.size} selected new convert${selectedRows.size === 1 ? "" : "s"}?`}
      />

      <MarkAttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => { setShowAttendanceModal(false); setSelectedConvertId(null); }}
        onSave={handleSaveAttendance}
        memberName={selectedConvert ? fullName(selectedConvert) : ""}
        initial={selectedConvert?.believerClassStage ?? "Not started"}
      />

      <BulkImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        onImport={(rows) => {
          console.log("Bulk import New Converts:", rows);
          setShowBulkImportModal(false);
        }}
        module="New Converts"
        templateHeaders={["firstName","middleName","lastName","gender","countryCode","phone","email","serviceAttended","address"]}
        templateSampleRow={["Sam","","Taylor","Male","+1","5551234567","sam@example.com","Sunday Service","123 Main St"]}
      />

      <QRCodeModal
        isOpen={showQRCodeModal}
        onClose={() => setShowQRCodeModal(false)}
        value="/user-management/new-converts/add"
        title="New Convert Registration QR Code"
      />

      <NoLongerMemberModal
        isOpen={showInactiveSingleModal}
        onClose={() => { setShowInactiveSingleModal(false); setSelectedConvertId(null); }}
        onConfirm={handleMarkInactive}
      />

      <NoLongerMemberModal
        isOpen={showInactiveBulkModal}
        onClose={() => setShowInactiveBulkModal(false)}
        onConfirm={handleBulkMarkInactive}
        count={selectedRows.size}
      />

      {/* Bulk Believers Class Update Modal */}
      {showBulkClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-xl">
            <h3 className="mb-1 text-lg font-bold text-[#111827] dark:text-slate-100">Update Believers Class</h3>
            <p className="mb-5 text-sm text-[#6B7280] dark:text-slate-400">
              Set the believers class stage for{" "}
              <strong className="text-[#111827] dark:text-slate-100">{selectedRows.size}</strong>{" "}
              selected convert{selectedRows.size !== 1 ? "s" : ""}.
            </p>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">Class Stage</label>
            <select
              value={bulkClassStage}
              onChange={(e) => setBulkClassStage(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
            >
              <option value="">Select stage…</option>
              {CLASS_OPTIONS_BULK.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => { setShowBulkClassModal(false); setBulkClassStage(""); }}
                className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-[#374151] dark:text-slate-300 hover:bg-[#F9FAFB]"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkClassUpdate}
                disabled={actionLoading || !bulkClassStage}
                className="rounded-lg bg-[#000080] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#000066] disabled:opacity-50"
              >
                {actionLoading ? "Updating…" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
