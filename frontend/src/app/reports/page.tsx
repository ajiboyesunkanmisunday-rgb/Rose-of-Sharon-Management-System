"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { toCSV, downloadCSV } from "@/lib/csv";
import {
  Users,
  UserPlus,
  CheckCircle,
  MessageSquare,
  Download,
} from "lucide-react";

const kpiCards = [
  {
    label: "Total Members",
    value: "1,247",
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    label: "New Members This Month",
    value: "23",
    icon: UserPlus,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    label: "Follow-up Completion Rate",
    value: "87%",
    icon: CheckCircle,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    label: "Messages Sent",
    value: "456",
    icon: MessageSquare,
    iconBg: "bg-[#000080]/10",
    iconColor: "text-[#000080]",
  },
];

const attendanceData = [
  {
    service: "Sunday Service",
    date: "Apr 13, 2026",
    attendance: 892,
    growth: "+5.2%",
    positive: true,
  },
  {
    service: "Tuesday Bible Study",
    date: "Apr 8, 2026",
    attendance: 345,
    growth: "+2.1%",
    positive: true,
  },
  {
    service: "Thursday Prayer Meeting",
    date: "Apr 10, 2026",
    attendance: 278,
    growth: "-1.3%",
    positive: false,
  },
  {
    service: "Youth Fellowship",
    date: "Apr 11, 2026",
    attendance: 156,
    growth: "+8.7%",
    positive: true,
  },
  {
    service: "House Fellowship",
    date: "Apr 9, 2026",
    attendance: 98,
    growth: "+3.4%",
    positive: true,
  },
];

const followUpData = [
  { category: "First Timers", total: 45, completed: 38, pending: 7 },
  { category: "Second Timers", total: 32, completed: 28, pending: 4 },
  { category: "New Converts", total: 18, completed: 15, pending: 3 },
  { category: "Prayer Requests", total: 67, completed: 58, pending: 9 },
];

const activityLog = [
  {
    date: "Apr 15, 2026",
    action: "Generated attendance report",
    performedBy: "Admin",
    details: "Weekly attendance summary exported",
  },
  {
    date: "Apr 15, 2026",
    action: "New member registered",
    performedBy: "Shola Damson",
    details: "John Adebayo added as first timer",
  },
  {
    date: "Apr 14, 2026",
    action: "Follow-up completed",
    performedBy: "Aisha Bello",
    details: "Called Grace Omotola - second timer",
  },
  {
    date: "Apr 14, 2026",
    action: "SMS campaign sent",
    performedBy: "Admin",
    details: "Easter service reminder to 456 members",
  },
  {
    date: "Apr 13, 2026",
    action: "Attendance recorded",
    performedBy: "David Okoro",
    details: "Sunday Service - 892 attendees logged",
  },
  {
    date: "Apr 13, 2026",
    action: "Member profile updated",
    performedBy: "Grace Adeyemi",
    details: "Updated contact info for Sarah Bamidele",
  },
  {
    date: "Apr 12, 2026",
    action: "Follow-up assigned",
    performedBy: "Admin",
    details: "7 new first timers assigned to team leads",
  },
  {
    date: "Apr 12, 2026",
    action: "Report exported",
    performedBy: "Samuel Eze",
    details: "Monthly growth report downloaded as CSV",
  },
  {
    date: "Apr 11, 2026",
    action: "New convert recorded",
    performedBy: "Aisha Bello",
    details: "Funmi Adekoya moved to new converts",
  },
  {
    date: "Apr 11, 2026",
    action: "Visit report submitted",
    performedBy: "David Okoro",
    details: "Home visit to Chinedu Nwankwo completed",
  },
];

