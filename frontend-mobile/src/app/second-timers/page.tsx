"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import SearchField from "@/components/ui/SearchField";
import Chip from "@/components/ui/Chip";
import Avatar from "@/components/ui/Avatar";
import FAB from "@/components/ui/FAB";
import { secondTimers } from "@/lib/mock-data";

type Filter = "All" | "Pending" | "Contacted" | "Visited";

export default function SecondTimersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return secondTimers.filter((st) => {
      const match = !q
        ? true
        : `${st.name} ${st.email} ${st.phone} ${st.assignedFollowUp}`
            .toLowerCase()
            .includes(q);
      const byState =
        filter === "All" ||
        (filter === "Contacted" && st.calls > 0) ||
        (filter === "Pending" && st.calls === 0 && st.visits === 0) ||
        (filter === "Visited" && st.visits > 0);
      return match && byState;
    });
  }, [search, filter]);

  const chips: Filter[] = ["All", "Pending", "Contacted", "Visited"];

  return (
    <>
      <AppShell title="Second Timers" subtitle={`${filtered.length} of ${secondTimers.length}`}>
        <SearchField value={search} onChange={setSearch} placeholder="Search second timers..." />

        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {chips.map((c) => (
            <Chip key={c} label={c} active={filter === c} onClick={() => setFilter(c)} />
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {filtered.map((st) => (
            <li key={st.id}>
              <Link
                href={`/second-timers/${st.id}`}
                className="press flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3"
              >
                <Avatar name={st.name} src={st.avatar} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#0F172A]">{st.name}</p>
                  <p className="truncate text-xs text-[#6B7280]">
                    {st.serviceAttended} · {st.date}
                  </p>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="text-[10px] text-[#6B7280]">Calls {st.calls}</span>
                  <span className="text-[10px] text-[#6B7280]">Visits {st.visits}</span>
                </div>
              </Link>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
              No second timers match your search.
            </li>
          )}
        </ul>
      </AppShell>
      <FAB onClick={() => router.push("/second-timers/add")} label="Add second timer" />
    </>
  );
}
