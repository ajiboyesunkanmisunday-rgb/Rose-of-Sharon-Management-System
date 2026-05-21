"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { createEvent } from "@/lib/api";

const CATEGORY_OPTIONS = [
  { label: "Service", value: "SERVICE" },
  { label: "Bible Study", value: "BIBLE_STUDY" },
  { label: "Youth", value: "YOUTH" },
  { label: "Meeting", value: "MEETING" },
  { label: "Special Event", value: "SPECIAL_EVENT" },
  { label: "Other", value: "OTHER" },
];

const LOCATION_TYPE_OPTIONS = [
  { label: "Physical", value: "PHYSICAL" },
  { label: "Online / Virtual", value: "ONLINE" },
  { label: "Hybrid", value: "HYBRID" },
];

/** Convert a date string + "HH:MM" time string to epoch milliseconds */
function toEpochMs(date: string, time: string): number | undefined {
  if (!date) return undefined;
  const t = time || "00:00";
  const d = new Date(`${date}T${t}:00`);
  return isNaN(d.getTime()) ? undefined : d.getTime();
}

export default function AddCalendarEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    category: "",
    locationType: "PHYSICAL",
    street: "",
    city: "",
    state: "",
    country: "",
    virtualMeetingLink: "",
    preacher: "",
    topic: "",
    additionalInformation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { setError("Event title is required."); return; }
    if (!formData.date) { setError("Date is required."); return; }

    setLoading(true);
    setError("");
    try {
      await createEvent({
        title: formData.title.trim(),
        date: formData.date,
        startTime: toEpochMs(formData.date, formData.startTime),
        endTime: toEpochMs(formData.date, formData.endTime),
        category: formData.category || undefined,
        locationType: formData.locationType || undefined,
        street: formData.street.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        country: formData.country.trim() || undefined,
        virtualMeetingLink: formData.virtualMeetingLink.trim() || undefined,
        preacher: formData.preacher.trim() || undefined,
        topic: formData.topic.trim() || undefined,
        additionalInformation: formData.additionalInformation.trim() || undefined,
      });
      router.push("/calendar");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  const isOnline = formData.locationType === "ONLINE";
  const isPhysical = formData.locationType !== "ONLINE";

  return (
    <DashboardLayout>
      <PageHeader
        title="Calendar"
        subtitle="Add Event"
        backHref="/calendar"
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Event Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter event title"
            required
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
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
            />
            <FormField
              label="End Time"
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <SelectField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={CATEGORY_OPTIONS}
            />
            <SelectField
              label="Location Type"
              name="locationType"
              value={formData.locationType}
              onChange={handleChange}
              options={LOCATION_TYPE_OPTIONS}
            />
          </div>

          {/* Physical address */}
          {isPhysical && (
            <>
              <FormField
                label="Street Address"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="e.g. 12 Church Road"
              />
              <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
                <FormField label="City" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
                <FormField label="State" name="state" value={formData.state} onChange={handleChange} placeholder="State" />
                <FormField label="Country" name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
              </div>
            </>
          )}

          {/* Virtual meeting link */}
          {(isOnline || formData.locationType === "HYBRID") && (
            <FormField
              label="Virtual Meeting Link"
              name="virtualMeetingLink"
              value={formData.virtualMeetingLink}
              onChange={handleChange}
              placeholder="https://meet.google.com/..."
            />
          )}

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <FormField
              label="Preacher / Speaker"
              name="preacher"
              value={formData.preacher}
              onChange={handleChange}
              placeholder="e.g. Pastor John"
            />
            <FormField
              label="Topic / Theme"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g. The Power of Faith"
            />
          </div>

          <TextAreaField
            label="Additional Information"
            name="additionalInformation"
            value={formData.additionalInformation}
            onChange={handleChange}
            placeholder="Any extra details or instructions"
            rows={3}
          />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/calendar")}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save Event"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
