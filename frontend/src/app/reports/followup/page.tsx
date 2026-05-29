"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import { getFirstTimers, getSecondTimers, type UserResponse } from "@/lib/api";
import { AlertTriangle, ArrowLeft, RefreshCw, Phone, User, Calendar, UserCheck } from "lucide-react";

const ITEMS_PER_PAGE = 20;

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

function daysSince(dateStr?: string): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

async function fetchAll<T>(
  fetcher: (p: number, s: number) => Promise<{ content?: T[]; totalPages?: number }>,
  size = 200
): Promise<T[]> {
  const first = await fetcher(0, size);
  const rows  = [...(first.content ?? [])];
  const total = Math.min(first.totalPages ?? 1, 15);
  if (total > 1) {
    const rest = await Promise.all(
      Array.from({ length: total - 1 }, (_, i) => fetcher(i + 1, size))
    );
    rest.forEach((r) => rows.push(...(r.content ?? [])));
  }
  return rows;
}

type SortKey = "oldest" | "newest" | "name";

export default function FollowupListPage() {
  const router = useRouter();

  const [firstTimers,  setFirstTimers]  = useState<UserResponse[]>([]);
  const [secondTimers, setSecondTimers] = useState<UserResponse[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");
  const [sort,         setSort]         = useState<SortKey>("oldest");
  const [page,         setPage]         = useState(1);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [ft, st] = await Promise.all([
        fetchAll((p, s) => getFirstTimers(p, s)),
        fetchAll((p, s) => getSecondTimers(p, s)),
      ]);
      setFirstTimers(ft as UserResponse[]);
      setSecondTimers(st as UserResponse[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // All visitors with 0 calls AND 0 visits
  const urgentAll = useMemo(() => {
    return [...firstTimers, ...secondTimers].filter(
      (u) => (u.noOfCalls ?? 0) === 0 && (u.noOfVisits ?? 0) === 0
    );
  }, [firstTimers, secondTimers]);

  // Search + sort
  const filtered = useMemo(() => {
    let list = urgentAll;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          fullName(u).toLowerCase().includes(q) ||
          (u.phoneNumber ?? "").toLowerCase().includes(q) ||
          fullName(u.assignedFollowUp).toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "oldest":  return [...list].sort((a, b) => new Date(a.createdOn ?? 0).getTime() - new Date(b.createdOn ?? 0).getTime());
      case "newest":  return [...list].sort((a, b) => new Date(b.createdOn ?? 0).getTime() - new Date(a.createdOn ?? 0).getTime());
      case "name":    return [...list].sort((a, b) => (a.firstName ?? "").localeCompare(b.firstName ?? ""));
    }
  }, [urgentAll, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/reports")}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-[#000080] dark:text-indigo-400 hover:text-[#000066]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Urgent Followup List</h1>
            <p className="text-sm text-[#6B7280] dark:text-slate-400">
              Visitors with no calls and no visits recorded — sorted oldest first by default
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="ml-auto flex items-center gap-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-[#374151] dark:text-slate-300 hover:border-[#000080] hover:text-[#000080] dark:text-indigo-400 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{urgentAll.length}</p>
            <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">Awaiting followup</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center">
            <p className="text-2xl font-bold text-[#000080] dark:text-indigo-400">{urgentAll.filter((u) => u.userType?.toLowerCase().includes("first")).length}</p>
            <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">First timers</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center">
            <p className="text-2xl font-bold text-[#7C3AED] dark:text-purple-400">{urgentAll.filter((u) => u.userType?.toLowerCase().includes("second")).length}</p>
            <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">Second timers</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center">
            <p className="text-2xl font-bold text-[#D97706]">{urgentAll.filter((u) => daysSince(u.createdOn) > 30).length}</p>
            <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">Over 30 days old</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button onClick={load} className="font-medium underline">Retry</button>
        </div>
      )}

      {/* Controls */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            onSearch={() => setPage(1)}
            placeholder="Search by name, phone, assigned to…"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-[#374151] dark:text-slate-300 focus:border-[#000080] focus:outline-none"
        >
          <option value="oldest">Sort: Oldest first</option>
          <option value="newest">Sort: Newest first</option>
          <option value="name">Sort: Name A–Z</option>
        </select>
        <span className="ml-auto text-sm text-[#6B7280] dark:text-slate-400">
          {filtered.length} {filtered.length === 1 ? "person" : "people"}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex h-48 items-center justify-center text-[#9CA3AF] dark:text-slate-400">
          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
          Loading…
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center">
          <UserCheck className="mx-auto mb-3 h-10 w-10 text-green-300" />
          <p className="text-sm font-medium text-[#374151] dark:text-slate-300">
            {urgentAll.length === 0 ? "All visitors have been contacted!" : "No results match your search."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB]">
              <tr className="border-b border-[#E5E7EB] dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] dark:text-slate-400">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] dark:text-slate-400">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] dark:text-slate-400">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] dark:text-slate-400">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] dark:text-slate-400">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] dark:text-slate-400">Date Added</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] dark:text-slate-400">Days Waiting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {paginated.map((u, i) => {
                const days    = daysSince(u.createdOn);
                const urgency = days > 30 ? "text-red-600 font-bold" : days > 14 ? "text-amber-600 font-semibold" : "text-[#374151] dark:text-slate-300";
                const assigned = u.assignedFollowUp ? fullName(u.assignedFollowUp) : null;

                return (
                  <tr key={u.id} className={`hover:bg-[#FAFAFA] ${days > 30 ? "bg-red-50 dark:bg-red-900/20/30" : ""}`}>
                    <td className="px-4 py-3 text-xs text-[#9CA3AF] dark:text-slate-400">
                      {(safePage - 1) * ITEMS_PER_PAGE + i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] dark:bg-slate-700/30 text-xs font-bold text-[#374151] dark:text-slate-300">
                          {`${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || "?"}
                        </div>
                        <span className="font-medium text-[#111827] dark:text-slate-100">{fullName(u)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[10px] font-medium text-[#92400E]">
                        {u.userType?.replace(/_/g, " ") ?? "Visitor"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#374151] dark:text-slate-300">
                      {u.phoneNumber
                        ? `+${u.countryCode ?? ""} ${u.phoneNumber}`.trim()
                        : <span className="text-[#9CA3AF] dark:text-slate-400">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {assigned ? (
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-[#000080] dark:text-indigo-400" />
                          <span className="font-medium text-[#000080] dark:text-indigo-400">{assigned}</span>
                        </div>
                      ) : (
                        <span className="text-[#9CA3AF] dark:text-slate-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#374151] dark:text-slate-300">{fmtDate(u.createdOn)}</td>
                    <td className={`px-4 py-3 text-xs ${urgency}`}>
                      {days > 0 ? `${days}d` : "Today"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      </div>
    </DashboardLayout>
  );
}
