"use client";

import { useMemo, useState } from "react";
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

// ─── Recent Activity Log Data ────────────────────────────────────────────────
const activityLog = [
  {
    date: "Apr 15, 2026",
    action: "Generated attendance report",
    performedBy: "Admin",
    details: "Weekly attendance summary exported",
  },
  {
    date: "Apr 15, 2026",
    action: "New member registered",
    performedBy: "Shola Damson",
    details: "John Adebayo added as first timer",
  },
  {
    date: "Apr 14, 2026",
    action: "Follow-up completed",
    performedBy: "Aisha Bello",
    details: "Called Grace Omotola - second timer",
  },
  {
    date: "Apr 14, 2026",
    action: "SMS campaign sent",
    performedBy: "Admin",
    details: "Easter service reminder to 456 members",
  },
  {
    date: "Apr 13, 2026",
    action: "Attendance recorded",
    performedBy: "David Okoro",
    details: "Sunday Service - 892 attendees logged",
  },
  {
    date: "Apr 13, 2026",
    action: "Member profile updated",
    performedBy: "Grace Adeyemi",
    details: "Updated contact info for Sarah Bamidele",
  },
  {
    date: "Apr 12, 2026",
    action: "Follow-up assigned",
    performedBy: "Admin",
    details: "7 new first timers assigned to team leads",
  },
  {
    date: "Apr 12, 2026",
    action: "Report exported",
    performedBy: "Samuel Eze",
    details: "Monthly growth report downloaded as CSV",
  },
  {
    date: "Apr 11, 2026",
    action: "New convert recorded",
    performedBy: "Aisha Bello",
    details: "Funmi Adekoya moved to new converts",
  },
  {
    date: "Apr 11, 2026",
    action: "Visit report submitted",
    performedBy: "David Okoro",
    details: "Home visit to Chinedu Nwankwo completed",
  },
];

// ─── Quick-access settings cards ─────────────────────────────────────────────
const settingsCards = [
  {
    label: "General",
    description: "Church info, service times and branding",
    href: "/settings/general",
    icon: Settings,
    color: "bg-[#EEF2FF]",
    iconColor: "text-[#000080]",
  },
  {
    label: "Roles & Permissions",
    description: "Manage admin roles and access levels",
    href: "/settings/roles",
    icon: ShieldCheck,
    color: "bg-[#F0FDF4]",
    iconColor: "text-[#16A34A]",
  },
  {
    label: "Groups",
    description: "Create and manage congregation groups",
    href: "/settings/groups",
    icon: Users,
    color: "bg-[#FFF7ED]",
    iconColor: "text-[#EA580C]",
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
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return activityLog;
    const q = search.toLowerCase();
    return activityLog.filter(
      (r) =>
        r.action.toLowerCase().includes(q) ||
        r.performedBy.toLowerCase().includes(q) ||
        r.details.toLowerCase().includes(q)
    );
  }, [search]);

  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : "—";
  const initials = user
    ? [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("").toUpperCase()
    : "?";

  return (
    <DashboardLayout>
      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Settings</h1>
        <p className="text-sm text-[#6B7280]">My Settings</p>
      </div>

      {/* ── Profile card ── */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-[#E5E7EB] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#000080] text-xl font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="text-[18px] font-bold text-[#000000]">{fullName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[#6B7280]">
              {user?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
              )}
              {user?.userType && (
                <span className="flex items-center gap-1">
                  <BadgeCheck className="h-3.5 w-3.5 text-[#000080]" />
                  <span className="capitalize">{user.userType.replace(/_/g, " ").toLowerCase()}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push("/settings/change-password")}
          className="flex items-center gap-2 self-start rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#000080] transition-colors hover:border-[#000080] hover:bg-[#EEF2FF] sm:self-auto"
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
              className="group flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-5 transition-all hover:border-[#000080] hover:shadow-md"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#000000]">{card.label}</p>
                <p className="mt-0.5 text-xs text-[#6B7280]">{card.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 self-end text-[#9CA3AF] transition-colors group-hover:text-[#000080]" />
            </Link>
          );
        })}
      </div>

      {/* ── Recent Activity Log ── */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white">
        {/* Table header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-[18px] font-bold text-[#000000]">Recent Activity Log</h2>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activity…"
                className="w-52 rounded-lg border border-[#E5E7EB] py-2 pl-9 pr-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-1/2 -translate-y-1/2"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <Link
              href="/settings/activity-logs"
              className="whitespace-nowrap text-sm font-medium text-[#000080] hover:underline"
            >
              View all →
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#F3F4F6]">
                <th className="px-6 py-4 text-sm font-bold text-[#000080]">Date</th>
                <th className="px-6 py-4 text-sm font-bold text-[#000080]">Action</th>
                <th className="hidden sm:table-cell px-6 py-4 text-sm font-bold text-[#000080]">Performed By</th>
                <th className="hidden md:table-cell px-6 py-4 text-sm font-bold text-[#000080]">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                  style={{ height: "56px" }}
                >
                  <td className="whitespace-nowrap px-6 py-3 text-sm text-[#6B7280]">
                    {row.date}
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-[#000000]">
                    {row.action}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-3 text-sm text-[#374151]">
                    {row.performedBy}
                  </td>
                  <td className="hidden md:table-cell px-6 py-3 text-sm text-[#6B7280]">
                    {row.details}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-[#9CA3AF]">
                    No activity matches your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
