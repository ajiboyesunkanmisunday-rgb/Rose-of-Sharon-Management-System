"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import {
  Trophy,
  Plus,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import {
  getVotingCycles,
  getVotingCategories,
  createVotingCycle,
  cancelVotingCycle,
  type VotingCycle,
  type VotingCategory,
} from "@/lib/api";

const ITEMS_PER_PAGE = 10;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_BADGE: Record<string, string> = {
  DRAFT:              "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400",
  NOMINEES_PENDING:   "bg-[#FEF9C3] dark:bg-yellow-900/30 text-[#CA8A04] dark:text-yellow-300",
  NOMINEES_APPROVED:  "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  VOTING_OPEN:        "bg-[#DCFCE7] dark:bg-green-900/30 text-[#16A34A] dark:text-green-300",
  VOTING_CLOSED:      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  WINNER_ANNOUNCED:   "bg-[#EDE9FE] dark:bg-purple-900/30 text-[#7C3AED] dark:text-purple-300",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT:             "Draft",
  NOMINEES_PENDING:  "Nominees Pending",
  NOMINEES_APPROVED: "Nominees Approved",
  VOTING_OPEN:       "Voting Open",
  VOTING_CLOSED:     "Voting Closed",
  WINNER_ANNOUNCED:  "Winner Announced",
};

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[status] ?? "bg-gray-100 text-gray-600"}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function RowActionMenu({ cycle, onCancel, onView }: { cycle: VotingCycle; onCancel: () => void; onView: () => void }) {
  const [open, setOpen] = useState(false);
  const canCancel = !["WINNER_ANNOUNCED"].includes(cycle.status);

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
      >
        <MoreVertical className="h-4 w-4 text-gray-500 dark:text-slate-400" />
      </button>
      {open && (
        <div
          className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 py-1 shadow-lg"
          onMouseLeave={() => setOpen(false)}
        >
          <button
            className="block w-full px-4 py-2 text-left text-sm text-[#374151] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onView(); }}
          >
            View Details
          </button>
          {canCancel && (
            <button
              className="block w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={(e) => { e.stopPropagation(); setOpen(false); onCancel(); }}
            >
              Cancel Cycle
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function VotingPage() {
  const router = useRouter();

  const [cycles,       setCycles]       = useState<VotingCycle[]>([]);
  const [categories,   setCategories]   = useState<VotingCategory[]>([]);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalItems,   setTotalItems]   = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [apiError,     setApiError]     = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [activeTab,    setActiveTab]    = useState("ALL");
  const [showNew,      setShowNew]      = useState(false);
  const [creating,     setCreating]     = useState(false);
  const [createError,  setCreateError]  = useState("");
  const [successMsg,   setSuccessMsg]   = useState("");

  // New cycle form state
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newTitle,      setNewTitle]      = useState("");
  const [newMonth,      setNewMonth]      = useState(new Date().getMonth() + 1);
  const [newYear,       setNewYear]       = useState(new Date().getFullYear());

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getVotingCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      // non-blocking
    }
  }, []);

  const fetchCycles = useCallback(async (page: number, tab: string) => {
    setLoading(true);
    setApiError("");
    try {
      const categoryId = categories.find((c) => c.name === tab)?.id;
      const status = tab === "HALL_OF_FAME" ? "WINNER_ANNOUNCED" : undefined;
      const res = await getVotingCycles(
        page - 1,
        ITEMS_PER_PAGE,
        tab !== "ALL" && tab !== "HALL_OF_FAME" ? categoryId : undefined,
        status,
      );
      setCycles(res.content ?? []);
      setTotalPages(res.totalPages ?? 1);
      setTotalItems(res.totalElements ?? 0);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load voting cycles.");
    } finally {
      setLoading(false);
    }
  }, [categories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchCycles(currentPage, activeTab);
  }, [currentPage, activeTab, fetchCycles]);

  const handleCreate = async () => {
    if (!newCategoryId || !newTitle.trim()) {
      setCreateError("Category and title are required.");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      await createVotingCycle({ categoryId: newCategoryId, title: newTitle.trim(), month: newMonth, year: newYear });
      setShowNew(false);
      setNewCategoryId("");
      setNewTitle("");
      setNewMonth(new Date().getMonth() + 1);
      setNewYear(new Date().getFullYear());
      showSuccess("Voting cycle created successfully.");
      fetchCycles(currentPage, activeTab);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create cycle.");
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (cycle: VotingCycle) => {
    if (!window.confirm(`Cancel cycle "${cycle.title}"? This cannot be undone.`)) return;
    try {
      await cancelVotingCycle(cycle.id);
      showSuccess("Cycle cancelled.");
      fetchCycles(currentPage, activeTab);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to cancel cycle.");
    }
  };

  // Stat card numbers
  const totalCycles = totalItems;
  const activeCycles = cycles.filter((c) => c.status === "VOTING_OPEN").length;
  const totalVotesCast = cycles.reduce((s, c) => s + (c.totalVotes ?? 0), 0);
  const hallOfFameCount = cycles.filter((c) => c.status === "WINNER_ANNOUNCED").length;

  const tabs = ["ALL", ...categories.map((c) => c.name), "HALL_OF_FAME"];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDE9FE]">
            <Trophy className="h-6 w-6 text-[#7C3AED]" />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Face of the Month &amp; Voting</h1>
            <p className="text-sm text-[#6B7280] dark:text-slate-400">Manage voting cycles, nominees, and hall of fame</p>
          </div>
        </div>
        <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setShowNew(true)}>
          Start New Cycle
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Cycles",       value: totalCycles,      color: "bg-blue-50 dark:bg-blue-900/20",   text: "text-blue-700 dark:text-blue-300" },
          { label: "Currently Active",   value: activeCycles,     color: "bg-[#DCFCE7] dark:bg-green-900/20", text: "text-[#16A34A] dark:text-green-300" },
          { label: "Total Votes Cast",   value: totalVotesCast,   color: "bg-[#EDE9FE] dark:bg-purple-900/20", text: "text-[#7C3AED] dark:text-purple-300" },
          { label: "Hall of Fame",       value: hallOfFameCount,  color: "bg-[#FEF9C3] dark:bg-yellow-900/20", text: "text-[#CA8A04] dark:text-yellow-300" },
        ].map((card) => (
          <div key={card.label} className={`rounded-xl border border-[#E5E7EB] dark:border-slate-700 ${card.color} p-4`}>
            <div className={`text-2xl font-bold ${card.text}`}>{card.value}</div>
            <div className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="mb-4 rounded-lg border border-green-200 bg-[#DCFCE7] px-4 py-3 text-sm text-[#16A34A]">
          {successMsg}
        </div>
      )}

      {/* Error banner */}
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={() => fetchCycles(currentPage, activeTab)}>
            Retry
          </button>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-[#000080] text-white"
                : "border border-[#E5E7EB] text-[#6B7280] hover:border-[#000080]"
            }`}
          >
            {tab === "ALL" ? "All" : tab === "HALL_OF_FAME" ? "Hall of Fame" : tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] dark:bg-slate-700/30">
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Period</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Category</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Status</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Total Votes</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Voting Window</th>
              <th className="hidden lg:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Winner</th>
              <th className="px-4 py-4" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[#F3F4F6] dark:border-slate-700">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
                    </td>
                  ))}
                </tr>
              ))
            ) : cycles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400 dark:text-slate-500">
                  No voting cycles found.
                </td>
              </tr>
            ) : (
              cycles.map((cycle) => (
                <tr
                  key={cycle.id}
                  className="cursor-pointer border-b border-[#F3F4F6] dark:border-slate-700 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  onClick={() => router.push(`/voting/${cycle.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-[#374151] dark:text-slate-300">
                    {MONTHS[cycle.month - 1]} {cycle.year}
                    <div className="text-xs text-[#6B7280] dark:text-slate-400 truncate max-w-[140px]">{cycle.title}</div>
                  </td>
                  <td className="px-4 py-3 text-[#374151] dark:text-slate-300">
                    {cycle.categoryName ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={cycle.status} />
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-[#374151] dark:text-slate-300">
                    {cycle.totalVotes ?? 0}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-xs text-[#6B7280] dark:text-slate-400">
                    {cycle.votingStartDate || cycle.votingEndDate
                      ? <>{fmtDate(cycle.votingStartDate)} – {fmtDate(cycle.votingEndDate)}</>
                      : "—"}
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3 text-[#374151] dark:text-slate-300">
                    {cycle.winnerName ?? "—"}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <RowActionMenu
                      cycle={cycle}
                      onView={() => router.push(`/voting/${cycle.id}`)}
                      onCancel={() => handleCancel(cycle)}
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

      {/* Start New Cycle Modal */}
      <Modal isOpen={showNew} onClose={() => { setShowNew(false); setCreateError(""); }} title="Start New Voting Cycle" size="md">
        <div className="space-y-4">
          {createError && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700">
              {createError}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={newCategoryId}
              onChange={(e) => setNewCategoryId(e.target.value)}
              className="w-full rounded-xl border border-[#E5E7EB] dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-[#374151] dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#000080]"
            >
              <option value="">Select a category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={`${MONTHS[newMonth - 1]} ${newYear} – Face of the Month`}
              className="w-full rounded-xl border border-[#E5E7EB] dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-[#374151] dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#000080]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">Month</label>
              <div className="relative">
                <select
                  value={newMonth}
                  onChange={(e) => setNewMonth(Number(e.target.value))}
                  className="w-full appearance-none rounded-xl border border-[#E5E7EB] dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-[#374151] dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#000080]"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">Year</label>
              <input
                type="number"
                value={newYear}
                onChange={(e) => setNewYear(Number(e.target.value))}
                min={2020}
                max={2100}
                className="w-full rounded-xl border border-[#E5E7EB] dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-[#374151] dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#000080]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setShowNew(false); setCreateError(""); }}>
              Cancel
            </Button>
            <Button variant="primary" loading={creating} onClick={handleCreate}>
              Create Cycle
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
