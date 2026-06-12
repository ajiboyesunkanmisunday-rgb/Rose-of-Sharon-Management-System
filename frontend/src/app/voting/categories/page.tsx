"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Tag, Plus, Trash2 } from "lucide-react";
import {
  getVotingCategories,
  createVotingCategory,
  deleteVotingCategory,
  type VotingCategory,
} from "@/lib/api";

const inputClass =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none transition-colors focus:border-[#000080] focus:ring-1 focus:ring-[#000080] bg-white dark:bg-slate-800/50";

export default function VotingCategoriesPage() {
  const [categories, setCategories] = useState<VotingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const cats = await getVotingCategories();
      setCategories(cats);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      await createVotingCategory({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      });
      setShowModal(false);
      setForm({ name: "", description: "" });
      fetchCategories();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create category.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    try {
      await deleteVotingCategory(id);
      fetchCategories();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({ name: "", description: "" });
    setCreateError("");
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDE9FE]">
          <Tag className="h-6 w-6 text-[#7C3AED]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Voting Categories</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Manage categories for voting cycles</p>
        </div>
      </div>

      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[#6B7280] dark:text-slate-400">
          {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
        </p>
        <Button variant="primary" onClick={() => setShowModal(true)} icon={<Plus className="h-4 w-4" />}>
          New Category
        </Button>
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={fetchCategories}>
            Retry
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
        {loading ? (
          <div className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">Loading…</div>
        ) : categories.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">
            No categories yet. Create one to start a voting cycle.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#F3F4F6] dark:bg-slate-700/30">
                <th className="px-4 py-4 font-bold text-[#000080] dark:text-indigo-400">Name</th>
                <th className="hidden sm:table-cell px-4 py-4 font-bold text-[#000080] dark:text-indigo-400">
                  Description
                </th>
                <th className="px-4 py-4 font-bold text-[#000080] dark:text-indigo-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b border-[#F3F4F6] dark:border-slate-700 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  style={{ height: "56px" }}
                >
                  <td className="px-4 py-3 font-medium text-[#374151] dark:text-slate-300">{cat.name}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-[#374151] dark:text-slate-300">
                    {cat.description || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title="New Voting Category">
        <div className="space-y-4">
          {createError && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
              {createError}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
              Category Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Youth"
              className={inputClass}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
              Description{" "}
              <span className="font-normal text-[#9CA3AF]">(optional)</span>
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description"
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={creating || !form.name.trim()}
            >
              {creating ? "Creating…" : "Create Category"}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
