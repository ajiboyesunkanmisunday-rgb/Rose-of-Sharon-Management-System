"use client";

import React from "react";

interface BulkAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface BulkActionsBarProps {
  count: number;
  actions: BulkAction[];
  onClear: () => void;
  labelSingular?: string;
  labelPlural?: string;
}

export default function BulkActionsBar({
  count,
  actions,
  onClear,
  labelSingular = "item",
  labelPlural = "items",
}: BulkActionsBarProps) {
  if (count === 0) return null;
  const label = count === 1 ? labelSingular : labelPlural;

  return (
    <div className="mb-3 flex items-center justify-between rounded-lg border border-[#B5B5F3] dark:border-indigo-800 bg-[#F5F5FC] dark:bg-indigo-950/40 px-4 py-2.5 text-sm">
      <span className="font-medium text-[#000080] dark:text-indigo-300">
        {count} {label} selected
      </span>
      <div className="flex items-center gap-3">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className={`font-medium transition-colors ${
              a.variant === "danger"
                ? "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                : "text-[#000080] dark:text-indigo-400 hover:text-[#000066] dark:hover:text-indigo-300"
            }`}
          >
            {a.label}
          </button>
        ))}
        <button
          onClick={onClear}
          className="ml-2 text-xs text-[#6B7280] dark:text-slate-400 dark:text-slate-500 underline transition-colors hover:text-[#374151] dark:text-slate-300 dark:hover:text-slate-300"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
