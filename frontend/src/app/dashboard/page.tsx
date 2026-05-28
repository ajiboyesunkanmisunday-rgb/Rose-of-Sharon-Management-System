"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Users,
  UserPlus,
  UserCheck,
  Star,
  Cake,
  Heart,
  PhoneCall,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getTotalMembersInPeriod,
  getTotalFirstTimersInPeriod,
  getTotalSecondTimersInPeriod,
  getTotalNewConvertsInPeriod,
  getUrgentFollowup,
  getPastServicesAttendance,
  getBirthdays,
  getWeddingAnniversaries,
  type UserResponse,
  type UserBasicResponse,
} from "@/lib/api";
import { SkeletonCard } from "@/components/ui/Skeleton";
import AttendanceChart, {
  type AttendanceItem,
} from "@/components/dashboard/AttendanceChart";

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
  const [attendanceData, setAttendanceData] = useState<AttendanceItem[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  const [stats, setStats] = useState<KpiStats>({
    activeMembers: 0,
    firstTimersMonth: 0,
    secondTimersMonth: 0,
    newConvertsMonth: 0,
    loading: true,
  });

  const [topFollowUps, setTopFollowUps] = useState<FollowUpItem[]>([]);
  const [followUpsLoading, setFollowUpsLoading] = useState(true);

  const [upcomingCelebrations, setUpcomingCelebrations] = useState<
    CelebrationItem[]
  >([]);
  const [celebrationsLoading, setCelebrationsLoading] = useState(true);

  useEffect(() => {
    const formatLabel = (raw: string, index: number) => {
      if (!raw) return `Service ${index + 1}`;
      const parsed = new Date(raw);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString("en-GB", {
          month: "short",
          day: "numeric",
        });
      }
      return raw;
    };

    getPastServicesAttendance()
      .then((res) => {
        const items = (res.columns ?? []).map((col, index) => ({
          day: formatLabel(col.feature, index),
          value: Number(col.totalCount ?? 0),
        }));
        setAttendanceData(items);
      })
      .catch(() => setAttendanceData([]))
      .finally(() => setAttendanceLoading(false));
  }, []);

  useEffect(() => {
    async function loadStats() {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      const startIso = monthStart.toISOString();
      const endIso = monthEnd.toISOString();

      try {
        // Active Members: Members + E-Members created within the period
        // (per /api/v1/users/total-created-members Swagger).
        // First/Second timers + New converts: this-month counts.
        const [active, ft, st, nc] = await Promise.allSettled([
          getTotalMembersInPeriod(startIso, endIso),
          getTotalFirstTimersInPeriod(startIso, endIso),
          getTotalSecondTimersInPeriod(startIso, endIso),
          getTotalNewConvertsInPeriod(startIso, endIso),
        ]);

        const activeTotal =
          active.status === "fulfilled" ? (active.value.totalCount ?? 0) : 0;
        const ftThisMonth =
          ft.status === "fulfilled" ? (ft.value.totalCount ?? 0) : 0;
        const stThisMonth =
          st.status === "fulfilled" ? (st.value.totalCount ?? 0) : 0;
        const ncThisMonth =
          nc.status === "fulfilled" ? (nc.value.totalCount ?? 0) : 0;

        setStats({
          activeMembers: activeTotal,
          firstTimersMonth: ftThisMonth,
          secondTimersMonth: stThisMonth,
          newConvertsMonth: ncThisMonth,
          loading: false,
        });
      } catch {
        setStats((s) => ({ ...s, loading: false }));
      }
    }
    loadStats();
  }, []);

  // Urgent follow-up — server-backed: /api/v1/users/urgent-followup returns
  // visitors who need attention without us having to filter locally.
  useEffect(() => {
    const toItem = (u: UserBasicResponse): FollowUpItem => ({
      id: u.id,
      name: [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" "),
      phone: u.phoneNumber ?? "",
      category: "Visitor",
      assignedOfficer: u.assignedFollowUp || "Unassigned",
    });
    getUrgentFollowup(0, 6)
      .then((res) => setTopFollowUps((res.content ?? []).map(toItem)))
      .catch(() => setTopFollowUps([]))
      .finally(() => setFollowUpsLoading(false));
  }, []);

  // Upcoming birthdays + anniversaries — next 30 days. Both endpoints take
  // day/month bounds (no year), so the wrap from late Dec into Jan works
  // naturally — we just pass the two day/month pairs and let the backend
  // handle it.
  useEffect(() => {
    const now = new Date();
    const future = new Date(now.getTime() + 30 * 86_400_000);
    const startDay = now.getDate();
    const startMonth = now.getMonth() + 1;
    const endDay = future.getDate();
    const endMonth = future.getMonth() + 1;

    const fmt = (day?: number, month?: number) => {
      if (!day || !month) return "—";
      const MONTHS = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${day} ${MONTHS[month - 1] ?? ""}`;
    };
    const toItem = (
      u: UserResponse,
      type: "Birthday" | "Anniversary",
    ): CelebrationItem => ({
      id: `${type}-${u.id}`,
      name: [u.firstName, u.lastName].filter(Boolean).join(" ") || "Unknown",
      type,
      date:
        type === "Birthday"
          ? fmt(u.dayOfBirth, u.monthOfBirth)
          : fmt(u.dayOfWedding, u.monthOfWedding),
    });

    Promise.allSettled([
      getBirthdays(startDay, startMonth, endDay, endMonth, 0, 10),
      getWeddingAnniversaries(startDay, startMonth, endDay, endMonth, 0, 10),
    ])
      .then(([bd, wa]) => {
        const bdItems =
          bd.status === "fulfilled"
            ? (bd.value.content ?? []).map((u) => toItem(u, "Birthday"))
            : [];
        const waItems =
          wa.status === "fulfilled"
            ? (wa.value.content ?? []).map((u) => toItem(u, "Anniversary"))
            : [];
        setUpcomingCelebrations([...bdItems, ...waItems].slice(0, 8));
      })
      .catch(() => setUpcomingCelebrations([]))
      .finally(() => setCelebrationsLoading(false));
  }, []);

  const monthLabel = new Date().toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });

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
      sublabel: monthLabel,
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
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">
            Dashboard
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">
            {stats.loading
              ? "Loading congregation data…"
              : `${stats.activeMembers.toLocaleString()} active members · ${monthLabel} snapshot`}
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
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
                  >
                    <Icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold text-[#111827] dark:text-slate-100">
                      {card.value}
                    </p>
                    <p className="text-xs font-semibold text-[#374151] dark:text-slate-300 leading-tight mt-0.5">
                      {card.label}
                    </p>
                    <p className="text-[11px] text-[#9CA3AF] dark:text-slate-500 leading-tight mt-0.5">
                      {card.sublabel}
                    </p>
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
              <h2 className="text-base font-semibold text-[#111827] dark:text-slate-100">
                Urgent Follow-up
              </h2>
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
                  <div
                    key={i}
                    className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 p-3 space-y-2"
                  >
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-3 w-24" />
                    <div className="skeleton h-3 w-40" />
                  </div>
                ))}
              </div>
            ) : topFollowUps.length === 0 ? (
              <p className="text-sm text-[#6B7280] dark:text-slate-400 text-center py-4">
                No urgent follow-ups.
              </p>
            ) : (
              topFollowUps.map((f) => (
                <div
                  key={f.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800/60 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#111827] dark:text-slate-100">
                      {f.name}
                    </p>
                    <p className="text-xs text-[#6B7280] dark:text-slate-400">
                      {f.phone}
                    </p>
                    <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">
                      Assigned:{" "}
                      <span className="text-[#374151] dark:text-slate-300">
                        {f.assignedOfficer}
                      </span>
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
        <AttendanceChart data={attendanceData} loading={attendanceLoading} />
      </div>

      {/* Birthdays & Anniversaries Widget */}
      <div className="mt-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm dark:shadow-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#111827] dark:text-slate-100">
            Upcoming Birthdays &amp; Anniversaries
          </h2>
          <span className="text-xs font-medium text-[#6B7280] dark:text-slate-400">
            Next 30 days
          </span>
        </div>
        <div className="space-y-3">
          {celebrationsLoading ? (
            <p className="text-sm text-[#6B7280] dark:text-slate-400 text-center py-4">
              Loading…
            </p>
          ) : upcomingCelebrations.length === 0 ? (
            <p className="text-sm text-[#6B7280] dark:text-slate-400 text-center py-4">
              No celebrations in the next 30 days.
            </p>
          ) : (
            upcomingCelebrations.map((item) => {
              const isBirthday = item.type === "Birthday";
              const Icon = isBirthday ? Cake : Heart;
              const iconBg = isBirthday
                ? "bg-pink-100 dark:bg-pink-900/30"
                : "bg-rose-100 dark:bg-rose-900/30";
              const iconColor = isBirthday
                ? "text-pink-600 dark:text-pink-400"
                : "text-rose-600 dark:text-rose-400";
              const pillStyle = isBirthday
                ? "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400"
                : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400";
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800/60 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg}`}
                    >
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111827] dark:text-slate-100">
                        {item.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${pillStyle}`}
                    >
                      {item.type}
                    </span>
                    <span className="text-[11px] font-medium text-[#6B7280] dark:text-slate-400">
                      {item.date}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
