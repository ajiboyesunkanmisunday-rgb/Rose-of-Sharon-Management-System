"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";

export default function AddEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    topic: "",
    category: "Service",
    type: "Physical",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    capacity: "",
    description: "",
    requiresRegistration: false,
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/events");
  };

  return (
    <AppShell title="Create Event" showBack hideTabBar>
      <form onSubmit={submit} className="space-y-4 pb-24">
        <Field label="Event Name" value={form.name} onChange={(v) => update("name", v)} placeholder="e.g. Sunday Worship" />
        <Field label="Topic" value={form.topic} onChange={(v) => update("topic", v)} placeholder="Optional topic" />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Category"
            value={form.category}
            onChange={(v) => update("category", v)}
            options={["Service", "Conference", "Training", "Social", "Wedding", "Funeral", "Outreach"]}
          />
          <Select
            label="Type"
            value={form.type}
            onChange={(v) => update("type", v)}
            options={["Physical", "Virtual", "Hybrid"]}
          />
        </div>

        <Field label="Date" type="date" value={form.date} onChange={(v) => update("date", v)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Time" type="time" value={form.startTime} onChange={(v) => update("startTime", v)} />
          <Field label="End Time" type="time" value={form.endTime} onChange={(v) => update("endTime", v)} />
        </div>

        <Field label="Location" value={form.location} onChange={(v) => update("location", v)} placeholder="Main Auditorium" />
        <Field label="Capacity" type="number" value={form.capacity} onChange={(v) => update("capacity", v)} placeholder="e.g. 300" />

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[#374151]">Description</span>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm text-[#0F172A] outline-none focus:border-[#000080]"
            placeholder="Brief description of the event..."
          />
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3">
          <input
            type="checkbox"
            checked={form.requiresRegistration}
            onChange={(e) => update("requiresRegistration", e.target.checked)}
            className="h-4 w-4 rounded border-[#E5E7EB] accent-[#000080]"
          />
          <span className="text-sm text-[#374151]">Requires Registration</span>
        </label>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
          <button type="submit" className="press w-full rounded-xl bg-[#000080] py-3.5 text-sm font-semibold text-white">
            Create Event
          </button>
        </div>
      </form>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[#374151]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