const reportTypes = [
  "All",
  "Attendance",
  "Follow-up",
  "Member Growth",
  "Communication",
];

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("All");
  const [showReportModal, setShowReportModal] = useState(false);

  // Convert "MMM DD, YYYY" style to sortable YYYY-MM-DD for comparison.
  const toISO = (dateStr: string): string => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  const filteredAttendance = useMemo(() => {
    if (!startDate && !endDate) return attendanceData;
    return attendanceData.filter((row) => {
      const iso = toISO(row.date);
      if (!iso) return true;
      if (startDate && iso < startDate) return false;
      if (endDate && iso > endDate) return false;
      return true;
    });
  }, [startDate, endDate]);

  const filteredActivity = useMemo(() => {
    if (!startDate && !endDate) return activityLog;
    return activityLog.filter((row) => {
      const iso = toISO(row.date);
      if (!iso) return true;
      if (startDate && iso < startDate) return false;
      if (endDate && iso > endDate) return false;
      return true;
    });
  }, [startDate, endDate]);

  const reportSummary = useMemo(() => {
    const totalAttendance = filteredAttendance.reduce((sum, r) => sum + r.attendance, 0);
    const totalFollowUps = followUpData.reduce((sum, r) => sum + r.total, 0);
    const completedFollowUps = followUpData.reduce((sum, r) => sum + r.completed, 0);
    return {
      totalAttendance,
      totalFollowUps,
      completedFollowUps,
      completionRate: totalFollowUps > 0 ? Math.round((completedFollowUps / totalFollowUps) * 100) : 0,
      servicesIncluded: filteredAttendance.length,
      activityEntries: filteredActivity.length,
    };
  }, [filteredAttendance, filteredActivity]);

  const handleGenerateReport = () => {
    setShowReportModal(true);
  };

  const handleExportCSV = () => {
    const attendanceCSV = toCSV(filteredAttendance);
    downloadCSV(attendanceCSV, `rosms-attendance-${reportType.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
      </div>

      {/* Date Range Filter Row */}
      <div className="mb-8 flex flex-wrap items-end gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
          >
            {reportTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <Button variant="primary" onClick={handleGenerateReport}>
          Generate Report
        </Button>
        <Button
          variant="secondary"
          onClick={handleExportCSV}
          icon={<Download className="h-4 w-4" />}
        >
          <span className="hidden sm:inline">Export CSV</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
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

      {/* Two-column Report Section */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Attendance Overview */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Attendance Overview
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="pb-3 text-left font-medium text-gray-500">
                    Service
                  </th>
                  <th className="pb-3 text-left font-medium text-gray-500">
                    Date
                  </th>
                  <th className="pb-3 text-right font-medium text-gray-500">
                    Attendance
                  </th>
                  <th className="pb-3 text-right font-medium text-gray-500">
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((row) => (
                  <tr
                    key={row.service}
                    className="border-b border-[#E5E7EB] last:border-0"
                  >
                    <td className="py-3 font-medium text-gray-900">
                      {row.service}
                    </td>
                    <td className="py-3 text-gray-500">{row.date}</td>
                    <td className="py-3 text-right text-gray-900">
                      {row.attendance}
                    </td>
                    <td
                      className={`py-3 text-right font-medium ${
                        row.positive ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {row.growth}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Follow-up Summary */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Follow-up Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="pb-3 text-left font-medium text-gray-500">
                    Category
                  </th>
                  <th className="pb-3 text-right font-medium text-gray-500">
                    Total
                  </th>
                  <th className="pb-3 text-right font-medium text-gray-500">
                    Completed
                  </th>
                  <th className="pb-3 text-right font-medium text-gray-500">
                    Pending
                  </th>
                </tr>
              </thead>
              <tbody>
                {followUpData.map((row) => (
                  <tr
                    key={row.category}
                    className="border-b border-[#E5E7EB] last:border-0"
                  >
                    <td className="py-3 font-medium text-gray-900">
                      {row.category}
                    </td>
                    <td className="py-3 text-right text-gray-900">
                      {row.total}
                    </td>
                    <td className="py-3 text-right text-green-600">
                      {row.completed}
                    </td>
                    <td className="py-3 text-right text-orange-500">
                      {row.pending}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Recent Activity Log
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="pb-3 text-left font-medium text-gray-500">
                  Date
                </th>
                <th className="pb-3 text-left font-medium text-gray-500">
                  Action
                </th>
                <th className="hidden sm:table-cell pb-3 text-left font-medium text-gray-500">
                  Performed By
                </th>
                <th className="hidden sm:table-cell pb-3 text-left font-medium text-gray-500">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredActivity.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-[#E5E7EB] last:border-0"
                >
                  <td className="whitespace-nowrap py-3 text-gray-500">
                    {row.date}
                  </td>
                  <td className="py-3 font-medium text-gray-900">
                    {row.action}
                  </td>
                  <td className="hidden sm:table-cell py-3 text-gray-700">{row.performedBy}</td>
                  <td className="hidden sm:table-cell py-3 text-gray-500">{row.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Summary"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-[#E5E7EB] p-4">
              <p className="text-xs font-medium text-[#6B7280]">Total Attendance</p>
              <p className="mt-1 text-2xl font-bold text-[#000080]">
                {reportSummary.totalAttendance.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-[#E5E7EB] p-4">
              <p className="text-xs font-medium text-[#6B7280]">Services Included</p>
              <p className="mt-1 text-2xl font-bold text-[#000080]">
                {reportSummary.servicesIncluded}
              </p>
            </div>
            <div className="rounded-lg border border-[#E5E7EB] p-4">
              <p className="text-xs font-medium text-[#6B7280]">Follow-up Total</p>
              <p className="mt-1 text-2xl font-bold text-[#000080]">
                {reportSummary.totalFollowUps}
              </p>
            </div>
            <div className="rounded-lg border border-[#E5E7EB] p-4">
              <p className="text-xs font-medium text-[#6B7280]">Completion Rate</p>
              <p className="mt-1 text-2xl font-bold text-[#000080]">
                {reportSummary.completionRate}%
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-[#F9FAFB] p-3 text-xs text-[#6B7280]">
            <strong>Filters:</strong>{" "}
            {startDate || endDate
              ? `${startDate || "start"} → ${endDate || "end"}`
              : "No date filter applied"}
            {" · "}Type: {reportType}
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowReportModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleExportCSV}>
              Export CSV
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
