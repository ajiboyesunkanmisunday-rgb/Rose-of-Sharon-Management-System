"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, UserPlus, UserCheck, Star, Cake, PhoneCall } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getMembers,
  getEMembers,
  getTotalFirstTimersInPeriod,
  getTotalSecondTimersInPeriod,
  getTotalNewConvertsInPeriod,
  getFirstTimers,
  getSecondTimers,
  getCelebrations,
  type UserResponse,
} from "@/lib/api";
import { SkeletonCard } from "@/components/ui/Skeleton";

const attendanceData = [
  { day: "Mar 16", value: 780 },
  { day: "Mar 23", value: 820 },
  { day: "Mar 30", value: 910 },
  { day: "Apr 6",  value: 855 },
  { day: "Apr 13", value: 890 },
  { day: "Apr 20", value: 892 },
];

interface KpiStats {
  activeMembers: number;
  firstTimersMonth: number;
  secondTimersMonth: number;
  newConvertsMonth: number;
  loading: boolean;
}

interface FollowUpItem {
  id: string;
  name: string;
  phone: string;
  category: string;
  assignedOfficer: string;
}

interface CelebrationItem {
  id: string;
  name: string;
  type: string;
  date: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const maxAttendance = Math.max(...attendanceData.map((d) => d.value));

  const [stats, setStats] = useState<KpiStats>({
    activeMembers: 0, firstTimersMonth: 0, secondTimersMonth: 0, newConvertsMonth: 0, loading: true,
  });

  const [topFollowUps, setTopFollowUps] = useState<FollowUpItem[]>([]);
  const [followUpsLoading, setFollowUpsLoading] = useState(true);

