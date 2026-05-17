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
  markSodClassAttendance,
  markSodExamAttendance,
  type SchoolOfDisciplesResponse,
  type SodAttendanceRecord,
} from "@/lib/api";
import {
  BookOpen, Phone, Mail, RefreshCw, Award, Users,
  CheckCircle, Clock, Star, ChevronDown, X, MessageSquare,
  CalendarCheck, BookCheck, ClipboardList, PlusCircle, FileText, Eye,
} from "lucide-react";

const ACCENT   = "#D97706";
const ACCENT10 = "#D9770618";
const ITEMS_PER_PAGE = 12;

// Classes 1–4; Class 1 has no exam
const SOD_CLASSES = [1, 2, 3, 4] as const;
const HAS_EXAM = (classNum: number) => classNum > 1;

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
  return `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

function fullName(u: SchoolOfDisciplesResponse) {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(s?: string) {
  if (!s) return null;
  return new Date(s).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── Attendance Modal ─────────────────────────────────────────────────────────
function AttendanceModal({
  student,
  onClose,
  onSave,
}: {
  student: SchoolOfDisciplesResponse;
  onClose: () => void;
  onSave: (id: string, classNum: number, markClass: boolean, markExam: boolean) => Promise<void>;
}) {
  const [classNum, setClassNum]   = useState<number>(1);
  const [markClass, setMarkClass] = useState(true);
  const [markExam,  setMarkExam]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");

  const classAttended = useMemo(() => {
    const set = new Set<number>();
    (student.classAttendance ?? []).forEach((r: SodAttendanceRecord) => set.add(r.classNumber));
    return set;
  }, [student.classAttendance]);

  const examAttended = useMemo(() => {
    const set = new Set<number>();
    (student.examAttendance ?? []).forEach((r: SodAttendanceRecord) => set.add(r.classNumber));
    return set;
  }, [student.examAttendance]);

  // When class changes, reset exam checkbox; disable exam for class 1
  const handleClassChange = (n: number) => {
    setClassNum(n);
    setMarkExam(false);
    setError("");
  };

  const handleSave = async () => {
    if (!markClass && !markExam) {
      setError("Select at least one attendance type to mark.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(student.id, classNum, markClass, markExam);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark attendance.");
    } finally {
      setSaving(false);
    }
  };

  const alreadyClassMarked = classAttended.has(classNum);
  const alreadyExamMarked  = examAttended.has(classNum);

  // Find attendance record for selected class
  const classRecord = (student.classAttendance ?? []).find((r) => r.classNumber === classNum);
  const examRecord  = (student.examAttendance  ?? []).find((r) => r.classNumber === classNum);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" style={{ color: ACCENT }} />
            <div>
              <h2 className="text-base font-bold text-[#111827]">Mark Attendance</h2>
              <p className="text-xs text-[#6B7280]">{fullName(student)}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[#F3F4F6]">
            <X className="h-4 w-4 text-[#6B7280]" />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Attendance History Grid */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
              Attendance History
            </p>
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="py-2 pl-4 pr-2 text-left text-xs font-semibold text-[#374151]">Class</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-[#374151]">
                      <span className="flex items-center justify-center gap-1">
                        <ClipboardList className="h-3 w-3" /> Attended
                      </span>
                    </th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-[#374151]">
                      <span className="flex items-center justify-center gap-1">
                        <BookCheck className="h-3 w-3" /> Exam
                      </span>
                    </th>
                    <th className="py-2 pl-2 pr-4 text-left text-xs font-semibold text-[#374151]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {SOD_CLASSES.map((cn) => {
                    const cRec = (student.classAttendance ?? []).find((r) => r.classNumber === cn);
                    const eRec = (student.examAttendance  ?? []).find((r) => r.classNumber === cn);
                    const cDone = classAttended.has(cn);
                    const eDone = examAttended.has(cn);
                    return (
                      <tr
                        key={cn}
                        className={`border-b border-[#F3F4F6] last:border-0 ${cn === classNum ? "bg-amber-50" : ""}`}
                      >
                        <td className="py-2.5 pl-4 pr-2 text-sm font-medium text-[#111827]">
                          Class {cn}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {cDone ? (
                            <span className="inline-flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </span>
                          ) : (
                            <span className="text-[#D1D5DB] text-lg leading-none">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {!HAS_EXAM(cn) ? (
                            <span className="text-[10px] text-[#9CA3AF]">N/A</span>
                          ) : eDone ? (
                            <span className="inline-flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            </span>
                          ) : (
                            <span className="text-[#D1D5DB] text-lg leading-none">—</span>
                          )}
                        </td>
                        <td className="py-2.5 pl-2 pr-4 text-xs text-[#6B7280]">
                          {fmtDateTime(cRec?.date ?? cRec?.markedOn) ??
                           fmtDateTime(eRec?.date ?? eRec?.markedOn) ??
                           (cDone || eDone ? "—" : "")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mark New Attendance */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
              Mark Attendance
            </p>

            {/* Class selector */}
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-[#374151]">Select Class</label>
              <div className="relative">
                <select
                  value={classNum}
                  onChange={(e) => handleClassChange(Number(e.target.value))}
                  className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 pr-8 text-sm text-[#111827] outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
                >
                  {SOD_CLASSES.map((cn) => (
                    <option key={cn} value={cn}>Class {cn}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              {/* Class Attendance */}
              <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                markClass ? "border-amber-300 bg-amber-50" : "border-[#E5E7EB] hover:border-[#D97706]/40"
              }`}>
                <input
                  type="checkbox"
                  checked={markClass}
                  onChange={(e) => setMarkClass(e.target.checked)}
                  className="mt-0.5 h-4 w-4 cursor-pointer"
                  style={{ accentColor: ACCENT }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-[#D97706]" />
                    <span className="text-sm font-semibold text-[#111827]">Class Attendance</span>
                    {alreadyClassMarked && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                        Already marked
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    Student was present for Class {classNum}
                    {classRecord?.date || classRecord?.markedOn
                      ? ` · marked ${fmtDateTime(classRecord.date ?? classRecord.markedOn)}`
                      : ""}
                  </p>
                </div>
              </label>

              {/* Exam Attendance — only for classes 2+ */}
              {HAS_EXAM(classNum) ? (
                <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                  markExam ? "border-blue-300 bg-blue-50" : "border-[#E5E7EB] hover:border-blue-300/40"
                }`}>
                  <input
                    type="checkbox"
                    checked={markExam}
                    onChange={(e) => setMarkExam(e.target.checked)}
                    className="mt-0.5 h-4 w-4 cursor-pointer"
                    style={{ accentColor: "#2563EB" }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <BookCheck className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-[#111827]">Exam Attendance</span>
                      {alreadyExamMarked && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                          Already marked
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-[#6B7280]">
                      Student sat the exam for Class {classNum}
                      {examRecord?.date || examRecord?.markedOn
                        ? ` · marked ${fmtDateTime(examRecord.date ?? examRecord.markedOn)}`
                        : ""}
                    </p>
                  </div>
                </label>
              ) : (
                <div className="flex items-start gap-3 rounded-xl border border-[#F3F4F6] bg-[#F9FAFB] p-4">
                  <BookCheck className="mt-0.5 h-4 w-4 text-[#D1D5DB]" />
                  <div>
                    <span className="text-sm font-medium text-[#9CA3AF]">Exam Attendance</span>
                    <p className="mt-0.5 text-xs text-[#9CA3AF]">Class 1 has no exam</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || (!markClass && !markExam)}
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
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-[#111827]">Official Remark</h2>
            <p className="text-xs text-[#6B7280]">{fullName(student)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[#F3F4F6]">
            <X className="h-4 w-4 text-[#6B7280]" />
          </button>
        </div>
        <div className="p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Enter official remark…"
            className="w-full resize-none rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#D97706]"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
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
}: {
  student: SchoolOfDisciplesResponse;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onRemark: (s: SchoolOfDisciplesResponse) => void;
  onAttendance: (s: SchoolOfDisciplesResponse) => void;
  onViewForm: (id: string) => void;
}) {
  const bg = avatarColor(student.id);
  const phone = student.phoneNumber
    ? `+${student.countryCode ?? ""} ${student.phoneNumber}`.trim()
    : null;
  const isGraduated = !!student.graduationDate;

  return (
    <div
      className={`relative flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
        selected ? "ring-1" : "border-[#E5E7EB]"
      }`}
      style={selected ? { borderColor: ACCENT, boxShadow: `0 0 0 1px ${ACCENT}` } : {}}
    >
      {/* Select */}
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggleSelect(student.id)}
        className="absolute right-3 top-3 h-4 w-4 cursor-pointer"
        style={{ accentColor: ACCENT }}
      />

      {/* Graduation badge */}
      {isGraduated && (
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
          <CheckCircle className="h-3 w-3" />
          Graduated
        </span>
      )}

      {/* Avatar */}
      <div className={`mb-3 ${isGraduated ? "mt-6" : "mt-4"}`}>
        {student.profilePictureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={student.profilePictureUrl}
            alt={fullName(student)}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${bg} text-lg font-bold text-[#000080]`}>
            {initials(student)}
          </div>
        )}
      </div>

      {/* Name + set */}
      <h3 className="text-sm font-bold text-[#111827]">{fullName(student)}</h3>
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
        <p className="mt-1 text-xs text-[#6B7280]">{student.occupation}</p>
      )}

      {/* Ministry / Gifts */}
      {(student.yourMinistry || (student.giftsManifesting?.length ?? 0) > 0) && (
        <div className="mt-2 space-y-0.5">
          {student.yourMinistry && (
            <p className="text-[10px] text-[#6B7280]">
              <span className="font-medium text-[#374151]">Ministry:</span>{" "}
              {student.yourMinistry}
            </p>
          )}
          {(student.giftsManifesting?.length ?? 0) > 0 && (
            <p className="text-[10px] text-[#6B7280]">
              <span className="font-medium text-[#374151]">Gifts:</span>{" "}
              {student.giftsManifesting!.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Attendance summary */}
      <AttendanceSummaryBar student={student} />

      {/* Official remark badge */}
      {student.officialRemarks && (
        <div className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] text-amber-700">
          <span className="font-semibold">Remark:</span> {student.officialRemarks}
        </div>
      )}

      {/* Contact */}
      <div className="mt-3 space-y-1">
        {phone && (
          <div className="flex items-center gap-1.5 text-xs text-[#374151]">
            <Phone className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
            <span>{phone}</span>
          </div>
        )}
        {student.email && (
          <div className="flex items-center gap-1.5 text-xs text-[#374151]">
            <Mail className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
            <span className="truncate">{student.email}</span>
          </div>
        )}
      </div>

      {/* Dates */}
      {student.createdOn && (
        <p className="mt-2 text-[10px] text-[#9CA3AF]">Enrolled {fmtDate(student.createdOn)}</p>
      )}
      {student.graduationDate && (
        <p className="mt-0.5 text-[10px] font-medium text-green-600">Graduated {fmtDate(student.graduationDate)}</p>
      )}

      {/* Action buttons */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onAttendance(student)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:border-[#D97706] hover:text-[#D97706]"
        >
          <CalendarCheck className="h-3 w-3" />
          Attendance
        </button>
        <button
          onClick={() => onRemark(student)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:border-[#D97706] hover:text-[#D97706]"
        >
          <MessageSquare className="h-3 w-3" />
          {student.officialRemarks ? "Edit Remark" : "Remark"}
        </button>
      </div>
      <button
        onClick={() => onViewForm(student.id)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:border-[#000080] hover:text-[#000080]"
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
  const [allStudents,       setAllStudents]       = useState<SchoolOfDisciplesResponse[]>([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState("");
  const [search,            setSearch]            = useState("");
  const [setFilter,         setSetFilter]         = useState("");
  const [page,              setPage]              = useState(1);
  const [selected,          setSelected]          = useState<Set<string>>(new Set());
  const [graduating,        setGraduating]        = useState(false);
  const [remarkStudent,     setRemarkStudent]     = useState<SchoolOfDisciplesResponse | null>(null);
  const [attendanceStudent, setAttendanceStudent] = useState<SchoolOfDisciplesResponse | null>(null);
  const [successMsg,        setSuccessMsg]        = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const first = await getSchoolOfDisciples(0, 200);
      const rows = [...(first.content ?? [])];
      const totalPages = Math.min(first.totalPages ?? 1, 10);
      if (totalPages > 1) {
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) => getSchoolOfDisciples(i + 1, 200))
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

  useEffect(() => { load(); }, [load]);

  const availableSets = useMemo(() => {
    const sets = new Set<string>();
    allStudents.forEach((s) => { if (s.set) sets.add(s.set); });
    return [...sets].sort();
  }, [allStudents]);

  const filtered = useMemo(() => {
    let list = allStudents;
    if (setFilter) list = list.filter((s) => s.set === setFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          fullName(s).toLowerCase().includes(q) ||
          (s.email ?? "").toLowerCase().includes(q) ||
          (s.phoneNumber ?? "").toLowerCase().includes(q) ||
          (s.yourMinistry ?? "").toLowerCase().includes(q) ||
          (s.set ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [allStudents, search, setFilter]);

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
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark as graduated.");
    } finally {
      setGraduating(false);
    }
  };

  const handleSaveRemark = async (id: string, text: string) => {
    await giveSodOfficialRemark(id, text);
    flash("Official remark saved.");
    await load();
  };

  const handleSaveAttendance = async (
    id: string,
    classNum: number,
    markClass: boolean,
    markExam: boolean
  ) => {
    const calls: Promise<unknown>[] = [];
    if (markClass) calls.push(markSodClassAttendance(id, classNum));
    if (markExam)  calls.push(markSodExamAttendance(id, classNum));
    await Promise.all(calls);
    const parts: string[] = [];
    if (markClass) parts.push("class");
    if (markExam)  parts.push("exam");
    flash(`Attendance marked — ${parts.join(" & ")} for Class ${classNum}.`);
    await load();
  };

  const handleSearch = async () => {
    if (!search.trim()) { await load(); return; }
    setLoading(true);
    setError("");
    try {
      const res = await searchSchoolOfDisciples(search.trim(), 0, 200);
      setAllStudents(res.content ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  };

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

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: ACCENT10 }}>
          <BookOpen className="h-6 w-6" style={{ color: ACCENT }} />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000]">School of Disciples</h1>
          <p className="text-sm text-[#6B7280]">Members enrolled in the SOD programme</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => router.push("/trainings/sod/form")}
            className="flex items-center gap-2 rounded-lg bg-[#000080] px-4 py-2 text-xs font-semibold text-white hover:bg-[#000066]"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Application
          </button>
          <button
            onClick={() => router.push("/trainings/sod/form?mode=blank")}
            className="flex items-center gap-2 rounded-lg border border-[#000080] bg-white px-4 py-2 text-xs font-semibold text-[#000080] hover:bg-[#000080] hover:text-white transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            Download Blank Form
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#374151] hover:text-[#D97706] hover:border-[#D97706] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: ACCENT }}>{allStudents.length}</p>
            <p className="mt-1 text-xs text-[#6B7280]">Total enrolled</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center">
            <p className="text-2xl font-bold text-[#16A34A]">{graduated.length}</p>
            <p className="mt-1 text-xs text-[#6B7280]">Graduated</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center">
            <p className="text-2xl font-bold text-[#000080]">{inTraining.length}</p>
            <p className="mt-1 text-xs text-[#6B7280]">In training</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center">
            <p className="text-2xl font-bold text-[#374151]">{availableSets.length}</p>
            <p className="mt-1 text-xs text-[#6B7280]">Set{availableSets.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      )}

      {/* Banners */}
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button onClick={load} className="font-medium underline">Retry</button>
        </div>
      )}

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

        {availableSets.length > 0 && (
          <div className="relative">
            <select
              value={setFilter}
              onChange={(e) => { setSetFilter(e.target.value); setPage(1); }}
              className="appearance-none rounded-lg border border-[#E5E7EB] bg-white pl-3 pr-8 py-2.5 text-sm text-[#374151] outline-none focus:border-[#D97706]"
            >
              <option value="">All sets</option>
              {availableSets.map((s) => (
                <option key={s} value={s}>Set {s}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
        )}

        {selected.size > 0 && (
          <button
            onClick={handleGraduate}
            disabled={graduating}
            className="flex items-center gap-2 rounded-lg bg-[#16A34A] px-3 py-2 text-xs font-semibold text-white hover:bg-[#15803D] disabled:opacity-50"
          >
            <Award className="h-3.5 w-3.5" />
            {graduating ? "Graduating…" : `Graduate ${selected.size} selected`}
          </button>
        )}

        <span className="ml-auto text-sm text-[#6B7280]">
          {filtered.length} {filtered.length === 1 ? "student" : "students"}
        </span>
      </div>

      {/* Select-all row */}
      {!loading && paginated.length > 0 && (
        <div className="mb-3 flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-[#6B7280]">
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
            <button onClick={() => setSelected(new Set())} className="text-xs text-[#6B7280] underline hover:text-[#374151]">
              Clear selection
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center text-sm text-[#9CA3AF]">
          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
          Loading students…
        </div>
      ) : allStudents.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-[#E5E7EB]" />
          <p className="text-sm font-medium text-[#374151]">No students enrolled yet</p>
          <p className="mt-1 text-xs text-[#9CA3AF]">Students added to the School of Disciples programme will appear here.</p>
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-10 text-center text-sm text-[#9CA3AF]">
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
              onViewForm={(id) => router.push(`/trainings/sod/form/${id}`)}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      {!loading && allStudents.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#9CA3AF]">
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
    </DashboardLayout>
  );
}
