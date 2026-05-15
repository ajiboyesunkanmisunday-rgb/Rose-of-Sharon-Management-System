"use client";

/**
 * /trainings/sod/test
 *
 * Temporary local-only test page for the School of Disciples feature.
 * All data lives in localStorage — no real API calls are made.
 * Use this page to verify every feature works correctly before testing
 * against the live backend.
 *
 * Features:
 *  - Add / delete students via a form modal
 *  - Mark class attendance (Classes 1–4)
 *  - Mark exam attendance (Classes 2–4 only)
 *  - Give official remarks
 *  - Bulk graduate selected students
 *  - Search, set filter, pagination
 *  - Reset to pre-seeded demo data at any time
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import {
  BookOpen, Phone, Mail, RefreshCw, Award, Users, CheckCircle,
  Clock, Star, ChevronDown, X, MessageSquare, CalendarCheck,
  BookCheck, ClipboardList, AlertTriangle, Plus, Trash2,
  RotateCcw, ArrowLeft,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCENT        = "#D97706";
const ACCENT10      = "#D9770618";
const STORAGE_KEY   = "sod-test-students";
const ITEMS_PER_PAGE = 12;
const SOD_CLASSES   = [1, 2, 3, 4] as const;
const hasExam       = (n: number) => n > 1;

// ─── Local data types ─────────────────────────────────────────────────────────
interface AttendanceRecord {
  classNumber: number;
  markedOn: string;
}

interface TestStudent {
  id: string;
  set?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  countryCode?: string;
  phoneNumber?: string;
  occupation?: string;
  yourMinistry?: string;
  giftsManifesting?: string[];
  salvationDate?: string;
  maritalStatus?: string;
  officialRemarks?: string;
  graduationDate?: string;
  classAttendance: AttendanceRecord[];
  examAttendance: AttendanceRecord[];
  createdOn: string;
}

// ─── Pre-seeded demo students ─────────────────────────────────────────────────
const DEMO_STUDENTS: TestStudent[] = [
  {
    id: "demo-001",
    set: "1",
    firstName: "John",
    middleName: "Emeka",
    lastName: "Adeyemi",
    email: "john.adeyemi@example.com",
    countryCode: "234",
    phoneNumber: "8012345678",
    occupation: "Software Engineer",
    yourMinistry: "Youth Ministry",
    giftsManifesting: ["Teaching", "Prophecy"],
    salvationDate: "2020-03-15",
    maritalStatus: "Married",
    officialRemarks: "Very dedicated student, excellent participation.",
    graduationDate: undefined,
    classAttendance: [
      { classNumber: 1, markedOn: "2024-01-08" },
      { classNumber: 2, markedOn: "2024-01-15" },
      { classNumber: 3, markedOn: "2024-01-22" },
    ],
    examAttendance: [
      { classNumber: 2, markedOn: "2024-01-15" },
      { classNumber: 3, markedOn: "2024-01-22" },
    ],
    createdOn: "2024-01-01",
  },
  {
    id: "demo-002",
    set: "1",
    firstName: "Grace",
    middleName: "",
    lastName: "Okonkwo",
    email: "grace.okonkwo@example.com",
    countryCode: "234",
    phoneNumber: "9087654321",
    occupation: "Nurse",
    yourMinistry: "Women Fellowship",
    giftsManifesting: ["Mercy", "Helps"],
    salvationDate: "2018-06-20",
    maritalStatus: "Single",
    officialRemarks: undefined,
    graduationDate: "2024-02-12",
    classAttendance: [
      { classNumber: 1, markedOn: "2024-01-08" },
      { classNumber: 2, markedOn: "2024-01-15" },
      { classNumber: 3, markedOn: "2024-01-22" },
      { classNumber: 4, markedOn: "2024-01-29" },
    ],
    examAttendance: [
      { classNumber: 2, markedOn: "2024-01-15" },
      { classNumber: 3, markedOn: "2024-01-22" },
      { classNumber: 4, markedOn: "2024-01-29" },
    ],
    createdOn: "2024-01-01",
  },
  {
    id: "demo-003",
    set: "2",
    firstName: "Samuel",
    middleName: "Ola",
    lastName: "Bello",
    email: "samuel.bello@example.com",
    countryCode: "234",
    phoneNumber: "7056789012",
    occupation: "Teacher",
    yourMinistry: "Choir",
    giftsManifesting: ["Music", "Evangelism"],
    salvationDate: "2022-11-01",
    maritalStatus: "Single",
    officialRemarks: undefined,
    graduationDate: undefined,
    classAttendance: [
      { classNumber: 1, markedOn: "2024-03-04" },
    ],
    examAttendance: [],
    createdOn: "2024-02-26",
  },
  {
    id: "demo-004",
    set: "2",
    firstName: "Mary",
    middleName: "Chisom",
    lastName: "Osei",
    email: "mary.osei@example.com",
    countryCode: "234",
    phoneNumber: "8134567890",
    occupation: "Accountant",
    yourMinistry: "Ushering",
    giftsManifesting: ["Administration"],
    salvationDate: "2019-04-10",
    maritalStatus: "Married",
    officialRemarks: undefined,
    graduationDate: undefined,
    classAttendance: [
      { classNumber: 1, markedOn: "2024-03-04" },
      { classNumber: 2, markedOn: "2024-03-11" },
    ],
    examAttendance: [],
    createdOn: "2024-02-26",
  },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────
function loadStudents(): TestStudent[] {
  if (typeof window === "undefined") return DEMO_STUDENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEMO_STUDENTS;
    return JSON.parse(raw) as TestStudent[];
  } catch {
    return DEMO_STUDENTS;
  }
}

function saveStudents(students: TestStudent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch { /* quota exceeded — ignore */ }
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
const avatarBgColors = [
  "bg-[#B5B5F3]", "bg-[#BFDBFE]", "bg-[#BBF7D0]",
  "bg-[#FDE68A]", "bg-[#FECACA]", "bg-[#DDD6FE]",
];

