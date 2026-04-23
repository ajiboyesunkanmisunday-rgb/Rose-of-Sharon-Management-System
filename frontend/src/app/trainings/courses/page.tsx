"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import { trainingCourses } from "@/lib/mock-data";
import { CourseStatus } from "@/lib/types";

const statusBadgeColors: Record<CourseStatus, string> = {
  Active: "bg-[#DCFCE7] text-[#16A34A]",
  Completed: "bg-[#F3F4F6] text-[#6B7280]",
  Upcoming: "bg-[#DBEAFE] text-[#2563EB]",
};

export default function CoursesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return trainingCourses;
    const q = search.toLowerCase();
    return trainingCourses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <DashboardLayout>
      <div className="mb-1">
        <h1 className="text-[28px] font-bold text-[#000000]">Trainings</h1>
      </div>
      <div className="mb-6">
        <p className="text-sm text-[#6B7280]">Courses</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={() => {}}
            placeholder="Search courses..."
          />
        </div>

        <Button
          variant="primary"
          onClick={() => router.push("/trainings/courses/add")}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Add Course
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="rounded-xl border border-[#E5E7EB] bg-white p-5"
          >
            <h3 className="mb-2 text-base font-bold text-[#000080]">
              {course.name}
            </h3>
            <p className="mb-3 text-sm text-gray-500 line-clamp-2">
              {course.description}
            </p>
            <p className="mb-4 text-xs text-[#6B7280]">
              Instructor: <strong className="text-[#374151]">{course.instructor}</strong>
            </p>

            <div className="mb-4 flex items-center gap-4 text-xs text-[#374151]">
              <span>
                <span className="font-semibold">{course.applications}</span> Applications
              </span>
              <span>
                <span className="font-semibold">{course.currentStudents}</span> Current
              </span>
              <span>
                <span className="font-semibold">{course.pastStudents}</span> Past
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  statusBadgeColors[course.status] || "bg-gray-200 text-gray-700"
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
          <div className="col-span-3 rounded-xl border border-[#E5E7EB] bg-white p-12 text-center text-sm text-gray-400">
            No courses found.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
