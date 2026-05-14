"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Menu, Bell, Search, X, Users, CalendarClock, UserPlus } from "lucide-react";
import { getStoredUser, logoutUser, searchMembers, searchEvents, type StoredUser } from "@/lib/api";

// ── Notification badge count (reads from localStorage, synced with notifications page) ──
const MOCK_UNREAD = 5; // matches the mock unread count in notifications page

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

  // ── User state ─────────────────────────────────────────────────────────────
  const [user, setUser] = useState<StoredUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => { setUser(getStoredUser()); }, []);

  const displayName  = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email || "User" : "—";
  const displayEmail = user?.email ?? "";
  const initials     = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "?";
  const photoUrl     = (user as (StoredUser & { profilePictureUrl?: string }) | null)?.profilePictureUrl;

  // ── Global search state ────────────────────────────────────────────────────
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    return <Users className="h-4 w-4 text-[#000080] shrink-0" />;
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center border-b border-[#E5E7EB] bg-white px-4 gap-3 lg:left-[272px] lg:px-6">

      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuOpen}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#000080] hover:bg-gray-100 lg:hidden shrink-0"
        aria-label="Open menu"
      >
        <Menu size={22} strokeWidth={1.8} />
      </button>

      {/* ── Global Search ───────────────────────────────────────────────────── */}
      <div ref={searchRef} className="relative flex-1 max-w-xs sm:max-w-sm">
        {searchOpen ? (
          <div className="flex items-center gap-2 rounded-lg border border-[#000080] bg-white px-3 py-1.5 shadow-sm">
            <Search className="h-4 w-4 text-[#6B7280] shrink-0" />
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members, events…"
              className="flex-1 text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF] min-w-0"
            />
            <button onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}>
              <X className="h-4 w-4 text-[#9CA3AF] hover:text-[#374151]" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1.5 text-sm text-[#9CA3AF] hover:border-[#000080] hover:text-[#374151] transition-colors w-full"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Search…</span>
          </button>
        )}

        {/* Search results dropdown */}
        {searchOpen && (searchQuery.trim().length > 0) && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
            {searchLoading ? (
              <div className="px-4 py-3 text-sm text-[#9CA3AF] text-center">Searching…</div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[#9CA3AF] text-center">No results for &ldquo;{searchQuery}&rdquo;</div>
            ) : (
              searchResults.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { router.push(r.href); setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F9FAFB] transition-colors"
                >
                  {kindIcon(r.kind)}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">{r.label}</p>
                    <p className="text-xs text-[#9CA3AF] truncate">{r.sub}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Notification Bell ───────────────────────────────────────────────── */}
      <button
        onClick={() => router.push("/notifications")}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#000080] hover:bg-[#EEF2FF] transition-colors shrink-0"
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
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50"
        >
          {/* Name + email — hidden on small screens */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#1F2937] leading-tight">{displayName}</p>
            <p className="text-xs text-[#6B7280] leading-tight">{displayEmail}</p>
          </div>

          {/* Avatar — photo if available, else initials */}
          <div className="relative h-9 w-9 shrink-0 rounded-full overflow-hidden ring-2 ring-white bg-[#B5B5F3]">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={displayName} className="h-full w-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            ) : null}
            <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold text-[#000080] ${photoUrl ? "opacity-0" : "opacity-100"}`}>
              {initials}
            </div>
          </div>

          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-1 w-48 max-w-[calc(100vw-1rem)] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button onClick={() => { setDropdownOpen(false); router.push("/profile"); }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                My Profile
              </button>
              <button onClick={() => { setDropdownOpen(false); router.push("/settings/general"); }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                Settings
              </button>
              <hr className="my-1 border-gray-100" />
              <button onClick={() => { setDropdownOpen(false); logoutUser(); }}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50">
                Log Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
