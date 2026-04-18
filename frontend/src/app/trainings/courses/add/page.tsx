"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";

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
];

export default function AddCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    instructor: "",
    duration: "",
    startDate: "",
    endDate: "",
    status: "Upcoming",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Create course:", formData);
    router.push("/trainings/courses");
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Trainings"
        subtitle="Add Course"
        backHref="/trainings/courses"
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Course Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Water Baptism Class"
            required
          />

          <TextAreaField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Course overview and objectives"
            rows={4}
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
              label="Instructor"
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              placeholder="Instructor's name"
              required
            />
            <FormField
              label="Duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g. 6 weeks"
              required
            />
            <SelectField
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={STATUS_OPTIONS}
            />
            <FormField
              label="Start Date"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
            <FormField
              label="End Date"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/trainings/courses")}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Course
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
