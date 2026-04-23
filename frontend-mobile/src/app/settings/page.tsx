"use client";

import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import {
  Settings as SettingsIcon,
  Bell,
  ShieldCheck,
  UserCog,
  Users as UsersIcon,
  History,
  ChevronRight,
} from "lucide-react";

const sections = [
  {
    title: "Preferences",
    items: [
      { label: "General", href: "/settings/general", icon: SettingsIcon, hint: "App, language, region" },
      { label: "Notifications", href: "/settings/notifications", icon: Bell, hint: "Email & push alerts" },
    ],
  },
  {
    title: "Access",
    items: [
      { label: "Security", href: "/settings/security", icon: ShieldCheck, hint: "Password & sessions" },
      { label: "Roles", href: "/settings/roles", icon: UserCog, hint: "Team roles & permissions" },
      { label: "Groups", href: "/settings/groups", icon: UsersIcon, hint: "Departments & ministries" },
    ],
  },
  {
    title: "History",
    items: [
      { label: "Activity Logs", href: "/settings/activity-logs", icon: History, hint: "Audit trail" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <AppShell title="Settings" showBack>
      {sections.map((s) => (
        <div key={s.title} className="mb-5">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
            {s.title}
          </p>
          <ul className="divide-y divide-[#F1F2F7] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
            {s.items.map((it) => {
              const Icon = it.icon;
              return (
                <li key={it.href}>
                  <Link href={it.href} className="press flex items-center gap-3 px-4 py-3.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3F4FF] text-[#000080]">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#0F172A]">{it.label}</p>
                      <p className="truncate text-xs text-[#6B7280]">{it.hint}</p>
                    </div>
                    <ChevronRight size={18} className="text-[#9CA3AF]" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </AppShell>
  );
}
