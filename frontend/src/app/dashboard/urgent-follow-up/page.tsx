"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import { urgentFollowUps } from "@/lib/mock-data";

const ITEMS_PER_PAGE = 10;

export default function UrgentFollowUpPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return urgentFollowUps;
    const q = search.toLowerCase();
    return urgentFollowUps.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.assignedOfficer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.phone.toLowerCase().includes(q)
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const daysColor = (d: number) =>
    d >= 10 ? "text-red-600 font-semibold" : d >= 5 ? "text-orange-600 font-semibold" : "text-yellow-700";

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      Critical: "bg-red-100 text-red-700",
      Overdue: "bg-orange-100 text-orange-700",
      "Due Today": "bg-yellow-100 text-yellow-800",
    };
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[s] || "bg-gray-100 text-gray-700"}`}>{s}</span>;
  };

  return (
    <DashboardLayout>
      <PageHeader title="Dashboard" subtitle="Urgent Follow-up" backHref="/dashboard" />

      <div className="mb-4 w-72">
        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={() => setCurrentPage(1)}
          placeholder="Search follow-ups..."
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Name</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Phone</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Category</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Assigned Officer</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Days Overdue</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Last Contact</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((f) => (
              <tr key={f.id} className="border-b border-[#F3F4F6] hover:bg-gray-50" style={{ height: "56px" }}>
                <td className="px-4 py-3 text-sm text-[#374151]">{f.name}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{f.phone}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{f.category}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{f.assignedOfficer}</td>
                <td className={`px-4 py-3 text-sm ${daysColor(f.daysOverdue)}`}>
                  {f.daysOverdue === 0 ? "Due today" : `${f.daysOverdue} days`}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">{f.lastContact}</td>
                <td className="px-4 py-3">{statusBadge(f.status)}</td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No follow-ups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </DashboardLayout>
  );
}
