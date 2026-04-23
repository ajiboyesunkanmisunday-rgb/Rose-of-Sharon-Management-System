"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import SearchField from "@/components/ui/SearchField";
import Chip from "@/components/ui/Chip";
import Avatar from "@/components/ui/Avatar";
import FAB from "@/components/ui/FAB";
import { members } from "@/lib/mock-data";
import { useRouter } from "next/navigation";

type Filter = "all" | "active" | "inactive";

export default function MembersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      const match = !q
        ? true
        : `${m.firstName} ${m.lastName} ${m.email} ${m.phone}`
            .toLowerCase()
            .includes(q);
      const byStatus =
        filter === "all" ||
        (filter === "active" && m.status !== "inactive") ||
        (filter === "inactive" && m.status === "inactive");
      return match && byStatus;
    });
  }, [search, filter]);

  return (
    <>
      <AppShell
        title="Members"
        subtitle={`${filtered.length} of ${members.length}`}
      >
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search members..."
        />

        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          <Chip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
          <Chip label="Active" active={filter === "active"} onClick={() => setFilter("active")} />
          <Chip label="Inactive" active={filter === "inactive"} onClick={() => setFilter("inactive")} />
        </div>

        <ul className="mt-4 space-y-2">
          {filtered.map((m) => (
            <li key={m.id}>
              <Link
                href={`/members/${m.id}`}
                className="press flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3"
              >
                <Avatar name={`${m.firstName} ${m.lastName}`} src={m.avatar} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#0F172A]">
                    {m.firstName} {m.lastName}
                  </p>
                  <p className="truncate text-xs text-[#6B7280]">
                    {m.department || "—"} · {m.phone}
                  </p>
                </div>
                {m.status === "inactive" && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-[#6B7280]">
                    Inactive
                  </span>
                )}
              </Link>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
              No members match your search.
            </li>
          )}
        </ul>
      </AppShell>
      <FAB onClick={() => router.push("/members/add")} label="Add member" />
    </>
  );
}
