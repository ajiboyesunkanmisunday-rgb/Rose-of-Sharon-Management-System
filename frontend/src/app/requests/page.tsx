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
  getBabyChristeningRequests,
  getBabyDedicationRequests,
  searchBabyChristeningRequests,
  searchBabyDedicationRequests,
  changeRequestStatus,
  getStoredUser,
  type RequestResponse,
} from "@/lib/api";
import { Inbox } from "lucide-react";

type CategoryFilter = "All" | "Prayer" | "Counseling" | "Suggestion" | "BabyChristening" | "BabyDedication";
type StatusFilter = "All" | "RECEIVED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED";

const ITEMS_PER_PAGE = 10;

const categoryTabs: { key: CategoryFilter; label: string }[] = [
  { key: "All",             label: "All"              },
  { key: "Prayer",          label: "Prayer"           },
  { key: "Counseling",      label: "Counseling"       },
  { key: "Suggestion",      label: "Suggestions"      },
  { key: "BabyChristening", label: "Baby Christening" },
  { key: "BabyDedication",  label: "Baby Dedication"  },
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
  RECEIVED:    "bg-[#F3F4F6] dark:bg-slate-700/30 text-[#6B7280] dark:text-slate-400",
  ASSIGNED:    "bg-[#DBEAFE] dark:bg-blue-900/30 text-[#1D4ED8] dark:text-blue-300",
  IN_PROGRESS: "bg-[#FEF9C3] dark:bg-yellow-900/30 text-[#CA8A04] dark:text-yellow-300",
  RESOLVED:    "bg-[#DCFCE7] dark:bg-green-900/30 text-[#16A34A] dark:text-green-300",
};

function requestTypeLabel(type?: string | null, subject?: string | null): string {
  if (type === "SUGGESTIONS" || type === "SUGGESTION") {
    const s = (subject ?? "").toLowerCase();
    if (s.includes("christening")) return "Baby Christening";
    if (s.includes("dedication")) return "Baby Dedication";
    return "Suggestion";
  }
  if (!type) return "—";
  return type.charAt(0) + type.slice(1).toLowerCase();
}

function requestTypeBadgeClass(type?: string | null, subject?: string | null): string {
  if (type === "PRAYER") return "bg-[#16A34A] text-white";
  if (type === "COUNSELING") return "bg-[#000080] text-white";
  if (type === "SUGGESTIONS" || type === "SUGGESTION") {
    const s = (subject ?? "").toLowerCase();
    if (s.includes("christening") || s.includes("dedication")) return "bg-[#7C3AED] text-white";
    return "bg-[#CA8A04] text-white";
  }
  return "bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300";
}

function fullName(u?: { firstName?: string; middleName?: string; lastName?: string } | null) {
  if (!u) return "—";
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fmtDate(s?: any): string {
  if (!s) return "—";
  if (Array.isArray(s)) {
    const [year, month, day] = s as number[];
    return new Date(year, month - 1, day).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  const d = new Date(s as string);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const selectStyles =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

export default function RequestsPage() {
  const router = useRouter();
  const currentUser = getStoredUser();

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

  const fetchRequests = useCallback(async (page: number, category: CategoryFilter, searchText = "") => {
    setLoading(true);
    setApiError("");
    try {
      let res;
      const q = searchText.trim();
      if (q && category === "BabyChristening") {
        res = await searchBabyChristeningRequests({ text: q }, page - 1, ITEMS_PER_PAGE);
      } else if (q && category === "BabyDedication") {
        res = await searchBabyDedicationRequests({ text: q }, page - 1, ITEMS_PER_PAGE);
      } else if (category === "BabyChristening") {
        res = await getBabyChristeningRequests(page - 1, ITEMS_PER_PAGE);
      } else if (category === "BabyDedication") {
        res = await getBabyDedicationRequests(page - 1, ITEMS_PER_PAGE);
      } else {
        const fn =
          category === "Prayer"     ? getPrayerRequests    :
          category === "Counseling" ? getCounselingRequests :
          category === "Suggestion" ? getSuggestions       :
          getAllRequests;
        res = await fn(page - 1, ITEMS_PER_PAGE);
      }
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
    fetchRequests(currentPage, activeCategory, search);
  }, [currentPage, activeCategory, fetchRequests]); // eslint-disable-line react-hooks/exhaustive-deps

  // Client-side status filter on loaded page (search is server-side for christening/dedication)
  const displayed = requests.filter((r) => {
    if (activeStatus !== "All" && r.requestStatus !== activeStatus) return false;
    if (search.trim() && activeCategory !== "BabyChristening" && activeCategory !== "BabyDedication") {
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
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] dark:bg-indigo-900/30">
          <Inbox className="h-6 w-6 text-[#000080] dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Requests</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Prayer, counseling, and suggestion requests from members</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-4 flex items-center overflow-x-auto border-b border-[#E5E7EB] dark:border-slate-700">
        <div className="flex gap-6 sm:gap-8">
          {categoryTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveCategory(tab.key); setCurrentPage(1); }}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeCategory === tab.key
                  ? "border-b-2 border-[#000080] text-[#000080] dark:text-indigo-400"
                  : "text-[#6B7280] dark:text-slate-400 hover:text-[#374151] dark:text-slate-300"
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
            onChange={(v) => {
              setSearch(v);
              if (!v.trim() && (activeCategory === "BabyChristening" || activeCategory === "BabyDedication")) {
                fetchRequests(1, activeCategory, "");
                setCurrentPage(1);
              }
            }}
            onSearch={() => {
              setCurrentPage(1);
              fetchRequests(1, activeCategory, search);
            }}
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
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {apiError} — <button className="font-medium underline" onClick={() => fetchRequests(currentPage, activeCategory)}>Retry</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] dark:bg-slate-700/30">
              <th className="px-4 py-4">
                <input type="checkbox" checked={allPageSelected} onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] dark:text-indigo-400 focus:ring-[#000080]" />
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Type</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Subject</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Submitted By</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Date</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Status</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Assigned To</th>
              <th className="px-4 py-4"/>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">Loading…</td></tr>
            ) : displayed.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">No requests found.</td></tr>
            ) : (
              displayed.map((r) => (
                <tr key={r.id} className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:bg-slate-700/50 cursor-pointer" style={{height:"56px"}} onClick={() => router.push(`/requests/${r.id}`)}>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedRows.has(r.id)} onChange={() => handleSelectRow(r.id)}
                      className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] dark:text-indigo-400 focus:ring-[#000080]" />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${requestTypeBadgeClass(r.requestType, r.subject)}`}>
                      {requestTypeLabel(r.requestType, r.subject)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#374151] dark:text-slate-300 max-w-[200px]"><span className="block truncate">{r.subject}</span></td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300 max-w-[160px]">
                    <span className="block truncate">{r.owner ? fullName(r.owner) : <span className="italic text-gray-400 dark:text-slate-500">Anonymous</span>}</span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">{fmtDate(r.createdOn)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusBadgeColors[r.requestStatus ?? ""] ?? "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400"}`}>
                      {(r.requestStatus ?? "—").replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300 max-w-[160px]">
                    <span className="block truncate">
                      {r.assignedTo && r.assignedTo.id !== currentUser?.id ? fullName(r.assignedTo) : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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
        <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">New Status</label>
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
