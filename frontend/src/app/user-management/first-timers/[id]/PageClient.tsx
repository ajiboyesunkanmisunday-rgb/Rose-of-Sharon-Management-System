"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import { profileDetails, sampleReports } from "@/lib/mock-data";

type Tab = "notes" | "calls" | "visits";

const REPORTS_PER_PAGE = 3;

export default function ViewFirstTimerPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const [activeTab, setActiveTab] = useState<Tab>("visits");
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(sampleReports.length / REPORTS_PER_PAGE);
  const paginatedReports = sampleReports.slice(
    (currentPage - 1) * REPORTS_PER_PAGE,
    currentPage * REPORTS_PER_PAGE
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: "notes", label: "Notes" },
    { key: "calls", label: "Call History" },
    { key: "visits", label: "Visits History" },
  ];

  const handleDeleteReport = (reportId: string) => {
    console.log("Delete report:", reportId);
  };

  const detailsRow1 = [
    { label: "First Name", value: profileDetails.firstName },
    { label: "Last Name", value: profileDetails.lastName },
    { label: "Email", value: profileDetails.email },
    { label: "Phone Number", value: profileDetails.phoneNumber },
    { label: "WhatsApp Number", value: profileDetails.whatsappNumber },
    { label: "Address", value: profileDetails.address },
  ];

  const detailsRow2 = [
    { label: "Gender", value: profileDetails.gender },
    { label: "Date of Birth", value: profileDetails.dateOfBirth },
    { label: "Marital Status", value: profileDetails.maritalStatus },
    { label: "Occupation", value: profileDetails.occupation },
    { label: "Date", value: profileDetails.date },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">User Management</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
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
          <h2 className="text-[22px] font-bold text-[#000080]">View First Timer</h2>
        </div>
      </div>

      {/* Basic Details Section */}
      <div className="mb-8 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <h2 className="mb-6 text-lg font-bold text-[#000000]">
          Basic Details
        </h2>

        {/* Row 1 */}
        <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 lg:grid-cols-6">
          {detailsRow1.map((item) => (
            <div key={item.label}>
              <p className="text-xs font-medium text-[#6B7280]">{item.label}</p>
              <p className="mt-1 text-sm text-[#111827]">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 lg:grid-cols-5">
          {detailsRow2.map((item) => (
            <div key={item.label}>
              <p className="text-xs font-medium text-[#6B7280]">{item.label}</p>
              <p className="mt-1 text-sm text-[#111827]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-[#E5E7EB]">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
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
      </div>

      {/* Edit Button */}
      <div className="mb-6 flex justify-end">
        <Button
          variant="primary"
          onClick={() => router.push(`/user-management/first-timers/${id}/edit`)}
        >
          Edit
        </Button>
      </div>

      {/* Reports Section */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#000000]">Reports</h3>
        <Button
          variant="primary"
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
          Add Visit Report
        </Button>
      </div>

      {/* Report Cards */}
      <div className="space-y-4">
        {paginatedReports.map((report) => (
          <div
            key={report.id}
            className="rounded-xl border border-[#E5E7EB] bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <p className="flex-1 text-sm text-[#374151]">{report.content}</p>
              <button
                onClick={() => handleDeleteReport(report.id)}
                className="ml-4 flex shrink-0 items-center justify-center text-red-500 transition-colors hover:text-red-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
            <div className="mt-3 text-xs text-[#6B7280]">
              <span>Added by: {report.addedBy}</span>
              <span className="ml-4">{report.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </DashboardLayout>
  );
}
