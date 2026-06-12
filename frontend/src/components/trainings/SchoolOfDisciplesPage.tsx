"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import {
  getSchoolOfDisciples,
  searchSchoolOfDisciples,
  markSodAsGraduated,
  giveSodOfficialRemark,
  updateSodFeesPaid,
  markSodFormAsPaid,
  updateSodAdmissionNumber,
  getTrainingEvents,
  createAttendanceRecord,
  getAttendanceSheet,
  getScoreBroadsheet,
  uploadScoreSheet,
  updateScoreSheet,
  createTrainingEvent,
  type SchoolOfDisciplesResponse,
  type SodAttendanceRecord,
  type TrainingEventResponse,
  type AttendanceSheetResponse,
  type StudentAttendance,
  type CreateTrainingEventRequest,
} from "@/lib/api";
import {
  BookOpen, Phone, Mail, RefreshCw, Award, Users,
  CheckCircle, Clock, Star, ChevronDown, X, MessageSquare,
  CalendarCheck, BookCheck, ClipboardList, PlusCircle, FileText, Eye,
  CalendarPlus, BarChart3, Upload, Loader2, Hash,
} from "lucide-react";

const ACCENT   = "#D97706";
const ACCENT10 = "#D9770618";
const ITEMS_PER_PAGE = 12;

// Classes 1–4; Class 1 has no exam
const SOD_CLASSES = [1, 2, 3, 4] as const;

// ─── Local broadsheet types ───────────────────────────────────────────────────
interface StudentScore { scoreSheetId?: string; trainingEventName?: string; score?: number }
interface StudentResult { firstName?: string; middleName?: string; lastName?: string; admissionNo?: string; profilePictureUrl?: string; studentScores?: StudentScore[] }
interface BroadSheet { set?: string; studentResults?: StudentResult[] }

type Tab = "students" | "attendance" | "broadsheet" | "upload";

const avatarBgColors = [
  "bg-[#B5B5F3]", "bg-[#BFDBFE]", "bg-[#BBF7D0]",
  "bg-[#FDE68A]", "bg-[#FECACA]", "bg-[#DDD6FE]",
];

function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return avatarBgColors[Math.abs(hash) % avatarBgColors.length];
}

function initials(u: SchoolOfDisciplesResponse) {
  return `${(u.firstName ?? "")?.[0] ?? ""}${(u.lastName ?? "")?.[0] ?? ""}`.toUpperCase() || "?";
}

