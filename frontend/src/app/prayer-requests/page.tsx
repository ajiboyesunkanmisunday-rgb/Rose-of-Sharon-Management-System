"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import { prayerRequests as initialData } from "@/lib/mock-data";
import { PrayerRequest } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

export default function PrayerRequestsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [list, setList] = useState<PrayerRequest[]>(initialData);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const filtered = useMemo(() => {
    let result = list;
    if (filterStatus) result = result.filter((r) => r.status === filterStatus);
    if (filterCategory) result = result.filter((r) => r.category === filterCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.submittedBy.toLowerCase().includes(q) ||
          r.request.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [list, search, filterStatus, filterCategory]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDelete = (id: string) => {
    setList((prev) => prev.filter((r) => r.id !== id));
  };

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

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Prayer Requests</h1>
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
            {paginated.map((req) => (
              <tr
                key={req.id}
                className="border-b border-[#F3F4F6] hover:bg-gray-50 cursor-pointer"
                style={{ height: "56px" }}
                onDoubleClick={() => router.push(`/prayer-requests/${req.id}`)}
              >
                <td className="px-4 py-3 text-sm font-medium text-[#111827]">
                  {req.isAnonymous ? (
                    <span className="italic text-[#6B7280]">Anonymous</span>
                  ) : (
                    req.submittedBy
                  )}
                </td>
                <td className="hidden sm:table-cell px-4 py-3">{categoryBadge(req.category)}</td>
                <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151]">
                  <span className="line-clamp-1">{req.request.slice(0, 60)}{req.request.length > 60 ? "…" : ""}</span>
                </td>
                <td className="px-4 py-3">{statusBadge(req.status)}</td>
                <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">{req.assignedTo ?? "—"}</td>
                <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151]">{req.date}</td>
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
            {paginated.length === 0 && (
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
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length} onPageChange={setCurrentPage} />
      </div>
    </DashboardLayout>
  );
}
