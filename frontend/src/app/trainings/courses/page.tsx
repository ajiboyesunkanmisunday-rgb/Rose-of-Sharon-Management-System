"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";

interface Course {
  id: string;
  name: string;
  description: string;
  applications: number;
  currentStudents: number;
  pastStudents: number;
  status: "Active" | "Completed" | "Upcoming";
}

const mockCourses: Course[] = [
  {
    id: "course-1",
    name: "Water Baptism Class",
    description:
      "A foundational course preparing believers for water baptism through biblical teachings and spiritual readiness.",
    applications: 12,
    currentStudents: 28,
    pastStudents: 145,
    status: "Active",
  },
  {
    id: "course-2",
    name: "New Believers Foundation",
    description:
      "An introductory program designed to ground new converts in the basics of Christian faith and church life.",
    applications: 8,
    currentStudents: 35,
    pastStudents: 210,
    status: "Active",
  },
  {
    id: "course-3",
    name: "Leadership Training",
    description:
      "An advanced course equipping members with leadership skills for ministry and church service.",
    applications: 15,
    currentStudents: 20,
    pastStudents: 95,
    status: "Active",
  },
  {
    id: "course-4",
    name: "Marriage Counseling",
    description:
      "A comprehensive program for couples preparing for marriage or seeking to strengthen their union.",
    applications: 6,
    currentStudents: 14,
    pastStudents: 72,
    status: "Completed",
  },
  {
    id: "course-5",
    name: "Sunday School Teachers Training",
    description:
      "A specialized course to train and equip teachers for effective Sunday School ministry.",
    applications: 10,
    currentStudents: 0,
    pastStudents: 60,
    status: "Upcoming",
  },
  {
    id: "course-6",
    name: "Youth Ministry Training",
    description:
      "A dynamic training program preparing youth leaders for impactful ministry among young people.",
    applications: 9,
    currentStudents: 0,
    pastStudents: 48,
    status: "Upcoming",
  },
];

const statusBadgeColors: Record<string, string> = {
  Active: "bg-[#DCFCE7] text-[#16A34A]",
  Completed: "bg-[#F3F4F6] text-[#6B7280]",
  Upcoming: "bg-[#DBEAFE] text-[#2563EB]",
};

export default function CoursesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return mockCourses;
    const query = search.toLowerCase();
    return mockCourses.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
    );
  }, [search]);

  const handleSearch = () => {};

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-1">
        <h1 className="text-[28px] font-bold text-[#000000]">Trainings</h1>
      </div>
      <div className="mb-6">
        <p className="text-sm text-[#6B7280]">Courses</p>
      </div>

      {/* Top bar: search + add button */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={handleSearch}
            placeholder="Search courses..."
          />
        </div>

        <Button
          variant="primary"
          onClick={() => {}}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Add Course
        </Button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="rounded-xl border border-[#E5E7EB] bg-white p-5"
          >
            {/* Course Name */}
            <h3 className="mb-2 text-base font-bold text-[#000080]">
              {course.name}
            </h3>

            {/* Description */}
            <p className="mb-4 text-sm text-gray-500 line-clamp-2">
              {course.description}
            </p>

            {/* Stats Row */}
            <div className="mb-4 flex items-center gap-4 text-xs text-[#374151]">
              <span>
                <span className="font-semibold">{course.applications}</span>{" "}
                Applications
              </span>
              <span>
                <span className="font-semibold">{course.currentStudents}</span>{" "}
                Current
              </span>
              <span>
                <span className="font-semibold">{course.pastStudents}</span>{" "}
                Past
              </span>
            </div>

            {/* Status Badge + View Details */}
            <div className="flex items-center justify-between">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  statusBadgeColors[course.status] ||
                  "bg-gray-200 text-gray-700"
                }`}
              >
                {course.status}
              </span>

              <button
                onClick={() => router.push(`/trainings/courses/${course.id}`)}
                className="text-sm font-medium text-[#000080] transition-colors hover:text-[#000066] hover:underline"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
        {filteredCourses.length === 0 && (
          <div className="col-span-3 py-8 text-center text-gray-400">
            No courses found.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
