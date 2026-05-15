"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import {
  getGroup,
  getGroupMembers,
  deleteGroupsBulk,
  type GroupResponse,
  type GroupMemberResponse,
} from "@/lib/api";

const MEMBERS_PER_PAGE = 10;

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
      // Prefer ?id= query (used by client-side nav under output: export)
      const qsId = new URLSearchParams(window.location.search).get("id");
      if (qsId && qsId !== id) {
        setId(qsId);
        return;
      }
      // Fall back to last URL path segment (Netlify rewrites real UUIDs in prod)
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 1] ?? "";
      if (urlId && !urlId.startsWith("grp-") && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [group,   setGroup]   = useState<GroupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [members, setMembers] = useState<GroupMemberResponse[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");
  const [membersPage, setMembersPage] = useState(1);
  const [membersTotalPages, setMembersTotalPages] = useState(1);
  const [membersTotal, setMembersTotal] = useState(0);

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

  const fetchMembers = useCallback(async (page: number) => {
    if (!id || id.startsWith("grp-")) return;
    setMembersLoading(true);
    setMembersError("");
    try {
      const res = await getGroupMembers(id, page - 1, MEMBERS_PER_PAGE);
      setMembers(res.content ?? []);
      setMembersTotalPages(res.totalPages || 1);
      setMembersTotal(res.totalElements || 0);
    } catch (err) {
      setMembersError(err instanceof Error ? err.message : "Failed to load members.");
    } finally {
      setMembersLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchGroup(); }, [fetchGroup]);
  useEffect(() => { fetchMembers(membersPage); }, [fetchMembers, membersPage]);

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

  const memberLocation = (m: GroupMemberResponse): string =>
    [m.city, m.state, m.country].filter(Boolean).join(", ") || "—";

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        subtitle={group?.name ?? "Group"}
        backHref="/settings/groups"
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error} — <button type="button" className="font-medium underline" onClick={fetchGroup}>Retry</button>
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
                <p className="mt-1 text-sm font-medium text-[#111827]">
                  {membersTotal || group.totalMembers || 0}
                </p>
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

          {/* ── Members section ── */}
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#111827]">Members</h3>
            <p className="text-sm text-[#6B7280]">
              {membersTotal} {membersTotal === 1 ? "member" : "members"}
            </p>
          </div>

          {membersError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {membersError} —{" "}
              <button type="button" className="font-medium underline" onClick={() => fetchMembers(membersPage)}>
                Retry
              </button>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F3F4F6]">
                  <th className="px-4 py-4 text-sm font-bold text-[#000080]">Name</th>
                  <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Email</th>
                  <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Phone</th>
                  <th className="hidden lg:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Sex</th>
                  <th className="hidden lg:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Location</th>
                </tr>
              </thead>
              <tbody>
                {membersLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      Loading members…
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      No members in this group yet.
                    </td>
                  </tr>
                ) : (
                  members.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                      style={{ height: "56px" }}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-[#374151]">
                        <div className="flex items-center gap-3">
                          {m.profilePictureUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.profilePictureUrl}
                              alt={fullName(m)}
                              className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-xs font-bold text-[#000080]">
                              {[m.firstName?.[0], m.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?"}
                            </div>
                          )}
                          <span>{fullName(m)}</span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                        {m.email || "—"}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151]">
                        {m.phoneNumber ? `${m.countryCode ?? ""}${m.phoneNumber}` : "—"}
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-sm capitalize text-[#374151]">
                        {m.sex?.toLowerCase() || "—"}
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 text-sm text-[#374151]">
                        {memberLocation(m)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={membersPage}
              totalPages={membersTotalPages}
              totalItems={membersTotal}
              onPageChange={setMembersPage}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => router.push("/settings/groups")}>Back</Button>
            <Button variant="primary" onClick={() => router.push(`/settings/groups/grp-1/edit/?id=${encodeURIComponent(id)}`)}>Edit</Button>
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
