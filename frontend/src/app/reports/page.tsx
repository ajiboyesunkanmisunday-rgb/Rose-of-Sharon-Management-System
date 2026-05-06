"use client";

import { useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getBirthdays, getWeddingAnniversaries, type UserResponse } from "@/lib/api";
import { ChevronRight, ChevronLeft, Download, FileText, FileSpreadsheet, Printer } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type ReportTab = "membership" | "celebrations" | "attendance";
type ReportId =
  | "members" | "first-timers" | "second-timers" | "new-converts"
  | "birthdays" | "weddings" | "church-anniversary" | "departmental"
  | "event-attendance";

interface ReportDef  { id: ReportId; title: string; description: string; }
interface CategoryDef { title: string; description: string; reports: ReportDef[]; }

const CATALOGUE: Record<ReportTab, CategoryDef[]> = {
  membership: [{
    title: "Membership",
    description: "Generate membership reports and track the growth of your church members.",
    reports: [
      { id: "members",       title: "Members Report",       description: "Detailed report of all full members in the ministry." },
      { id: "first-timers",  title: "First Timers Report",  description: "Detailed report of first timers in the ministry." },
      { id: "second-timers", title: "Second Timers Report", description: "Detailed report of second timers in the ministry." },
      { id: "new-converts",  title: "New Converts Report",  description: "Detailed report of new converts in the ministry." },
    ],
  }],
  celebrations: [{
    title: "Celebrations",
    description: "Identify and minister to members celebrating birthdays, anniversaries, and milestones.",
    reports: [
      { id: "birthdays",          title: "Birthday Report",            description: "Members celebrating birthdays within the selected period." },
      { id: "weddings",           title: "Wedding Anniversary Report", description: "Members celebrating wedding anniversaries within the selected period." },
      { id: "church-anniversary", title: "Church Anniversary Report",  description: "Annual celebration report for the church's founding anniversary (est. June 1996)." },
      { id: "departmental",       title: "Departmental Anniversary",   description: "Departments and members celebrating departmental anniversaries." },
    ],
  }],
  attendance: [{
    title: "Attendance",
    description: "Track and review attendance records across all services and events.",
    reports: [
      { id: "event-attendance", title: "Event Attendance Report", description: "Attendance records for services and events within a date range." },
    ],
  }],
};

const DEPARTMENTS = [
  { name: "Pastoral Team",         founded: new Date(1997, 0, 1)  },
  { name: "Deacons & Deaconesses", founded: new Date(1997, 2, 15) },
  { name: "Music & Choir",         founded: new Date(1997, 5, 1)  },
  { name: "Youth Fellowship",      founded: new Date(1998, 8, 1)  },
  { name: "Children's Ministry",   founded: new Date(1998, 8, 1)  },
  { name: "Ushering Department",   founded: new Date(1998, 0, 1)  },
  { name: "Women's Fellowship",    founded: new Date(1998, 2, 8)  },
  { name: "Men's Fellowship",      founded: new Date(1998, 2, 19) },
  { name: "Media & Technical",     founded: new Date(2010, 0, 1)  },
  { name: "Welfare Committee",     founded: new Date(2000, 0, 1)  },
];

const MONTH_NAMES = ["January","February","March","April","May","June",
                     "July","August","September","October","November","December"];

