"use client";

import { useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  getBirthdays,
  getWeddingAnniversaries,
  type UserResponse,
} from "@/lib/api";
import { ChevronRight, ChevronLeft, Download, FileText, FileSpreadsheet, Printer } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────
type ReportTab = "membership" | "celebrations" | "attendance";
type ReportId =
  | "members" | "first-timers" | "second-timers" | "new-converts"
  | "birthdays" | "weddings" | "church-anniversary" | "departmental"
  | "event-attendance";

interface ReportDef {
  id: ReportId;
  title: string;
  description: string;
}

interface CategoryDef {
  title: string;
  description: string;
  reports: ReportDef[];
}

// ─── Report Catalogue ────────────────────────────────────────────────────────
const CATALOGUE: Record<ReportTab, CategoryDef[]> = {
  membership: [
    {
      title: "Membership",
      description: "Generate membership reports and track the growth of your church.",
      reports: [
        { id: "members",       title: "Members Report",       description: "Detailed report of all full members in the ministry." },
        { id: "first-timers",  title: "First Timers Report",  description: "Detailed report of first timers in the ministry." },
        { id: "second-timers", title: "Second Timers Report", description: "Detailed report of second timers in the ministry." },
        { id: "new-converts",  title: "New Converts Report",  description: "Detailed report of new converts in the ministry." },
      ],
    },
  ],
  celebrations: [
    {
      title: "Celebrations",
      description: "Generate celebration reports to identify and minister to members on their special days.",
      reports: [
        { id: "birthdays",          title: "Birthday Report",            description: "Members celebrating birthdays within the selected period." },
        { id: "weddings",           title: "Wedding Anniversary Report", description: "Members celebrating wedding anniversaries within the selected period." },
        { id: "church-anniversary", title: "Church Anniversary Report",  description: "Annual celebration report for the church's founding anniversary (est. June 1996)." },
        { id: "departmental",       title: "Departmental Anniversary",   description: "Members and departments celebrating departmental anniversaries." },
      ],
    },
  ],
  attendance: [
    {
      title: "Attendance",
      description: "Track and review attendance records across all services and events.",
      reports: [
        { id: "event-attendance", title: "Event Attendance Report", description: "Attendance records for services and events within a date range." },
      ],
    },
  ],
};

// ─── Department founding dates ────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysInMonth(month: number): number {
  return new Date(2024, month, 0).getDate(); // 2024 is a leap year, safe for Feb
}

function isoToLabel(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function thisWeekRange() {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const mon = new Date(today); mon.setDate(today.getDate() - ((day + 6) % 7));
  const sun = new Date(mon);   sun.setDate(mon.getDate() + 6);
  return { startDay: mon.getDate(), startMonth: mon.getMonth() + 1,
           endDay:   sun.getDate(), endMonth:   sun.getMonth() + 1 };
}

function nextWeekRange() {
  const r = thisWeekRange();
  const mon = new Date(); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7) + 7);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return { startDay: mon.getDate(), startMonth: mon.getMonth() + 1,
           endDay:   sun.getDate(), endMonth:   sun.getMonth() + 1 };
}

function thisMonthRange() {
  const today = new Date();
  const m = today.getMonth() + 1;
  return { startDay: 1, startMonth: m, endDay: daysInMonth(m), endMonth: m };
}

function nextMonthRange() {
  const today = new Date();
  const nm = (today.getMonth() + 2 > 12) ? 1 : today.getMonth() + 2;
  return { startDay: 1, startMonth: nm, endDay: daysInMonth(nm), endMonth: nm };
}

function formatDOB(u: UserResponse) {
  if (!u.dayOfBirth && !u.monthOfBirth) return "—";
  const m = MONTH_NAMES[(u.monthOfBirth ?? 1) - 1] ?? "";
  const y = u.yearOfBirth ? `, ${u.yearOfBirth}` : "";
  return `${m} ${u.dayOfBirth ?? "?"}${y}`;
}

