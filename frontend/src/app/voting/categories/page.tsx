"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Tag, Plus, Trash2 } from "lucide-react";
import {
  getVotingCategories,
  createVotingCategory,
  deleteVotingCategory,
  type VotingCategory,
} from "@/lib/api";

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

export default function VotingCategoriesPage() {
  const [categories,   setCategories]   = useState<VotingCategory[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [apiError,     setApiError]     = useState("");
  const [successMsg,   setSuccessMsg]   = useState("");

  // Add modal
  const [showAdd,      setShowAdd]      = useState(false);
  const [newName,      setNewName]      = useState("");
  const [newDesc,      setNewDesc]      = useState("");
  const [creating,     setCreating]     = useState(false);
  const [createError,  setCreateError]  = useState("");

  // Delete
  const [deleting,     setDeleting]     = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const data = await getVotingCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleCreate = async () => {
    if (!newName.trim()) { setCreateError("Name is required."); return; }
    setCreating(true);
    setCreateError("");
    try {
      await createVotingCategory({ name: newName.trim(), description: newDesc.trim() || undefined });
      setShowAdd(false);
      setNewName("");
      setNewDesc("");
      showSuccess("Category created successfully.");
      fetchCategories();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create category.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (cat: VotingCategory) => {
    if (cat.isDefault) return;
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    setDeleting(cat.id);
    try {
      await deleteVotingCategory(cat.id);
      showSuccess("Category deleted.");
      fetchCategories();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to delete category.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDE9FE]">
            <Tag className="h-6 w-6 text-[#7C3AED]" />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Voting Categories</h1>
            <p className="text-sm text-[#6B7280] dark:text-slate-400">Manage voting category types</p>
          </div>
        </div>
        <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setShowAdd(true)}>
          Add Category
        </Button>
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
          <button className="font-medium underline" onClick={fetchCategories}>
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] dark:bg-slate-700/30">
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Name</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Type</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Description</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Created</th>
              <th className="px-4 py-4" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-[#F3F4F6] dark:border-slate-700">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
                    </td>
                  ))}
                </tr>
              ))
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[#9CA3AF] dark:text-slate-500">
                  No categories found. Add one to get started.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="border-b border-[#F3F4F6] dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 font-medium text-[#374151] dark:text-slate-300">{cat.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      cat.isDefault
                        ? "bg-[#EDE9FE] dark:bg-purple-900/30 text-[#7C3AED] dark:text-purple-300"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    }`}>
                      {cat.isDefault ? "Default" : "Custom"}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-[#6B7280] dark:text-slate-400">
                    {cat.description ?? <span className="italic">—</span>}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-[#6B7280] dark:text-slate-400">
                    {fmtDate(cat.createdOn)}
                  </td>
                  <td className="px-4 py-3">
                    {cat.isDefault ? (
                      <span
                        title="Default categories cannot be deleted"
                        className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-lg opacity-30"
                      >
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </span>
                    ) : (
                      <button
                        disabled={deleting === cat.id}
                        onClick={() => handleDelete(cat)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                        title="Delete category"
                      >
                        {deleting === cat.id ? (
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Category Modal */}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setCreateError(""); setNewName(""); setNewDesc(""); }} title="Add Voting Category" size="sm">
        <div className="space-y-4">
          {createError && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700">
              {createError}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Face of the Month"
              className="w-full rounded-xl border border-[#E5E7EB] dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-[#374151] dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#000080]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">Description</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Optional description..."
              rows={3}
              className="w-full rounded-xl border border-[#E5E7EB] dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-[#374151] dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#000080] resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setShowAdd(false); setCreateError(""); setNewName(""); setNewDesc(""); }}>
              Cancel
            </Button>
            <Button variant="primary" loading={creating} onClick={handleCreate}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
