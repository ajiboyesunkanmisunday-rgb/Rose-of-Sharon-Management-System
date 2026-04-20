"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import PhotoUpload from "@/components/ui/PhotoUpload";

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

export default function AddTestimonyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    category: "",
    status: "Pending",
    content: "",
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
    console.log("Create testimony:", formData, photo);
    router.push("/testimonies");
  };

  return (
    <DashboardLayout>
      <PageHeader title="Testimonies" subtitle="New Testimony" backHref="/testimonies" />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <FormField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Member name"
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
            placeholder="Share the testimony..."
            rows={6}
            required
          />

          <PhotoUpload label="Photo (optional)" value={photo} onChange={setPhoto} />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/testimonies")}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Testimony
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
