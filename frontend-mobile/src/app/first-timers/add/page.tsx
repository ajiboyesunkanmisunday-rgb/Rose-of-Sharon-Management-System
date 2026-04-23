"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import StickySave from "@/components/ui/StickySave";
import { Field, inputClass } from "@/components/ui/Field";
import { followUpOfficers } from "@/lib/mock-data";

export default function AddFirstTimerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => router.push("/first-timers"), 400);
  };

  return (
    <AppShell title="Add First Timer" showBack hideTabBar>
      <form onSubmit={onSubmit} className="space-y-4 pb-28">
        <Field label="First name">
          <input required className={inputClass} placeholder="John" />
        </Field>
        <Field label="Last name">
          <input required className={inputClass} placeholder="Michael" />
        </Field>
        <Field label="Gender">
          <select className={inputClass} defaultValue="">
            <option value="" disabled>
              Select...
            </option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </Field>
        <Field label="Email">
          <input type="email" required className={inputClass} placeholder="john@example.com" />
        </Field>
        <Field label="Phone">
          <input required className={inputClass} placeholder="+234 801 123 4567" />
        </Field>
        <Field label="Marital status">
          <select className={inputClass} defaultValue="Single">
            <option>Single</option>
            <option>Married</option>
          </select>
        </Field>
        <Field label="Service attended">
          <select className={inputClass} defaultValue="Sunday Service">
            <option>Sunday Service</option>
            <option>Wednesday Service</option>
            <option>Friday Service</option>
            <option>Special Service</option>
          </select>
        </Field>
        <Field label="Visit date">
          <input type="date" className={inputClass} />
        </Field>
        <Field label="Assigned follow-up officer">
          <select className={inputClass} defaultValue="">
            <option value="" disabled>
              Select officer...
            </option>
            {followUpOfficers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} — {o.department}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Worshipped online before?">
          <select className={inputClass} defaultValue="No">
            <option>No</option>
            <option>Yes</option>
          </select>
        </Field>
        <StickySave disabled={saving} label={saving ? "Saving..." : "Save first timer"} />
      </form>
    </AppShell>
  );
}
