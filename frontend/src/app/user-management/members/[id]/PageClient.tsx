"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { getUser, getUserRequests, resetPassword, removeAdmin, markUserAsInactive, type UserResponse, type RequestResponse } from "@/lib/api";

type Tab = "details" | "requests";

function fullName(u?: { firstName?: string; middleName?: string; lastName?: string } | null) {
  if (!u) return "—";
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDOB(day?: number, month?: number, year?: number) {
  if (!day || !month) return "—";
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[month - 1] ?? "?"} ${day}${year ? `, ${year}` : ""}`;
}

const BackArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const reqStatusColors: Record<string, string> = {
  RECEIVED:    "bg-[#F3F4F6] text-[#6B7280]",
  ASSIGNED:    "bg-[#DBEAFE] text-[#1D4ED8]",
  IN_PROGRESS: "bg-[#FEF9C3] text-[#CA8A04]",
  RESOLVED:    "bg-[#DCFCE7] text-[#16A34A]",
};

export default function ViewMemberProfilePage() {
  const router = useRouter();
  const params = useParams();
  const paramId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const [id, setId] = useState(paramId);

  // When Netlify serves the pre-built placeholder HTML for a real UUID path,
  // useParams() may return the placeholder ID (e.g. "m-1") during hydration.
  // Read the actual ID from the browser URL to fix the mismatch.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 1] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [user,     setUser]     = useState<UserResponse | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const [requests,     setRequests]     = useState<RequestResponse[]>([]);
  const [reqLoading,   setReqLoading]   = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!id || id.startsWith("m-")) return;
    setLoading(true);
    setError("");
    try {
      const data = await getUser(id);
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchRequests = useCallback(async () => {
    if (!id || id.startsWith("m-")) return;
    setReqLoading(true);
    try {
      const res = await getUserRequests(id, 0, 20);
      setRequests(res.content ?? []);
    } catch {
      // silently ignore
    } finally {
      setReqLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchUser(); }, [fetchUser]);
  useEffect(() => { if (activeTab === "requests") fetchRequests(); }, [activeTab, fetchRequests]);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState("");

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    router.push("/user-management/members");
  };

  const handleResetPassword = async () => {
    if (!id) return;
    setActionLoading("reset");
    setActionMsg("");
    try {
      await resetPassword(id);
      setActionMsg("Password reset successfully.");
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!id) return;
    setActionLoading("removeAdmin");
    setActionMsg("");
    try {
      await removeAdmin(id);
      setActionMsg("Admin access removed.");
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Failed to remove admin.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkInactive = async () => {
    if (!id) return;
    setActionLoading("inactive");
    setActionMsg("");
    try {
      await markUserAsInactive(id, "Marked inactive by admin");
      setActionMsg("Member marked as inactive.");
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Failed to mark inactive.");
    } finally {
      setActionLoading(null);
    }
  };

  const address = user
    ? [user.street, user.city, user.state, user.country].filter(Boolean).join(", ") || "—"
    : "—";

  const phone = user
    ? `+${user.countryCode ?? ""} ${user.phoneNumber}`.trim()
    : "—";

  const groupNames = user?.groups?.map((g) => g.name).join(", ") || "—";

  const tabs: { key: Tab; label: string }[] = [
    { key: "details",  label: "Details"  },
    { key: "requests", label: "Requests" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">User Management</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/user-management/members")} className="flex items-center text-[#000080] transition-colors hover:text-[#000066]">
            <BackArrow />
          </button>
          <h2 className="text-[22px] font-bold text-[#000080]">Member Profile</h2>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error} — <button className="font-medium underline" onClick={fetchUser}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center text-gray-400">Loading…</div>
      ) : (
        <>
          {/* Profile Card */}
          <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Photo */}
              <div className="relative flex h-[180px] w-[150px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#E5E7EB] sm:h-[250px] sm:w-[200px]">
                {user?.profilePictureUrl
                  ? <img src={user.profilePictureUrl} alt="" className="h-full w-full object-cover" />
                  : <UserIcon />}
              </div>

              {/* Details */}
              <div className="flex-1">
                <h2 className="mb-5 text-lg font-bold text-[#000000]">Basic Details</h2>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
                  {[
                    { label: "First Name",     value: user?.firstName },
                    { label: "Middle Name",    value: user?.middleName },
                    { label: "Last Name",      value: user?.lastName },
                    { label: "Email",          value: user?.email },
                    { label: "Phone",          value: phone },
                    { label: "Address",        value: address },
                    { label: "Gender",         value: user?.sex },
                    { label: "Date of Birth",  value: fmtDOB(user?.dayOfBirth, user?.monthOfBirth, user?.yearOfBirth) },
                    { label: "Marital Status", value: user?.maritalStatus },
                    { label: "Occupation",     value: user?.occupation },
                    { label: "Group",          value: groupNames },
                    { label: "Date Joined",    value: fmtDate(user?.createdOn) },
                  ].map(({ label, value }) => value ? (
                    <div key={label}>
                      <p className="text-xs font-medium text-[#6B7280]">{label}</p>
                      <p className="mt-1 text-sm text-[#111827]">{value}</p>
                    </div>
                  ) : null)}

                  {/* Spouse */}
                  <div>
                    <p className="text-xs font-medium text-[#6B7280]">Spouse</p>
                    {user?.spouse ? (
                      <button
                        onClick={() => router.push(`/user-management/members/${user.spouse!.id}`)}
                        className="mt-1 text-sm font-medium text-[#000080] underline hover:text-[#000066]"
                      >
                        {fullName(user.spouse)}
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(`/user-management/members/${id}/link-spouse`)}
                        className="mt-1 text-sm font-medium text-[#000080] underline hover:text-[#000066]"
                      >
                        Link Spouse
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 border-b border-[#E5E7EB]">
            <div className="flex gap-8">
              {tabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`pb-3 text-sm font-medium transition-colors ${activeTab === tab.key ? "border-b-2 border-[#000080] text-[#000080]" : "text-[#6B7280] hover:text-[#374151]"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "requests" && (
            <>
              {reqLoading ? (
                <div className="py-8 text-center text-gray-400">Loading requests…</div>
              ) : requests.length === 0 ? (
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center text-sm text-gray-400">No requests found.</div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div key={req.id} className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-[#111827]">{req.subject}</h3>
                          <p className="mt-1 text-sm text-[#374151]">{req.content}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="rounded-full bg-[#000080] px-3 py-1 text-xs font-medium text-white">
                              {(req.requestType ?? "").replace(/_/g, " ")}
                            </span>
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${reqStatusColors[req.requestStatus ?? ""] ?? "bg-gray-100 text-gray-600"}`}>
                              {(req.requestStatus ?? "").replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-[#6B7280]">{fmtDate(req.createdOn)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "details" && user && (
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 text-sm text-gray-400 text-center">
              Assigned Follow-Up:{" "}
              <span className="font-medium text-[#374151]">{fullName(user.assignedFollowUp) || "Not assigned"}</span>
            </div>
          )}

          {/* Actions */}
          {actionMsg && (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">{actionMsg}</div>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => router.push(`/user-management/members/${id}/edit`)}>Edit</Button>
            <Button variant="primary"   onClick={() => router.push(`/user-management/members/${id}/link-spouse`)}>Link Spouse</Button>
            <Button variant="secondary" onClick={handleResetPassword} disabled={actionLoading === "reset"}>
              {actionLoading === "reset" ? "Resetting…" : "Reset Password"}
            </Button>
            <Button variant="secondary" onClick={handleRemoveAdmin} disabled={actionLoading === "removeAdmin"}>
              {actionLoading === "removeAdmin" ? "Removing…" : "Remove Admin"}
            </Button>
            <Button variant="secondary" onClick={handleMarkInactive} disabled={actionLoading === "inactive"}>
              {actionLoading === "inactive" ? "Marking…" : "Mark Inactive"}
            </Button>
            <Button variant="danger"    onClick={() => setShowDeleteModal(true)}>Delete</Button>
          </div>
        </>
      )}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </DashboardLayout>
  );
}
