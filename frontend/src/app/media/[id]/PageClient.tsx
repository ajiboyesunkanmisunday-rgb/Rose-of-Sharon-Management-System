"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { mediaItems } from "@/lib/mock-data";
import { MediaType } from "@/lib/types";

const typeColors: Record<MediaType, string> = {
  Sermon: "bg-[#000080] text-white",
  Podcast: "bg-[#7C3AED] text-white",
  Video: "bg-[#16A34A] text-white",
};

export default function MediaDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const item = mediaItems.find((m) => m.id === id) || mediaItems[0];
  const related = mediaItems
    .filter((m) => m.id !== item.id && m.type === item.type)
    .slice(0, 3);

  const handleDelete = () => {
    console.log("Delete media:", item.id);
    setShowDeleteModal(false);
    router.push("/media");
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Media"
        subtitle={item.title}
        backHref="/media"
      />

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            <div className="flex aspect-video items-center justify-center bg-[#F3F4F6]">
              {item.type === "Podcast" ? (
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
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${typeColors[item.type]}`}>
                  {item.type}
                </span>
                <span className="text-xs text-[#6B7280]">Duration: {item.duration}</span>
              </div>
              <h2 className="mt-3 text-xl font-bold text-[#111827]">{item.title}</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                {item.speaker} · {item.date}
              </p>
              <p className="mt-4 text-sm text-[#374151]">{item.description}</p>
              {item.tags && item.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs text-[#6B7280]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <aside>
          <h3 className="mb-3 text-sm font-semibold text-[#111827]">
            Related {item.type}s
          </h3>
          {related.length === 0 ? (
            <p className="rounded-xl border border-[#E5E7EB] bg-white p-6 text-sm text-[#6B7280]">
              No related items.
            </p>
          ) : (
            <div className="space-y-3">
              {related.map((r) => (
                <button
                  key={r.id}
                  onClick={() => router.push(`/media/${r.id}`)}
                  className="block w-full rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition-colors hover:border-[#000080]"
                >
                  <p className="text-sm font-semibold text-[#111827]">{r.title}</p>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    {r.speaker} · {r.duration}
                  </p>
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/media")}>
          Back
        </Button>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Delete
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
