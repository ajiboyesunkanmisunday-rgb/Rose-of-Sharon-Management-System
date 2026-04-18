"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";

const TYPE_OPTIONS = [
  { label: "Sermon", value: "Sermon" },
  { label: "Podcast", value: "Podcast" },
  { label: "Video", value: "Video" },
];

export default function UploadMediaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    speaker: "",
    date: "",
    duration: "",
    description: "",
    tags: "",
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Upload media:", {
      ...formData,
      mediaFile: mediaFile?.name,
      thumbnail: thumbnail?.name,
    });
    router.push("/media");
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Media"
        subtitle="Upload Media"
        backHref="/media"
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Sermon/podcast/video title"
            required
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <SelectField
              label="Media Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={TYPE_OPTIONS}
              required
            />
            <FormField
              label="Speaker"
              name="speaker"
              value={formData.speaker}
              onChange={handleChange}
              placeholder="Speaker or host name"
              required
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
              label="Duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g. 45 min"
              required
            />
          </div>

          <TextAreaField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of the media content"
            rows={4}
          />

          <FormField
            label="Tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Comma-separated tags (e.g. faith, prayer, healing)"
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">Media File</label>
            <input
              type="file"
              accept="audio/*,video/*"
              onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
              className="block w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] file:mr-3 file:rounded-lg file:border-0 file:bg-[#000080] file:px-3 file:py-1 file:text-xs file:font-medium file:text-white"
            />
            {mediaFile && (
              <p className="mt-1 text-xs text-[#6B7280]">Selected: {mediaFile.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">Thumbnail Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
              className="block w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] file:mr-3 file:rounded-lg file:border-0 file:bg-[#000080] file:px-3 file:py-1 file:text-xs file:font-medium file:text-white"
            />
            {thumbnail && (
              <p className="mt-1 text-xs text-[#6B7280]">Selected: {thumbnail.name}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/media")}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Upload Media
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
