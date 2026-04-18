"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { allEvents } from "@/lib/mock-data";

const CATEGORY_OPTIONS = [
  { label: "Service", value: "Service" },
  { label: "Conference", value: "Conference" },
  { label: "Training", value: "Training" },
  { label: "Social", value: "Social" },
  { label: "Wedding", value: "Wedding" },
  { label: "Funeral", value: "Funeral" },
  { label: "Outreach", value: "Outreach" },
];

const STATUS_OPTIONS = [
  { label: "Upcoming", value: "Upcoming" },
  { label: "Ongoing", value: "Ongoing" },
  { label: "Completed", value: "Completed" },
  { label: "Cancelled", value: "Cancelled" },
];

function toInputDate(value: string): string {
  if (!value) return "";
  if (value.includes("-")) return value;
  const parts = value.split("/");
  if (parts.length !== 3) return "";
  const [m, d, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export default function EditEventClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const existing = allEvents.find((e) => e.id === id) || allEvents[0];

  const [formData, setFormData] = useState({
    name: existing.name,
    category: existing.category,
    date: toInputDate(existing.date),
    startTime: existing.startTime,
    endTime: existing.endTime,
    location: existing.location,
    capacity: String(existing.capacity),
    description: existing.description,
    status: existing.status,
    requiresRegistration: existing.requiresRegistration,
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
    console.log("Update event:", id, formData);
    router.push(`/event-management/${id}`);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Event Management"
        subtitle="Edit Event"
        backHref={`/event-management/${id}`}
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Event Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <SelectField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={CATEGORY_OPTIONS}
              required
            />
            <FormField
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <FormField
              label="Start Time"
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
            <FormField
              label="End Time"
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
            <FormField
              label="Location / Venue"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
            <FormField
              label="Capacity"
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
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
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="requiresRegistration"
              name="requiresRegistration"
              checked={formData.requiresRegistration}
              onChange={handleChange}
              className="h-4 w-4 rounded border-[#E5E7EB] text-[#000080] focus:ring-[#000080]"
            />
            <label htmlFor="requiresRegistration" className="text-sm text-[#374151]">
              Requires registration
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push(`/event-management/${id}`)}
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
