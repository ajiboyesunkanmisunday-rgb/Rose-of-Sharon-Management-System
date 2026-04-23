"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, TextAreaField } from "@/components/ui/FormField";
import { roles } from "@/lib/mock-data";

const MODULES = [
  "Dashboard",
  "User Management",
  "Communication",
  "Workflows",
  "Requests",
  "Reports",
  "Settings",
];

const ACTIONS: Array<"view" | "create" | "edit" | "delete"> = [
  "view",
  "create",
  "edit",
  "delete",
];

export default function EditRoleClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const existing = roles.find((r) => r.id === id) || roles[0];

  const [formData, setFormData] = useState({
    name: existing.name,
    description: existing.description,
  });
  const [permissions, setPermissions] = useState(existing.permissions);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePermission = (
    module: string,
    action: (typeof ACTIONS)[number]
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: { ...prev[module], [action]: !prev[module][action] },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Update role:", id, { ...formData, permissions });
    router.push("/settings/roles");
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        subtitle="Edit Role"
        backHref="/settings/roles"
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Role Name" name="name" value={formData.name} onChange={handleChange} required />
          <TextAreaField label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} />

          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151]">Permissions</label>
            <div className="overflow-x-auto overflow-hidden rounded-lg border border-[#E5E7EB]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#F3F4F6]">
                    <th className="px-4 py-3 text-sm font-bold text-[#000080]">Module</th>
                    {ACTIONS.map((a) => (
                      <th key={a} className="px-4 py-3 text-center text-sm font-bold capitalize text-[#000080]">
                        {a}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((m) => (
                    <tr key={m} className="border-b border-[#F3F4F6]">
                      <td className="px-4 py-3 text-[#111827]">{m}</td>
                      {ACTIONS.map((a) => (
                        <td key={a} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions[m]?.[a] ?? false}
                            onChange={() => togglePermission(m, a)}
                            className="h-4 w-4 rounded border-[#E5E7EB] text-[#000080] focus:ring-[#000080]"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push("/settings/roles")}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