function fullName(u: UserResponse) {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

// ─── Export helpers ───────────────────────────────────────────────────────────
function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function exportCSV(rows: UserResponse[], reportTitle: string) {
  const header = "First Name,Last Name,Email,Phone,Birthday,Anniversary\n";
  const body = rows.map(u =>
    [fullName(u), u.lastName ?? "", u.email ?? "", u.phoneNumber ?? "", formatDOB(u), ""].join(",")
  ).join("\n");
  triggerDownload(header + body, `${reportTitle}.csv`, "text/csv");
}

function exportExcel(rows: UserResponse[], reportTitle: string) {
  const th = (s: string) => `<th style="background:#000080;color:#fff;padding:6px 10px">${s}</th>`;
  const td = (s: string) => `<td style="padding:5px 10px;border:1px solid #ddd">${s}</td>`;
  const html = `<html><head><meta charset="UTF-8"/></head><body>
  <h2 style="font-family:Arial">${reportTitle}</h2>
  <table style="border-collapse:collapse;font-family:Arial;font-size:13px">
    <thead><tr>${["Name","Email","Phone","Birthday"].map(th).join("")}</tr></thead>
    <tbody>${rows.map(u => `<tr>${[fullName(u), u.email??"-", (u.phoneNumber??""), formatDOB(u)].map(td).join("")}</tr>`).join("")}</tbody>
  </table></body></html>`;
  triggerDownload("﻿" + html, `${reportTitle}.xls`, "application/vnd.ms-excel;charset=UTF-8");
}

function exportTXT(rows: UserResponse[], reportTitle: string) {
  const sep = "─".repeat(60);
  const lines = [
    `REPORT: ${reportTitle}`,
    `Generated: ${new Date().toLocaleString("en-GB")}`,
    `Total Records: ${rows.length}`,
    sep,
    ...rows.map((u, i) =>
      `${String(i + 1).padStart(3, " ")}. ${fullName(u).padEnd(30)} ${(u.phoneNumber ?? "").padEnd(15)} ${u.email ?? ""}`
    ),
    sep,
  ];
  triggerDownload(lines.join("\n"), `${reportTitle}.txt`, "text/plain");
}

function exportPDF(reportTitle: string) {
  const printArea = document.getElementById("report-print-area");
  if (!printArea) return;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<html><head><title>${reportTitle}</title>
    <style>body{font-family:Arial,sans-serif;padding:20px}
    table{border-collapse:collapse;width:100%}
    th{background:#000080;color:#fff;padding:8px 12px;text-align:left}
    td{padding:7px 12px;border:1px solid #ddd}
    h2{color:#000080}
    </style></head><body><h2>${reportTitle}</h2>`);
  win.document.write(printArea.innerHTML);
  win.document.write("</body></html>");
  win.document.close();
  win.focus();
  win.print();
  win.close();
}

// ─── Date Range Picker ────────────────────────────────────────────────────────
interface DateRange { startDay: number; startMonth: number; endDay: number; endMonth: number; }

function DateRangePicker({ value, onChange }: { value: DateRange; onChange: (r: DateRange) => void }) {
  const quick = [
    { label: "This Week",  fn: thisWeekRange  },
    { label: "This Month", fn: thisMonthRange },
    { label: "Next Week",  fn: nextWeekRange  },
    { label: "Next Month", fn: nextMonthRange },
  ];
  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Quick select */}
      <div className="flex flex-wrap gap-2">
        {quick.map((q) => (
          <button key={q.label} onClick={() => onChange(q.fn())}
            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#374151] transition hover:border-[#000080] hover:text-[#000080]">
            {q.label}
          </button>
        ))}
      </div>
      {/* From */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[#6B7280]">From — Day</label>
        <input type="number" min={1} max={31} value={value.startDay}
          onChange={e => onChange({ ...value, startDay: Number(e.target.value) })}
          className="w-20 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#000080]" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[#6B7280]">From — Month</label>
        <select value={value.startMonth}
          onChange={e => onChange({ ...value, startMonth: Number(e.target.value) })}
          className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#000080]">
          {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
      </div>
      {/* To */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[#6B7280]">To — Day</label>
        <input type="number" min={1} max={31} value={value.endDay}
          onChange={e => onChange({ ...value, endDay: Number(e.target.value) })}
          className="w-20 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#000080]" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[#6B7280]">To — Month</label>
        <select value={value.endMonth}
          onChange={e => onChange({ ...value, endMonth: Number(e.target.value) })}
          className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#000080]">
          {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
      </div>
    </div>
  );
}

// ─── Results Table ─────────────────────────────────────────────────────────────
function ResultsTable({ rows, reportTitle, showBirthday = false }: {
  rows: UserResponse[]; reportTitle: string; showBirthday?: boolean;
}) {
  return (
    <div>
      {/* Export bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#374151]">
          {rows.length} record{rows.length !== 1 ? "s" : ""} found
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => exportCSV(rows, reportTitle)}
            className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#374151] transition hover:border-[#000080] hover:text-[#000080]">
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          <button onClick={() => exportExcel(rows, reportTitle)}
            className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#374151] transition hover:border-[#000080] hover:text-[#000080]">
            <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
          </button>
          <button onClick={() => exportTXT(rows, reportTitle)}
            className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#374151] transition hover:border-[#000080] hover:text-[#000080]">
            <FileText className="h-3.5 w-3.5" /> TXT
          </button>
          <button onClick={() => exportPDF(reportTitle)}
            className="flex items-center gap-1.5 rounded-lg border border-[#000080] bg-[#000080] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#000066]">
            <Printer className="h-3.5 w-3.5" /> PDF / Print
          </button>
        </div>
      </div>

      {/* Table */}
      <div id="report-print-area" className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">Full Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">Phone</th>
              {showBirthday && <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">Date</th>}
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">Type</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u, i) => (
              <tr key={u.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB]">
                <td className="px-4 py-3 text-[#9CA3AF]">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-[#111827]">{fullName(u)}</td>
                <td className="px-4 py-3 text-[#374151]">{u.email ?? "—"}</td>
                <td className="px-4 py-3 text-[#374151]">{u.phoneNumber ? `+${u.countryCode ?? ""} ${u.phoneNumber}`.trim() : "—"}</td>
                {showBirthday && <td className="px-4 py-3 text-[#374151]">{formatDOB(u)}</td>}
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[#EEF2FF] px-2.5 py-0.5 text-xs font-medium text-[#000080]">
                    {u.userType ?? "Member"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="py-12 text-center text-sm text-[#9CA3AF]">No records found for the selected range.</div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const today = new Date();
  const [activeTab,       setActiveTab]       = useState<ReportTab>("membership");
  const [selectedReport,  setSelectedReport]  = useState<ReportId | null>(null);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [results,         setResults]         = useState<UserResponse[]>([]);
  const [hasGenerated,    setHasGenerated]    = useState(false);

  const [dateRange, setDateRange] = useState<DateRange>(thisMonthRange());
  const [selectedDept, setSelectedDept] = useState<string>("all");

  const currentReportDef = CATALOGUE[activeTab]
    .flatMap(c => c.reports)
    .find(r => r.id === selectedReport);

  // ── Generate ──────────────────────────────────────────────────────────────
  const generate = useCallback(async () => {
    if (!selectedReport) return;
    setLoading(true);
    setError("");
    setResults([]);
    setHasGenerated(true);
    try {
      if (selectedReport === "birthdays") {
        const res = await getBirthdays(
          dateRange.startDay, dateRange.startMonth,
          dateRange.endDay,   dateRange.endMonth,
          0, 200
        );
        setResults(res.content ?? []);
      } else if (selectedReport === "weddings") {
        const res = await getWeddingAnniversaries(
          dateRange.startDay, dateRange.startMonth,
          dateRange.endDay,   dateRange.endMonth,
          0, 200
        );
        setResults(res.content ?? []);
      } else {
        // Static/placeholder for reports awaiting backend
        setResults([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report. Please ensure you are logged in.");
    } finally {
      setLoading(false);
    }
  }, [selectedReport, dateRange]);

  // ── Church anniversary info ────────────────────────────────────────────────
  const churchFounded = new Date(1996, 5, 15); // June 15 1996
  const yearsOld = today.getFullYear() - churchFounded.getFullYear();
  const nextAnniversary = new Date(today.getFullYear(), 5, 15);
  if (nextAnniversary < today) nextAnniversary.setFullYear(today.getFullYear() + 1);
  const daysToAnniversary = Math.ceil((nextAnniversary.getTime() - today.getTime()) / 86400000);

  // ── Navigation ────────────────────────────────────────────────────────────
  const openReport = (id: ReportId) => {
    setSelectedReport(id);
    setResults([]);
    setHasGenerated(false);
    setError("");
    setDateRange(thisMonthRange());
  };

  const back = () => { setSelectedReport(null); setResults([]); setHasGenerated(false); };

  const tabs: { key: ReportTab; label: string }[] = [
    { key: "membership",   label: "Membership"   },
    { key: "celebrations", label: "Celebrations" },
    { key: "attendance",   label: "Attendance"   },
  ];

  // ── Render detail view ─────────────────────────────────────────────────────
  if (selectedReport) {
    const isLive = selectedReport === "birthdays" || selectedReport === "weddings";
    const isComingSoon = selectedReport === "members" || selectedReport === "first-timers" ||
                         selectedReport === "second-timers" || selectedReport === "new-converts" ||
                         selectedReport === "event-attendance";
    const isChurch  = selectedReport === "church-anniversary";
    const isDeptl   = selectedReport === "departmental";

    return (
      <DashboardLayout>
        {/* Back + Title */}
        <div className="mb-6 flex items-center gap-3">
          <button onClick={back}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#374151] transition hover:bg-[#F3F4F6]">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Reports</p>
            <h1 className="text-[22px] font-bold text-[#000000]">{currentReportDef?.title}</h1>
          </div>
        </div>

        {/* ── Birthday / Wedding ── */}
        {isLive && (
          <div className="space-y-6">
            {/* Filter card */}
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold text-[#374151]">Select Date Range</h2>
              <DateRangePicker value={dateRange} onChange={setDateRange} />
              <div className="mt-5 flex items-center gap-3">
                <button onClick={generate} disabled={loading}
                  className="rounded-lg bg-[#000080] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#000066] disabled:opacity-60">
                  {loading ? "Generating…" : "Generate Report"}
                </button>
                {hasGenerated && !loading && (
                  <p className="text-xs text-[#6B7280]">
                    Range: {MONTH_NAMES[dateRange.startMonth-1]} {dateRange.startDay} → {MONTH_NAMES[dateRange.endMonth-1]} {dateRange.endDay}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            {hasGenerated && !loading && !error && (
              <ResultsTable rows={results} reportTitle={currentReportDef?.title ?? ""} showBirthday />
            )}
          </div>
        )}

        {/* ── Church Anniversary ── */}
        {isChurch && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <h2 className="text-lg font-bold text-[#000080]">Rose of Sharon — {yearsOld}th Anniversary</h2>
                  <p className="mt-1 text-sm text-[#6B7280]">Founded: June 15, 1996</p>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    Next anniversary: June 15, {nextAnniversary.getFullYear()} — <span className="font-semibold text-[#000080]">{daysToAnniversary} days away</span>
                  </p>
                </div>
                <div className="rounded-xl bg-[#000080] px-6 py-4 text-center text-white">
                  <p className="text-3xl font-bold">{yearsOld}</p>
                  <p className="text-xs font-medium opacity-80">Years of Ministry</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-3 text-sm font-semibold text-[#374151]">Anniversary Month Birthday Report</h2>
              <p className="mb-4 text-xs text-[#6B7280]">Members celebrating birthdays during the anniversary month (June) — use the Birthday Report with Month: June to generate the full list.</p>
              <button onClick={() => { setSelectedReport("birthdays"); setDateRange({ startDay: 1, startMonth: 6, endDay: 30, endMonth: 6 }); }}
                className="rounded-lg bg-[#000080] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#000066]">
                View June Birthday Report
              </button>
            </div>
          </div>
        )}

        {/* ── Departmental ── */}
        {isDeptl && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-4 text-sm font-semibold text-[#374151]">Department Anniversaries</h2>
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedDept("all")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${selectedDept === "all" ? "bg-[#000080] text-white" : "border border-[#E5E7EB] text-[#374151] hover:border-[#000080]"}`}>
                  All Departments
                </button>
                {DEPARTMENTS.map(d => (
                  <button key={d.name}
                    onClick={() => setSelectedDept(d.name)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${selectedDept === d.name ? "bg-[#000080] text-white" : "border border-[#E5E7EB] text-[#374151] hover:border-[#000080]"}`}>
                    {d.name}
                  </button>
                ))}
              </div>
              <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">Founded</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">Years Active</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">Anniversary Month</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEPARTMENTS
                      .filter(d => selectedDept === "all" || d.name === selectedDept)
                      .map((d) => {
                        const yrs = today.getFullYear() - d.founded.getFullYear();
                        return (
                          <tr key={d.name} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB]">
                            <td className="px-4 py-3 font-medium text-[#111827]">{d.name}</td>
                            <td className="px-4 py-3 text-[#374151]">{isoToLabel(d.founded)}</td>
                            <td className="px-4 py-3">
                              <span className="rounded-full bg-[#EEF2FF] px-2.5 py-0.5 text-xs font-medium text-[#000080]">{yrs} years</span>
                            </td>
                            <td className="px-4 py-3 text-[#374151]">{MONTH_NAMES[d.founded.getMonth()]}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 rounded-lg bg-[#F9FAFB] px-4 py-3 text-xs text-[#6B7280]">
                ℹ️ Individual member department joining dates will be available once the backend adds that field to the group membership response.
              </p>
            </div>
          </div>
        )}

        {/* ── Coming Soon ── */}
        {isComingSoon && (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF2FF]">
              <FileText className="h-7 w-7 text-[#000080]" />
            </div>
            <h2 className="text-base font-semibold text-[#111827]">{currentReportDef?.title}</h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              {selectedReport === "event-attendance"
                ? "Event attendance data will be available once the attendance tracking API is connected."
                : "This report is awaiting the member list API fix from the backend team. It will be available automatically once resolved."}
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
        <p className="text-sm text-[#6B7280]">Generate and export reports for your church ministry</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${activeTab === t.key ? "bg-white text-[#000080] shadow-sm" : "text-[#6B7280] hover:text-[#374151]"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Category cards */}
      <div className="space-y-6">
        {CATALOGUE[activeTab].map((cat) => (
          <div key={cat.title} className="rounded-xl border border-[#E5E7EB] bg-white">
            {/* Category header */}
            <div className="flex items-start gap-4 border-b border-[#E5E7EB] p-6">
              <div className="flex-1">
                <h2 className="text-base font-bold text-[#111827]">{cat.title}</h2>
                <p className="mt-1 text-sm text-[#6B7280]">{cat.description}</p>
              </div>
            </div>
            {/* Report rows */}
            <div className="divide-y divide-[#E5E7EB]">
              {cat.reports.map((r) => (
                <button key={r.id} onClick={() => openReport(r.id)}
                  className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-[#F9FAFB] group">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#000080] group-hover:underline">{r.title}</p>
                    <p className="mt-0.5 text-xs text-[#6B7280]">{r.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#9CA3AF] group-hover:text-[#000080]" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
