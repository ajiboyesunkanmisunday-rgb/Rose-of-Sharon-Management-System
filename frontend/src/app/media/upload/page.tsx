"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { uploadMedia } from "@/lib/api";

const CATEGORY_OPTIONS = [
  { label: "Sermon",    value: "SERMON"    },
  { label: "Podcast",   value: "PODCAST"   },
  { label: "Videos",    value: "VIDEOS"    },
  { label: "Images",    value: "IMAGES"    },
  { label: "Thumbnail", value: "THUMBNAIL" },
];

// 10 MB — backend Spring Boot default multipart limit
const MAX_FILE_BYTES = 10 * 1024 * 1024;

const inputClass =
  "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
const selectClass =
  "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080] appearance-none";
const labelClass = "mb-1 block text-sm font-medium text-[#374151]";

export default function UploadMediaPage() {
  const router = useRouter();

  const [title,       setTitle]       = useState("");
  const [category,    setCategory]    = useState("");
  const [description, setDescription] = useState("");
  const [mediaFile,   setMediaFile]   = useState<File | null>(null);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > MAX_FILE_BYTES) {
      setError(
        `"${file.name}" is ${(file.size / 1_048_576).toFixed(1)} MB — the server only accepts files up to 10 MB. ` +
        `Please compress the file or contact the admin to increase the upload limit.`
      );
      e.target.value = "";
      setMediaFile(null);
      return;
    }
    setError("");
    setMediaFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category) return;

    if (!mediaFile) {
      setError("Please select a file to upload.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await uploadMedia({
        title:       title.trim(),
        description: description.trim() || undefined,
        category,
        file:        mediaFile,
      });
      router.push("/media");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      if (msg.includes("413") || msg.toLowerCase().includes("too large") || msg.toLowerCase().includes("payload")) {
        setError(
          "File too large for the server (max ~10 MB). Please compress the file before uploading."
        );
      } else {
        setError(msg);
      }
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Media"
        subtitle="Upload Media"
        backHref="/media"
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Title */}
          <div>
            <label className={labelClass}>Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sermon / podcast / video title"
              className={inputClass}
              required
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Media Type <span className="text-red-500">*</span></label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setError(""); }}
                className={selectClass}
                required
              >
                <option value="">Select type</option>
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the media content"
              rows={3}
              className={inputClass}
            />
          </div>

          {/* File upload */}
          <div>
            <label className={labelClass}>
              Upload File <span className="text-red-500">*</span>
              <span className="ml-1 text-xs font-normal text-[#6B7280]">(max 10 MB)</span>
            </label>
            <input
              type="file"
              accept="audio/*,video/*,image/*"
              onChange={handleFileChange}
              required
              className="block w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] file:mr-3 file:rounded-lg file:border-0 file:bg-[#000080] file:px-3 file:py-1 file:text-xs file:font-medium file:text-white"
            />
            {mediaFile && (
              <p className="mt-1 text-xs text-[#6B7280]">
                Selected: {mediaFile.name} ({(mediaFile.size / 1_048_576).toFixed(1)} MB)
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => router.push("/media")}>Cancel</Button>
            <Button
              variant="primary"
              type="submit"
              disabled={saving || !title.trim() || !category || !mediaFile}
            >
              {saving ? "Uploading…" : "Upload Media"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
