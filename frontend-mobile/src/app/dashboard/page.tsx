"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import AppShell from "@/components/shell/AppShell";
import Card from "@/components/ui/Card";
import {
  members,
  firstTimers,
  secondTimers,
  newConverts,
  allEvents,
  urgentFollowUps,
} from "@/lib/mock-data";

function StatCard({ label, value, href, accent }: { label: string; value: number; href: string; accent: string }) {
  return (
    <Link href={href} className="press block">
      <div
        className="rounded-2xl border border-[#E5E7EB] bg-white p-4"
      >
        <p className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280]">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold text-[#0F172A]">
          {value.toLocaleString()}
        </p>
        <span className="mt-2 inline-block h-1 w-8 rounded-full" style={{ backgroundColor: accent }} />
      </div>
    </Link>
  );
}

export default function MobileDashboardPage() {
  const activeMembers = members.filter((m) => m.status !== "inactive").length;
  const upcomingEvents = allEvents.filter((e) => e.status === "Upcoming").length;
  const urgent = urgentFollowUps.slice(0, 3);

  return (
    <AppShell
      title="Good day 👋"
      subtitle="Here's what's happening today"
      topRight={
        <Link
          href="/notifications"
          className="press relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Link>
      }
    >
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Members" value={activeMembers} href="/members" accent="#000080" />
        <StatCard label="First Timers" value={firstTimers.length} href="/first-timers" accent="#B5B5F3" />
        <StatCard label="Second Timers" value={secondTimers.length} href="/second-timers" accent="#6366F1" />
        <StatCard label="New Converts" value={newConverts.length} href="/new-converts" accent="#10B981" />
      </div>

      {/* Urgent follow-up */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0F172A]">Urgent Follow-ups</h2>
          <Link href="/urgent-follow-up" className="text-xs font-semibold text-[#000080]">
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {urgent.map((u) => (
            <Card key={u.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#0F172A]">{u.name}</p>
                  <p className="truncate text-xs text-[#6B7280]">
                    {u.category} · {u.daysOverdue}d overdue
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    u.status === "Critical"
                      ? "bg-red-100 text-red-700"
                      : u.status === "Overdue"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {u.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming events */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0F172A]">Upcoming Events</h2>
          <Link href="/events" className="text-xs font-semibold text-[#000080]">
            {upcomingEvents} upcoming
          </Link>
        </div>
        <div className="space-y-2">
          {allEvents
            .filter((e) => e.status === "Upcoming")
            .slice(0, 3)
            .map((e) => (
              <Card key={e.id}>
                <p className="text-sm font-semibold text-[#0F172A]">{e.name}</p>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  {e.date} · {e.location}
                </p>
              </Card>
            ))}
        </div>
      </div>
    </AppShell>
  );
}
