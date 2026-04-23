"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import StickySave from "@/components/ui/StickySave";
import { Field, inputClass } from "@/components/ui/Field";

export default function AddMemberPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => router.push("/members"), 400);
  };

  return (
    <AppShell title="Add Member" showBack hideTabBar>
      <form onSubmit={onSubmit} className="space-y-4 pb-28">
        <Field label="First name">
          <input required className={inputClass} placeholder="John" />
        </Field>
        <Field label="Middle name">
          <input className={inputClass} placeholder="(optional)" />
        </Field>
        <Field label="Last name">
          <input required className={inputClass} placeholder="Michael" />
        </Field>
        <Field label="Email">
          <input type="email" required className={inputClass} placeholder="john@example.com" />
        </Field>
        <Field label="Phone" helper="Include country code for international numbers">
          <input required className={inputClass} placeholder="+234 801 123 4567" />
        </Field>
        <Field label="Department">
          <input className={inputClass} placeholder="e.g. Choir, Ushering" />
        </Field>
        <Field label="Marital status">
          <select className={inputClass} defaultValue="">
            <option value="" disabled>
              Select...
            </option>
            <option>Single</option>
            <option>Married</option>
            <option>Divorced</option>
            <option>Widowed</option>
          </select>
        </Field>
        <StickySave disabled={saving} label={saving ? "Saving..." : "Save member"} />
      </form>
    </AppShell>
  );
}
