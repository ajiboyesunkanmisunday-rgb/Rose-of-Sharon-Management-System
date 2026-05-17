"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import {
  getNewConvert, addCallReport, addVisitReport, getNotes, deleteNote,
  updateBelieversClass,
  type NewConvertResponse, type NoteResponse,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { SkeletonProfile } from "@/components/ui/Skeleton";

type Tab = "details" | "activity";

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

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-[#6B7280]">{label}</p>
      <p className="mt-1 text-sm text-[#111827]">{value}</p>
    </div>
  );
}


export default function ViewNewConvertPage() {
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

  const [user,    setUser]    = useState<NewConvertResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("details");

  // ── Activity state ─────────────────────────────────────────────────────────
  const [callText,  setCallText]  = useState("");
  const [visitText, setVisitText] = useState("");
  const [classStage, setClassStage] = useState("");
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState("");
  const [saveFailed,  setSaveFailed]  = useState(false);

  const [notes,          setNotes]          = useState<NoteResponse[]>([]);
  const [notesLoading,   setNotesLoading]   = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const { addToast } = useToast();

  const fetchNotes = useCallback(async () => {
    if (!id || id.startsWith("nc-")) return;
    setNotesLoading(true);
    try {
      const data = await getNotes(id);
      setNotes(data);
    } catch { /* non-fatal */ }
    finally { setNotesLoading(false); }
  }, [id]);

  const fetchUser = useCallback(async () => {
    if (!id || id.startsWith("nc-")) return;
    setLoading(true);
    setError("");
    try {
      const data = await getNewConvert(id);
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
    router.push("/user-management/new-converts");
  };

  // ── Activity ───────────────────────────────────────────────────────────────
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
      addToast("Saved successfully.", "success");
      fetchNotes();
    } catch (err) {
      setSaveFailed(true);
      const msg = err instanceof Error ? err.message : "Failed to save.";
      setSaveMsg(msg);
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setDeletingNoteId(noteId);
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      addToast("Entry deleted.", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete.", "error");
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleUpdateClass = async () => {
    if (!id || !classStage) return;
    setSaving(true);
    setSaveMsg("");
    setSaveFailed(false);
    try {
      await updateBelieversClass(id, classStage);
      addToast("Class stage updated.", "success");
    } catch (err) {
      setSaveFailed(true);
      const msg = err instanceof Error ? err.message : "Failed to update class.";
      setSaveMsg(msg);
      addToast(msg, "error");
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

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">User Management</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/user-management/new-converts")} className="flex items-center text-[#000080] transition-colors hover:text-[#000066]">
            <BackArrow />
          </button>
          <h2 className="text-[22px] font-bold text-[#000080]">View New Convert</h2>
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
              <div className="relative mx-auto flex h-[160px] w-[130px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#E5E7EB] sm:mx-0 sm:h-[220px] sm:w-[180px] md:h-[240px] md:w-[200px]">
                <UserIcon />
              </div>
              <div className="flex-1">
                <h2 className="mb-5 text-lg font-bold text-[#000000]">Basic Details</h2>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
                  <Field label="First Name"            value={user?.firstName} />
                  <Field label="Middle Name"           value={user?.middleName} />
                  <Field label="Last Name"             value={user?.lastName} />
                  <Field label="Email"                 value={user?.email} />
                  <Field label="Phone"                 value={phone} />
                  <Field label="Address"               value={address} />
                  <Field label="Gender"                value={user?.sex} />
                  <Field label="Believers Class"       value={user?.believerClassStage} />
                  <Field label="First Service Attended" value={user?.service?.title} />
                  <Field label="First Service Date"    value={fmtDate(user?.service?.date)} />
                  <Field label="Last Service Attended" value={user?.serviceAttended} />
                  <Field label="Date Added"            value={fmtDate(user?.createdOn)} />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 border-b border-[#E5E7EB]">
            <div className="flex gap-8">
              {(["details", "activity"] as Tab[]).map((key) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`pb-3 text-sm font-medium capitalize transition-colors ${activeTab === key ? "border-b-2 border-[#000080] text-[#000080]" : "text-[#6B7280] hover:text-[#374151]"}`}>
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* ── Activity Tab ─────────────────────────────────────────────── */}
          {activeTab === "activity" && (
            <div className="space-y-4">
              {saveMsg && (
                <div className={`rounded-lg px-4 py-3 text-sm border ${saveFailed ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}>
                  {saveMsg}
                </div>
              )}

              {/* Believers Class */}
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-[#111827]">Believers Class Stage</h3>
                <div className="flex gap-3">
                  <select
                    value={classStage}
                    onChange={(e) => setClassStage(e.target.value)}
                    className="flex-1 rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
                  >
                    <option value="">Select Stage</option>
                    <option value="CLASS_1">Class 1</option>
                    <option value="CLASS_2">Class 2</option>
                    <option value="CLASS_3">Class 3</option>
                    <option value="CLASS_4">Class 4</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  <Button variant="primary" onClick={handleUpdateClass} disabled={saving || !classStage}>
                    {saving ? "Saving…" : "Update"}
                  </Button>
                </div>
              </div>

              {/* Log Call */}
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-[#111827]">Log Call Report</h3>
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
                <h3 className="mb-3 text-sm font-bold text-[#111827]">Log Visit Report</h3>
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
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#9CA3AF]">{n.createdOn ? new Date(n.createdOn).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</span>
                              <button
                                onClick={() => handleDeleteNote(n.id)}
                                disabled={deletingNoteId === n.id}
                                className="rounded p-0.5 text-[#9CA3AF] hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                                title="Delete"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                              </button>
                            </div>
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
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete</Button>
            <Button variant="primary" onClick={() => router.push(`/user-management/new-converts/${id}/edit`)}>Edit</Button>
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
