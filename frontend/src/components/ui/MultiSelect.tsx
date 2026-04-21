"use client";

import React, { useEffect, useRef, useState } from "react";

interface MultiSelectProps {
  label?: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  name?: string;
}

/**
 * Dropdown-style multi-select. Trigger looks like a native <select>;
 * opens a popover panel where each option can be toggled. Selected
 * values are rendered as removable chips inside the trigger.
 */
export default function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select",
  required,
  className = "",
  name,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const toggleOption = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  const removeOption = (opt: string) => {
    onChange(value.filter((v) => v !== opt));
  };

  return (
    <div className={className} ref={containerRef}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-[#374151]">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      {/* Trigger — styled like a select */}
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-[46px] w-full items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 pr-10 text-sm text-[#374151] outline-none transition-colors focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
        >
          <span className="flex flex-1 flex-wrap items-center gap-1 text-left">
            {value.length === 0 ? (
              <span className="text-[#9CA3AF]">{placeholder}</span>
            ) : (
              value.map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center gap-1 rounded-full bg-[#B5B5F3]/30 px-2 py-0.5 text-xs font-medium text-[#000080]"
                >
                  {v}
                  <span
                    role="button"
                    aria-label={`Remove ${v}`}
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(v);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        removeOption(v);
                      }
                    }}
                    className="ml-0.5 cursor-pointer text-[#000080] hover:text-[#000066]"
                  >
                    ×
                  </span>
                </span>
              ))
            )}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Dropdown panel */}
        {open && (
          <div className="absolute left-0 right-0 z-30 mt-1 max-h-60 overflow-auto rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg">
            {options.map((opt) => {
              const selected = value.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleOption(opt)}
                  className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors ${
                    selected
                      ? "bg-[#B5B5F3]/20 text-[#000080]"
                      : "text-[#374151] hover:bg-[#F3F4F6]"
                  }`}
                >
                  <span>{opt}</span>
                  {selected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Hidden input so selected values can be read from the form if needed */}
      {name && (
        <input type="hidden" name={name} value={value.join(",")} />
      )}
    </div>
  );
}
