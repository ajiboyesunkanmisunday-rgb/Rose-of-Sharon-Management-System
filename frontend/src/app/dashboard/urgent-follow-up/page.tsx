"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import { getFirstTimers, type UserResponse } from "@/lib/api";

const ITEMS_PER_PAGE = 10;

interface FollowUpRow {
  id: string;
  name: string;
  phone: string;
  serviceAttended: string;
  assignedOfficer: string;
}

function toRow(u: UserResponse): FollowUpRow {
  const name = [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ");
  const af = u.assignedFollowUp;
  const officerName = af
    ? [af.firstName, af.lastName].filter(Boolean).join(" ")
    : "Unassigned";
  return {
    id: u.id,
    name,
    phone: u.phoneNumber ?? "",
    serviceAttended: u.serviceAttended ?? u.firstTimeService?.title ?? "—",
    assignedOfficer: officerName,
  };
}

export default function UrgentFollowUpPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState<FollowUpRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getFirstTimers(0, 100)
      .then((res) => {
        const data = (res.content ?? [])
          .filter((u) => (u.noOfCalls ?? 0) === 0)
          .map(toRow);
        setRows(data);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.assignedOfficer.toLowerCase().includes(q) ||
        f.phone.toLowerCase().includes(q) ||
        f.serviceAttended.toLowerCase().includes(q)
    );
  }, [search, rows]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <DashboardLayout>
      <PageHeader title="Dashboard" subtitle="Urgent Follow-up" backHref="/dashboard" />

      <div className="mb-4 w-full sm:w-72">
        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={() => setCurrentPage(1)}
          placeholder="Search follow-ups..."
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] dark:bg-slate-700/30">
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Name</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Phone</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Service Attended</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Assigned Officer</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">
                  Loading follow-ups…
                </td>
              </tr>
            ) : (
              <>
                {paginated.map((f) => (
                  <tr key={f.id} className="border-b border-[#F3F4F6] hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:bg-slate-700/50" style={{ height: "56px" }}>
                    <td className="px-4 py-3 text-sm text-[#374151] dark:text-slate-300">{f.name}</td>
                    <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">{f.phone}</td>
                    <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">{f.serviceAttended}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">{f.assignedOfficer}</td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">
                      No follow-ups found.
                    </td>
                  </tr>
                )}
              </>
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
