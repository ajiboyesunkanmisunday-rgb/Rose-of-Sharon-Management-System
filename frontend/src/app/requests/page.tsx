"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import StatusFilterTabs from "@/components/ui/StatusFilterTabs";
import BulkActionsBar from "@/components/ui/BulkActionsBar";
import Modal from "@/components/ui/Modal";
import {
  getAllRequests,
  getCounselingRequests,
  getPrayerRequests,
  getSuggestions,
  changeRequestStatus,
  type RequestResponse,
} from "@/lib/api";

type CategoryFilter = "All" | "Prayer" | "Counseling" | "Suggestion";
type StatusFilter = "All" | "RECEIVED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED";

const ITEMS_PER_PAGE = 10;

const categoryTabs: { key: CategoryFilter; label: string }[] = [
  { key: "All",       label: "All"         },
  { key: "Prayer",    label: "Prayer"      },
  { key: "Counseling",label: "Counseling"  },
  { key: "Suggestion",label: "Suggestions" },
];

const statusFilterOptions: { value: StatusFilter; label: string }[] = [
  { value: "All",         label: "All"         },
  { value: "RECEIVED",    label: "Received"    },
  { value: "ASSIGNED",    label: "Assigned"    },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED",    label: "Resolved"    },
];

const categoryBadgeColors: Record<string, string> = {
  PRAYER:     "bg-[#16A34A] text-white",
  COUNSELING: "bg-[#000080] text-white",
  SUGGESTION: "bg-[#CA8A04] text-white",
};

const statusBadgeColors: Record<string, string> = {
  RECEIVED:    "bg-[#F3F4F6] text-[#6B7280]",
  ASSIGNED:    "bg-[#DBEAFE] text-[#1D4ED8]",
  IN_PROGRESS: "bg-[#FEF9C3] text-[#CA8A04]",
  RESOLVED:    "bg-[#DCFCE7] text-[#16A34A]",
};

function fullName(u?: { firstName?: string; middleName?: string; lastName?: string } | null) {
  if (!u) return "—";
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const selectStyles =
  "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

export default function RequestsPage() {
  const router = useRouter();

  const [requests,     setRequests]     = useState<RequestResponse[]>([]);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalItems,   setTotalItems]   = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [apiError,     setApiError]     = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [search,       setSearch]       = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [activeStatus,   setActiveStatus]   = useState<StatusFilter>("All");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [bulkStatus,   setBulkStatus]   = useState("RESOLVED");
  const [saving,       setSaving]       = useState(false);

  const fetchRequests = useCallback(async (page: number, category: CategoryFilter) => {
    setLoading(true);
    setApiError("");
    try {
      const fn =
        category === "Prayer"     ? getPrayerRequests    :
        category === "Counseling" ? getCounselingRequests :
        category === "Suggestion" ? getSuggestions       :
        getAllRequests;
      const res = await fn(page - 1, ITEMS_PER_PAGE);
      setRequests(res.content ?? []);
      setTotalPages(res.totalPages ?? 1);
      setTotalItems(res.totalElements ?? 0);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(currentPage, activeCategory);
  }, [currentPage, activeCategory, fetchRequests]);

  // Client-side status + search filter on loaded page
  const displayed = requests.filter((r) => {
    if (activeStatus !== "All" && r.requestStatus !== activeStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        (r.subject ?? "").toLowerCase().includes(q) ||
        (r.content ?? "").toLowerCase().includes(q) ||
        fullName(r.owner).toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    const next = new Set(selectedRows);
    displayed.forEach((r) => (checked ? next.add(r.id) : next.delete(r.id)));
    setSelectedRows(next);
  };

  const handleSelectRow = (id: string) => {
    const next = new Set(selectedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedRows(next);
  };

  const allPageSelected =
    displayed.length > 0 && displayed.every((r) => selectedRows.has(r.id));

  const applyBulkStatus = async () => {
    setSaving(true);
    try {
      await Promise.all(Array.from(selectedRows).map((id) => changeRequestStatus(id, bulkStatus)));
      setSelectedRows(new Set());
      setShowStatusModal(false);
      fetchRequests(currentPage, activeCategory);
    } catch {
      // silently re-show modal
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Requests</h1>
      </div>

      {/* Category Tabs */}
      <div className="mb-4 flex items-center overflow-x-auto border-b border-[#E5E7EB]">
        <div className="flex gap-6 sm:gap-8">
          {categoryTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveCategory(tab.key); setCurrentPage(1); }}
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

      {/* Status pills */}
      <div className="mb-4">
        <StatusFilterTabs
          options={statusFilterOptions}
          active={activeStatus}
          onChange={(v) => { setActiveStatus(v as StatusFilter); setCurrentPage(1); }}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={() => setCurrentPage(1)}
            placeholder="Search requests…"
          />
        </div>
        <Button
          variant="primary"
          onClick={() => router.push("/requests/add")}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          }
        >
          New Request
        </Button>
      </div>

      <BulkActionsBar
        count={selectedRows.size}
        onClear={() => setSelectedRows(new Set())}
        labelSingular="request"
        labelPlural="requests"
        actions={[
          { label: "Update Status", onClick: () => setShowStatusModal(true) },
        ]}
      />

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError} — <button className="font-medium underline" onClick={() => fetchRequests(currentPage, activeCategory)}>Retry</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4">
                <input type="checkbox" checked={allPageSelected} onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] focus:ring-[#000080]" />
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Type</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Subject</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Submitted By</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Date</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Status</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Assigned To</th>
              <th className="px-4 py-4"/>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
            ) : displayed.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No requests found.</td></tr>
            ) : (
              displayed.map((r) => (
                <tr key={r.id} className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50" style={{height:"56px"}}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedRows.has(r.id)} onChange={() => handleSelectRow(r.id)}
                      className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] focus:ring-[#000080]" />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${categoryBadgeColors[r.requestType ?? ""] ?? "bg-gray-100 text-gray-600"}`}>
                      {(r.requestType ?? "—").replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#374151]">{r.subject}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                    {r.owner ? fullName(r.owner) : <span className="italic text-gray-400">Anonymous</span>}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151]">{fmtDate(r.createdOn)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusBadgeColors[r.requestStatus ?? ""] ?? "bg-gray-100 text-gray-600"}`}>
                      {(r.requestStatus ?? "—").replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151]">{fullName(r.assignedTo)}</td>
                  <td className="px-4 py-3">
                    <ActionDropdown
                      actions={[
                        { label: "View", onClick: () => router.push(`/requests/${r.id}`) },
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
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} onPageChange={setCurrentPage} />
      </div>

      {/* Status modal */}
      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Update Status">
        <label className="mb-1 block text-sm font-medium text-[#374151]">New Status</label>
        <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className={selectStyles}>
          <option value="RECEIVED">Received</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={applyBulkStatus} disabled={saving}>{saving ? "Saving…" : "Apply"}</Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
