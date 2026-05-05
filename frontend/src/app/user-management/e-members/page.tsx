"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import SendSMSModal from "@/components/user-management/SendSMSModal";
import SendEmailModal from "@/components/user-management/SendEmailModal";
import QRCodeModal from "@/components/user-management/QRCodeModal";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import BulkImportModal from "@/components/user-management/BulkImportModal";
import NoLongerMemberModal from "@/components/user-management/NoLongerMemberModal";
import {
  getEMembers,
  deleteEMembersBulk,
  type UserResponse,
} from "@/lib/api";
import { toCSV, downloadCSV } from "@/lib/csv";

const ITEMS_PER_PAGE = 10;

export default function EMembersPage() {
  const router = useRouter();

  // Data
  const [eMembers, setEMembers] = useState<UserResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // UI state
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Modal states
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showNoLongerBulkModal, setShowNoLongerBulkModal] = useState(false);
  const [showNoLongerSingleModal, setShowNoLongerSingleModal] = useState(false);
  const [selectedEMemberId, setSelectedEMemberId] = useState<string | null>(null);

  // Inline filter state
  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchEMembers = useCallback(async (page: number) => {
    setLoading(true);
    setApiError("");
    try {
      const res = await getEMembers(page - 1, ITEMS_PER_PAGE);
      setEMembers(res.content ?? []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.totalElements || 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load e-members.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEMembers(currentPage);
  }, [currentPage, fetchEMembers]);

  const handleSearch = () => setCurrentPage(1);

  const displayedEMembers = search.trim()
    ? eMembers.filter((m) => {
        const q = search.toLowerCase();
        return (
          m.firstName.toLowerCase().includes(q) ||
          m.lastName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.phoneNumber.includes(q) ||
          (m.country ?? "").toLowerCase().includes(q)
        );
      })
    : eMembers;

  const handleSelectAll = (checked: boolean) => {
    const next = new Set(selectedRows);
    displayedEMembers.forEach((m) => (checked ? next.add(m.id) : next.delete(m.id)));
    setSelectedRows(next);
  };

  const handleSelectRow = (id: string) => {
    const next = new Set(selectedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedRows(next);
  };

  const allPageSelected =
    displayedEMembers.length > 0 &&
    displayedEMembers.every((m) => selectedRows.has(m.id));

  const handleDeleteClick = (id: string) => {
    setSelectedEMemberId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEMemberId) return;
    try {
      await deleteEMembersBulk([selectedEMemberId]);
      setShowDeleteModal(false);
      setSelectedEMemberId(null);
      fetchEMembers(currentPage);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await deleteEMembersBulk(Array.from(selectedRows));
      setSelectedRows(new Set());
      setShowBulkDeleteModal(false);
      fetchEMembers(currentPage);
    } catch (err) {
      console.error("Bulk delete failed:", err);
    }
  };

  const handleNoLongerMemberClick = (id: string) => {
    setSelectedEMemberId(id);
    setShowNoLongerSingleModal(true);
  };

  const bulkActions = [
    { label: "Send SMS", onClick: () => setShowSMSModal(true) },
    { label: "Send Email", onClick: () => setShowEmailModal(true) },
    { label: "Mark as Inactive", onClick: () => setShowNoLongerBulkModal(true) },
    { label: "Delete", onClick: () => setShowBulkDeleteModal(true) },
  ];

  const handleExport = () => {
    const csv = toCSV(
      eMembers.map((m) => ({
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        phone: m.phoneNumber,
        country: m.country || "",
      }))
    );
    downloadCSV(csv, `e-members-export-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">User Management</h1>
        <h2 className="text-[22px] font-bold text-[#000080]">E-Members</h2>
      </div>

      {/* Top bar */}
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
          {selectedRows.size > 0 && <ActionDropdown actions={bulkActions} />}

          <Button
            variant="primary"
            onClick={() => router.push("/user-management/e-members/add")}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          >
            Add E-Member
          </Button>

          <Button
            onClick={() => setShowQRCodeModal(true)}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
            }
          >
            <span className="hidden sm:inline">QR Code</span>
          </Button>

          <Button
            onClick={() => setShowFilter((s) => !s)}
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            }
          >
            <span className="hidden sm:inline">Bulk Import</span>
          </Button>
        </div>
      </div>

      {/* Inline Filter Row */}
      {showFilter && (
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#374151]">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#374151]">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
            />
          </div>
          <Button onClick={handleExport}>Export CSV</Button>
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => { setStartDate(""); setEndDate(""); }}
              className="text-sm font-medium text-[#000080] underline hover:text-[#000066]"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {selectedRows.size > 0 && (
        <div className="mb-2 text-sm text-gray-500">
          {selectedRows.size} e-member{selectedRows.size > 1 ? "s" : ""} selected
        </div>
      )}

      {/* Error banner */}
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={() => fetchEMembers(currentPage)}>
            Retry
          </button>
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
              <th className="px-4 py-4"></th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">First Name</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Last Name</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Country</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Phone</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Email</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  Loading e-members…
                </td>
              </tr>
            ) : displayedEMembers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No e-members found.
                </td>
              </tr>
            ) : (
              displayedEMembers.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50 cursor-pointer"
                  style={{ height: "56px" }}
                  onDoubleClick={() => router.push(`/user-management/e-members/${member.id}`)}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(member.id)}
                      onChange={() => handleSelectRow(member.id)}
                      className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] focus:ring-[#000080]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5E7EB]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#374151]">{member.firstName}</td>
                  <td className="px-4 py-3 text-sm text-[#374151]">{member.lastName}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">{member.country || "—"}</td>
                  <td className="px-4 py-3 text-sm text-[#374151]">{member.phoneNumber}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">{member.email}</td>
                  <td className="px-4 py-3">
                    <ActionDropdown
                      actions={[
                        { label: "View", onClick: () => router.push(`/user-management/e-members/${member.id}`) },
                        { label: "Edit", onClick: () => router.push(`/user-management/e-members/${member.id}/edit`) },
                        { label: "Mark as Inactive", onClick: () => handleNoLongerMemberClick(member.id) },
                        { label: "Delete", onClick: () => handleDeleteClick(member.id) },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={(p) => { setCurrentPage(p); setSelectedRows(new Set()); }}
        />
      </div>

      {/* Modals */}
      <SendSMSModal isOpen={showSMSModal} onClose={() => setShowSMSModal(false)} selectedCount={selectedRows.size} />
      <SendEmailModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} selectedCount={selectedRows.size} />
      <QRCodeModal isOpen={showQRCodeModal} onClose={() => setShowQRCodeModal(false)} />
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedEMemberId(null); }}
        onConfirm={handleConfirmDelete}
      />
      <DeleteConfirmModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDeleteConfirm}
        message={`Are you sure you want to delete ${selectedRows.size} selected e-member${selectedRows.size === 1 ? "" : "s"}?`}
      />
      <NoLongerMemberModal
        isOpen={showNoLongerBulkModal}
        onClose={() => setShowNoLongerBulkModal(false)}
        onConfirm={() => { setSelectedRows(new Set()); setShowNoLongerBulkModal(false); }}
        count={selectedRows.size}
      />
      <NoLongerMemberModal
        isOpen={showNoLongerSingleModal}
        onClose={() => { setShowNoLongerSingleModal(false); setSelectedEMemberId(null); }}
        onConfirm={() => { setShowNoLongerSingleModal(false); setSelectedEMemberId(null); }}
        count={1}
      />
      <BulkImportModal
        isOpen={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        onImport={(rows) => { console.log("Bulk import E-Members:", rows); setShowBulkImportModal(false); }}
        module="E-Members"
        templateHeaders={["firstName","middleName","lastName","email","country","countryCode","phone","dateOfBirth","maritalStatus","serviceAttended"]}
        templateSampleRow={["Jane","","Smith","jane@example.com","United States","+1","5551234567","1992-05-20","Married","Sunday Service"]}
      />
    </DashboardLayout>
  );
}
