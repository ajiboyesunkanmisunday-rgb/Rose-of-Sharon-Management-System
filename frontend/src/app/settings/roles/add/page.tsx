"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, TextAreaField } from "@/components/ui/FormField";

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

type Matrix = Record<string, Record<(typeof ACTIONS)[number], boolean>>;

const initialMatrix: Matrix = MODULES.reduce<Matrix>((acc, m) => {
  acc[m] = { view: false, create: false, edit: false, delete: false };
  return acc;
}, {});

export default function AddRolePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [permissions, setPermissions] = useState<Matrix>(initialMatrix);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (f: string) => setTouched((t) => ({ ...t, [f]: true }));

  const fieldErrors = {
    name: !formData.name.trim() ? "Role name is required" : "",
  };

  const isFormValid = !!formData.name.trim();

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

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const el = (e.target as HTMLFormElement).elements;
    const getVal = (fieldName: string) =>
      ((el.namedItem(fieldName) as HTMLInputElement | null)?.value ?? "").trim();

    const name = getVal("name") || formData.name.trim();

    if (!name) {
      setSubmitError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Add role:", { ...formData, permissions });
      router.push("/settings/roles");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        subtitle="Add Role"
        backHref="/settings/roles"
      />

      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Role Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => touch("name")}
            placeholder="e.g. Department Head"
            required
            error={touched.name ? fieldErrors.name : undefined}
          />

          <TextAreaField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the role's responsibilities"
            rows={3}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151] dark:text-slate-300">
              Permissions
            </label>
            <div className="overflow-x-auto rounded-lg border border-[#E5E7EB] dark:border-slate-700">
              <table className="min-w-[500px] w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#F3F4F6] dark:bg-slate-700/30">
                    <th className="px-4 py-3 text-sm font-bold text-[#000080] dark:text-indigo-400">Module</th>
                    {ACTIONS.map((a) => (
                      <th
                        key={a}
                        className="px-4 py-3 text-center text-sm font-bold capitalize text-[#000080] dark:text-indigo-400"
                      >
                        {a}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((m) => (
                    <tr key={m} className="border-b border-[#F3F4F6]">
                      <td className="px-4 py-3 text-[#111827] dark:text-slate-100">{m}</td>
                      {ACTIONS.map((a) => (
                        <td key={a} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions[m][a]}
                            onChange={() => togglePermission(m, a)}
                            className="h-4 w-4 rounded border-[#E5E7EB] dark:border-slate-700 text-[#000080] dark:text-indigo-400 focus:ring-[#000080]"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">{submitError}</div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/settings/roles")}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save Role"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
