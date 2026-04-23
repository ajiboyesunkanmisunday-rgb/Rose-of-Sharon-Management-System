"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";

const AUDIENCES = ["All Members", "Workers", "Choir", "Ushering", "Youth", "Children"] as const;
const STATUSES = ["Draft", "Scheduled", "Published"] as const;
const INPUT =
  "w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#000080]";

export default function AddAnnouncementPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]>("All Members");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("Draft");
  const [date, setDate] = useState("");

  return (
    <AppShell title="New Announcement" showBack hideTabBar>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/announcements");
        }}
        className="space-y-4"
      >
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={INPUT}
            placeholder="Announcement title"
            required
          />
        </Field>

        <Field label="Body">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={`${INPUT} min-h-[140px]`}
            placeholder="Write the announcement..."
            required
          />
        </Field>

        <Field label="Audience">
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as (typeof AUDIENCES)[number])}
            className={INPUT}
          >
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}
            className={INPUT}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Scheduled Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={INPUT}
          />
        </Field>

        <div className="sticky bottom-4 pt-2">
          <button
            type="submit"
            className="press w-full rounded-xl bg-[#000080] py-3.5 text-sm font-semibold text-white"
          >
            Save Announcement
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
