"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { uploadMedia, uploadLargeMedia } from "@/lib/api";
import { Link2, Upload } from "lucide-react";

const CATEGORY_OPTIONS = [
  { label: "Sermon",    value: "SERMON"    },
  { label: "Podcast",   value: "PODCAST"   },
  { label: "Videos",    value: "VIDEOS"    },
  { label: "Images",    value: "IMAGES"    },
  { label: "Thumbnail", value: "THUMBNAIL" },
];

const MEDIA_MAX_BYTES = 200 * 1024 * 1024; // 200 MB
const DESC_MAX_CHARS  = 1000;

/** Categories that send to /api/v1/media/large (higher server-side size limit). */
const LARGE_MEDIA_CATEGORIES = new Set(["PODCAST", "SERMON", "VIDEOS"]);

/**
 * Returns the HTML accept attribute value for the file input based on
 * the selected media category. Enforces correct file types per module:
 *  - Sermon  → video only
 *  - Videos  → video only
 *  - Images  → image only
 *  - Thumbnail → image only
 *  - Podcast → audio and video
 */
function acceptForCategory(cat: string): string {
  switch (cat) {
    case "SERMON":    return "video/*";
    case "VIDEOS":    return "video/*";
    case "IMAGES":    return "image/*";
    case "THUMBNAIL": return "image/*";
    case "PODCAST":   return "audio/*,video/*";
    default:          return "audio/*,video/*,image/*";
  }
}

/**
 * Human-readable description of the allowed file types shown in validation errors.
 */
function acceptLabelForCategory(cat: string): string {
  switch (cat) {
    case "SERMON":    return "video files";
    case "VIDEOS":    return "video files";
    case "IMAGES":    return "image files";
    case "THUMBNAIL": return "image files";
    case "PODCAST":   return "audio or video files";
    default:          return "media files";
  }
}

/**
 * Returns true if the given file matches the allowed types for the category.
 */
function fileMatchesCategory(file: File, cat: string): boolean {
  const type = file.type.toLowerCase();
  switch (cat) {
    case "SERMON":
    case "VIDEOS":    return type.startsWith("video/");
    case "IMAGES":
    case "THUMBNAIL": return type.startsWith("image/");
    case "PODCAST":   return type.startsWith("audio/") || type.startsWith("video/");
    default:          return true;
  }
}

const inputClass =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none placeholder:text-[#9CA3AF] dark:text-slate-400 focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
const selectClass =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080] appearance-none";
const labelClass = "mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300";

