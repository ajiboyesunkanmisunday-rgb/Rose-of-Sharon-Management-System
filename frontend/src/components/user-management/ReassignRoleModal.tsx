"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { UserCog, ShieldCheck } from "lucide-react";
import {
  getRoles,
  type AdminResponse,
  type RoleResponse,
} from "@/lib/api";

interface ReassignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: AdminResponse | null;
  onConfirm: (roleId: string) => void;
  isLoading?: boolean;
}

const inputClass =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-2.5 text-sm text-[#374151] dark:text-slate-300 outline-none transition-colors focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

export default function ReassignRoleModal({
  isOpen,
  onClose,
  admin,
  onConfirm,
  isLoading = false,
}: ReassignRoleModalProps) {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedRoleId("");
      setError("");
      return;
    }

    getRoles(0, 100).then((res) => {
      setRoles(res.content ?? []);
    });
    
    if (admin) {
      setSelectedRoleId(admin.roleId || "");
    }
  }, [isOpen, admin]);

  const handleConfirm = () => {
    setError("");
    if (!selectedRoleId) {
      setError("Please select a role.");
      return;
    }

    onConfirm(selectedRoleId);
  };

  if (!admin) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reassign Admin Role"
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] p-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#000080] text-sm font-bold text-white">
            {admin.firstName[0]}
            {admin.lastName[0]}
          </div>
          <div>
            <p className="text-sm font-bold text-[#111827] dark:text-slate-100">
              {admin.firstName} {admin.lastName}
            </p>
            <p className="text-xs text-[#6B7280] dark:text-slate-400">{admin.email}</p>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
            Select New Role <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className={inputClass}
          >
            <option value="">Select a role</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
            Changing the role will update the permissions for this user immediately.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isLoading || !selectedRoleId}
            icon={selectedRoleId === "SUPER_ADMIN" ? <ShieldCheck className="h-4 w-4" /> : <UserCog className="h-4 w-4" />}
          >
            {isLoading ? "Updating..." : "Update Role"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
