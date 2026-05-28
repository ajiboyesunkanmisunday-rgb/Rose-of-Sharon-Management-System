"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, TextAreaField } from "@/components/ui/FormField";
import { createAnnouncement, getStoredUser } from "@/lib/api";

export default function AddAnnouncementPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (f: string) => setTouched((t) => ({ ...t, [f]: true }));

  const MAX_CONTENT = 1000;
  const MAX_SUBJECT = 150;
  const contentNear = formData.content.length >= Math.floor(MAX_CONTENT * 0.85);
  const subjectNear = formData.subject.length >= Math.floor(MAX_SUBJECT * 0.85);

  const fieldErrors = {
    subject: !formData.subject.trim() ? "Title is required" : "",
    content: !formData.content.trim() ? "Details are required" : "",
    startDate: !formData.startDate ? "Start date is required" : "",
    endDate: !formData.endDate ? "End date is required" : "",
  };

  const isFormValid = !!formData.subject.trim() && !!formData.content.trim() && !!formData.startDate && !!formData.endDate;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const currentUser = getStoredUser();
      await createAnnouncement({
        ...formData,
        submittedBy: currentUser?.id || "",
      });
      router.push("/announcements");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Announcements"
        subtitle="Create Announcement"
        backHref="/announcements"
      />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Title"
            name="subject"
            value={formData.subject}
            onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value.slice(0, MAX_SUBJECT) }))}
            onBlur={() => touch("subject")}
            placeholder="Enter announcement title"
            required
            error={touched.subject ? fieldErrors.subject : undefined}
            showCount
            maxLength={MAX_SUBJECT}
          />

          <TextAreaField
            label="Details"
            name="content"
            value={formData.content}
            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value.slice(0, MAX_CONTENT) }))}
            onBlur={() => touch("content")}
            placeholder="Enter announcement details"
            rows={6}
            required
            error={touched.content ? fieldErrors.content : undefined}
            showCount
            maxLength={MAX_CONTENT}
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <FormField
              label="Start Date"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              onBlur={() => touch("startDate")}
              required
              error={touched.startDate ? fieldErrors.startDate : undefined}
            />
            <FormField
              label="End Date"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              onBlur={() => touch("endDate")}
              required
              error={touched.endDate ? fieldErrors.endDate : undefined}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/announcements")}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading || !isFormValid}>
              {loading ? "Saving..." : "Save Announcement"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
