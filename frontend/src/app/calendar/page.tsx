"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface CalendarEvent {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string;
  color: string;
}

const mockEvents: CalendarEvent[] = [
  // Sundays in April 2026
  { id: "e1", name: "Sunday Service", date: "2026-04-05", time: "9:00 AM", color: "bg-[#000080]" },
  { id: "e2", name: "Sunday Service", date: "2026-04-12", time: "9:00 AM", color: "bg-[#000080]" },
  { id: "e3", name: "Sunday Service", date: "2026-04-19", time: "9:00 AM", color: "bg-[#000080]" },
  { id: "e4", name: "Sunday Service", date: "2026-04-26", time: "9:00 AM", color: "bg-[#000080]" },
  // Wednesdays - Bible Study
  { id: "e5", name: "Bible Study", date: "2026-04-01", time: "6:30 PM", color: "bg-green-500" },
  { id: "e6", name: "Bible Study", date: "2026-04-08", time: "6:30 PM", color: "bg-green-500" },
  { id: "e7", name: "Bible Study", date: "2026-04-15", time: "6:30 PM", color: "bg-green-500" },
  { id: "e8", name: "Bible Study", date: "2026-04-22", time: "6:30 PM", color: "bg-green-500" },
  { id: "e9", name: "Bible Study", date: "2026-04-29", time: "6:30 PM", color: "bg-green-500" },
  // Fridays - Youth Meeting
  { id: "e10", name: "Youth Meeting", date: "2026-04-10", time: "5:00 PM", color: "bg-purple-500" },
  { id: "e11", name: "Youth Meeting", date: "2026-04-24", time: "5:00 PM", color: "bg-purple-500" },
  // Birthday
  { id: "e12", name: "Birthday: John M.", date: "2026-04-16", time: "All Day", color: "bg-orange-500" },
  // Extra events for May
  { id: "e13", name: "Sunday Service", date: "2026-05-03", time: "9:00 AM", color: "bg-[#000080]" },
  { id: "e14", name: "Bible Study", date: "2026-05-06", time: "6:30 PM", color: "bg-green-500" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const legend = [
  { label: "Sunday Service", color: "bg-[#000080]" },
  { label: "Bible Study", color: "bg-green-500" },
  { label: "Youth Meeting", color: "bg-purple-500" },
  { label: "Birthday", color: "bg-orange-500" },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarPage() {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(3); // April = 3 (0-indexed)

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const eventsForMonth = useMemo(() => {
    const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    return mockEvents.filter((e) => e.date.startsWith(monthStr));
  }, [currentYear, currentMonth]);

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return mockEvents.filter((e) => e.date === dateStr);
  };

  const upcomingEvents = useMemo(() => {
    const today = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-15`;
    return mockEvents
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

  // Build calendar grid
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const todayStr = "2026-04-15";

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Calendar</h1>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Calendar Grid */}
        <div className="flex-1">
          {/* Month Navigation */}
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

          {/* Calendar Table */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 bg-[#F3F4F6]">
              {DAYS.map((day) => (
                <div key={day} className="px-2 py-3 text-center text-sm font-bold text-[#000080]">
                  {day}
                </div>
              ))}
            </div>
            {/* Day cells */}
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
                    className={`min-h-[80px] border-b border-r border-[#F3F4F6] p-2 ${
                      day ? "bg-white" : "bg-[#FAFAFA]"
                    }`}
                  >
                    {day && (
                      <>
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                            isToday
                              ? "bg-[#000080] font-bold text-white"
                              : "text-[#374151]"
                          }`}
                        >
                          {day}
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {dayEvents.map((ev) => (
                            <span
                              key={ev.id}
                              className={`h-2 w-2 rounded-full ${ev.color}`}
                              title={ev.name}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 rounded-xl border border-[#E5E7EB] bg-white px-5 py-3">
            {legend.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${item.color}`} />
                <span className="text-sm text-[#6B7280]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="w-full lg:w-[320px]">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-[#000080]">Upcoming Events</h3>
            <div className="flex flex-col gap-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 rounded-lg border border-[#F3F4F6] p-3"
                >
                  <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${event.color}`} />
                  <div>
                    <p className="text-sm font-bold text-[#111827]">{event.name}</p>
                    <p className="text-xs text-[#6B7280]">
                      {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">{event.time}</p>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-sm text-gray-400">No upcoming events.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
