"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

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
 * Dropdown-style multi-select with a built-in search box.
 * The panel is capped at 220px height and scrollable — no more
 * full-screen option floods. Selected values show as chips.
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
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef    = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus search when opened
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  const toggleOption = (opt: string) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  };

  const removeOption = (opt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== opt));
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-[#374151]">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex min-h-[46px] w-full items-center justify-between rounded-lg border bg-white px-4 py-2 text-sm text-[#374151] outline-none transition-colors ${
          open ? "border-[#000080] ring-1 ring-[#000080]" : "border-[#E5E7EB] hover:border-[#9CA3AF]"
        }`}
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
                  onClick={(e) => removeOption(v, e)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange(value.filter((x) => x !== v));
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
        <ChevronDown
          className={`ml-2 h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-[#E5E7EB] bg-white shadow-xl"
          style={{ minWidth: "100%", maxWidth: "100%" }}
        >
          {/* Search row */}
          <div className="flex items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search groups…"
              className="flex-1 bg-transparent text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF]"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="text-[#9CA3AF] hover:text-[#374151]">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Options — fixed max height, scrollable */}
          <ul className="max-h-[220px] overflow-y-auto py-1" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-center text-xs text-[#9CA3AF]">
                No results for &ldquo;{query}&rdquo;
              </li>
            ) : (
              filtered.map((opt) => {
                const selected = value.includes(opt);
                return (
                  <li
                    key={opt}
                    role="option"
                    aria-selected={selected}
                    onClick={() => toggleOption(opt)}
                    className={`flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                      selected ? "bg-[#EFF6FF] font-medium text-[#000080]" : "text-[#374151] hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <span>{opt}</span>
                    {selected && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer */}
          <div className="border-t border-[#F3F4F6] px-3 py-1.5 text-center text-[10px] text-[#9CA3AF]">
            {value.length > 0 ? `${value.length} selected · ` : ""}{filtered.length} of {options.length} groups
          </div>
        </div>
      )}

      {/* Hidden input for form reading */}
      {name && <input type="hidden" name={name} value={value.join(",")} />}
    </div>
  );
}
