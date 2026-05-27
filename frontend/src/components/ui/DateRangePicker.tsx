"use client";

import React from "react";

interface DateRangePickerProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  className?: string;
}

export default function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  className = "",
}: DateRangePickerProps) {
  // Matches SearchBar: py-3 px-4 rounded-full border text-sm
  const inputStyles =
    "w-full rounded-full border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-gray-700 dark:text-slate-300 outline-none placeholder:text-gray-400 dark:text-slate-500 focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

  // Compute today's ISO date string (YYYY-MM-DD) for max constraints
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="date"
        value={from}
        max={today}
        onChange={(e) => onFromChange(e.target.value)}
        className={inputStyles}
      />
      <span className="shrink-0 text-xs text-[#9CA3AF] dark:text-slate-400">—</span>
      <input
        type="date"
        value={to}
        min={from || undefined}
        max={today}
        onChange={(e) => onToChange(e.target.value)}
        className={inputStyles}
      />
    </div>
  );
}
