"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { calendarEvents } from "@/lib/mock-data";
import { CalendarEventCategory } from "@/lib/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const categoryColors: Record<CalendarEventCategory, string> = {
  Service: "bg-[#000080]",
  "Bible Study": "bg-green-500",
  Youth: "bg-purple-500",
  Birthday: "bg-orange-500",
  Meeting: "bg-yellow-500",
  Other: "bg-gray-500",
};

const legend: { label: string; color: string }[] = [
  { label: "Service", color: "bg-[#000080]" },
  { label: "Bible Study", color: "bg-green-500" },
  { label: "Youth", color: "bg-purple-500" },
  { label: "Birthday", color: "bg-orange-500" },
  { label: "Meeting", color: "bg-yellow-500" },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(3); // April

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return calendarEvents.filter((e) => e.date === dateStr);
  };

  const upcomingEvents = useMemo(() => {
    const today = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-15`;
    return calendarEvents
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const todayStr = "2026-04-15";

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-[#000000]">Calendar</h1>
        <Button
          variant="primary"
          onClick={() => router.push("/calendar/events/add")}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Add Event
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-6 py-4">
            <button
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#000080] transition-colors hover:bg-[#F3F4F6]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h2 className="text-lg font-bold text-[#000080]">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#000080] transition-colors hover:bg-[#F3F4F6]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            <div className="grid grid-cols-7 bg-[#F3F4F6]">
              {DAYS.map((day) => (
                <div key={day} className="px-2 py-3 text-center text-sm font-bold text-[#000080]">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarCells.map((day, idx) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                const dateStr = day
                  ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  : "";
                const isToday = dateStr === todayStr;

                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] border-b border-r border-[#F3F4F6] p-2 ${
                      day ? "bg-white" : "bg-[#FAFAFA]"
                    }`}
                  >
                    {day && (
                      <>
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                            isToday ? "bg-[#000080] font-bold text-white" : "text-[#374151]"
                          }`}
                        >
                          {day}
                        </span>
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <button
                              key={ev.id}
                              onClick={() => router.push(`/calendar/events/${ev.id}`)}
                              className={`block w-full truncate rounded px-1 py-0.5 text-left text-xs text-white ${categoryColors[ev.category]} transition-opacity hover:opacity-80`}
                              title={`${ev.name} · ${ev.time}`}
                            >
                              {ev.name}
                            </button>
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-xs text-[#6B7280]">
                              +{dayEvents.length - 3} more
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

          <div className="mt-4 flex flex-wrap gap-4 rounded-xl border border-[#E5E7EB] bg-white px-5 py-3">
            {legend.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${item.color}`} />
                <span className="text-xs text-[#374151]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="lg:w-80">
          <h3 className="mb-3 text-sm font-semibold text-[#111827]">Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="rounded-xl border border-[#E5E7EB] bg-white p-6 text-sm text-[#6B7280]">
                No upcoming events.
              </p>
            ) : (
              upcomingEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => router.push(`/calendar/events/${ev.id}`)}
                  className="block w-full rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition-colors hover:border-[#000080]"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${categoryColors[ev.category]}`} />
                    <span className="text-xs font-medium text-[#6B7280]">
                      {new Date(ev.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {ev.time}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-[#111827]">{ev.name}</p>
                </button>
              ))
            )}
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}
