"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";

type Tab = "applications" | "current" | "past" | "attendance";

interface CourseData {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  instructor: string;
  status: "Active" | "Completed" | "Upcoming";
}

interface Student {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  status: string;
}

const mockCourses: Record<string, CourseData> = {
  "course-1": {
    id: "course-1",
    name: "Water Baptism Class",
    description:
      "A foundational course preparing believers for water baptism through biblical teachings and spiritual readiness.",
    startDate: "Jan 15, 2026",
    endDate: "Mar 15, 2026",
    instructor: "Pastor David Adeleke",
    status: "Active",
  },
  "course-2": {
    id: "course-2",
    name: "New Believers Foundation",
    description:
      "An introductory program designed to ground new converts in the basics of Christian faith and church life.",
    startDate: "Feb 1, 2026",
    endDate: "Apr 30, 2026",
    instructor: "Pastor Grace Okafor",
    status: "Active",
  },
  "course-3": {
    id: "course-3",
    name: "Leadership Training",
    description:
      "An advanced course equipping members with leadership skills for ministry and church service.",
    startDate: "Mar 1, 2026",
    endDate: "Jun 30, 2026",
    instructor: "Pastor Emmanuel Nwosu",
    status: "Active",
  },
  "course-4": {
    id: "course-4",
    name: "Marriage Counseling",
    description:
      "A comprehensive program for couples preparing for marriage or seeking to strengthen their union.",
    startDate: "Oct 1, 2025",
    endDate: "Dec 20, 2025",
    instructor: "Deacon Samuel Balogun",
    status: "Completed",
  },
  "course-5": {
    id: "course-5",
    name: "Sunday School Teachers Training",
    description:
      "A specialized course to train and equip teachers for effective Sunday School ministry.",
    startDate: "May 1, 2026",
    endDate: "Jul 31, 2026",
    instructor: "Deaconess Ruth Adeyemi",
    status: "Upcoming",
  },
  "course-6": {
    id: "course-6",
    name: "Youth Ministry Training",
    description:
      "A dynamic training program preparing youth leaders for impactful ministry among young people.",
    startDate: "Jun 1, 2026",
    endDate: "Aug 31, 2026",
    instructor: "Pastor Blessing Okoro",
    status: "Upcoming",
  },
};

const mockApplications: Student[] = [
  { id: "a1", name: "John Adewale", phone: "08012345678", email: "john.adewale@email.com", date: "Apr 1, 2026", status: "Pending" },
  { id: "a2", name: "Mary Okonkwo", phone: "08023456789", email: "mary.okonkwo@email.com", date: "Apr 3, 2026", status: "Pending" },
  { id: "a3", name: "Peter Balogun", phone: "08034567890", email: "peter.balogun@email.com", date: "Apr 5, 2026", status: "Approved" },
  { id: "a4", name: "Sarah Eze", phone: "08045678901", email: "sarah.eze@email.com", date: "Apr 7, 2026", status: "Pending" },
  { id: "a5", name: "Daniel Okoro", phone: "08056789012", email: "daniel.okoro@email.com", date: "Apr 9, 2026", status: "Rejected" },
];

const mockCurrentStudents: Student[] = [
  { id: "c1", name: "Grace Bamidele", phone: "08067890123", email: "grace.bamidele@email.com", date: "Jan 15, 2026", status: "Active" },
  { id: "c2", name: "Emmanuel Nwosu", phone: "08078901234", email: "emmanuel.nwosu@email.com", date: "Jan 15, 2026", status: "Active" },
  { id: "c3", name: "Blessing Adeyemi", phone: "08089012345", email: "blessing.adeyemi@email.com", date: "Feb 1, 2026", status: "Active" },
  { id: "c4", name: "David Okafor", phone: "08090123456", email: "david.okafor@email.com", date: "Feb 1, 2026", status: "On Hold" },
  { id: "c5", name: "Ruth Adeleke", phone: "08001234567", email: "ruth.adeleke@email.com", date: "Mar 1, 2026", status: "Active" },
];

const mockPastStudents: Student[] = [
  { id: "p1", name: "James Balogun", phone: "08012340001", email: "james.balogun@email.com", date: "Dec 20, 2025", status: "A" },
  { id: "p2", name: "Esther Okonkwo", phone: "08012340002", email: "esther.okonkwo@email.com", date: "Dec 20, 2025", status: "B+" },
  { id: "p3", name: "Michael Eze", phone: "08012340003", email: "michael.eze@email.com", date: "Dec 20, 2025", status: "A+" },
  { id: "p4", name: "Deborah Okoro", phone: "08012340004", email: "deborah.okoro@email.com", date: "Dec 20, 2025", status: "B" },
  { id: "p5", name: "Samuel Bamidele", phone: "08012340005", email: "samuel.bamidele@email.com", date: "Dec 20, 2025", status: "A" },
];

