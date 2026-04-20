"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import PhotoUpload from "@/components/ui/PhotoUpload";
import { testimonies } from "@/lib/mock-data";

const CATEGORY_OPTIONS = [
  { label: "Healing", value: "Healing" },
  { label: "Financial", value: "Financial" },
  { label: "Marriage", value: "Marriage" },
  { label: "Salvation", value: "Salvation" },
  { label: "Other", value: "Other" },
];

const STATUS_OPTIONS = [
  { label: "Pending", value: "Pending" },
  { label: "Published", value: "Published" },
];

export default function EditTestimonyPage() {
  const router = useRouter();
  const params = useParams();
  const existing = testimonies.find((t) => t.id === params.id) || testimonies[0];

  const [formData, setFormData] = useState({
    name: existing.name,
    date: existing.date,
    category: existing.category,
    status: existing.status,
    content: existing.content,
  });
  const [photo, setPhoto] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Update testimony:", existing.id, formData, photo);
    router.push(`/testimonies/${existing.id}`);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Testimonies"
        subtitle="Edit Testimony"
        backHref={`/testimonies/${existing.id}`}
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <FormField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <FormField
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <SelectField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={CATEGORY_OPTIONS}
              required
            />
            <SelectField
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={STATUS_OPTIONS}
            />
          </div>

          <TextAreaField
            label="Testimony"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={6}
            required
          />

          <PhotoUpload label="Photo (optional)" value={photo} onChange={setPhoto} />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push(`/testimonies/${existing.id}`)}
            >
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
