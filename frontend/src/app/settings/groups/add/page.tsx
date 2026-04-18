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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Add group:", formData);
    router.push("/settings/groups");
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        subtitle="Add Group"
        backHref="/settings/groups"
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Group Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Prayer Warriors"
            required
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

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/settings/groups")}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Group
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
