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
  { label: "Special Service", value: "SPECIAL_SERVICE" },
  { label: "Conference", value: "CONFERENCE" },
  { label: "Wedding", value: "WEDDING" },
  { label: "Funeral", value: "FUNERAL" },
];

const LOCATION_TYPE_OPTIONS = [
  { label: "Physical", value: "PHYSICAL" },
  { label: "Virtual", value: "VIRTUAL" },
  { label: "Hybrid", value: "HYBRID" },
];

const NIGERIA_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
];

function timeToEpochMs(date: string, time: string): number | undefined {
  if (!date || !time) return undefined;
  return new Date(`${date}T${time}:00`).getTime();
}

export default function AddEventPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    preacher: "",
    topic: "",
    category: "",
    date: "",
    startTime: "",
    endTime: "",
    locationType: "",
    virtualMeetingLink: "",
    street: "",
    city: "",
    state: "",
    country: "Nigeria",
    additionalInstructions: "",
    eFlyer: "",
    requiresRegistration: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Safari's native date picker updates the DOM without always firing React's onChange.
    // Read directly from the DOM element as the authoritative value, falling back to state.
    const dateEl = document.getElementById("event-date-input") as HTMLInputElement | null;
    const date = dateEl?.value || formData.date || "";

    if (!date) {
      setError("Please select a date for the event.");
      return;
    }

    setLoading(true);
    try {
      await createEvent({
        title: formData.title,
        preacher: formData.preacher || undefined,
        topic: formData.topic || undefined,
        category: formData.category || undefined,
        date,
        startTime: timeToEpochMs(date, formData.startTime),
        endTime: timeToEpochMs(date, formData.endTime),
        locationType: formData.locationType || undefined,
        virtualMeetingLink: formData.virtualMeetingLink || undefined,
        street: formData.street || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        additionalInformation: formData.additionalInstructions || undefined,
        eFlyer: formData.eFlyer || undefined,
        requiresRegistration: formData.requiresRegistration || undefined,
      });
      router.push("/event-management");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create event.";
      setError(msg);
      setLoading(false);
    }
  };

  const isVirtual = formData.locationType === "VIRTUAL" || formData.locationType === "HYBRID";
  const isPhysical = formData.locationType === "PHYSICAL" || formData.locationType === "HYBRID";

  return (
    <DashboardLayout>
      <PageHeader
        title="Event Management"
        subtitle="Create Event"
        backHref="/event-management"
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <FormField
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
            />
            <FormField
              label="Preacher / Speaker"
              name="preacher"
              value={formData.preacher}
              onChange={handleChange}
              placeholder="Name of preacher or speaker"
            />
            <FormField
              label="Topic / Theme"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="Message topic or event theme"
            />
            <SelectField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={CATEGORY_OPTIONS}
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
            <FormField
              id="event-date-input"
              label="Event Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              onInput={handleChange as React.FormEventHandler}
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

          {/* Location Type */}
          <SelectField
            label="Location Type"
            name="locationType"
            value={formData.locationType}
            onChange={handleChange}
            options={LOCATION_TYPE_OPTIONS}
          />

          {isVirtual && (
            <FormField
              label="Virtual Meeting Link"
              name="virtualMeetingLink"
              value={formData.virtualMeetingLink}
              onChange={handleChange}
              placeholder="https://zoom.us/j/..."
            />
          )}

          {isPhysical && (
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
              <FormField
                label="Street / Venue"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Street address or venue name"
              />
              <FormField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
              />
              <SelectField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                options={NIGERIA_STATES.map((s) => ({ label: s, value: s }))}
              />
              <FormField
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
              />
            </div>
          )}

          <TextAreaField
            label="Additional Information"
            name="additionalInstructions"
            value={formData.additionalInstructions}
            onChange={handleChange}
            placeholder="Event description, instructions, or notes"
            rows={4}
          />

          <FormField
            label="E-Flyer URL"
            name="eFlyer"
            value={formData.eFlyer}
            onChange={handleChange}
            placeholder="https://... (link to event flyer image)"
          />

          <div className="flex items-center gap-2 pt-1">
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
