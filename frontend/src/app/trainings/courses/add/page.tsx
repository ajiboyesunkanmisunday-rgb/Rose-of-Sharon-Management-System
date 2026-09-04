"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField } from "@/components/ui/FormField";
import { createTrainingEvent } from "@/lib/api";

const CATEGORY_OPTIONS = [
  { label: "Water Baptism", value: "BAPTISM" },
  { label: "Workers in Training", value: "WORKERS_IN_TRAINING" },
  { label: "School of Disciples", value: "SCHOOL_OF_DISCIPLES" },
  { label: "School of Ministry", value: "SCHOOL_OF_MINISTRY" },
];

export default function AddCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    trainingCategory: "",
    teacher: "",
    date: "",
    location: "",
    set: "",
    isExam: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.name.trim() || !formData.trainingCategory || !formData.date) {
      setError("Please fill in Course Name, Category and Date.");
      return;
    }
    setSubmitting(true);
    try {
      await createTrainingEvent({
        name: formData.name.trim(),
        trainingCategory: formData.trainingCategory,
        teacher: formData.teacher.trim() || undefined,
        date: formData.date,
        location: formData.location.trim() || undefined,
        set: formData.set.trim() || undefined,
        isExam: formData.isExam,
      });
      router.push("/trainings/courses");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save course.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Trainings" subtitle="Add Course" backHref="/trainings/courses" />

      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Course Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Water Baptism Class"
            required
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <SelectField
              label="Category"
              name="trainingCategory"
              value={formData.trainingCategory}
              onChange={handleChange}
              options={CATEGORY_OPTIONS}
              required
            />
            <FormField
              label="Instructor / Teacher"
              name="teacher"
              value={formData.teacher}
              onChange={handleChange}
              placeholder="Instructor's name"
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
              label="Venue / Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Main Hall"
            />
            <FormField
              label="Set"
              name="set"
              value={formData.set}
              onChange={handleChange}
              placeholder="e.g. 2026A"
            />
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="isExam"
                name="isExam"
                checked={formData.isExam}
                onChange={handleChange}
                className="h-4 w-4 rounded border-[#D1D5DB] text-[#000080] focus:ring-[#000080]"
              />
              <label htmlFor="isExam" className="text-sm font-medium text-[#374151] dark:text-slate-300">
                This is an exam session
              </label>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push("/trainings/courses")}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save Course"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
