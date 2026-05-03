"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, TextAreaField } from "@/components/ui/FormField";
import { getRole, updateRole } from "@/lib/api";

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

type PermissionsMap = Record<string, Record<string, boolean>>;

const defaultPermissions = (): PermissionsMap =>
  Object.fromEntries(
    MODULES.map((m) => [m, Object.fromEntries(ACTIONS.map((a) => [a, false]))])
  );

export default function EditRoleClient() {
  const router = useRouter();
  const params = useParams();
  const paramId = params.id as string;
  const [id, setId] = useState(paramId);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 2] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [formData, setFormData] = useState({ name: "", description: "" });
  const [permissions, setPermissions] = useState<PermissionsMap>(defaultPermissions());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const populate = useCallback(async () => {
    if (!id || id.startsWith("r-")) return;
    try {
      const role = await getRole(id);
      setFormData({
        name: role.name ?? "",
        description: role.description ?? "",
      });
    } catch { /* silently fall back to empty form */ }
  }, [id]);

  useEffect(() => { populate(); }, [populate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePermission = (module: string, action: (typeof ACTIONS)[number]) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: { ...prev[module], [action]: !prev[module]?.[action] },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await updateRole(id, {
        name: formData.name,
        description: formData.description || undefined,
      });
      router.push("/settings/roles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role.");
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        subtitle="Edit Role"
        backHref="/settings/roles"
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Role Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextAreaField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />

          {/* Permissions matrix — frontend-only until backend adds permissions API */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              Permissions
              <span className="ml-2 text-xs font-normal text-[#9CA3AF]">(visual only — saved locally)</span>
            </label>
            <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
              <table className="min-w-[500px] w-full text-left text-sm">
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
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/settings/roles")}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
