"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import StatusFilterTabs from "@/components/ui/StatusFilterTabs";
import {
  getAllRequests,
  type RequestResponse,
} from "@/lib/api";

function isBabyChristening(r: RequestResponse): boolean {
  const type = r.requestType ?? "";
  const subject = (r.subject ?? "").toLowerCase();
  return (
    type === "BABY_CHRISTENING" ||
    ((type === "SUGGESTIONS" || type === "SUGGESTION") && subject.includes("christening"))
  );
}

type StatusFilter = "All" | "RECEIVED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED";

const ITEMS_PER_PAGE = 10;

const statusFilterOptions: { value: StatusFilter; label: string }[] = [
  { value: "All",         label: "All"         },
  { value: "RECEIVED",    label: "Received"    },
  { value: "ASSIGNED",    label: "Assigned"    },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED",    label: "Resolved"    },
];

const statusBadgeColors: Record<string, string> = {
  RECEIVED:    "bg-[#F3F4F6] dark:bg-slate-700/30 text-[#6B7280] dark:text-slate-400",
  ASSIGNED:    "bg-[#DBEAFE] dark:bg-blue-900/30 text-[#1D4ED8] dark:text-blue-300",
  IN_PROGRESS: "bg-[#FEF9C3] dark:bg-yellow-900/30 text-[#CA8A04] dark:text-yellow-300",
  RESOLVED:    "bg-[#DCFCE7] dark:bg-green-900/30 text-[#16A34A] dark:text-green-300",
};

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

export default function BabyChristeningListPage() {
  const router = useRouter();

  const [requests,    setRequests]    = useState<RequestResponse[]>([]);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalItems,  setTotalItems]  = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [apiError,    setApiError]    = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search,      setSearch]      = useState("");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("All");

  const fetchRequests = useCallback(async (page: number, searchText = "") => {
    setLoading(true);
    setApiError("");
    try {
      const res = await getAllRequests(0, 500);
      let filtered = (res.content ?? []).filter(isBabyChristening);
      const q = searchText.trim().toLowerCase();
      if (q) {
        filtered = filtered.filter(
          (r) =>
            (r.subject ?? "").toLowerCase().includes(q) ||
            [r.owner?.firstName, r.owner?.middleName, r.owner?.lastName]
              .filter(Boolean).join(" ").toLowerCase().includes(q),
        );
      }
      const start = (page - 1) * ITEMS_PER_PAGE;
      setRequests(filtered.slice(start, start + ITEMS_PER_PAGE));
      setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1);
      setTotalItems(filtered.length);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(currentPage, search);
  }, [currentPage, fetchRequests]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayed = requests.filter((r) =>
    activeStatus === "All" || r.requestStatus === activeStatus
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <button
            onClick={() => router.push("/requests")}
            className="flex items-center text-[#000080] dark:text-indigo-400 hover:text-[#000066]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-[#000080] dark:text-indigo-400">Baby Christening</h2>
        </div>
        <p className="text-sm text-[#6B7280] dark:text-slate-400 pl-7">
          Baby christening requests submitted by members
        </p>
      </div>

      {/* Status filter */}
      <div className="mb-4">
        <StatusFilterTabs
          options={statusFilterOptions}
          active={activeStatus}
          onChange={(v) => { setActiveStatus(v as StatusFilter); setCurrentPage(1); }}
        />
      </div>

      {/* Search + New Request */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              if (!v.trim()) { fetchRequests(1, ""); setCurrentPage(1); }
            }}
            onSearch={() => { setCurrentPage(1); fetchRequests(1, search); }}
            placeholder="Search christening requests…"
          />
        </div>
        <Button
          variant="primary"
          onClick={() => router.push("/requests/baby-christening/new")}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          }
        >
          New Request
        </Button>
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {apiError} — <button className="font-medium underline" onClick={() => fetchRequests(currentPage, search)}>Retry</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] dark:bg-slate-700/30">
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Subject</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Submitted By</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Date</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Status</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Assigned To</th>
              <th className="px-4 py-4" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">Loading…</td></tr>
            ) : displayed.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">No requests found.</td></tr>
            ) : (
              displayed.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:bg-slate-700/50 cursor-pointer"
                  style={{ height: "56px" }}
                  onClick={() => router.push(`/requests/${r.id}`)}
                >
                  <td className="px-4 py-3 text-sm text-[#374151] dark:text-slate-300 max-w-[220px]">
                    <span className="block truncate">{r.subject}</span>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300 max-w-[160px]">
                    <span className="block truncate">
                      {r.owner ? fullName(r.owner) : <span className="italic text-gray-400 dark:text-slate-500">Anonymous</span>}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">
                    {fmtDate(r.createdOn)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusBadgeColors[r.requestStatus ?? ""] ?? "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400"}`}>
                      {(r.requestStatus ?? "—").replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300 max-w-[160px]">
                    <span className="block truncate">{fullName(r.assignedTo)}</span>
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      </div>
    </DashboardLayout>
  );
}
