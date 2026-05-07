"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ActionDropdown from "@/components/ui/ActionDropdown";
import { getRoles, createRole, updateRole, type RoleResponse } from "@/lib/api";
import { ShieldCheck } from "lucide-react";

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const inputClass =
  "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none transition-colors focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

export default function RolesPage() {
  const [roles,      setRoles]      = useState<RoleResponse[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [apiError,   setApiError]   = useState("");

  const [showAddModal,  setShowAddModal]  = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing,       setEditing]       = useState<RoleResponse | null>(null);
  const [saving,        setSaving]        = useState(false);
  const [saveError,     setSaveError]     = useState("");

  const [formData, setFormData] = useState({ name: "", description: "" });

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await getRoles(0, 100);
      setRoles(res.content ?? []);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load roles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const openAdd = () => {
    setFormData({ name: "", description: "" });
    setSaveError("");
    setShowAddModal(true);
  };

  const openEdit = (role: RoleResponse) => {
    setEditing(role);
    setFormData({ name: role.name, description: role.description ?? "" });
    setSaveError("");
    setShowEditModal(true);
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      await createRole({ name: formData.name, description: formData.description || undefined });
      setShowAddModal(false);
      fetchRoles();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to create role.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editing || !formData.name.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      await updateRole(editing.id, { name: formData.name, description: formData.description || undefined });
      setShowEditModal(false);
      setEditing(null);
      fetchRoles();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update role.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF]">
          <ShieldCheck className="h-6 w-6 text-[#000080]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000]">Roles &amp; Permissions</h1>
          <p className="text-sm text-[#6B7280]">Define admin roles and their access levels</p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-end">
        <Button
          variant="primary"
          onClick={openAdd}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Add Role
        </Button>
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError} — <button className="font-medium underline" onClick={fetchRoles}>Retry</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Role Name</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Description</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Created</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
            ) : roles.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No roles found.</td></tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50" style={{ height: "56px" }}>
                  <td className="px-4 py-3 text-sm font-medium text-[#374151]">{role.name}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">{role.description || "—"}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151]">{fmtDate(role.createdOn)}</td>
                  <td className="px-4 py-3">
                    <ActionDropdown
                      actions={[
                        { label: "Edit", onClick: () => openEdit(role) },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Role Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setSaveError(""); }}
        title="Add Role"
      >
        <div className="space-y-4">
          {saveError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter role name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter role description"
              rows={3}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => { setShowAddModal(false); setSaveError(""); }}>Cancel</Button>
            <Button variant="primary" onClick={handleAdd} disabled={saving || !formData.name.trim()}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditing(null); setSaveError(""); }}
        title="Edit Role"
      >
        <div className="space-y-4">
          {saveError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter role name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter role description"
              rows={3}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => { setShowEditModal(false); setEditing(null); setSaveError(""); }}>Cancel</Button>
            <Button variant="primary" onClick={handleEdit} disabled={saving || !formData.name.trim()}>
              {saving ? "Saving…" : "Update"}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
