"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import ActionDropdown from "@/components/ui/ActionDropdown";
import AddAdminModal from "@/components/user-management/AddAdminModal";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import {
  getAdminUsers,
  assignAdmin,
  assignSuperAdmin,
  removeAdmin,
  reassignAdminRole,
  type AdminResponse,
} from "@/lib/api";
import { ShieldCheck, UserCog, UserCheck, RefreshCw } from "lucide-react";
import ReassignRoleModal from "@/components/user-management/ReassignRoleModal";

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [saving, setSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState<AdminResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassigningAdmin, setReassigningAdmin] = useState<AdminResponse | null>(null);
  const [reassigning, setReassigning] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await getAdminUsers(0, 100);
      setAdmins(res.content ?? []);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load admin users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const openAdd = (type: "ADMIN" | "SUPER_ADMIN") => {
    setAddType(type);
    setShowAddModal(true);
  };

  const handleAddConfirm = async (data: {
    userId: string;
    roleId?: string;
    password?: string;
    confirmPassword?: string;
  }) => {
    setSaving(true);
    try {
      if (addType === "SUPER_ADMIN") {
        await assignSuperAdmin({
          userId: data.userId,
          password: data.password!,
          confirmPassword: data.confirmPassword!,
        });
      } else {
        await assignAdmin(data.roleId!, {
          userId: data.userId,
          password: data.password!,
          confirmPassword: data.confirmPassword!,
        });
      }
      setShowAddModal(false);
      fetchAdmins();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add admin.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAdmin) return;
    setDeleting(true);
    try {
      await removeAdmin(deletingAdmin.id);
      setShowDeleteModal(false);
      setDeletingAdmin(null);
      fetchAdmins();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove admin.");
    } finally {
      setDeleting(false);
    }
  };

  const handleReassignConfirm = async (roleId: string) => {
    if (!reassigningAdmin) return;
    setReassigning(true);
    try {
      await reassignAdminRole(reassigningAdmin.id, roleId);
      setShowReassignModal(false);
      setReassigningAdmin(null);
      fetchAdmins();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reassign role.");
    } finally {
      setReassigning(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF]">
            <ShieldCheck className="h-6 w-6 text-[#000080]" />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-[#000000]">
              Admin Users
            </h1>
            <p className="text-sm text-[#6B7280]">
              Manage users with administrative access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => openAdd("ADMIN")}
            icon={<UserCog className="h-4 w-4" />}
          >
            Add Admin
          </Button>
          <Button
            variant="primary"
            onClick={() => openAdd("SUPER_ADMIN")}
            icon={<UserCheck className="h-4 w-4" />}
          >
            Add Super Admin
          </Button>
        </div>
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={fetchAdmins}>
            Retry
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Admin Name
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Email
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Type
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Role
              </th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080]">
                Last Login
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No admin users found.
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr
                  key={admin.id}
                  className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                  style={{ height: "56px" }}
                >
                  <td className="px-4 py-3 text-sm font-medium text-[#374151]">
                    <div className="flex items-center gap-3">
                      {admin.profilePictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={admin.profilePictureUrl}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">
                          {admin.firstName[0]}{admin.lastName[0]}
                        </div>
                      )}
                      <span>{admin.firstName} {admin.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#374151]">
                    {admin.email}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      admin.userType === "SUPER_ADMIN" 
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {admin.userType?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#374151]">
                    {admin.roleName || "—"}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151]">
                    {fmtDate(admin.lastLogin)}
                  </td>
                  <td className="px-4 py-3">
                    <ActionDropdown
                      actions={[
                        {
                          label: "Reassign Role",
                          onClick: () => {
                            setReassigningAdmin(admin);
                            setShowReassignModal(true);
                          },
                        },
                        {
                          label: "Remove Access",
                          onClick: () => {
                            setDeletingAdmin(admin);
                            setShowDeleteModal(true);
                          },
                          danger: true,
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddAdminModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        type={addType}
        onConfirm={handleAddConfirm}
        isLoading={saving}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="Remove Admin Access"
        message={`Are you sure you want to remove admin access for ${deletingAdmin?.firstName} ${deletingAdmin?.lastName}? This action cannot be undone.`}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleting}
      />

      <ReassignRoleModal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        admin={reassigningAdmin}
        onConfirm={handleReassignConfirm}
        isLoading={reassigning}
      />
    </DashboardLayout>
  );
}
