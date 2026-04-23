import React from "react";

interface DetailSectionProps {
  title: string;
  rows: Array<{ label: string; value?: React.ReactNode }>;
}

export default function DetailSection({ title, rows }: DetailSectionProps) {
  const visible = rows.filter((r) => r.value !== undefined && r.value !== null && r.value !== "");
  if (!visible.length) return null;
  return (
    <section className="mb-4 rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{title}</h3>
      <dl className="space-y-2.5">
        {visible.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-3">
            <dt className="text-xs text-[#6B7280]">{r.label}</dt>
            <dd className="max-w-[60%] text-right text-sm font-medium text-[#0F172A]">
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
