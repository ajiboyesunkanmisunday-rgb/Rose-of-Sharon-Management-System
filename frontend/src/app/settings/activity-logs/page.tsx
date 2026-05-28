"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import DateRangePicker from "@/components/ui/DateRangePicker";
import { getAuditLogs, searchAuditLogs, getAuditLogsInTimeframe, searchAuditLogsInTimeframe, type AuditLogResponse } from "@/lib/api";
import { ScrollText, RefreshCw } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const moduleBadgeColors: Record<string, string> = {
  Login: "bg-[#000080] text-white",
  Member: "bg-[#16A34A] text-white",
  Communication: "bg-[#CA8A04] text-white",
  Workflow: "bg-[#7C3AED] text-white",
  Settings: "bg-[#DC2626] text-white",
  Other: "bg-[#6B7280] text-white",
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateError, setDateError] = useState("");

  // Validate dates whenever they change
  useEffect(() => {
    if (!fromDate && !toDate) {
      setDateError("");
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    if (fromDate && fromDate > today) {
      setDateError("Start date cannot be in the future");
      return;
    }
    if (toDate && toDate > today) {
      setDateError("End date cannot be in the future");
      return;
    }
    if (fromDate && toDate && toDate < fromDate) {
      setDateError("End date cannot be before start date");
      return;
    }
    setDateError("");
  }, [fromDate, toDate]);

  const fetchLogs = useCallback(async (page: number, q: string, start?: string, end?: string) => {
    setLoading(true);
    setError("");
    try {
      let res;
      if (start && end) {
        // Use timeframe endpoints if date range is provided
        const isoStart = `${start}T00:00:00Z`;
        const isoEnd = `${end}T23:59:59Z`;
        res = q.trim()
          ? await searchAuditLogsInTimeframe(q, isoStart, isoEnd, page - 1, ITEMS_PER_PAGE)
          : await getAuditLogsInTimeframe(isoStart, isoEnd, page - 1, ITEMS_PER_PAGE);
      } else {
        // Fallback to general endpoints
        res = q.trim()
          ? await searchAuditLogs(q, page - 1, ITEMS_PER_PAGE)
          : await getAuditLogs(page - 1, ITEMS_PER_PAGE);
      }
      
      setLogs(res.content ?? []);
      setTotalPages(res.totalPages ?? 1);
      setTotalItems(res.totalElements ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activity logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dateError) return;
    fetchLogs(currentPage, activeSearch, fromDate, toDate);
  }, [currentPage, activeSearch, fromDate, toDate, fetchLogs, dateError]);

  const handleSearch = () => {
    setActiveSearch(search);
    setCurrentPage(1);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6] dark:bg-slate-700/30">
          <ScrollText className="h-6 w-6 text-[#374151] dark:text-slate-300" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Activity Logs</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">System audit trail of all admin actions</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-2">
          <DateRangePicker
            from={fromDate}
            to={toDate}
            onFromChange={setFromDate}
            onToChange={setToDate}
          />
          {(fromDate || toDate) && (
            <button
              onClick={() => { setFromDate(""); setToDate(""); setCurrentPage(1); }}
              className="h-11 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm text-[#374151] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex w-full sm:w-auto items-center gap-2">
           <div className="w-full sm:w-72">
            <SearchBar
                value={search}
                onChange={setSearch}
                onSearch={handleSearch}
                placeholder="Search activity..."
            />
           </div>
           <button 
             onClick={() => fetchLogs(currentPage, activeSearch, fromDate, toDate)}
             className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:bg-slate-700/50 transition-colors"
             title="Refresh"
           >
             <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
           </button>
        </div>
      </div>

      {dateError && (
        <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-900/20 px-4 py-2 text-sm text-orange-700 dark:text-orange-300">
          {dateError}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 flex justify-between items-center animate-in fade-in slide-in-from-top-1">
          <span>{error}</span>
          <button onClick={() => fetchLogs(currentPage, activeSearch, fromDate, toDate)} className="font-bold underline hover:no-underline">Retry</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] dark:bg-slate-700/30">
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Action</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Performed By</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Date & Time</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Location</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Module</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {loading && logs.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400 dark:text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="h-8 w-8 animate-spin text-gray-300" />
                        <span>Loading activity logs...</span>
                      </div>
                    </td>
                </tr>
            ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:bg-slate-700/50"
                  >
                    <td className="px-4 py-4">
                        <div className="text-sm font-medium text-[#374151] dark:text-slate-300">{log.actionPerformed}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">{log.actionPerformedSummary}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#374151] dark:text-slate-300">
                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : "System"}
                        <div className="text-xs text-gray-400 dark:text-slate-500">{log.user?.email}</div>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-4 text-sm text-[#374151] dark:text-slate-300">
                        {log.createdOn ? new Date(log.createdOn).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                        }) : "—"}
                    </td>
                    <td className="hidden md:table-cell px-4 py-4 text-sm text-[#374151] dark:text-slate-300">
                      {log.location || "Unknown"}
                      {log.isSuccessful === false && (
                        <div className="text-[10px] text-red-500 font-medium">Failed</div>
                      )}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          moduleBadgeColors[log.module] || "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400"
                        }`}
                      >
                        {log.module}
                      </span>
                    </td>
                  </tr>
                ))
            )}
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400 dark:text-slate-500">
                  No activity logs found.
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
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      </div>
    </DashboardLayout>
  );
}
