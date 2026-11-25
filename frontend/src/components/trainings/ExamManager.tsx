"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, Lock, Unlock, CheckCircle2, Circle, RefreshCw } from "lucide-react";
import CreateTrainingEventModal from "@/components/trainings/CreateTrainingEventModal";
import { useToast } from "@/context/ToastContext";
import ExamStudentPicker, { fullName, type PickedStudent } from "@/components/trainings/ExamStudentPicker";
import {
  closeExamSetup,
  createExamQuestions,
  deleteExamQuestion,
  deleteExamSetup,
  getExamQuestions,
  getExamSetups,
  getExamStudentAnswers,
  getUsersByIds,
  openExamSetup,
  updateExamAllowedStudents,
  updateExamQuestionCorrectOption,
  updateExamQuestionText,
  updateExamSetup,
  type ExamQuestionResponse,
  type ExamSetupResponse,
} from "@/lib/api";

const inputCls =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-[#9CA3AF] dark:text-slate-400";
const CATEGORY_LABEL: Record<string, string> = {
  BAPTISM: "Baptismal Class",
  WORKERS_IN_TRAINING: "Workers-in-Training",
  SCHOOL_OF_DISCIPLES: "School of Disciples",
  SCHOOL_OF_MINISTRY: "School of Ministry",
  RILA: "RILA",
};

const errorText = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

const primaryBtn = "inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#000080] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#000066] disabled:cursor-not-allowed disabled:opacity-50";
const outlineBtn = "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-[#374151] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50";
const panel = "rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4";
const statusBadge = (open?: boolean) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${open ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
    {open ? "Open to students" : "Not open"}
  </span>
);

function ExamList({ category, onOpen }: { category: string; onOpen: (id: string) => void }) {
  const [setups, setSetups] = useState<ExamSetupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [choosing, setChoosing] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const load = useCallback(async () => {
    try {
      setSetups((await getExamSetups(0, 100)).content ?? []);
      setError("");
    } catch (e) {
      setError(errorText(e, "Could not load the exams."));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const shown = category ? setups.filter((s) => s.trainingCategory === category) : setups;
  const label = CATEGORY_LABEL[category];

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#000000] dark:text-slate-100">{label ? `${label} exams` : "Online Exams"}</h1>
          <p className="mt-1 text-sm text-[#6B7280] dark:text-slate-400">1. Create the exam. 2. Add questions and students. 3. Open it. 4. See the results.</p>
        </div>
        <button type="button" onClick={() => (label ? setNewCategory(category) : setChoosing(true))} className={primaryBtn}><Plus className="h-4 w-4" /> Create exam</button>
      </div>

      {choosing && (
        <div className={`${panel} mt-4`}>
          <p className={labelCls}>Which training is the exam for?</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORY_LABEL).filter(([key]) => key !== "RILA").map(([key, name]) => (
              <button key={key} type="button" onClick={() => { setNewCategory(key); setChoosing(false); }} className={outlineBtn}>{name}</button>
            ))}
            <button type="button" onClick={() => setChoosing(false)} className="px-3 text-sm text-[#6B7280] underline">Cancel</button>
          </div>
        </div>
      )}
      {newCategory && (
        <CreateTrainingEventModal category={newCategory} examOnly onClose={() => setNewCategory("")} onCreated={() => { setNewCategory(""); void load(); }} />
      )}

      {loading && <p className="mt-6 text-sm text-[#6B7280]">Loading exams...</p>}
      {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {!loading && !error && shown.length === 0 && <p className="mt-6 text-sm text-[#6B7280]">No exams yet. Press Create exam to make the first one.</p>}
      <ul className="mt-6 grid gap-3">
        {shown.map((s) => (
          <li key={s.id}>
            <button type="button" onClick={() => onOpen(s.id)} className={`${panel} flex w-full flex-col gap-2 text-left hover:border-[#000080] sm:flex-row sm:items-center`}>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-semibold text-[#111827] dark:text-slate-100">{s.title}</span>
                <span className="mt-0.5 block text-xs text-[#6B7280] dark:text-slate-400">
                  {CATEGORY_LABEL[s.trainingCategory ?? ""] ?? s.trainingCategory} · {s.duration} minutes · {s.allowedStudents?.length ?? 0} student{s.allowedStudents?.length === 1 ? "" : "s"}
                </span>
              </span>
              <span className="flex items-center gap-3">
                {statusBadge(s.isOpen)}
                <span className="text-sm font-semibold text-[#000080] dark:text-indigo-400">Open ›</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExamDetailsCard({ setup, onSaved }: { setup: ExamSetupResponse; onSaved: () => void }) {
  const { addToast } = useToast();
  const [title, setTitle] = useState(setup.title ?? "");
  const [instructions, setInstructions] = useState(setup.instructions ?? "");
  const [duration, setDuration] = useState(String(setup.duration ?? 30));
  const [totalScore, setTotalScore] = useState(setup.totalAvailableScore ? String(setup.totalAvailableScore) : "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const minutes = Number(duration);
    if (!title.trim()) { addToast("The exam title is required.", "error"); return; }
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 600) { addToast("Enter the time allowed as whole minutes, from 1 to 600.", "error"); return; }
    const total = totalScore.trim() ? Number(totalScore) : undefined;
    if (total !== undefined && !(total > 0)) { addToast("Total score must be a number above zero.", "error"); return; }
    setSaving(true);
    try {
      await updateExamSetup(setup.id, { title: title.trim(), instructions: instructions.trim() || undefined, duration: minutes, totalAvailableScore: total });
      addToast("Exam details saved.", "success");
      onSaved();
    } catch (e) {
      addToast(errorText(e, "Could not save the exam details."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 grid max-w-2xl gap-4 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Exam details</h3>
      <div>
        <label className={labelCls}>Exam title <span className="text-red-500">*</span></label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Instructions</label>
        <textarea rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Time allowed (minutes) <span className="text-red-500">*</span></label>
        <input type="number" inputMode="numeric" min={1} max={600} value={duration} onChange={(e) => setDuration(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Total score</label>
        <input type="number" inputMode="decimal" min={1} value={totalScore} onChange={(e) => setTotalScore(e.target.value)} placeholder="Empty: scores are shown as a percentage" className={inputCls} />
      </div>
      <button type="button" onClick={save} disabled={saving} className="w-fit rounded-lg bg-[#000080] px-4 py-2 text-xs font-semibold text-white hover:bg-[#000066] disabled:opacity-50">
        {saving ? "Saving..." : "Save details"}
      </button>
    </div>
  );
}

function AllowedStudentsCard({ setup, onSaved }: { setup: ExamSetupResponse; onSaved: () => void }) {
  const { addToast } = useToast();
  const [students, setStudents] = useState<PickedStudent[] | null>(null);
  const [saving, setSaving] = useState(false);
  const idsKey = (setup.allowedStudents ?? []).join(",");

  useEffect(() => {
    const ids = idsKey ? idsKey.split(",") : [];
    if (ids.length === 0) { Promise.resolve().then(() => setStudents([])); return; }
    getUsersByIds(ids)
      .then((users) => setStudents(users.map((u) => ({ id: u.id, name: fullName(u) }))))
      .catch(() => setStudents(ids.map((id) => ({ id, name: "Student" }))));
  }, [idsKey]);

  const save = async () => {
    if (!students) return;
    setSaving(true);
    try {
      await updateExamAllowedStudents(setup.id, students.map((s) => s.id));
      addToast("Allowed students saved.", "success");
      onSaved();
    } catch (e) {
      addToast(errorText(e, "Could not save the allowed students."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 grid max-w-2xl gap-3 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Students allowed to take the exam</h3>
      <p className="text-xs text-[#6B7280] dark:text-slate-400">Students take the exam on the public website, not in this app. Saving replaces the whole list.</p>
      {students === null ? <p className="text-sm text-[#6B7280]">Loading...</p> : <ExamStudentPicker value={students} onChange={setStudents} />}
      <button type="button" onClick={save} disabled={saving || students === null} className="w-fit rounded-lg bg-[#000080] px-4 py-2 text-xs font-semibold text-white hover:bg-[#000066] disabled:opacity-50">
        {saving ? "Saving..." : "Save students"}
      </button>
    </div>
  );
}

function QuestionRow({ q, index, locked, onChanged, onDelete }: { q: ExamQuestionResponse; index: number; locked: boolean; onChanged: () => void; onDelete: () => void }) {
  const { addToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(q.question ?? "");
  const [correct, setCorrect] = useState(q.correctOption ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!text.trim()) { addToast("Type the question.", "error"); return; }
    setSaving(true);
    try {
      if (text.trim() !== q.question) await updateExamQuestionText(q.id, text.trim());
      if (q.questionType === "OBJECTIVE" && correct && correct !== q.correctOption) await updateExamQuestionCorrectOption(q.id, correct);
      addToast("Question saved.", "success");
      setEditing(false);
      onChanged();
    } catch (e) {
      addToast(errorText(e, "Could not save the question."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="flex gap-3 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <span className="text-sm font-semibold text-[#9CA3AF]">{index + 1}.</span>
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="grid gap-3">
            <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} className={inputCls} />
            {q.questionType === "OBJECTIVE" && (
              <fieldset className="grid gap-1 text-sm">
                <legend className={labelCls}>Correct answer</legend>
                {q.options?.map((o) => (
                  <label key={o.id} className="flex items-center gap-2 text-[#374151] dark:text-slate-300">
                    <input type="radio" name={`correct-${q.id}`} checked={correct === o.optionText} onChange={() => setCorrect(o.optionText ?? "")} style={{ accentColor: "#000080" }} />
                    {o.optionText}
                  </label>
                ))}
              </fieldset>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-[#000080] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
              <button type="button" onClick={() => { setEditing(false); setText(q.question ?? ""); setCorrect(q.correctOption ?? ""); }} className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-[#374151] dark:text-slate-300">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#111827] dark:text-slate-100">{q.question}</p>
            {q.questionType === "OBJECTIVE" ? (
              <ul className="mt-2 grid gap-1 text-xs">
                {q.options?.map((o) => (
                  <li key={o.id} className={o.optionText === q.correctOption ? "font-semibold text-green-700" : "text-[#6B7280]"}>
                    {o.optionText}{o.optionText === q.correctOption ? " (correct)" : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-xs text-[#6B7280]">Written answer</p>
            )}
          </>
        )}
      </div>
      {!editing && (
        <div className="flex flex-col gap-1 self-start sm:flex-row">
          <button type="button" onClick={() => setEditing(true)} disabled={locked} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-[#000080] dark:text-indigo-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">Edit</button>
          <button type="button" onClick={onDelete} disabled={locked} aria-label="Delete question" className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
        </div>
      )}
    </li>
  );
}

interface StudentResult { id: string; name: string; answered: number; correct: number; failed?: boolean }

/** The exam system lists no results, so each student's saved answers are marked here against the correct options. */
function ResultsTab({ setup, questions }: { setup: ExamSetupResponse; questions: ExamQuestionResponse[] }) {
  const [results, setResults] = useState<StudentResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const idsKey = (setup.allowedStudents ?? []).join(",");

  const load = useCallback(async () => {
    const ids = idsKey ? idsKey.split(",") : [];
    setLoading(true);
    setError("");
    try {
      const users = ids.length ? await getUsersByIds(ids) : [];
      const names = new Map(users.map((u) => [u.id, fullName(u)]));
      const marked = await Promise.all(ids.map(async (id): Promise<StudentResult> => {
        const name = names.get(id) ?? "Student";
        try {
          const answers = await getExamStudentAnswers(setup.id, id);
          const correct = answers.filter((a) => questions.some((q) => q.id === a.questionId && q.correctOption === a.text)).length;
          return { id, name, answered: answers.length, correct };
        } catch {
          return { id, name, answered: 0, correct: 0, failed: true };
        }
      }));
      setResults(marked.sort((a, b) => b.correct - a.correct || a.name.localeCompare(b.name)));
    } catch (e) {
      setError(errorText(e, "Could not load the results."));
    } finally {
      setLoading(false);
    }
  }, [idsKey, setup.id, questions]);
  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const total = questions.length;
  const score = (r: StudentResult) => {
    const share = total ? r.correct / total : 0;
    return setup.totalAvailableScore ? `${Math.round(share * setup.totalAvailableScore * 10) / 10} / ${setup.totalAvailableScore}` : `${Math.round(share * 100)}%`;
  };

  return (
    <div className="mt-4 grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[#6B7280] dark:text-slate-400">Marked from the answers saved so far. An exam still being taken can change.</p>
        <button type="button" onClick={() => void load()} disabled={loading} className={outlineBtn}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</button>
      </div>
      {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {results === null && !error && <p className="text-sm text-[#6B7280]">Loading results...</p>}
      {results?.length === 0 && <p className="text-sm text-[#6B7280]">No students are on this exam yet.</p>}
      {!!results?.length && (
        <ul className="grid gap-2">
          {results.map((r) => (
            <li key={r.id} className={`${panel} flex items-center justify-between gap-3`}>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[#111827] dark:text-slate-100">{r.name}</span>
                <span className="block text-xs text-[#6B7280] dark:text-slate-400">
                  {r.failed ? "Could not load the answers" : r.answered === 0 ? "No answers yet" : `${r.answered} of ${total} answered · ${r.correct} correct`}
                </span>
              </span>
              <span className="text-lg font-bold text-[#000080] dark:text-indigo-400">{r.failed || r.answered === 0 ? "—" : score(r)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const BLANK_OPTIONS = ["", "", "", ""];

function AddQuestionForm({ examId, existing, onSaved }: { examId: string; existing: number; onSaved: () => Promise<void> }) {
  const { addToast } = useToast();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(BLANK_OPTIONS);
  const [correct, setCorrect] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    const filled = options.map((o, i) => ({ text: o.trim(), i })).filter((o) => o.text);
    if (!question.trim()) { setError("Type the question."); return; }
    if (filled.length < 2) { setError("Give at least two answers."); return; }
    if (new Set(filled.map((o) => o.text.toLowerCase())).size !== filled.length) { setError("Each answer must be different."); return; }
    const right = filled.find((o) => o.i === correct);
    if (!right) { setError("Tick the circle beside the correct answer."); return; }
    setSaving(true);
    setError("");
    try {
      await createExamQuestions(examId, [{ question: question.trim(), questionType: "OBJECTIVE", options: filled.map((o) => o.text), correctOption: right.text }]);
      const after = await getExamQuestions(examId, 0, 200);
      if ((after.content?.length ?? 0) <= existing) { setError("The exam system did not keep the question. Please try again."); return; }
      addToast("Question saved.", "success");
      setQuestion("");
      setOptions(BLANK_OPTIONS);
      setCorrect(null);
      await onSaved();
    } catch (e) {
      setError(errorText(e, "Could not save the question."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`${panel} grid gap-4`}>
      <div>
        <label className={labelCls} htmlFor="new-question">Question {existing + 1}</label>
        <textarea id="new-question" rows={2} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type the question" className={inputCls} />
      </div>
      <fieldset className="grid gap-2">
        <legend className={labelCls}>Answers: tick the correct one</legend>
        {options.map((o, i) => (
          <div key={i} className="flex items-center gap-3">
            <input type="radio" name="correct" aria-label={`Answer ${i + 1} is correct`} checked={correct === i} onChange={() => setCorrect(i)} className="h-5 w-5 shrink-0" style={{ accentColor: "#16a34a" }} />
            <input type="text" value={o} aria-label={`Answer ${i + 1}`} onChange={(e) => setOptions((all) => all.map((x, idx) => (idx === i ? e.target.value : x)))} placeholder={`Answer ${i + 1}${i > 1 ? " (optional)" : ""}`} className={inputCls} />
          </div>
        ))}
        {options.length < 8 && (
          <button type="button" onClick={() => setOptions((all) => [...all, ""])} className="flex w-fit items-center gap-1 text-xs font-semibold text-[#000080] dark:text-indigo-400"><Plus className="h-3.5 w-3.5" /> More answers</button>
        )}
      </fieldset>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button type="button" onClick={save} disabled={saving} className={`${primaryBtn} w-full sm:w-fit`}>{saving ? "Saving..." : "Save question"}</button>
      <p className="text-xs text-[#6B7280] dark:text-slate-400">Multiple-choice only: the exam system cannot receive written answers yet.</p>
    </div>
  );
}

type Tab = "questions" | "students" | "results" | "settings";

function ExamEditor({ examId, onBack }: { examId: string; onBack: (category?: string) => void }) {
  const { addToast } = useToast();
  const [setup, setSetup] = useState<ExamSetupResponse | null>(null);
  const [questions, setQuestions] = useState<ExamQuestionResponse[]>([]);
  const [tab, setTab] = useState<Tab>("questions");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [setups, qs] = await Promise.all([getExamSetups(0, 100), getExamQuestions(examId, 0, 200)]);
      setSetup(setups.content?.find((x) => x.id === examId) ?? null);
      setQuestions(qs.content ?? []);
    } catch (e) {
      addToast(errorText(e, "Could not load the exam."), "error");
    } finally {
      setLoading(false);
    }
  }, [examId, addToast]);
  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const toggle = async () => {
    if (!setup) return;
    setBusy(true);
    try {
      if (setup.isOpen) await closeExamSetup(setup.id); else await openExamSetup(setup.id);
      addToast(setup.isOpen ? "Exam closed." : "Exam opened. Students can now take it on the website.", "success");
      await load();
    } catch (e) {
      addToast(errorText(e, "Could not change the exam."), "error");
    } finally {
      setBusy(false);
    }
  };

  const removeQuestion = async (q: ExamQuestionResponse) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await deleteExamQuestion(q.id);
      addToast("Question deleted.", "success");
      await load();
    } catch (e) {
      addToast(errorText(e, "Could not delete the question."), "error");
    }
  };

  const removeExam = async () => {
    if (!setup || !window.confirm(`Delete the exam "${setup.title}" and all its questions? This cannot be undone.`)) return;
    try {
      await deleteExamSetup(setup.id);
      addToast("Exam deleted.", "success");
      onBack(setup.trainingCategory);
    } catch (e) {
      addToast(errorText(e, "Could not delete the exam."), "error");
    }
  };

  if (loading) return <p className="text-sm text-[#6B7280]">Loading exam...</p>;
  if (!setup) {
    return (
      <div>
        <p className="text-sm text-[#6B7280]">This exam could not be found.</p>
        <button type="button" onClick={() => onBack()} className={`${outlineBtn} mt-3`}>Back to exams</button>
      </div>
    );
  }

  const studentCount = setup.allowedStudents?.length ?? 0;
  const ready = questions.length > 0 && studentCount > 0;
  const check = (done: boolean, text: string, target: Tab) => (
    <button type="button" onClick={() => setTab(target)} className="flex items-center gap-2 text-sm text-[#374151] dark:text-slate-300 hover:underline">
      {done ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-[#9CA3AF]" />}
      {text}
    </button>
  );
  const tabs: { key: Tab; label: string }[] = [
    { key: "questions", label: `Questions (${questions.length})` },
    { key: "students", label: `Students (${studentCount})` },
    { key: "results", label: "Results" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="max-w-2xl">
      <button type="button" onClick={() => onBack(setup.trainingCategory)} className="text-sm font-semibold text-[#000080] dark:text-indigo-400">‹ {CATEGORY_LABEL[setup.trainingCategory ?? ""] ?? "All"} exams</button>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-[#000000] dark:text-slate-100">{setup.title}</h1>
        {statusBadge(setup.isOpen)}
      </div>
      <p className="mt-1 text-sm text-[#6B7280] dark:text-slate-400">
        {setup.duration} minutes{setup.totalAvailableScore ? ` · scored out of ${setup.totalAvailableScore}` : ""}
      </p>

      <div className={`${panel} mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="grid gap-1.5">
          {check(questions.length > 0, questions.length > 0 ? `${questions.length} question${questions.length === 1 ? "" : "s"} added` : "Add at least one question", "questions")}
          {check(studentCount > 0, studentCount > 0 ? `${studentCount} student${studentCount === 1 ? "" : "s"} chosen` : "Choose the students", "students")}
        </div>
        <button type="button" onClick={toggle} disabled={busy || (!setup.isOpen && !ready)} className={setup.isOpen ? outlineBtn : primaryBtn}>
          {setup.isOpen ? <><Lock className="h-4 w-4" /> Close exam</> : <><Unlock className="h-4 w-4" /> Open to students</>}
        </button>
      </div>

      <div role="tablist" className="mt-6 flex overflow-x-auto border-b border-[#E5E7EB] dark:border-slate-700">
        {tabs.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
            className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold ${tab === t.key ? "border-[#000080] text-[#000080] dark:border-indigo-400 dark:text-indigo-400" : "border-transparent text-[#6B7280]"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "questions" && (
        <div className="mt-4 grid gap-3">
          {setup.isOpen && questions.length > 0 && <p className="text-xs text-[#6B7280] dark:text-slate-400">To edit or delete a question, close the exam first.</p>}
          {questions.length > 0 && (
            <ol className="grid gap-2">
              {questions.map((q, i) => (
                <QuestionRow key={q.id} q={q} index={i} locked={!!setup.isOpen} onChanged={load} onDelete={() => removeQuestion(q)} />
              ))}
            </ol>
          )}
          <AddQuestionForm examId={examId} existing={questions.length} onSaved={load} />
        </div>
      )}
      {tab === "students" && <AllowedStudentsCard setup={setup} onSaved={load} />}
      {tab === "results" && <ResultsTab setup={setup} questions={questions} />}
      {tab === "settings" && (
        <>
          <ExamDetailsCard key={`${setup.id}-${setup.title}-${setup.duration}-${setup.instructions}-${setup.totalAvailableScore}`} setup={setup} onSaved={load} />
          <button type="button" onClick={removeExam} disabled={setup.isOpen} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 disabled:opacity-50"><Trash2 className="h-4 w-4" /> Delete this exam</button>
          {setup.isOpen && <p className="mt-1 text-xs text-[#6B7280]">Close the exam to delete it.</p>}
        </>
      )}
    </div>
  );
}

export default function ExamManager() {
  const router = useRouter();
  const params = useSearchParams();
  const setupId = params.get("setup");
  const category = params.get("category") ?? "";
  return setupId
    ? <ExamEditor key={setupId} examId={setupId} onBack={(c) => router.push(c ? `/trainings/exams?category=${c}` : "/trainings/exams")} />
    : <ExamList key={category} category={category} onOpen={(id) => router.push(`/trainings/exams?setup=${encodeURIComponent(id)}`)} />;
}
