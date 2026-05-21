"use client";

import { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Search, X } from "lucide-react";

type StringOption = string;
type ObjectOption = { label: string; value: string };
type SelectOption = StringOption | ObjectOption;

function optionLabel(o: SelectOption): string {
  return typeof o === "string" ? o : o.label;
}
function optionValue(o: SelectOption): string {
  return typeof o === "string" ? o : o.value;
}

interface SearchableSelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  /** Accept either string[] or {label,value}[] */
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export default function SearchableSelect({
  label,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  options,
  value,
  onChange,
  required,
  className = "",
}: SearchableSelectProps) {
  const id = useId();
  const [open,   setOpen]   = useState(false);
  const [query,  setQuery]  = useState("");
  const containerRef        = useRef<HTMLDivElement>(null);
  const searchRef           = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const filtered = query.trim()
    ? options.filter((o) => optionLabel(o).toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  // Find the display label for the current value
  const displayLabel = value
    ? (options.find((o) => optionValue(o) === value)
        ? optionLabel(options.find((o) => optionValue(o) === value)!)
        : value)
    : "";

  const handleSelect = (option: SelectOption) => {
    onChange(optionValue(option));
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      {/* Trigger button */}
      <button
        id={id}
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm outline-none transition-colors ${
          open
            ? "border-[#000080] ring-1 ring-[#000080]"
            : "border-[#E5E7EB] dark:border-slate-700 hover:border-[#9CA3AF]"
        } bg-white dark:bg-slate-800 text-left`}
      >
        <span className={displayLabel ? "text-[#374151] dark:text-slate-300" : "text-[#9CA3AF] dark:text-slate-400"}>
          {displayLabel || placeholder}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {value && (
            <span
              onClick={handleClear}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)}
              className="rounded p-0.5 text-[#9CA3AF] dark:text-slate-400 hover:text-[#374151] dark:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-[#9CA3AF] dark:text-slate-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-[#F3F4F6] px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-[#9CA3AF] dark:text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-sm text-[#374151] dark:text-slate-300 outline-none placeholder:text-[#9CA3AF] dark:text-slate-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-[#9CA3AF] dark:text-slate-400 hover:text-[#374151] dark:text-slate-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Options list — max height 220px, scrollable */}
          <ul
            className="max-h-[220px] overflow-y-auto py-1"
            role="listbox"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-center text-xs text-[#9CA3AF] dark:text-slate-400">
                No results for &ldquo;{query}&rdquo;
              </li>
            ) : (
              filtered.map((option) => {
                const val = optionValue(option);
                const lbl = optionLabel(option);
                return (
                  <li
                    key={val}
                    role="option"
                    aria-selected={value === val}
                    onClick={() => handleSelect(option)}
                    className={`cursor-pointer px-4 py-2.5 text-sm transition-colors ${
                      value === val
                        ? "bg-[#EFF6FF] font-medium text-[#000080] dark:text-indigo-400"
                        : "text-[#374151] dark:text-slate-300 hover:bg-[#F9FAFB]"
                    }`}
                  >
                    {lbl}
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer hint */}
          <div className="border-t border-[#F3F4F6] px-3 py-1.5 text-center text-[10px] text-[#9CA3AF] dark:text-slate-400">
            {filtered.length} of {options.length} options
          </div>
        </div>
      )}
    </div>
  );
}
