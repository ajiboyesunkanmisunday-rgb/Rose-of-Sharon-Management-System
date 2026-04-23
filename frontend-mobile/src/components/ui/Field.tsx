import React from "react";

interface FieldProps {
  label: string;
  helper?: string;
  children: React.ReactNode;
}

export function Field({ label, helper, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[#374151]">{label}</span>
      {children}
      {helper && <span className="mt-1 block text-[11px] text-[#6B7280]">{helper}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm text-[#0F172A] outline-none focus:border-[#000080]";
