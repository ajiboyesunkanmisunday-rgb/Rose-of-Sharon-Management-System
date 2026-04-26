"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { createEvent } from "@/lib/api";

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
];

const TYPE_OPTIONS = [
  { label: "Virtual", value: "Virtual" },
  { label: "Hybrid", value: "Hybrid" },
  { label: "Physical", value: "Physical" },
];

export default function AddEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    topic: "",
    type: "",
    category: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    location: "",
    capacity: "",
    description: "",
    status: "Upcoming",
    requiresRegistration: false,
    newConvertsCount: "",
    firstTimersCount: "",
    secondTimersCount: "",
    eMembersCount: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createEvent({
        name: formData.name,
        topic: formData.topic || undefined,
        eventDate: formData.eventDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        category: formData.category,
        type: formData.type || undefined,
        description: formData.description || undefined,
        capacity: formData.capacity ? Number(formData.capacity) : undefined,
        requiresRegistration: formData.requiresRegistration,
        status: formData.status,
        newConvertsCount: formData.newConvertsCount ? Number(formData.newConvertsCount) : undefined,
        firstTimersCount: formData.firstTimersCount ? Number(formData.firstTimersCount) : undefined,
        secondTimersCount: formData.secondTimersCount ? Number(formData.secondTimersCount) : undefined,
        eMembersCount: formData.eMembersCount ? Number(formData.eMembersCount) : undefined,
      });
      router.push("/event-management");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create event.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Event Management"
        subtitle="Create Event"
        backHref="/event-management"
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Event Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter event name"
            required
          />

          <FormField
            label="Topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            placeholder="Event topic / theme"
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
            <SelectField
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={TYPE_OPTIONS}
            />
            <FormField
              label="Event Date"
              type="date"
              name="eventDate"
              value={formData.eventDate}
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
              placeholder="Enter venue"
              required
            />
            <FormField
              label="Capacity"
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="Maximum attendees"
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
            placeholder="Event description and details"
            rows={5}
          />

          <div className="pt-2">
            <h3 className="mb-3 text-sm font-semibold text-[#111827]">Expected Attendance Breakdown</h3>
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
              <FormField
                label="New Converts"
                type="number"
                name="newConvertsCount"
                value={formData.newConvertsCount}
                onChange={handleChange}
                placeholder="0"
              />
              <FormField
                label="First Timers"
                type="number"
                name="firstTimersCount"
                value={formData.firstTimersCount}
                onChange={handleChange}
                placeholder="0"
              />
              <FormField
                label="Second Timers"
                type="number"
                name="secondTimersCount"
                value={formData.secondTimersCount}
                onChange={handleChange}
                placeholder="0"
              />
              <FormField
                label="E-Members"
                type="number"
                name="eMembersCount"
                value={formData.eMembersCount}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
          </div>

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

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/event-management")}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
