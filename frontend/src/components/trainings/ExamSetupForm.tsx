"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createExamSetup, searchAllUsers, type ExamSetupResponse, type UserResponse } from "@/lib/api";

const inputCls =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400";

const fullName = (u: Pick<UserResponse, "firstName" | "middleName" | "lastName">) =>
  [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ");

interface Props {
  trainingEventId: string;
  trainingCategory: string;
  defaultTitle: string;
  onCreated: (setup: ExamSetupResponse) => void;
  onSkip?: () => void;
}

/** Second step after a training event is marked as an exam: title, instructions, time allowed and the students who may take it. */
export default function ExamSetupForm({ trainingEventId, trainingCategory, defaultTitle, onCreated, onSkip }: Props) {
  const [title, setTitle] = useState(defaultTitle);
  const [instructions, setInstructions] = useState("");
  const [duration, setDuration] = useState("30");
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResponse[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const text = query.trim();
    if (text.length < 2) { setResults([]); return; }
    const timer = setTimeout(() => {
      searchAllUsers(text, 0, 8).then((r) => setResults(r.content ?? [])).catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const addStudent = (u: UserResponse) => {
    setStudents((prev) => (prev.some((s) => s.id === u.id) ? prev : [...prev, { id: u.id, name: fullName(u) }]));
    setQuery("");
    setResults([]);
  };

  const submit = async () => {
    const minutes = Number(duration);
    if (!title.trim()) { setError("The exam title is required."); return; }
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 600) { setError("Enter the time allowed as whole minutes, from 1 to 600."); return; }
    setSaving(true);
    setError("");
    try {
      const setup = await createExamSetup({
        trainingEventId,
        trainingCategory,
        title: title.trim(),
        instructions: instructions.trim() || undefined,
        allowedStudents: students.map((s) => s.id),
        duration: minutes,
      });
      onCreated(setup);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not set up the exam.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={labelCls}>Exam title <span className="text-red-500">*</span></label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Instructions</label>
        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} placeholder="Optional. Shown to students before they start." className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Time allowed (minutes) <span className="text-red-500">*</span></label>
        <input type="number" inputMode="numeric" min={1} max={600} value={duration} onChange={(e) => setDuration(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Students allowed to take the exam</label>
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a member by name, email or phone" className={inputCls} />
        {results.length > 0 && (
          <ul className="mt-1 max-h-44 overflow-y-auto rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
            {results.map((u) => (
              <li key={u.id}>
                <button type="button" onClick={() => addStudent(u)} className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700">
                  <span className="font-medium text-[#111827] dark:text-slate-100">{fullName(u)}</span>
                  <span className="text-xs text-[#9CA3AF]">{u.email || u.phoneNumber}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {students.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {students.map((s) => (
              <li key={s.id} className="flex items-center gap-1 rounded-full bg-[#B5B5F3] px-3 py-1 text-xs font-medium text-[#000080]">
                {s.name}
                <button type="button" aria-label={`Remove ${s.name}`} onClick={() => setStudents((prev) => prev.filter((x) => x.id !== s.id))}><X className="h-3 w-3" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700">{error}</p>}
      <div className="flex justify-end gap-2">
        {onSkip && (
          <button type="button" onClick={onSkip} className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-2 text-xs font-semibold text-[#374151] dark:text-slate-300">Set up later</button>
        )}
        <button type="button" onClick={submit} disabled={saving} className="rounded-lg bg-[#000080] px-4 py-2 text-xs font-semibold text-white hover:bg-[#000066] disabled:opacity-50">
          {saving ? "Saving..." : "Create exam and add questions"}
        </button>
      </div>
    </div>
  );
}
