"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { getGroup, deleteGroupsBulk, type GroupResponse } from "@/lib/api";

function fullName(u?: { firstName?: string; middleName?: string; lastName?: string } | null) {
  if (!u) return "—";
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

export default function GroupDetailClient() {
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

  const [group,   setGroup]   = useState<GroupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchGroup = useCallback(async () => {
    if (!id || id.startsWith("grp-")) return;
    setLoading(true);
    setError("");
    try {
      const data = await getGroup(id);
      setGroup(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load group.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchGroup(); }, [fetchGroup]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteGroupsBulk([id]);
      setShowDeleteModal(false);
      router.push("/settings/groups");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete group.");
      setShowDeleteModal(false);
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        subtitle={group?.name ?? "Group"}
        backHref="/settings/groups"
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error} — <button className="font-medium underline" onClick={fetchGroup}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center text-gray-400">Loading…</div>
      ) : group ? (
        <>
          <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
            <h2 className="text-xl font-bold text-[#111827]">{group.name}</h2>
            {group.description && (
              <p className="mt-1 text-sm text-[#6B7280]">{group.description}</p>
            )}

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs font-medium text-[#6B7280]">Group Head</p>
                <p className="mt-1 text-sm font-medium text-[#111827]">{fullName(group.groupHead)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7280]">Total Members</p>
                <p className="mt-1 text-sm font-medium text-[#111827]">{group.totalMembers ?? "—"}</p>
              </div>
              {group.whatsAppLink && (
                <div>
                  <p className="text-xs font-medium text-[#6B7280]">WhatsApp Group</p>
                  <a href={group.whatsAppLink} target="_blank" rel="noopener noreferrer"
                    className="mt-1 block truncate text-sm font-medium text-[#000080] underline hover:text-[#000066]">
                    Join Group
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => router.push("/settings/groups")}>Back</Button>
            <Button variant="primary" onClick={() => router.push(`/settings/groups/${id}/edit`)}>Edit</Button>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)} disabled={deleting}>Delete</Button>
          </div>
        </>
      ) : null}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this group?"
      />
    </DashboardLayout>
  );
}
