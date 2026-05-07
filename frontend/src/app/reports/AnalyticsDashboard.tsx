"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import {
  getMembers, getEMembers, getFirstTimers, getSecondTimers,
  getNewConverts, getAllGroups, getTestimonies, getCelebrations, getEvents,
  type UserResponse, type NewConvertResponse, type GroupResponse,
} from "@/lib/api";
import { RefreshCw } from "lucide-react";

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

// ─── Sub-components ──────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color = C.navy }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">{label}</p>
      <p className="mt-2 text-3xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="mt-1 text-xs text-[#9CA3AF]">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children, className = "" }: {
  title: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm ${className}`}>
      <h3 className="mb-4 text-sm font-bold text-[#111827]">{title}</h3>
      {children}
    </div>
  );
}

const TOOLTIP_STYLE = {
  contentStyle: { borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

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
        fetchAll((p, s) => getMembers(p, s)),
        fetchAll((p, s) => getEMembers(p, s)),
        fetchAll((p, s) => getFirstTimers(p, s)),
        fetchAll((p, s) => getSecondTimers(p, s)),
        fetchAll((p, s) => getNewConverts(p, s)) as Promise<NewConvertResponse[]>,
        getAllGroups(),
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

  useEffect(() => { load(); }, []);

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

  // 3. Conversion funnel
  const totalFT    = firstTimers.length;
  const totalST    = secondTimers.length;
  const totalMem   = members.length;
  const ftToSt     = secondTimers.length; // approximation — second timers count
  const stToMem    = members.length;      // approximation — members count
  const convRate   = totalFT > 0 ? ((totalMem / totalFT) * 100).toFixed(1) : "0.0";
  const funnelData = [
    { name: "First Timers",  count: totalFT  },
    { name: "Second Timers", count: totalST  },
    { name: "Members",       count: totalMem },
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
        <RefreshCw className="h-8 w-8 animate-spin text-[#000080]" />
        <span className="ml-3 text-sm text-[#6B7280]">Loading analytics…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
          className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-medium text-[#374151] shadow-sm hover:border-[#000080] hover:text-[#000080]">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Data
        </button>
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
        <ChartCard title="1. New Joiners This Month — By Type">
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
        <ChartCard title="2. Membership Across All Groups">
          {groupData.length === 0 ? (
            <p className="py-10 text-center text-xs text-[#9CA3AF]">No group data available.</p>
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

      {/* ── Row 3: Conversion Funnel + Rate Card ──────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Funnel chart */}
        <div className="lg:col-span-2">
          <ChartCard title="3. Visitor Conversion Funnel (First Timer → Second Timer → Member)">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnelData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" name="Total Count" radius={[4, 4, 0, 0]}>
                  <Cell fill={C.orange} />
                  <Cell fill={C.purple} />
                  <Cell fill={C.navy} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Rate cards */}
        <div className="flex flex-col gap-4">
          <KpiCard
            label="4. Conversion Rate"
            value={`${convRate}%`}
            sub={`${totalMem} members from ${totalFT} first timers`}
            color={C.green}
          />
          <KpiCard
            label="FT → ST Rate"
            value={totalFT > 0 ? `${((totalST / totalFT) * 100).toFixed(1)}%` : "—"}
            sub={`${totalST} second timers from ${totalFT} first timers`}
            color={C.purple}
          />
        </div>
      </div>

      {/* ── Row 4: Gender Pie + Believers Class ───────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Chart 8: Gender pie */}
        <ChartCard title="8. Gender Distribution (All Users)">
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
                  <span className="text-xs text-[#374151]">{g.name}</span>
                  <span className="ml-auto text-xs font-bold text-[#111827]">{g.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Chart 10: New converts by stage */}
        <ChartCard title="10. New Converts — Believers Class Stage">
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
        <ChartCard title="5. First Timers — By Service Attended This Month">
          {ftByService.length === 0 ? (
            <p className="py-10 text-center text-xs text-[#9CA3AF]">No service attendance data on first timers.</p>
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

        <ChartCard title="6. Second Timers — By Service Attended This Month">
          {stByService.length === 0 ? (
            <p className="py-10 text-center text-xs text-[#9CA3AF]">No service attendance data on second timers.</p>
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
      <ChartCard title="9. Special Ministry Groups — SOD / SOM / Workers in Training / Baptismal">
        {specialGroupData.length === 0 ? (
          <p className="py-6 text-center text-xs text-[#9CA3AF]">
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
        <ChartCard title="11. Birthdays by Month">
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

        <ChartCard title="12. Wedding Anniversaries by Month">
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
      <ChartCard title="13. Testimonies vs Celebrations — Monthly (This Year)">
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
      <ChartCard title="14. Members Who Left / Stopped — Monthly">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={leftData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="Left" fill={C.red} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-2 text-[10px] text-[#9CA3AF]">
          Based on visitors/members with a recorded reason for leaving.
        </p>
      </ChartCard>

      {/* ── Row 10: Urgent Followup + Attention Rate ─────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 16: Attention rate card */}
        <div className="flex flex-col gap-4">
          <KpiCard
            label="16. Followup Attention Rate"
            value={`${attentionRate}%`}
            sub={`${attended} visitors contacted out of ${totalVisitors}`}
            color={C.green}
          />
          <KpiCard
            label="15. Urgent Followup Count"
            value={urgentTotal}
            sub="Visitors with 0 calls and 0 visits"
            color={C.red}
          />
        </div>

        {/* 15: Urgent followup list */}
        <div className="lg:col-span-2">
          <ChartCard title="15. People Needing Urgent Followup (No Calls or Visits Yet)">
            <div className="max-h-[280px] overflow-y-auto">
              {urgentList.length === 0 ? (
                <p className="py-8 text-center text-xs text-[#9CA3AF]">All visitors have been contacted.</p>
              ) : (
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-[#F9FAFB]">
                    <tr className="border-b border-[#E5E7EB]">
                      <th className="px-3 py-2 text-left text-[#6B7280]">#</th>
                      <th className="px-3 py-2 text-left text-[#6B7280]">Name</th>
                      <th className="px-3 py-2 text-left text-[#6B7280]">Type</th>
                      <th className="px-3 py-2 text-left text-[#6B7280]">Phone</th>
                      <th className="px-3 py-2 text-left text-[#6B7280]">Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {urgentList.map((u, i) => {
                      const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || "—";
                      const type = u.userType ?? "Visitor";
                      const phone = u.phoneNumber ? `+${u.countryCode ?? ""} ${u.phoneNumber}` : "—";
                      const added = u.createdOn ? new Date(u.createdOn).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
                      return (
                        <tr key={u.id} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA]">
                          <td className="px-3 py-2 text-[#9CA3AF]">{i + 1}</td>
                          <td className="px-3 py-2 font-medium text-[#111827]">{name}</td>
                          <td className="px-3 py-2">
                            <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-medium text-[#92400E]">{type}</span>
                          </td>
                          <td className="px-3 py-2 text-[#374151]">{phone}</td>
                          <td className="px-3 py-2 text-[#374151]">{added}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </ChartCard>
        </div>
      </div>

    </div>
  );
}
