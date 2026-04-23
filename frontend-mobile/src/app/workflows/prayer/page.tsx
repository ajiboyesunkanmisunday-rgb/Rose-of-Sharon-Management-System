"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import SearchField from "@/components/ui/SearchField";
import Avatar from "@/components/ui/Avatar";
import { allRequests } from "@/lib/mock-data";
import { HandHeart } from "lucide-react";

export default function PrayerWorkflowPage() {
  const [search, setSearch] = useState("");
  const prayer = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRequests.filter(
      (r) =>
        r.category === "Prayer" &&
        (!q || r.title.toLowerCase().includes(q) || r.submittedBy.toLowerCase().includes(q)),
    );
  }, [search]);

  return (
    <AppShell title="Prayer Requests" subtitle={`${prayer.length} active`} showBack>
      <SearchField value={search} onChange={setSearch} placeholder="Search prayer requests..." />

      <ul className="mt-4 space-y-2">
        {prayer.map((r) => (
          <li
            key={r.id}
            className="press flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <HandHeart size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#0F172A]">{r.title}</p>
              <p className="mt-0.5 truncate text-xs text-[#6B7280]">By {r.submittedBy}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-[#374151]">{r.content}</p>
            </div>
            <Avatar name={r.assignedTo || "?"} size={32} />
          </li>
        ))}
        {prayer.length === 0 && (
          <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
            No prayer workflows.
          </li>
        )}
      </ul>
    </AppShell>
  );
}
