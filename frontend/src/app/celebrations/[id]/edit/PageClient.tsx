"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { celebrations } from "@/lib/mock-data";

const TYPE_OPTIONS = [
  { label: "Birthday", value: "Birthday" },
  { label: "Wedding Anniversary", value: "Wedding Anniversary" },
  { label: "Thanksgiving", value: "Thanksgiving" },
  { label: "Child Dedication", value: "Child Dedication" },
];

const STATUS_OPTIONS = [
  { label: "Scheduled", value: "Scheduled" },
  { label: "Completed", value: "Completed" },
];

function toInputDate(value: string): string {
  if (!value) return "";
  if (value.includes("-")) return value;
  const parts = value.split("/");
  if (parts.length !== 3) return "";
  const [m, d, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export default function EditCelebrationClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const existing = celebrations.find((c) => c.id === id) || celebrations[0];

  const [formData, setFormData] = useState({
    name: existing.name,
    type: existing.type,
    date: toInputDate(existing.date),
    status: existing.status,
    years: existing.years?.toString() || "",
    notes: existing.notes || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Update celebration:", id, formData);
    router.push(`/celebrations/${id}`);
  };

  const isAnniversary = formData.type === "Wedding Anniversary";

  return (
    <DashboardLayout>
      <PageHeader
        title="Celebrations"
        subtitle="Edit Celebration"
        backHref={`/celebrations/${id}`}
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Name" name="name" value={formData.name} onChange={handleChange} required />

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <SelectField label="Type" name="type" value={formData.type} onChange={handleChange} options={TYPE_OPTIONS} required />
            <FormField label="Date" type="date" name="date" value={formData.date} onChange={handleChange} required />
            <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={STATUS_OPTIONS} />
            {isAnniversary && (
              <FormField label="Years" type="number" name="years" value={formData.years} onChange={handleChange} />
            )}
          </div>

          <TextAreaField label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push(`/celebrations/${id}`)}>
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
