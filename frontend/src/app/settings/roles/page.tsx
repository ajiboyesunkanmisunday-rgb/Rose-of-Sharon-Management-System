"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ActionDropdown from "@/components/ui/ActionDropdown";

interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
}

interface Permission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

const mockRoles: Role[] = [
  {
    id: "1",
    name: "Admin",
    description: "Full system access and configuration",
    usersCount: 2,
  },
  {
    id: "2",
    name: "Pastor",
    description: "Pastoral oversight and management",
    usersCount: 1,
  },
  {
    id: "3",
    name: "Associate Pastor",
    description: "Assist in pastoral duties and member care",
    usersCount: 3,
  },
  {
    id: "4",
    name: "Follow-up Officer",
    description: "Manage follow-ups and new member integration",
    usersCount: 5,
  },
  {
    id: "5",
    name: "Department Head",
    description: "Oversee department activities and members",
    usersCount: 8,
  },
  {
    id: "6",
    name: "Member",
    description: "Basic member access",
    usersCount: 150,
  },
];

const defaultPermissions: Permission[] = [
  { module: "Dashboard", view: true, create: false, edit: false, delete: false },
  { module: "User Management", view: true, create: true, edit: true, delete: false },
  { module: "Communication", view: true, create: true, edit: false, delete: false },
  { module: "Workflows", view: true, create: false, edit: false, delete: false },
  { module: "Requests", view: true, create: true, edit: true, delete: false },
  { module: "Reports", view: true, create: false, edit: false, delete: false },
  { module: "Settings", view: false, create: false, edit: false, delete: false },
];

export default function RolesPage() {
  const router = useRouter();
  const [roles] = useState<Role[]>(mockRoles);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);

  const [newRole, setNewRole] = useState({ name: "", description: "" });

  const handleAddRole = () => {
    console.log("Adding role:", newRole);
    setShowAddModal(false);
    setNewRole({ name: "", description: "" });
  };

  const handleEditPermissions = (role: Role) => {
    setSelectedRole(role);
    setPermissions([...defaultPermissions]);
    setShowPermissionsModal(true);
  };

  const togglePermission = (
    moduleIndex: number,
    field: "view" | "create" | "edit" | "delete"
  ) => {
    const updated = [...permissions];
    updated[moduleIndex] = {
      ...updated[moduleIndex],
      [field]: !updated[moduleIndex][field],
    };
    setPermissions(updated);
  };

  const inputClass =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none transition-colors focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Settings</h1>
        <h2 className="text-[22px] font-bold text-[#000080]">
          Roles &amp; Permissions
        </h2>
      </div>

      {/* Top bar */}
      <div className="mb-4 flex items-center justify-end">
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Add Role
        </Button>
      </div>

      {/* Roles Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Role Name
              </th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">
                Description
              </th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">
                Users Count
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr
                key={role.id}
                className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                style={{ height: "56px" }}
              >
                <td className="px-4 py-3 text-sm font-medium text-[#374151]">
                  {role.name}
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                  {role.description}
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                  {role.usersCount}
                </td>
                <td className="px-4 py-3">
                  <ActionDropdown
                    actions={[
                      {
                        label: "Edit Permissions",
                        onClick: () => handleEditPermissions(role),
                      },
                      {
                        label: "Edit",
                        onClick: () => router.push(`/settings/roles/${role.id}/edit`),
                      },
                      {
                        label: "Delete",
                        onClick: () => console.log("Delete role:", role.id),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Role Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewRole({ name: "", description: "" });
        }}
        title="Add Role"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">
              Role Name
            </label>
            <input
              type="text"
              value={newRole.name}
              onChange={(e) =>
                setNewRole({ ...newRole, name: e.target.value })
              }
              placeholder="Enter role name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">
              Description
            </label>
            <textarea
              value={newRole.description}
              onChange={(e) =>
                setNewRole({ ...newRole, description: e.target.value })
              }
              placeholder="Enter role description"
              rows={3}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                setNewRole({ name: "", description: "" });
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddRole}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Permissions Modal */}
      <Modal
        isOpen={showPermissionsModal}
        onClose={() => {
          setShowPermissionsModal(false);
          setSelectedRole(null);
        }}
        title={`Permissions - ${selectedRole?.name ?? ""}`}
        size="lg"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#F3F4F6]">
                <th className="px-4 py-3 text-sm font-bold text-[#000080]">
                  Module
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-[#000080]">
                  View
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-[#000080]">
                  Create
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-[#000080]">
                  Edit
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-[#000080]">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, index) => (
                <tr
                  key={perm.module}
                  className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-[#374151]">
                    {perm.module}
                  </td>
                  {(["view", "create", "edit", "delete"] as const).map(
                    (field) => (
                      <td key={field} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={perm[field]}
                          onChange={() => togglePermission(index, field)}
                          className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] focus:ring-[#000080]"
                        />
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setShowPermissionsModal(false);
              setSelectedRole(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              console.log("Saving permissions for:", selectedRole?.name, permissions);
              setShowPermissionsModal(false);
              setSelectedRole(null);
            }}
          >
            Save Permissions
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
