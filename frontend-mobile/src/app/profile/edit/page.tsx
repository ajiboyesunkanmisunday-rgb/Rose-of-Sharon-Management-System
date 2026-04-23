"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import { profileDetails } from "@/lib/mock-data";

export default function EditProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ ...profileDetails });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/profile");
  };

  return (
    <AppShell title="Edit Profile" showBack hideTabBar>
      <form onSubmit={handleSave} className="space-y-4 pb-20">
        <Field label="First Name" value={form.firstName} onChange={(v) => update("firstName", v)} />
        <Field label="Last Name" value={form.lastName} onChange={(v) => update("lastName", v)} />
        <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} />
        <Field label="Phone Number" value={form.phoneNumber} onChange={(v) => update("phoneNumber", v)} />
        <Field label="WhatsApp Number" value={form.whatsappNumber} onChange={(v) => update("whatsappNumber", v)} />
        <Field label="Address" value={form.address} onChange={(v) => update("address", v)} />
        <Select
          label="Gender"
          value={form.gender}
          onChange={(v) => update("gender", v)}
          options={["Male", "Female"]}
        />
        <Field label="Date of Birth" value={form.dateOfBirth} onChange={(v) => update("dateOfBirth", v)} />
        <Select
          label="Marital Status"
          value={form.maritalStatus}
          onChange={(v) => update("maritalStatus", v)}
          options={["Single", "Married", "Divorced", "Widowed"]}
        />
        <Field label="Occupation" value={form.occupation} onChange={(v) => update("occupation", v)} />
        <Field label="Group" value={form.group} onChange={(v) => update("group", v)} />

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
          <button
            type="submit"
            className="press w-full rounded-xl bg-[#000080] py-3.5 text-sm font-semibold text-white"
          >
            Save Changes
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[#374151]">{label}</span>
      <input
        type={type}
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
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
