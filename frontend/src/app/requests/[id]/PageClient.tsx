"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { allRequests } from "@/lib/mock-data";

const categoryBadgeColors: Record<string, string> = {
  Prayer: "bg-[#16A34A] text-white",
  Counseling: "bg-[#000080] text-white",
  Complaint: "bg-[#DC2626] text-white",
  Suggestion: "bg-[#CA8A04] text-white",
  Celebration: "bg-[#7C3AED] text-white",
  Testimony: "bg-[#7C3AED] text-white",
};

const statusBadgeColors: Record<string, string> = {
  Received: "bg-[#F3F4F6] text-[#6B7280]",
  Assigned: "bg-[#DBEAFE] text-[#1D4ED8]",
  "In Progress": "bg-[#FEF9C3] text-[#CA8A04]",
  Resolved: "bg-[#DCFCE7] text-[#16A34A]",
};

const statusOptions = ["Received", "Assigned", "In Progress", "Resolved"] as const;

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);

  const request = allRequests.find((r) => r.id === params.id);

  const [currentStatus, setCurrentStatus] = useState(
    request?.status || "Received"
  );
  const [currentAssignee, setCurrentAssignee] = useState(
    request?.assignedTo || ""
  );

  if (!request) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-400">Request not found.</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleConfirmDelete = () => {
    console.log("Delete request:", params.id);
    setShowDeleteModal(false);
    router.push("/requests");
  };

  const handleStatusChange = (status: string) => {
    setCurrentStatus(status as typeof currentStatus);
    setShowStatusDropdown(false);
    console.log("Status updated to:", status);
  };

  const assignees = [
    "Pastor David",
    "Pastor Grace",
    "Deacon Samuel",
    "Deaconess Ruth",
  ];

  const handleAssignChange = (assignee: string) => {
    setCurrentAssignee(assignee);
    setShowAssignDropdown(false);
    console.log("Assigned to:", assignee);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/requests")}
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
            Request Details
          </h2>
        </div>
      </div>

      {/* Request Content Card */}
      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              categoryBadgeColors[request.category] ||
              "bg-gray-200 text-gray-700"
            }`}
          >
            {request.category}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              statusBadgeColors[currentStatus] || "bg-gray-200 text-gray-700"
            }`}
          >
            {currentStatus}
          </span>
        </div>

        <h3 className="mb-3 text-lg font-bold text-[#111827]">
          {request.title}
        </h3>

        <p className="mb-4 text-sm leading-relaxed text-[#374151]">
          {request.content}
        </p>

        <div className="flex items-center gap-6 text-xs text-[#6B7280]">
          <span>
            <span className="font-medium">Submitted by:</span>{" "}
            {request.submittedBy}
          </span>
          <span>
            <span className="font-medium">Date:</span> {request.date}
          </span>
        </div>
      </div>

      {/* Status Section */}
      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <h4 className="mb-4 text-sm font-bold text-[#111827]">Status</h4>
        <div className="flex items-center gap-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              statusBadgeColors[currentStatus] || "bg-gray-200 text-gray-700"
            }`}
          >
            {currentStatus}
          </span>
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm text-[#374151] transition-colors hover:bg-gray-50"
            >
              Update Status
            </button>
            {showStatusDropdown && (
              <div className="absolute left-0 z-10 mt-1 min-w-[180px] rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
                      currentStatus === status
                        ? "font-medium text-[#000080]"
                        : "text-gray-700"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assigned To Section */}
      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <h4 className="mb-4 text-sm font-bold text-[#111827]">Assigned To</h4>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#374151]">
            {currentAssignee || "Unassigned"}
          </span>
          <div className="relative">
            <button
              onClick={() => setShowAssignDropdown(!showAssignDropdown)}
              className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm text-[#374151] transition-colors hover:bg-gray-50"
            >
              Reassign
            </button>
            {showAssignDropdown && (
              <div className="absolute left-0 z-10 mt-1 min-w-[200px] rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg">
                {assignees.map((assignee) => (
                  <button
                    key={assignee}
                    onClick={() => handleAssignChange(assignee)}
                    className={`block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
                      currentAssignee === assignee
                        ? "font-medium text-[#000080]"
                        : "text-gray-700"
                    }`}
                  >
                    {assignee}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/requests")}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => router.push(`/requests/${params.id}/edit`)}
        >
          Edit
        </Button>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Delete
        </Button>
      </div>

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </DashboardLayout>
  );
}
