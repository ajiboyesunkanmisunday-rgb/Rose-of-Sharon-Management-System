"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import SearchField from "@/components/ui/SearchField";
import Avatar from "@/components/ui/Avatar";
import { celebrations } from "@/lib/mock-data";
import { PartyPopper } from "lucide-react";

export default function CelebrationWorkflowPage() {
  const [search, setSearch] = useState("");
  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return celebrations.filter(
      (c) =>
        c.status !== "Completed" &&
        c.status !== "Treated" &&
        (!q || c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)),
    );
  }, [search]);

  return (
    <AppShell title="Celebration Workflow" subtitle={`${items.length} scheduled`} showBack>
      <SearchField value={search} onChange={setSearch} placeholder="Search celebrations..." />

      <ul className="mt-4 space-y-2">
        {items.map((c) => (
          <li
            key={c.id}
            className="press flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-700">
              <PartyPopper size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#0F172A]">{c.name}</p>
              <p className="mt-0.5 truncate text-xs text-[#6B7280]">
                {c.type} · {c.date}
              </p>
              {c.notes && (
                <p className="mt-0.5 line-clamp-2 text-xs text-[#374151]">{c.notes}</p>
              )}
            </div>
            <Avatar name={c.name || "?"} size={32} />
          </li>
        ))}
        {items.length === 0 && (
          <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
            No celebration workflows.
          </li>
        )}
      </ul>
    </AppShell>
  );
}
