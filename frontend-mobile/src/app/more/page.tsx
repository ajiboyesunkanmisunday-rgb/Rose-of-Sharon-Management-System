"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import Avatar from "@/components/ui/Avatar";
import {
  User,
  UserPlus,
  UserCheck,
  HeartHandshake,
  Users as UsersIcon,
  PartyPopper,
  GraduationCap,
  FileText,
  MessageCircle,
  BookOpen,
  Megaphone,
  Images,
  ClipboardList,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const groups: { title: string; items: { label: string; href: string; icon: React.ComponentType<{ size?: number }> }[] }[] = [
  {
    title: "People",
    items: [
      { label: "E-Members", href: "/e-members", icon: User },
      { label: "First Timers", href: "/first-timers", icon: UserPlus },
      { label: "Second Timers", href: "/second-timers", icon: UserCheck },
      { label: "New Converts", href: "/new-converts", icon: HeartHandshake },
      { label: "Directory", href: "/directory", icon: UsersIcon },
    ],
  },
  {
    title: "Engagement",
    items: [
      { label: "Celebrations", href: "/celebrations", icon: PartyPopper },
      { label: "Workflows", href: "/workflows", icon: Sparkles },
      { label: "Requests", href: "/requests", icon: ClipboardList },
      { label: "Testimonies", href: "/testimonies", icon: MessageCircle },
      { label: "Announcements", href: "/announcements", icon: Megaphone },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Trainings", href: "/trainings", icon: GraduationCap },
      { label: "Media", href: "/media", icon: Images },
      { label: "Reports", href: "/reports", icon: FileText },
      { label: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", href: "/profile", icon: User },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export default function MorePage() {
  const router = useRouter();
  return (
    <AppShell title="More">
      {/* Profile card */}
      <Link
        href="/profile"
        className="press mb-5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#000080] to-[#1a1aa6] p-4 text-white"
      >
        <Avatar name="John Cooper" size={48} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">John Cooper</p>
          <p className="truncate text-xs text-[#B5B5F3]">johncoopl23@gmail.com</p>
        </div>
        <ChevronRight className="text-white/80" />
      </Link>

      {groups.map((g) => (
        <div key={g.title} className="mb-5">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
            {g.title}
          </p>
          <ul className="divide-y divide-[#F1F2F7] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
            {g.items.map((it) => {
              const Icon = it.icon;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className="press flex items-center gap-3 px-4 py-3.5"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3F4FF] text-[#000080]">
                      <Icon size={18} />
                    </div>
                    <span className="flex-1 text-sm font-medium text-[#0F172A]">
                      {it.label}
                    </span>
                    <ChevronRight size={18} className="text-[#9CA3AF]" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <button
        onClick={() => router.push("/login")}
        className="press mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white py-3.5 text-sm font-semibold text-red-600"
      >
        <LogOut size={18} /> Log Out
      </button>
    </AppShell>
  );
}
