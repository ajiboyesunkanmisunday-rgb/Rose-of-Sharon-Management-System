"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import SearchBar from "@/components/ui/SearchBar";
import {
  getAllGroups,
  getGroupMembers,
  getMembers,
  getEMembers,
  updateGroupHead,
  deleteGroupsBulk,
  type GroupResponse,
  type UserBasicResponse,
} from "@/lib/api";

const MEMBERS_PER_PAGE = 10;

function fullName(
  u?: { firstName?: string; middleName?: string; lastName?: string } | null,
) {
  if (!u) return "—";
  return (
    [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—"
  );
}

function avatarBgColors(id: string) {
  const colors = [
    "bg-[#B5B5F3]",
    "bg-[#BFDBFE]",
    "bg-[#BBF7D0]",
    "bg-[#FDE68A]",
    "bg-[#FECACA]",
    "bg-[#DDD6FE]",
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return colors[Math.abs(hash) % colors.length];
}

function initials(u: { firstName?: string; lastName?: string }) {
  return (
    `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || "?"
  );
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

  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Members of this group
  const [members, setMembers] = useState<UserBasicResponse[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState("");
  const [memberPage, setMemberPage] = useState(1);
  const [memberSearch, setMemberSearch] = useState("");

  // Assign head modal — candidates are loaded from the group's own members
  const [showHeadModal, setShowHeadModal] = useState(false);
  const [allMembers, setAllMembers] = useState<UserBasicResponse[]>([]);
  const [allMembersLoading, setAllMembersLoading] = useState(false);
  const [headSearch, setHeadSearch] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignError, setAssignError] = useState("");

  // Delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // const [members, setMembers] = useState<GroupMemberResponse[]>([]);
  // const [membersLoading, setMembersLoading] = useState(false);
  // const [membersError, setMembersError] = useState("");
  // const [membersPage, setMembersPage] = useState(1);
  // const [membersTotalPages, setMembersTotalPages] = useState(1);
  // const [membersTotal, setMembersTotal] = useState(0);

  const fetchGroup = useCallback(async () => {
    if (!id || id.startsWith("grp-")) return;
    setLoading(true);
    setError("");
    try {
      const all = await getAllGroups();
      const found =
        (Array.isArray(all) ? all : []).find((g) => g.id === id) ?? null;
      setGroup(found);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load group.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMembers = useCallback(async () => {
    if (!id || id.startsWith("grp-")) return;
    setMembersLoading(true);
    setMembersError("");
    try {
      const res = await getGroupMembers(id, 0, 500);
      setMembers(res.content ?? []);
    } catch (err) {
      setMembersError(
        err instanceof Error ? err.message : "Failed to load members.",
      );
    } finally {
      setMembersLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Filter + paginate the group members locally
  const filteredMembers = memberSearch.trim()
    ? members.filter((m) => {
        const q = memberSearch.toLowerCase();
        return (
          (m.firstName ?? "").toLowerCase().includes(q) ||
          (m.lastName ?? "").toLowerCase().includes(q) ||
          (m.middleName ?? "").toLowerCase().includes(q) ||
          (m.email ?? "").toLowerCase().includes(q) ||
          (m.phoneNumber ?? "").toLowerCase().includes(q)
        );
      })
    : members;

  const totalMemberPages = Math.max(
    1,
    Math.ceil(filteredMembers.length / MEMBERS_PER_PAGE),
  );
  const safePage = Math.min(memberPage, totalMemberPages);
  const paginatedMembers = filteredMembers.slice(
    (safePage - 1) * MEMBERS_PER_PAGE,
    safePage * MEMBERS_PER_PAGE,
  );

  // Open assign head modal — load candidates from group members first,
  // then fall back / merge with all church Members + E-Members so there
  // is always a full candidate list even when the group is empty.
  const openHeadModal = async () => {
    setShowHeadModal(true);
    setHeadSearch("");
    setAssignError("");
    setAssigningId(null);
    setAllMembersLoading(true);
    try {
      const [groupRes, memRes, ememRes] = await Promise.allSettled([
        getGroupMembers(id, 0, 500),
        getMembers(0, 500),
        getEMembers(0, 500),
      ]);

      const toBasic = (u: { id: string; firstName?: string; middleName?: string; lastName?: string; email?: string; profilePictureUrl?: string; phoneNumber?: string; countryCode?: string; sex?: string; occupation?: string }): UserBasicResponse => ({
        id: u.id,
        firstName: u.firstName,
        middleName: u.middleName,
        lastName: u.lastName,
        email: u.email,
        profilePictureUrl: u.profilePictureUrl,
        phoneNumber: u.phoneNumber,
        countryCode: u.countryCode,
        sex: u.sex,
        occupation: u.occupation,
      });

      const groupItems = groupRes.status === "fulfilled" ? (groupRes.value.content ?? []) : [];
      const memItems  = memRes.status  === "fulfilled" ? (memRes.value.content  ?? []).map(toBasic) : [];
      const ememItems = ememRes.status === "fulfilled" ? (ememRes.value.content ?? []).map(toBasic) : [];

      // Merge: group members first (they should be the most valid candidates),
      // then add any church members/e-members not already in the list.
      const seen = new Set<string>();
      const merged: UserBasicResponse[] = [];
      for (const u of [...groupItems, ...memItems, ...ememItems]) {
        if (!seen.has(u.id)) {
          seen.add(u.id);
          merged.push(u);
        }
      }
      setAllMembers(merged);
    } catch {
      setAllMembers([]);
    } finally {
      setAllMembersLoading(false);
    }
  };

  const filteredAllMembers = headSearch.trim()
    ? allMembers.filter((m) => {
        const q = headSearch.toLowerCase();
        return (
          (m.firstName ?? "").toLowerCase().includes(q) ||
          (m.lastName ?? "").toLowerCase().includes(q) ||
          (m.middleName ?? "").toLowerCase().includes(q) ||
          (m.email ?? "").toLowerCase().includes(q)
        );
      })
    : allMembers;

  const handleAssignHead = async (member: UserBasicResponse) => {
    setAssigningId(member.id);
    setAssignError("");
    try {
      await updateGroupHead(id, member.id);
      setShowHeadModal(false);
      // Refresh group so new head shows
      await fetchGroup();
    } catch (err) {
      setAssignError(
        err instanceof Error ? err.message : "Failed to assign group head.",
      );
      setAssigningId(null);
    }
  };

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

  // const memberLocation = (m: GroupMemberResponse): string =>
  //   [m.city, m.state, m.country].filter(Boolean).join(", ") || "—";

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        subtitle={group?.name ?? "Group"}
        backHref="/settings/groups"
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error} —{" "}
          <button
            type="button"
            className="font-medium underline"
            onClick={fetchGroup}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center text-gray-400">
          Loading…
        </div>
      ) : group ? (
        <>
          {/* Group info card */}
          <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#111827]">
                  {group.name}
                </h2>
                {group.description && (
                  <p className="mt-1 text-sm text-[#6B7280]">
                    {group.description}
                  </p>
                )}
              </div>
              <Button variant="primary" onClick={openHeadModal}>
                Assign Group Head
              </Button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <p className="text-xs font-medium text-[#6B7280]">Group Head</p>
                {group.groupHead ? (
                  <div className="mt-1 flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#000080] ${avatarBgColors(group.groupHead.id)}`}
                    >
                      {initials(group.groupHead)}
                    </div>
                    <span className="text-sm font-medium text-[#111827]">
                      {fullName(group.groupHead)}
                    </span>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-[#9CA3AF] italic">
                    Not assigned
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7280]">
                  Total Members
                </p>
                <p className="mt-1 text-sm font-medium text-[#111827]">
                  {membersLoading ? "…" : filteredMembers.length}
                </p>
              </div>
              {group.whatsAppLink && (
                <div>
                  <p className="text-xs font-medium text-[#6B7280]">
                    WhatsApp Group
                  </p>
                  <a
                    href={group.whatsAppLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block truncate text-sm font-medium text-[#000080] underline hover:text-[#000066]"
                  >
                    Join Group
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Members section */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-[#111827]">
              Members{!membersLoading && ` (${filteredMembers.length})`}
            </h3>
            <div className="w-full sm:w-64">
              <SearchBar
                value={memberSearch}
                onChange={(v) => {
                  setMemberSearch(v);
                  setMemberPage(1);
                }}
                onSearch={() => setMemberPage(1)}
                placeholder="Search members…"
              />
            </div>
          </div>

          {membersError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {membersError} —{" "}
              <button className="font-medium underline" onClick={fetchMembers}>
                Retry
              </button>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F3F4F6]">
                  <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                    Name
                  </th>
                  <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">
                    Email
                  </th>
                  <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080]">
                    Phone
                  </th>
                  <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080]">
                    Occupation
                  </th>
                  <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">
                    Sex
                  </th>
                </tr>
              </thead>
              <tbody>
                {membersLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      Loading members…
                    </td>
                  </tr>
                ) : paginatedMembers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      {memberSearch
                        ? "No members match your search."
                        : "No members in this group yet."}
                    </td>
                  </tr>
                ) : (
                  paginatedMembers.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-[#F3F4F6] hover:bg-gray-50"
                      style={{ height: "56px" }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {m.profilePictureUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.profilePictureUrl}
                              alt=""
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#000080] ${avatarBgColors(m.id)}`}
                            >
                              {initials(m)}
                            </div>
                          )}
                          <span className="text-sm font-medium text-[#374151]">
                            {fullName(m)}
                          </span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 max-w-[200px]">
                        <span className="block truncate text-sm text-[#374151]">
                          {m.email || "—"}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151]">
                        {m.phoneNumber
                          ? `+${m.countryCode ?? ""} ${m.phoneNumber}`.trim()
                          : "—"}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151]">
                        {m.occupation || "—"}
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                        {m.sex
                          ? m.sex.charAt(0) + m.sex.slice(1).toLowerCase()
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={safePage}
              totalPages={totalMemberPages}
              totalItems={filteredMembers.length}
              onPageChange={setMemberPage}
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push("/settings/groups")}
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                router.push(
                  `/settings/groups/grp-1/edit/?id=${encodeURIComponent(id)}`,
                )
              }
            >
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
              disabled={deleting}
            >
              Delete
            </Button>
          </div>
        </>
      ) : !loading ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center text-sm text-gray-400">
          Group not found.
        </div>
      ) : null}

      {/* Assign Group Head Modal */}
      <Modal
        isOpen={showHeadModal}
        onClose={() => {
          setShowHeadModal(false);
          setAssignError("");
        }}
        title="Assign Group Head"
        size="md"
      >
        <p className="mb-3 text-sm text-[#6B7280]">
          Select a church member to set as the head of{" "}
          <span className="font-medium text-[#111827]">{group?.name}</span>.
        </p>

        {assignError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {assignError}
          </div>
        )}

        <div className="mb-3">
          <SearchBar
            value={headSearch}
            onChange={setHeadSearch}
            onSearch={() => {}}
            placeholder="Search members…"
          />
        </div>

        {allMembersLoading ? (
          <div className="py-8 text-center text-sm text-gray-400">
            Loading members…
          </div>
        ) : filteredAllMembers.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            {headSearch ? "No members match your search." : "No members found."}
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto divide-y divide-[#F3F4F6]">
            {filteredAllMembers.map((m) => {
              const isCurrentHead = group?.groupHead?.id === m.id;
              const isAssigning = assigningId === m.id;
              return (
                <div
                  key={m.id}
                  className={`flex items-center justify-between gap-3 px-1 py-3 ${isCurrentHead ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {m.profilePictureUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.profilePictureUrl}
                        alt=""
                        className="h-9 w-9 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#000080] ${avatarBgColors(m.id)}`}
                      >
                        {initials(m)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#111827]">
                        {fullName(m)}
                      </p>
                      {m.email && (
                        <p className="truncate text-xs text-[#6B7280]">
                          {m.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {isCurrentHead ? (
                      <span className="rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-medium text-[#16A34A]">
                        Current Head
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => handleAssignHead(m)}
                        disabled={assigningId !== null}
                      >
                        {isAssigning ? "Assigning…" : "Assign"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this group?"
      />
    </DashboardLayout>
  );
}
