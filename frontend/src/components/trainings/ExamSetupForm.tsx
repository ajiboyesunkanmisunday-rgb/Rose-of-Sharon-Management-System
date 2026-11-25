"use client";

import { useState } from "react";
import { createExamSetup, type ExamSetupResponse } from "@/lib/api";
import ExamStudentPicker, { type PickedStudent } from "@/components/trainings/ExamStudentPicker";

const inputCls =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400";

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
  const [totalScore, setTotalScore] = useState("");
  const [students, setStudents] = useState<PickedStudent[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const minutes = Number(duration);
    if (!title.trim()) { setError("The exam title is required."); return; }
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 600) { setError("Enter the time allowed as whole minutes, from 1 to 600."); return; }
    const total = totalScore.trim() ? Number(totalScore) : undefined;
    if (total !== undefined && !(total > 0)) { setError("Total score must be a number above zero, or left empty."); return; }
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
        totalAvailableScore: total,
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
        <label className={labelCls}>Total score</label>
        <input type="number" inputMode="decimal" min={1} value={totalScore} onChange={(e) => setTotalScore(e.target.value)} placeholder="Empty: scores are shown as a percentage" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Students allowed to take the exam</label>
        <ExamStudentPicker value={students} onChange={setStudents} />
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
