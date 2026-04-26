"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import Modal from "@/components/ui/Modal";
import {
  getGroups,
  createGroup,
  deleteGroupsBulk,
  type GroupResponse,
} from "@/lib/api";

const ITEMS_PER_PAGE = 10;

const inputClass =
  "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none transition-colors focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });

  const fetchGroups = useCallback(async (page: number) => {
    setLoading(true);
    setApiError("");
    try {
      const res = await getGroups(page - 1, ITEMS_PER_PAGE);
      setGroups(res.content);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.totalElements || 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load groups.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups(currentPage);
  }, [currentPage, fetchGroups]);

  const handleSearch = () => setCurrentPage(1);

  const displayedGroups = search.trim()
    ? groups.filter((g) => {
        const q = search.toLowerCase();
        return (
          g.name.toLowerCase().includes(q) ||
          (g.description ?? "").toLowerCase().includes(q) ||
          (g.groupHead ?? "").toLowerCase().includes(q)
        );
      })
    : groups;

  const handleAddGroup = async () => {
    if (!newGroup.name.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      await createGroup({ name: newGroup.name, description: newGroup.description });
      setShowAddModal(false);
      setNewGroup({ name: "", description: "" });
      fetchGroups(currentPage);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create group.";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Delete this group?")) return;
    try {
      await deleteGroupsBulk([id]);
      fetchGroups(currentPage);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Settings</h1>
        <h2 className="text-[22px] font-bold text-[#000080]">Groups</h2>
      </div>

      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={handleSearch}
            placeholder="Search groups..."
          />
        </div>

        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Add Group
        </Button>
      </div>

      {/* Error banner */}
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={() => fetchGroups(currentPage)}>
            Retry
          </button>
        </div>
      )}

      {/* Groups Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Group Name</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Description</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Members</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Group Head</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Loading groups…
                </td>
              </tr>
            ) : displayedGroups.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No groups found.
                </td>
              </tr>
            ) : (
              displayedGroups.map((group) => (
                <tr
                  key={group.id}
                  className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                  style={{ height: "56px" }}
                >
                  <td className="px-4 py-3 text-sm font-medium text-[#374151]">{group.name}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                    {group.description || "—"}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                    {group.membersCount ?? "—"}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151]">
                    {group.groupHead || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ActionDropdown
                      actions={[
                        { label: "View Members", onClick: () => router.push(`/settings/groups/${group.id}`) },
                        { label: "Edit", onClick: () => router.push(`/settings/groups/${group.id}/edit`) },
                        { label: "Delete", onClick: () => handleDeleteGroup(group.id) },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Group Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewGroup({ name: "", description: "" });
          setSaveError("");
        }}
        title="Add Group"
      >
        <div className="space-y-4">
          {saveError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {saveError}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">Group Name</label>
            <input
              type="text"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              placeholder="Enter group name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">Description</label>
            <textarea
              value={newGroup.description}
              onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              placeholder="Enter group description"
              rows={3}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                setNewGroup({ name: "", description: "" });
                setSaveError("");
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddGroup} disabled={saving || !newGroup.name.trim()}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
