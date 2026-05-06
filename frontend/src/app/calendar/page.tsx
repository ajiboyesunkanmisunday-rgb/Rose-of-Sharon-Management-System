"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { getCalendarEvents, getUpcomingEvents, type EventResponse } from "@/lib/api";
import { CalendarDays } from "lucide-react";

// ─── Category colours (Teams-style pill colours) ────────────────────────────
const categoryColor: Record<string, string> = {
  SERVICE:         "bg-[#000080] text-white",
  SPECIAL_SERVICE: "bg-purple-600 text-white",
  CONFERENCE:      "bg-sky-600 text-white",
  WEDDING:         "bg-pink-500 text-white",
  FUNERAL:         "bg-gray-500 text-white",
};
function eventColor(cat?: string) {
  return categoryColor[cat ?? ""] ?? "bg-green-600 text-white";
}

const LEGEND = [
  { label: "Service",         color: "bg-[#000080]" },
  { label: "Special Service", color: "bg-purple-600" },
  { label: "Conference",      color: "bg-sky-600"   },
  { label: "Wedding",         color: "bg-pink-500"  },
  { label: "Funeral",         color: "bg-gray-500"  },
  { label: "Other",           color: "bg-green-600" },
];

const DAYS        = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}
function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function getFirstDayOfMonth(y: number, m: number) {
  return new Date(y, m, 1).getDay();
}

