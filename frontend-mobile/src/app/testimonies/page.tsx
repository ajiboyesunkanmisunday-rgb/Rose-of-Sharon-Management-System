"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import SearchField from "@/components/ui/SearchField";
import Chip from "@/components/ui/Chip";
import Avatar from "@/components/ui/Avatar";
import { testimonies as initial } from "@/lib/mock-data";
import { Testimony } from "@/lib/types";
import { MapPin, Star, CheckCheck, X } from "lucide-react";

type Tab = "All" | "Not Read" | "Read" | "Featured";

const CATEGORIES = ["All", "Healing", "Financial", "Marriage", "Salvation", "Other"] as const;

export default function TestimoniesPage() {
  const [items, setItems] = useState<Testimony[]>(initial);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("All");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [open, setOpen] = useState<Testimony | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((t) => {
      if (tab === "Not Read" && t.status !== "Not Read") return false;
      if (tab === "Read" && t.status !== "Read") return false;
      if (tab === "Featured" && !t.featured) return false;
      if (cat !== "All" && t.category !== cat) return false;
      if (q) {
        const name = (t.name || "Anonymous").toLowerCase();
        return (
          name.includes(q) ||
          t.content.toLowerCase().includes(q) ||
          (t.location || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, search, tab, cat]);

  const markAllRead = () =>
    setItems((prev) => prev.map((t) => ({ ...t, status: "Read" })));

  const toggleRead = (id: string) =>
    setItems((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === "Read" ? "Not Read" : "Read" } : t,
      ),
    );

  const toggleFeatured = (id: string) =>
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, featured: !t.featured } : t)));

  const unreadCount = items.filter((t) => t.status === "Not Read").length;

  return (
    <AppShell
      title="Testimonies"
      subtitle={`${filtered.length} testimonies · ${unreadCount} unread`}
      topRight={
        unreadCount > 0 ? (
          <button
            onClick={markAllRead}
            className="press flex items-center gap-1 rounded-full bg-[#B5B5F3] px-3 py-1 text-[11px] font-semibold text-[#000080]"
          >
            <CheckCheck size={14} /> Read all
          </button>
        ) : null
      }
    >
      <SearchField value={search} onChange={setSearch} placeholder="Search testimonies..." />

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {(["All", "Not Read", "Read", "Featured"] as Tab[]).map((t) => (
          <Chip key={t} label={t} active={tab === t} onClick={() => setTab(t)} />
        ))}
      </div>

      <div className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} active={cat === c} onClick={() => setCat(c)} />
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {filtered.map((t) => {
          const name = t.name?.trim() || "Anonymous";
          const unread = t.status === "Not Read";
          return (
            <li key={t.id}>
              <button
                onClick={() => setOpen(t)}
                className="press flex w-full items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3 text-left"
              >
                <Avatar name={name} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-[#0F172A]">
                      {name}
                      {unread && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[#000080] align-middle" />}
                    </p>
                    <span className="shrink-0 text-[10px] text-[#6B7280]">{t.date}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#6B7280]">
                    <span className="rounded-full bg-[#F4F5FB] px-2 py-0.5 text-[10px] font-medium text-[#000080]">
                      {t.category}
                    </span>
                    {t.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPin size={11} /> {t.location}
                      </span>
                    )}
                    {t.featured && (
                      <span className="flex items-center gap-0.5 text-amber-600">
                        <Star size={11} fill="currentColor" /> Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-[#374151]">{t.content}</p>
                </div>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
            No testimonies.
          </li>
        )}
      </ul>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-end bg-black/40"
          onClick={() => setOpen(null)}
        >
          <div
            className="w-full rounded-t-3xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={open.name?.trim() || "Anonymous"} size={44} />
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    {open.name?.trim() || "Anonymous"}
                  </p>
                  <p className="text-[11px] text-[#6B7280]">
                    {open.category} · {open.date}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(null)}
                className="press flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F5FB] text-[#000080]"
              >
                <X size={16} />
              </button>
            </div>

            {open.location && (
              <p className="mb-2 flex items-center gap-1 text-xs text-[#6B7280]">
                <MapPin size={13} /> {open.location}
              </p>
            )}

            <p className="whitespace-pre-line text-sm text-[#374151]">{open.content}</p>

            <p className="mt-3 text-[11px] text-[#6B7280]">Shared by {open.sharedBy}</p>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  toggleRead(open.id);
                  setOpen({
                    ...open,
                    status: open.status === "Read" ? "Not Read" : "Read",
                  });
                }}
                className="press flex-1 rounded-xl border border-[#E5E7EB] bg-white py-2.5 text-xs font-semibold text-[#000080]"
              >
                Mark {open.status === "Read" ? "Unread" : "Read"}
              </button>
              <button
                onClick={() => {
                  toggleFeatured(open.id);
                  setOpen({ ...open, featured: !open.featured });
                }}
                className="press flex-1 rounded-xl bg-[#000080] py-2.5 text-xs font-semibold text-white"
              >
                {open.featured ? "Unfeature" : "Feature"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
