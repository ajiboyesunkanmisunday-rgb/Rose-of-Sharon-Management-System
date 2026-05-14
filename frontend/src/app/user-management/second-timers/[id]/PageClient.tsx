"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { getUser, addCallReport, addVisitReport, getNotes, convertToFullMember, type UserResponse, type NoteResponse } from "@/lib/api";
import ProfilePhoto from "@/components/ui/ProfilePhoto";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useToast } from "@/context/ToastContext";
import { SkeletonProfile } from "@/components/ui/Skeleton";

type Tab = "details" | "activity";

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDOB(day?: number, month?: number, year?: number) {
  if (!day || !month) return "—";
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[month - 1] ?? "?"} ${day}${year ? `, ${year}` : ""}`;
}

function fullName(u?: { firstName?: string; middleName?: string; lastName?: string } | null) {
  if (!u) return "—";
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
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

export default function ViewSecondTimerPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const params = useParams();
  const paramId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const [id, setId] = useState(paramId);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 1] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [user,    setUser]    = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);

  const [callText,  setCallText]  = useState("");
  const [visitText, setVisitText] = useState("");
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState("");
  const [saveFailed,  setSaveFailed]  = useState(false);
  const [converting, setConverting] = useState(false);

  const [notes,        setNotes]        = useState<NoteResponse[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!id || id.startsWith("st-")) return;
    setNotesLoading(true);
    try {
      const data = await getNotes(id);
      setNotes(data);
    } catch { /* non-fatal */ }
    finally { setNotesLoading(false); }
  }, [id]);

  const fetchUser = useCallback(async () => {
    if (!id || id.startsWith("st-")) return;
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

  useEffect(() => { fetchUser(); }, [fetchUser]);
  useEffect(() => { if (activeTab === "activity") fetchNotes(); }, [activeTab, fetchNotes]);

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    router.push("/user-management/second-timers");
  };

  const handleSaveActivity = async (type: "call" | "visit") => {
    if (!id) return;
    const text = type === "call" ? callText : visitText;
    if (!text.trim()) return;
    setSaving(true);
    setSaveMsg("");
    setSaveFailed(false);
    try {
      if (type === "call")  await addCallReport(id, text.trim());
      if (type === "visit") await addVisitReport(id, text.trim());
      if (type === "call")  setCallText("");
      if (type === "visit") setVisitText("");
      setSaveMsg("Saved successfully.");
      setTimeout(() => setSaveMsg(""), 3000);
      addToast("Saved successfully.", "success");
      fetchNotes();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save.";
      setSaveFailed(true);
      setSaveMsg(msg);
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleConvertToMember = async () => {
    if (!id) return;
    setShowConvertModal(true);
  };

  const handleConfirmConvert = async () => {
    setShowConvertModal(false);
    setConverting(true);
    try {
      await convertToFullMember(id);
      addToast("Converted to Full Member successfully.", "success");
      router.push("/user-management/members");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Conversion failed.";
      setSaveMsg(msg);
      addToast(msg, "error");
      setConverting(false);
    }
  };

  const address = user
    ? [user.street, user.city, user.state, user.country].filter(Boolean).join(", ") || "—"
    : "—";

  const phone = user
    ? `+${user.countryCode ?? ""} ${user.phoneNumber}`.trim()
    : "—";

  const tabs: { key: Tab; label: string }[] = [
    { key: "details",  label: "Details"  },
    { key: "activity", label: "Activity" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-4">
        <h1 className="text-[28px] font-bold text-[#000000]">User Management</h1>
        <Breadcrumbs items={[
          { label: "User Management" },
          { label: "Second Timers", href: "/user-management/second-timers" },
          { label: user ? fullName(user) : "Profile" },
        ]} />
        <div className="flex items-center gap-2 mt-1">
          <button onClick={() => router.push("/user-management/second-timers")} className="flex items-center text-[#000080] transition-colors hover:text-[#000066]">
            <BackArrow />
          </button>
          <h2 className="text-[22px] font-bold text-[#000080]">View Second Timer</h2>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error} — <button className="font-medium underline" onClick={fetchUser}>Retry</button>
        </div>
      )}

      {loading ? (
        <SkeletonProfile />
      ) : (
        <>
          {/* Profile Card */}
          <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Photo */}
              <div className="relative mx-auto flex h-[160px] w-[130px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#E5E7EB] sm:mx-0 sm:h-[220px] sm:w-[180px] md:h-[240px] md:w-[200px]">
                <ProfilePhoto src={user?.profilePictureUrl} />
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
                    { label: "How They Heard", value: user?.howDidYouHear },
                    { label: "Service Rating", value: user?.howWasService },
                    { label: "First Service Attended",  value: user?.firstTimeService?.title },
                    { label: "First Service Date",     value: fmtDate(user?.firstTimeService?.date) },
                    { label: "Last Service Attended",  value: user?.secondTimeService?.title },
                    { label: "Last Service Date",      value: fmtDate(user?.secondTimeService?.date ?? user?.createdOn) },
                  ].map(({ label, value }) => value ? (
                    <div key={label}>
                      <p className="text-xs font-medium text-[#6B7280]">{label}</p>
                      <p className="mt-1 text-sm text-[#111827]">{value}</p>
                    </div>
                  ) : null)}
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

          {activeTab === "details" && user && (
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 text-sm text-center text-gray-400">
              Assigned Follow-Up:{" "}
              <span className="font-medium text-[#374151]">{fullName(user.assignedFollowUp) || "Not assigned"}</span>
              {(user.noOfCalls !== undefined || user.noOfVisits !== undefined) && (
                <span className="ml-4 text-[#374151]">
                  · Calls: <strong>{user.noOfCalls ?? 0}</strong>
                  &nbsp;· Visits: <strong>{user.noOfVisits ?? 0}</strong>
                </span>
              )}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              {saveMsg && (
                <div className={`rounded-lg px-4 py-3 text-sm border ${saveFailed ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}>
                  {saveMsg}
                </div>
              )}

              {/* Log Call */}
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-[#111827]">Log Call</h3>
                <textarea
                  value={callText}
                  onChange={(e) => setCallText(e.target.value)}
                  placeholder="Describe the call…"
                  rows={3}
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
                />
                <div className="mt-2 flex justify-end">
                  <Button variant="primary" onClick={() => handleSaveActivity("call")} disabled={saving || !callText.trim()}>
                    {saving ? "Saving…" : "Save Call"}
                  </Button>
                </div>
              </div>

              {/* Log Visit */}
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-[#111827]">Log Visit</h3>
                <textarea
                  value={visitText}
                  onChange={(e) => setVisitText(e.target.value)}
                  placeholder="Describe the visit…"
                  rows={3}
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
                />
                <div className="mt-2 flex justify-end">
                  <Button variant="primary" onClick={() => handleSaveActivity("visit")} disabled={saving || !visitText.trim()}>
                    {saving ? "Saving…" : "Save Visit"}
                  </Button>
                </div>
              </div>

              {/* Activity History */}
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-[#111827]">Activity History</h3>
                {notesLoading ? (
                  <p className="text-center text-xs text-[#9CA3AF] py-4">Loading history…</p>
                ) : notes.length === 0 ? (
                  <p className="text-center text-xs text-[#9CA3AF] py-4">No activity recorded yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {notes.map((n) => {
                      const cat = (n.noteCategory ?? n.type ?? "").toUpperCase();
                      const typeLabel = cat.includes("CALL") ? "Call Log" : cat.includes("VISIT") ? "Visit Log" : "Note";
                      const typeBg    = cat.includes("CALL") ? "bg-blue-50 text-blue-700" : cat.includes("VISIT") ? "bg-green-50 text-green-700" : "bg-[#F3F4F6] text-[#374151]";
                      return (
                        <li key={n.id} className="rounded-lg border border-[#F3F4F6] bg-[#FAFAFA] px-4 py-3">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${typeBg}`}>{typeLabel}</span>
                            <span className="text-xs text-[#9CA3AF]">{n.createdOn ? new Date(n.createdOn).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</span>
                          </div>
                          <p className="text-sm text-[#374151]">{n.content ?? "—"}</p>
                          {(n.officerName ?? n.createdBy) && (
                            <p className="mt-1 text-xs text-[#9CA3AF]">By {n.officerName ?? (typeof n.createdBy === "string" ? n.createdBy : [n.createdBy?.firstName, n.createdBy?.lastName].filter(Boolean).join(" "))}</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => router.push(`/user-management/second-timers/${id}/edit`)}>Edit</Button>
            <Button variant="primary" onClick={handleConvertToMember} disabled={converting}>
              {converting ? "Converting…" : "Convert to Member"}
            </Button>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete</Button>
          </div>
        </>
      )}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Convert to Member confirmation modal */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold text-[#111827]">Convert to Full Member?</h3>
            <p className="mb-6 text-sm text-[#374151]">
              This will move this second timer to the Members list. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowConvertModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirmConvert}>Yes, Convert</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
