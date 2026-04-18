"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { celebrations } from "@/lib/mock-data";
import { CelebrationStatus } from "@/lib/types";

const statusColors: Record<CelebrationStatus, string> = {
  Scheduled: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
};

export default function CelebrationDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const celebration = celebrations.find((c) => c.id === id) || celebrations[0];

  const handleDelete = () => {
    console.log("Delete celebration:", celebration.id);
    setShowDeleteModal(false);
    router.push("/celebrations");
  };

  return (
    <DashboardLayout>
      <PageHeader title="Celebrations" subtitle={celebration.name} backHref="/celebrations" />

      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#B5B5F3]/30 px-3 py-1 text-xs font-medium text-[#000080]">
            {celebration.type}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[celebration.status]}`}>
            {celebration.status}
          </span>
        </div>
        <h2 className="mt-3 text-xl font-bold text-[#111827]">{celebration.name}</h2>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Date</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{celebration.date}</p>
          </div>
          {celebration.years !== undefined && (
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Years</p>
              <p className="mt-1 text-sm font-medium text-[#111827]">{celebration.years}</p>
            </div>
          )}
        </div>

        {celebration.notes && (
          <div className="mt-6 border-t border-[#F3F4F6] pt-4">
            <p className="text-xs font-medium text-[#6B7280]">Notes</p>
            <p className="mt-1 text-sm text-[#374151]">{celebration.notes}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/celebrations")}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => router.push(`/celebrations/${id}/edit`)}
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
        message="Are you sure you want to delete this celebration?"
      />
    </DashboardLayout>
  );
}