function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return avatarBgColors[Math.abs(h) % avatarBgColors.length];
}

function initials(s: TestStudent) {
  return `${s.firstName?.[0] ?? ""}${s.lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

function fullName(s: TestStudent) {
  return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ") || "—";
}

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Add Student Form Modal ───────────────────────────────────────────────────
interface AddStudentForm {
  firstName: string; middleName: string; lastName: string;
  email: string; countryCode: string; phoneNumber: string;
  set: string; occupation: string; yourMinistry: string;
  giftsManifesting: string; salvationDate: string; maritalStatus: string;
}

const BLANK_FORM: AddStudentForm = {
  firstName: "", middleName: "", lastName: "",
  email: "", countryCode: "234", phoneNumber: "",
  set: "", occupation: "", yourMinistry: "",
  giftsManifesting: "", salvationDate: "", maritalStatus: "",
};

function AddStudentModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (s: TestStudent) => void;
}) {
  const [form, setForm] = useState<AddStudentForm>(BLANK_FORM);
  const [err, setErr]   = useState("");

  const set = (k: keyof AddStudentForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleAdd = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setErr("First name and last name are required.");
      return;
    }
    const student: TestStudent = {
      id: genId(),
      set: form.set.trim() || undefined,
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim() || undefined,
      lastName: form.lastName.trim(),
      email: form.email.trim() || undefined,
      countryCode: form.countryCode.trim() || undefined,
      phoneNumber: form.phoneNumber.trim() || undefined,
      occupation: form.occupation.trim() || undefined,
      yourMinistry: form.yourMinistry.trim() || undefined,
      giftsManifesting: form.giftsManifesting
        ? form.giftsManifesting.split(",").map((g) => g.trim()).filter(Boolean)
        : undefined,
      salvationDate: form.salvationDate || undefined,
      maritalStatus: form.maritalStatus || undefined,
      officialRemarks: undefined,
      graduationDate: undefined,
      classAttendance: [],
      examAttendance: [],
      createdOn: new Date().toISOString().slice(0, 10),
    };
    onAdd(student);
    onClose();
  };

  const Field = ({
    label, k, type = "text", placeholder = "",
  }: {
    label: string; k: keyof AddStudentForm; type?: string; placeholder?: string;
  }) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-[#374151]">{label}</label>
      <input
        type={type}
        value={form[k]}
        onChange={set(k)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5" style={{ color: ACCENT }} />
            <h2 className="text-base font-bold text-[#111827]">Add Test Student</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[#F3F4F6]">
            <X className="h-4 w-4 text-[#6B7280]" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First Name *" k="firstName" placeholder="e.g. John" />
            <Field label="Middle Name" k="middleName" placeholder="e.g. Emeka" />
            <Field label="Last Name *" k="lastName" placeholder="e.g. Adeyemi" />
            <Field label="Email" k="email" type="email" placeholder="email@example.com" />

            <div>
              <label className="mb-1 block text-xs font-medium text-[#374151]">Country Code</label>
              <input
                type="text"
                value={form.countryCode}
                onChange={set("countryCode")}
                placeholder="234"
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#D97706]"
              />
            </div>
            <Field label="Phone Number" k="phoneNumber" placeholder="08012345678" />

            <div>
              <label className="mb-1 block text-xs font-medium text-[#374151]">Set</label>
              <select
                value={form.set}
                onChange={set("set")}
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#D97706]"
              >
                <option value="">No set</option>
                {["1","2","3","4","5"].map((n) => (
                  <option key={n} value={n}>Set {n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#374151]">Marital Status</label>
              <select
                value={form.maritalStatus}
                onChange={set("maritalStatus")}
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#D97706]"
              >
                <option value="">Select</option>
                <option>Single</option>
                <option>Married</option>
                <option>Divorced</option>
                <option>Widowed</option>
              </select>
            </div>

            <Field label="Occupation" k="occupation" placeholder="e.g. Teacher" />
            <Field label="Ministry" k="yourMinistry" placeholder="e.g. Youth Ministry" />

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-[#374151]">
                Gifts Manifesting <span className="font-normal text-[#9CA3AF]">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={form.giftsManifesting}
                onChange={set("giftsManifesting")}
                placeholder="e.g. Teaching, Prophecy, Mercy"
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#D97706]"
              />
            </div>

            <Field label="Salvation Date" k="salvationDate" type="date" />
          </div>

          {err && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {err}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: ACCENT }}
          >
            Add Student
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
  student: TestStudent;
  onClose: () => void;
  onSave: (id: string, classNum: number, markClass: boolean, markExam: boolean) => void;
}) {
  const [classNum,  setClassNum]  = useState(1);
  const [markClass, setMarkClass] = useState(true);
  const [markExam,  setMarkExam]  = useState(false);
  const [err,       setErr]       = useState("");

  const classSet = useMemo(() => new Set(student.classAttendance.map((r) => r.classNumber)), [student]);
  const examSet  = useMemo(() => new Set(student.examAttendance.map((r) => r.classNumber)),  [student]);

  const handleClassChange = (n: number) => { setClassNum(n); setMarkExam(false); setErr(""); };

  const handleSave = () => {
    if (!markClass && !markExam) { setErr("Select at least one attendance type."); return; }
    onSave(student.id, classNum, markClass, markExam);
    onClose();
  };

  const classRecord = student.classAttendance.find((r) => r.classNumber === classNum);
  const examRecord  = student.examAttendance.find((r)  => r.classNumber === classNum);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

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

        <div className="space-y-5 p-5">

          {/* History grid */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">Attendance History</p>
            <div className="overflow-hidden rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="py-2 pl-4 pr-2 text-left text-xs font-semibold text-[#374151]">Class</th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-[#374151]">
                      <span className="flex items-center justify-center gap-1"><ClipboardList className="h-3 w-3" />Attended</span>
                    </th>
                    <th className="py-2 px-2 text-center text-xs font-semibold text-[#374151]">
                      <span className="flex items-center justify-center gap-1"><BookCheck className="h-3 w-3" />Exam</span>
                    </th>
                    <th className="py-2 pl-2 pr-4 text-left text-xs font-semibold text-[#374151]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {SOD_CLASSES.map((cn) => {
                    const cRec = student.classAttendance.find((r) => r.classNumber === cn);
                    const eRec = student.examAttendance.find((r)  => r.classNumber === cn);
                    return (
                      <tr key={cn} className={`border-b border-[#F3F4F6] last:border-0 ${cn === classNum ? "bg-amber-50" : ""}`}>
                        <td className="py-2.5 pl-4 pr-2 text-sm font-medium text-[#111827]">Class {cn}</td>
                        <td className="py-2.5 px-2 text-center">
                          {classSet.has(cn)
                            ? <CheckCircle className="mx-auto h-4 w-4 text-green-500" />
                            : <span className="text-[#D1D5DB]">—</span>}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {!hasExam(cn)
                            ? <span className="text-[10px] text-[#9CA3AF]">N/A</span>
                            : examSet.has(cn)
                              ? <CheckCircle className="mx-auto h-4 w-4 text-blue-500" />
                              : <span className="text-[#D1D5DB]">—</span>}
                        </td>
                        <td className="py-2.5 pl-2 pr-4 text-xs text-[#6B7280]">
                          {cRec?.markedOn ? fmtDate(cRec.markedOn) : eRec?.markedOn ? fmtDate(eRec.markedOn) : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mark form */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">Mark Attendance</p>

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-[#374151]">Select Class</label>
              <div className="relative">
                <select
                  value={classNum}
                  onChange={(e) => handleClassChange(Number(e.target.value))}
                  className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 pr-8 text-sm text-[#111827] outline-none focus:border-[#D97706]"
                >
                  {SOD_CLASSES.map((cn) => <option key={cn} value={cn}>Class {cn}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </div>

            <div className="space-y-3">
              {/* Class attendance */}
              <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                markClass ? "border-amber-300 bg-amber-50" : "border-[#E5E7EB] hover:border-[#D97706]/40"
              }`}>
                <input type="checkbox" checked={markClass} onChange={(e) => setMarkClass(e.target.checked)}
                  className="mt-0.5 h-4 w-4 cursor-pointer" style={{ accentColor: ACCENT }} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-[#D97706]" />
                    <span className="text-sm font-semibold text-[#111827]">Class Attendance</span>
                    {classSet.has(classNum) && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">Already marked</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    Student was present for Class {classNum}
                    {classRecord?.markedOn ? ` · marked ${fmtDate(classRecord.markedOn)}` : ""}
                  </p>
                </div>
              </label>

              {/* Exam attendance */}
              {hasExam(classNum) ? (
                <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                  markExam ? "border-blue-300 bg-blue-50" : "border-[#E5E7EB] hover:border-blue-300/40"
                }`}>
                  <input type="checkbox" checked={markExam} onChange={(e) => setMarkExam(e.target.checked)}
                    className="mt-0.5 h-4 w-4 cursor-pointer" style={{ accentColor: "#2563EB" }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <BookCheck className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-[#111827]">Exam Attendance</span>
                      {examSet.has(classNum) && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">Already marked</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-[#6B7280]">
                      Student sat the exam for Class {classNum}
                      {examRecord?.markedOn ? ` · marked ${fmtDate(examRecord.markedOn)}` : ""}
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

            {err && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{err}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-4">
          <button onClick={onClose}
            className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!markClass && !markExam}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}>
            Mark Attendance
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Remark Modal ─────────────────────────────────────────────────────────────
function RemarkModal({
  student, onClose, onSave,
}: {
  student: TestStudent; onClose: () => void;
  onSave: (id: string, text: string) => void;
}) {
  const [text, setText] = useState(student.officialRemarks ?? "");

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
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4}
            placeholder="Enter official remark…"
            className="w-full resize-none rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#D97706]" />
        </div>
        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-4">
          <button onClick={onClose}
            className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]">
            Cancel
          </button>
          <button onClick={() => { onSave(student.id, text.trim()); onClose(); }}
            disabled={!text.trim()}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}>
            Save Remark
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Attendance Summary Bar (on card) ─────────────────────────────────────────
function AttendanceSummaryBar({ student }: { student: TestStudent }) {
  const cSet = new Set(student.classAttendance.map((r) => r.classNumber));
  const eSet = new Set(student.examAttendance.map((r)  => r.classNumber));
  const any  = cSet.size > 0 || eSet.size > 0;
  if (!any) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {SOD_CLASSES.map((cn) => {
        const c = cSet.has(cn), e = eSet.has(cn);
        if (!c && !e) return null;
        return (
          <span key={cn}
            title={`Class ${cn}${c ? " ✓ Attended" : ""}${e ? " · Exam ✓" : ""}`}
            className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
            style={{ backgroundColor: ACCENT10, color: ACCENT }}>
            C{cn}
            {c && <CheckCircle className="h-2.5 w-2.5 text-green-600" />}
            {e && <BookCheck className="h-2.5 w-2.5 text-blue-600" />}
          </span>
        );
      })}
    </div>
  );
}

// ─── Student Card ─────────────────────────────────────────────────────────────
function StudentCard({
  student, selected, onToggleSelect, onRemark, onAttendance, onDelete,
}: {
  student: TestStudent; selected: boolean;
  onToggleSelect: (id: string) => void;
  onRemark: (s: TestStudent) => void;
  onAttendance: (s: TestStudent) => void;
  onDelete: (id: string) => void;
}) {
  const bg         = avatarColor(student.id);
  const phone      = student.phoneNumber ? `+${student.countryCode ?? ""} ${student.phoneNumber}`.trim() : null;
  const isGraduated = !!student.graduationDate;

  return (
    <div className={`relative flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
      selected ? "ring-1" : "border-[#E5E7EB]"
    }`} style={selected ? { borderColor: ACCENT, boxShadow: `0 0 0 1px ${ACCENT}` } : {}}>

      {/* Controls */}
      <input type="checkbox" checked={selected} onChange={() => onToggleSelect(student.id)}
        className="absolute right-8 top-3 h-4 w-4 cursor-pointer" style={{ accentColor: ACCENT }} />
      <button onClick={() => onDelete(student.id)}
        className="absolute right-3 top-3 rounded p-0.5 text-[#D1D5DB] hover:text-red-400">
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      {/* Graduation badge */}
      {isGraduated && (
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
          <CheckCircle className="h-3 w-3" /> Graduated
        </span>
      )}

      {/* Avatar */}
      <div className={`mb-3 ${isGraduated ? "mt-6" : "mt-4"}`}>
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${bg} text-lg font-bold text-[#000080]`}>
          {initials(student)}
        </div>
      </div>

      {/* Name + set */}
      <h3 className="text-sm font-bold text-[#111827]">{fullName(student)}</h3>
      {student.set && (
        <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white"
          style={{ backgroundColor: ACCENT }}>
          <Star className="h-2.5 w-2.5" /> Set {student.set}
        </span>
      )}
      {student.occupation && <p className="mt-1 text-xs text-[#6B7280]">{student.occupation}</p>}

      {/* Ministry / gifts */}
      {(student.yourMinistry || (student.giftsManifesting?.length ?? 0) > 0) && (
        <div className="mt-2 space-y-0.5">
          {student.yourMinistry && (
            <p className="text-[10px] text-[#6B7280]">
              <span className="font-medium text-[#374151]">Ministry:</span> {student.yourMinistry}
            </p>
          )}
          {(student.giftsManifesting?.length ?? 0) > 0 && (
            <p className="text-[10px] text-[#6B7280]">
              <span className="font-medium text-[#374151]">Gifts:</span> {student.giftsManifesting!.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Attendance summary */}
      <AttendanceSummaryBar student={student} />

      {/* Official remark */}
      {student.officialRemarks && (
        <div className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] text-amber-700">
          <span className="font-semibold">Remark:</span> {student.officialRemarks}
        </div>
      )}

      {/* Contact */}
      <div className="mt-3 space-y-1">
        {phone && (
          <div className="flex items-center gap-1.5 text-xs text-[#374151]">
            <Phone className="h-3 w-3 shrink-0 text-[#9CA3AF]" /> <span>{phone}</span>
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
        <button onClick={() => onAttendance(student)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:border-[#D97706] hover:text-[#D97706]">
          <CalendarCheck className="h-3 w-3" /> Attendance
        </button>
        <button onClick={() => onRemark(student)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:border-[#D97706] hover:text-[#D97706]">
          <MessageSquare className="h-3 w-3" />
          {student.officialRemarks ? "Edit Remark" : "Remark"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Test Page ───────────────────────────────────────────────────────────
export default function SodTestPage() {
  const router = useRouter();

  const [students,  setStudents]  = useState<TestStudent[]>([]);
  const [search,    setSearch]    = useState("");
  const [setFilter, setSetFilter] = useState("");
  const [page,      setPage]      = useState(1);
  const [selected,  setSelected]  = useState<Set<string>>(new Set());
  const [flash,     setFlash]     = useState("");

  const [showAdd,        setShowAdd]        = useState(false);
  const [remarkStudent,  setRemarkStudent]  = useState<TestStudent | null>(null);
  const [attendStudent,  setAttendStudent]  = useState<TestStudent | null>(null);

  // Load from localStorage on mount
  useEffect(() => { setStudents(loadStudents()); }, []);

  // Persist on every change
  useEffect(() => { if (students.length > 0 || localStorage.getItem(STORAGE_KEY)) saveStudents(students); }, [students]);

  const update = useCallback((fn: (prev: TestStudent[]) => TestStudent[]) => {
    setStudents((prev) => {
      const next = fn(prev);
      saveStudents(next);
      return next;
    });
  }, []);

  const showFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(""), 4000); };

  const handleReset = () => {
    if (!confirm("Reset all test data back to the 4 demo students?")) return;
    saveStudents(DEMO_STUDENTS);
    setStudents(DEMO_STUDENTS);
    setSelected(new Set());
    showFlash("Reset to demo data.");
  };

  const handleAddStudent = (s: TestStudent) => {
    update((prev) => [s, ...prev]);
    showFlash(`${fullName(s)} added.`);
  };

  const handleDeleteStudent = (id: string) => {
    update((prev) => prev.filter((s) => s.id !== id));
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    showFlash("Student removed.");
  };

  const handleGraduate = () => {
    if (selected.size === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    update((prev) => prev.map((s) => selected.has(s.id) ? { ...s, graduationDate: today } : s));
    showFlash(`${selected.size} student${selected.size > 1 ? "s" : ""} marked as graduated.`);
    setSelected(new Set());
  };

  const handleSaveRemark = (id: string, text: string) => {
    update((prev) => prev.map((s) => s.id === id ? { ...s, officialRemarks: text || undefined } : s));
    showFlash("Official remark saved.");
  };

  const handleSaveAttendance = (id: string, classNum: number, markClass: boolean, markExam: boolean) => {
    const today = new Date().toISOString().slice(0, 10);
    update((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      let ca = [...s.classAttendance];
      let ea = [...s.examAttendance];
      if (markClass && !ca.some((r) => r.classNumber === classNum)) {
        ca = [...ca, { classNumber: classNum, markedOn: today }];
      }
      if (markExam && !ea.some((r) => r.classNumber === classNum)) {
        ea = [...ea, { classNumber: classNum, markedOn: today }];
      }
      return { ...s, classAttendance: ca, examAttendance: ea };
    }));
    const parts = [markClass && "class", markExam && "exam"].filter(Boolean).join(" & ");
    showFlash(`Attendance marked — ${parts} for Class ${classNum}.`);
  };

  const availableSets = useMemo(() => {
    const sets = new Set<string>();
    students.forEach((s) => { if (s.set) sets.add(s.set); });
    return [...sets].sort();
  }, [students]);

  const filtered = useMemo(() => {
    let list = students;
    if (setFilter) list = list.filter((s) => s.set === setFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) =>
        fullName(s).toLowerCase().includes(q) ||
        (s.email ?? "").toLowerCase().includes(q) ||
        (s.phoneNumber ?? "").toLowerCase().includes(q) ||
        (s.yourMinistry ?? "").toLowerCase().includes(q) ||
        (s.set ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [students, search, setFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const graduated  = students.filter((s) => !!s.graduationDate);
  const inTraining = students.filter((s) => !s.graduationDate);

  const toggleSelect = (id: string) =>
    setSelected((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () =>
    setSelected((p) => p.size === paginated.length ? new Set() : new Set(paginated.map((s) => s.id)));

  return (
    <DashboardLayout>
      {/* Modals */}
      {showAdd        && <AddStudentModal onClose={() => setShowAdd(false)} onAdd={handleAddStudent} />}
      {remarkStudent  && <RemarkModal student={remarkStudent} onClose={() => setRemarkStudent(null)} onSave={handleSaveRemark} />}
      {attendStudent  && <AttendanceModal student={attendStudent} onClose={() => setAttendStudent(null)} onSave={handleSaveAttendance} />}

      {/* TEST MODE banner */}
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-800">Test Mode — Local Data Only</p>
          <p className="text-xs text-amber-700">
            All data is stored in your browser (localStorage). No real API calls are made.
            Use this page to test every feature, then go to{" "}
            <button onClick={() => router.push("/trainings/sod")}
              className="font-semibold underline hover:text-amber-900">/trainings/sod</button>{" "}
            for the live page.
          </p>
        </div>
        <button onClick={handleReset}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100">
          <RotateCcw className="h-3 w-3" /> Reset demo data
        </button>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/trainings/sod")}
          className="flex items-center gap-1 text-[#000080] hover:text-[#000066]">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: ACCENT10 }}>
          <BookOpen className="h-6 w-6" style={{ color: ACCENT }} />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000]">School of Disciples <span className="text-base font-semibold text-amber-600">[TEST]</span></h1>
          <p className="text-sm text-[#6B7280]">Testing environment — data lives only in this browser</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm"
            style={{ backgroundColor: ACCENT }}>
            <Plus className="h-4 w-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: ACCENT }}>{students.length}</p>
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
          <p className="mt-1 text-xs text-[#6B7280]">Sets</p>
        </div>
      </div>

      {/* Flash banner */}
      {flash && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" /> {flash}
        </div>
      )}

      {/* Checklist panel */}
      <div className="mb-5 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#374151]">What to test on this page</p>
        <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 text-xs text-[#6B7280]">
          {[
            "Student cards display correctly (name, set badge, ministry, gifts)",
            "Phone and email appear on cards",
            "Graduation badge shows on graduated students",
            "Attendance mini-bar (C1 ✓, C2 ✓📖) shows on cards",
            "Click Attendance → history grid shows correct ticks",
            "Mark class attendance for Class 1 (no exam option)",
            "Mark class + exam attendance for Classes 2, 3, 4 on same day",
            "'Already marked' badge shows when re-opening attendance modal",
            "Give / edit official remark — amber badge appears on card",
            "Select multiple students → Graduate selected → green badge",
            "Search by name, email, phone, ministry",
            "Filter by set — only that set's students show",
            "Add a new student with the form — appears in grid",
            "Delete a student (trash icon on card)",
            "Pagination works with more than 12 students",
            "Reset demo data restores original 4 students",
          ].map((item) => (
            <li key={item} className="flex items-start gap-1.5">
              <span className="mt-0.5 shrink-0 text-[#D1D5DB]">☐</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Controls */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            onSearch={() => {}}
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
              {availableSets.map((s) => <option key={s} value={s}>Set {s}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
        )}

        {selected.size > 0 && (
          <button onClick={handleGraduate}
            className="flex items-center gap-2 rounded-lg bg-[#16A34A] px-3 py-2 text-xs font-semibold text-white hover:bg-[#15803D]">
            <Award className="h-3.5 w-3.5" />
            Graduate {selected.size} selected
          </button>
        )}

        <span className="ml-auto text-sm text-[#6B7280]">
          {filtered.length} {filtered.length === 1 ? "student" : "students"}
        </span>
      </div>

      {/* Select-all */}
      {paginated.length > 0 && (
        <div className="mb-3 flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-[#6B7280]">
            <input type="checkbox"
              checked={selected.size === paginated.length && paginated.length > 0}
              onChange={toggleAll}
              className="h-3.5 w-3.5" style={{ accentColor: ACCENT }} />
            Select all on this page
          </label>
          {selected.size > 0 && (
            <button onClick={() => setSelected(new Set())}
              className="text-xs text-[#6B7280] underline hover:text-[#374151]">
              Clear selection
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {students.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-[#E5E7EB]" />
          <p className="text-sm font-medium text-[#374151]">No test students yet</p>
          <button onClick={() => setShowAdd(true)}
            className="mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: ACCENT }}>
            Add your first student
          </button>
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-10 text-center text-sm text-[#9CA3AF]">
          No students match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginated.map((s) => (
            <StudentCard
              key={s.id} student={s} selected={selected.has(s.id)}
              onToggleSelect={toggleSelect}
              onRemark={setRemarkStudent}
              onAttendance={setAttendStudent}
              onDelete={handleDeleteStudent}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      {students.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#9CA3AF]">
          <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> Graduated</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-amber-500" /> In training</span>
          <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5" style={{ color: ACCENT }} /> Set badge</span>
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

      {/* Bottom tip */}
      <div className="mt-8 rounded-xl border border-dashed border-[#E5E7EB] p-4 text-center text-xs text-[#9CA3AF]">
        <RefreshCw className="mx-auto mb-1 h-4 w-4" />
        Data persists across page refreshes via localStorage.
        Use &ldquo;Reset demo data&rdquo; in the banner above to start fresh.
      </div>
    </DashboardLayout>
  );
}