  const [upcomingCelebrations, setUpcomingCelebrations] = useState<CelebrationItem[]>([]);
  const [celebrationsLoading, setCelebrationsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const startIso   = monthStart.toISOString();
      const endIso     = monthEnd.toISOString();

      try {
        // Use the same API pattern as Church Directory for accurate counts:
        // - Members + E-Members: totalElements from paginated response
        // - First/Second timers this month: dedicated period-count endpoints
        // - New converts this month: dedicated period-count endpoint
        const [mem, emem, ft, st, nc] = await Promise.allSettled([
          getMembers(0, 1),
          getEMembers(0, 1),
          getTotalFirstTimersInPeriod(startIso, endIso),
          getTotalSecondTimersInPeriod(startIso, endIso),
          getTotalNewConvertsInPeriod(startIso, endIso),
        ]);

        const membersTotal  = mem.status  === "fulfilled" ? (mem.value.totalElements  ?? 0) : 0;
        const eMembersTotal = emem.status === "fulfilled" ? (emem.value.totalElements ?? 0) : 0;
        const ftThisMonth   = ft.status   === "fulfilled" ? (ft.value.totalCount  ?? 0) : 0;
        const stThisMonth   = st.status   === "fulfilled" ? (st.value.totalCount  ?? 0) : 0;
        const ncThisMonth   = nc.status   === "fulfilled" ? (nc.value.totalCount  ?? 0) : 0;

        setStats({
          activeMembers:     membersTotal + eMembersTotal,
          firstTimersMonth:  ftThisMonth,
          secondTimersMonth: stThisMonth,
          newConvertsMonth:  ncThisMonth,
          loading: false,
        });
      } catch {
        setStats((s) => ({ ...s, loading: false }));
      }
    }
    loadStats();
  }, []);

  // Load first-timers AND second-timers with noOfCalls === 0 for urgent follow-up
  useEffect(() => {
    setFollowUpsLoading(true);
    const toItem = (u: UserResponse, category: string): FollowUpItem => {
      const name = [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ");
      const af = u.assignedFollowUp;
      return {
        id: u.id,
        name,
        phone: u.phoneNumber ?? "",
        category,
        assignedOfficer: af ? [af.firstName, af.lastName].filter(Boolean).join(" ") : "Unassigned",
      };
    };
    Promise.allSettled([getFirstTimers(0, 20), getSecondTimers(0, 20)])
      .then(([ft, st]) => {
        const ftItems = ft.status === "fulfilled"
          ? (ft.value.content ?? []).filter((u) => (u.noOfCalls ?? 0) === 0).map((u) => toItem(u, "First Timer"))
          : [];
        const stItems = st.status === "fulfilled"
          ? (st.value.content ?? []).filter((u) => (u.noOfCalls ?? 0) === 0).map((u) => toItem(u, "Second Timer"))
          : [];
        setTopFollowUps([...ftItems, ...stItems].slice(0, 6));
      })
      .catch(() => setTopFollowUps([]))
      .finally(() => setFollowUpsLoading(false));
  }, []);

  // Load birthday celebrations this week
  useEffect(() => {
    setCelebrationsLoading(true);
    getCelebrations(0, 20)
      .then((res) => {
        const items: CelebrationItem[] = (res.content ?? [])
          .filter((c) => c.celebrationType === "BIRTHDAY")
          .slice(0, 5)
          .map((c) => {
            const req = c.requester;
            const name = req
              ? [req.firstName, req.lastName].filter(Boolean).join(" ")
              : "Unknown";
            const dateStr = c.date
              ? new Date(c.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
              : "—";
            return {
              id: c.id,
              name,
              type: "Birthday",
              date: dateStr,
            };
          });
        setUpcomingCelebrations(items);
      })
      .catch(() => setUpcomingCelebrations([]))
      .finally(() => setCelebrationsLoading(false));
  }, []);

  const monthLabel = new Date().toLocaleString("en-GB", { month: "long", year: "numeric" });

  const kpiCards = [
    {
      label: "First Timers",
      sublabel: monthLabel,
      value: stats.loading ? "—" : stats.firstTimersMonth.toLocaleString(),
      icon: UserPlus,
      iconBg: "bg-[#FFF7ED] dark:bg-orange-900/30",
      iconColor: "text-[#EA580C] dark:text-orange-400",
      href: "/user-management/first-timers",
    },
    {
      label: "Second Timers",
      sublabel: monthLabel,
      value: stats.loading ? "—" : stats.secondTimersMonth.toLocaleString(),
      icon: UserCheck,
      iconBg: "bg-[#F0FDF4] dark:bg-green-900/30",
      iconColor: "text-[#16A34A] dark:text-green-300",
      href: "/user-management/second-timers",
    },
    {
      label: "New Converts",
      sublabel: monthLabel,
      value: stats.loading ? "—" : stats.newConvertsMonth.toLocaleString(),
      icon: Star,
      iconBg: "bg-[#FDF4FF] dark:bg-purple-900/30",
      iconColor: "text-[#A21CAF] dark:text-purple-400",
      href: "/user-management/new-converts",
    },
    {
      label: "Active Members",
      sublabel: "Members + E-Members",
      value: stats.loading ? "—" : stats.activeMembers.toLocaleString(),
      icon: Users,
      iconBg: "bg-[#EEF2FF] dark:bg-indigo-900/30",
      iconColor: "text-[#000080] dark:text-indigo-400",
      href: "/user-management/members",
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Dashboard</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">
            {stats.loading ? "Loading congregation data…" : `${stats.activeMembers.toLocaleString()} active members · ${monthLabel} snapshot`}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : kpiCards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.label}
                  onClick={() => router.push(card.href)}
                  className="flex items-center gap-4 rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm dark:shadow-slate-900 border border-[#E5E7EB] dark:border-slate-700 text-left transition-all hover:shadow-md dark:hover:shadow-slate-900 hover:border-[#000080]/20 dark:hover:border-indigo-700"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                    <Icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold text-[#111827] dark:text-slate-100">{card.value}</p>
                    <p className="text-xs font-semibold text-[#374151] dark:text-slate-300 leading-tight mt-0.5">{card.label}</p>
                    <p className="text-[11px] text-[#9CA3AF] dark:text-slate-500 leading-tight mt-0.5">{card.sublabel}</p>
                  </div>
                </button>
              );
            })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Urgent Follow-up */}
        <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm dark:shadow-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-[#000080] dark:text-indigo-400" />
              <h2 className="text-base font-semibold text-[#111827] dark:text-slate-100">Urgent Follow-up</h2>
            </div>
            <button
              onClick={() => router.push("/dashboard/urgent-follow-up")}
              className="text-sm font-medium text-[#000080] dark:text-indigo-400 hover:underline"
            >
              View More
            </button>
          </div>
          <div className="space-y-3">
            {followUpsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 p-3 space-y-2">
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-3 w-24" />
                    <div className="skeleton h-3 w-40" />
                  </div>
                ))}
              </div>
            ) : topFollowUps.length === 0 ? (
              <p className="text-sm text-[#6B7280] dark:text-slate-400 text-center py-4">No urgent follow-ups.</p>
            ) : (
              topFollowUps.map((f) => (
                <div key={f.id} className="flex items-start justify-between gap-3 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800/60 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#111827] dark:text-slate-100">{f.name}</p>
                    <p className="text-xs text-[#6B7280] dark:text-slate-400">{f.phone}</p>
                    <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">
                      Assigned: <span className="text-[#374151] dark:text-slate-300">{f.assignedOfficer}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                      Not called
                    </span>
                    <span className="rounded-full bg-[#F3F4F6] dark:bg-slate-700 px-2 py-0.5 text-[11px] font-medium text-[#374151] dark:text-slate-300">
                      {f.category}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Attendance Overview */}
        <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm dark:shadow-slate-900">
          <div className="mb-4 flex items-start justify-between gap-2">
            <h2 className="text-base font-semibold text-[#111827] dark:text-slate-100">Last 6 Sundays Attendance</h2>
            <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
              Sample data
            </span>
          </div>
          <div className="flex h-56 items-end justify-between gap-2 px-1">
            {attendanceData.map((item) => (
              <div key={item.day} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[11px] font-medium text-[#374151] dark:text-slate-300">{item.value}</span>
                <div
                  className="w-full rounded-t-md bg-[#000080] dark:bg-indigo-600 transition-all"
                  style={{ height: `${(item.value / maxAttendance) * 180}px` }}
                />
                <span className="text-[10px] text-[#6B7280] dark:text-slate-400 text-center">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Birthdays & Anniversaries Widget */}
      <div className="mt-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm dark:shadow-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#111827] dark:text-slate-100">Upcoming Birthdays &amp; Anniversaries</h2>
          <span className="text-xs font-medium text-[#6B7280] dark:text-slate-400">This week</span>
        </div>
        <div className="space-y-3">
          {celebrationsLoading ? (
            <p className="text-sm text-[#6B7280] dark:text-slate-400 text-center py-4">Loading…</p>
          ) : upcomingCelebrations.length === 0 ? (
            <p className="text-sm text-[#6B7280] dark:text-slate-400 text-center py-4">No celebrations found.</p>
          ) : (
            upcomingCelebrations.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800/60 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/30">
                    <Cake className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827] dark:text-slate-100">{item.name}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400">
                    {item.type}
                  </span>
                  <span className="text-[11px] font-medium text-[#6B7280] dark:text-slate-400">{item.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
