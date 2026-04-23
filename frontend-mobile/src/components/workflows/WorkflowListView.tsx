"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import SearchField from "@/components/ui/SearchField";
import Chip from "@/components/ui/Chip";
import Avatar from "@/components/ui/Avatar";
import { activeWorkflowCards } from "@/lib/mock-data";
import { ActiveWorkflowCard, WorkflowCardStatus } from "@/lib/types";

const STATUSES: (WorkflowCardStatus | "All")[] = ["All", "On Track", "Overdue", "Pending"];

const statusColor: Record<WorkflowCardStatus, string> = {
  "On Track": "bg-green-100 text-green-700",
  Overdue: "bg-red-100 text-red-700",
  Pending: "bg-amber-100 text-amber-700",
};

export default function WorkflowListView({
  title,
  subtitle,
  filter,
}: {
  title: string;
  subtitle?: string;
  filter?: (c: ActiveWorkflowCard) => boolean;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<WorkflowCardStatus | "All">("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activeWorkflowCards.filter(
      (c) =>
        (!filter || filter(c)) &&
        (status === "All" || c.status === status) &&
        (!q || c.memberName.toLowerCase().includes(q) || c.stage.toLowerCase().includes(q)),
    );
  }, [search, status, filter]);

  return (
    <AppShell title={title} subtitle={subtitle ?? `${filtered.length} active`} showBack>
      <SearchField value={search} onChange={setSearch} placeholder="Search cards..." />

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {STATUSES.map((s) => (
          <Chip key={s} label={s} active={status === s} onClick={() => setStatus(s)} />
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {filtered.map((c) => (
          <li
            key={c.id}
            className="press flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3"
          >
            <Avatar name={c.memberName} size={44} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-semibold text-[#0F172A]">{c.memberName}</p>
                <span className="shrink-0 text-[10px] text-[#6B7280]">{c.dateAdded}</span>
              </div>
              <p className="mt-0.5 truncate text-xs text-[#374151]">{c.stage}</p>
              <p className="mt-0.5 truncate text-[11px] text-[#6B7280]">
                Assigned to {c.assignedTo}
              </p>
            </div>
            <span
              className={`shrink-0 self-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColor[c.status]}`}
            >
              {c.status}
            </span>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
            No active cards.
          </li>
        )}
      </ul>
    </AppShell>
  );
}
