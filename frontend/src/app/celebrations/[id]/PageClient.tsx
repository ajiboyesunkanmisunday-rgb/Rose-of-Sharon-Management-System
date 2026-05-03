"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { getCelebration, markCelebrationsAsTreated, type CelebrationResponse } from "@/lib/api";

const statusColors: Record<string, string> = {
  Scheduled: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Treated: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  TREATED: "bg-green-100 text-green-800",
};

function fullName(u?: { firstName?: string; middleName?: string; lastName?: string }): string {
  if (!u) return "—";
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

export default function CelebrationDetailClient() {
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

  const [celebration, setCelebration] = useState<CelebrationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [treating, setTreating] = useState(false);

  const loadCelebration = useCallback(async () => {
    if (!id || id.startsWith("cel-")) return;
    setLoading(true);
    setError("");
    try {
      const data = await getCelebration(id);
      setCelebration(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load celebration.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadCelebration(); }, [loadCelebration]);

  const handleDelete = async () => {
    setTreating(true);
    try {
      await markCelebrationsAsTreated([id]);
    } catch {
      // ignore — still navigate away
    } finally {
      setTreating(false);
      setShowDeleteModal(false);
      router.push("/celebrations");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageHeader title="Celebrations" subtitle="Loading…" backHref="/celebrations" />
        <div className="py-12 text-center text-sm text-gray-400">Loading celebration details…</div>
      </DashboardLayout>
    );
  }

  if (error || !celebration) {
    return (
      <DashboardLayout>
        <PageHeader title="Celebrations" subtitle="Error" backHref="/celebrations" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Celebration not found."}
          <button className="ml-2 font-medium underline" onClick={loadCelebration}>Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  const name = fullName(celebration.requester);
  const status = celebration.celebrationStatus ?? "";
  const type = celebration.celebrationType ?? "";
  const date = celebration.date
    ? new Date(celebration.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  return (
    <DashboardLayout>
      <PageHeader title="Celebrations" subtitle={name} backHref="/celebrations" />

      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#B5B5F3]/30 px-3 py-1 text-xs font-medium text-[#000080]">
            {type}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[status] ?? "bg-gray-100 text-gray-600"}`}>
            {status}
          </span>
        </div>
        <h2 className="mt-3 text-xl font-bold text-[#111827]">{name}</h2>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Date</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{date}</p>
          </div>
          {celebration.createdOn && (
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Created</p>
              <p className="mt-1 text-sm font-medium text-[#111827]">
                {new Date(celebration.createdOn).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
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
        <Button variant="danger" onClick={() => setShowDeleteModal(true)} disabled={treating}>
          Mark as Treated
        </Button>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to mark this celebration as treated?"
      />
    </DashboardLayout>
  );
}
