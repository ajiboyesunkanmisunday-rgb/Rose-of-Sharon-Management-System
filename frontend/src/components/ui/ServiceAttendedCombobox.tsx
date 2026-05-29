"use client";

/**
 * ServiceAttendedCombobox
 *
 * Searchable combobox that fetches real service/event names from the backend
 * and lets the user pick one as a filter value.
 *
 * - On open: loads the 50 most recent events
 * - On type: debounced search via searchEvents()
 * - Shows event title + date in the dropdown
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { getEvents, searchEvents, type EventResponse } from "@/lib/api";
import { ChevronDown, X } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fmtDate(s?: any): string {
  if (!s) return "";
  if (Array.isArray(s)) {
    const [year, month, day] = s as number[];
    return new Date(year, month - 1, day).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  const d = new Date(s as string);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ServiceAttendedCombobox({ value, onChange }: Props) {
  const [query,   setQuery]   = useState(value);
  const [options, setOptions] = useState<EventResponse[]>([]);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef  = useRef<HTMLDivElement>(null);
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoaded = useRef(false);

  /* ── Load initial (most recent 50 events) ─────────────────────────────── */
  const loadInitial = useCallback(async () => {
    if (initialLoaded.current) return;
    setLoading(true);
    try {
      const res = await getEvents(0, 50);
      setOptions(res.content ?? []);
      initialLoaded.current = true;
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Debounced API search ─────────────────────────────────────────────── */
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      // Reset to initial list
      initialLoaded.current = false;
      loadInitial();
      return;
    }
    setLoading(true);
    try {
      const res = await searchEvents(q.trim(), 0, 50);
      setOptions(res.content ?? []);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [loadInitial]);

  /* ── Keep local query in sync when parent clears the value ──────────── */
  useEffect(() => {
    setQuery(value);
  }, [value]);

  /* ── Open handler ─────────────────────────────────────────────────────── */
  const handleFocus = () => {
    setOpen(true);
    loadInitial();
  };

  /* ── Type handler (debounced search) ─────────────────────────────────── */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(v), 300);
  };

  /* ── Select an option ─────────────────────────────────────────────────── */
  const handleSelect = (title: string) => {
    setQuery(title);
    onChange(title);
    setOpen(false);
  };

  /* ── Clear ────────────────────────────────────────────────────────────── */
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery("");
    onChange("");
    setOpen(false);
  };

  /* ── Close on outside click ───────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        // If user typed something but didn't select, revert to committed value
        setQuery(value);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [value]);

  /* ── Client-side filter on already-loaded options ─────────────────────── */
  const displayed = query.trim()
    ? options.filter((o) => o.title.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div ref={containerRef} className="relative w-56">
      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onFocus={handleFocus}
          onChange={handleChange}
          placeholder="Search services…"
          className="h-[42px] w-full rounded-lg border border-[#E5E7EB] dark:border-slate-600 bg-white dark:bg-slate-700 px-3 pr-8 py-2 text-sm text-[#374151] dark:text-slate-100 outline-none focus:border-[#000080] dark:focus:border-indigo-500 focus:ring-1 focus:ring-[#000080] dark:focus:ring-indigo-500 placeholder:text-gray-400 dark:placeholder:text-slate-500"
        />
        {query ? (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
          >
            <X size={14} />
          </button>
        ) : (
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
          />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#E5E7EB] dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg max-h-52 overflow-y-auto">
          {loading ? (
            <div className="px-3 py-2 text-xs text-gray-400 dark:text-slate-500">Loading services…</div>
          ) : displayed.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400 dark:text-slate-500">No services found</div>
          ) : (
            <>
              {/* "All Services" clear option */}
              <button
                onMouseDown={() => handleSelect("")}
                className="w-full px-3 py-2 text-left text-sm text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/60 border-b border-[#F3F4F6] dark:border-slate-700"
              >
                All Services
              </button>

              {displayed.map((o) => (
                <button
                  key={o.id}
                  onMouseDown={() => handleSelect(o.title)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-slate-700/60 border-b border-[#F3F4F6] dark:border-slate-700 last:border-0"
                >
                  <span className="block text-sm font-medium text-[#374151] dark:text-slate-200 truncate">
                    {o.title}
                  </span>
                  {o.date && (
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                      {fmtDate(o.date)}
                    </span>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
