"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import AddNotesModal from "@/components/user-management/AddNotesModal";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { profileDetails, sampleReports, sampleRequests } from "@/lib/mock-data";

type Tab = "notes" | "requests" | "sms" | "email";

const REPORTS_PER_PAGE = 3;

export default function ViewMemberProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const [currentPage, setCurrentPage] = useState(1);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const totalPages = Math.ceil(sampleReports.length / REPORTS_PER_PAGE);
  const paginatedReports = sampleReports.slice(
    (currentPage - 1) * REPORTS_PER_PAGE,
    currentPage * REPORTS_PER_PAGE
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: "notes", label: "Notes" },
    { key: "requests", label: "Requests" },
    { key: "sms", label: "SMS" },
    { key: "email", label: "Email" },
  ];

  const handleDeleteReport = (reportId: string) => {
    console.log("Delete report:", reportId);
  };

  const handleConfirmDelete = () => {
    console.log("Delete member:", params.id);
    setShowDeleteModal(false);
    router.push("/user-management/members");
  };

  const detailsRow1 = [
    { label: "First Name", value: profileDetails.firstName },
    { label: "Email", value: profileDetails.email },
    { label: "Address", value: profileDetails.address },
  ];

  const detailsRow2 = [
    { label: "Last Name", value: profileDetails.lastName },
    { label: "Phone Number", value: profileDetails.phoneNumber },
    { label: "Group", value: profileDetails.group },
  ];

  const detailsRow3 = [
    { label: "Gender", value: profileDetails.gender },
    { label: "Date of Birth", value: profileDetails.dateOfBirth },
    { label: "Date Joined", value: profileDetails.dateJoined },
  ];

  const detailsRow4 = [
    { label: "Marital Status", value: profileDetails.maritalStatus },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">
          User Management
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/user-management/members")}
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
            Member Profile
          </h2>
        </div>
      </div>

      {/* Profile Section */}
      <div className="mb-8 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Profile Photo Placeholder with edit pencil */}
          <div className="relative flex h-[180px] w-[150px] shrink-0 sm:h-[250px] sm:w-[200px] items-center justify-center rounded-xl bg-[#E5E7EB]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {/* Edit pencil overlay */}
            <button className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#000080] text-white shadow-md transition-colors hover:bg-[#000066]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>

          {/* Basic Details */}
          <div className="flex-1">
            <h2 className="mb-6 text-lg font-bold text-[#000000]">
              Basic Details
            </h2>

            {/* Row 1: First Name, Email, Address */}
            <div className="mb-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
              {detailsRow1.map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-medium text-[#6B7280]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-[#111827]">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Row 2: Last Name, Phone Number, Group */}
            <div className="mb-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
              {detailsRow2.map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-medium text-[#6B7280]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-[#111827]">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Row 3: Gender, Date of Birth, Date Joined */}
            <div className="mb-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
              {detailsRow3.map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-medium text-[#6B7280]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-[#111827]">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Row 4: Marital Status, Spouse */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
              {detailsRow4.map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-medium text-[#6B7280]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-[#111827]">{item.value}</p>
                </div>
              ))}
              <div>
                <p className="text-xs font-medium text-[#6B7280]">Spouse</p>
                {profileDetails.spouse ? (
                  <p className="mt-1 text-sm text-[#111827]">
                    {profileDetails.spouse} -{" "}
                    <button
                      onClick={() => router.push(`/user-management/members/m-2`)}
                      className="font-medium text-[#000080] underline transition-colors hover:text-[#000066]"
                    >
                      View
                    </button>
                  </p>
                ) : (
                  <button
                    onClick={() =>
                      router.push(
                        `/user-management/members/${params.id}/link-spouse`
                      )
                    }
                    className="mt-1 text-sm font-medium text-[#000080] underline transition-colors hover:text-[#000066]"
                  >
                    Link Spouse
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Add Notes Button */}
      <div className="mb-6 flex items-center justify-between border-b border-[#E5E7EB]">
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
        <Button
          variant="primary"
          onClick={() => setShowNotesModal(true)}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
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
          Add Notes
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "notes" && (
        <>
          {/* Note Cards */}
          <div className="space-y-4">
            {paginatedReports.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border border-[#E5E7EB] bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <p className="flex-1 text-sm text-[#374151]">
                    {report.content}
                  </p>
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
        </>
      )}

      {activeTab === "requests" && (
        <>
          <div className="space-y-4">
            {sampleRequests.map((req) => {
              const categoryColors: Record<string, string> = {
                Counseling: "bg-[#000080] text-white",
                Celebration: "bg-[#000080] text-white",
                Prayer: "bg-[#16A34A] text-white",
                Complaint: "bg-[#DC2626] text-white",
                Suggestion: "bg-[#CA8A04] text-white",
              };
              return (
                <div
                  key={req.id}
                  className="rounded-xl border border-[#E5E7EB] bg-white p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-[#111827]">
                        {req.title}
                      </h3>
                      <p className="mt-2 text-sm text-[#374151]">
                        {req.content}
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            categoryColors[req.category] || "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {req.category}
                        </span>
                        <span className="text-xs text-[#6B7280]">
                          · {req.status}
                        </span>
                      </div>
                    </div>
                    <button className="ml-4 flex shrink-0 items-center justify-center text-red-500 transition-colors hover:text-red-700">
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
                  <div className="mt-3 flex items-center justify-end text-xs text-[#6B7280]">
                    <span>Added by: {req.addedBy}</span>
                    <span className="ml-4">{req.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === "sms" && (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center text-sm text-gray-400">
          No SMS history found.
        </div>
      )}

      {activeTab === "email" && (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center text-sm text-gray-400">
          No email history found.
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button
          variant="secondary"
          onClick={() =>
            router.push(`/user-management/members/${params.id}/edit`)
          }
        >
          Edit
        </Button>
        <Button
          variant="primary"
          onClick={() =>
            router.push(`/user-management/members/${params.id}/link-spouse`)
          }
        >
          Link Spouse
        </Button>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Delete
        </Button>
      </div>

      {/* Modals */}
      <AddNotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
      />
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </DashboardLayout>
  );
}
