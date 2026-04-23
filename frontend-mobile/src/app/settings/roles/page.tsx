"use client";

import AppShell from "@/components/shell/AppShell";
import { roles } from "@/lib/mock-data";
import { UserCog, ChevronRight } from "lucide-react";

export default function RolesSettingsPage() {
  return (
    <AppShell title="Roles" subtitle={`${roles.length} roles`} showBack>
      <ul className="space-y-2">
        {roles.map((r) => (
          <li
            key={r.id}
            className="press flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F4FF] text-[#000080]">
              <UserCog size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-[#0F172A]">{r.name}</p>
                <span className="shrink-0 rounded-full bg-[#F3F4FF] px-2 py-0.5 text-[10px] font-semibold text-[#000080]">
                  {r.userCount} {r.userCount === 1 ? "user" : "users"}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-[#6B7280]">{r.description}</p>
            </div>
            <ChevronRight size={18} className="text-[#9CA3AF]" />
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
