"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import ActionDropdown from "@/components/ui/ActionDropdown";
import { Trophy, Plus } from "lucide-react";
import {
  getVotingCycles,
  createVotingCycle,
  getVotingCategories,
  type VotingCycle,
  type VotingCategory,
} from "@/lib/api";

const ITEMS_PER_PAGE = 10;

const inputClass =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none transition-colors focus:border-[#000080] focus:ring-1 focus:ring-[#000080] bg-white dark:bg-slate-800/50";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

function statusBadge(status: VotingCycle["status"]): { label: string; classes: string } {
  switch (status) {
    case "DRAFT":
      return { label: "Draft", classes: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400" };
    case "NOMINEES_PENDING":
      return { label: "Nominees Pending", classes: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" };
    case "NOMINEES_APPROVED":
      return { label: "Nominees Approved", classes: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" };
    case "VOTING_OPEN":
      return { label: "Voting Open", classes: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" };
    case "VOTING_CLOSED":
      return { label: "Voting Closed", classes: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" };
    case "WINNER_ANNOUNCED":
      return { label: "Completed", classes: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" };
    default:
      return { label: status, classes: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400" };
  }
}

export default function VotingPage() {
  const router = useRouter();
  const [cycles, setCycles] = useState<VotingCycle[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState<VotingCategory[]>([]);
  const [form, setForm] = useState({
    title: "",
    categoryId: "",
    month: String(new Date().getMonth() + 1),
    year: String(currentYear),
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchCycles = useCallback(async (page: number) => {
    setLoading(true);
    setApiError("");
    try {
      const res = await getVotingCycles(page - 1, ITEMS_PER_PAGE);
      setCycles(res.content);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.totalElements || 0);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load voting cycles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCycles(currentPage);
  }, [currentPage, fetchCycles]);

  const openModal = async () => {
    setShowModal(true);
    setCreateError("");
    try {
      const cats = await getVotingCategories();
      setCategories(cats);
      if (cats.length > 0) {
        setForm((f) => ({ ...f, categoryId: f.categoryId || cats[0].id }));
      }
    } catch {
      setCategories([]);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.categoryId) return;
    setCreating(true);
    setCreateError("");
    try {
      const cycle = await createVotingCycle({
        title: form.title.trim(),
        categoryId: form.categoryId,
        month: Number(form.month),
        year: Number(form.year),
      });
      setShowModal(false);
      router.push(`/voting/${cycle.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create voting cycle.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEF9C3]">
          <Trophy className="h-6 w-6 text-[#CA8A04]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Face of the Month</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Manage monthly voting cycles</p>
        </div>
      </div>

      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[#6B7280] dark:text-slate-400">
          {totalItems} cycle{totalItems !== 1 ? "s" : ""}
        </p>
        <Button variant="primary" onClick={openModal} icon={<Plus className="h-4 w-4" />}>
          Start New Cycle
        </Button>
      </div>

      {/* Error */}
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={() => fetchCycles(currentPage)}>
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] dark:bg-slate-700/30">
              <th className="px-4 py-4 font-bold text-[#000080] dark:text-indigo-400">Title</th>
              <th className="hidden sm:table-cell px-4 py-4 font-bold text-[#000080] dark:text-indigo-400">Period</th>
              <th className="hidden md:table-cell px-4 py-4 font-bold text-[#000080] dark:text-indigo-400">Category</th>
              <th className="hidden md:table-cell px-4 py-4 font-bold text-[#000080] dark:text-indigo-400">Total Votes</th>
              <th className="px-4 py-4 font-bold text-[#000080] dark:text-indigo-400">Status</th>
              <th className="px-4 py-4 font-bold text-[#000080] dark:text-indigo-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : cycles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">
                  No voting cycles found.
                </td>
              </tr>
            ) : (
              cycles.map((cycle) => {
                const badge = statusBadge(cycle.status);
                return (
                  <tr
                    key={cycle.id}
                    className="border-b border-[#F3F4F6] dark:border-slate-700 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer"
                    style={{ height: "56px" }}
                    onDoubleClick={() => router.push(`/voting/${cycle.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-[#374151] dark:text-slate-300">{cycle.title}</td>
                    <td className="hidden sm:table-cell px-4 py-3 text-[#374151] dark:text-slate-300">
                      {MONTH_NAMES[(cycle.month ?? 1) - 1]} {cycle.year}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-[#374151] dark:text-slate-300">
                      {cycle.categoryName || "—"}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-[#374151] dark:text-slate-300">
                      {cycle.totalVotes ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ActionDropdown
                        actions={[
                          { label: "View", onClick: () => router.push(`/voting/${cycle.id}`) },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })
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

      {/* Create Cycle Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setCreateError("");
        }}
        title="Start New Voting Cycle"
      >
        <div className="space-y-4">
          {createError && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
              {createError}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. June 2025 Face of the Month"
              className={inputClass}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">Category</label>
            {categories.length === 0 ? (
              <p className="text-sm text-[#6B7280] dark:text-slate-400">
                No categories found.{" "}
                <button
                  className="font-medium text-[#000080] dark:text-indigo-400 underline"
                  onClick={() => router.push("/voting/categories")}
                >
                  Create a category first.
                </button>
              </p>
            ) : (
              <select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className={inputClass}
              >
                <option value="">Select a category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">Month</label>
              <select
                value={form.month}
                onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
                className={inputClass}
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">Year</label>
              <select
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                className={inputClass}
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setCreateError("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={creating || !form.title.trim() || !form.categoryId}
            >
              {creating ? "Creating…" : "Create Cycle"}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
