"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, TextAreaField } from "@/components/ui/FormField";

export default function AddGroupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    leader: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (f: string) => setTouched((t) => ({ ...t, [f]: true }));

  const fieldErrors = {
    name: !formData.name.trim() ? "Group name is required" : "",
  };

  const isFormValid = !!formData.name.trim();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      console.log("Add group:", formData);
      router.push("/settings/groups");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        subtitle="Add Group"
        backHref="/settings/groups"
      />

      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Group Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => touch("name")}
            placeholder="e.g. Prayer Warriors"
            required
            error={touched.name ? fieldErrors.name : undefined}
          />
          <TextAreaField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of the group"
            rows={3}
          />
          <FormField
            label="Leader"
            name="leader"
            value={formData.leader}
            onChange={handleChange}
            placeholder="Group leader's name"
            required
          />

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">{submitError}</div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/settings/groups")}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save Group"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
