"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, UserPlus, UserCheck, Star, Cake, Heart, PhoneCall } from "lucide-react";
import { useRouter } from "next/navigation";
import { urgentFollowUps, birthdayReminders } from "@/lib/mock-data";
import {
  getMembers,
  getEMembers,
  getFirstTimers,
  getSecondTimers,
  getNewConverts,
} from "@/lib/api";

const attendanceData = [
  { day: "Mar 16", value: 780 },
  { day: "Mar 23", value: 820 },
  { day: "Mar 30", value: 910 },
  { day: "Apr 6",  value: 855 },
  { day: "Apr 13", value: 890 },
  { day: "Apr 20", value: 892 },
];

interface KpiStats {
  members: number;
  eMembers: number;
  firstTimers: number;
  secondTimers: number;
  newConverts: number;
  loading: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const maxAttendance = Math.max(...attendanceData.map((d) => d.value));
  const topFollowUps = urgentFollowUps.slice(0, 5);
  const upcomingCelebrations = birthdayReminders.slice(0, 5);

  const [stats, setStats] = useState<KpiStats>({
    members: 0, eMembers: 0, firstTimers: 0, secondTimers: 0, newConverts: 0, loading: true,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [mem, emem, ft, st, nc] = await Promise.allSettled([
          getMembers(0, 1),
          getEMembers(0, 1),
          getFirstTimers(0, 1),
          getSecondTimers(0, 1),
          getNewConverts(0, 1),
        ]);
        setStats({
          members:      mem.status      === "fulfilled" ? (mem.value.totalElements      ?? 0) : 0,
          eMembers:     emem.status     === "fulfilled" ? (emem.value.totalElements     ?? 0) : 0,
          firstTimers:  ft.status       === "fulfilled" ? (ft.value.totalElements       ?? 0) : 0,
          secondTimers: st.status       === "fulfilled" ? (st.value.totalElements       ?? 0) : 0,
          newConverts:  nc.status       === "fulfilled" ? (nc.value.totalElements       ?? 0) : 0,
          loading: false,
        });
      } catch {
        setStats((s) => ({ ...s, loading: false }));
      }
    }
    loadStats();
  }, []);

  const totalPeople = stats.members + stats.eMembers + stats.firstTimers + stats.secondTimers + stats.newConverts;
  const totalGuests = stats.firstTimers + stats.secondTimers;

  const kpiCards = [
    {
      label: "Total Members",
      value: stats.loading ? "—" : stats.members.toLocaleString(),
      icon: Users,
      iconBg: "bg-[#EEF2FF]",
      iconColor: "text-[#000080]",
      href: "/user-management/members",
    },
    {
      label: "E-Members",
      value: stats.loading ? "—" : stats.eMembers.toLocaleString(),
      icon: UserCheck,
      iconBg: "bg-[#F0FDF4]",
      iconColor: "text-[#16A34A]",
      href: "/user-management/e-members",
    },
    {
      label: "Guests (First & Second Timers)",
      value: stats.loading ? "—" : totalGuests.toLocaleString(),
      icon: UserPlus,
      iconBg: "bg-[#FFF7ED]",
      iconColor: "text-[#EA580C]",
      href: "/user-management/first-timers",
    },
    {
      label: "New Converts",
      value: stats.loading ? "—" : stats.newConverts.toLocaleString(),
      icon: Star,
      iconBg: "bg-[#FDF4FF]",
      iconColor: "text-[#A21CAF]",
      href: "/user-management/new-converts",
    },
  ];

  const severityColor = (days: number) =>
    days >= 10 ? "bg-red-100 text-red-700" : days >= 5 ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-800";

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#000000]">Dashboard</h1>
          <p className="text-sm text-[#6B7280]">
            {stats.loading ? "Loading congregation data…" : `${totalPeople.toLocaleString()} total congregation records`}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={() => router.push(card.href)}
              className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border border-[#E5E7EB] text-left transition-shadow hover:shadow-md"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-[#111827]">{card.value}</p>
                <p className="text-xs text-[#6B7280] leading-tight mt-0.5">{card.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Urgent Follow-up */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-[#000080]" />
              <h2 className="text-base font-semibold text-[#111827]">Urgent Follow-up</h2>
            </div>
            <button
              onClick={() => router.push("/dashboard/urgent-follow-up")}
              className="text-sm font-medium text-[#000080] hover:underline"
            >
              View More
            </button>
          </div>
          <div className="space-y-3">
            {topFollowUps.map((f) => (
              <div key={f.id} className="flex items-start justify-between gap-3 rounded-lg border border-[#E5E7EB] p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#111827]">{f.name}</p>
                  <p className="text-xs text-[#6B7280]">{f.phone}</p>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    Assigned: <span className="text-[#374151]">{f.assignedOfficer}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${severityColor(f.daysOverdue)}`}>
                    {f.daysOverdue === 0 ? "Due today" : `${f.daysOverdue}d overdue`}
                  </span>
                  <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-medium text-[#374151]">
                    {f.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Overview */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-[#111827]">Last 6 Sundays Attendance</h2>
          <div className="flex h-56 items-end justify-between gap-2 px-1">
            {attendanceData.map((item) => (
              <div key={item.day} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[11px] font-medium text-[#374151]">{item.value}</span>
                <div
                  className="w-full rounded-t-md bg-[#000080] transition-all"
                  style={{ height: `${(item.value / maxAttendance) * 180}px` }}
                />
                <span className="text-[10px] text-[#6B7280] text-center">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Birthdays & Anniversaries Widget */}
      <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#111827]">Upcoming Birthdays &amp; Anniversaries</h2>
          <span className="text-xs font-medium text-[#6B7280]">Next 30 days</span>
        </div>
        <div className="space-y-3">
          {upcomingCelebrations.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] p-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.type === "Birthday" ? "bg-pink-100" : "bg-purple-100"}`}>
                  {item.type === "Birthday"
                    ? <Cake className="h-5 w-5 text-pink-600" />
                    : <Heart className="h-5 w-5 text-purple-600" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{item.name}</p>
                  {item.phone && <p className="text-xs text-[#6B7280]">{item.phone}</p>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${item.type === "Birthday" ? "bg-pink-100 text-pink-700" : "bg-purple-100 text-purple-700"}`}>
                  {item.type}
                </span>
                <span className="text-[11px] font-medium text-[#6B7280]">
                  {item.daysUntil === 0 ? "Today 🎉" : item.daysUntil === 1 ? "Tomorrow" : `In ${item.daysUntil} days`} · {item.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
