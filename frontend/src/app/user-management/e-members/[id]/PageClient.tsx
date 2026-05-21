"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { getUser, addCallReport, addVisitReport, getNotes, deleteNote, type UserResponse, type NoteResponse } from "@/lib/api";
import ProfilePhoto from "@/components/ui/ProfilePhoto";

type Tab = "details" | "activity";

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

export default function EMemberProfilePage() {
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

  const [callText,   setCallText]   = useState("");
  const [visitText,  setVisitText]  = useState("");
  const [saving,     setSaving]     = useState(false);
  const [saveMsg,    setSaveMsg]    = useState("");

  const [notes,          setNotes]          = useState<NoteResponse[]>([]);
  const [notesLoading,   setNotesLoading]   = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!id || id.startsWith("em-")) return;
    setNotesLoading(true);
    try {
      const data = await getNotes(id);
      setNotes(data ?? []);
    } catch {
      // silently ignore
    } finally {
      setNotesLoading(false);
    }
  }, [id]);

  useEffect(() => { if (activeTab === "activity") fetchNotes(); }, [activeTab, fetchNotes]);

  const fetchUser = useCallback(async () => {
    if (!id || id.startsWith("em-")) return;
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
    router.push("/user-management/e-members");
  };

  const handleDeleteNote = async (noteId: string) => {
    setDeletingNoteId(noteId);
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleSaveActivity = async (type: "call" | "visit") => {
    if (!id) return;
    const text = type === "call" ? callText : visitText;
    if (!text.trim()) return;
    setSaving(true);
    setSaveMsg("");
    try {
      if (type === "call")  await addCallReport(id, text.trim());
      if (type === "visit") await addVisitReport(id, text.trim());
      if (type === "call")  setCallText("");
      if (type === "visit") setVisitText("");
      setSaveMsg("Saved successfully.");
      setTimeout(() => setSaveMsg(""), 3000);
      fetchNotes();
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const address = user
    ? [user.street, user.city, user.state, user.country].filter(Boolean).join(", ")
    : "";

  const phone = user?.phoneNumber
    ? `+${user.countryCode ?? ""} ${user.phoneNumber}`.trim()
    : "";

  const groupNames = user?.groups?.map((g) => g.name).join(", ") || "—";

  const isMarried = user?.maritalStatus?.toUpperCase() === "MARRIED";
  const hasSpouse = !!user?.spouse;
  const spouseLinkedIncorrectly = hasSpouse && !isMarried;

  const tabs: { key: Tab; label: string }[] = [
    { key: "details",  label: "Details"  },
    { key: "activity", label: "Activity" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">User Management</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/user-management/e-members")} className="flex items-center text-[#000080] dark:text-indigo-400 transition-colors hover:text-[#000066]">
            <BackArrow />
          </button>
          <h2 className="text-[22px] font-bold text-[#000080] dark:text-indigo-400">E-Member Profile</h2>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error} — <button className="font-medium underline" onClick={fetchUser}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center text-gray-400 dark:text-slate-500">Loading…</div>
      ) : (
        <>
          {/* Profile Card */}
          <div className="mb-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Photo */}
              <div className="relative flex h-[180px] w-[150px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#E5E7EB] dark:bg-slate-700 sm:h-[250px] sm:w-[200px]">
                <ProfilePhoto src={user?.profilePictureUrl} />
              </div>

              {/* Details */}
              <div className="flex-1">
                <h2 className="mb-5 text-lg font-bold text-[#000000] dark:text-slate-100">Basic Details</h2>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
                  {[
                    { label: "First Name",      value: user?.firstName },
                    { label: "Middle Name",     value: user?.middleName },
                    { label: "Last Name",       value: user?.lastName },
                    { label: "Email",           value: user?.email },
                    { label: "Phone",           value: phone },
                    { label: "Address",         value: address },
                    { label: "Gender",          value: user?.sex },
                    { label: "Date of Birth",   value: fmtDOB(user?.dayOfBirth, user?.monthOfBirth, user?.yearOfBirth) },
                    { label: "Marital Status",  value: user?.maritalStatus },
                    { label: "Occupation",             value: user?.occupation },
                    { label: "First Church Visit",     value: user?.firstTimeService?.title },
                    { label: "First Visit Date",       value: fmtDate(user?.firstTimeService?.date) },
                    { label: "Last Service Attended",  value: user?.serviceAttended },
                    { label: "Group",                  value: groupNames },
                    { label: "Date Joined",            value: fmtDate(user?.createdOn) },
                  ].map(({ label, value }) => value ? (
                    <div key={label}>
                      <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">{label}</p>
                      <p className="mt-1 text-sm text-[#111827] dark:text-slate-100">{value}</p>
                    </div>
                  ) : null)}

                  {/* Spouse — only shown for married members */}
                  {(isMarried || hasSpouse) && (
                    <div>
                      <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">Spouse</p>
                      {spouseLinkedIncorrectly && (
                        <p className="mb-0.5 text-[10px] font-semibold text-amber-600">
                          ⚠ Marital status is {user?.maritalStatus} but a spouse is linked
                        </p>
                      )}
                      {user?.spouse ? (
                        <button
                          onClick={() => router.push(`/user-management/members/${user.spouse!.id}`)}
                          className="mt-1 text-sm font-medium text-[#000080] dark:text-indigo-400 underline hover:text-[#000066]"
                        >
                          {fullName(user.spouse)}
                        </button>
                      ) : (
                        <p className="mt-1 text-sm text-[#9CA3AF] dark:text-slate-400">Not linked</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 border-b border-[#E5E7EB] dark:border-slate-700">
            <div className="flex gap-8">
              {tabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`pb-3 text-sm font-medium transition-colors ${activeTab === tab.key ? "border-b-2 border-[#000080] text-[#000080] dark:text-indigo-400" : "text-[#6B7280] dark:text-slate-400 hover:text-[#374151] dark:text-slate-300"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "details" && user && (
            <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-sm text-center text-gray-400 dark:text-slate-500">
              Assigned Follow-Up:{" "}
              <span className="font-medium text-[#374151] dark:text-slate-300">{fullName(user.assignedFollowUp) || "Not assigned"}</span>
              {(user.noOfCalls !== undefined || user.noOfVisits !== undefined) && (
                <span className="ml-4 text-[#374151] dark:text-slate-300">
                  · Calls: <strong>{user.noOfCalls ?? 0}</strong>
                  &nbsp;· Visits: <strong>{user.noOfVisits ?? 0}</strong>
                </span>
              )}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              {saveMsg && (
                <div className={`rounded-lg px-4 py-3 text-sm ${saveMsg.startsWith("Failed") ? "bg-red-50 dark:bg-red-900/20 text-red-700 border border-red-200" : "bg-green-50 dark:bg-green-900/20 text-green-700 border border-green-200"}`}>
                  {saveMsg}
                </div>
              )}

              {/* Add Call Report */}
              <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
                <h3 className="mb-3 text-sm font-bold text-[#111827] dark:text-slate-100">Log Call</h3>
                <textarea
                  value={callText}
                  onChange={(e) => setCallText(e.target.value)}
                  placeholder="Describe the call…"
                  rows={3}
                  className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none placeholder:text-[#9CA3AF] dark:text-slate-400 focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
                />
                <div className="mt-2 flex justify-end">
                  <Button variant="primary" onClick={() => handleSaveActivity("call")} disabled={saving || !callText.trim()}>
                    {saving ? "Saving…" : "Save Call"}
                  </Button>
                </div>
              </div>

              {/* Add Visit Report */}
              <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
                <h3 className="mb-3 text-sm font-bold text-[#111827] dark:text-slate-100">Log Visit</h3>
                <textarea
                  value={visitText}
                  onChange={(e) => setVisitText(e.target.value)}
                  placeholder="Describe the visit…"
                  rows={3}
                  className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none placeholder:text-[#9CA3AF] dark:text-slate-400 focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
                />
                <div className="mt-2 flex justify-end">
                  <Button variant="primary" onClick={() => handleSaveActivity("visit")} disabled={saving || !visitText.trim()}>
                    {saving ? "Saving…" : "Save Visit"}
                  </Button>
                </div>
              </div>

              {/* Activity History */}
              <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
                <h3 className="mb-3 text-sm font-bold text-[#111827] dark:text-slate-100">Activity History</h3>
                {notesLoading ? (
                  <p className="text-sm text-gray-400 dark:text-slate-500">Loading…</p>
                ) : notes.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-slate-500">No activity recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {notes.map((n, i) => {
                      const noteType = (n.noteCategory ?? n.type ?? "").toUpperCase();
                      const badgeClass =
                        noteType.includes("CALL")  ? "bg-[#DBEAFE] dark:bg-blue-900/30 text-[#1D4ED8] dark:text-blue-300" :
                        noteType.includes("VISIT") ? "bg-[#DCFCE7] dark:bg-green-900/30 text-[#16A34A] dark:text-green-300" :
                                                      "bg-[#F3F4F6] dark:bg-slate-700/30 text-[#6B7280] dark:text-slate-400";
                      const badgeLabel =
                        noteType.includes("CALL")  ? "Call Log" :
                        noteType.includes("VISIT") ? "Visit Log" : "Note";
                      return (
                        <div key={n.id ?? i} className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>{badgeLabel}</span>
                              <span className="text-xs text-[#9CA3AF] dark:text-slate-400">{fmtDate(n.createdOn)}</span>
                            </div>
                            {n.id && (
                              <button
                                onClick={() => handleDeleteNote(n.id!)}
                                disabled={deletingNoteId === n.id}
                                className="rounded p-0.5 text-[#9CA3AF] dark:text-slate-400 hover:bg-red-50 dark:bg-red-900/20 hover:text-red-500 disabled:opacity-50"
                                title="Delete"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                              </button>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-[#374151] dark:text-slate-300">{n.content ?? "—"}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => router.push(`/user-management/e-members/${id}/edit`)}>Edit</Button>
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
