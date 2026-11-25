"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, X } from "lucide-react";
import ExamSetupForm from "@/components/trainings/ExamSetupForm";
import { createTrainingEvent, type CreateTrainingEventRequest, type TrainingEventResponse } from "@/lib/api";

const ACCENT = "#D97706";

interface Props {
  /** Backend training category, for example SCHOOL_OF_DISCIPLES. */
  category: string;
  /** The set the page is showing. When it is not known the form asks for it. */
  setFilter?: string;
  /** Opened from the exams page: the event is always an exam, so the tick box is not shown. */
  examOnly?: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTrainingEventModal({ category, setFilter, examOnly = false, onClose, onCreated }: Props) {
  const router = useRouter();
  const [setName2, setSetName2] = useState(setFilter ?? String(new Date().getFullYear()));
  const [name,     setName]     = useState("");
  const [teacher,  setTeacher]  = useState("");
  const [date,     setDate]     = useState("");
  const [location, setLocation] = useState("");
  const [isExam,   setIsExam]   = useState(examOnly);
  const [examEvent, setExamEvent] = useState<TrainingEventResponse | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async () => {
    if (!setName2.trim()) { setError("Set is required."); return; }
    if (!name.trim()) { setError("Name is required."); return; }
    if (!teacher.trim()) { setError("Teacher is required."); return; }
    if (!date) { setError("Date is required."); return; }
    if (!location.trim()) { setError("Location is required."); return; }
    setSaving(true);
    setError("");
    try {
      const created = await createTrainingEvent({
        trainingCategory: category,
        set: setName2.trim(),
        name: name.trim(),
        teacher: teacher.trim(),
        date,
        location: location.trim(),
        isExam,
      } as CreateTrainingEventRequest);
      if (isExam && created?.id) {
        setExamEvent(created);
      } else {
        onCreated();
      }
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
            <h2 className="text-base font-bold text-[#111827] dark:text-slate-100">{examOnly ? "New exam" : "Create Training Event"}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[#F3F4F6] dark:bg-slate-700/30">
            <X className="h-4 w-4 text-[#6B7280] dark:text-slate-400" />
          </button>
        </div>

        {examEvent ? (
          <div className="p-5">
            <p className="mb-4 text-sm text-[#6B7280] dark:text-slate-400">
              The training event &ldquo;{examEvent.name}&rdquo; is saved. Now set up the online exam for it. You add the questions next.
            </p>
            <ExamSetupForm
              trainingEventId={examEvent.id}
              trainingCategory={category}
              defaultTitle={examEvent.name ?? ""}
              onSkip={onCreated}
              onCreated={(setup) => { onCreated(); router.push(`/trainings/exams?setup=${encodeURIComponent(setup.id)}`); }}
            />
          </div>
        ) : (
          <>
        <div className="p-5 space-y-4">
          {/* Set (read-only) */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400">Set</label>
            <input
              type="text"
              value={setName2}
              onChange={(e) => setSetName2(e.target.value)}
              readOnly={!!setFilter}
              placeholder="e.g. 2026"
              className={`w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2.5 text-sm outline-none ${setFilter ? "bg-[#F9FAFB] dark:bg-slate-700/30 text-[#6B7280] dark:text-slate-400" : "bg-white dark:bg-slate-800 text-[#111827] dark:text-slate-100 focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"}`}
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
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400">Teacher <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              placeholder="Required"
              className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400">Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
            />
          </div>

          {/* Location */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400">Location <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Required"
              className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]"
            />
          </div>

          {/* Is Exam */}
          {!examOnly && (
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
          )}

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
            {saving ? "Creating…" : examOnly ? "Next: exam setup" : "Create Event"}
          </button>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
