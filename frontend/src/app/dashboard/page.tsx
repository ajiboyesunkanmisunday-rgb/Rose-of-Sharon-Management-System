"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, UserPlus, ClipboardCheck, PhoneCall, Cake, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { urgentFollowUps, birthdayReminders } from "@/lib/mock-data";

const kpiCards = [
  { label: "Total Members", value: "1,234", icon: Users, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { label: "Total Guests", value: "256", icon: UserPlus, iconBg: "bg-green-100", iconColor: "text-green-600" },
  { label: "Last Sunday's Attendance", value: "892", icon: ClipboardCheck, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  { label: "Active Follow-ups", value: "47", icon: PhoneCall, iconBg: "bg-orange-100", iconColor: "text-orange-600" },
];

const attendanceData = [
  { day: "Mar 16", value: 780 },
  { day: "Mar 23", value: 820 },
  { day: "Mar 30", value: 910 },
  { day: "Apr 6", value: 855 },
  { day: "Apr 13", value: 890 },
  { day: "Apr 20", value: 892 },
];

export default function DashboardPage() {
  const router = useRouter();
  const maxAttendance = Math.max(...attendanceData.map((d) => d.value));
  const topFollowUps = urgentFollowUps.slice(0, 5);
  const upcomingCelebrations = birthdayReminders.slice(0, 5);

  const severityColor = (days: number) =>
    days >= 10 ? "bg-red-100 text-red-700" : days >= 5 ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-800";

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="flex items-center gap-4 rounded-lg bg-white p-5 shadow-sm border border-gray-100">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.iconBg}`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Urgent Follow-up */}
        <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Urgent Follow-up</h2>
            <button
              onClick={() => router.push("/dashboard/urgent-follow-up")}
              className="text-sm font-medium text-[#000080] hover:underline"
            >
              View More
            </button>
          </div>
          <div className="space-y-3">
            {topFollowUps.map((f) => (
              <div key={f.id} className="flex items-start justify-between gap-3 rounded-lg border border-[#E5E7EB] p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{f.name}</p>
                  <p className="text-xs text-gray-500">{f.phone}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Assigned: <span className="text-gray-700">{f.assignedOfficer}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${severityColor(f.daysOverdue)}`}>
                    {f.daysOverdue === 0 ? "Due today" : `${f.daysOverdue} days overdue`}
                  </span>
                  <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-medium text-[#374151]">
                    {f.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Overview */}
        <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Last 6 Sundays</h2>
          <div className="flex h-64 items-end justify-between gap-3 px-2">
            {attendanceData.map((item) => (
              <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium text-gray-700">{item.value}</span>
                <div
                  className="w-full rounded-t-md bg-blue-500 transition-all"
                  style={{ height: `${(item.value / maxAttendance) * 200}px` }}
                />
                <span className="text-xs text-gray-500">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Birthdays & Anniversaries Widget */}
      <div className="mt-6 rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Birthdays &amp; Anniversaries</h2>
          <span className="text-xs font-medium text-[#6B7280]">Next 30 days</span>
        </div>
        <div className="space-y-3">
          {upcomingCelebrations.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] p-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.type === "Birthday" ? "bg-pink-100" : "bg-purple-100"}`}>
                  {item.type === "Birthday"
                    ? <Cake className="h-5 w-5 text-pink-600" />
                    : <Heart className="h-5 w-5 text-purple-600" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  {item.phone && <p className="text-xs text-gray-500">{item.phone}</p>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${item.type === "Birthday" ? "bg-pink-100 text-pink-700" : "bg-purple-100 text-purple-700"}`}>
                  {item.type}
                </span>
                <span className="text-[11px] font-medium text-gray-500">
                  {item.daysUntil === 0 ? "Today 🎉" : item.daysUntil === 1 ? "Tomorrow" : `In ${item.daysUntil} days`} · {item.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
