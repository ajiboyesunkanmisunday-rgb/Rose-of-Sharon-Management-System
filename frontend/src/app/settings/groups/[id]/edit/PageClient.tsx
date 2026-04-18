"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, TextAreaField } from "@/components/ui/FormField";
import { groups } from "@/lib/mock-data";

export default function EditGroupClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const existing = groups.find((g) => g.id === id) || groups[0];

  const [formData, setFormData] = useState({
    name: existing.name,
    description: existing.description,
    leader: existing.leader,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Update group:", id, formData);
    router.push(`/settings/groups/${id}`);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        subtitle="Edit Group"
        backHref={`/settings/groups/${id}`}
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Group Name" name="name" value={formData.name} onChange={handleChange} required />
          <TextAreaField label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} />
          <FormField label="Leader" name="leader" value={formData.leader} onChange={handleChange} required />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push(`/settings/groups/${id}`)}>
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
