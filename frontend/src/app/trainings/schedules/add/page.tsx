"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField } from "@/components/ui/FormField";
import { trainingCourses } from "@/lib/mock-data";

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Upcoming", value: "Upcoming" },
];

export default function AddSchedulePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    courseId: "",
    instructor: "",
    startDate: "",
    endDate: "",
    dayTime: "",
    venue: "",
    capacity: "",
    status: "Upcoming",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const el = (e.target as HTMLFormElement).elements;
    const getVal = (name: string) =>
      ((el.namedItem(name) as HTMLInputElement | null)?.value ?? "").trim();

    const courseId = getVal("courseId") || formData.courseId.trim();
    const startDate = getVal("startDate") || formData.startDate.trim();
    const endDate = getVal("endDate") || formData.endDate.trim();

    if (!courseId || !startDate || !endDate) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Create schedule:", formData);
      router.push("/trainings/schedules");
    } finally {
      setSubmitting(false);
    }
  };

  const courseOptions = trainingCourses.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  return (
    <DashboardLayout>
      <PageHeader
        title="Trainings"
        subtitle="Add Schedule"
        backHref="/trainings/schedules"
      />

      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <SelectField
            label="Course"
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            options={courseOptions}
            required
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <FormField label="Instructor" name="instructor" value={formData.instructor} onChange={handleChange} placeholder="Lead instructor" required />
            <FormField label="Day / Time" name="dayTime" value={formData.dayTime} onChange={handleChange} placeholder="e.g. Saturdays, 10:00 AM" required />
            <FormField label="Start Date" type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
            <FormField label="End Date" type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
            <FormField label="Venue" name="venue" value={formData.venue} onChange={handleChange} placeholder="e.g. Main Hall" required />
            <FormField label="Capacity" type="number" name="capacity" value={formData.capacity} onChange={handleChange} />
            <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={STATUS_OPTIONS} />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push("/trainings/schedules")}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save Schedule"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
