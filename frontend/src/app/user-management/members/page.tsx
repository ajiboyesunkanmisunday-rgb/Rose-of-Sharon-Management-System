"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import SendSMSModal from "@/components/user-management/SendSMSModal";
import SendEmailModal from "@/components/user-management/SendEmailModal";
import FilterExportModal from "@/components/user-management/FilterExportModal";
import QRCodeModal from "@/components/user-management/QRCodeModal";
import AddNotesModal from "@/components/user-management/AddNotesModal";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { members } from "@/lib/mock-data";
import { Member } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

export default function MembersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Modal states
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showFilterExportModal, setShowFilterExportModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    const query = search.toLowerCase();
    return members.filter(
      (m) =>
        m.firstName.toLowerCase().includes(query) ||
        m.lastName.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.phone.includes(query)
    );
  }, [search]);

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedRows);
      paginatedMembers.forEach((m) => newSelected.add(m.id));
      setSelectedRows(newSelected);
    } else {
      const newSelected = new Set(selectedRows);
      paginatedMembers.forEach((m) => newSelected.delete(m.id));
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
    paginatedMembers.length > 0 &&
    paginatedMembers.every((m) => selectedRows.has(m.id));

  const handleDeleteClick = (id: string) => {
    setSelectedMemberId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    console.log("Delete member:", selectedMemberId);
    setShowDeleteModal(false);
    setSelectedMemberId(null);
  };

  const handleAddNotesClick = (id: string) => {
    setSelectedMemberId(id);
    setShowNotesModal(true);
  };

  const getMemberById = (id: string): Member | undefined => {
    return members.find((m) => m.id === id);
  };

  const bulkActions = [
    {
      label: "Send SMS",
      onClick: () => setShowSMSModal(true),
    },
    {
      label: "Send Email",
      onClick: () => setShowEmailModal(true),
    },
    {
      label: "Delete",
      onClick: () => setShowBulkDeleteModal(true),
    },
  ];

  const handleBulkDeleteConfirm = () => {
    console.log("Bulk delete members:", Array.from(selectedRows));
    setSelectedRows(new Set());
    setShowBulkDeleteModal(false);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">User Management</h1>
        <h2 className="text-[22px] font-bold text-[#000080]">Members</h2>
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

          <Button
            variant="primary"
            onClick={() => router.push("/user-management/members/add")}
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
            Add Member
          </Button>

          <Button onClick={() => setShowQRCodeModal(true)}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            }
          >QR Code</Button>

          <Button onClick={() => setShowFilterExportModal(true)}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            }
          >
            Filter &amp; Export
          </Button>

          <Button onClick={() => {}}
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
          {selectedRows.size} member{selectedRows.size > 1 ? "s" : ""} selected
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
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                First Name
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Last Name
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Phone</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Email</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedMembers.map((member) => (
              <tr
                key={member.id}
                className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                style={{ height: "56px" }}
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
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {member.firstName}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">{member.lastName}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{member.phone}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{member.email}</td>
                <td className="px-4 py-3">
                  <ActionDropdown
                    actions={[
                      {
                        label: "View Profile",
                        onClick: () =>
                          router.push(`/user-management/members/${member.id}`),
                      },
                      {
                        label: "Edit",
                        onClick: () =>
                          router.push(`/user-management/members/${member.id}/edit`),
                      },
                      {
                        label: "Add Notes",
                        onClick: () => handleAddNotesClick(member.id),
                      },
                      {
                        label: "Link Spouse",
                        onClick: () =>
                          router.push(`/user-management/members/${member.id}/link-spouse`),
                      },
                      {
                        label: "Delete",
                        onClick: () => handleDeleteClick(member.id),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {paginatedMembers.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No members found.
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

      {/* Modals */}
      <SendSMSModal
        isOpen={showSMSModal}
        onClose={() => setShowSMSModal(false)}
        selectedCount={selectedRows.size}
      />
      <SendEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        selectedCount={selectedRows.size}
      />
      <FilterExportModal
        isOpen={showFilterExportModal}
        onClose={() => setShowFilterExportModal(false)}
      />
      <QRCodeModal
        isOpen={showQRCodeModal}
        onClose={() => setShowQRCodeModal(false)}
      />
      <AddNotesModal
        isOpen={showNotesModal}
        onClose={() => {
          setShowNotesModal(false);
          setSelectedMemberId(null);
        }}
      />
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMemberId(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <DeleteConfirmModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDeleteConfirm}
        message={`Are you sure you want to delete ${selectedRows.size} selected member${selectedRows.size === 1 ? "" : "s"}?`}
      />
    </DashboardLayout>
  );
}
