"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import SearchField from "@/components/ui/SearchField";
import Chip from "@/components/ui/Chip";
import Avatar from "@/components/ui/Avatar";
import FAB from "@/components/ui/FAB";
import { newConverts } from "@/lib/mock-data";
import type { BelieversClass } from "@/lib/types";

type Filter = "All" | BelieversClass;

export default function NewConvertsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return newConverts.filter((nc) => {
      const match = !q
        ? true
        : `${nc.name} ${nc.email} ${nc.phone} ${nc.assignedFollowUp}`
            .toLowerCase()
            .includes(q);
      const byClass = filter === "All" || nc.believersClass === filter;
      return match && byClass;
    });
  }, [search, filter]);

  const chips: Filter[] = [
    "All",
    "Not started",
    "Class 1",
    "Class 2",
    "Class 3",
    "Class 4",
    "Class 5",
  ];

  return (
    <>
      <AppShell title="New Converts" subtitle={`${filtered.length} of ${newConverts.length}`}>
        <SearchField value={search} onChange={setSearch} placeholder="Search new converts..." />

        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {chips.map((c) => (
            <Chip key={c} label={c} active={filter === c} onClick={() => setFilter(c)} />
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {filtered.map((nc) => (
            <li key={nc.id}>
              <Link
                href={`/new-converts/${nc.id}`}
                className="press flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3"
              >
                <Avatar name={nc.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#0F172A]">{nc.name}</p>
                  <p className="truncate text-xs text-[#6B7280]">
                    {nc.assignedFollowUp} · {nc.date}
                  </p>
                </div>
                <span className="rounded-full bg-[#EEF0FF] px-2 py-0.5 text-[10px] font-medium text-[#000080]">
                  {nc.believersClass || "Not started"}
                </span>
              </Link>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
              No new converts match your search.
            </li>
          )}
        </ul>
      </AppShell>
      <FAB onClick={() => router.push("/new-converts/add")} label="Add new convert" />
    </>
  );
}
