"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { calendarEvents } from "@/lib/mock-data";

const CATEGORY_OPTIONS = [
  { label: "Service", value: "Service" },
  { label: "Bible Study", value: "Bible Study" },
  { label: "Youth", value: "Youth" },
  { label: "Birthday", value: "Birthday" },
  { label: "Meeting", value: "Meeting" },
  { label: "Other", value: "Other" },
];

export default function EditCalendarEventClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const existing = calendarEvents.find((e) => e.id === id) || calendarEvents[0];

  const [formData, setFormData] = useState({
    name: existing.name,
    date: existing.date,
    time: existing.time,
    category: existing.category,
    location: existing.location || "",
    description: existing.description || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Update calendar event:", id, formData);
    router.push(`/calendar/events/${id}`);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Calendar"
        subtitle="Edit Event"
        backHref={`/calendar/events/${id}`}
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Event Name" name="name" value={formData.name} onChange={handleChange} required />

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <FormField label="Date" type="date" name="date" value={formData.date} onChange={handleChange} required />
            <FormField label="Time" name="time" value={formData.time} onChange={handleChange} required />
            <SelectField label="Category" name="category" value={formData.category} onChange={handleChange} options={CATEGORY_OPTIONS} required />
            <FormField label="Location" name="location" value={formData.location} onChange={handleChange} />
          </div>

          <TextAreaField label="Description" name="description" value={formData.description} onChange={handleChange} rows={4} />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push(`/calendar/events/${id}`)}>
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
