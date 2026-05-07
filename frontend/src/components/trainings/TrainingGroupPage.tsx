"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import { getMembers, getEMembers, getAllGroups, type UserResponse, type GroupResponse } from "@/lib/api";
import { GraduationCap, Phone, Mail, Users } from "lucide-react";

interface Props {
  groupKeywords: string[];
  title: string;
  description: string;
  accentColor: string;
}

const avatarBgColors = [
  "bg-[#B5B5F3]", "bg-[#BFDBFE]", "bg-[#BBF7D0]",
  "bg-[#FDE68A]", "bg-[#FECACA]", "bg-[#DDD6FE]",
];

function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return avatarBgColors[Math.abs(hash) % avatarBgColors.length];
}

function initials(u: UserResponse) {
  return `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

function fullName(u: UserResponse) {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

const ITEMS_PER_PAGE = 12;

export default function TrainingGroupPage({ groupKeywords, title, description, accentColor }: Props) {
  const [allMembers, setAllMembers] = useState<UserResponse[]>([]);
  const [groups,     setGroups]     = useState<GroupResponse[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [mRes, emRes, grpRes] = await Promise.allSettled([
          getMembers(0, 500),
          getEMembers(0, 500),
          getAllGroups(),
        ]);
        const members  = mRes.status  === "fulfilled" ? (mRes.value.content  ?? []) : [];
        const eMembers = emRes.status === "fulfilled" ? (emRes.value.content ?? []) : [];
        const grps     = grpRes.status === "fulfilled" ? (Array.isArray(grpRes.value) ? grpRes.value : []) : [];
        setAllMembers([...members, ...eMembers]);
        setGroups(grps);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load members.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Find group IDs matching the keywords
  const matchedGroupIds = useMemo(() => {
    const ids = new Set<string>();
    groups.forEach((g) => {
      if (groupKeywords.some((kw) => g.name.toLowerCase().includes(kw.toLowerCase()))) {
        ids.add(g.id);
      }
    });
    return ids;
  }, [groups, groupKeywords]);

  const matchedGroups = groups.filter((g) =>
    groupKeywords.some((kw) => g.name.toLowerCase().includes(kw.toLowerCase()))
  );

  // Filter members who belong to any matched group
  const groupMembers = useMemo(() => {
    return allMembers.filter((u) =>
      u.groups?.some((g) => matchedGroupIds.has(g.id))
    );
  }, [allMembers, matchedGroupIds]);

  // Search filter
  const filtered = useMemo(() => {
    if (!search.trim()) return groupMembers;
    const q = search.toLowerCase();
    return groupMembers.filter(
      (u) =>
        fullName(u).toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.phoneNumber ?? "").toLowerCase().includes(q)
    );
  }, [groupMembers, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accentColor}18` }}
        >
          <GraduationCap className="h-6 w-6" style={{ color: accentColor }} />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000]">{title}</h1>
          <p className="text-sm text-[#6B7280]">{description}</p>
        </div>
      </div>

      {/* Matched groups chips */}
      {!loading && matchedGroups.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {matchedGroups.map((g) => (
            <span
              key={g.id}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: accentColor }}
            >
              <Users className="h-3 w-3" />
              {g.name}
              <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[10px]">
                {g.totalMembers ?? 0}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Stats bar */}
      {!loading && (
        <div className="mb-5 flex items-center gap-6">
          <div className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-3">
            <p className="text-2xl font-bold" style={{ color: accentColor }}>{groupMembers.length}</p>
            <p className="text-xs text-[#6B7280]">Total enrolled</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-3">
            <p className="text-2xl font-bold text-[#16A34A]">{matchedGroups.length}</p>
            <p className="text-xs text-[#6B7280]">Group{matchedGroups.length !== 1 ? "s" : ""} found</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Search */}
      <div className="mb-5 flex items-center gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            onSearch={() => setPage(1)}
            placeholder="Search by name, email, phone…"
          />
        </div>
        <span className="ml-auto text-sm text-[#6B7280]">
          {filtered.length} {filtered.length === 1 ? "member" : "members"}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-48 items-center justify-center text-[#9CA3AF] text-sm">
          Loading members…
        </div>
      ) : groupMembers.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center">
          <GraduationCap className="mx-auto mb-3 h-10 w-10 text-[#E5E7EB]" />
          <p className="text-sm font-medium text-[#374151]">No members found</p>
          <p className="mt-1 text-xs text-[#9CA3AF]">
            No groups matching "{groupKeywords.join(" / ")}" were found, or no members are assigned to them.
          </p>
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-10 text-center text-sm text-[#9CA3AF]">
          No members match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginated.map((u) => {
            const bg    = avatarColor(u.id);
            const name  = fullName(u);
            const phone = u.phoneNumber ? `+${u.countryCode ?? ""} ${u.phoneNumber}`.trim() : null;
            const userGroups = u.groups?.filter((g) => matchedGroupIds.has(g.id)) ?? [];

            return (
              <div
                key={u.id}
                className="flex flex-col rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Avatar */}
                <div className="mb-3">
                  {u.profilePictureUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={u.profilePictureUrl}
                      alt={name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`flex h-14 w-14 items-center justify-center rounded-full ${bg} text-lg font-bold text-[#000080]`}>
                      {initials(u)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <h3 className="text-sm font-bold text-[#111827]">{name}</h3>
                {u.occupation && (
                  <p className="mt-0.5 text-xs text-[#6B7280]">{u.occupation}</p>
                )}

                {/* Training group badges */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {userGroups.map((g) => (
                    <span
                      key={g.id}
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      {g.name}
                    </span>
                  ))}
                </div>

                {/* Contact */}
                <div className="mt-3 space-y-1">
                  {phone && (
                    <div className="flex items-center gap-1.5 text-xs text-[#374151]">
                      <Phone className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
                      <span>{phone}</span>
                    </div>
                  )}
                  {u.email && (
                    <div className="flex items-center gap-1.5 text-xs text-[#374151]">
                      <Mail className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
                      <span className="truncate">{u.email}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      </div>
    </DashboardLayout>
  );
}
