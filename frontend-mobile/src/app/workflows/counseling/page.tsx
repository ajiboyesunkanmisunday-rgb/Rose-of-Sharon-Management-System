"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import SearchField from "@/components/ui/SearchField";
import Avatar from "@/components/ui/Avatar";
import { allRequests } from "@/lib/mock-data";
import { MessageCircle } from "lucide-react";

export default function CounselingWorkflowPage() {
  const [search, setSearch] = useState("");
  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRequests.filter(
      (r) =>
        r.category === "Counseling" &&
        (!q || r.title.toLowerCase().includes(q) || r.submittedBy.toLowerCase().includes(q)),
    );
  }, [search]);

  return (
    <AppShell title="Counseling" subtitle={`${items.length} active`} showBack>
      <SearchField value={search} onChange={setSearch} placeholder="Search counseling..." />

      <ul className="mt-4 space-y-2">
        {items.map((r) => (
          <li
            key={r.id}
            className="press flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <MessageCircle size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#0F172A]">{r.title}</p>
              <p className="mt-0.5 truncate text-xs text-[#6B7280]">By {r.submittedBy}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-[#374151]">{r.content}</p>
            </div>
            <Avatar name={r.assignedTo || "?"} size={32} />
          </li>
        ))}
        {items.length === 0 && (
          <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
            No counseling workflows.
          </li>
        )}
      </ul>
    </AppShell>
  );
}
