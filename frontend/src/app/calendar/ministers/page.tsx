"use client";

import { useState, useMemo, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { ministersOnDuty } from "@/lib/mock-data";
import { MinisterOnDuty, MinistryProgram } from "@/lib/types";
import { downloadCSV } from "@/lib/csv";

const PROGRAM_COLORS: Record<MinistryProgram, string> = {
  "Fresh Anointing": "bg-purple-100 text-purple-800",
  "Sunday Sermon": "bg-[#000080] text-white",
  "Tuesday Digging Deep": "bg-green-100 text-green-800",
  "Friday Prayer": "bg-orange-100 text-orange-800",
  Other: "bg-gray-100 text-gray-700",
};

const PROGRAM_OPTIONS: Array<MinistryProgram | "All"> = [
  "All",
  "Fresh Anointing",
  "Sunday Sermon",
  "Tuesday Digging Deep",
  "Friday Prayer",
  "Other",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MinistersOnDutyPage() {
  const [entries, setEntries] = useState<MinisterOnDuty[]>(ministersOnDuty);
  const [programFilter, setProgramFilter] = useState<MinistryProgram | "All">(
    "All"
  );
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentYear = 2026;
  const currentMonth = 3; // April

  const filtered = useMemo(() => {
    if (programFilter === "All") return entries;
    return entries.filter((e) => e.program === programFilter);
  }, [entries, programFilter]);

  const entriesByDate = useMemo(() => {
    const map: Record<string, MinisterOnDuty[]> = {};
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

  const handleToggleReminder = (id: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, reminderEnabled: !e.reminderEnabled } : e
      )
    );
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || "");
      const rows = text.split(/\r?\n/).filter((r) => r.trim());
      // Skip header
      const newEntries: MinisterOnDuty[] = [];
      for (let i = 1; i < rows.length; i++) {
        const parts = rows[i].split(",").map((p) => p.trim());
        if (parts.length < 4) continue;
        const [date, program, minister, phone] = parts;
        newEntries.push({
          id: `mod-upload-${Date.now()}-${i}`,
          date,
          program: (program as MinistryProgram) || "Other",
          minister,
          phone,
          reminderEnabled: false,
        });
      }
      if (newEntries.length > 0) {
        setEntries((prev) => [...prev, ...newEntries]);
        showToast(`Imported ${newEntries.length} minister(s).`);
      } else {
        showToast("No valid rows found in CSV.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadTemplate = () => {
    const csv = "date,program,minister,phone\n2026-04-19,Sunday Sermon,Pastor David,+234 801 111 2222";
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
        <button
          onClick={handleDownloadTemplate}
          className="text-sm font-medium text-[#000080] underline transition-colors hover:text-[#000055]"
        >
          Download CSV Template
        </button>
      </div>

      {toast && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {toast}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left: mini calendar */}
        <div className="lg:w-1/2">
          <div className="mb-4 rounded-xl border border-[#E5E7EB] bg-white px-6 py-4">
            <h2 className="text-lg font-bold text-[#000080]">April 2026</h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            <div className="grid grid-cols-7 bg-[#F3F4F6]">
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="px-2 py-2 text-center text-xs font-bold text-[#000080]"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarCells.map((day, idx) => {
                const dateStr = day
                  ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  : "";
                const dayEntries = day ? entriesByDate[dateStr] || [] : [];
                return (
                  <div
                    key={idx}
                    className={`min-h-[80px] border-b border-r border-[#F3F4F6] p-1.5 ${
                      day ? "bg-white" : "bg-[#FAFAFA]"
                    }`}
                  >
                    {day && (
                      <>
                        <span className="text-xs font-medium text-[#374151]">
                          {day}
                        </span>
                        <div className="mt-1 space-y-1">
                          {dayEntries.slice(0, 2).map((e) => (
                            <div
                              key={e.id}
                              className={`truncate rounded px-1 py-0.5 text-[10px] ${PROGRAM_COLORS[e.program]}`}
                              title={`${e.program} · ${e.minister}`}
                            >
                              {e.minister}
                            </div>
                          ))}
                          {dayEntries.length > 2 && (
                            <span className="text-[10px] text-[#6B7280]">
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
            <h3 className="text-sm font-semibold text-[#111827]">Schedule</h3>
            <select
              value={programFilter}
              onChange={(e) =>
                setProgramFilter(e.target.value as MinistryProgram | "All")
              }
              className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
            >
              {PROGRAM_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <p className="rounded-xl border border-[#E5E7EB] bg-white p-6 text-sm text-[#6B7280]">
                No ministers scheduled.
              </p>
            ) : (
              filtered
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white p-4"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${PROGRAM_COLORS[m.program]}`}
                        >
                          {m.program}
                        </span>
                        <span className="text-xs text-[#6B7280]">{m.date}</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-[#111827]">
                        {m.minister}
                      </p>
                      <p className="text-xs text-[#6B7280]">{m.phone}</p>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-[#374151]">
                      <input
                        type="checkbox"
                        checked={m.reminderEnabled}
                        onChange={() => handleToggleReminder(m.id)}
                        className="h-4 w-4 rounded border-[#E5E7EB] text-[#000080] focus:ring-[#000080]"
                      />
                      Reminder 48h before
                    </label>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
