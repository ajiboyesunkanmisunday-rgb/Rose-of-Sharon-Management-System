"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { allAnnouncements } from "@/lib/mock-data";
import { AnnouncementStatus } from "@/lib/types";

const statusColors: Record<AnnouncementStatus, string> = {
  Published: "bg-green-100 text-green-800",
  Scheduled: "bg-blue-100 text-blue-800",
  Draft: "bg-gray-100 text-gray-700",
};

export default function AnnouncementDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const announcement =
    allAnnouncements.find((a) => a.id === id) || allAnnouncements[0];

  const handleDelete = () => {
    console.log("Delete announcement:", announcement.id);
    setShowDeleteModal(false);
    router.push("/communication/announcements");
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Communication"
        subtitle="Announcement Details"
        backHref="/communication/announcements"
      />

      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[#111827]">
              {announcement.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  statusColors[announcement.status]
                }`}
              >
                {announcement.status}
              </span>
              <span>Audience: <strong className="text-[#374151]">{announcement.audience}</strong></span>
              <span>·</span>
              <span>Scheduled: <strong className="text-[#374151]">{announcement.scheduledDate}</strong></span>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-[#F3F4F6] pt-6">
          <h3 className="mb-2 text-sm font-semibold text-[#6B7280]">Message</h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">
            {announcement.body}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#F3F4F6] pt-4 text-xs text-[#6B7280]">
          <span>Created by: <strong>{announcement.createdBy}</strong></span>
          <span>{announcement.createdDate}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          variant="secondary"
          onClick={() =>
            router.push(`/communication/announcements/${announcement.id}/edit`)
          }
        >
          Edit
        </Button>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Delete
        </Button>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this announcement?"
      />
    </DashboardLayout>
  );
}
