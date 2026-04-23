"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import Chip from "@/components/ui/Chip";
import SearchField from "@/components/ui/SearchField";
import { activityLogs } from "@/lib/mock-data";
import type { ActivityLog } from "@/lib/types";
import { LogIn, UserPlus, MessageSquare, Settings, Workflow, MoreHorizontal } from "lucide-react";

const CATEGORIES: (ActivityLog["category"] | "All")[] = ["All", "Login", "Member", "Communication", "Workflow", "Settings", "Other"];

const iconFor: Record<ActivityLog["category"], React.ComponentType<{ size?: number }>> = {
  Login: LogIn,
  Member: UserPlus,
  Communication: MessageSquare,
  Workflow: Workflow,
  Settings: Settings,
  Other: MoreHorizontal,
};

export default function ActivityLogsPage() {
  const [cat, setCat] = useState<(ActivityLog["category"]) | "All">("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return activityLogs.filter(
      (l) =>
        (cat === "All" || l.category === cat) &&
        (!s || l.action.toLowerCase().includes(s) || l.performedBy.toLowerCase().includes(s)),
    );
  }, [cat, q]);

  return (
    <AppShell title="Activity Logs" subtitle={`${filtered.length} events`} showBack>
      <SearchField value={q} onChange={setQ} placeholder="Search logs..." />
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} active={cat === c} onClick={() => setCat(c)} />
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {filtered.map((l) => {
          const Icon = iconFor[l.category];
          return (
            <li
              key={l.id}
              className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#B5B5F3] text-[#000080]">
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#0F172A]">{l.action}</p>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  {l.performedBy} · {l.location}
                </p>
                <p className="mt-0.5 text-[11px] text-[#9CA3AF]">{l.timestamp}</p>
              </div>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
            No activity.
          </li>
        )}
      </ul>
    </AppShell>
  );
}
