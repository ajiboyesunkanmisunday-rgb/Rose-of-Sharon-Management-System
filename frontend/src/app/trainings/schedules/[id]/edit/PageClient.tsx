"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField } from "@/components/ui/FormField";
import { trainingSchedules, trainingCourses } from "@/lib/mock-data";

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Upcoming", value: "Upcoming" },
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

export default function EditScheduleClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const existing =
    trainingSchedules.find((s) => s.id === id) || trainingSchedules[0];

  const [formData, setFormData] = useState({
    courseId: existing.courseId,
    instructor: existing.instructor,
    startDate: toInputDate(existing.startDate),
    endDate: toInputDate(existing.endDate),
    dayTime: existing.dayTime,
    venue: existing.venue,
    capacity: String(existing.capacity),
    status: existing.status,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Update schedule:", id, formData);
    router.push(`/trainings/schedules/${id}`);
  };

  const courseOptions = trainingCourses.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  return (
    <DashboardLayout>
      <PageHeader
        title="Trainings"
        subtitle="Edit Schedule"
        backHref={`/trainings/schedules/${id}`}
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <SelectField label="Course" name="courseId" value={formData.courseId} onChange={handleChange} options={courseOptions} required />

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <FormField label="Instructor" name="instructor" value={formData.instructor} onChange={handleChange} required />
            <FormField label="Day / Time" name="dayTime" value={formData.dayTime} onChange={handleChange} required />
            <FormField label="Start Date" type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
            <FormField label="End Date" type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
            <FormField label="Venue" name="venue" value={formData.venue} onChange={handleChange} required />
            <FormField label="Capacity" type="number" name="capacity" value={formData.capacity} onChange={handleChange} />
            <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={STATUS_OPTIONS} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push(`/trainings/schedules/${id}`)}>
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
