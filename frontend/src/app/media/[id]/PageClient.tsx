"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { getMediaItem, deleteMediaBulk, type MediaResponse } from "@/lib/api";

const typeColors: Record<string, string> = {
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
        <div className="py-12 text-center text-sm text-gray-400">Loading media details…</div>
      </DashboardLayout>
    );
  }

  if (error || !item) {
    return (
      <DashboardLayout>
        <PageHeader title="Media" subtitle="Error" backHref="/media" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Media item not found."}
          <button className="ml-2 font-medium underline" onClick={loadItem}>Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  const category = item.category ?? "";
  const fileType = item.fileType ?? "";
  const isPicture = fileType.toLowerCase().includes("image") || category.toLowerCase() === "picture";
  const isPodcast = fileType.toLowerCase().includes("audio") || category.toLowerCase() === "podcast";

  return (
    <DashboardLayout>
      <PageHeader
        title="Media"
        subtitle={item.title ?? "Media Item"}
        backHref="/media"
      />

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            <div className="flex aspect-video items-center justify-center overflow-hidden bg-[#F3F4F6]">
              {isPicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url || "/rccg-logo.png"}
                  alt={item.title ?? "Media"}
                  className="h-full w-full object-contain"
                />
              ) : isPodcast ? (
                <audio controls className="w-full max-w-md">
                  <source src={item.url || ""} />
                  Your browser does not support the audio tag.
                </audio>
              ) : (
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="#9CA3AF" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <p className="mt-3 text-sm text-[#6B7280]">
                    Preview not available
                  </p>
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3">
                {category && (
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${typeColors[category] ?? "bg-gray-200 text-gray-700"}`}>
                    {category}
                  </span>
                )}
                {item.fileSize != null && (
                  <span className="text-xs text-[#6B7280]">
                    Size: {(item.fileSize / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-xl font-bold text-[#111827]">{item.title}</h2>
              {item.createdOn && (
                <p className="mt-1 text-sm text-[#6B7280]">
                  {new Date(item.createdOn).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              )}
              {item.description && (
                <p className="mt-4 text-sm text-[#374151]">{item.description}</p>
              )}
            </div>
          </div>
        </div>

        <aside>
          <h3 className="mb-3 text-sm font-semibold text-[#111827]">
            Details
          </h3>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 space-y-3">
            {item.fileType && (
              <div>
                <p className="text-xs font-medium text-[#6B7280]">File Type</p>
                <p className="mt-1 text-sm text-[#111827]">{item.fileType}</p>
              </div>
            )}
            {item.fileSize != null && (
              <div>
                <p className="text-xs font-medium text-[#6B7280]">File Size</p>
                <p className="mt-1 text-sm text-[#111827]">{(item.fileSize / 1024).toFixed(1)} KB</p>
              </div>
            )}
            {item.createdOn && (
              <div>
                <p className="text-xs font-medium text-[#6B7280]">Uploaded</p>
                <p className="mt-1 text-sm text-[#111827]">
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
