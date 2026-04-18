"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, UserPlus, ClipboardCheck, PhoneCall } from "lucide-react";

const kpiCards = [
  {
    label: "Total Members",
    value: "1,234",
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "Total Guests",
    value: "256",
    icon: UserPlus,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    label: "Today's Attendance",
    value: "892",
    icon: ClipboardCheck,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    label: "Active Follow-ups",
    value: "47",
    icon: PhoneCall,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
];

const recentActivities = [
  {
    id: "1",
    name: "Shola Damson",
    initials: "SD",
    description: "Added a call report for John Michael",
    time: "2 minutes ago",
  },
  {
    id: "2",
    name: "Aisha Bello",
    initials: "AB",
    description: "Registered a new first timer",
    time: "15 minutes ago",
  },
  {
    id: "3",
    name: "David Okoro",
    initials: "DO",
    description: "Updated member profile for Sarah Bamidele",
    time: "1 hour ago",
  },
  {
    id: "4",
    name: "Grace Adeyemi",
    initials: "GA",
    description: "Converted a first timer to second timer",
    time: "3 hours ago",
  },
  {
    id: "5",
    name: "Samuel Eze",
    initials: "SE",
    description: "Submitted visit report for new convert",
    time: "5 hours ago",
  },
];

const attendanceData = [
  { day: "Mon", value: 65 },
  { day: "Tue", value: 45 },
  { day: "Wed", value: 78 },
  { day: "Thu", value: 52 },
  { day: "Fri", value: 60 },
  { day: "Sat", value: 40 },
  { day: "Sun", value: 95 },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex items-center gap-4 rounded-lg bg-white p-5 shadow-sm border border-gray-100"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.iconBg}`}
              >
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

      {/* Two-column section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Activities
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                  {activity.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{activity.name}</span>{" "}
                    {activity.description}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Overview */}
        <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Attendance Overview
          </h2>
          <div className="flex h-64 items-end justify-between gap-3 px-2">
            {attendanceData.map((item) => (
              <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-blue-500 transition-all"
                  style={{ height: `${(item.value / 100) * 200}px` }}
                />
                <span className="text-xs text-gray-500">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
