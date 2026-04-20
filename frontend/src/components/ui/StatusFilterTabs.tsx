"use client";

import React from "react";

interface StatusFilterTabsProps<T extends string> {
  options: { value: T; label: string; count?: number }[];
  active: T;
  onChange: (value: T) => void;
  className?: string;
}

export default function StatusFilterTabs<T extends string>({
  options,
  active,
  onChange,
  className = "",
}: StatusFilterTabsProps<T>) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {options.map((opt) => {
        const isActive = opt.value === active;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "border-[#000080] bg-[#000080] text-white"
                : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#000080] hover:text-[#000080]"
            }`}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={`ml-2 ${isActive ? "text-white/80" : "text-[#9CA3AF]"}`}>
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
