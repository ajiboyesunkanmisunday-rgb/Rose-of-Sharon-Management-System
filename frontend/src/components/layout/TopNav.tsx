"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Menu, Bell, Search, X, Users, CalendarClock, UserPlus, Sun, Moon } from "lucide-react";
import { getStoredUser, setStoredUser, getUser, logoutUser, searchMembers, searchEvents, type StoredUser } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";

// ── Notification unread count ──────────────────────────────────────────────
// Derived from the mock notification data (4 unread items in the notifications page)
const MOCK_UNREAD = 4;

// ── Recent searches — localStorage key ─────────────────────────────────────
const RECENT_KEY = "rosms-recent-searches";

interface SearchResult {
  id: string;
  label: string;
  sub: string;
  href: string;
  kind: "member" | "event" | "firsttimer";
}

interface TopNavProps {
  onMenuOpen?: () => void;
}

export default function TopNav({ onMenuOpen }: TopNavProps) {
  const router = useRouter();
  const { isDark, toggle: toggleTheme } = useTheme();
  const { sidebarWidth } = useSidebar();

  // ── User state ─────────────────────────────────────────────────────────────
  const [user, setUser] = useState<StoredUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);

    // If the stored user has no photo URL, silently fetch their full profile
    // from the API and backfill it into localStorage so the avatar shows.
    // This handles users who logged in before profilePictureUrl was persisted.
    if (stored?.id && !stored.profilePictureUrl &&
        !stored.id.startsWith("mock-") && !stored.id.startsWith("session_")) {
      getUser(stored.id)
        .then((profile) => {
          if (profile.profilePictureUrl) {
            const updated = { ...stored, profilePictureUrl: profile.profilePictureUrl };
            setStoredUser(updated);
            setUser(updated);
          }
        })
        .catch(() => { /* non-critical — silently ignore */ });
    }
  }, []);

  const displayName  = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email || "User" : "—";
  const displayEmail = user?.email ?? "";
  const photoUrl     = user?.profilePictureUrl;

  // ── Global search state ────────────────────────────────────────────────────
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecentSearches(JSON.parse(raw) as string[]);
    } catch { /* ignore */ }
  }, []);

  const saveRecent = useCallback((q: string) => {
    if (!q.trim()) return;
    setRecentSearches((prev) => {
      const next = [q.trim(), ...prev.filter((r) => r !== q.trim())].slice(0, 3);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const [mems, evts] = await Promise.allSettled([
        searchMembers(q.trim(), 0, 4),
        searchEvents(q.trim(), 0, 3),
      ]);
      const results: SearchResult[] = [];

      if (mems.status === "fulfilled") {
        (mems.value.content ?? []).forEach((m) => {
          const name = [m.firstName, m.lastName].filter(Boolean).join(" ") || "—";
          results.push({ id: m.id, label: name, sub: m.email ?? "Member", href: `/user-management/members/${m.id}`, kind: "member" });
        });
      }
      if (evts.status === "fulfilled") {
        (evts.value.content ?? []).forEach((e) => {
          results.push({ id: e.id, label: e.title, sub: e.date ?? "Event", href: `/event-management/${e.id}`, kind: "event" });
        });
      }
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!searchQuery.trim()) { setSearchResults([]); setSearchLoading(false); return; }
    setSearchLoading(true);
    searchTimer.current = setTimeout(() => doSearch(searchQuery), 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery, doSearch]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const kindIcon = (kind: SearchResult["kind"]) => {
    if (kind === "event") return <CalendarClock className="h-4 w-4 text-purple-500 shrink-0" />;
    if (kind === "firsttimer") return <UserPlus className="h-4 w-4 text-orange-500 shrink-0" />;
    return <Users className="h-4 w-4 text-[#000080] dark:text-indigo-400 shrink-0" />;
  };

  // Also add ⌘K / Ctrl+K keyboard shortcut to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <header
      className="fixed right-0 top-0 z-30 flex h-16 items-center border-b border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-900 px-4 gap-3 lg:px-6"
      style={{ left: `max(0px, ${sidebarWidth}px)`, transition: "left 0.3s ease" }}
    >

      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuOpen}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#000080] dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-slate-800 lg:hidden shrink-0"
        aria-label="Open menu"
      >
        <Menu size={22} strokeWidth={1.8} />
      </button>

      {/* ── Global Search ───────────────────────────────────────────────────── */}
      <div ref={searchRef} className="relative flex-1 max-w-xs sm:max-w-sm">
        {searchOpen ? (
          <div className="flex items-center gap-2 rounded-lg border border-[#000080] dark:border-indigo-500 bg-white dark:bg-slate-800 px-3 py-1.5 shadow-sm">
            <Search className="h-4 w-4 text-[#6B7280] dark:text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members, events…"
              className="flex-1 text-sm text-[#111827] dark:text-slate-100 outline-none placeholder:text-[#9CA3AF] dark:placeholder:text-slate-500 bg-transparent min-w-0"
            />
            <button onClick={() => { if (searchQuery.trim()) saveRecent(searchQuery); setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}>
              <X className="h-4 w-4 text-[#9CA3AF] dark:text-slate-500 hover:text-[#374151] dark:hover:text-slate-300" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] dark:bg-slate-800 px-3 py-1.5 text-sm text-[#9CA3AF] dark:text-slate-500 hover:border-[#000080] dark:hover:border-indigo-500 hover:text-[#374151] dark:hover:text-slate-300 transition-colors w-full"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Search…</span>
            <span className="hidden sm:inline ml-auto text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 px-1.5 py-0.5 rounded font-mono">⌘K</span>
          </button>
        )}

        {/* Search dropdown — recent searches or live results */}
        {searchOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg dark:shadow-slate-900">
            {/* No query → show recent searches */}
            {!searchQuery.trim() && recentSearches.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] dark:text-slate-500">Recent</p>
                {recentSearches.map((r) => (
                  <button
                    key={r}
                    onClick={() => setSearchQuery(r)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-[#F9FAFB] dark:hover:bg-slate-700 transition-colors"
                  >
                    <Search className="h-3.5 w-3.5 text-[#9CA3AF] dark:text-slate-500 shrink-0" />
                    <span className="text-sm text-[#374151] dark:text-slate-300">{r}</span>
                  </button>
                ))}
              </div>
            )}
            {/* Live results */}
            {searchQuery.trim().length > 0 && (
              searchLoading ? (
                <div className="px-4 py-3 text-sm text-[#9CA3AF] dark:text-slate-500 text-center">Searching…</div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-[#9CA3AF] dark:text-slate-500 text-center">No results for &ldquo;{searchQuery}&rdquo;</div>
              ) : (
                searchResults.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { saveRecent(searchQuery); router.push(r.href); setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F9FAFB] dark:hover:bg-slate-700 transition-colors"
                  >
                    {kindIcon(r.kind)}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#111827] dark:text-slate-100 truncate">{r.label}</p>
                      <p className="text-xs text-[#9CA3AF] dark:text-slate-500 truncate">{r.sub}</p>
                    </div>
                  </button>
                ))
              )
            )}
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Dark / Light Toggle ─────────────────────────────────────────────── */}
      <button
        onClick={toggleTheme}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Light mode" : "Dark mode"}
      >
        {isDark ? (
          <Sun size={18} strokeWidth={1.8} className="text-amber-400" />
        ) : (
          <Moon size={18} strokeWidth={1.8} />
        )}
      </button>

      {/* ── Notification Bell ───────────────────────────────────────────────── */}
      <button
        onClick={() => router.push("/notifications")}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#000080] dark:text-indigo-400 hover:bg-[#EEF2FF] dark:hover:bg-slate-800 transition-colors shrink-0"
        aria-label="Notifications"
      >
        <Bell size={20} strokeWidth={1.8} />
        {MOCK_UNREAD > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
            {MOCK_UNREAD > 9 ? "9+" : MOCK_UNREAD}
          </span>
        )}
      </button>

      {/* ── User Profile ────────────────────────────────────────────────────── */}
      <div className="relative shrink-0">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
        >
          {/* Name + email — hidden on small screens */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#1F2937] dark:text-slate-100 leading-tight">{displayName}</p>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 leading-tight">{displayEmail}</p>
          </div>

          {/* Avatar — photo thumbnail if available, grey user icon otherwise */}
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={displayName}
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-slate-700"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center ring-2 ring-white dark:ring-slate-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#94a3b8" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}

          <ChevronDown className={`h-4 w-4 text-gray-400 dark:text-slate-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-1 w-48 max-w-[calc(100vw-1rem)] rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 shadow-lg dark:shadow-slate-900">
              <button onClick={() => { setDropdownOpen(false); router.push("/profile"); }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700">
                My Profile
              </button>
              <button onClick={() => { setDropdownOpen(false); router.push("/settings/general"); }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700">
                Settings
              </button>
              <hr className="my-1 border-gray-100 dark:border-slate-700" />
              <button onClick={() => { setDropdownOpen(false); logoutUser(); }}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-slate-700">
                Log Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
