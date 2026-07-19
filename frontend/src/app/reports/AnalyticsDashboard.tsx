"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import {
  getMembers, getEMembers, getFirstTimers, getSecondTimers,
  getNewConverts, getAllGroups, getTestimonies, getCelebrations, getEvents,
  getTotalMembers, getTotalMembersInPeriod, getTotalFirstTimersInPeriod,
  getTotalSecondTimersInPeriod, getTotalNewConvertsInPeriod,
  getVisitingVsNotVisiting, getServiceSectionsStats, getMediumOfInvitationStats,
  getFirstTimerToSecondTimerRate, getFirstTimerToMemberRate, getFollowupAttentionRate,
  getPastServicesAttendance, getTotalSpecialEvents,
  type UserResponse, type NewConvertResponse, type GroupResponse,
  type CountStatisticsResponse, type FeatureStatResponse, type UserBasicResponse,
  type PercentStatisticsResponse, type PastServicesAttendanceResponse,
} from "@/lib/api";
import { RefreshCw, Calendar, AlertTriangle } from "lucide-react";

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  navy:    "#000080",
  blue:    "#3B82F6",
  green:   "#16A34A",
  orange:  "#EA580C",
  purple:  "#9333EA",
  pink:    "#DB2777",
  teal:    "#0891B2",
  amber:   "#D97706",
  red:     "#DC2626",
  indigo:  "#6366F1",
  lime:    "#65A30D",
  rose:    "#F43F5E",
};

const TYPE_COLORS: Record<string, string> = {
  "Members":       C.navy,
  "E-Members":     C.green,
  "First Timers":  C.orange,
  "Second Timers": C.purple,
  "New Converts":  C.pink,
};

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Helpers ────────────────────────────────────────────────────────────────
async function fetchAll<T>(
  fetcher: (p: number, s: number) => Promise<{ content?: T[]; totalPages?: number }>,
  size = 200,
): Promise<T[]> {
  const first  = await fetcher(0, size);
  const rows   = [...(first.content ?? [])];
  const total  = Math.min(first.totalPages ?? 1, 15);
  if (total > 1) {
    const rest = await Promise.all(
      Array.from({ length: total - 1 }, (_, i) => fetcher(i + 1, size))
    );
    rest.forEach((r) => rows.push(...(r.content ?? [])));
  }
  return rows;
}

function isThisMonth(dateStr?: string) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isThisYear(dateStr?: string) {
  if (!dateStr) return false;
  return new Date(dateStr).getFullYear() === new Date().getFullYear();
}

function countByMonth(items: { createdOn?: string }[]): number[] {
  const counts = Array(12).fill(0);
  items.forEach((it) => {
    if (it.createdOn) counts[new Date(it.createdOn).getMonth()]++;
  });
  return counts;
}

function countBirthMonths(users: UserResponse[]): number[] {
  const counts = Array(12).fill(0);
  users.forEach((u) => { if (u.monthOfBirth) counts[u.monthOfBirth - 1]++; });
  return counts;
}

function countWeddingMonths(users: UserResponse[]): number[] {
  const counts = Array(12).fill(0);
  users.forEach((u) => { if (u.monthOfWedding) counts[u.monthOfWedding - 1]++; });
  return counts;
}

function countByService(users: UserResponse[], field: "firstTimeService" | "secondTimeService") {
  const map: Record<string, number> = {};
  users.forEach((u) => {
    const svc = u[field];
    if (!svc) return;
    // firstTimeService / secondTimeService is an EventResponse object
    const label = (typeof svc === "object" && svc !== null)
      ? ((svc as { title?: string; eventCategory?: string }).eventCategory ?? (svc as { title?: string }).title ?? "Unknown")
      : String(svc);
    if (label) map[label] = (map[label] ?? 0) + 1;
  });
  return Object.entries(map).map(([name, count]) => ({ name, count }));
}

function countGender(users: UserResponse[]) {
  let male = 0, female = 0, unknown = 0;
  users.forEach((u) => {
    if (u.sex === "MALE")   male++;
    else if (u.sex === "FEMALE") female++;
    else unknown++;
  });
  return [
    { name: "Male",    value: male,    color: C.navy  },
    { name: "Female",  value: female,  color: C.pink  },
    ...(unknown > 0 ? [{ name: "Unknown", value: unknown, color: "#9CA3AF" }] : []),
  ];
}

function countByStage(converts: NewConvertResponse[]) {
  const map: Record<string, number> = {
    "Not Started": 0,
    "Class 1": 0,
    "Class 2": 0,
    "Class 3": 0,
  };
  converts.forEach((c) => {
    const stage = c.believerClassStage ?? "Not Started";
    const label = stage === "CLASS_1" ? "Class 1"
                : stage === "CLASS_2" ? "Class 2"
                : stage === "CLASS_3" ? "Class 3"
                : "Not Started";
    map[label] = (map[label] ?? 0) + 1;
  });
  return Object.entries(map).map(([name, count]) => ({ name, count }));
}

