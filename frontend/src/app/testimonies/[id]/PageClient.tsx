"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { testimonies } from "@/lib/mock-data";

const categoryBadgeColors: Record<string, string> = {
  Healing: "bg-[#16A34A] text-white",
  Financial: "bg-[#CA8A04] text-white",
  Marriage: "bg-[#7C3AED] text-white",
  Salvation: "bg-[#000080] text-white",
  Other: "bg-[#6B7280] text-white",
};

const statusBadgeColors: Record<string, string> = {
  Pending: "bg-[#FEF9C3] text-[#CA8A04]",
  Published: "bg-[#DCFCE7] text-[#16A34A]",
};

export default function TestimonyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [showDelete, setShowDelete] = useState(false);

  const testimony =
    testimonies.find((t) => t.id === params.id) || testimonies[0];

  const handleDelete = () => {
    console.log("Delete testimony:", testimony.id);
    setShowDelete(false);
    router.push("/testimonies");
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Testimonies"
        subtitle="Testimony Details"
        backHref="/testimonies"
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          {testimony.photo && (
            <img
              src={testimony.photo}
              alt={testimony.name}
              className="h-[200px] w-[200px] shrink-0 rounded-xl object-cover"
            />
          )}

          <div className="flex-1">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#111827]">{testimony.name}</h2>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  categoryBadgeColors[testimony.category] || "bg-gray-200 text-gray-700"
                }`}
              >
                {testimony.category}
              </span>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  statusBadgeColors[testimony.status] || "bg-gray-200 text-gray-700"
                }`}
              >
                {testimony.status}
              </span>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-[#6B7280]">Date</p>
                <p className="mt-1 text-sm text-[#111827]">{testimony.date}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7280]">Shared By</p>
                <p className="mt-1 text-sm text-[#111827]">{testimony.sharedBy}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[#6B7280]">Testimony</p>
              <p className="mt-1 text-sm leading-relaxed text-[#374151]">
                {testimony.content}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/testimonies")}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => router.push(`/testimonies/${testimony.id}/edit`)}
        >
          Edit
        </Button>
        <Button variant="danger" onClick={() => setShowDelete(true)}>
          Delete
        </Button>
      </div>

      <DeleteConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this testimony?"
      />
    </DashboardLayout>
  );
}
