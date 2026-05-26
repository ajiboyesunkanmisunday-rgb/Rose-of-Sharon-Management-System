"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { getUser, getUserRequests, markUserAsInactive, getNotes, addNote, deleteNote, type UserResponse, type RequestResponse, type NoteResponse } from "@/lib/api";

type NoteCategory = "CALL" | "VISIT" | "OTHERS";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useToast } from "@/context/ToastContext";
import { SkeletonProfile } from "@/components/ui/Skeleton";

type Tab = "details" | "requests" | "notes";

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
  RECEIVED:    "bg-[#F3F4F6] dark:bg-slate-700/30 text-[#6B7280] dark:text-slate-400",
  ASSIGNED:    "bg-[#DBEAFE] dark:bg-blue-900/30 text-[#1D4ED8] dark:text-blue-300",
  IN_PROGRESS: "bg-[#FEF9C3] dark:bg-yellow-900/30 text-[#CA8A04] dark:text-yellow-300",
  RESOLVED:    "bg-[#DCFCE7] dark:bg-green-900/30 text-[#16A34A] dark:text-green-300",
};

export default function ViewMemberProfilePage() {
  const router = useRouter();
  const { addToast } = useToast();
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

  const [user,       setUser]       = useState<UserResponse | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [photoError, setPhotoError] = useState(false);

  const [requests,     setRequests]     = useState<RequestResponse[]>([]);
  const [reqLoading,   setReqLoading]   = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [notes,        setNotes]        = useState<NoteResponse[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError,   setNotesError]   = useState("");
  const [noteInput,    setNoteInput]    = useState("");
  const [noteCategory, setNoteCategory] = useState<NoteCategory>("CALL");
  const [addingNote,   setAddingNote]   = useState(false);
  const [deletingNote, setDeletingNote] = useState<string | null>(null);

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

  const fetchNotes = useCallback(async () => {
    if (!id || id.startsWith("m-")) return;
    setNotesLoading(true);
    setNotesError("");
    try {
      const data = await getNotes(id);
      setNotes(data);
    } catch {
      setNotesError("Failed to load notes.");
    } finally {
      setNotesLoading(false);
    }
  }, [id]);

  const handleAddNote = async () => {
    if (!noteInput.trim() || !id) return;
    setAddingNote(true);
    setNotesError("");
    try {
      await addNote(id, noteInput.trim(), noteCategory);
      setNoteInput("");
      await fetchNotes();
    } catch (err) {
      setNotesError(err instanceof Error ? err.message : "Failed to add note.");
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setDeletingNote(noteId);
    try {
      await deleteNote(noteId);
      await fetchNotes();
    } catch {
      setNotesError("Failed to delete note.");
    } finally {
      setDeletingNote(null);
    }
  };

  useEffect(() => { fetchUser(); }, [fetchUser]);
  useEffect(() => { if (activeTab === "requests") fetchRequests(); }, [activeTab, fetchRequests]);
  useEffect(() => { if (activeTab === "notes") fetchNotes(); }, [activeTab, fetchNotes]);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState("");

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    router.push("/user-management/members");
  };

  const handleMarkInactive = async () => {
    if (!id) return;
    setActionLoading("inactive");
    setActionMsg("");
    try {
      await markUserAsInactive(id, "Marked inactive by admin");
      setActionMsg("Member marked as inactive.");
      addToast("Member marked as inactive.", "success");
      fetchUser(); // refresh so the profile reflects the new status
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to mark inactive.";
      setActionMsg(msg);
      addToast(msg, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const address = user
    ? [user.street, user.city, user.state, user.country].filter(Boolean).join(", ")
    : "";

  const phone = user?.phoneNumber
    ? `+${user.countryCode ?? ""} ${user.phoneNumber}`.trim()
    : "";

  const groupNames = user?.groups?.map((g) => g.name).join(", ") || "—";

  // Spouse logic — only married members can have / link a spouse
  const isMarried   = user?.maritalStatus?.toUpperCase() === "MARRIED";
  const hasSpouse   = !!user?.spouse;
  // Edge-case: backend data has a spouse linked but status is not MARRIED
  const spouseLinkedIncorrectly = hasSpouse && !isMarried;

  const tabs: { key: Tab; label: string }[] = [
    { key: "details",  label: "Details"  },
    { key: "requests", label: "Requests" },
    { key: "notes",    label: "Notes"    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-4">
        <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">User Management</h1>
        <Breadcrumbs items={[
          { label: "User Management" },
          { label: "Members", href: "/user-management/members" },
          { label: user ? fullName(user) : "Profile" },
        ]} />
        <div className="flex items-center gap-2 mt-1">
          <button onClick={() => router.push("/user-management/members")} className="flex items-center text-[#000080] dark:text-indigo-400 transition-colors hover:text-[#000066] dark:hover:text-indigo-300">
            <BackArrow />
          </button>
          <h2 className="text-[22px] font-bold text-[#000080] dark:text-indigo-400">Member Profile</h2>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error} — <button className="font-medium underline" onClick={fetchUser}>Retry</button>
        </div>
      )}

      {loading ? (
        <SkeletonProfile />
      ) : (
        <>
          {/* Profile Card */}
          <div className="mb-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Photo — shrink-0 so it never squeezes the detail columns */}
              <div className="relative mx-auto flex h-[160px] w-[130px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#E5E7EB] dark:bg-slate-700 sm:mx-0 sm:h-[220px] sm:w-[180px] md:h-[240px] md:w-[200px]">
                {user?.profilePictureUrl && !photoError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profilePictureUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  <UserIcon />
                )}
              </div>

              {/* Details */}
              <div className="flex-1">
                <h2 className="mb-5 text-lg font-bold text-[#000000] dark:text-slate-100">Basic Details</h2>
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
                    { label: "Occupation",              value: user?.occupation },
                    { label: "Group",                   value: groupNames },
                    { label: "First Church Visit",      value: user?.firstTimeService?.title },
                    { label: "First Visit Date",        value: fmtDate(user?.firstTimeService?.date) },
                    { label: "Last Service Attended",   value: user?.serviceAttended },
                    { label: "Date Joined",             value: fmtDate(user?.createdOn) },
                  ].map(({ label, value }) => value ? (
                    <div key={label}>
                      <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">{label}</p>
                      <p className="mt-1 text-sm text-[#111827] dark:text-slate-100 dark:text-slate-200">{value}</p>
                    </div>
                  ) : null)}

                  {/* Spouse — only relevant for married members */}
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
                          className="mt-1 text-sm font-medium text-[#000080] dark:text-indigo-400 underline hover:text-[#000066] dark:hover:text-indigo-300"
                        >
                          {fullName(user.spouse)}
                        </button>
                      ) : (
                        <p className="mt-1 text-sm text-[#9CA3AF] dark:text-slate-500">Not linked</p>
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
                  className={`pb-3 text-sm font-medium transition-colors ${activeTab === tab.key ? "border-b-2 border-[#000080] dark:border-indigo-400 text-[#000080] dark:text-indigo-400" : "text-[#6B7280] dark:text-slate-400 hover:text-[#374151] dark:text-slate-300 dark:hover:text-slate-200"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "requests" && (
            <>
              {reqLoading ? (
                <div className="py-8 text-center text-gray-400 dark:text-slate-500">Loading requests…</div>
              ) : requests.length === 0 ? (
                <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center text-sm text-gray-400 dark:text-slate-500">No requests found.</div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div key={req.id} className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-[#111827] dark:text-slate-100">{req.subject}</h3>
                          <p className="mt-1 text-sm text-[#374151] dark:text-slate-300">{req.content}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="rounded-full bg-[#000080] px-3 py-1 text-xs font-medium text-white">
                              {(req.requestType ?? "").replace(/_/g, " ")}
                            </span>
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${reqStatusColors[req.requestStatus ?? ""] ?? "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400"}`}>
                              {(req.requestStatus ?? "").replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-[#6B7280] dark:text-slate-400">{fmtDate(req.createdOn)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              {/* Add note */}
              <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
                <h3 className="mb-3 text-sm font-bold text-[#111827] dark:text-slate-100">Add Note</h3>

                {/* Category selector */}
                <div className="mb-3 flex gap-2">
                  {(["CALL", "VISIT", "OTHERS"] as NoteCategory[]).map((cat) => {
                    const active = noteCategory === cat;
                    const label  = cat === "CALL" ? "📞 Call" : cat === "VISIT" ? "🏠 Visit" : "📝 Others";
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNoteCategory(cat)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          active
                            ? "border-[#000080] bg-[#000080] text-white"
                            : "border-[#E5E7EB] dark:border-slate-700 text-[#6B7280] dark:text-slate-400 hover:border-[#000080] hover:text-[#000080] dark:hover:text-indigo-400"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder={
                    noteCategory === "CALL"
                      ? "Describe the call with this member…"
                      : noteCategory === "VISIT"
                      ? "Describe the visit to this member…"
                      : "Write a note about this member…"
                  }
                  rows={3}
                  className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 placeholder-[#9CA3AF] outline-none focus:border-[#000080] dark:focus:border-indigo-500 focus:ring-1 focus:ring-[#000080] dark:focus:ring-indigo-500 resize-none"
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  {notesError && <p className="text-xs text-red-600">{notesError}</p>}
                  <div className="ml-auto">
                    <Button variant="primary" onClick={handleAddNote} disabled={addingNote || !noteInput.trim()}>
                      {addingNote ? "Saving…" : `Save ${noteCategory === "CALL" ? "Call" : noteCategory === "VISIT" ? "Visit" : "Note"}`}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Notes list */}
              {notesLoading ? (
                <div className="py-8 text-center text-gray-400 dark:text-slate-500 text-sm">Loading notes…</div>
              ) : notes.length === 0 ? (
                <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center text-sm text-gray-400 dark:text-slate-500">
                  No notes yet. Add one above.
                </div>
              ) : (
                <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
                  <h3 className="mb-3 text-sm font-bold text-[#111827] dark:text-slate-100">Note History</h3>
                  <ul className="space-y-3">
                    {notes.map((note) => {
                      const cat = (note.noteCategory ?? note.type ?? "").toUpperCase();
                      const catLabel = cat.includes("CALL")  ? "Call"  :
                                       cat.includes("VISIT") ? "Visit" : "Note";
                      const catStyle = cat.includes("CALL")
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : cat.includes("VISIT")
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                        : "bg-[#F3F4F6] dark:bg-slate-700/30 text-[#374151] dark:text-slate-300";
                      const author = note.createdBy
                        ? typeof note.createdBy === "string"
                          ? note.createdBy
                          : [note.createdBy.firstName, note.createdBy.lastName].filter(Boolean).join(" ") || note.officerName || "Staff"
                        : note.officerName || "Staff";
                      return (
                        <li key={note.id} className="rounded-lg border border-[#F3F4F6] dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-700/20 px-4 py-3">
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${catStyle}`}>{catLabel}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#9CA3AF] dark:text-slate-400">
                                {note.createdOn
                                  ? new Date(note.createdOn).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                  : "—"}
                              </span>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                disabled={deletingNote === note.id}
                                className="rounded p-0.5 text-[#9CA3AF] dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 disabled:opacity-50 transition-colors"
                                title="Delete note"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                                  <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-[#374151] dark:text-slate-300 whitespace-pre-wrap">{note.content ?? "—"}</p>
                          {author && (
                            <p className="mt-1 text-xs text-[#9CA3AF] dark:text-slate-400">By {author}</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "details" && user && (
            <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-sm text-gray-400 dark:text-slate-500 text-center">
              Assigned Follow-Up:{" "}
              <span className="font-medium text-[#374151] dark:text-slate-300">{fullName(user.assignedFollowUp) || "Not assigned"}</span>
            </div>
          )}

          {/* Actions */}
          {actionMsg && (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 text-sm text-blue-700">{actionMsg}</div>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => router.push(`/user-management/members/${id}/edit`)}>Edit</Button>
            {/* Link Spouse is only meaningful for married members without a spouse already linked */}
            {isMarried && !hasSpouse && (
              <Button variant="primary" onClick={() => router.push(`/user-management/members/${id}/link-spouse`)}>Link Spouse</Button>
            )}
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
