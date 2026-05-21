"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { getMediaItem, deleteMediaBulk, type MediaResponse } from "@/lib/api";

const typeColors: Record<string, string> = {
  SERMON:    "bg-[#000080] text-white",
  PODCAST:   "bg-[#7C3AED] text-white",
  VIDEOS:    "bg-[#16A34A] text-white",
  IMAGES:    "bg-[#F59E0B] text-white",
  THUMBNAIL: "bg-[#6B7280] text-white",
  // legacy lowercase variants
  Sermon: "bg-[#000080] text-white",
  Podcast: "bg-[#7C3AED] text-white",
  Video: "bg-[#16A34A] text-white",
  Picture: "bg-[#F59E0B] text-white",
};

export default function MediaDetailClient() {
  const router = useRouter();
  const params = useParams();
  const paramId = params.id as string;
  const [id, setId] = useState(paramId);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 1] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [item, setItem] = useState<MediaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadItem = useCallback(async () => {
    if (!id || id.startsWith("med-")) return;
    setLoading(true);
    setError("");
    try {
      const data = await getMediaItem(id);
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media item.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadItem(); }, [loadItem]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMediaBulk([id]);
    } catch {
      // ignore — still navigate away
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      router.push("/media");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageHeader title="Media" subtitle="Loading…" backHref="/media" />
        <div className="py-12 text-center text-sm text-gray-400 dark:text-slate-500">Loading media details…</div>
      </DashboardLayout>
    );
  }

  if (error || !item) {
    return (
      <DashboardLayout>
        <PageHeader title="Media" subtitle="Error" backHref="/media" />
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error || "Media item not found."}
          <button className="ml-2 font-medium underline" onClick={loadItem}>Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  // Backend sends mediaCategory/type (not category); displayUrl (not url); size (not fileSize)
  const category = item.mediaCategory ?? item.type ?? item.category ?? "";
  const mediaUrl = item.displayUrl ?? item.url ?? "";
  const mediaSize = item.size ?? item.fileSize;
  const isPicture = category.toUpperCase().includes("IMAGE") || category.toUpperCase() === "THUMBNAIL";
  const isPodcast = category.toUpperCase().includes("PODCAST") || category.toUpperCase().includes("AUDIO");

  // Extract YouTube / external link from description (stored as "[External Link]: <url>")
  const externalLinkMatch = item.description?.match(/\[External Link\]:\s*(https?:\/\/\S+)/);
  const externalUrl = externalLinkMatch?.[1] ?? null;

  // Convert YouTube watch URL → embed URL
  const getYouTubeEmbedUrl = (url: string): string | null => {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}?rel=0` : null;
  };
  const youtubeEmbedUrl = externalUrl ? getYouTubeEmbedUrl(externalUrl) : null;

  // Description to display — strip the [External Link] prefix so it doesn't show raw in the UI
  const cleanDescription = item.description?.replace(/\[External Link\]:\s*https?:\/\/\S+\n?/g, "").trim() || null;

  return (
    <DashboardLayout>
      <PageHeader
        title="Media"
        subtitle={item.title ?? "Media Item"}
        backHref="/media"
      />

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="flex aspect-video items-center justify-center overflow-hidden bg-[#F3F4F6] dark:bg-slate-700/30">
              {isPicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaUrl || "/rccg-logo.png"}
                  alt={item.title ?? "Media"}
                  className="h-full w-full object-contain"
                />
              ) : isPodcast ? (
                <audio controls className="w-full max-w-md">
                  <source src={mediaUrl} />
                  Your browser does not support the audio tag.
                </audio>
              ) : youtubeEmbedUrl ? (
                <iframe
                  src={youtubeEmbedUrl}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={item.title ?? "Video"}
                />
              ) : externalUrl ? (
                // Non-YouTube external link — show a clickable button
                <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
                  </svg>
                  <p className="text-sm text-[#6B7280] dark:text-slate-400">This media is hosted externally.</p>
                  <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-[#000080] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#000066]"
                  >
                    Open External Link ↗
                  </a>
                </div>
              ) : mediaUrl ? (
                <video controls className="h-full w-full">
                  <source src={mediaUrl} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center p-8">
                  <p className="text-sm text-[#6B7280] dark:text-slate-400">Preview not available.</p>
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3">
                {category && (
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${typeColors[category] ?? "bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300"}`}>
                    {category}
                  </span>
                )}
                {mediaSize != null && (
                  <span className="text-xs text-[#6B7280] dark:text-slate-400">
                    Size: {(mediaSize / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-xl font-bold text-[#111827] dark:text-slate-100">{item.title}</h2>
              {item.createdOn && (
                <p className="mt-1 text-sm text-[#6B7280] dark:text-slate-400">
                  {new Date(item.createdOn).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              )}
              {cleanDescription && (
                <p className="mt-4 text-sm text-[#374151] dark:text-slate-300">{cleanDescription}</p>
              )}
              {externalUrl && (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#000080] dark:text-indigo-400 hover:underline"
                >
                  Open external link ↗
                </a>
              )}
            </div>
          </div>
        </div>

        <aside>
          <h3 className="mb-3 text-sm font-semibold text-[#111827] dark:text-slate-100">
            Details
          </h3>
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
            {category && (
              <div>
                <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">Media Type</p>
                <p className="mt-1 text-sm text-[#111827] dark:text-slate-100">{category}</p>
              </div>
            )}
            {mediaSize != null && (
              <div>
                <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">File Size</p>
                <p className="mt-1 text-sm text-[#111827] dark:text-slate-100">{(mediaSize / 1_048_576).toFixed(2)} MB</p>
              </div>
            )}
            {item.createdOn && (
              <div>
                <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">Uploaded</p>
                <p className="mt-1 text-sm text-[#111827] dark:text-slate-100">
                  {new Date(item.createdOn).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/media")}>
          Back
        </Button>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)} disabled={deleting}>
          {deleting ? "Deleting…" : "Delete"}
        </Button>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this media item?"
      />
    </DashboardLayout>
  );
}
