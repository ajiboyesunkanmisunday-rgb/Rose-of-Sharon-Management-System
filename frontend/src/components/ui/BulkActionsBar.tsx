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
    <div className="mb-3 flex items-center justify-between rounded-lg border border-[#B5B5F3] bg-[#F5F5FC] px-4 py-2.5 text-sm">
      <span className="font-medium text-[#000080]">
        {count} {label} selected
      </span>
      <div className="flex items-center gap-3">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className={`font-medium transition-colors ${
              a.variant === "danger"
                ? "text-red-600 hover:text-red-700"
                : "text-[#000080] hover:text-[#000066]"
            }`}
          >
            {a.label}
          </button>
        ))}
        <button
          onClick={onClear}
          className="ml-2 text-xs text-[#6B7280] underline transition-colors hover:text-[#374151]"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
