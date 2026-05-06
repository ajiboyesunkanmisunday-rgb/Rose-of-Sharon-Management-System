"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import {
  getMembers,
  getEMembers,
  getFirstTimers,
  getSecondTimers,
  getNewConverts,
  getAllGroups,
  type UserResponse,
  type GroupResponse,
} from "@/lib/api";

type MemberType = "all" | "member" | "e-member" | "first-timer" | "second-timer" | "new-convert";

interface DirectoryEntry {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
  profilePictureUrl?: string;
  userType: string;
  groups?: GroupResponse[];
  sex?: string;
  occupation?: string;
}

const ITEMS_PER_PAGE = 12;

const TYPE_LABELS: Record<string, string> = {
  member:       "Member",
  "e-member":   "E-Member",
  "first-timer":"First Timer",
  "second-timer":"Second Timer",
  "new-convert":"New Convert",
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  member:         "bg-[#000080] text-white",
  "e-member":     "bg-[#4B5563] text-white",
  "first-timer":  "bg-[#065F46] text-white",
  "second-timer": "bg-[#7C3AED] text-white",
  "new-convert":  "bg-[#B45309] text-white",
};

function fullName(u: { firstName?: string; middleName?: string; lastName?: string }) {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

function initials(u: { firstName?: string; lastName?: string }) {
  return `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

function toDirectoryEntry(u: UserResponse, type: string): DirectoryEntry {
  return {
    id:               u.id,
    firstName:        u.firstName,
    middleName:       u.middleName,
    lastName:         u.lastName,
    email:            u.email,
    phoneNumber:      u.phoneNumber,
    countryCode:      u.countryCode,
    profilePictureUrl:u.profilePictureUrl,
    userType:         type,
    groups:           u.groups,
    sex:              u.sex,
    occupation:       u.occupation,
  };
}

const avatarBgColors = [
  "bg-[#B5B5F3]",
  "bg-[#BFDBFE]",
  "bg-[#BBF7D0]",
  "bg-[#FDE68A]",
  "bg-[#FECACA]",
  "bg-[#DDD6FE]",
  "bg-[#A7F3D0]",
  "bg-[#FED7AA]",
];

function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return avatarBgColors[Math.abs(hash) % avatarBgColors.length];
}

const MEMBER_TYPES: { key: MemberType; label: string }[] = [
  { key: "all",          label: "All Members" },
  { key: "member",       label: "Members" },
  { key: "e-member",     label: "E-Members" },
  { key: "first-timer",  label: "First Timers" },
  { key: "second-timer", label: "Second Timers" },
  { key: "new-convert",  label: "New Converts" },
];

export default function DirectoryPage() {
  const router = useRouter();
  const [search, setSearch]               = useState("");
  const [selectedType, setSelectedType]   = useState<MemberType>("all");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [currentPage, setCurrentPage]     = useState(1);

  const [entries, setEntries]   = useState<DirectoryEntry[]>([]);
  const [groups, setGroups]     = useState<GroupResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [membersRes, eMembersRes, firstRes, secondRes, convertRes, groupsRes] =
        await Promise.allSettled([
          getMembers(0, 200),
          getEMembers(0, 200),
          getFirstTimers(0, 200),
          getSecondTimers(0, 200),
          getNewConverts(0, 200),
          getAllGroups(),
        ]);

      const all: DirectoryEntry[] = [];

      if (membersRes.status === "fulfilled") {
        (membersRes.value.content ?? []).forEach((u: UserResponse) =>
          all.push(toDirectoryEntry(u, "member"))
        );
      }
      if (eMembersRes.status === "fulfilled") {
        (eMembersRes.value.content ?? []).forEach((u: UserResponse) =>
          all.push(toDirectoryEntry(u, "e-member"))
        );
      }
      if (firstRes.status === "fulfilled") {
        (firstRes.value.content ?? []).forEach((u: UserResponse) =>
          all.push(toDirectoryEntry(u, "first-timer"))
        );
      }
      if (secondRes.status === "fulfilled") {
        (secondRes.value.content ?? []).forEach((u: UserResponse) =>
          all.push(toDirectoryEntry(u, "second-timer"))
        );
      }
      if (convertRes.status === "fulfilled") {
        (convertRes.value.content ?? []).forEach((u: UserResponse) =>
          all.push(toDirectoryEntry(u, "new-convert"))
        );
      }
      if (groupsRes.status === "fulfilled") {
        setGroups(Array.isArray(groupsRes.value) ? groupsRes.value : []);
      }

      // Deduplicate by id (same person may appear in multiple lists)
      const seen = new Set<string>();
      const unique = all.filter((e) => {
        if (seen.has(e.id)) return false;
        seen.add(e.id);
        return true;
      });

      // Sort alphabetically by first name
      unique.sort((a, b) =>
        (a.firstName ?? "").localeCompare(b.firstName ?? "")
      );

      setEntries(unique);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load directory.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => {
    let list = entries;
    if (selectedType !== "all") list = list.filter((e) => e.userType === selectedType);
    if (selectedGroup !== "All") {
      list = list.filter((e) =>
        e.groups?.some((g) => g.name === selectedGroup || g.id === selectedGroup)
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          fullName(e).toLowerCase().includes(q) ||
          (e.email ?? "").toLowerCase().includes(q) ||
          (e.phoneNumber ?? "").toLowerCase().includes(q) ||
          (e.occupation ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [entries, selectedType, selectedGroup, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  const resetPage = () => setCurrentPage(1);

  // Stats
  const typeStats = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((e) => { counts[e.userType] = (counts[e.userType] ?? 0) + 1; });
    return counts;
  }, [entries]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Church Directory</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Browse and search all church members and visitors
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button className="font-medium underline" onClick={fetchAll}>Retry</button>
        </div>
      )}

      {/* Summary Stats */}
      {!loading && entries.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center">
            <p className="text-2xl font-bold text-[#000080]">{entries.length}</p>
            <p className="mt-1 text-xs text-[#6B7280]">Total</p>
          </div>
          {(["member","e-member","first-timer","second-timer","new-convert"] as const).map((type) => (
            <div key={type} className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center">
              <p className="text-2xl font-bold text-[#000080]">{typeStats[type] ?? 0}</p>
              <p className="mt-1 text-xs text-[#6B7280]">{TYPE_LABELS[type]}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="mb-5 space-y-3">
        {/* Member type tabs */}
        <div className="flex flex-wrap gap-2">
          {MEMBER_TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => { setSelectedType(t.key); resetPage(); }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedType === t.key
                  ? "bg-[#000080] text-white"
                  : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
              }`}
            >
              {t.label}
              {t.key !== "all" && (
                <span className={`ml-1.5 text-xs ${selectedType === t.key ? "opacity-80" : "text-[#9CA3AF]"}`}>
                  ({typeStats[t.key] ?? 0})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + Group filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-72">
            <SearchBar
              value={search}
              onChange={(val) => { setSearch(val); resetPage(); }}
              onSearch={resetPage}
              placeholder="Search by name, email, phone…"
            />
          </div>
          <select
            value={selectedGroup}
            onChange={(e) => { setSelectedGroup(e.target.value); resetPage(); }}
            className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
          >
            <option value="All">All Groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.name}>{g.name}</option>
            ))}
          </select>
          {(search || selectedGroup !== "All" || selectedType !== "all") && (
            <button
              onClick={() => { setSearch(""); setSelectedGroup("All"); setSelectedType("all"); resetPage(); }}
              className="text-sm font-medium text-[#000080] underline hover:text-[#000066]"
            >
              Clear filters
            </button>
          )}
          <span className="ml-auto text-sm text-[#6B7280]">
            {filtered.length} {filtered.length === 1 ? "person" : "people"} found
          </span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-48 items-center justify-center text-gray-400">
          <svg className="mr-3 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading directory…
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center text-sm text-gray-400">
          {entries.length === 0 ? "No members found in the database." : "No members match your filters."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginated.map((person) => {
            const name     = fullName(person);
            const phone    = person.phoneNumber
              ? `+${person.countryCode ?? ""} ${person.phoneNumber}`.trim()
              : null;
            const groupStr = person.groups?.map((g) => g.name).join(", ") || null;
            const bgColor  = avatarColor(person.id);

            return (
              <div
                key={`${person.userType}-${person.id}`}
                className="flex flex-col rounded-xl border border-[#E5E7EB] bg-white p-5 transition-shadow hover:shadow-md"
              >
                {/* Avatar */}
                <div className="mb-3 flex items-start justify-between">
                  {person.profilePictureUrl ? (
                    <img
                      src={person.profilePictureUrl}
                      alt={name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full ${bgColor} text-lg font-bold text-[#000080]`}
                    >
                      {initials(person)}
                    </div>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${TYPE_BADGE_COLORS[person.userType] ?? "bg-gray-200 text-gray-600"}`}
                  >
                    {TYPE_LABELS[person.userType] ?? person.userType}
                  </span>
                </div>

                {/* Info */}
                <h3 className="text-sm font-bold text-[#111827]">{name}</h3>
                {person.occupation && (
                  <p className="mt-0.5 text-xs text-[#6B7280]">{person.occupation}</p>
                )}
                {groupStr && (
                  <p className="mt-1 text-xs text-[#4B5563]">
                    <span className="font-medium">Group:</span> {groupStr}
                  </p>
                )}
                {phone && (
                  <p className="mt-1 text-xs text-[#374151]">{phone}</p>
                )}
                {person.email && (
                  <a
                    href={`mailto:${person.email}`}
                    className="mt-0.5 truncate text-xs text-[#000080] hover:underline"
                  >
                    {person.email}
                  </a>
                )}

                {/* View link */}
                <div className="mt-auto pt-3">
                  <button
                    onClick={() => {
                      const basePath =
                        person.userType === "member"        ? "/user-management/members"        :
                        person.userType === "e-member"      ? "/user-management/e-members"      :
                        person.userType === "first-timer"   ? "/user-management/first-timers"   :
                        person.userType === "second-timer"  ? "/user-management/second-timers"  :
                        person.userType === "new-convert"   ? "/user-management/new-converts"   :
                        "/user-management/members";
                      router.push(`${basePath}/${person.id}`);
                    }}
                    className="w-full rounded-lg border border-[#000080] py-1.5 text-xs font-medium text-[#000080] transition-colors hover:bg-[#000080] hover:text-white"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </DashboardLayout>
  );
}
