"use client";

import { useState } from "react";
import AppShell from "@/components/shell/AppShell";

export default function GeneralSettingsPage() {
  const [churchName, setChurchName] = useState("RCCG Rose of Sharon");
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("Africa/Lagos");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

  return (
    <AppShell title="General" showBack hideTabBar>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="space-y-4 pb-20"
      >
        <Field label="Church Name" value={churchName} onChange={setChurchName} />
        <Select
          label="Language"
          value={language}
          onChange={setLanguage}
          options={["English", "French", "Yoruba", "Igbo", "Hausa"]}
        />
        <Select
          label="Timezone"
          value={timezone}
          onChange={setTimezone}
          options={["Africa/Lagos", "Africa/Accra", "Europe/London", "America/New_York"]}
        />
        <Select
          label="Date Format"
          value={dateFormat}
          onChange={setDateFormat}
          options={["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]}
        />

        <SaveBar />
      </form>
    </AppShell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[#374151]">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm text-[#0F172A] outline-none focus:border-[#000080]"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[#374151]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm text-[#0F172A] outline-none focus:border-[#000080]"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function SaveBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
      <button type="submit" className="press w-full rounded-xl bg-[#000080] py-3.5 text-sm font-semibold text-white">
        Save Changes
      </button>
    </div>
  );
}
