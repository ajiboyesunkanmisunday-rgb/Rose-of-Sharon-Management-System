"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import DateRangePicker from "@/components/ui/DateRangePicker";
import { activityLogs } from "@/lib/mock-data";

const ITEMS_PER_PAGE = 10;

const categoryBadgeColors: Record<string, string> = {
  Login: "bg-[#000080] text-white",
  Member: "bg-[#16A34A] text-white",
  Communication: "bg-[#CA8A04] text-white",
  Workflow: "bg-[#7C3AED] text-white",
  Settings: "bg-[#DC2626] text-white",
  Other: "bg-[#6B7280] text-white",
};

export default function ActivityLogsPage() {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let list = activityLogs;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          l.performedBy.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <DashboardLayout>
      <div className="mb-1">
        <h1 className="text-[28px] font-bold text-[#000000]">Settings</h1>
      </div>
      <div className="mb-6">
        <p className="text-sm text-[#6B7280]">Activity Logs</p>
      </div>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <DateRangePicker
          from={fromDate}
          to={toDate}
          onFromChange={setFromDate}
          onToChange={setToDate}
        />
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={() => setCurrentPage(1)}
            placeholder="Search activity..."
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Action</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Performed By</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Date & Time</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Location</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Category</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((log) => (
              <tr
                key={log.id}
                className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                style={{ height: "56px" }}
              >
                <td className="px-4 py-3 text-sm text-[#374151]">{log.action}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{log.performedBy}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{log.timestamp}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{log.location}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      categoryBadgeColors[log.category] || "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {log.category}
                  </span>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No activity found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </DashboardLayout>
  );
}
