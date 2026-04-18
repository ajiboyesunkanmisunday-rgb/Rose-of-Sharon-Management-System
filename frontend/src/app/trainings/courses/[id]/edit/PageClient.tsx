"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { trainingCourses } from "@/lib/mock-data";

const CATEGORY_OPTIONS = [
  { label: "Spiritual Formation", value: "Spiritual Formation" },
  { label: "Discipleship", value: "Discipleship" },
  { label: "Leadership", value: "Leadership" },
  { label: "Counseling", value: "Counseling" },
  { label: "Teaching", value: "Teaching" },
  { label: "Youth Ministry", value: "Youth Ministry" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Upcoming", value: "Upcoming" },
  { label: "Completed", value: "Completed" },
];

function toInputDate(value: string): string {
  if (!value) return "";
  if (value.includes("-")) return value;
  const parts = value.split("/");
  if (parts.length !== 3) return "";
  const [m, d, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export default function EditCourseClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const existing = trainingCourses.find((c) => c.id === id) || trainingCourses[0];

  const [formData, setFormData] = useState({
    name: existing.name,
    description: existing.description,
    category: existing.category,
    instructor: existing.instructor,
    duration: existing.duration,
    startDate: toInputDate(existing.startDate || ""),
    endDate: toInputDate(existing.endDate || ""),
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
    console.log("Update course:", id, formData);
    router.push(`/trainings/courses/${id}`);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Trainings"
        subtitle="Edit Course"
        backHref={`/trainings/courses/${id}`}
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Course Name" name="name" value={formData.name} onChange={handleChange} required />
          <TextAreaField label="Description" name="description" value={formData.description} onChange={handleChange} rows={4} required />

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <SelectField label="Category" name="category" value={formData.category} onChange={handleChange} options={CATEGORY_OPTIONS} required />
            <FormField label="Instructor" name="instructor" value={formData.instructor} onChange={handleChange} required />
            <FormField label="Duration" name="duration" value={formData.duration} onChange={handleChange} required />
            <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={STATUS_OPTIONS} />
            <FormField label="Start Date" type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
            <FormField label="End Date" type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push(`/trainings/courses/${id}`)}>
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
