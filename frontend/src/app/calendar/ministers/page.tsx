"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { MinistryProgram } from "@/lib/types";
import { downloadCSV } from "@/lib/csv";
import { uploadCalendar, getCalendar, UploadCalendarRequest, EventResponse } from "@/lib/api";

const PROGRAM_COLORS: Record<MinistryProgram, string> = {
  "Fresh Anointing": "bg-purple-100 text-purple-800",
  "Sunday Sermon": "bg-[#000080] text-white",
  "Tuesday Digging Deep": "bg-green-100 text-green-800",
  "Thursday Prayer": "bg-orange-100 text-orange-800",
  Other: "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300",
};

const PROGRAM_OPTIONS: Array<MinistryProgram | "All"> = [
  "All",
  "Fresh Anointing",
  "Sunday Sermon",
  "Tuesday Digging Deep",
  "Thursday Prayer",
  "Other",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MinistersOnDutyPage() {
  const [entries, setEntries] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [programFilter, setProgramFilter] = useState<string>("All");
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentYear = 2026;
  const currentMonth = 4; // May

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch for the current month
        const start = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
        const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
        const end = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${lastDay}`;
        const data = await getCalendar(start, end);
        setEntries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentYear, currentMonth]);

  const filtered = useMemo(() => {
    if (programFilter === "All") return entries;
    return entries.filter((e) => e.eventCategory === programFilter);
  }, [entries, programFilter]);

  const entriesByDate = useMemo(() => {
    const map: Record<string, EventResponse[]> = {};
    for (const e of filtered) {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    }
    return map;
  }, [filtered]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = String(ev.target?.result || "");
      const rows = text.split(/\r?\n/).filter((r) => r.trim());
      if (rows.length < 2) {
        showToast("No valid rows found in CSV.");
        return;
      }

      // Skip header
      const entries: UploadCalendarRequest[] = [];
      const headers = rows[0].split(",").map(h => h.trim());
      
      for (let i = 1; i < rows.length; i++) {
        const parts = rows[i].split(",").map((p) => p.trim());
        if (parts.length < headers.length) continue;
        
      const entry: any = {};
      headers.forEach((header, idx) => {
        const val = parts[idx];
        entry[header] = val;
      });
      
      if (entry.preacherEmail && entry.title && entry.date) {
        // Handle multiple date formats (M/D/YYYY or YYYY-MM-DD)
        const dateParts = entry.date.split(/[-/]/).map(Number);
        
        if (dateParts.length === 3) {
          let year, month, day;
          
          if (dateParts[0] > 1000) {
            // YYYY-MM-DD
            [year, month, day] = dateParts;
          } else {
            // M/D/YYYY or D/M/YYYY - assuming M/D/YYYY for Excel standard
            [month, day, year] = dateParts;
          }
          
          const normalizedDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          
          const parseToTimestamp = (timeStr: string) => {
            const t = parseInt(timeStr);
            if (isNaN(t)) return 0;
            const hh = Math.floor(t / 100);
            const mm = t % 100;
            return new Date(year, month - 1, day, hh, mm).getTime();
          };

          const payload: UploadCalendarRequest = {
            ...entry,
            date: normalizedDate,
            startTime: parseToTimestamp(entry.startTime),
            endTime: parseToTimestamp(entry.endTime),
            category: "SPECIAL_SERVICE",
            locationType: "VIRTUAL",
            country: "Nigeria",
            virtualMeetingLink: "",
            additionalInformation: "",
            city: "",
            state: "",
            street: "",
            topic: ""
          };
          entries.push(payload);
        }
      }
      }

      if (entries.length > 0) {
        try {
          await uploadCalendar(entries);
          showToast(`Successfully uploaded ${entries.length} entry(s).`);
          // Note: In a real app we might want to refresh the calendar list here
        } catch (err: any) {
          showToast(err.message || "Upload failed.");
        }
      } else {
        showToast("No valid rows found in CSV (eventId/title and preacherEmail are required).");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "title", "preacherTitle", "preacherEmail", "date", "startTime", "endTime"
    ];
    const example = [
      "Sunday Service", "Pastor", "pastor@example.com", "2026-05-31", "0900", "1100"
    ];
    const csv = headers.join(",") + "\n" + example.join(",");
    downloadCSV(csv, "ministers-on-duty-template.csv");
  };

  return (
    <DashboardLayout>
      <PageHeader title="Calendar" subtitle="Ministers on Duty" backHref="/calendar" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          onClick={() => fileInputRef.current?.click()}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          }
        >
          Upload CSV
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Link href="/calendar/ministers/add">
          <Button variant="outline" className="border-[#000080] text-[#000080] dark:text-indigo-400 hover:bg-[#F3F4F6] dark:bg-slate-700/30">
            Add Minister to Event
          </Button>
        </Link>
        <button
          onClick={handleDownloadTemplate}
          className="text-sm font-medium text-[#000080] dark:text-indigo-400 underline transition-colors hover:text-[#000055]"
        >
          Download CSV Template
        </button>
      </div>

      {toast && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-800">
          {toast}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left: mini calendar */}
        <div className="lg:w-1/2">
          <div className="mb-4 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4">
            <h2 className="text-lg font-bold text-[#000080] dark:text-indigo-400">April 2026</h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="grid grid-cols-7 min-w-[320px] bg-[#F3F4F6] dark:bg-slate-700/30">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="px-2 py-2 text-center text-xs font-bold text-[#000080] dark:text-indigo-400"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 min-w-[320px]">
              {calendarCells.map((day, idx) => {
                const dateStr = day
                  ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  : "";
                const dayEntries = day ? entriesByDate[dateStr] || [] : [];
                return (
                  <div
                    key={idx}
                    className={`min-h-[80px] border-b border-r border-[#F3F4F6] p-1.5 ${
                      day ? "bg-white dark:bg-slate-800" : "bg-[#FAFAFA]"
                    }`}
                  >
                    {day && (
                      <>
                        <span className="text-xs font-medium text-[#374151] dark:text-slate-300">
                          {day}
                        </span>
                        <div className="mt-1 space-y-1">
                          {dayEntries.slice(0, 2).map((e) => (
                            <div
                              key={e.id}
                              className={`truncate rounded px-1 py-0.5 text-[10px] bg-[#000080] text-white`}
                              title={`${e.title} · ${e.preacher}`}
                            >
                              {e.title}
                            </div>
                          ))}
                          {dayEntries.length > 2 && (
                            <span className="text-[10px] text-[#6B7280] dark:text-slate-400">
                              +{dayEntries.length - 2} more
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: list */}
        <div className="lg:flex-1">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Schedule</h3>
            <select
              value={programFilter}
              onChange={(e) =>
                setProgramFilter(e.target.value)
              }
              className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-[#374151] dark:text-slate-300 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
            >
              <option value="All">All Categories</option>
              <option value="SERVICE">Service</option>
              <option value="SPECIAL_SERVICE">Special Service</option>
              <option value="WEDDING">Wedding</option>
              <option value="FUNERAL">Funeral</option>
              <option value="CONFERENCE">Conference</option>
            </select>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50" />
              ))
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center text-sm text-[#6B7280] dark:text-slate-400">
                No ministers scheduled for this period.
              </div>
            ) : (
              filtered
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full px-2.5 py-1 text-[11px] font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700"
                        >
                          {m.title}
                        </span>
                        <span className="text-xs text-[#6B7280] dark:text-slate-400">{m.date}</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-[#111827] dark:text-slate-100">
                        {m.preacher || "TBA"}
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
