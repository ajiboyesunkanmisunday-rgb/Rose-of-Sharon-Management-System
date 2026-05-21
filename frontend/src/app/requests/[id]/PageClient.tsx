"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { getRequest, changeRequestStatus, type RequestResponse } from "@/lib/api";

const categoryBadgeColors: Record<string, string> = {
  Prayer: "bg-[#16A34A] text-white",
  Counseling: "bg-[#000080] text-white",
  Complaint: "bg-[#DC2626] text-white",
  Suggestion: "bg-[#CA8A04] text-white",
  Celebration: "bg-[#7C3AED] text-white",
  Testimony: "bg-[#7C3AED] text-white",
  PRAYER: "bg-[#16A34A] text-white",
  COUNSELING: "bg-[#000080] text-white",
  SUGGESTION: "bg-[#CA8A04] text-white",
};

const statusBadgeColors: Record<string, string> = {
  Received: "bg-[#F3F4F6] dark:bg-slate-700/30 text-[#6B7280] dark:text-slate-400",
  Assigned: "bg-[#DBEAFE] dark:bg-blue-900/30 text-[#1D4ED8] dark:text-blue-300",
  "In Progress": "bg-[#FEF9C3] dark:bg-yellow-900/30 text-[#CA8A04] dark:text-yellow-300",
  Resolved: "bg-[#DCFCE7] dark:bg-green-900/30 text-[#16A34A] dark:text-green-300",
  RECEIVED: "bg-[#F3F4F6] dark:bg-slate-700/30 text-[#6B7280] dark:text-slate-400",
  ASSIGNED: "bg-[#DBEAFE] dark:bg-blue-900/30 text-[#1D4ED8] dark:text-blue-300",
  IN_PROGRESS: "bg-[#FEF9C3] dark:bg-yellow-900/30 text-[#CA8A04] dark:text-yellow-300",
  RESOLVED: "bg-[#DCFCE7] dark:bg-green-900/30 text-[#16A34A] dark:text-green-300",
};

const statusOptions = ["Received", "Assigned", "In Progress", "Resolved"] as const;

// Map display name → API enum value
const STATUS_API_MAP: Record<string, string> = {
  "Received":    "RECEIVED",
  "Assigned":    "ASSIGNED",
  "In Progress": "IN_PROGRESS",
  "Resolved":    "RESOLVED",
};

function fullName(u?: { firstName?: string; middleName?: string; lastName?: string }): string {
  if (!u) return "—";
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const paramId = params.id as string;
  const [id, setId] = useState(paramId);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 1] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [request, setRequest] = useState<RequestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("Received");
  const [currentAssignee, setCurrentAssignee] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadRequest = useCallback(async () => {
    if (!id || id.startsWith("req-")) return;
    setLoading(true);
    setError("");
    try {
      const data = await getRequest(id);
      setRequest(data);
      setCurrentStatus(data.requestStatus ?? "Received");
      setCurrentAssignee(fullName(data.assignedTo));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load request.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadRequest(); }, [loadRequest]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-400 dark:text-slate-500">Loading…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !request) {
    return (
      <DashboardLayout>
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error || "Request not found."}
          <button className="ml-2 font-medium underline" onClick={loadRequest}>Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  const handleStatusChange = async (status: string) => {
    setShowStatusDropdown(false);
    setUpdatingStatus(true);
    try {
      const apiStatus = STATUS_API_MAP[status] ?? status;
      await changeRequestStatus(id, apiStatus);
      setCurrentStatus(status);
    } catch {
      // silently keep old status
    } finally {
      setUpdatingStatus(false);
    }
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
  };

  const category = request.requestType ?? "";
  const submittedBy = fullName(request.owner ?? request.createdBy);
  const date = request.createdOn
    ? new Date(request.createdOn).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/requests")}
            className="flex items-center text-[#000080] dark:text-indigo-400 transition-colors hover:text-[#000066]"
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
          <h2 className="text-[22px] font-bold text-[#000080] dark:text-indigo-400">
            Request Details
          </h2>
        </div>
      </div>

      {/* Request Content Card */}
      <div className="mb-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <div className="mb-4 flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              categoryBadgeColors[category] || "bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300"
            }`}
          >
            {category}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              statusBadgeColors[currentStatus] || "bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300"
            }`}
          >
            {currentStatus}
          </span>
        </div>

        <h3 className="mb-3 text-lg font-bold text-[#111827] dark:text-slate-100">
          {request.subject}
        </h3>

        <p className="mb-4 text-sm leading-relaxed text-[#374151] dark:text-slate-300">
          {request.content}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280] dark:text-slate-400">
          <span>
            <span className="font-medium">Submitted by:</span>{" "}
            {submittedBy}
          </span>
          <span>
            <span className="font-medium">Date:</span> {date}
          </span>
        </div>
      </div>

      {/* Status Section */}
      <div className="mb-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h4 className="mb-4 text-sm font-bold text-[#111827] dark:text-slate-100">Status</h4>
        <div className="flex flex-wrap items-center gap-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              statusBadgeColors[currentStatus] || "bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300"
            }`}
          >
            {currentStatus}
          </span>
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              disabled={updatingStatus}
              className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 px-4 py-2 text-sm text-[#374151] dark:text-slate-300 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:bg-slate-700/50 disabled:opacity-50"
            >
              {updatingStatus ? "Updating…" : "Update Status"}
            </button>
            {showStatusDropdown && (
              <div className="absolute left-0 z-10 mt-1 min-w-[180px] rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 py-1 shadow-lg">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:bg-slate-700/50 ${
                      currentStatus === status
                        ? "font-medium text-[#000080] dark:text-indigo-400"
                        : "text-gray-700 dark:text-slate-300"
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
      <div className="mb-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h4 className="mb-4 text-sm font-bold text-[#111827] dark:text-slate-100">Assigned To</h4>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-[#374151] dark:text-slate-300">
            {currentAssignee || "Unassigned"}
          </span>
          <div className="relative">
            <button
              onClick={() => setShowAssignDropdown(!showAssignDropdown)}
              className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 px-4 py-2 text-sm text-[#374151] dark:text-slate-300 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:bg-slate-700/50"
            >
              Reassign
            </button>
            {showAssignDropdown && (
              <div className="absolute left-0 z-10 mt-1 min-w-[200px] rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 py-1 shadow-lg">
                {assignees.map((assignee) => (
                  <button
                    key={assignee}
                    onClick={() => handleAssignChange(assignee)}
                    className={`block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:bg-slate-700/50 ${
                      currentAssignee === assignee
                        ? "font-medium text-[#000080] dark:text-indigo-400"
                        : "text-gray-700 dark:text-slate-300"
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
          onClick={() => router.push(`/requests/${id}/edit`)}
        >
          Edit
        </Button>
      </div>
    </DashboardLayout>
  );
}
