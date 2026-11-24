"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { searchAllUsers, type UserResponse } from "@/lib/api";

export interface PickedStudent { id: string; name: string }

const inputCls =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]";

export const fullName = (u: Pick<UserResponse, "firstName" | "middleName" | "lastName">) =>
  [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ");

/** Search members and keep a list of chosen students. The exam page for students is on the public website, so the students are members, not users of this app. */
export default function ExamStudentPicker({ value, onChange }: { value: PickedStudent[]; onChange: (next: PickedStudent[]) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResponse[]>([]);

  useEffect(() => {
    const text = query.trim();
    if (text.length < 2) return;
    const timer = setTimeout(() => {
      searchAllUsers(text, 0, 8).then((r) => setResults(r.content ?? [])).catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const shown = query.trim().length < 2 ? [] : results;

  const add = (u: UserResponse) => {
    if (!value.some((s) => s.id === u.id)) onChange([...value, { id: u.id, name: fullName(u) }]);
    setQuery("");
    setResults([]);
  };

  return (
    <div>
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a member by name, email or phone" className={inputCls} />
      {shown.length > 0 && (
        <ul className="mt-1 max-h-44 overflow-y-auto rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
          {shown.map((u) => (
            <li key={u.id}>
              <button type="button" onClick={() => add(u)} className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700">
                <span className="font-medium text-[#111827] dark:text-slate-100">{fullName(u)}</span>
                <span className="text-xs text-[#9CA3AF]">{u.email || u.phoneNumber}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {value.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {value.map((s) => (
            <li key={s.id} className="flex items-center gap-1 rounded-full bg-[#B5B5F3] px-3 py-1 text-xs font-medium text-[#000080]">
              {s.name}
              <button type="button" aria-label={`Remove ${s.name}`} onClick={() => onChange(value.filter((x) => x.id !== s.id))}><X className="h-3 w-3" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
