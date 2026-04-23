"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";

const CATEGORIES = ["Counseling", "Prayer", "Complaint", "Suggestion"] as const;
const INPUT =
  "w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#000080]";

export default function AddRequestPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Prayer");
  const [submittedBy, setSubmittedBy] = useState("");
  const [content, setContent] = useState("");

  return (
    <AppShell title="Add Request" showBack hideTabBar>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/requests");
        }}
        className="space-y-4"
      >
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={INPUT}
            placeholder="Brief summary"
            required
          />
        </Field>

        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
            className={INPUT}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Submitted By">
          <input
            value={submittedBy}
            onChange={(e) => setSubmittedBy(e.target.value)}
            className={INPUT}
            placeholder="Name"
            required
          />
        </Field>

        <Field label="Details">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`${INPUT} min-h-[140px]`}
            placeholder="Describe the request..."
            required
          />
        </Field>

        <div className="sticky bottom-4 pt-2">
          <button
            type="submit"
            className="press w-full rounded-xl bg-[#000080] py-3.5 text-sm font-semibold text-white"
          >
            Save Request
          </button>
        </div>
      </form>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#374151]">{label}</span>
      {children}
    </label>
  );
}
