"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";

const TYPES = ["Birthday", "Wedding Anniversary", "Thanksgiving", "Child Dedication"] as const;
const INPUT =
  "w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#000080]";

export default function AddCelebrationPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("Birthday");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <AppShell title="Add Celebration" showBack hideTabBar>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/celebrations");
        }}
        className="space-y-4"
      >
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT}
            placeholder="Full name"
            required
          />
        </Field>

        <Field label="Type">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}
            className={INPUT}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={INPUT}
            required
          />
        </Field>

        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${INPUT} min-h-[100px]`}
            placeholder="Optional notes"
          />
        </Field>

        <div className="sticky bottom-4 pt-2">
          <button
            type="submit"
            className="press w-full rounded-xl bg-[#000080] py-3.5 text-sm font-semibold text-white"
          >
            Save Celebration
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
