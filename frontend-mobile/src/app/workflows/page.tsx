"use client";

import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import { activeWorkflowCards } from "@/lib/mock-data";
import { UserPlus, HandHeart, MessageCircle, PartyPopper, ChevronRight } from "lucide-react";

const SECTIONS = [
  {
    href: "/workflows/guest",
    title: "Guest Follow-up",
    desc: "First timers, second timers and new converts",
    icon: UserPlus,
    color: "bg-[#B5B5F3] text-[#000080]",
  },
  {
    href: "/workflows/prayer",
    title: "Prayer Requests",
    desc: "Prayer request follow-up workflow",
    icon: HandHeart,
    color: "bg-purple-100 text-purple-700",
  },
  {
    href: "/workflows/counseling",
    title: "Counseling",
    desc: "Counseling appointments and follow-ups",
    icon: MessageCircle,
    color: "bg-amber-100 text-amber-700",
  },
  {
    href: "/workflows/celebration",
    title: "Celebration",
    desc: "Birthday and anniversary workflows",
    icon: PartyPopper,
    color: "bg-pink-100 text-pink-700",
  },
];

export default function WorkflowsPage() {
  return (
    <AppShell title="Workflows" subtitle={`${activeWorkflowCards.length} active cards`}>
      <ul className="space-y-2">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                className="press flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.color}`}>
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#0F172A]">{s.title}</p>
                  <p className="mt-0.5 truncate text-xs text-[#6B7280]">{s.desc}</p>
                </div>
                <ChevronRight size={18} className="text-[#9CA3AF]" />
              </Link>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
