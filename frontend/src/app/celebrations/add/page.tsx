"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";

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

export default function AddCelebrationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    date: "",
    status: "Scheduled",
    years: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Add celebration:", formData);
    router.push("/celebrations");
  };

  const isAnniversary = formData.type === "Wedding Anniversary";

  return (
    <DashboardLayout>
      <PageHeader title="Celebrations" subtitle="Add Celebration" backHref="/celebrations" />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label={isAnniversary ? "Couple Name" : "Person's Name"}
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={isAnniversary ? "e.g. John & Sarah Michael" : "e.g. John Michael"}
            required
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <SelectField label="Type" name="type" value={formData.type} onChange={handleChange} options={TYPE_OPTIONS} required />
            <FormField label="Date" type="date" name="date" value={formData.date} onChange={handleChange} required />
            <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={STATUS_OPTIONS} />
            {isAnniversary && (
              <FormField
                label="Years"
                type="number"
                name="years"
                value={formData.years}
                onChange={handleChange}
                placeholder="e.g. 5"
              />
            )}
          </div>

          <TextAreaField label="Notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="Optional notes" rows={3} />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push("/celebrations")}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Celebration
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
