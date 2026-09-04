"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField } from "@/components/ui/FormField";
import { getTrainingEvent, updateTrainingEvent } from "@/lib/api";

const CATEGORY_OPTIONS = [
  { label: "Water Baptism", value: "BAPTISM" },
  { label: "Workers in Training", value: "WORKERS_IN_TRAINING" },
  { label: "School of Disciples", value: "SCHOOL_OF_DISCIPLES" },
  { label: "School of Ministry", value: "SCHOOL_OF_MINISTRY" },
];

export default function EditCourseClient() {
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
    name: "",
    trainingCategory: "",
    teacher: "",
    date: "",
    location: "",
    set: "",
    isExam: false,
  });
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getTrainingEvent(id)
      .then((e) => {
        setFormData({
          name: e.name ?? "",
          trainingCategory: e.trainingCategory ?? "",
          teacher: e.teacher ?? "",
          date: e.date ? e.date.slice(0, 10) : "",
          location: e.location ?? "",
          set: e.set ?? "",
          isExam: e.isExam ?? false,
        });
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load course."));
  }, [id]);

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
    if (!formData.trainingCategory || !formData.date) {
      setError("Please fill in Category and Date.");
      return;
    }
    setSubmitting(true);
    try {
      await updateTrainingEvent(id, {
        name: formData.name.trim() || formData.trainingCategory,
        trainingCategory: formData.trainingCategory,
        teacher: formData.teacher.trim() || undefined,
        date: formData.date,
        location: formData.location.trim() || undefined,
        set: formData.set.trim() || undefined,
        isExam: formData.isExam,
      });
      router.push(`/trainings/courses/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update course.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-400 dark:text-slate-500">{loadError}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="Trainings" subtitle="Edit Course" backHref={`/trainings/courses/${id}`} />

      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <SelectField
            label="Category"
            name="trainingCategory"
            value={formData.trainingCategory}
            onChange={handleChange}
            options={CATEGORY_OPTIONS}
            required
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <FormField label="Course Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Water Baptism Class" />
            <FormField label="Instructor / Teacher" name="teacher" value={formData.teacher} onChange={handleChange} />
            <FormField label="Date" type="date" name="date" value={formData.date} onChange={handleChange} required />
            <FormField label="Venue / Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Main Hall" />
            <FormField label="Set" name="set" value={formData.set} onChange={handleChange} placeholder="e.g. 2026A" />
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
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push(`/trainings/courses/${id}`)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