function fullName(u: SchoolOfDisciplesResponse) {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

function studentResultName(r: StudentResult) {
  return [r.firstName, r.middleName, r.lastName].filter(Boolean).join(" ") || "—";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fmtDate(s?: any): string {
  if (!s) return "—";
  if (Array.isArray(s)) {
    const [year, month, day] = s as number[];
    return new Date(year, month - 1, day).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  const d = new Date(s as string);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Create Training Event Modal ──────────────────────────────────────────────
function CreateTrainingEventModal({
  setFilter,
  onClose,
  onCreated,
}: {
  setFilter: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name,     setName]     = useState("");
  const [teacher,  setTeacher]  = useState("");
  const [date,     setDate]     = useState("");
  const [location, setLocation] = useState("");
  const [isExam,   setIsExam]   = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError("");
    try {
      await createTrainingEvent({
        trainingCategory: "SCHOOL_OF_DISCIPLES",
        set: setFilter,
        name: name.trim(),
        teacher: teacher.trim() || undefined,
        date: date || "",
        location: location.trim() || undefined,
        isExam,
      } as CreateTrainingEventRequest);
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create training event.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-slate-700 px-5 py-4">
          <div className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" style={{ color: ACCENT }} />
            <h2 className="text-base font-bold text-[#111827] dark:text-slate-100">Create Training Event</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[#F3F4F6] dark:bg-slate-700/30">
            <X className="h-4 w-4 text-[#6B7280] dark:text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Set (read-only) */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400">Set</label>
            <input
              type="text"
              value={setFilter}
              readOnly
              className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] dark:bg-slate-700/30 px-3 py-2.5 text-sm text-[#6B7280] dark:text-slate-400 outline-none"
            />
          </div>

          {/* Name */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400">Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Class 1 Session"
              className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
            />
          </div>

          {/* Teacher */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400">Teacher</label>
            <input
              type="text"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              placeholder="Optional"
              className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
            />
          </div>

          {/* Location */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Optional"
              className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
            />
          </div>

          {/* Is Exam */}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[#374151] dark:text-slate-300">
            <input
              type="checkbox"
              checked={isExam}
              onChange={(e) => setIsExam(e.target.checked)}
              className="h-4 w-4"
              style={{ accentColor: ACCENT }}
            />
            Is Exam
          </label>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] dark:border-slate-700 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-2 text-sm font-medium text-[#374151] dark:text-slate-300 hover:bg-[#F9FAFB]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}
          >
            {saving ? "Creating…" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Attendance Sheet Tab ─────────────────────────────────────────────────────
function AttendanceSheetTab({
  setFilter,
  onFlash,
}: {
  setFilter: string;
  onFlash: (msg: string) => void;
}) {
  const [sheet,        setSheet]        = useState<AttendanceSheetResponse | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [events,       setEvents]       = useState<TrainingEventResponse[]>([]);
  const [eventsLoading,setEventsLoading]= useState(false);
  const [selectedEvt,  setSelectedEvt]  = useState("");
  const [marking,      setMarking]      = useState(false);
  const [markProgress, setMarkProgress] = useState(0);
  const [markTotal,    setMarkTotal]    = useState(0);

  const loadSheet = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAttendanceSheet("SCHOOL_OF_DISCIPLES", setFilter);
      setSheet(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load attendance sheet.");
    } finally {
      setLoading(false);
    }
  }, [setFilter]);

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const evts = await getTrainingEvents("SCHOOL_OF_DISCIPLES", setFilter);
      setEvents(evts);
      if (evts.length > 0) setSelectedEvt(evts[0].id ?? "");
    } catch {
      // non-critical
    } finally {
      setEventsLoading(false);
    }
  }, [setFilter]);

  useEffect(() => {
    loadSheet();
    loadEvents();
  }, [loadSheet, loadEvents]);

  // derive unique event columns
  const columns = useMemo(() => {
    const names = new Set<string>();
    (sheet?.studentAttendances ?? []).forEach((s) => {
      (s.attendances ?? []).forEach((a) => { if (a.trainingEventName) names.add(a.trainingEventName); });
    });
    return [...names].sort();
  }, [sheet]);

  const handleMarkAll = async () => {
    if (!selectedEvt) return;
    const students = (sheet?.studentAttendances ?? []).filter((s) => !!s.admissionNo);
    if (students.length === 0) return;
    setMarking(true);
    setMarkProgress(0);
    setMarkTotal(students.length);
    let done = 0;
    await Promise.all(
      students.map(async (s) => {
        try {
          await createAttendanceRecord({
            trainingEventId: selectedEvt,
            admissionNumber: s.admissionNo!,
            category: "SCHOOL_OF_DISCIPLES",
          });
        } catch {
          // continue on error
        }
        done++;
        setMarkProgress(done);
      })
    );
    setMarking(false);
    onFlash("Attendance marked for all students.");
    await loadSheet();
  };

  const students = sheet?.studentAttendances ?? [];

  return (
    <div className="space-y-5">
      {/* Bulk mark section */}
      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400">Bulk Mark Attendance</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            {eventsLoading ? (
              <div className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2.5 text-sm text-[#9CA3AF] dark:text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading events…
              </div>
            ) : (
              <>
                <select
                  value={selectedEvt}
                  onChange={(e) => setSelectedEvt(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-8 py-2.5 text-sm text-[#374151] dark:text-slate-300 outline-none focus:border-[#D97706]"
                >
                  <option value="">— Select event —</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id ?? ""}>
                      {ev.name ?? ev.id}{ev.isExam ? " (Exam)" : ""}{ev.date ? ` · ${ev.date}` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] dark:text-slate-400" />
              </>
            )}
          </div>
          <button
            onClick={handleMarkAll}
            disabled={marking || !selectedEvt || students.length === 0}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}
          >
            {marking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
            Mark All
          </button>
          <button
            onClick={loadSheet}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-medium text-[#374151] dark:text-slate-300 hover:text-[#D97706] hover:border-[#D97706] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Load Sheet
          </button>
        </div>
        {marking && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1 text-xs text-[#6B7280] dark:text-slate-400">
              <span>Marking attendance…</span>
              <span>{markProgress} / {markTotal}</span>
            </div>
            <div className="h-2 rounded-full bg-[#F3F4F6] dark:bg-slate-700">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${markTotal > 0 ? (markProgress / markTotal) * 100 : 0}%`, backgroundColor: ACCENT }}
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button onClick={loadSheet} className="font-medium underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center text-sm text-[#9CA3AF] dark:text-slate-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading attendance sheet…
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-[#E5E7EB]" />
          <p className="text-sm font-medium text-[#374151] dark:text-slate-300">No attendance data</p>
          <p className="mt-1 text-xs text-[#9CA3AF] dark:text-slate-400">No attendance records found for Set {setFilter}.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#F3F4F6] dark:bg-slate-700/30">
                <th className="sticky left-0 z-10 bg-[#F3F4F6] dark:bg-slate-700/30 px-4 py-3 text-left text-xs font-bold text-[#000080] dark:text-indigo-400 whitespace-nowrap">
                  Student
                </th>
                {columns.map((col) => (
                  <th key={col} className="px-3 py-3 text-center text-xs font-bold text-[#000080] dark:text-indigo-400 whitespace-nowrap max-w-[120px] truncate" title={col}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const attended = new Set((s.attendances ?? []).map((a) => a.trainingEventName));
                return (
                  <tr
                    key={s.admissionNo ?? i}
                    className="border-t border-[#E5E7EB] dark:border-slate-700 odd:bg-white dark:odd:bg-slate-800 even:bg-[#F9FAFB] dark:even:bg-slate-800/50"
                  >
                    <td className="sticky left-0 z-10 bg-inherit px-4 py-3 whitespace-nowrap">
                      <p className="text-xs font-semibold text-[#111827] dark:text-slate-100">
                        {[s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ") || "—"}
                      </p>
                      <p className="text-[10px] text-[#9CA3AF] dark:text-slate-400">{s.admissionNo ?? "—"}</p>
                    </td>
                    {columns.map((col) => (
                      <td key={col} className="px-3 py-3 text-center">
                        {attended.has(col)
                          ? <CheckCircle className="mx-auto h-4 w-4 text-green-500" />
                          : <span className="text-[#9CA3AF] dark:text-slate-500">—</span>
                        }
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Broadsheet Tab ───────────────────────────────────────────────────────────
function BroadsheetTab({
  setFilter,
  onFlash,
}: {
  setFilter: string;
  onFlash: (msg: string) => void;
}) {
  const [sheet,   setSheet]   = useState<BroadSheet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // editing state: key = `${admissionNo}__${eventName}`
  const [editing, setEditing]     = useState<Record<string, string>>({});
  const [saving,  setSavingCells] = useState<Set<string>>(new Set());

  const loadSheet = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getScoreBroadsheet("SCHOOL_OF_DISCIPLES", setFilter) as BroadSheet;
      setSheet(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load broadsheet.");
    } finally {
      setLoading(false);
    }
  }, [setFilter]);

  useEffect(() => { loadSheet(); }, [loadSheet]);

  const columns = useMemo(() => {
    const names = new Set<string>();
    (sheet?.studentResults ?? []).forEach((r) => {
      (r.studentScores ?? []).forEach((sc) => { if (sc.trainingEventName) names.add(sc.trainingEventName); });
    });
    return [...names].sort();
  }, [sheet]);

  const students = sheet?.studentResults ?? [];

  const cellKey = (admissionNo: string, eventName: string) => `${admissionNo}__${eventName}`;

  const getScore = (student: StudentResult, eventName: string): StudentScore | undefined =>
    (student.studentScores ?? []).find((sc) => sc.trainingEventName === eventName);

  const handleCellBlur = async (student: StudentResult, eventName: string, rawValue: string) => {
    const key = cellKey(student.admissionNo ?? "", eventName);
    const score = getScore(student, eventName);
    if (!score?.scoreSheetId) {
      // no ID to update — just clear editing state
      setEditing((prev) => { const n = { ...prev }; delete n[key]; return n; });
      return;
    }
    const newScore = parseFloat(rawValue);
    if (isNaN(newScore)) {
      setEditing((prev) => { const n = { ...prev }; delete n[key]; return n; });
      return;
    }
    setSavingCells((prev) => new Set([...prev, key]));
    try {
      await updateScoreSheet(score.scoreSheetId, newScore);
      onFlash("Score updated.");
      await loadSheet();
    } catch {
      // ignore
    } finally {
      setSavingCells((prev) => { const n = new Set(prev); n.delete(key); return n; });
      setEditing((prev) => { const n = { ...prev }; delete n[key]; return n; });
    }
  };

  // column averages
  const colAverages = useMemo(() => {
    return columns.map((col) => {
      const vals = students
        .map((s) => getScore(s, col)?.score)
        .filter((v): v is number => typeof v === "number");
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    });
  }, [columns, students]);

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          onClick={loadSheet}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-[#374151] dark:text-slate-300 hover:text-[#D97706] hover:border-[#D97706] disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Reload
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button onClick={loadSheet} className="font-medium underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center text-sm text-[#9CA3AF] dark:text-slate-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading broadsheet…
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center">
          <BarChart3 className="mx-auto mb-3 h-10 w-10 text-[#E5E7EB]" />
          <p className="text-sm font-medium text-[#374151] dark:text-slate-300">No broadsheet data</p>
          <p className="mt-1 text-xs text-[#9CA3AF] dark:text-slate-400">No score records found for Set {setFilter}.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#F3F4F6] dark:bg-slate-700/30">
                <th className="sticky left-0 z-10 bg-[#F3F4F6] dark:bg-slate-700/30 px-4 py-3 text-left text-xs font-bold text-[#000080] dark:text-indigo-400 whitespace-nowrap">
                  Student
                </th>
                {columns.map((col) => (
                  <th key={col} className="px-3 py-3 text-center text-xs font-bold text-[#000080] dark:text-indigo-400 whitespace-nowrap max-w-[120px] truncate" title={col}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const admNo = s.admissionNo ?? String(i);
                return (
                  <tr
                    key={admNo}
                    className="border-t border-[#E5E7EB] dark:border-slate-700 odd:bg-white dark:odd:bg-slate-800 even:bg-[#F9FAFB] dark:even:bg-slate-800/50"
                  >
                    <td className="sticky left-0 z-10 bg-inherit px-4 py-3 whitespace-nowrap">
                      <p className="text-xs font-semibold text-[#111827] dark:text-slate-100">{studentResultName(s)}</p>
                      <p className="text-[10px] text-[#9CA3AF] dark:text-slate-400">{s.admissionNo ?? "—"}</p>
                    </td>
                    {columns.map((col) => {
                      const sc = getScore(s, col);
                      const key = cellKey(admNo, col);
                      const isEditing = key in editing;
                      const isSaving = saving.has(key);
                      return (
                        <td key={col} className="px-3 py-3 text-center">
                          {isSaving ? (
                            <Loader2 className="mx-auto h-4 w-4 animate-spin text-[#9CA3AF]" />
                          ) : isEditing ? (
                            <input
                              type="number"
                              autoFocus
                              value={editing[key]}
                              onChange={(e) => setEditing((prev) => ({ ...prev, [key]: e.target.value }))}
                              onBlur={() => handleCellBlur(s, col, editing[key])}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                                if (e.key === "Escape") {
                                  setEditing((prev) => { const n = { ...prev }; delete n[key]; return n; });
                                }
                              }}
                              className="w-16 rounded border border-[#D97706] px-1.5 py-1 text-center text-xs outline-none focus:ring-1 focus:ring-[#D97706]"
                            />
                          ) : sc?.score !== undefined ? (
                            <span
                              className="cursor-pointer rounded px-1.5 py-0.5 text-xs font-medium text-[#374151] dark:text-slate-300 hover:bg-amber-50 hover:text-[#D97706]"
                              onClick={() => setEditing((prev) => ({ ...prev, [key]: String(sc.score) }))}
                              title="Click to edit"
                            >
                              {sc.score}
                            </span>
                          ) : (
                            <span
                              className="cursor-pointer text-[#9CA3AF] dark:text-slate-500 hover:text-[#D97706]"
                              onClick={() => setEditing((prev) => ({ ...prev, [key]: "" }))}
                              title="Click to add score"
                            >
                              —
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            {/* Footer averages */}
            {columns.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-[#E5E7EB] dark:border-slate-700 bg-[#F3F4F6] dark:bg-slate-700/30">
                  <td className="sticky left-0 z-10 bg-[#F3F4F6] dark:bg-slate-700/30 px-4 py-3 text-xs font-bold text-[#000080] dark:text-indigo-400 whitespace-nowrap">
                    Average
                  </td>
                  {colAverages.map((avg, idx) => (
                    <td key={columns[idx]} className="px-3 py-3 text-center text-xs font-bold text-[#000080] dark:text-indigo-400">
                      {avg !== null ? avg.toFixed(1) : "—"}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Upload Scores Tab ────────────────────────────────────────────────────────
interface ScoreRow { admissionNumber: string; score: string }

function UploadScoresTab({
  setFilter,
  onFlash,
  onSwitchTab,
}: {
  setFilter: string;
  onFlash: (msg: string) => void;
  onSwitchTab: (tab: Tab) => void;
}) {
  const [eventName, setEventName] = useState("");
  const [rows,      setRows]      = useState<ScoreRow[]>([{ admissionNumber: "", score: "" }]);
  const [submitting,setSubmitting]= useState(false);
  const [error,     setError]     = useState("");

  const addRow = () => setRows((prev) => [...prev, { admissionNumber: "", score: "" }]);
  const removeRow = (idx: number) => setRows((prev) => prev.filter((_, i) => i !== idx));

  const updateRow = (idx: number, field: keyof ScoreRow, value: string) => {
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const handleSubmit = async () => {
    if (!eventName.trim()) { setError("Training Event Name is required."); return; }
    const valid = rows.filter((r) => r.admissionNumber.trim() && r.score.trim());
    if (valid.length === 0) { setError("Add at least one row with an admission number and score."); return; }
    setSubmitting(true);
    setError("");
    try {
      await uploadScoreSheet({
        category: "SCHOOL_OF_DISCIPLES",
        createScoreRequests: valid.map((r) => ({
          trainingEventName: eventName.trim(),
          set: setFilter,
          admissionNumber: r.admissionNumber.trim(),
          score: Number(r.score),
        })),
      });
      onFlash("Scores uploaded successfully.");
      onSwitchTab("broadsheet");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to upload scores.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5 space-y-4">

        {/* Event Name */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400">
            Training Event Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="e.g. Class 1 Exam"
            className="w-full max-w-md rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
          />
        </div>

        {/* Set (read-only) */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400">Set</label>
          <input
            type="text"
            value={setFilter}
            readOnly
            className="w-full max-w-md rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] dark:bg-slate-700/30 px-3 py-2.5 text-sm text-[#6B7280] dark:text-slate-400 outline-none"
          />
        </div>

        {/* Score rows */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400">Scores</label>
          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#F3F4F6] dark:bg-slate-700/30">
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-[#000080] dark:text-indigo-400">#</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-[#000080] dark:text-indigo-400">Admission Number</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-[#000080] dark:text-indigo-400">Score</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-[#000080] dark:text-indigo-400"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className="border-t border-[#E5E7EB] dark:border-slate-700 odd:bg-white dark:odd:bg-slate-800 even:bg-[#F9FAFB] dark:even:bg-slate-800/50">
                    <td className="px-4 py-2 text-xs text-[#9CA3AF] dark:text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={row.admissionNumber}
                        onChange={(e) => updateRow(idx, "admissionNumber", e.target.value)}
                        placeholder="e.g. SOD-2024-001"
                        className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-[#111827] dark:text-slate-100 outline-none focus:border-[#D97706]"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={row.score}
                        onChange={(e) => updateRow(idx, "score", e.target.value)}
                        placeholder="0–100"
                        className="w-24 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-[#111827] dark:text-slate-100 outline-none focus:border-[#D97706]"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => removeRow(idx)}
                        disabled={rows.length === 1}
                        className="rounded-lg p-1.5 text-[#9CA3AF] dark:text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                        title="Remove row"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={addRow}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium"
            style={{ color: ACCENT }}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Add Row
          </button>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700">{error}</p>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {submitting ? "Uploading…" : "Upload Scores"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Attendance Modal ─────────────────────────────────────────────────────────
function AttendanceModal({
  student,
  onClose,
  onSave,
}: {
  student: SchoolOfDisciplesResponse;
  onClose: () => void;
  onSave: (trainingEventId: string, admissionNo: string) => Promise<void>;
}) {
  const [events, setEvents]               = useState<TrainingEventResponse[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError]     = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  useEffect(() => {
    if (!student.set) {
      setEventsError("Student has no set assigned — cannot load training events.");
      return;
    }
    setEventsLoading(true);
    getTrainingEvents("SCHOOL_OF_DISCIPLES", student.set)
      .then((evts) => {
        setEvents(evts);
        if (evts.length > 0) setSelectedEventId(evts[0].id ?? "");
      })
      .catch(() => setEventsError("Failed to load training events."))
      .finally(() => setEventsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student.set]);

  const handleSave = async () => {
    if (!selectedEventId) { setError("Please select a training event."); return; }
    if (!student.admissionNo) { setError("Student has no admission number on record."); return; }
    setSaving(true);
    setError("");
    try {
      await onSave(selectedEventId, student.admissionNo);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark attendance.");
    } finally {
      setSaving(false);
    }
  };

  const selectedEvent = events.find((ev) => ev.id === selectedEventId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-slate-700 px-5 py-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" style={{ color: ACCENT }} />
            <div>
              <h2 className="text-base font-bold text-[#111827] dark:text-slate-100">Mark Attendance</h2>
              <p className="text-xs text-[#6B7280] dark:text-slate-400">{fullName(student)}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[#F3F4F6] dark:bg-slate-700/30">
            <X className="h-4 w-4 text-[#6B7280] dark:text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400">Admission No</p>
              <p className="text-sm font-semibold text-[#111827] dark:text-slate-100">{student.admissionNo ?? "—"}</p>
            </div>
            <div className="h-8 w-px bg-[#E5E7EB] dark:bg-slate-700" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400">Set</p>
              <p className="text-sm font-semibold text-[#111827] dark:text-slate-100">{student.set ?? "—"}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400">Select Training Event</p>

            {eventsLoading ? (
              <div className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2.5 text-sm text-[#9CA3AF] dark:text-slate-400">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading events…
              </div>
            ) : eventsError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700">{eventsError}</p>
            ) : events.length === 0 ? (
              <p className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] px-3 py-2.5 text-sm text-[#9CA3AF] dark:text-slate-400">
                No training events found for set &quot;{student.set}&quot;.
              </p>
            ) : (
              <div className="relative">
                <select
                  value={selectedEventId}
                  onChange={(e) => { setSelectedEventId(e.target.value); setError(""); }}
                  className="w-full appearance-none rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 pr-8 text-sm text-[#111827] dark:text-slate-100 outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                >
                  <option value="">— Select an event —</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id ?? ""}>
                      {ev.name ?? ev.id}
                      {ev.isExam ? " (Exam)" : ""}
                      {ev.date ? ` · ${ev.date}` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] dark:text-slate-400" />
              </div>
            )}

            {selectedEvent && (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-[#92400E]">
                {selectedEvent.teacher && <span><span className="font-semibold">Teacher:</span> {selectedEvent.teacher}</span>}
                {selectedEvent.location && <span><span className="font-semibold">Location:</span> {selectedEvent.location}</span>}
                {selectedEvent.isExam && (
                  <span className="rounded-full bg-amber-200 px-2 py-0.5 font-semibold">Exam</span>
                )}
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] dark:border-slate-700 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-2 text-sm font-medium text-[#374151] dark:text-slate-300 hover:bg-[#F9FAFB]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !selectedEventId || eventsLoading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}
          >
            {saving ? "Saving…" : "Mark Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Official Remark Modal ────────────────────────────────────────────────────
function RemarkModal({
  student,
  onClose,
  onSave,
}: {
  student: SchoolOfDisciplesResponse;
  onClose: () => void;
  onSave: (id: string, text: string) => Promise<void>;
}) {
  const [text, setText] = useState(student.officialRemarks ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await onSave(student.id, text.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-slate-700 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-[#111827] dark:text-slate-100">Official Remark</h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400">{fullName(student)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[#F3F4F6] dark:bg-slate-700/30">
            <X className="h-4 w-4 text-[#6B7280] dark:text-slate-400" />
          </button>
        </div>
        <div className="p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Enter official remark…"
            className="w-full resize-none rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 placeholder-[#9CA3AF] outline-none focus:border-[#D97706]"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] dark:border-slate-700 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-2 text-sm font-medium text-[#374151] dark:text-slate-300 hover:bg-[#F9FAFB]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !text.trim()}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}
          >
            {saving ? "Saving…" : "Save Remark"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Fees Paid Modal ──────────────────────────────────────────────────────────
function FeesPaidModal({
  student,
  onClose,
  onSave,
}: {
  student: SchoolOfDisciplesResponse;
  onClose: () => void;
  onSave: (id: string, fees: number) => Promise<void>;
}) {
  const [amount, setAmount] = useState(String(student.feesPaid ?? ""));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    const val = Number(amount);
    if (isNaN(val) || val < 0) { setError("Please enter a valid amount."); return; }
    setSaving(true);
    setError("");
    try {
      await onSave(student.id, val);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update fees paid.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-slate-700 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-[#111827] dark:text-slate-100">Update Fees Paid</h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400">{fullName(student)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[#F3F4F6] dark:bg-slate-700/30">
            <X className="h-4 w-4 text-[#6B7280] dark:text-slate-400" />
          </button>
        </div>
        <div className="p-5">
          <label className="mb-1.5 block text-xs font-semibold text-[#374151] dark:text-slate-300">Amount Paid (₦)</label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 5000"
            className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 focus:border-[#D97706] focus:outline-none bg-white dark:bg-slate-900"
          />
          {student.feesPaid != null && (
            <p className="mt-1.5 text-xs text-[#9CA3AF] dark:text-slate-400">Current: ₦{student.feesPaid.toLocaleString()}</p>
          )}
          {student.paidForForm && (
            <p className="mt-1 text-xs font-medium text-green-600">Form payment confirmed ✓</p>
          )}
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] dark:border-slate-700 px-5 py-4">
          <button onClick={onClose} className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-2 text-sm font-medium text-[#374151] dark:text-slate-300 hover:bg-[#F9FAFB]">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admission Number Modal ────────────────────────────────────────────────────
function AdmissionNumberModal({
  student,
  onClose,
  onSave,
}: {
  student: SchoolOfDisciplesResponse;
  onClose: () => void;
  onSave: (id: string, admNo: string) => Promise<void>;
}) {
  const [admNo, setAdmNo] = useState(student.admissionNo ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!admNo.trim()) { setError("Admission number cannot be empty."); return; }
    setSaving(true);
    setError("");
    try {
      await onSave(student.id, admNo.trim());
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update admission number.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-slate-700 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-[#111827] dark:text-slate-100">Update Admission Number</h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400">{fullName(student)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[#F3F4F6] dark:bg-slate-700/30">
            <X className="h-4 w-4 text-[#6B7280] dark:text-slate-400" />
          </button>
        </div>
        <div className="p-5">
          <label className="mb-1.5 block text-xs font-semibold text-[#374151] dark:text-slate-300">Admission Number</label>
          <input
            type="text"
            value={admNo}
            onChange={(e) => setAdmNo(e.target.value)}
            placeholder="e.g. SOD/2024/001"
            className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 focus:border-[#D97706] focus:outline-none bg-white dark:bg-slate-900"
          />
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] dark:border-slate-700 px-5 py-4">
          <button onClick={onClose} className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-2 text-sm font-medium text-[#374151] dark:text-slate-300 hover:bg-[#F9FAFB]">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Attendance Mini-Summary (shown on card) ──────────────────────────────────
function AttendanceSummaryBar({ student }: { student: SchoolOfDisciplesResponse }) {
  const classAttended = new Set((student.classAttendance ?? []).map((r) => r.classNumber));
  const examAttended  = new Set((student.examAttendance  ?? []).map((r) => r.classNumber));
  const anyAttendance = classAttended.size > 0 || examAttended.size > 0;
  if (!anyAttendance) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {SOD_CLASSES.map((cn) => {
        const cDone = classAttended.has(cn);
        const eDone = examAttended.has(cn);
        if (!cDone && !eDone) return null;
        return (
          <span
            key={cn}
            title={`Class ${cn}${cDone ? " ✓ Attended" : ""}${eDone ? " · Exam ✓" : ""}`}
            className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
            style={{ backgroundColor: ACCENT10, color: ACCENT }}
          >
            C{cn}
            {cDone && <CheckCircle className="h-2.5 w-2.5 text-green-600" />}
            {eDone && <BookCheck className="h-2.5 w-2.5 text-blue-600" />}
          </span>
        );
      })}
    </div>
  );
}

// ─── Student Card ─────────────────────────────────────────────────────────────
function StudentCard({
  student,
  selected,
  onToggleSelect,
  onRemark,
  onAttendance,
  onViewForm,
  onFeesPaid,
  onAdmissionNumber,
}: {
  student: SchoolOfDisciplesResponse;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onRemark: (s: SchoolOfDisciplesResponse) => void;
  onAttendance: (s: SchoolOfDisciplesResponse) => void;
  onViewForm: (id: string) => void;
  onFeesPaid: (s: SchoolOfDisciplesResponse) => void;
  onAdmissionNumber: (s: SchoolOfDisciplesResponse) => void;
}) {
  const bg = avatarColor(student.id);
  const phone = student.phoneNumber
    ? `+${student.countryCode ?? ""} ${student.phoneNumber}`.trim()
    : null;
  const isGraduated = !!student.graduationDate;

  return (
    <div
      className={`relative flex flex-col rounded-xl border bg-white dark:bg-slate-800 p-5 shadow-sm transition-shadow hover:shadow-md ${
        selected ? "ring-1" : "border-[#E5E7EB] dark:border-slate-700"
      }`}
      style={selected ? { borderColor: ACCENT, boxShadow: `0 0 0 1px ${ACCENT}` } : {}}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggleSelect(student.id)}
        className="absolute right-3 top-3 h-4 w-4 cursor-pointer"
        style={{ accentColor: ACCENT }}
      />

      {isGraduated && (
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
          <CheckCircle className="h-3 w-3" />
          Graduated
        </span>
      )}

      <div className={`mb-3 ${isGraduated ? "mt-6" : "mt-4"}`}>
        {student.profilePictureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={student.profilePictureUrl}
            alt={fullName(student)}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${bg} text-lg font-bold text-[#000080] dark:text-indigo-400`}>
            {initials(student)}
          </div>
        )}
      </div>

      <h3 className="text-sm font-bold text-[#111827] dark:text-slate-100">{fullName(student)}</h3>
      {student.set && (
        <span
          className="mt-1 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white"
          style={{ backgroundColor: ACCENT }}
        >
          <Star className="h-2.5 w-2.5" />
          Set {student.set}
        </span>
      )}
      {student.occupation && (
        <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">{student.occupation}</p>
      )}

      {(student.currentParishPastorName || student.activityInCurrentParish) && (
        <div className="mt-2 space-y-0.5">
          {student.currentParishPastorName && (
            <p className="text-[10px] text-[#6B7280] dark:text-slate-400">
              <span className="font-medium text-[#374151] dark:text-slate-300">Pastor:</span>{" "}
              {student.currentParishPastorName}
            </p>
          )}
          {student.activityInCurrentParish && (
            <p className="text-[10px] text-[#6B7280] dark:text-slate-400">
              <span className="font-medium text-[#374151] dark:text-slate-300">Activity:</span>{" "}
              {student.activityInCurrentParish}
            </p>
          )}
        </div>
      )}

      <AttendanceSummaryBar student={student} />

      {student.officialRemarks && (
        <div className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] text-amber-700">
          <span className="font-semibold">Remark:</span> {student.officialRemarks}
        </div>
      )}

      <div className="mt-3 space-y-1">
        {phone && (
          <div className="flex items-center gap-1.5 text-xs text-[#374151] dark:text-slate-300">
            <Phone className="h-3 w-3 shrink-0 text-[#9CA3AF] dark:text-slate-400" />
            <span>{phone}</span>
          </div>
        )}
        {student.email && (
          <div className="flex items-center gap-1.5 text-xs text-[#374151] dark:text-slate-300">
            <Mail className="h-3 w-3 shrink-0 text-[#9CA3AF] dark:text-slate-400" />
            <span className="truncate">{student.email}</span>
          </div>
        )}
      </div>

      {student.createdOn && (
        <p className="mt-2 text-[10px] text-[#9CA3AF] dark:text-slate-400">Enrolled {fmtDate(student.createdOn)}</p>
      )}
      {student.graduationDate && (
        <p className="mt-0.5 text-[10px] font-medium text-green-600">Graduated {fmtDate(student.graduationDate)}</p>
      )}

      {/* Fees paid badge */}
      {student.feesPaid != null && (
        <div className="mt-2 rounded-lg bg-green-50 px-2.5 py-1.5 text-[10px] text-green-700">
          <span className="font-semibold">Fees Paid:</span> ₦{student.feesPaid.toLocaleString()}
          {student.paidForForm && <span className="ml-1.5 font-semibold">(Form ✓)</span>}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <button
          onClick={() => onAttendance(student)}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-2 py-1.5 text-xs font-medium text-[#374151] dark:text-slate-300 transition-colors hover:border-[#D97706] hover:text-[#D97706]"
        >
          <CalendarCheck className="h-3 w-3" />
          Attendance
        </button>
        <button
          onClick={() => onRemark(student)}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-2 py-1.5 text-xs font-medium text-[#374151] dark:text-slate-300 transition-colors hover:border-[#D97706] hover:text-[#D97706]"
        >
          <MessageSquare className="h-3 w-3" />
          {student.officialRemarks ? "Edit Remark" : "Remark"}
        </button>
        <button
          onClick={() => onFeesPaid(student)}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-2 py-1.5 text-xs font-medium text-[#374151] dark:text-slate-300 transition-colors hover:border-green-600 hover:text-green-600"
        >
          <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1 }}>₦</span>
          Fees
        </button>
        <button
          onClick={() => onAdmissionNumber(student)}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-2 py-1.5 text-xs font-medium text-[#374151] dark:text-slate-300 transition-colors hover:border-blue-600 hover:text-blue-600"
        >
          <Hash className="h-3 w-3" />
          Adm No.
        </button>
      </div>
      <button
        onClick={() => onViewForm(student.id)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-[#374151] dark:text-slate-300 transition-colors hover:border-[#000080] hover:text-[#000080] dark:text-indigo-400"
      >
        <Eye className="h-3 w-3" />
        View Form
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SchoolOfDisciplesPage() {
  const router = useRouter();
  const [allStudents,           setAllStudents]           = useState<SchoolOfDisciplesResponse[]>([]);
  const [loading,               setLoading]               = useState(true);
  const [error,                 setError]                 = useState("");
  const [search,                setSearch]                = useState("");
  const [setFilter,             setSetFilter]             = useState(String(new Date().getFullYear()));
  const [page,                  setPage]                  = useState(1);
  const [selected,              setSelected]              = useState<Set<string>>(new Set());
  const [graduating,            setGraduating]            = useState(false);
  const [remarkStudent,         setRemarkStudent]         = useState<SchoolOfDisciplesResponse | null>(null);
  const [attendanceStudent,     setAttendanceStudent]     = useState<SchoolOfDisciplesResponse | null>(null);
  const [feesStudent,           setFeesStudent]           = useState<SchoolOfDisciplesResponse | null>(null);
  const [admNoStudent,          setAdmNoStudent]          = useState<SchoolOfDisciplesResponse | null>(null);
  const [successMsg,            setSuccessMsg]            = useState("");
  const [activeTab,             setActiveTab]             = useState<Tab>("students");
  const [showCreateEventModal,  setShowCreateEventModal]  = useState(false);

  const load = useCallback(async (activeSet: string) => {
    setLoading(true);
    setError("");
    try {
      const first = await getSchoolOfDisciples(0, 200, activeSet || undefined);
      const rows = [...(first.content ?? [])];
      const totalPages = Math.min(first.totalPages ?? 1, 10);
      if (totalPages > 1) {
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            getSchoolOfDisciples(i + 1, 200, activeSet || undefined)
          )
        );
        rest.forEach((r) => rows.push(...(r.content ?? [])));
      }
      setAllStudents(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(setFilter); }, [load, setFilter]);

  const availableSets = useMemo(() => {
    const sets = new Set<string>();
    allStudents.forEach((s) => { if (s.set) sets.add(s.set); });
    return [...sets].sort();
  }, [allStudents]);

  const filtered = useMemo(() => {
    let list = allStudents;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          fullName(s).toLowerCase().includes(q) ||
          (s.email ?? "").toLowerCase().includes(q) ||
          (s.phoneNumber ?? "").toLowerCase().includes(q) ||
          (s.occupation ?? "").toLowerCase().includes(q) ||
          (s.admissionNo ?? "").toLowerCase().includes(q) ||
          (s.set ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [allStudents, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const graduated  = allStudents.filter((s) => !!s.graduationDate);
  const inTraining = allStudents.filter((s) => !s.graduationDate);

  const toggleSelect = (id: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () =>
    setSelected((prev) =>
      prev.size === paginated.length
        ? new Set()
        : new Set(paginated.map((s) => s.id))
    );

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleGraduate = async () => {
    if (selected.size === 0) return;
    setGraduating(true);
    try {
      await markSodAsGraduated([...selected]);
      setSelected(new Set());
      flash(`${selected.size} student${selected.size > 1 ? "s" : ""} marked as graduated.`);
      await load(setFilter);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark as graduated.");
    } finally {
      setGraduating(false);
    }
  };

  const handleSaveRemark = async (id: string, text: string) => {
    try {
      await giveSodOfficialRemark(id, text);
      flash("Official remark saved.");
      await load(setFilter);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save remark.");
    }
  };

  const handleSaveAttendance = async (trainingEventId: string, admissionNo: string) => {
    try {
      await createAttendanceRecord({
        trainingEventId,
        admissionNumber: admissionNo,
        category: "SCHOOL_OF_DISCIPLES",
      });
      flash("Attendance marked successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark attendance.");
      return;
    }
    await load(setFilter);
  };

  const handleSaveFees = async (id: string, fees: number) => {
    try {
      await updateSodFeesPaid(id, fees);
      flash("Fees paid updated.");
      setAllStudents((prev) => prev.map((s) => s.id === id ? { ...s, feesPaid: fees } : s));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update fees.");
    }
  };

  const handleSaveAdmissionNumber = async (id: string, admNo: string) => {
    try {
      await updateSodAdmissionNumber(id, admNo);
      flash("Admission number updated.");
      setAllStudents((prev) => prev.map((s) => s.id === id ? { ...s, admissionNo: admNo } : s));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update admission number.");
    }
  };

  const handleMarkFormAsPaid = async (ids: string[]) => {
    try {
      await markSodFormAsPaid(ids);
      flash(`${ids.length} form${ids.length > 1 ? "s" : ""} marked as paid.`);
      setAllStudents((prev) => prev.map((s) => ids.includes(s.id) ? { ...s, paidForForm: true } : s));
      setSelected(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark forms as paid.");
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) { await load(setFilter); return; }
    setLoading(true);
    setError("");
    try {
      const res = await searchSchoolOfDisciples(search.trim(), 0, 200, setFilter);
      setAllStudents(res.content ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "students",   label: "Students",        icon: <Users className="h-3.5 w-3.5" /> },
    { key: "attendance", label: "Attendance Sheet", icon: <ClipboardList className="h-3.5 w-3.5" /> },
    { key: "broadsheet", label: "Broadsheet",       icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { key: "upload",     label: "Upload Scores",    icon: <Upload className="h-3.5 w-3.5" /> },
  ];

  return (
    <DashboardLayout>
      {remarkStudent && (
        <RemarkModal
          student={remarkStudent}
          onClose={() => setRemarkStudent(null)}
          onSave={handleSaveRemark}
        />
      )}
      {attendanceStudent && (
        <AttendanceModal
          student={attendanceStudent}
          onClose={() => setAttendanceStudent(null)}
          onSave={handleSaveAttendance}
        />
      )}
      {feesStudent && (
        <FeesPaidModal
          student={feesStudent}
          onClose={() => setFeesStudent(null)}
          onSave={handleSaveFees}
        />
      )}
      {admNoStudent && (
        <AdmissionNumberModal
          student={admNoStudent}
          onClose={() => setAdmNoStudent(null)}
          onSave={handleSaveAdmissionNumber}
        />
      )}
      {showCreateEventModal && (
        <CreateTrainingEventModal
          setFilter={setFilter}
          onClose={() => setShowCreateEventModal(false)}
          onCreated={() => {
            setShowCreateEventModal(false);
            flash("Training event created.");
            if (activeTab === "attendance" || activeTab === "broadsheet") {
              // tabs will self-reload on mount; trigger a key change or just flash
            }
          }}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start gap-3 sm:flex-nowrap sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: ACCENT10 }}>
          <BookOpen className="h-6 w-6" style={{ color: ACCENT }} />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#000000] dark:text-slate-100">School of Disciples</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Members enrolled in the SOD programme</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
          <button
            onClick={() => router.push("/trainings/sod/form")}
            className="flex items-center gap-2 rounded-lg bg-[#000080] px-4 py-2 text-xs font-semibold text-white hover:bg-[#000066]"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Application
          </button>
          <button
            onClick={() => router.push("/trainings/sod/form?mode=blank")}
            className="flex items-center gap-2 rounded-lg border border-[#000080] bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-[#000080] dark:text-indigo-400 hover:bg-[#000080] hover:text-white transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            Download Blank Form
          </button>
          <button
            onClick={() => setShowCreateEventModal(true)}
            className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-[#374151] dark:text-slate-300 hover:border-[#D97706] hover:text-[#D97706] transition-colors"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            Create Training Event
          </button>
          <button
            onClick={() => load(setFilter)}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-[#374151] dark:text-slate-300 hover:text-[#D97706] hover:border-[#D97706] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: ACCENT }}>{allStudents.length}</p>
            <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">Total enrolled</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center">
            <p className="text-2xl font-bold text-[#16A34A] dark:text-green-300">{graduated.length}</p>
            <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">Graduated</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center">
            <p className="text-2xl font-bold text-[#000080] dark:text-indigo-400">{inTraining.length}</p>
            <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">In training</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center">
            <p className="text-2xl font-bold text-[#374151] dark:text-slate-300">{availableSets.length}</p>
            <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">Set{availableSets.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="mb-5 border-b border-[#E5E7EB] dark:border-slate-700">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
                  active
                    ? "text-[#D97706]"
                    : "border-b-transparent text-[#6B7280] dark:text-slate-400 hover:text-[#374151] dark:hover:text-slate-200"
                }`}
                style={active ? { borderBottomColor: "#D97706" } : {}}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Banners */}
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button onClick={() => load(setFilter)} className="font-medium underline">Retry</button>
        </div>
      )}

      {/* Tab: Students */}
      {activeTab === "students" && (
        <>
          {/* Controls */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="w-full sm:w-72">
              <SearchBar
                value={search}
                onChange={(v) => { setSearch(v); setPage(1); }}
                onSearch={handleSearch}
                placeholder="Search by name, phone, ministry…"
              />
            </div>

            <div className="relative">
              <select
                value={setFilter}
                onChange={(e) => { setSetFilter(e.target.value); setPage(1); }}
                className="appearance-none rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-8 py-2.5 text-sm text-[#374151] dark:text-slate-300 outline-none focus:border-[#D97706]"
              >
                {Array.from(
                  new Set([
                    ...availableSets,
                    String(new Date().getFullYear() - 1),
                    String(new Date().getFullYear()),
                    String(new Date().getFullYear() + 1),
                  ])
                ).sort().map((s) => (
                  <option key={s} value={s}>Set {s}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] dark:text-slate-400" />
            </div>

            {selected.size > 0 && (
              <>
                <button
                  onClick={handleGraduate}
                  disabled={graduating}
                  className="flex items-center gap-2 rounded-lg bg-[#16A34A] px-3 py-2 text-xs font-semibold text-white hover:bg-[#15803D] disabled:opacity-50"
                >
                  <Award className="h-3.5 w-3.5" />
                  {graduating ? "Graduating…" : `Graduate ${selected.size}`}
                </button>
                <button
                  onClick={() => handleMarkFormAsPaid([...selected])}
                  className="flex items-center gap-2 rounded-lg bg-[#059669] px-3 py-2 text-xs font-semibold text-white hover:bg-[#047857]"
                >
                  <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1 }}>₦</span>
                  Mark Form Paid
                </button>
              </>
            )}

            <span className="ml-auto text-sm text-[#6B7280] dark:text-slate-400">
              {filtered.length} {filtered.length === 1 ? "student" : "students"}
            </span>
          </div>

          {/* Select-all row */}
          {!loading && paginated.length > 0 && (
            <div className="mb-3 flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-[#6B7280] dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={selected.size === paginated.length && paginated.length > 0}
                  onChange={toggleAll}
                  className="h-3.5 w-3.5"
                  style={{ accentColor: ACCENT }}
                />
                Select all on this page
              </label>
              {selected.size > 0 && (
                <button onClick={() => setSelected(new Set())} className="text-xs text-[#6B7280] dark:text-slate-400 underline hover:text-[#374151] dark:text-slate-300">
                  Clear selection
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="flex h-48 items-center justify-center text-sm text-[#9CA3AF] dark:text-slate-400">
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              Loading students…
            </div>
          ) : allStudents.length === 0 ? (
            <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-[#E5E7EB]" />
              <p className="text-sm font-medium text-[#374151] dark:text-slate-300">No students enrolled yet</p>
              <p className="mt-1 text-xs text-[#9CA3AF] dark:text-slate-400">Students added to the School of Disciples programme will appear here.</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-10 text-center text-sm text-[#9CA3AF] dark:text-slate-400">
              No students match your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginated.map((s) => (
                <StudentCard
                  key={s.id}
                  student={s}
                  selected={selected.has(s.id)}
                  onToggleSelect={toggleSelect}
                  onRemark={setRemarkStudent}
                  onAttendance={setAttendanceStudent}
                  onViewForm={(id) => router.push(`/trainings/sod/form?mode=view&id=${id}`)}
                  onFeesPaid={setFeesStudent}
                  onAdmissionNumber={setAdmNoStudent}
                />
              ))}
            </div>
          )}

          {/* Legend */}
          {!loading && allStudents.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#9CA3AF] dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Graduated
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" /> In training
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5" style={{ color: ACCENT }} /> Set badge
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                <BookCheck className="h-3.5 w-3.5 text-blue-500" />
                Class attended · Exam sat
              </span>
            </div>
          )}

          <div className="mt-6">
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={filtered.length}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      {/* Tab: Attendance Sheet */}
      {activeTab === "attendance" && (
        <AttendanceSheetTab setFilter={setFilter} onFlash={flash} />
      )}

      {/* Tab: Broadsheet */}
      {activeTab === "broadsheet" && (
        <BroadsheetTab setFilter={setFilter} onFlash={flash} />
      )}

      {/* Tab: Upload Scores */}
      {activeTab === "upload" && (
        <UploadScoresTab
          setFilter={setFilter}
          onFlash={flash}
          onSwitchTab={setActiveTab}
        />
      )}
    </DashboardLayout>
  );
}
