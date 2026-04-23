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
import MarkAttendanceModal from "@/components/user-management/MarkAttendanceModal";
import BulkImportModal from "@/components/user-management/BulkImportModal";
import Modal from "@/components/ui/Modal";
import { newConverts } from "@/lib/mock-data";
import { toCSV, downloadCSV } from "@/lib/csv";
import type { BelieversClass } from "@/lib/types";

type BelieversClassFilter = "All" | BelieversClass;

const BELIEVERS_CLASS_FILTERS: BelieversClassFilter[] = [
  "All",
  "Not started",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
];


const ITEMS_PER_PAGE = 10;

export default function NewConvertsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Modal states
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showCallReportModal, setShowCallReportModal] = useState(false);
  const [showVisitReportModal, setShowVisitReportModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [callReport, setCallReport] = useState("");
  const [visitReport, setVisitReport] = useState("");
  const [selectedConvertId, setSelectedConvertId] = useState<string | null>(null);
  const [believersClassFilter, setBelieversClassFilter] =
    useState<BelieversClassFilter>("All");

  const filteredConverts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return newConverts.filter((nc) => {
      if (query) {
        const match =
          nc.name.toLowerCase().includes(query) ||
          nc.email.toLowerCase().includes(query) ||
          nc.phone.includes(query);
        if (!match) return false;
      }
      if (believersClassFilter !== "All") {
        if ((nc.believersClass || "Not started") !== believersClassFilter) {
          return false;
        }
      }
      return true;
    });
  }, [search, believersClassFilter]);

  const totalPages = Math.ceil(filteredConverts.length / ITEMS_PER_PAGE);
  const paginatedConverts = filteredConverts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const selectedConvert = useMemo(
    () => newConverts.find((nc) => nc.id === selectedConvertId) || null,
    [selectedConvertId]
  );

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedRows);
      paginatedConverts.forEach((nc) => newSelected.add(nc.id));
      setSelectedRows(newSelected);
    } else {
      const newSelected = new Set(selectedRows);
      paginatedConverts.forEach((nc) => newSelected.delete(nc.id));
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
    paginatedConverts.length > 0 &&
    paginatedConverts.every((nc) => selectedRows.has(nc.id));

  const handleSaveCallReport = () => {
    console.log("Save call report for:", selectedConvertId, callReport);
    setCallReport("");
    setShowCallReportModal(false);
    setSelectedConvertId(null);
  };

  const handleSaveVisitReport = () => {
    console.log("Save visit report for:", selectedConvertId, visitReport);
    setVisitReport("");
    setShowVisitReportModal(false);
    setSelectedConvertId(null);
  };

  const handleBulkDeleteConfirm = () => {
    console.log("Bulk delete new converts:", Array.from(selectedRows));
    setSelectedRows(new Set());
    setShowBulkDeleteModal(false);
  };

  const handleSaveAttendance = (highestClass: string) => {
    const classCount = 5;
    const highestIndex = highestClass
      ? parseInt(highestClass.replace(/[^0-9]/g, ""), 10)
      : 0;
    const attendance = Array.from(
      { length: classCount },
      (_, i) => i < highestIndex
    );
    console.log(
      "Save attendance for:",
      selectedConvertId,
      highestClass,
      attendance
    );
    setShowAttendanceModal(false);
    setSelectedConvertId(null);
  };

  const highestClassFromAttendance = (
    classAttendance?: boolean[]
  ): string => {
    if (!classAttendance || classAttendance.length === 0) return "";
    let lastTrue = -1;
    classAttendance.forEach((v, i) => {
      if (v) lastTrue = i;
    });
    return lastTrue >= 0 ? `Class ${lastTrue + 1}` : "";
  };

  const handleExport = () => {
    const csv = toCSV(
      filteredConverts.map((nc) => ({
        id: nc.id,
        firstName: nc.firstName || "",
        lastName: nc.lastName || "",
        phone: nc.phone,
        email: nc.email,
        serviceAttended: nc.serviceAttended,
        believersClass: nc.believersClass,
        date: nc.date,
      }))
    );
    downloadCSV(
      csv,
      `new-converts-export-${new Date().toISOString().slice(0, 10)}.csv`
    );
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
      label: "Delete",
      onClick: () => setShowBulkDeleteModal(true),
    },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">User Management</h1>
        <h2 className="text-[22px] font-bold text-[#000080]">New Converts</h2>
      </div>

      {/* Top bar: search + actions */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-72">
            <SearchBar
              value={search}
              onChange={setSearch}
              onSearch={handleSearch}
              placeholder="Search..."
            />
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="believers-class-filter"
              className="whitespace-nowrap text-sm font-medium text-[#374151]"
            >
              Filter by Believers Class
            </label>
            <select
              id="believers-class-filter"
              value={believersClassFilter}
              onChange={(e) => {
                setBelieversClassFilter(e.target.value as BelieversClassFilter);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
            >
              {BELIEVERS_CLASS_FILTERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedRows.size > 0 && (
            <ActionDropdown actions={bulkActions} />
          )}

          <Link href="/user-management/new-converts/add">
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
              Add New Convert
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

          <Button onClick={() => {}}
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

      {/* Selected count indicator */}
      {selectedRows.size > 0 && (
        <div className="mb-2 text-sm text-gray-500">
          {selectedRows.size} new convert{selectedRows.size > 1 ? "s" : ""}{" "}
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
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Service Attended
              </th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">
                Believers Class
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Date</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedConverts.map((nc) => (
              <tr
                key={nc.id}
                className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                style={{ height: "56px" }}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(nc.id)}
                    onChange={() => handleSelectRow(nc.id)}
                    className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] focus:ring-[#000080]"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">{nc.name}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{nc.phone}</td>
                <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">{nc.email}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {nc.serviceAttended}
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                  {nc.believersClass || "Not started"}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">{nc.date}</td>
                <td className="px-4 py-3">
                  <ActionDropdown
                    actions={[
                      {
                        label: "View",
                        onClick: () =>
                          router.push(`/user-management/new-converts/${nc.id}`),
                      },
                      {
                        label: "Add Notes",
                        onClick: () => {
                          setSelectedConvertId(nc.id);
                          setShowNotesModal(true);
                        },
                      },
                      {
                        label: "Add Call Report",
                        onClick: () => {
                          setSelectedConvertId(nc.id);
                          setShowCallReportModal(true);
                        },
                      },
                      {
                        label: "Add Visit Report",
                        onClick: () => {
                          setSelectedConvertId(nc.id);
                          setShowVisitReportModal(true);
                        },
                      },
                      {
                        label: "Mark Class Attendance",
                        onClick: () => {
                          setSelectedConvertId(nc.id);
                          setShowAttendanceModal(true);
                        },
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {paginatedConverts.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No new converts found.
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
          totalItems={filteredConverts.length}
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

      {/* Add Visit Report Modal */}
      <Modal
        isOpen={showVisitReportModal}
        onClose={() => setShowVisitReportModal(false)}
        title="Add Visit Report"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Report
            </label>
            <textarea
              value={visitReport}
              onChange={(e) => setVisitReport(e.target.value)}
              placeholder="Enter Report"
              rows={5}
              className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-gray-400 focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
            />
          </div>
          <button
            onClick={handleSaveVisitReport}
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
        message={`Are you sure you want to delete ${selectedRows.size} selected new convert${selectedRows.size === 1 ? "" : "s"}?`}
      />

      <MarkAttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => {
          setShowAttendanceModal(false);
          setSelectedConvertId(null);
        }}
        onSave={handleSaveAttendance}
        memberName={selectedConvert?.name || ""}
        initial={highestClassFromAttendance(selectedConvert?.classAttendance)}
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
    </DashboardLayout>
  );
}
