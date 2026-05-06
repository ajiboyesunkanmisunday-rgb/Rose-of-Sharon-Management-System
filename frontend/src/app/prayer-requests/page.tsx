"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import { getPrayerRequests, type RequestResponse } from "@/lib/api";
import { Flame } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function PrayerRequestsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [list, setList] = useState<RequestResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const loadRequests = useCallback(async (page: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await getPrayerRequests(page - 1, ITEMS_PER_PAGE);
      setList(res.content ?? []);
      setTotalPages(res.totalPages ?? 1);
      setTotalItems(res.totalElements ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load prayer requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRequests(currentPage); }, [loadRequests, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = (id: string) => {
    setList((prev) => prev.filter((r) => r.id !== id));
  };

  // Client-side filter on the current page results
  const filtered = list.filter((r) => {
    if (filterStatus && r.requestStatus !== filterStatus) return false;
    if (filterCategory && r.requestType !== filterCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const name = [r.owner?.firstName, r.owner?.lastName].filter(Boolean).join(" ").toLowerCase();
      if (
        !name.includes(q) &&
        !(r.content ?? "").toLowerCase().includes(q) &&
        !(r.requestType ?? "").toLowerCase().includes(q) &&
        !(r.subject ?? "").toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "Pending": "bg-yellow-100 text-yellow-800",
      "Assigned": "bg-blue-100 text-blue-800",
      "Prayed For": "bg-green-100 text-green-800",
      "Closed": "bg-gray-100 text-gray-600",
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    );
  };

  const categoryBadge = (cat: string) => (
    <span className="inline-flex items-center rounded-full bg-[#B5B5F3] px-2.5 py-0.5 text-xs font-medium text-[#000080]">
      {cat}
    </span>
  );

  const getSubmittedBy = (r: RequestResponse) => {
    const u = r.owner ?? r.createdBy;
    if (!u) return "—";
    return [u.firstName, u.lastName].filter(Boolean).join(" ") || "—";
  };

  const getAssignedTo = (r: RequestResponse) => {
    const u = r.assignedTo;
    if (!u) return "—";
    return [u.firstName, u.lastName].filter(Boolean).join(" ") || "—";
  };

  const getDate = (r: RequestResponse) =>
    r.createdOn
      ? new Date(r.createdOn).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "—";

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7]">
          <Flame className="h-6 w-6 text-[#D97706]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000]">Prayer Requests</h1>
          <p className="text-sm text-[#6B7280]">Manage and track all church prayer requests</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchBar value={search} onChange={setSearch} onSearch={() => setCurrentPage(1)} placeholder="Search requests..." />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            onClick={() => router.push("/prayer-requests/add")}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          >
            Add Request
          </Button>
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
        </div>
      </div>

      {showFilter && (
        <div className="mb-4 flex flex-wrap items-end gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
          <div className="flex flex-col">
            <label className="mb-1 block text-xs font-medium text-[#374151]">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="h-[42px] rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="Prayed For">Prayed For</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 block text-xs font-medium text-[#374151]">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              className="h-[42px] rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
            >
              <option value="">All Categories</option>
              <option value="Healing">Healing</option>
              <option value="Finance">Finance</option>
              <option value="Family">Family</option>
              <option value="Marriage">Marriage</option>
              <option value="Salvation">Salvation</option>
              <option value="Career">Career</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button
            onClick={() => { setFilterStatus(""); setFilterCategory(""); setCurrentPage(1); }}
            className="h-[42px] rounded-lg border border-[#E5E7EB] px-4 text-sm text-[#374151] hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button className="ml-2 font-medium underline" onClick={() => loadRequests(currentPage)}>Retry</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Submitted By</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Category</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Request</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Status</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Assigned To</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Date</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading…</td>
              </tr>
            ) : filtered.map((req) => (
              <tr
                key={req.id}
                className="border-b border-[#F3F4F6] hover:bg-gray-50 cursor-pointer"
                style={{ height: "56px" }}
                onDoubleClick={() => router.push(`/prayer-requests/${req.id}`)}
              >
                <td className="px-4 py-3 text-sm font-medium text-[#111827]">
                  {getSubmittedBy(req)}
                </td>
                <td className="hidden sm:table-cell px-4 py-3">{req.requestType ? categoryBadge(req.requestType) : "—"}</td>
                <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151]">
                  <span className="line-clamp-1">{(req.content ?? "").slice(0, 60)}{(req.content ?? "").length > 60 ? "…" : ""}</span>
                </td>
                <td className="px-4 py-3">{statusBadge(req.requestStatus ?? "—")}</td>
                <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">{getAssignedTo(req)}</td>
                <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151]">{getDate(req)}</td>
                <td className="px-4 py-3">
                  <ActionDropdown
                    actions={[
                      { label: "View", onClick: () => router.push(`/prayer-requests/${req.id}`) },
                      { label: "Delete", onClick: () => handleDelete(req.id) },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No prayer requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} onPageChange={handlePageChange} />
      </div>
    </DashboardLayout>
  );
}
