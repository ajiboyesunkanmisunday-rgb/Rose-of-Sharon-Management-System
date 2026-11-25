"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListChecks, Plus } from "lucide-react";
import CreateTrainingEventModal from "@/components/trainings/CreateTrainingEventModal";

/** The two exam buttons a training page shows its coordinator: make a new exam, or open the existing ones and their results. */
export default function ExamActions({ category, set }: { category: string; set?: string }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-lg bg-[#000080] px-4 py-2 text-xs font-semibold text-white hover:bg-[#000066]">
        <Plus className="h-3.5 w-3.5" />
        Create Exam
      </button>
      <button type="button" onClick={() => router.push(`/trainings/exams?category=${category}`)} className="flex items-center gap-2 rounded-lg border border-[#000080] bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-[#000080] dark:text-indigo-400 hover:bg-[#000080] hover:text-white">
        <ListChecks className="h-3.5 w-3.5" />
        Exams &amp; Results
      </button>
      {creating && <CreateTrainingEventModal category={category} setFilter={set || undefined} examOnly onClose={() => setCreating(false)} onCreated={() => setCreating(false)} />}
    </>
  );
}
