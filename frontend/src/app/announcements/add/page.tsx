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
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Title"
            name="title"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Enter announcement title"
            required
          />

          <TextAreaField
            label="Details"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter announcement details"
            rows={6}
            required
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <FormField
              label="Start Date"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
            <FormField
              label="End Date"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
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
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Announcement"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