// Parse a time epoch (ms) to "h:mm AM/PM"
function fmtEpoch(ms?: number): string {
  if (!ms) return "";
  const d = new Date(ms);
  let h = d.getHours();
  const mm = String(d.getMinutes()).padStart(2,"0");
  const ap = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mm} ${ap}`;
}

function parseHour(ms?: number): number | null {
  if (!ms) return null;
  const d = new Date(ms);
  return d.getHours() + d.getMinutes() / 60;
}

type ViewMode = "Month" | "Week";

export default function CalendarPage() {
  const router = useRouter();
  const today = new Date();
  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [viewMode,     setViewMode]     = useState<ViewMode>("Month");
  const [weekStart,    setWeekStart]    = useState<Date>(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay());
    return d;
  });

  const [events,   setEvents]   = useState<EventResponse[]>([]);
  const [upcoming, setUpcoming] = useState<EventResponse[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [apiError, setApiError] = useState("");

  function isoDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  // Fetch events for the currently visible date range (month or week)
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setApiError("");
    try {
      let startDay: string;
      let endDay: string;
      if (viewMode === "Month") {
        startDay = isoDate(new Date(currentYear, currentMonth, 1));
        endDay   = isoDate(new Date(currentYear, currentMonth + 1, 0));
      } else {
        const we = new Date(weekStart); we.setDate(we.getDate() + 6);
        startDay = isoDate(weekStart);
        endDay   = isoDate(we);
      }
      const result = await getCalendarEvents(startDay, endDay);
      setEvents(result ?? []);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load events.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear, currentMonth, viewMode, weekStart]);

  // Fetch upcoming events for sidebar (today → +90 days), independent of view
  const fetchUpcoming = useCallback(async () => {
    try {
      const start = new Date();
      const end   = new Date(); end.setDate(end.getDate() + 90);
      const result = await getUpcomingEvents(isoDate(start), isoDate(end));
      setUpcoming(result ?? []);
    } catch {
      // sidebar failure is non-critical
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => { fetchUpcoming(); }, [fetchUpcoming]);

  // Events keyed by ISO date string
  const eventsByDate = events.reduce<Record<string, EventResponse[]>>((acc, ev) => {
    if (!ev.date) return acc;
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {});

  // Navigation helpers
  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };
  const goToday = () => {
    const t = new Date();
    setCurrentYear(t.getFullYear());
    setCurrentMonth(t.getMonth());
    const d = new Date(t);
    d.setDate(d.getDate() - d.getDay());
    setWeekStart(d);
    setViewMode("Month");
  };

  // Build calendar grid cells
  const firstDay    = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate());

  // Sidebar shows upcoming events from dedicated fetch (sorted, capped at 6)
  const sidebarUpcoming = [...upcoming]
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
    .slice(0, 6);

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF]">
            <CalendarDays className="h-6 w-6 text-[#2563EB]" />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-[#000000]">Calendar</h1>
            <p className="text-sm text-[#6B7280]">View and manage church schedule</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Today button */}
          <button
            onClick={goToday}
            className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F3F4F6]"
          >
            Today
          </button>

          {/* Month / Week toggle */}
          <div className="inline-flex rounded-lg border border-[#E5E7EB] bg-white p-1">
            {(["Month","Week"] as ViewMode[]).map(m => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === m
                    ? "bg-[#000080] text-white"
                    : "text-[#374151] hover:bg-[#F3F4F6]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            onClick={() => router.push("/event-management/add")}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            }
          >
            Add Event
          </Button>
        </div>
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={fetchEvents}>Retry</button>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row min-w-0">
        {/* ── Main calendar area ─────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {viewMode === "Month" ? (
            <MonthView
              currentYear={currentYear}
              currentMonth={currentMonth}
              cells={cells}
              todayISO={todayISO}
              eventsByDate={eventsByDate}
              loading={loading}
              onPrev={prevMonth}
              onNext={nextMonth}
              onEventClick={id => router.push(`/event-management/${id}`)}
            />
          ) : (
            <WeekView
              weekStart={weekStart}
              eventsByDate={eventsByDate}
              onPrev={() => { const d = new Date(weekStart); d.setDate(d.getDate()-7); setWeekStart(d); }}
              onNext={() => { const d = new Date(weekStart); d.setDate(d.getDate()+7); setWeekStart(d); }}
              onEventClick={id => router.push(`/event-management/${id}`)}
            />
          )}

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 rounded-xl border border-[#E5E7EB] bg-white px-5 py-3">
            {LEGEND.map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${item.color}`} />
                <span className="text-xs text-[#374151]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Upcoming events sidebar ─────────────────────────── */}
        <aside className="lg:w-80">
          <h3 className="mb-3 text-sm font-semibold text-[#111827]">Upcoming Events</h3>
          <div className="space-y-3">
            {loading ? (
              <p className="rounded-xl border border-[#E5E7EB] bg-white p-6 text-sm text-[#6B7280]">Loading…</p>
            ) : sidebarUpcoming.length === 0 ? (
              <p className="rounded-xl border border-[#E5E7EB] bg-white p-6 text-sm text-[#6B7280]">No upcoming events.</p>
            ) : (
              sidebarUpcoming.map(ev => (
                <button
                  key={ev.id}
                  onClick={() => router.push(`/event-management/${ev.id}`)}
                  className="block w-full rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition-colors hover:border-[#000080]"
                >
                  <div className="flex items-center gap-2">
                    <span className={`inline-block h-2 w-2 rounded-full ${eventColor(ev.eventCategory).split(" ")[0]}`} />
                    <span className="text-xs font-medium text-[#6B7280]">
                      {ev.date ? new Date(ev.date).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "—"}
                      {ev.startTime ? " · " + fmtEpoch(ev.startTime) : ""}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-[#111827]">{ev.title}</p>
                  {ev.eventCategory && (
                    <span className="mt-1 inline-block text-xs text-[#6B7280]">
                      {ev.eventCategory.replace(/_/g," ")}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}

// ─── Month View ──────────────────────────────────────────────────────────────

interface MonthViewProps {
  currentYear: number;
  currentMonth: number;
  cells: (number | null)[];
  todayISO: string;
  eventsByDate: Record<string, EventResponse[]>;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
  onEventClick: (id: string) => void;
}

function MonthView({ currentYear, currentMonth, cells, todayISO, eventsByDate, loading, onPrev, onNext, onEventClick }: MonthViewProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-6 py-4">
        <button onClick={onPrev} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#000080] hover:bg-[#F3F4F6]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 className="text-lg font-bold text-[#000080]">{MONTH_NAMES[currentMonth]} {currentYear}</h2>
        <button onClick={onNext} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#000080] hover:bg-[#F3F4F6]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        {/* Day headers */}
        <div className="grid grid-cols-7 min-w-[340px] bg-[#F3F4F6]">
          {DAYS.map(d => (
            <div key={d} className="px-2 py-3 text-center text-sm font-bold text-[#000080]">{d}</div>
          ))}
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Loading events…</div>
        ) : (
          <div className="grid grid-cols-7 min-w-[340px]">
            {cells.map((day, idx) => {
              const dateStr = day ? toISO(currentYear, currentMonth, day) : "";
              const isToday = dateStr === todayISO;
              const dayEvents = day ? (eventsByDate[dateStr] ?? []) : [];
              const SHOW = 3;
              const overflow = dayEvents.length - SHOW;
              const isExpanded = expandedDay === dateStr;

              return (
                <div
                  key={idx}
                  className={`min-h-[110px] border-b border-r border-[#F3F4F6] p-1.5 ${day ? "bg-white" : "bg-[#FAFAFA]"}`}
                >
                  {day && (
                    <>
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${isToday ? "bg-[#000080] font-bold text-white" : "text-[#374151]"}`}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {(isExpanded ? dayEvents : dayEvents.slice(0, SHOW)).map(ev => (
                          <button
                            key={ev.id}
                            onClick={() => onEventClick(ev.id)}
                            className={`block w-full truncate rounded px-1 py-0.5 text-left text-xs ${eventColor(ev.eventCategory)} transition-opacity hover:opacity-80`}
                            title={ev.title}
                          >
                            {ev.startTime ? fmtEpoch(ev.startTime) + " " : ""}{ev.title}
                          </button>
                        ))}
                        {!isExpanded && overflow > 0 && (
                          <button
                            onClick={() => setExpandedDay(dateStr)}
                            className="block w-full text-left pl-1 text-xs font-medium text-[#000080] hover:underline"
                          >
                            +{overflow} more
                          </button>
                        )}
                        {isExpanded && (
                          <button
                            onClick={() => setExpandedDay(null)}
                            className="block w-full text-left pl-1 text-xs font-medium text-[#000080] hover:underline"
                          >
                            Show less
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Week View ───────────────────────────────────────────────────────────────

interface WeekViewProps {
  weekStart: Date;
  eventsByDate: Record<string, EventResponse[]>;
  onPrev: () => void;
  onNext: () => void;
  onEventClick: (id: string) => void;
}

function WeekView({ weekStart, eventsByDate, onPrev, onNext, onEventClick }: WeekViewProps) {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push(d);
  }

  const hours       = Array.from({length: 13}, (_, i) => i + 8); // 8am – 8pm
  const rangeStart  = 8;
  const rangeEnd    = 21;

  const weekLabel = `${weekStart.toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${days[6].toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`;

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-6 py-4">
        <button onClick={onPrev} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#000080] hover:bg-[#F3F4F6]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 className="text-lg font-bold text-[#000080]">{weekLabel}</h2>
        <button onClick={onNext} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#000080] hover:bg-[#F3F4F6]">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        {/* Header row */}
        <div className="grid min-w-[560px] bg-[#F3F4F6]" style={{gridTemplateColumns:"64px repeat(7,1fr)"}}>
          <div className="px-2 py-3 text-center text-xs font-bold text-[#000080]"/>
          {days.map((d, i) => (
            <div key={i} className="px-1 py-3 text-center">
              <div className="text-sm font-bold text-[#000080]">{DAYS[i]}</div>
              <div className="text-xs text-[#6B7280]">{d.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="relative grid min-w-[560px]" style={{gridTemplateColumns:"64px repeat(7,1fr)"}}>
          {/* Hour labels */}
          <div>
            {hours.map(h => (
              <div key={h} className="h-12 border-b border-[#F3F4F6] px-2 py-1 text-right text-xs text-[#6B7280]">
                {h === 12 ? "12 PM" : h < 12 ? `${h} AM` : `${h-12} PM`}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d, colIdx) => {
            const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
            const dayEvents = eventsByDate[iso] ?? [];
            return (
              <div key={colIdx} className="relative border-l border-[#F3F4F6]">
                {hours.map(h => <div key={h} className="h-12 border-b border-[#F3F4F6]"/>)}
                {dayEvents.map(ev => {
                  const hour = parseHour(ev.startTime);
                  if (hour === null || hour < rangeStart || hour >= rangeEnd) {
                    return (
                      <button key={ev.id} onClick={() => onEventClick(ev.id)}
                        className={`absolute left-0.5 right-0.5 top-0 truncate rounded px-1 py-0.5 text-left text-xs ${eventColor(ev.eventCategory)} hover:opacity-80`}
                        title={ev.title}
                      >
                        {ev.title}
                      </button>
                    );
                  }
                  const top = (hour - rangeStart) * 48;
                  return (
                    <button key={ev.id} onClick={() => onEventClick(ev.id)}
                      style={{top:`${top}px`, height:"44px"}}
                      className={`absolute left-0.5 right-0.5 overflow-hidden rounded px-1.5 py-1 text-left text-xs ${eventColor(ev.eventCategory)} hover:opacity-80`}
                      title={ev.title}
                    >
                      <div className="font-medium truncate">{ev.title}</div>
                      {ev.startTime && <div className="text-[10px] opacity-90">{fmtEpoch(ev.startTime)}</div>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
