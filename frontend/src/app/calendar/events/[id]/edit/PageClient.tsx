"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { getEvent, updateEvent } from "@/lib/api";

const CATEGORY_OPTIONS = [
  { label: "Service",         value: "SERVICE"         },
  { label: "Special Service", value: "SPECIAL_SERVICE" },
  { label: "Conference",      value: "CONFERENCE"      },
  { label: "Wedding",         value: "WEDDING"         },
  { label: "Funeral",         value: "FUNERAL"         },
  { label: "Bible Study",     value: "Bible Study"     },
  { label: "Youth",           value: "Youth"           },
  { label: "Birthday",        value: "Birthday"        },
  { label: "Meeting",         value: "Meeting"         },
  { label: "Other",           value: "Other"           },
];

function epochToTimeInput(ms?: number): string {
  if (!ms) return "";
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function timeToEpochMs(date: string, time: string): number | undefined {
  if (!date) return undefined;
  const t = time || "00:00";
  return new Date(`${date}T${t}:00`).getTime();
}

export default function EditCalendarEventClient() {
  const router = useRouter();
  const params = useParams();
  const paramId = params.id as string;
  const [id, setId] = useState(paramId);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 2] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    category: "",
    location: "",
    description: "",
    preacher: "",
    topic: "",
    locationType: "",
    virtualMeetingLink: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const populate = useCallback(async () => {
    if (!id || id.startsWith("cal-")) return;
    try {
      const ev = await getEvent(id);
      setFormData({
        title:              ev.title ?? "",
        date:               ev.date ?? "",
        startTime:          epochToTimeInput(ev.startTime),
        endTime:            epochToTimeInput(ev.endTime),
        category:           ev.eventCategory ?? "",
        location:           [ev.street, ev.city, ev.state].filter(Boolean).join(", "),
        description:        ev.additionalInstructions ?? "",
        preacher:           ev.preacher ?? "",
        topic:              ev.topic ?? "",
        locationType:       ev.locationType ?? "",
        virtualMeetingLink: ev.virtualMeetingLink ?? "",
      });
    } catch { /* silently fall back to empty fields */ }
  }, [id]);

  useEffect(() => { populate(); }, [populate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const dateEl = document.getElementById("event-date-input") as HTMLInputElement | null;
    const date = dateEl?.value || formData.date || "";

    if (!date) {
      setError("Please select a date for the event.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await updateEvent(id, {
        title:                  formData.title,
        preacher:               formData.preacher || undefined,
        topic:                  formData.topic || undefined,
        category:               formData.category || undefined,
        date,
        startTime:              timeToEpochMs(date, formData.startTime),
        endTime:                timeToEpochMs(date, formData.endTime),
        locationType:           formData.locationType || undefined,
        virtualMeetingLink:     formData.virtualMeetingLink || undefined,
        additionalInformation: formData.description || undefined,
      });
      router.push(`/calendar/events/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event.");
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Calendar"
        subtitle="Edit Event"
        backHref={`/calendar/events/${id}`}
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Event Name" name="title" value={formData.title} onChange={handleChange} required />

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <FormField id="event-date-input" label="Date" type="date" name="date" value={formData.date} onChange={handleChange} onInput={handleChange as React.FormEventHandler} required />
            <FormField label="Start Time" type="time" name="startTime" value={formData.startTime} onChange={handleChange} />
            <FormField label="End Time" type="time" name="endTime" value={formData.endTime} onChange={handleChange} />
            <SelectField label="Category" name="category" value={formData.category} onChange={handleChange} options={CATEGORY_OPTIONS} required />
            <FormField label="Preacher / Speaker" name="preacher" value={formData.preacher} onChange={handleChange} />
            <FormField label="Topic" name="topic" value={formData.topic} onChange={handleChange} />
          </div>

          <TextAreaField label="Description" name="description" value={formData.description} onChange={handleChange} rows={4} />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push(`/calendar/events/${id}`)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