const mockAttendance: Student[] = [
  { id: "at1", name: "Grace Bamidele", phone: "08067890123", email: "grace.bamidele@email.com", date: "Apr 13, 2026", status: "Present" },
  { id: "at2", name: "Emmanuel Nwosu", phone: "08078901234", email: "emmanuel.nwosu@email.com", date: "Apr 13, 2026", status: "Absent" },
  { id: "at3", name: "Blessing Adeyemi", phone: "08089012345", email: "blessing.adeyemi@email.com", date: "Apr 13, 2026", status: "Present" },
  { id: "at4", name: "David Okafor", phone: "08090123456", email: "david.okafor@email.com", date: "Apr 13, 2026", status: "Present" },
  { id: "at5", name: "Ruth Adeleke", phone: "08001234567", email: "ruth.adeleke@email.com", date: "Apr 13, 2026", status: "Absent" },
];

const statusBadgeColors: Record<string, string> = {
  Active: "bg-[#DCFCE7] text-[#16A34A]",
  Completed: "bg-[#F3F4F6] text-[#6B7280]",
  Upcoming: "bg-[#DBEAFE] text-[#2563EB]",
  Pending: "bg-[#FEF9C3] text-[#CA8A04]",
  Approved: "bg-[#DCFCE7] text-[#16A34A]",
  Rejected: "bg-[#FEE2E2] text-[#DC2626]",
  "On Hold": "bg-[#FEF9C3] text-[#CA8A04]",
  Present: "bg-[#DCFCE7] text-[#16A34A]",
  Absent: "bg-[#FEE2E2] text-[#DC2626]",
};

const tabs: { key: Tab; label: string }[] = [
  { key: "applications", label: "Applications" },
  { key: "current", label: "Current Students" },
  { key: "past", label: "Past Students" },
  { key: "attendance", label: "Attendance" },
];

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<Tab>("applications");

  const course = mockCourses[params.id as string];

  if (!course) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-400">Course not found.</p>
        </div>
      </DashboardLayout>
    );
  }

  const getTabData = (): Student[] => {
    switch (activeTab) {
      case "applications":
        return mockApplications;
      case "current":
        return mockCurrentStudents;
      case "past":
        return mockPastStudents;
      case "attendance":
        return mockAttendance;
    }
  };

  const getStatusLabel = (): string => {
    switch (activeTab) {
      case "past":
        return "Grade";
      default:
        return "Status";
    }
  };

  const getActions = (student: Student): React.ReactNode => {
    switch (activeTab) {
      case "applications":
        return (
          <div className="flex items-center gap-2">
            {student.status === "Pending" && (
              <button
                onClick={() => console.log("Approve:", student.id)}
                className="rounded-lg bg-[#000080] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#000066]"
              >
                Approve
              </button>
            )}
            <button
              onClick={() => console.log("Remove:", student.id)}
              className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#DC2626] transition-colors hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        );
      case "attendance":
        return (
          <button
            onClick={() => console.log("Mark Attendance:", student.id)}
            className="rounded-lg border border-[#000080] px-3 py-1.5 text-xs font-medium text-[#000080] transition-colors hover:bg-[#000080]/5"
          >
            Mark Attendance
          </button>
        );
      default:
        return (
          <button
            onClick={() => console.log("Remove:", student.id)}
            className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#DC2626] transition-colors hover:bg-red-50"
          >
            Remove
          </button>
        );
    }
  };

  const tabData = getTabData();

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/trainings/courses")}
            className="flex items-center text-[#000080] transition-colors hover:text-[#000066]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-[#000080]">
            {course.name}
          </h2>
        </div>
      </div>

      {/* Course Info Card */}
      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Course Name</p>
            <p className="mt-1 text-sm font-semibold text-[#111827]">
              {course.name}
            </p>
          </div>
          <div className="lg:col-span-2">
            <p className="text-xs font-medium text-[#6B7280]">Description</p>
            <p className="mt-1 text-sm text-[#374151]">
              {course.description}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Start Date</p>
            <p className="mt-1 text-sm text-[#374151]">{course.startDate}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">End Date</p>
            <p className="mt-1 text-sm text-[#374151]">{course.endDate}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Instructor</p>
            <p className="mt-1 text-sm text-[#374151]">{course.instructor}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Status</p>
            <span
              className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                statusBadgeColors[course.status] || "bg-gray-200 text-gray-700"
              }`}
            >
              {course.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-6 border-b border-[#E5E7EB]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[#000080] text-[#000080]"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Name
              </th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">
                Phone
              </th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">
                Email
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Date
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                {getStatusLabel()}
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tabData.map((student) => (
              <tr
                key={student.id}
                className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                style={{ height: "56px" }}
              >
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {student.name}
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                  {student.phone}
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                  {student.email}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {student.date}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      statusBadgeColors[student.status] ||
                      "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="px-4 py-3">{getActions(student)}</td>
              </tr>
            ))}
            {tabData.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
