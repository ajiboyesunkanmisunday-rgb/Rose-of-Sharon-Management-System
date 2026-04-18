"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";

const AUDIENCE_OPTIONS = [
  { label: "All Members", value: "All Members" },
  { label: "Workers", value: "Workers" },
  { label: "Choir", value: "Choir" },
  { label: "Ushering", value: "Ushering" },
  { label: "Youth", value: "Youth" },
  { label: "Children", value: "Children" },
];

const STATUS_OPTIONS = [
  { label: "Draft", value: "Draft" },
  { label: "Scheduled", value: "Scheduled" },
  { label: "Published", value: "Published" },
];

export default function AddAnnouncementPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    audience: "",
    scheduledDate: "",
    status: "Draft",
    publishNow: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      status: formData.publishNow ? "Published" : formData.status,
    };
    console.log("Create announcement:", payload);
    router.push("/communication/announcements");
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Communication"
        subtitle="Create Announcement"
        backHref="/communication/announcements"
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter announcement title"
            required
          />

          <TextAreaField
            label="Body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            placeholder="Enter announcement details"
            rows={6}
            required
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <SelectField
              label="Audience"
              name="audience"
              value={formData.audience}
              onChange={handleChange}
              options={AUDIENCE_OPTIONS}
              required
            />
            <FormField
              label="Scheduled Date"
              type="date"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              required
            />
            <SelectField
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={STATUS_OPTIONS}
              placeholder="Select status"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="publishNow"
              name="publishNow"
              checked={formData.publishNow}
              onChange={handleChange}
              className="h-4 w-4 rounded border-[#E5E7EB] text-[#000080] focus:ring-[#000080]"
            />
            <label htmlFor="publishNow" className="text-sm text-[#374151]">
              Publish immediately (overrides status)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/communication/announcements")}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Announcement
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
