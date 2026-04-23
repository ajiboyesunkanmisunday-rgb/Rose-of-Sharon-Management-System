"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import SearchField from "@/components/ui/SearchField";
import Chip from "@/components/ui/Chip";
import Avatar from "@/components/ui/Avatar";
import FAB from "@/components/ui/FAB";
import { eMembers } from "@/lib/mock-data";

type Filter = "All" | "Sunday" | "Wednesday" | "Friday" | "Special Service";

export default function EMembersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return eMembers.filter((m) => {
      const match = !q
        ? true
        : `${m.firstName} ${m.lastName} ${m.email} ${m.phone} ${m.country}`
            .toLowerCase()
            .includes(q);
      const byService = filter === "All" || m.serviceAttended === filter;
      return match && byService;
    });
  }, [search, filter]);

  const chips: Filter[] = ["All", "Sunday", "Wednesday", "Friday", "Special Service"];

  return (
    <>
      <AppShell title="E-Members" subtitle={`${filtered.length} of ${eMembers.length}`}>
        <SearchField value={search} onChange={setSearch} placeholder="Search e-members..." />

        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {chips.map((c) => (
            <Chip key={c} label={c} active={filter === c} onClick={() => setFilter(c)} />
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {filtered.map((m) => (
            <li key={m.id}>
              <Link
                href={`/e-members/${m.id}`}
                className="press flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3"
              >
                <Avatar name={`${m.firstName} ${m.lastName}`} src={m.avatar} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#0F172A]">
                    {m.firstName} {m.lastName}
                  </p>
                  <p className="truncate text-xs text-[#6B7280]">
                    {m.country} · {m.serviceAttended}
                  </p>
                </div>
                <span className="rounded-full bg-[#EEF0FF] px-2 py-0.5 text-[10px] font-medium text-[#000080]">
                  {m.serviceAttended}
                </span>
              </Link>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
              No e-members match your search.
            </li>
          )}
        </ul>
      </AppShell>
      <FAB onClick={() => router.push("/e-members/add")} label="Add e-member" />
    </>
  );
}
