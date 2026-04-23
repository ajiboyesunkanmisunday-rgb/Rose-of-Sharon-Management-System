"use client";

import AppShell from "@/components/shell/AppShell";
import { groups } from "@/lib/mock-data";
import { Users as UsersIcon, ChevronRight } from "lucide-react";

export default function GroupsSettingsPage() {
  return (
    <AppShell title="Groups" subtitle={`${groups.length} groups`} showBack>
      <ul className="space-y-2">
        {groups.map((g) => (
          <li
            key={g.id}
            className="press flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F4FF] text-[#000080]">
              <UsersIcon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-[#0F172A]">{g.name}</p>
                <span className="shrink-0 rounded-full bg-[#F3F4FF] px-2 py-0.5 text-[10px] font-semibold text-[#000080]">
                  {g.membersCount}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-1 text-xs text-[#6B7280]">{g.description}</p>
              <p className="mt-0.5 truncate text-[11px] text-[#6B7280]">
                Leader: <span className="font-medium text-[#374151]">{g.leader}</span>
              </p>
            </div>
            <ChevronRight size={18} className="text-[#9CA3AF]" />
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
