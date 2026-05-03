"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { getUser, addNote, addCallReport, addVisitReport, convertToSecondTimer, type UserResponse } from "@/lib/api";

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

export default function ViewFirstTimerPage() {
  const router = useRouter();
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

  const [noteText,  setNoteText]  = useState("");
  const [callText,  setCallText]  = useState("");
  const [visitText, setVisitText] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [saveMsg,   setSaveMsg]   = useState("");
  const [converting, setConverting] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!id || id.startsWith("ft-")) return;
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

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    router.push("/user-management/first-timers");
  };

  const handleSaveActivity = async (type: "note" | "call" | "visit") => {
    if (!id) return;
    const text = type === "note" ? noteText : type === "call" ? callText : visitText;
    if (!text.trim()) return;
    setSaving(true);
    setSaveMsg("");
    try {
      if (type === "note")  await addNote(id, text.trim());
      if (type === "call")  await addCallReport(id, text.trim());
      if (type === "visit") await addVisitReport(id, text.trim());
      if (type === "note")  setNoteText("");
      if (type === "call")  setCallText("");
      if (type === "visit") setVisitText("");
      setSaveMsg("Saved successfully.");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleConvertToSecondTimer = async () => {
    if (!id || !confirm("Convert this first timer to a second timer?")) return;
    setConverting(true);
    try {
      await convertToSecondTimer(id);
      router.push("/user-management/second-timers");
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Conversion failed.");
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
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">User Management</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/user-management/first-timers")} className="flex items-center text-[#000080] transition-colors hover:text-[#000066]">
            <BackArrow />
          </button>
          <h2 className="text-[22px] font-bold text-[#000080]">View First Timer</h2>
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
                    { label: "How They Heard", value: user?.howDidYouHear },
                    { label: "Service Rating", value: user?.howWasService },
                    { label: "Favourite Part", value: user?.favouriteParts },
                    { label: "First Service",  value: user?.firstTimeService?.title },
                    { label: "Date Visited",   value: fmtDate(user?.createdOn) },
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
                <div className={`rounded-lg px-4 py-3 text-sm ${saveMsg.startsWith("Failed") || saveMsg.startsWith("Conversion") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                  {saveMsg}
                </div>
              )}

              {/* Add Note */}
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-[#111827]">Add Note</h3>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter note…"
                  rows={3}
                  className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
                />
                <div className="mt-2 flex justify-end">
                  <Button variant="primary" onClick={() => handleSaveActivity("note")} disabled={saving || !noteText.trim()}>
                    {saving ? "Saving…" : "Save Note"}
                  </Button>
                </div>
              </div>

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
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => router.push(`/user-management/first-timers/${id}/edit`)}>Edit</Button>
            <Button variant="primary" onClick={handleConvertToSecondTimer} disabled={converting}>
              {converting ? "Converting…" : "Convert to Second Timer"}
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
    </DashboardLayout>
  );
}
