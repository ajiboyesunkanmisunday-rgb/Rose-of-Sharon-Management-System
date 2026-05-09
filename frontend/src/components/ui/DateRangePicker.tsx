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
    "w-full rounded-full border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        className={inputStyles}
      />
      <span className="shrink-0 text-xs text-[#9CA3AF]">—</span>
      <input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        className={inputStyles}
      />
    </div>
  );
}