function countByFavouriteParts(users: UserResponse[]) {
  const map: Record<string, number> = {};
  users.forEach((u) => {
    if (!u.favouriteParts) return;
    const parts = u.favouriteParts.split(/[,;|]+/).map((s) => s.trim()).filter(Boolean);
    parts.forEach((p) => { map[p] = (map[p] ?? 0) + 1; });
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name: name.length > 20 ? name.slice(0, 18) + "…" : name, count }));
}

function countVisiting(users: UserResponse[]) {
  let visiting = 0, notVisiting = 0;
  users.forEach((u) => {
    if (u.isVisiting === true) visiting++;
    else notVisiting++;
  });
  return [
    { name: "Came first time & indicated they are visiting",     value: visiting,    color: C.orange },
    { name: "Came first time but did NOT indicate they are visiting", value: notVisiting, color: C.navy   },
  ];
}

function countHowDidYouHear(users: UserResponse[]) {
  const map: Record<string, number> = {};
  users.forEach((u) => {
    if (!u.howDidYouHear) return;
    const key = u.howDidYouHear.trim();
    if (key) map[key] = (map[key] ?? 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name: name.length > 22 ? name.slice(0, 20) + "…" : name, count }));
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color = C.navy }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="mt-1 text-xs text-[#9CA3AF] dark:text-slate-400">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children, className = "" }: {
  title: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm ${className}`}>
      <h3 className="mb-4 text-sm font-bold text-[#111827] dark:text-slate-100">{title}</h3>
      {children}
    </div>
  );
}

const TOOLTIP_STYLE = {
  contentStyle: { borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 },
};

// ─── Helper: default date range (current month) ─────────────────────────────
function isoDate(d: Date) { return d.toISOString().split("T")[0]; }
function defaultRange() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: isoDate(start), end: isoDate(end) };
}

interface ServerStats {
  totalMembers: number;
  membersInPeriod: number;
  firstTimersInPeriod: number;
  secondTimersInPeriod: number;
  newConvertsInPeriod: number;
  visiting: FeatureStatResponse | null;
  service: FeatureStatResponse | null;
  invitation: FeatureStatResponse | null;
  urgentFollowup: never[];
  urgentTotal: number;
  ftToStRate: PercentStatisticsResponse | null;
  ftToMemRate: PercentStatisticsResponse | null;
  followupAttentionRate: PercentStatisticsResponse | null;
  pastServicesAttendance: PastServicesAttendanceResponse | null;
  totalSpecialEvents: number;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // Server-side analytics
  const { start: defStart, end: defEnd } = defaultRange();
  const [startDate,   setStartDate]   = useState(defStart);
  const [endDate,     setEndDate]     = useState(defEnd);
  const [svrLoading,  setSvrLoading]  = useState(false);
  const [svrError,    setSvrError]    = useState("");
  const [svrStats,    setSvrStats]    = useState<ServerStats | null>(null);

  // Raw data
  const [members,      setMembers]      = useState<UserResponse[]>([]);
  const [eMembers,     setEMembers]     = useState<UserResponse[]>([]);
  const [firstTimers,  setFirstTimers]  = useState<UserResponse[]>([]);
  const [secondTimers, setSecondTimers] = useState<UserResponse[]>([]);
  const [converts,     setConverts]     = useState<NewConvertResponse[]>([]);
  const [groups,       setGroups]       = useState<GroupResponse[]>([]);
  const [testimonies,  setTestimonies]  = useState<{ createdOn?: string }[]>([]);
  const [celebrations, setCelebrations] = useState<{ createdOn?: string }[]>([]);
  const [eventCount,   setEventCount]   = useState(0);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [mem, emem, ft, st, conv, grps, test, celeb, evts] = await Promise.all([
        fetchAll((p, s) => getMembers(p, s)).catch(() => []),
        fetchAll((p, s) => getEMembers(p, s)).catch(() => []),
        fetchAll((p, s) => getFirstTimers(p, s)).catch(() => []),
        fetchAll((p, s) => getSecondTimers(p, s)).catch(() => []),
        (fetchAll((p, s) => getNewConverts(p, s)) as Promise<NewConvertResponse[]>).catch(() => []),
        getAllGroups().catch(() => []),
        fetchAll((p, s) => getTestimonies(p, s)).catch(() => []),
        fetchAll((p, s) => getCelebrations(p, s)).catch(() => []),
        fetchAll((p, s) => getEvents(p, s)).catch(() => []),
      ]);
      setMembers(mem as UserResponse[]);
      setEMembers(emem as UserResponse[]);
      setFirstTimers(ft as UserResponse[]);
      setSecondTimers(st as UserResponse[]);
      setConverts(conv as NewConvertResponse[]);
      setGroups(grps);
      setTestimonies(test as { createdOn?: string }[]);
      setCelebrations(celeb as { createdOn?: string }[]);
      setEventCount((evts as { createdOn?: string }[]).filter((e) => isThisYear(e.createdOn)).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  const loadServerStats = async (from: string, to: string) => {
    setSvrLoading(true);
    setSvrError("");
    // ISO-8601 datetimes expected by backend
    const startTime = `${from}T00:00:00`;
    const endTime   = `${to}T23:59:59`;
    try {
      const [
        totMem, memPeriod, ftPeriod, stPeriod, ncPeriod,
        visiting, service, invitation,
        ftToSt, ftToMem, followupRate, pastSvcAtt, specEvents,
      ] = await Promise.all([
        getTotalMembers().catch((): CountStatisticsResponse => ({ totalCount: 0 })),
        getTotalMembersInPeriod(startTime, endTime).catch((): CountStatisticsResponse => ({ totalCount: 0 })),
        getTotalFirstTimersInPeriod(startTime, endTime).catch((): CountStatisticsResponse => ({ totalCount: 0 })),
        getTotalSecondTimersInPeriod(startTime, endTime).catch((): CountStatisticsResponse => ({ totalCount: 0 })),
        getTotalNewConvertsInPeriod(startTime, endTime).catch((): CountStatisticsResponse => ({ totalCount: 0 })),
        getVisitingVsNotVisiting(startTime, endTime).catch((): FeatureStatResponse => ({ columns: [] })),
        getServiceSectionsStats(startTime, endTime).catch((): FeatureStatResponse => ({ columns: [] })),
        getMediumOfInvitationStats(startTime, endTime).catch((): FeatureStatResponse => ({ columns: [] })),
        getFirstTimerToSecondTimerRate(startTime, endTime).catch((): PercentStatisticsResponse => ({ totalPercent: 0 })),
        getFirstTimerToMemberRate(startTime, endTime).catch((): PercentStatisticsResponse => ({ totalPercent: 0 })),
        getFollowupAttentionRate(startTime, endTime).catch((): PercentStatisticsResponse => ({ totalPercent: 0 })),
        getPastServicesAttendance().catch((): PastServicesAttendanceResponse => ({ columns: [] })),
        getTotalSpecialEvents(startTime, endTime).catch((): CountStatisticsResponse => ({ totalCount: 0 })),
      ]);
      setSvrStats({
        totalMembers:         totMem.totalCount,
        membersInPeriod:      memPeriod.totalCount,
        firstTimersInPeriod:  ftPeriod.totalCount,
        secondTimersInPeriod: stPeriod.totalCount,
        newConvertsInPeriod:  ncPeriod.totalCount,
        visiting:   visiting.columns.length   ? visiting   : null,
        service:    service.columns.length    ? service    : null,
        invitation: invitation.columns.length ? invitation : null,
        urgentFollowup: [],
        urgentTotal:    0,
        ftToStRate:   ftToSt,
        ftToMemRate:  ftToMem,
        followupAttentionRate: followupRate,
        pastServicesAttendance: pastSvcAtt.columns.length ? pastSvcAtt : null,
        totalSpecialEvents: specEvents.totalCount,
      });
    } catch (err) {
      setSvrError(err instanceof Error ? err.message : "Failed to load server stats.");
    } finally {
      setSvrLoading(false);
    }
  };

  useEffect(() => { load(); loadServerStats(startDate, endDate); }, []);

  // ── Derived data ──────────────────────────────────────────────────────────

  // 1. New joiners this month by type
  const newJoinersThisMonth = [
    { name: "Members",       count: members.filter((u) => isThisMonth(u.createdOn)).length,      fill: C.navy    },
    { name: "E-Members",     count: eMembers.filter((u) => isThisMonth(u.createdOn)).length,     fill: C.green   },
    { name: "First Timers",  count: firstTimers.filter((u) => isThisMonth(u.createdOn)).length,  fill: C.orange  },
    { name: "Second Timers", count: secondTimers.filter((u) => isThisMonth(u.createdOn)).length, fill: C.purple  },
    { name: "New Converts",  count: converts.filter((u) => isThisMonth(u.createdOn)).length,     fill: C.pink    },
  ];

  // 2. Group membership
  const groupData = groups
    .filter((g) => (g.totalMembers ?? 0) > 0)
    .sort((a, b) => (b.totalMembers ?? 0) - (a.totalMembers ?? 0))
    .slice(0, 12)
    .map((g) => ({ name: g.name.length > 16 ? g.name.slice(0, 14) + "…" : g.name, Members: g.totalMembers ?? 0 }));

  // 3. Conversion rates (2 bars)
  const totalFT  = firstTimers.length;
  const totalST  = secondTimers.length;
  const totalMem = members.length;
  const convRate = totalFT > 0 ? ((totalMem / totalFT) * 100).toFixed(1) : "0.0";
  const ftToStRate  = totalFT  > 0 ? +((totalST  / totalFT)  * 100).toFixed(1) : 0;
  const stToMemRate = totalST  > 0 ? +((totalMem / totalST)  * 100).toFixed(1) : 0;
  const conversionRateData = [
    { name: "First Timer → Second Timer", rate: ftToStRate,  fill: C.orange },
    { name: "Second Timer → Full Member", rate: stToMemRate, fill: C.navy   },
  ];

  // 4. Gender breakdown — all users combined
  const allUsers = [...members, ...eMembers, ...firstTimers, ...secondTimers];
  const genderData = countGender(allUsers);

  // 5 & 6. First/Second timers by service
  const ftByService = countByService(firstTimers,  "firstTimeService");
  const stByService = countByService(secondTimers, "secondTimeService");

  // 7 (special events count — computed above)

  // 9. SOD / SOM / Workers in Training / Baptismal groups
  const SPECIAL_GROUPS = ["SOD", "SOM", "Workers in Training", "Baptismal", "School of Disciples", "School of Ministry"];
  const specialGroupData = groups
    .filter((g) => SPECIAL_GROUPS.some((sg) => g.name.toLowerCase().includes(sg.toLowerCase())))
    .map((g) => ({ name: g.name.length > 18 ? g.name.slice(0, 16) + "…" : g.name, Members: g.totalMembers ?? 0 }));

  // 10. New converts by believers class
  const convertStageData = countByStage(converts);

  // 11. Birthdays by month
  const birthdayMonths = countBirthMonths([...members, ...eMembers]);
  const birthdayData = MONTH_SHORT.map((m, i) => ({ month: m, Birthdays: birthdayMonths[i] }));

  // 12. Wedding anniversaries by month
  const weddingMonths = countWeddingMonths([...members, ...eMembers]);
  const weddingData = MONTH_SHORT.map((m, i) => ({ month: m, Anniversaries: weddingMonths[i] }));

  // 13. Testimonies vs Celebrations by month
  const testByMonth   = countByMonth(testimonies);
  const celebByMonth  = countByMonth(celebrations);
  const testCelebData = MONTH_SHORT.map((m, i) => ({
    month: m, Testimonies: testByMonth[i], Celebrations: celebByMonth[i],
  }));

  // 14. People who stopped (have reasonForLeaving set)
  const leftByMonth = Array(12).fill(0);
  [...members, ...eMembers, ...firstTimers, ...secondTimers].forEach((u) => {
    if (u.reasonForLeaving && u.createdOn) {
      leftByMonth[new Date(u.createdOn).getMonth()]++;
    }
  });
  const leftData = MONTH_SHORT.map((m, i) => ({ month: m, Left: leftByMonth[i] }));

  // 20. Followups per month (calls + visits totalled by joining month)
  const followupByMonth = Array(12).fill(0);
  [...firstTimers, ...secondTimers].forEach((u) => {
    if (u.createdOn) {
      const m = new Date(u.createdOn).getMonth();
      followupByMonth[m] += (u.noOfCalls ?? 0) + (u.noOfVisits ?? 0);
    }
  });
  const followupMonthData = MONTH_SHORT.map((m, i) => ({ month: m, "Follow-ups": followupByMonth[i] }));

  // 21. Average response time (avg days since joining for contacted visitors)
  const contactedVisitors = [...firstTimers, ...secondTimers].filter(
    (u) => (u.noOfCalls ?? 0) > 0 || (u.noOfVisits ?? 0) > 0
  );
  const avgResponseDays = contactedVisitors.length > 0
    ? Math.round(
        contactedVisitors.reduce((sum, u) => {
          const days = u.createdOn
            ? (Date.now() - new Date(u.createdOn).getTime()) / 86_400_000
            : 0;
          return sum + days;
        }, 0) / contactedVisitors.length
      )
    : 0;

  // 17. Favourite parts of service — first timers
  const favouritePartsData = countByFavouriteParts(firstTimers);

  // 18. Visiting vs non-visiting (first timers)
  const visitingData = countVisiting(firstTimers);

  // 19. How did you hear about the church — first timers
  const howDidYouHearData = countHowDidYouHear(firstTimers);

  // 15 & 16. Urgent followup: first/second timers with 0 calls & 0 visits
  const urgentList = [...firstTimers, ...secondTimers]
    .filter((u) => (u.noOfCalls ?? 0) === 0 && (u.noOfVisits ?? 0) === 0)
    .sort((a, b) => new Date(a.createdOn ?? 0).getTime() - new Date(b.createdOn ?? 0).getTime())
    .slice(0, 20);
  const urgentTotal    = urgentList.length;
  const attended       = [...firstTimers, ...secondTimers].filter((u) => (u.noOfCalls ?? 0) > 0 || (u.noOfVisits ?? 0) > 0).length;
  const totalVisitors  = firstTimers.length + secondTimers.length;
  const attentionRate  = totalVisitors > 0 ? ((attended / totalVisitors) * 100).toFixed(1) : "0.0";

  // ── Loading / Error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="h-8 w-8 animate-spin text-[#000080] dark:text-indigo-400" />
        <span className="ml-3 text-sm text-[#6B7280] dark:text-slate-400">Loading analytics…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
        {error}
        <button onClick={load} className="ml-3 font-semibold underline">Retry</button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Refresh button */}
      <div className="flex justify-end">
        <button onClick={load}
          className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-medium text-[#374151] dark:text-slate-300 shadow-sm hover:border-[#000080] hover:text-[#000080] dark:text-indigo-400">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Data
        </button>
      </div>

      {/* ── Server-Side Analytics ─────────────────────────────────── */}
      <div className="rounded-xl border border-[#000080] bg-white dark:bg-slate-800 p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#000080] dark:text-indigo-400">Server-Side Analytics</h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400">Counts pulled directly from the backend — set a date range and fetch</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#6B7280] dark:text-slate-400" />
              <span className="text-xs text-[#6B7280] dark:text-slate-400">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-1.5 text-xs text-[#374151] dark:text-slate-300 outline-none focus:border-[#000080]"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#6B7280] dark:text-slate-400">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-1.5 text-xs text-[#374151] dark:text-slate-300 outline-none focus:border-[#000080]"
              />
            </div>
            <button
              onClick={() => loadServerStats(startDate, endDate)}
              disabled={svrLoading}
              className="flex items-center gap-1.5 rounded-lg bg-[#000080] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#000066] disabled:opacity-60"
            >
              <RefreshCw className={`h-3 w-3 ${svrLoading ? "animate-spin" : ""}`} />
              {svrLoading ? "Loading…" : "Fetch"}
            </button>
          </div>
        </div>

        {svrError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-2 text-xs text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {svrError}
          </div>
        )}

        {svrStats ? (
          <div className="space-y-5">
            {/* KPI row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <div className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-slate-400">Total Members</p>
                <p className="mt-1 text-2xl font-bold text-[#000080] dark:text-indigo-400">{svrStats.totalMembers.toLocaleString()}</p>
                <p className="text-[10px] text-[#9CA3AF] dark:text-slate-400">Members + E-Members (all time)</p>
              </div>
              <div className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-slate-400">New Members</p>
                <p className="mt-1 text-2xl font-bold text-[#16A34A] dark:text-green-300">{svrStats.membersInPeriod.toLocaleString()}</p>
                <p className="text-[10px] text-[#9CA3AF] dark:text-slate-400">In selected period</p>
              </div>
              <div className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-slate-400">First Timers</p>
                <p className="mt-1 text-2xl font-bold text-[#EA580C] dark:text-orange-400">{svrStats.firstTimersInPeriod.toLocaleString()}</p>
                <p className="text-[10px] text-[#9CA3AF] dark:text-slate-400">In selected period</p>
              </div>
              <div className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-slate-400">Second Timers</p>
                <p className="mt-1 text-2xl font-bold text-[#9333EA]">{svrStats.secondTimersInPeriod.toLocaleString()}</p>
                <p className="text-[10px] text-[#9CA3AF] dark:text-slate-400">In selected period</p>
              </div>
              <div className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-slate-400">New Converts</p>
                <p className="mt-1 text-2xl font-bold text-[#DB2777]">{svrStats.newConvertsInPeriod.toLocaleString()}</p>
                <p className="text-[10px] text-[#9CA3AF] dark:text-slate-400">In selected period</p>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Visiting vs Not Visiting */}
              <ChartCard title="Visiting vs Not Visiting">
                {!svrStats.visiting ? (
                  <p className="py-8 text-center text-xs text-[#9CA3AF] dark:text-slate-400">No data for selected period.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={svrStats.visiting.columns.map((c) => ({ name: c.feature ?? "Not Specified", count: c.totalCount }))}
                      margin={{ top: 4, right: 10, left: -10, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Bar dataKey="count" name="Count" fill={C.orange} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              {/* Service sections */}
              <ChartCard title="Favourite Parts of Service">
                {!svrStats.service ? (
                  <p className="py-8 text-center text-xs text-[#9CA3AF] dark:text-slate-400">No data for selected period.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={svrStats.service.columns.map((c) => { const f = c.feature ?? "Not Specified"; return { name: f.length > 14 ? f.slice(0, 12) + "…" : f, count: c.totalCount }; })}
                      layout="vertical"
                      margin={{ top: 4, right: 16, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Bar dataKey="count" name="Responses" fill={C.indigo} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              {/* Medium of invitation */}
              <ChartCard title="Medium of Invitation">
                {!svrStats.invitation ? (
                  <p className="py-8 text-center text-xs text-[#9CA3AF] dark:text-slate-400">No data for selected period.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={svrStats.invitation.columns.map((c) => { const f = c.feature ?? "Not Specified"; return { name: f.length > 14 ? f.slice(0, 12) + "…" : f, count: c.totalCount }; })}
                      layout="vertical"
                      margin={{ top: 4, right: 16, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Bar dataKey="count" name="Responses" fill={C.teal} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Conversion rates + attention rate + special events */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-slate-400">FT → 2nd Timer Rate</p>
                <p className="mt-1 text-2xl font-bold text-[#EA580C]">
                  {svrStats.ftToStRate != null ? `${(svrStats.ftToStRate.totalPercent ?? svrStats.ftToStRate.percentage ?? 0).toFixed(1)}%` : "—"}
                </p>
                <p className="text-[10px] text-[#9CA3AF] dark:text-slate-400">In selected period</p>
              </div>
              <div className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-slate-400">FT → Member Rate</p>
                <p className="mt-1 text-2xl font-bold text-[#9333EA]">
                  {svrStats.ftToMemRate != null ? `${(svrStats.ftToMemRate.totalPercent ?? svrStats.ftToMemRate.percentage ?? 0).toFixed(1)}%` : "—"}
                </p>
                <p className="text-[10px] text-[#9CA3AF] dark:text-slate-400">In selected period</p>
              </div>
              <div className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-slate-400">Follow-up Attention</p>
                <p className="mt-1 text-2xl font-bold text-[#0891B2]">
                  {svrStats.followupAttentionRate != null ? `${(svrStats.followupAttentionRate.totalPercent ?? svrStats.followupAttentionRate.percentage ?? 0).toFixed(1)}%` : "—"}
                </p>
                <p className="text-[10px] text-[#9CA3AF] dark:text-slate-400">Visitors contacted</p>
              </div>
              <div className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-slate-400">Special Events</p>
                <p className="mt-1 text-2xl font-bold text-[#D97706]">{svrStats.totalSpecialEvents.toLocaleString()}</p>
                <p className="text-[10px] text-[#9CA3AF] dark:text-slate-400">In selected period</p>
              </div>
            </div>

            {/* Past 6 services attendance */}
            {svrStats.pastServicesAttendance && (
              <ChartCard title="Past Services Attendance">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={svrStats.pastServicesAttendance.columns.map((c) => ({
                      name: (c.feature ?? "").length > 16 ? (c.feature ?? "").slice(0, 14) + "…" : (c.feature ?? ""),
                      count: c.totalCount,
                    }))}
                    margin={{ top: 4, right: 10, left: -10, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Bar dataKey="count" name="Attendees" fill={C.navy} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>
        ) : !svrLoading ? (
          <p className="py-6 text-center text-xs text-[#9CA3AF] dark:text-slate-400">
            Select a date range and click <strong>Fetch</strong> to load server-side statistics.
          </p>
        ) : null}
      </div>

      {/* ── Row 1: KPI Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard
          label="Total Members"
          value={members.length.toLocaleString()}
          sub={`+${members.filter((u) => isThisMonth(u.createdOn)).length} this month`}
          color={C.navy}
        />
        <KpiCard
          label="Conversion Rate"
          value={`${convRate}%`}
          sub="First timer → Full member"
          color={C.green}
        />
        <KpiCard
          label="Special Events This Year"
          value={eventCount}
          sub="Events recorded in current year"
          color={C.teal}
        />
        <KpiCard
          label="Followup Attention Rate"
          value={`${attentionRate}%`}
          sub={`${attended} of ${totalVisitors} visitors contacted`}
          color={C.amber}
        />
      </div>

      {/* ── Row 2: New Joiners This Month + Group Membership ───────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Chart 1 */}
        <ChartCard title="New Joiners This Month — By Type">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={newJoinersThisMonth} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                {newJoinersThisMonth.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2 */}
        <ChartCard title="Membership Across All Groups">
          {groupData.length === 0 ? (
            <p className="py-10 text-center text-xs text-[#9CA3AF] dark:text-slate-400">No group data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={groupData} layout="vertical" margin={{ top: 4, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="Members" fill={C.navy} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Row 3: Conversion Rates + KPI ────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Chart 3: 2-bar conversion rates */}
        <div className="lg:col-span-2">
          <ChartCard title="Visitor Conversion Rates">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={conversionRateData} margin={{ top: 4, right: 10, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
                <Bar dataKey="rate" name="Conversion Rate" radius={[4, 4, 0, 0]} maxBarSize={80}>
                  {conversionRateData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 flex gap-6 text-xs text-[#6B7280] dark:text-slate-400">
              <span><span className="font-semibold text-[#EA580C] dark:text-orange-400">{ftToStRate}%</span> of first timers returned as second timers</span>
              <span><span className="font-semibold text-[#000080] dark:text-indigo-400">{stToMemRate}%</span> of second timers became full members</span>
            </div>
          </ChartCard>
        </div>

        {/* KPI cards */}
        <div className="flex flex-col gap-4">
          <KpiCard
            label="Overall Conversion Rate"
            value={`${convRate}%`}
            sub={`${totalMem} members from ${totalFT} first timers`}
            color={C.green}
          />
          <KpiCard
            label="FT → ST Rate"
            value={`${ftToStRate}%`}
            sub={`${totalST} second timers from ${totalFT} first timers`}
            color={C.purple}
          />
        </div>
      </div>

      {/* ── Row 4: Gender Pie + Believers Class ───────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Chart 8: Gender pie */}
        <ChartCard title="Gender Distribution (All Users)">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ percent }: { percent?: number }) => percent != null ? `${(percent * 100).toFixed(0)}%` : ""} labelLine={false}>
                  {genderData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {genderData.map((g) => (
                <div key={g.name} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: g.color }} />
                  <span className="text-xs text-[#374151] dark:text-slate-300">{g.name}</span>
                  <span className="ml-auto text-xs font-bold text-[#111827] dark:text-slate-100">{g.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Chart 10: New converts by stage */}
        <ChartCard title="New Converts — Believers Class Stage">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={convertStageData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" name="Count" fill={C.pink} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 5: Service Attendance (FT + ST) ───────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="First Timers — By Service Attended This Month">
          {ftByService.length === 0 ? (
            <p className="py-10 text-center text-xs text-[#9CA3AF] dark:text-slate-400">No service attendance data on first timers.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ftByService} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" name="First Timers" fill={C.orange} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Second Timers — By Service Attended This Month">
          {stByService.length === 0 ? (
            <p className="py-10 text-center text-xs text-[#9CA3AF] dark:text-slate-400">No service attendance data on second timers.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stByService} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" name="Second Timers" fill={C.purple} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Row 6: SOD / SOM / WIT / Baptismal ───────────────────── */}
      <ChartCard title="Special Ministry Groups — SOD / SOM / Workers in Training / Baptismal">
        {specialGroupData.length === 0 ? (
          <p className="py-6 text-center text-xs text-[#9CA3AF] dark:text-slate-400">
            No groups matching SOD, SOM, Workers in Training, or Baptismal found.
            Ensure groups with those names are created in Settings → Groups.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={specialGroupData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="Members" fill={C.teal} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* ── Row 7: Birthdays + Weddings by Month ─────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Birthdays by Month">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={birthdayData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="Birthdays" fill={C.pink} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Wedding Anniversaries by Month">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weddingData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="Anniversaries" fill={C.amber} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 8: Testimonies vs Celebrations ───────────────────── */}
      <ChartCard title="Testimonies vs Celebrations — Monthly (This Year)">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={testCelebData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Testimonies"  fill={C.indigo} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Celebrations" fill={C.lime}   radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Row 9: People who left ────────────────────────────────── */}
      <ChartCard title="Members Who Left / Stopped — Monthly">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={leftData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="Left" fill={C.red} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-2 text-[10px] text-[#9CA3AF] dark:text-slate-400">
          Based on visitors/members with a recorded reason for leaving.
        </p>
      </ChartCard>

      {/* ── Row 10: Charts 17 / 18 / 19 ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Chart 17: Favourite parts of service */}
        <ChartCard title="Favourite Parts of Service — First Timers">
          {favouritePartsData.length === 0 ? (
            <p className="py-10 text-center text-xs text-[#9CA3AF] dark:text-slate-400">No favourite-part data recorded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={favouritePartsData} layout="vertical" margin={{ top: 4, right: 16, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" name="Responses" fill={C.indigo} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Chart 19: How did you hear about the church */}
        <ChartCard title="How First Timers Heard About the Church">
          {howDidYouHearData.length === 0 ? (
            <p className="py-10 text-center text-xs text-[#9CA3AF] dark:text-slate-400">No invitation-source data recorded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={howDidYouHearData} layout="vertical" margin={{ top: 4, right: 16, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" name="Responses" fill={C.teal} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Chart 18: Visitor pie */}
      <ChartCard title="First Timers — Indicated Visiting vs Did Not Indicate Visiting">
        <div className="flex items-center gap-8">
          <ResponsiveContainer width="50%" height={220}>
            <PieChart>
              <Pie
                data={visitingData}
                cx="50%" cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ percent }: { percent?: number }) => percent != null ? `${(percent * 100).toFixed(0)}%` : ""}
                labelLine={false}
              >
                {visitingData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-3">
            {visitingData.map((g) => (
              <div key={g.name} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: g.color }} />
                <span className="text-xs text-[#374151] dark:text-slate-300">{g.name}</span>
                <span className="ml-3 text-sm font-bold text-[#111827] dark:text-slate-100">{g.value.toLocaleString()}</span>
              </div>
            ))}
            <p className="mt-1 text-[10px] text-[#9CA3AF] dark:text-slate-400">Based on first-timer records with <em>isVisiting</em> flag.</p>
          </div>
        </div>
      </ChartCard>

      {/* ── Row 11: Charts 20 & 21 ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <KpiCard
          label="Avg. Days Before First Contact"
          value={avgResponseDays > 0 ? `${avgResponseDays}d` : "—"}
          sub={`Based on ${contactedVisitors.length} visitors who were contacted`}
          color={avgResponseDays <= 14 ? C.green : avgResponseDays <= 30 ? C.amber : C.red}
        />
        <div className="lg:col-span-2">
          <ChartCard title="Total Follow-up Actions per Month (Calls + Visits)">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={followupMonthData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="Follow-ups" fill={C.teal} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* ── Row 12: Urgent Followup + Attention Rate ─────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* KPI cards */}
        <div className="flex flex-col gap-4">
          <KpiCard
            label="Followup Attention Rate"
            value={`${attentionRate}%`}
            sub={`${attended} visitors contacted out of ${totalVisitors}`}
            color={C.green}
          />
          <KpiCard
            label="Urgent Followup Count"
            value={urgentTotal}
            sub="Visitors with 0 calls and 0 visits"
            color={C.red}
          />
        </div>

        {/* 15: Urgent followup table */}
        <div className="lg:col-span-2">
          <ChartCard title="People Needing Urgent Followup (No Calls or Visits Yet)">
            <div className="max-h-[300px] overflow-y-auto">
              {urgentList.length === 0 ? (
                <p className="py-8 text-center text-xs text-[#9CA3AF] dark:text-slate-400">All visitors have been contacted.</p>
              ) : (
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-[#F9FAFB]">
                    <tr className="border-b border-[#E5E7EB] dark:border-slate-700">
                      <th className="px-3 py-2 text-left text-[#6B7280] dark:text-slate-400">#</th>
                      <th className="px-3 py-2 text-left text-[#6B7280] dark:text-slate-400">Name</th>
                      <th className="px-3 py-2 text-left text-[#6B7280] dark:text-slate-400">Type</th>
                      <th className="px-3 py-2 text-left text-[#6B7280] dark:text-slate-400">Phone</th>
                      <th className="px-3 py-2 text-left text-[#6B7280] dark:text-slate-400">Assigned To</th>
                      <th className="px-3 py-2 text-left text-[#6B7280] dark:text-slate-400">Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {urgentList.map((u, i) => {
                      const name  = [u.firstName, u.lastName].filter(Boolean).join(" ") || "—";
                      const type  = u.userType ?? "Visitor";
                      const phone = u.phoneNumber ? `+${u.countryCode ?? ""} ${u.phoneNumber}` : "—";
                      const added = u.createdOn
                        ? new Date(u.createdOn).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                        : "—";
                      const assigned = u.assignedFollowUp
                        ? [u.assignedFollowUp.firstName, u.assignedFollowUp.lastName].filter(Boolean).join(" ") || "—"
                        : "—";
                      return (
                        <tr key={u.id} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA]">
                          <td className="px-3 py-2 text-[#9CA3AF] dark:text-slate-400">{i + 1}</td>
                          <td className="px-3 py-2 font-medium text-[#111827] dark:text-slate-100">{name}</td>
                          <td className="px-3 py-2">
                            <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-medium text-[#92400E]">{type}</span>
                          </td>
                          <td className="px-3 py-2 text-[#374151] dark:text-slate-300">{phone}</td>
                          <td className="px-3 py-2 text-[#374151] dark:text-slate-300">{assigned}</td>
                          <td className="px-3 py-2 text-[#374151] dark:text-slate-300">{added}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            {urgentList.length > 0 && (
              <div className="mt-3 flex justify-end border-t border-[#F3F4F6] pt-3">
                <a
                  href="/reports/followup"
                  className="text-xs font-semibold text-[#000080] dark:text-indigo-400 underline hover:text-[#000066]"
                >
                  View all {[...firstTimers, ...secondTimers].filter((u) => (u.noOfCalls ?? 0) === 0 && (u.noOfVisits ?? 0) === 0).length} people needing followup →
                </a>
              </div>
            )}
          </ChartCard>
        </div>
      </div>

    </div>
  );
}
