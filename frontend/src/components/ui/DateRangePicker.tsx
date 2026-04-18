"use client";

import React from "react";

interface DateRangePickerProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  fromLabel?: string;
  toLabel?: string;
  className?: string;
}

export default function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  fromLabel = "From",
  toLabel = "To",
  className = "",
}: DateRangePickerProps) {
  const inputStyles =
    "rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

  return (
    <div className={`flex flex-wrap items-end gap-3 ${className}`}>
      <div>
        <label className="mb-1 block text-xs font-medium text-[#6B7280]">
          {fromLabel}
        </label>
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className={inputStyles}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[#6B7280]">
          {toLabel}
        </label>
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className={inputStyles}
        />
      </div>
    </div>
  );
}