const USER_TYPES = ["All Types","MEMBER","E_MEMBER","FIRST_TIMER","SECOND_TIMER","NEW_CONVERT"];
const GENDERS    = ["All Genders","MALE","FEMALE"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function daysInMonth(month: number) { return new Date(2024, month, 0).getDate(); }
function fullName(u: UserResponse)  { return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—"; }
function formatDOB(u: UserResponse) {
  if (!u.dayOfBirth && !u.monthOfBirth) return "—";
  const m = MONTH_NAMES[(u.monthOfBirth ?? 1) - 1] ?? "";
  return `${m} ${u.dayOfBirth ?? "?"}${u.yearOfBirth ? `, ${u.yearOfBirth}` : ""}`;
}

function thisWeekRange()  {
  const today = new Date(); const day = today.getDay();
  const mon = new Date(today); mon.setDate(today.getDate() - ((day + 6) % 7));
  const sun = new Date(mon);   sun.setDate(mon.getDate() + 6);
  return { startDay: mon.getDate(), startMonth: mon.getMonth()+1, endDay: sun.getDate(), endMonth: sun.getMonth()+1 };
}
function nextWeekRange()  {
  const mon = new Date(); mon.setDate(mon.getDate() - ((mon.getDay()+6)%7) + 7);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return { startDay: mon.getDate(), startMonth: mon.getMonth()+1, endDay: sun.getDate(), endMonth: sun.getMonth()+1 };
}
function thisMonthRange() {
  const m = new Date().getMonth()+1;
  return { startDay: 1, startMonth: m, endDay: daysInMonth(m), endMonth: m };
}
function nextMonthRange() {
  const nm = (new Date().getMonth()+2 > 12) ? 1 : new Date().getMonth()+2;
  return { startDay: 1, startMonth: nm, endDay: daysInMonth(nm), endMonth: nm };
}

// ─── Export ──────────────────────────────────────────────────────────────────
function dlBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
function exportCSV(rows: UserResponse[], title: string) {
  const h = "Name,Email,Phone,Date\n";
  const b = rows.map(u => [fullName(u), u.email??"", u.phoneNumber??"", formatDOB(u)].join(",")).join("\n");
  dlBlob(h+b, `${title}.csv`, "text/csv");
}
function exportExcel(rows: UserResponse[], title: string) {
  const th = (s: string) => `<th style="background:#000080;color:#fff;padding:6px 10px">${s}</th>`;
  const td = (s: string) => `<td style="padding:5px 10px;border:1px solid #ddd">${s}</td>`;
  const html = `<html><head><meta charset="UTF-8"/></head><body><h2>${title}</h2>
  <table style="border-collapse:collapse;font-family:Arial;font-size:13px">
    <thead><tr>${["Name","Email","Phone","Date"].map(th).join("")}</tr></thead>
    <tbody>${rows.map(u=>`<tr>${[fullName(u),u.email??"-",u.phoneNumber??"",formatDOB(u)].map(td).join("")}</tr>`).join("")}</tbody>
  </table></body></html>`;
  dlBlob("﻿"+html, `${title}.xls`, "application/vnd.ms-excel;charset=UTF-8");
}
function exportTXT(rows: UserResponse[], title: string) {
  const sep = "─".repeat(70);
  const lines = [`REPORT: ${title}`, `Generated: ${new Date().toLocaleString("en-GB")}`,
    `Total Records: ${rows.length}`, sep,
    ...rows.map((u,i) => `${String(i+1).padStart(3," ")}. ${fullName(u).padEnd(32)} ${(u.phoneNumber??"").padEnd(14)} ${u.email??""}`),
    sep];
  dlBlob(lines.join("\n"), `${title}.txt`, "text/plain");
}
function exportPDF(title: string) {
  const el = document.getElementById("report-print-area"); if (!el) return;
  const w = window.open("","_blank"); if (!w) return;
  w.document.write(`<html><head><title>${title}</title>
    <style>body{font-family:Arial,sans-serif;padding:20px} table{border-collapse:collapse;width:100%}
    th{background:#000080;color:#fff;padding:8px 12px;text-align:left} td{padding:7px 12px;border:1px solid #ddd}
    h2{color:#000080} @media print{button{display:none}}</style></head><body>
    <h2>${title}</h2><p style="color:#6B7280;font-size:12px">Generated: ${new Date().toLocaleString("en-GB")}</p>`);
  w.document.write(el.innerHTML); w.document.write("</body></html>");
  w.document.close(); w.focus(); w.print(); w.close();
}

// ─── Date Range Picker ────────────────────────────────────────────────────────
interface DateRange { startDay: number; startMonth: number; endDay: number; endMonth: number; }

function CelebrationFilters({
  dateRange, onDateRange, userType, onUserType, gender, onGender, groups, onGroups, allGroups,
}: {
  dateRange: DateRange; onDateRange: (r: DateRange) => void;
  userType: string; onUserType: (v: string) => void;
  gender: string; onGender: (v: string) => void;
  groups: string[]; onGroups: (v: string[]) => void;
  allGroups: string[];
}) {
  const quick = [
    { label: "This Week",  fn: thisWeekRange  },
    { label: "Next Week",  fn: nextWeekRange  },
    { label: "This Month", fn: thisMonthRange },
    { label: "Next Month", fn: nextMonthRange },
  ];
  return (
    <div className="space-y-5">
      {/* Quick select buttons */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Quick Select</p>
        <div className="flex flex-wrap gap-2">
          {quick.map(q => (
            <button key={q.label} onClick={() => onDateRange(q.fn())}
              className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition hover:border-[#000080] hover:bg-[#F0F2FF] hover:text-[#000080]">
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date range */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Custom Date Range</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#374151]">From Day</label>
            <input type="number" min={1} max={31} value={dateRange.startDay}
              onChange={e => onDateRange({...dateRange, startDay: Number(e.target.value)})}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#374151]">From Month</label>
            <select value={dateRange.startMonth}
              onChange={e => onDateRange({...dateRange, startMonth: Number(e.target.value)})}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]">
              {MONTH_NAMES.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#374151]">To Day</label>
            <input type="number" min={1} max={31} value={dateRange.endDay}
              onChange={e => onDateRange({...dateRange, endDay: Number(e.target.value)})}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#374151]">To Month</label>
            <select value={dateRange.endMonth}
              onChange={e => onDateRange({...dateRange, endMonth: Number(e.target.value)})}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]">
              {MONTH_NAMES.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Additional filters */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Additional Filters</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#374151]">Member Type</label>
            <select value={userType} onChange={e => onUserType(e.target.value)}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]">
              {USER_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g," ")}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#374151]">Gender</label>
            <select value={gender} onChange={e => onGender(e.target.value)}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]">
              {GENDERS.map(g => <option key={g} value={g}>{g.replace(/_/g," ")}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#374151]">Department / Group</label>
            <select value={groups[0] ?? "All Groups"}
              onChange={e => onGroups(e.target.value === "All Groups" ? [] : [e.target.value])}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]">
              <option value="All Groups">All Groups</option>
              {allGroups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Results Table ────────────────────────────────────────────────────────────
function ResultsTable({ rows, title, showDate }: { rows: UserResponse[]; title: string; showDate?: boolean }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#374151]">
          <span className="font-bold text-[#000080]">{rows.length}</span> record{rows.length !== 1 ? "s" : ""} found
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "CSV",        icon: <Download className="h-3.5 w-3.5" />,         fn: () => exportCSV(rows, title)   },
            { label: "Excel",      icon: <FileSpreadsheet className="h-3.5 w-3.5" />,  fn: () => exportExcel(rows, title) },
            { label: "TXT",        icon: <FileText className="h-3.5 w-3.5" />,         fn: () => exportTXT(rows, title)   },
            { label: "PDF/Print",  icon: <Printer className="h-3.5 w-3.5" />,          fn: () => exportPDF(title)         },
          ].map(btn => (
            <button key={btn.label} onClick={btn.fn}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition
                ${btn.label === "PDF/Print"
                  ? "border-[#000080] bg-[#000080] text-white hover:bg-[#000066]"
                  : "border-[#E5E7EB] bg-white text-[#374151] hover:border-[#000080] hover:text-[#000080]"}`}>
              {btn.icon} {btn.label}
            </button>
          ))}
        </div>
      </div>
      <div id="report-print-area" className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
              {["#","Full Name","Email","Phone", ...(showDate ? ["Date"] : []),"Type"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((u, i) => (
              <tr key={u.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB]">
                <td className="px-4 py-3 text-[#9CA3AF]">{i+1}</td>
                <td className="px-4 py-3 font-medium text-[#111827]">{fullName(u)}</td>
                <td className="px-4 py-3 text-[#374151]">{u.email ?? "—"}</td>
                <td className="px-4 py-3 text-[#374151]">{u.phoneNumber ? `+${u.countryCode??""} ${u.phoneNumber}`.trim() : "—"}</td>
                {showDate && <td className="px-4 py-3 text-[#374151]">{formatDOB(u)}</td>}
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[#EEF2FF] px-2.5 py-0.5 text-xs font-medium text-[#000080]">
                    {(u.userType ?? "Member").replace(/_/g," ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="py-12 text-center text-sm text-[#9CA3AF]">No records found for the selected filters.</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const today = new Date();
  const [activeTab,      setActiveTab]      = useState<ReportTab>("membership");
  const [selectedReport, setSelectedReport] = useState<ReportId | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [results,        setResults]        = useState<UserResponse[]>([]);
  const [hasGenerated,   setHasGenerated]   = useState(false);

  const [dateRange,    setDateRange]    = useState<DateRange>(thisMonthRange());
  const [userType,     setUserType]     = useState("All Types");
  const [gender,       setGender]       = useState("All Genders");
  const [groups,       setGroups]       = useState<string[]>([]);
  const [selectedDept, setSelectedDept] = useState("all");

  const allGroupNames = DEPARTMENTS.map(d => d.name);

  const currentDef = CATALOGUE[activeTab].flatMap(c => c.reports).find(r => r.id === selectedReport);

  // Apply client-side filters to API results
  const filteredResults = results.filter(u => {
    if (userType !== "All Types"  && u.userType !== userType)  return false;
    if (gender   !== "All Genders" && u.sex !== gender)         return false;
    if (groups.length > 0 && !u.groups?.some(g => groups.includes(g.name))) return false;
    return true;
  });

  const generate = useCallback(async () => {
    if (!selectedReport) return;
    setLoading(true); setError(""); setResults([]); setHasGenerated(true);
    try {
      if (selectedReport === "birthdays") {
        const r = await getBirthdays(dateRange.startDay, dateRange.startMonth, dateRange.endDay, dateRange.endMonth, 0, 200);
        setResults(r.content ?? []);
      } else if (selectedReport === "weddings") {
        const r = await getWeddingAnniversaries(dateRange.startDay, dateRange.startMonth, dateRange.endDay, dateRange.endMonth, 0, 200);
        setResults(r.content ?? []);
      } else {
        setResults([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate. Ensure you are logged in.");
    } finally { setLoading(false); }
  }, [selectedReport, dateRange]);

  const openReport = (id: ReportId) => {
    setSelectedReport(id); setResults([]); setHasGenerated(false); setError("");
    setDateRange(thisMonthRange()); setUserType("All Types"); setGender("All Genders"); setGroups([]);
  };
  const back = () => { setSelectedReport(null); setResults([]); setHasGenerated(false); };

  const isLive       = selectedReport === "birthdays" || selectedReport === "weddings";
  const isChurch     = selectedReport === "church-anniversary";
  const isDeptl      = selectedReport === "departmental";
  const isComingSoon = selectedReport === "members" || selectedReport === "first-timers" ||
                       selectedReport === "second-timers" || selectedReport === "new-converts" ||
                       selectedReport === "event-attendance";

  // Church anniversary calcs
  const churchFounded     = new Date(1996, 5, 15);
  const yearsOld          = today.getFullYear() - churchFounded.getFullYear();
  const nextAnniv         = new Date(today.getFullYear(), 5, 15);
  if (nextAnniv < today)  nextAnniv.setFullYear(today.getFullYear() + 1);
  const daysToAnniv       = Math.ceil((nextAnniv.getTime() - today.getTime()) / 86400000);

  // ── Detail view ────────────────────────────────────────────────────────────
  if (selectedReport) {
    return (
      <DashboardLayout>
        <div className="mb-6 flex items-center gap-3">
          <button onClick={back}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] transition hover:bg-[#F3F4F6]">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Reports</p>
            <h1 className="text-[22px] font-bold text-[#000000]">{currentDef?.title}</h1>
          </div>
        </div>

        {/* Birthday / Wedding */}
        {isLive && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-base font-semibold text-[#111827]">Report Filters</h2>
              <CelebrationFilters
                dateRange={dateRange} onDateRange={setDateRange}
                userType={userType}   onUserType={setUserType}
                gender={gender}       onGender={setGender}
                groups={groups}       onGroups={setGroups}
                allGroups={allGroupNames}
              />
              <div className="mt-6 flex items-center gap-4">
                <button onClick={generate} disabled={loading}
                  className="rounded-lg bg-[#000080] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#000066] disabled:opacity-60">
                  {loading ? "Generating…" : "Generate Report"}
                </button>
                {hasGenerated && !loading && (
                  <span className="text-xs text-[#6B7280]">
                    {MONTH_NAMES[dateRange.startMonth-1]} {dateRange.startDay} — {MONTH_NAMES[dateRange.endMonth-1]} {dateRange.endDay}
                  </span>
                )}
              </div>
            </div>
            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {hasGenerated && !loading && !error && (
              <ResultsTable rows={filteredResults} title={currentDef?.title ?? ""} showDate />
            )}
          </div>
        )}

        {/* Church Anniversary */}
        {isChurch && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <h2 className="text-lg font-bold text-[#000080]">Rose of Sharon — {yearsOld}th Anniversary</h2>
                  <p className="mt-1 text-sm text-[#6B7280]">Founded: June 15, 1996</p>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    Next anniversary: June 15, {nextAnniv.getFullYear()} —{" "}
                    <span className="font-semibold text-[#000080]">{daysToAnniv} days away</span>
                  </p>
                </div>
                <div className="rounded-xl bg-[#000080] px-8 py-5 text-center text-white">
                  <p className="text-4xl font-bold">{yearsOld}</p>
                  <p className="text-xs font-medium opacity-80">Years of Ministry</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold text-[#374151]">June Birthday Report</h2>
              <p className="mb-4 text-xs text-[#6B7280]">Generate a list of all members celebrating birthdays during the church anniversary month.</p>
              <button onClick={() => { openReport("birthdays"); setDateRange({ startDay:1, startMonth:6, endDay:30, endMonth:6 }); }}
                className="rounded-lg bg-[#000080] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#000066]">
                View June Birthday Report
              </button>
            </div>
          </div>
        )}

        {/* Departmental */}
        {isDeptl && (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-[#374151]">Department Anniversaries</h2>
            <div className="mb-5 flex flex-wrap gap-2">
              <button onClick={() => setSelectedDept("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${selectedDept==="all" ? "bg-[#000080] text-white" : "border border-[#E5E7EB] text-[#374151] hover:border-[#000080]"}`}>
                All
              </button>
              {DEPARTMENTS.map(d => (
                <button key={d.name} onClick={() => setSelectedDept(d.name)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${selectedDept===d.name ? "bg-[#000080] text-white" : "border border-[#E5E7EB] text-[#374151] hover:border-[#000080]"}`}>
                  {d.name}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  {["Department","Founded","Years Active","Anniversary Month"].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {DEPARTMENTS.filter(d => selectedDept==="all" || d.name===selectedDept).map(d => (
                    <tr key={d.name} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB]">
                      <td className="px-4 py-3 font-medium text-[#111827]">{d.name}</td>
                      <td className="px-4 py-3 text-[#374151]">{d.founded.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</td>
                      <td className="px-4 py-3"><span className="rounded-full bg-[#EEF2FF] px-2.5 py-0.5 text-xs font-medium text-[#000080]">{today.getFullYear()-d.founded.getFullYear()} yrs</span></td>
                      <td className="px-4 py-3 text-[#374151]">{MONTH_NAMES[d.founded.getMonth()]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 rounded-lg bg-[#F9FAFB] px-4 py-3 text-xs text-[#6B7280]">
              ℹ️ Individual member joining dates per department will be available once the backend adds that field to the group membership response.
            </p>
          </div>
        )}

        {/* Coming Soon */}
        {isComingSoon && (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF2FF]">
              <FileText className="h-7 w-7 text-[#000080]" />
            </div>
            <h2 className="text-base font-semibold text-[#111827]">{currentDef?.title}</h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              {selectedReport === "event-attendance"
                ? "Event attendance data will be available once the attendance tracking API is connected."
                : "This report will be available once the member list API is resolved by the backend team."}
            </p>
          </div>
        )}
      </DashboardLayout>
    );
  }

  // ── Catalogue list view ────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Reports</h1>
        <p className="text-sm text-[#6B7280]">Generate and export detailed reports for your church ministry</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-1">
        {(["membership","celebrations","attendance"] as ReportTab[]).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium capitalize transition
              ${activeTab===t ? "bg-white text-[#000080] shadow-sm" : "text-[#6B7280] hover:text-[#374151]"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Category cards */}
      <div className="space-y-6">
        {CATALOGUE[activeTab].map(cat => (
          <div key={cat.title} className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
            {/* ── Distinct category header ── */}
            <div className="border-b-2 border-[#000080] bg-[#F0F2FF] px-6 py-5">
              <h2 className="text-lg font-bold text-[#000080]">{cat.title}</h2>
              <p className="mt-1 text-sm text-[#4B5563]">{cat.description}</p>
            </div>
            {/* ── Report rows ── */}
            <div className="divide-y divide-[#E5E7EB]">
              {cat.reports.map(r => (
                <button key={r.id} onClick={() => openReport(r.id)}
                  className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-[#F9FAFB] group">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#000080] group-hover:underline">{r.title}</p>
                    <p className="mt-0.5 text-xs text-[#6B7280]">{r.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#9CA3AF] transition group-hover:translate-x-0.5 group-hover:text-[#000080]" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
