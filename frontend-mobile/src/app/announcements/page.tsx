"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import SearchField from "@/components/ui/SearchField";
import Chip from "@/components/ui/Chip";
import FAB from "@/components/ui/FAB";
import { allAnnouncements } from "@/lib/mock-data";
import { Announcement } from "@/lib/types";
import { Megaphone } from "lucide-react";

const TABS: (Announcement["status"] | "All")[] = ["All", "Published", "Scheduled", "Draft"];

const statusColor: Record<Announcement["status"], string> = {
  Published: "bg-green-100 text-green-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Draft: "bg-gray-100 text-gray-600",
};

export default function AnnouncementsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Announcement["status"] | "All">("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allAnnouncements.filter(
      (a) =>
        (tab === "All" || a.status === tab) &&
        (!q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q)),
    );
  }, [search, tab]);

  return (
    <>
      <AppShell title="Announcements" subtitle={`${filtered.length} announcements`}>
        <SearchField value={search} onChange={setSearch} placeholder="Search announcements..." />

        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {TABS.map((t) => (
            <Chip key={t} label={t} active={tab === t} onClick={() => setTab(t)} />
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {filtered.map((a) => (
            <li key={a.id}>
              <Link
                href={`/announcements/${a.id}`}
                className="press block rounded-2xl border border-[#E5E7EB] bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B5B5F3] text-[#000080]">
                    <Megaphone size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-[#0F172A]">{a.title}</p>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColor[a.status]}`}
                      >
                        {a.status}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-[#6B7280]">{a.body}</p>
                    <p className="mt-2 text-[11px] text-[#6B7280]">
                      {a.audience} · {a.scheduledDate}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
              No announcements.
            </li>
          )}
        </ul>
      </AppShell>
      <FAB onClick={() => router.push("/announcements/add")} label="New announcement" />
    </>
  );
}
