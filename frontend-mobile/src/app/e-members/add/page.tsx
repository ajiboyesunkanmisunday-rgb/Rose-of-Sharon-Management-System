"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import StickySave from "@/components/ui/StickySave";
import { Field, inputClass } from "@/components/ui/Field";

export default function AddEMemberPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => router.push("/e-members"), 400);
  };

  return (
    <AppShell title="Add E-Member" showBack hideTabBar>
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
        <Field label="Country">
          <input required className={inputClass} placeholder="Ghana" />
        </Field>
        <Field label="Email">
          <input type="email" required className={inputClass} placeholder="john@example.com" />
        </Field>
        <Field label="Phone">
          <input required className={inputClass} placeholder="+233 24 555 1122" />
        </Field>
        <Field label="Date of birth">
          <input type="date" className={inputClass} />
        </Field>
        <Field label="Marital status">
          <select className={inputClass} defaultValue="">
            <option value="" disabled>
              Select...
            </option>
            <option>Single</option>
            <option>Married</option>
          </select>
        </Field>
        <Field label="Service attended">
          <select className={inputClass} defaultValue="Sunday">
            <option>Sunday</option>
            <option>Wednesday</option>
            <option>Friday</option>
            <option>Special Service</option>
          </select>
        </Field>
        <StickySave disabled={saving} label={saving ? "Saving..." : "Save e-member"} />
      </form>
    </AppShell>
  );
}
