"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { allAnnouncements } from "@/lib/mock-data";

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

// Convert "MM/DD/YYYY" to "YYYY-MM-DD" for date inputs
function toInputDate(value: string): string {
  if (!value) return "";
  if (value.includes("-")) return value;
  const parts = value.split("/");
  if (parts.length !== 3) return "";
  const [m, d, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export default function EditAnnouncementClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const existing =
    allAnnouncements.find((a) => a.id === id) || allAnnouncements[0];

  const [formData, setFormData] = useState({
    title: existing.title,
    body: existing.body,
    audience: existing.audience,
    scheduledDate: toInputDate(existing.scheduledDate),
    status: existing.status,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Update announcement:", id, formData);
    router.push(`/communication/announcements/${id}`);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Communication"
        subtitle="Edit Announcement"
        backHref={`/communication/announcements/${id}`}
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <TextAreaField
            label="Body"
            name="body"
            value={formData.body}
            onChange={handleChange}
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
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push(`/communication/announcements/${id}`)}
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
