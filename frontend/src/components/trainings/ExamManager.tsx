"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, Lock, Unlock, ListChecks } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useToast } from "@/context/ToastContext";
import ExamStudentPicker, { fullName, type PickedStudent } from "@/components/trainings/ExamStudentPicker";
import {
  closeExamSetup,
  createExamQuestions,
  deleteExamQuestion,
  deleteExamSetup,
  getExamQuestions,
  getExamSetups,
  getUsersByIds,
  openExamSetup,
  updateExamAllowedStudents,
  updateExamQuestionCorrectOption,
  updateExamQuestionText,
  updateExamSetup,
  type CreateExamQuestionRequest,
  type ExamQuestionResponse,
  type ExamQuestionType,
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

function ExamList({ onOpen }: { onOpen: (id: string) => void }) {
  const { addToast } = useToast();
  const [setups, setSetups] = useState<ExamSetupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSetups((await getExamSetups(0, 100)).content ?? []);
    } catch (e) {
      setError(errorText(e, "Could not load the exams."));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const toggle = async (s: ExamSetupResponse) => {
    setBusyId(s.id);
    try {
      if (s.isOpen) await closeExamSetup(s.id); else await openExamSetup(s.id);
      addToast(s.isOpen ? "Exam closed." : "Exam opened. Students can now see it.", "success");
      await load();
    } catch (e) {
      addToast(errorText(e, "Could not change the exam."), "error");
    } finally {
      setBusyId("");
    }
  };

  const remove = async (s: ExamSetupResponse) => {
    if (!window.confirm(`Delete the exam "${s.title}" and all its questions? This cannot be undone.`)) return;
    setBusyId(s.id);
    try {
      await deleteExamSetup(s.id);
      addToast("Exam deleted.", "success");
      await load();
    } catch (e) {
      addToast(errorText(e, "Could not delete the exam."), "error");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div>
      <PageHeader
        title="Online Exams"
        subtitle="To create an exam, add a training event under a training and tick Is Exam."
      />
      {loading && <p className="mt-6 text-sm text-[#6B7280]">Loading exams...</p>}
      {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {!loading && !error && setups.length === 0 && (
        <p className="mt-6 text-sm text-[#6B7280]">No exams yet.</p>
      )}
      <ul className="mt-6 grid gap-3">
        {setups.map((s) => (
          <li key={s.id} className="flex flex-col gap-3 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#111827] dark:text-slate-100">{s.title}</p>
              <p className="mt-0.5 text-xs text-[#6B7280] dark:text-slate-400">
                {CATEGORY_LABEL[s.trainingCategory ?? ""] ?? s.trainingCategory} · {s.duration} minutes · {s.allowedStudents?.length ?? 0} students allowed{s.totalAvailableScore ? ` · scored out of ${s.totalAvailableScore}` : ""}
              </p>
              <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {s.isOpen ? "Open" : "Closed"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => onOpen(s.id)} className="flex items-center gap-1.5 rounded-lg border border-[#000080] px-3 py-2 text-xs font-semibold text-[#000080] dark:text-indigo-400 dark:border-indigo-400 hover:bg-[#000080] hover:text-white">
                <ListChecks className="h-3.5 w-3.5" /> Questions
              </button>
              <button type="button" disabled={busyId === s.id} onClick={() => toggle(s)} className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2 text-xs font-semibold text-[#374151] dark:text-slate-300 disabled:opacity-50">
                {s.isOpen ? <><Lock className="h-3.5 w-3.5" /> Close</> : <><Unlock className="h-3.5 w-3.5" /> Open</>}
              </button>
              <button type="button" disabled={busyId === s.id} onClick={() => remove(s)} aria-label={`Delete ${s.title}`} className="rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface Draft {
  question: string;
  questionType: ExamQuestionType;
  options: string[];
  correctOption: string;
}
const blankDraft = (): Draft => ({ question: "", questionType: "OBJECTIVE", options: ["", "", "", ""], correctOption: "" });


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

function QuestionEditor({ examId, onBack }: { examId: string; onBack: () => void }) {
  const { addToast } = useToast();
  const [setup, setSetup] = useState<ExamSetupResponse | null>(null);
  const [questions, setQuestions] = useState<ExamQuestionResponse[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [draft, setDraft] = useState<Draft>(blankDraft());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [setups, qs] = await Promise.all([getExamSetups(0, 100), getExamQuestions(examId, 0, 200)]);
      setSetup(setups.content?.find((x) => x.id === examId) ?? null);
      setQuestions(qs.content ?? []);
    } catch (e) {
      addToast(errorText(e, "Could not load the questions."), "error");
    } finally {
      setLoading(false);
    }
  }, [examId, addToast]);
  useEffect(() => { void load(); }, [load]);

  const setOption = (i: number, value: string) =>
    setDraft((d) => {
      const options = d.options.map((o, idx) => (idx === i ? value : o));
      return { ...d, options, correctOption: d.correctOption === d.options[i] ? value : d.correctOption };
    });

  const addDraft = () => {
    const text = draft.question.trim();
    if (!text) { setError("Type the question."); return; }
    if (draft.questionType === "OBJECTIVE") {
      const options = draft.options.map((o) => o.trim()).filter(Boolean);
      if (options.length < 2) { setError("Give at least two answer options."); return; }
      if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) { setError("Each answer option must be different."); return; }
      if (!options.includes(draft.correctOption.trim())) { setError("Choose which option is correct."); return; }
      setDrafts((d) => [...d, { question: text, questionType: "OBJECTIVE", options, correctOption: draft.correctOption.trim() }]);
    } else {
      setDrafts((d) => [...d, { question: text, questionType: "THEORY", options: [], correctOption: "" }]);
    }
    setDraft((d) => ({ ...blankDraft(), questionType: d.questionType }));
    setError("");
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const body: CreateExamQuestionRequest[] = drafts.map((d) => ({
        question: d.question,
        questionType: d.questionType,
        // The exam system saves nothing when a written question arrives without these two fields, so they are always sent.
        options: d.questionType === "OBJECTIVE" ? d.options : [],
        correctOption: d.questionType === "OBJECTIVE" ? d.correctOption : "",
      }));
      await createExamQuestions(examId, body);
      const after = await getExamQuestions(examId, 0, 200);
      if ((after.content?.length ?? 0) < questions.length + drafts.length) {
        addToast("The exam system did not keep the questions. Please try again.", "error");
        return;
      }
      addToast(`${drafts.length} question${drafts.length === 1 ? "" : "s"} saved.`, "success");
      setDrafts([]);
      await load();
    } catch (e) {
      addToast(errorText(e, "Could not save the questions."), "error");
    } finally {
      setSaving(false);
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

  return (
    <div>
      <PageHeader title={setup?.title ?? "Exam questions"} subtitle={setup ? `${setup.duration} minutes · ${setup.isOpen ? "Open" : "Closed"}` : undefined} backOnClick={onBack} />

      {setup && <ExamDetailsCard key={`${setup.id}-${setup.title}-${setup.duration}-${setup.instructions}-${setup.totalAvailableScore}`} setup={setup} onSaved={load} />}
      {setup && <AllowedStudentsCard setup={setup} onSaved={load} />}

      <h3 className="mt-8 text-sm font-semibold text-[#111827] dark:text-slate-100">Questions in this exam ({questions.length})</h3>
      {setup?.isOpen && (
        <p className="mt-2 text-xs text-[#6B7280] dark:text-slate-400">This exam is open. Close it from the exam list before editing or deleting questions. You can still add questions.</p>
      )}
      {loading && <p className="mt-3 text-sm text-[#6B7280]">Loading...</p>}
      {!loading && questions.length === 0 && <p className="mt-3 text-sm text-[#6B7280]">No questions yet. Add them below.</p>}
      <ol className="mt-3 grid gap-2">
        {questions.map((q, i) => (
          <QuestionRow key={q.id} q={q} index={i} locked={!!setup?.isOpen} onChanged={load} onDelete={() => removeQuestion(q)} />
        ))}
      </ol>

      <h3 className="mt-8 text-sm font-semibold text-[#111827] dark:text-slate-100">Add a question</h3>
      <div className="mt-3 grid max-w-2xl gap-4 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <div>
          <label className={labelCls}>Type</label>
          <select value={draft.questionType} onChange={(e) => setDraft((d) => ({ ...d, questionType: e.target.value as ExamQuestionType }))} className={inputCls}>
            <option value="OBJECTIVE">Objective (pick an answer)</option>
            <option value="THEORY">Theory (written answer)</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Question <span className="text-red-500">*</span></label>
          <textarea rows={2} value={draft.question} onChange={(e) => setDraft((d) => ({ ...d, question: e.target.value }))} className={inputCls} />
        </div>
        {draft.questionType === "OBJECTIVE" && (
          <fieldset className="grid gap-2">
            <legend className={labelCls}>Answer options (select the correct one)</legend>
            {draft.options.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name="correct" aria-label={`Option ${i + 1} is correct`} checked={!!o.trim() && draft.correctOption === o} disabled={!o.trim()} onChange={() => setDraft((d) => ({ ...d, correctOption: o }))} className="h-4 w-4" style={{ accentColor: "#000080" }} />
                <input type="text" value={o} onChange={(e) => setOption(i, e.target.value)} placeholder={`Option ${i + 1}`} className={inputCls} />
                {draft.options.length > 2 && (
                  <button type="button" aria-label={`Remove option ${i + 1}`} onClick={() => setDraft((d) => ({ ...d, options: d.options.filter((_, idx) => idx !== i), correctOption: d.correctOption === o ? "" : d.correctOption }))} className="text-[#9CA3AF] hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
            ))}
            {draft.options.length < 8 && (
              <button type="button" onClick={() => setDraft((d) => ({ ...d, options: [...d.options, ""] }))} className="flex w-fit items-center gap-1 text-xs font-semibold text-[#000080] dark:text-indigo-400"><Plus className="h-3.5 w-3.5" /> Add option</button>
            )}
          </fieldset>
        )}
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        <button type="button" onClick={addDraft} className="w-fit rounded-lg border border-[#000080] px-4 py-2 text-xs font-semibold text-[#000080] dark:text-indigo-400 dark:border-indigo-400 hover:bg-[#000080] hover:text-white">Add to the list below</button>
      </div>

      {drafts.length > 0 && (
        <div className="mt-6 max-w-2xl">
          <h3 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Ready to save ({drafts.length})</h3>
          <ol className="mt-2 grid gap-1 text-sm text-[#374151] dark:text-slate-300">
            {drafts.map((d, i) => (
              <li key={i} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 px-3 py-2">
                <span className="truncate">{d.question}</span>
                <button type="button" aria-label="Remove from list" onClick={() => setDrafts((all) => all.filter((_, idx) => idx !== i))} className="text-[#9CA3AF] hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ol>
          <button type="button" onClick={saveAll} disabled={saving} className="mt-3 rounded-lg bg-[#000080] px-4 py-2 text-xs font-semibold text-white hover:bg-[#000066] disabled:opacity-50">
            {saving ? "Saving..." : `Save ${drafts.length} question${drafts.length === 1 ? "" : "s"} to the exam`}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ExamManager() {
  const router = useRouter();
  const params = useSearchParams();
  const setupId = params.get("setup");
  return setupId
    ? <QuestionEditor examId={setupId} onBack={() => router.push("/trainings/exams")} />
    : <ExamList onOpen={(id) => router.push(`/trainings/exams?setup=${encodeURIComponent(id)}`)} />;
}
