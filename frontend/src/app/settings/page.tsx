"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getStoredUser } from "@/lib/api";
import {
  Settings,
  ShieldCheck,
  Users,
  KeyRound,
  ClipboardList,
  ChevronRight,
  User,
  Mail,
  BadgeCheck,
} from "lucide-react";

// ─── Quick-access settings cards ─────────────────────────────────────────────
const settingsCards = [
  {
    label: "General",
    description: "Church info, service times and branding",
    href: "/settings/general",
    icon: Settings,
    color: "bg-[#EEF2FF] dark:bg-indigo-900/30",
    iconColor: "text-[#000080] dark:text-indigo-400",
  },
  {
    label: "Roles & Permissions",
    description: "Manage admin roles and access levels",
    href: "/settings/roles",
    icon: ShieldCheck,
    color: "bg-[#F0FDF4]",
    iconColor: "text-[#16A34A] dark:text-green-300",
  },
  {
    label: "Groups",
    description: "Create and manage congregation groups",
    href: "/settings/groups",
    icon: Users,
    color: "bg-[#FFF7ED] dark:bg-orange-900/30",
    iconColor: "text-[#EA580C] dark:text-orange-400",
  },
  {
    label: "Change Password",
    description: "Update your account password",
    href: "/settings/change-password",
    icon: KeyRound,
    color: "bg-[#FDF4FF]",
    iconColor: "text-[#9333EA]",
  },
  {
    label: "Activity Logs",
    description: "Full audit trail of all system actions",
    href: "/settings/activity-logs",
    icon: ClipboardList,
    color: "bg-[#FFF1F2]",
    iconColor: "text-[#E11D48]",
  },
];

export default function MySettingsPage() {
  const router = useRouter();
  const user = getStoredUser();

  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : "—";
  const initials = user
    ? [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("").toUpperCase()
    : "?";

  return (
    <DashboardLayout>
      {/* ── Page header ── */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6] dark:bg-slate-700/30">
          <Settings className="h-6 w-6 text-[#374151] dark:text-slate-300" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Settings</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Manage your account and system preferences</p>
        </div>
      </div>

      {/* ── Profile card ── */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#000080] text-xl font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="text-[18px] font-bold text-[#000000] dark:text-slate-100">{fullName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[#6B7280] dark:text-slate-400">
              {user?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
              )}
              {user?.userType && (
                <span className="flex items-center gap-1">
                  <BadgeCheck className="h-3.5 w-3.5 text-[#000080] dark:text-indigo-400" />
                  <span className="capitalize">{user.userType.replace(/_/g, " ").toLowerCase()}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push("/settings/change-password")}
          className="flex items-center gap-2 self-start rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-2 text-sm font-medium text-[#000080] dark:text-indigo-400 transition-colors hover:border-[#000080] hover:bg-[#EEF2FF] dark:bg-indigo-900/30 sm:self-auto"
        >
          <KeyRound className="h-4 w-4" />
          Change Password
        </button>
      </div>

      {/* ── Quick access grid ── */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {settingsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col gap-3 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5 transition-all hover:border-[#000080] hover:shadow-md"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#000000] dark:text-slate-100">{card.label}</p>
                <p className="mt-0.5 text-xs text-[#6B7280] dark:text-slate-400">{card.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 self-end text-[#9CA3AF] dark:text-slate-400 transition-colors group-hover:text-[#000080] dark:text-indigo-400" />
            </Link>
          );
        })}
      </div>

    </DashboardLayout>
  );
}