export default function UploadMediaPage() {
  const router = useRouter();

  const [title,        setTitle]        = useState("");
  const [category,     setCategory]     = useState("");
  const [description,  setDescription]  = useState("");
  const [speaker,      setSpeaker]      = useState("");
  const [date,         setDate]         = useState("");
  const [tagsInput,    setTagsInput]    = useState(""); // comma-separated
  const [mediaFile,    setMediaFile]     = useState<File | null>(null);
  const [thumbnail,    setThumbnail]    = useState<File | null>(null);
  const [useYoutube,   setUseYoutube]   = useState(false);
  const [youtubeLink,  setYoutubeLink]  = useState("");
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (f: string) => setTouched((t) => ({ ...t, [f]: true }));

  const fieldErrors = {
    title: !title.trim() ? "Title is required" : "",
  };

  // Ref used to programmatically reset the file input when switching to YouTube
  // mode — without this the browser keeps showing the old filename even though
  // mediaFile state has been cleared, causing the submit button to stay disabled.
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearFileInput = () => {
    setMediaFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearThumbnailInput = () => {
    setThumbnail(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setError("");
    clearFileInput();
    clearThumbnailInput();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file type matches selected category
      if (category && !fileMatchesCategory(file, category)) {
        setError(
          `"${file.name}" is not allowed for this media type. ` +
          `Please select ${acceptLabelForCategory(category)} only.`,
        );
        e.target.value = "";
        setMediaFile(null);
        return;
      }
      // Validate file size
      if (file.size > MEDIA_MAX_BYTES) {
        setError(
          `"${file.name}" is ${(file.size / 1_048_576).toFixed(1)} MB — the maximum allowed size is 200 MB. ` +
          `Please compress the file or use a YouTube/external link instead.`,
        );
        e.target.value = "";
        setMediaFile(null);
        return;
      }
    }
    setError("");
    setMediaFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category) return;

    if (!useYoutube && !mediaFile) {
      setError("Please select a file to upload.");
      return;
    }
    if (useYoutube && !youtubeLink.trim()) {
      setError("Please enter a YouTube or external link.");
      return;
    }
    if (description.length > DESC_MAX_CHARS) {
      setError(`Description must be ${DESC_MAX_CHARS} characters or fewer.`);
      return;
    }

    // When using an external link with no file, create a tiny placeholder blob
    const fileToUpload = mediaFile ?? new File(
      [`[External Link]: ${youtubeLink.trim()}`],
      "external_link.txt",
      { type: "text/plain" },
    );

    // Build final description — prepend YouTube link if provided
    let finalDescription = description.trim() || "";
    if (useYoutube && youtubeLink.trim()) {
      const prefix = `[External Link]: ${youtubeLink.trim()}`;
      finalDescription = finalDescription ? `${prefix}\n\n${finalDescription}` : prefix;
    }

    setSaving(true);
    setError("");
    try {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      const commonFields = {
        title:       title.trim(),
        description: finalDescription || undefined,
        category,
        file:        fileToUpload,
        speaker:     speaker.trim() || undefined,
        date:        date || undefined,
        tags:        tags.length > 0 ? tags : undefined,
      };

      if (LARGE_MEDIA_CATEGORIES.has(category)) {
        // Route large-media types (PODCAST, SERMON, VIDEOS) to the /large endpoint
        // which has a higher server-side size limit
        await uploadLargeMedia({
          ...commonFields,
          thumbnail: thumbnail ?? undefined,
        });
      } else {
        await uploadMedia(commonFields);
      }
      router.push("/media");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      if (
        msg === "FILE_TOO_LARGE_FOR_SERVER" ||
        msg.includes("413") ||
        msg.toLowerCase().includes("too large") ||
        msg.toLowerCase().includes("payload")
      ) {
        const fileMB = mediaFile ? (mediaFile.size / 1_048_576).toFixed(1) : null;
        setError(
          `The server rejected the file${fileMB ? ` (${fileMB} MB)` : ""} — it exceeds the upload size limit. ` +
          `Please compress the file, or use the YouTube / External Link option instead.`,
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
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Title */}
          <div>
            <label className={labelClass}>Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => touch("title")}
              placeholder="Sermon / podcast / video title"
              className={`${inputClass} ${touched.title && fieldErrors.title ? "border-red-400" : ""}`}
              required
            />
            {touched.title && fieldErrors.title && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.title}</p>
            )}
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Media Type <span className="text-red-500">*</span></label>
              <select
                value={category}
                onChange={(e) => { handleCategoryChange(e.target.value); }}
                className={selectClass}
                required
              >
                <option value="">Select type</option>
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Date — shown for all categories */}
            <div>
              <label className={labelClass}>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Speaker — shown for Sermon / Podcast */}
          {(category === "SERMON" || category === "PODCAST") && (
            <div>
              <label className={labelClass}>Speaker / Host</label>
              <input
                type="text"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                placeholder="e.g. Pastor John Adeyemi"
                className={inputClass}
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className={labelClass}>
              Tags
              <span className="ml-1 text-xs font-normal text-[#6B7280] dark:text-slate-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. faith, healing, prayer"
              className={inputClass}
            />
          </div>

          {/* Description with character counter */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-[#374151] dark:text-slate-300">Description</label>
              <span className={`text-xs ${description.length > DESC_MAX_CHARS ? "text-red-500 font-semibold" : "text-[#9CA3AF] dark:text-slate-400"}`}>
                {description.length}/{DESC_MAX_CHARS}
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the media content"
              rows={3}
              maxLength={DESC_MAX_CHARS}
              className={`${inputClass} ${description.length >= DESC_MAX_CHARS ? "border-red-300 focus:border-red-400 focus:ring-red-400" : ""}`}
            />
          </div>

          {/* Upload method toggle */}
          <div>
            <label className={labelClass}>Upload Method <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setUseYoutube(false); setError(""); }}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  !useYoutube
                    ? "border-[#000080] bg-[#000080] text-white"
                    : "border-[#E5E7EB] dark:border-slate-700 text-[#374151] dark:text-slate-300 hover:border-[#000080] hover:text-[#000080] dark:text-indigo-400"
                }`}
              >
                <Upload className="h-4 w-4" />
                Upload File
              </button>
              <button
                type="button"
                onClick={() => { setUseYoutube(true); clearFileInput(); setError(""); }}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  useYoutube
                    ? "border-[#000080] bg-[#000080] text-white"
                    : "border-[#E5E7EB] dark:border-slate-700 text-[#374151] dark:text-slate-300 hover:border-[#000080] hover:text-[#000080] dark:text-indigo-400"
                }`}
              >
                <Link2 className="h-4 w-4" />
                YouTube / External Link
              </button>
            </div>
          </div>

          {/* File upload */}
          {!useYoutube && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>
                  Upload File <span className="text-red-500">*</span>
                  <span className="ml-1 text-xs font-normal text-[#6B7280] dark:text-slate-400">
                    (max 200 MB{category ? ` · ${acceptLabelForCategory(category)} only` : ""})
                  </span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={category ? acceptForCategory(category) : "audio/*,video/*,image/*"}
                  onChange={handleFileChange}
                  required={!useYoutube}
                  className="block w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2 text-sm text-[#374151] dark:text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-[#000080] file:px-3 file:py-1 file:text-xs file:font-medium file:text-white"
                />
                {mediaFile && (
                  <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">
                    Selected: {mediaFile.name} ({(mediaFile.size / 1_048_576).toFixed(1)} MB)
                  </p>
                )}
                <p className="mt-1.5 text-xs text-[#6B7280] dark:text-slate-400">
                  Tip: For sermons or recordings available on YouTube, use the{" "}
                  <button
                    type="button"
                    onClick={() => { setUseYoutube(true); clearFileInput(); }}
                    className="font-medium text-[#000080] dark:text-indigo-400 underline"
                  >
                    YouTube / External Link
                  </button>{" "}
                  option instead of uploading a large file.
                </p>
              </div>

              {/* Thumbnail — optional for VIDEOS & PODCAST */}
              {(category === "VIDEOS" || category === "PODCAST") && (
                <div>
                  <label className={labelClass}>
                    Thumbnail Image
                    <span className="ml-1 text-xs font-normal text-[#6B7280] dark:text-slate-400">(optional · image only)</span>
                  </label>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setThumbnail(f);
                    }}
                    className="block w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2 text-sm text-[#374151] dark:text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-[#6B7280] file:px-3 file:py-1 file:text-xs file:font-medium file:text-white"
                  />
                  {thumbnail && (
                    <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">
                      Thumbnail: {thumbnail.name} ({(thumbnail.size / 1_048_576).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* YouTube / external link */}
          {useYoutube && (
            <div>
              <label className={labelClass}>
                YouTube / External Link <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={youtubeLink}
                onChange={(e) => { setYoutubeLink(e.target.value); setError(""); }}
                placeholder="https://www.youtube.com/watch?v=..."
                className={inputClass}
                required={useYoutube}
              />
              <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">
                Paste the full link to the YouTube video or any other online resource.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => router.push("/media")}>Cancel</Button>
            <Button
              variant="primary"
              type="submit"
              disabled={saving || !title.trim() || !category || (!useYoutube && !mediaFile) || (useYoutube && !youtubeLink.trim()) || description.length > DESC_MAX_CHARS}
            >
              {saving ? "Uploading…" : "Upload Media"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
