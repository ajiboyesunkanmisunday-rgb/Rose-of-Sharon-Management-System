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
  Trophy,
  Crown,
  Timer,
  ChevronRight,
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
  getFaceOfTheMonths,
  getFaceOfTheMonth,
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

// ─── Local types for Face of the Month widget ─────────────────────────────────
interface FotmWinner {
  winnerPhotoUrl?: string;
  winnerName: string;
  categoryName?: string;
  totalVotes?: number;
  month: number;
  year: number;
}

interface FotmActiveCycle {
  title: string;
  votingEndDate?: string;
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

  const [faceOfMonth, setFaceOfMonth]       = useState<FotmWinner | null>(null);
  const [activeVoting, setActiveVoting]     = useState<FotmActiveCycle | null>(null);
  const [faceLoading, setFaceLoading]       = useState(true);

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

  // Face of the Month — fetch recent events, find winner + active voting period
  useEffect(() => {
    setFaceLoading(true);
    getFaceOfTheMonths(0, 10)
      .then(async (page) => {
        const now = Date.now();
        const events = page.content ?? [];

        // Find an event currently in its voting window
        const active = events.find((e) => {
          if (!e.votingStartTime || !e.votingEndTime) return false;
          const start = new Date(e.votingStartTime).getTime();
          const end   = new Date(e.votingEndTime).getTime();
          return start <= now && now < end;
        });
        if (active) {
          setActiveVoting({ title: active.title, votingEndDate: active.votingEndTime });
        }

        // Find the most recently completed event (past votingEndTime) — fetch full
        // details to get nominee vote counts and pick the winner.
        const completed = events.filter(
          (e) => e.votingEndTime && new Date(e.votingEndTime).getTime() < now,
        );
        if (completed.length > 0) {
          // Sort descending by end time and take the most recent
          completed.sort(
            (a, b) => new Date(b.votingEndTime!).getTime() - new Date(a.votingEndTime!).getTime(),
          );
          try {
            const detail = await getFaceOfTheMonth(completed[0].id);
            if (detail.nominees.length > 0) {
              const winner = [...detail.nominees].sort(
                (a, b) => (b.voteCount ?? 0) - (a.voteCount ?? 0),
              )[0];
              const endDate = new Date(detail.votingEndTime ?? completed[0].votingEndTime ?? "");
              setFaceOfMonth({
                winnerPhotoUrl: winner.profilePictureUrl,
                winnerName: [winner.firstName, winner.middleName, winner.lastName].filter(Boolean).join(" "),
                categoryName: "Face of the Month",
                totalVotes: detail.nominees.reduce((sum, n) => sum + (n.voteCount ?? 0), 0),
                month: endDate.getMonth() + 1,
                year: endDate.getFullYear(),
              });
            }
          } catch {
            // Non-critical — widget shows empty state
          }
        }
      })
      .catch(() => {})
      .finally(() => setFaceLoading(false));
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

      {/* ── Face of the Month ─────────────────────────────────────────────── */}
      <FaceOfTheMonthWidget
        loading={faceLoading}
        winner={faceOfMonth}
        activeCycle={activeVoting}
        onViewAll={() => router.push("/voting/hall-of-fame")}
        onManage={() => router.push("/voting")}
      />
    </DashboardLayout>
  );
}

// ─── Face of the Month Widget ─────────────────────────────────────────────────
const MONTHS_FULL = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function FaceOfTheMonthWidget({
  loading,
  winner,
  activeCycle,
  onViewAll,
  onManage,
}: {
  loading: boolean;
  winner: FotmWinner | null;
  activeCycle: FotmActiveCycle | null;
  onViewAll: () => void;
  onManage: () => void;
}) {
  const [countdown, setCountdown] = useState("");

  // Live countdown for active voting cycle
  useEffect(() => {
    if (!activeCycle?.votingEndDate) { setCountdown(""); return; }
    const tick = () => {
      const diff = new Date(activeCycle.votingEndDate!).getTime() - Date.now();
      if (diff <= 0) { setCountdown("Closed"); return; }
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      setCountdown(d > 0 ? `${d}d ${h}h remaining` : `${h}h ${m}m remaining`);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [activeCycle]);

  const monthYear = (cycle: FotmWinner) =>
    `${MONTHS_FULL[(cycle.month ?? 1) - 1] ?? ""} ${cycle.year ?? ""}`;

  return (
    <div className="mt-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm dark:shadow-slate-900">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FEF9C3] dark:bg-yellow-900/30">
            <Crown className="h-5 w-5 text-[#CA8A04] dark:text-yellow-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#111827] dark:text-slate-100">
              Face of the Month
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400">Monthly recognition spotlight</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onManage}
            className="text-xs font-medium text-[#6B7280] dark:text-slate-400 hover:text-[#000080] dark:hover:text-indigo-400 transition-colors"
          >
            Manage
          </button>
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-sm font-medium text-[#000080] dark:text-indigo-400 hover:underline"
          >
            Hall of Fame
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {loading ? (
        /* Skeleton */
        <div className="flex gap-6">
          <div className="skeleton h-28 w-28 rounded-full shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="skeleton h-5 w-40" />
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-3 w-32" />
          </div>
        </div>
      ) : activeCycle ? (
        /* Voting in Progress */
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] dark:bg-green-900/20 ring-4 ring-[#DCFCE7] dark:ring-green-900/40">
            <Trophy className="h-10 w-10 text-[#16A34A] dark:text-green-400" />
          </div>
          <div className="flex-1">
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] dark:bg-green-900/20 px-3 py-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#16A34A] dark:bg-green-400" />
              <span className="text-xs font-semibold text-[#16A34A] dark:text-green-400">Voting Open</span>
            </div>
            <h3 className="mt-1.5 text-lg font-bold text-[#111827] dark:text-slate-100">
              {activeCycle.title}
            </h3>
            <p className="text-sm text-[#6B7280] dark:text-slate-400">
              {activeCycle.votingEndDate
                ? new Date(activeCycle.votingEndDate).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
                : ""}
            </p>
            {countdown && (
              <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#CA8A04] dark:text-yellow-400">
                <Timer className="h-4 w-4" />
                {countdown}
              </div>
            )}
            <button
              onClick={onManage}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#000080] px-4 py-2 text-sm font-medium text-white hover:bg-[#000066] transition-colors"
            >
              View Results
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : winner ? (
        /* Latest Winner */
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* Winner Photo */}
          <div className="relative shrink-0">
            {winner.winnerPhotoUrl ? (
              <img
                src={winner.winnerPhotoUrl}
                alt={winner.winnerName ?? "Winner"}
                className="h-28 w-28 rounded-full object-cover ring-4 ring-[#FEF9C3] dark:ring-yellow-900/40"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#FEF9C3] to-[#FDE68A] dark:from-yellow-900/30 dark:to-yellow-800/20 ring-4 ring-[#FEF9C3] dark:ring-yellow-900/40 text-3xl font-bold text-[#CA8A04] dark:text-yellow-400">
                {(winner.winnerName ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
            {/* Crown badge */}
            <div className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#CA8A04] shadow-md">
              <Crown className="h-4 w-4 text-white" />
            </div>
          </div>

          {/* Winner Info */}
          <div className="flex-1">
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#FEF9C3] dark:bg-yellow-900/20 px-3 py-1">
              <Star className="h-3 w-3 text-[#CA8A04] dark:text-yellow-400 fill-[#CA8A04]" />
              <span className="text-xs font-semibold text-[#CA8A04] dark:text-yellow-400">
                {monthYear(winner)}
              </span>
            </div>
            <h3 className="mt-1.5 text-xl font-bold text-[#111827] dark:text-slate-100">
              {winner.winnerName ?? "—"}
            </h3>
            <p className="text-sm text-[#6B7280] dark:text-slate-400">
              {winner.categoryName ?? "Face of the Month"}
            </p>
            {winner.totalVotes != null && winner.totalVotes > 0 && (
              <p className="mt-1 text-xs text-[#9CA3AF] dark:text-slate-500">
                {winner.totalVotes.toLocaleString()} total votes
              </p>
            )}
            <button
              onClick={onViewAll}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-2 text-sm font-medium text-[#374151] dark:text-slate-300 hover:border-[#000080] hover:text-[#000080] dark:hover:text-indigo-400 transition-colors"
            >
              View All Winners
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* No active cycle or winner yet */
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F4F6] dark:bg-slate-700">
            <Trophy className="h-8 w-8 text-[#D1D5DB] dark:text-slate-500" />
          </div>
          <p className="mt-3 text-sm font-medium text-[#374151] dark:text-slate-300">No active voting cycle</p>
          <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">Start a new cycle to recognize a member</p>
          <button
            onClick={onManage}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#000080] px-4 py-2 text-sm font-medium text-white hover:bg-[#000066] transition-colors"
          >
            Start New Cycle
          </button>
        </div>
      )}
    </div>
  );
}
