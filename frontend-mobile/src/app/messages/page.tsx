"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import SearchField from "@/components/ui/SearchField";
import Chip from "@/components/ui/Chip";
import FAB from "@/components/ui/FAB";
import { messages } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import { Mail, MessageSquare } from "lucide-react";

type Tab = "All" | "SMS" | "Email";

export default function MessagesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter(
      (m) =>
        (tab === "All" || m.type === tab) &&
        (!q ||
          m.recipient.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q)),
    );
  }, [search, tab]);

  return (
    <>
      <AppShell title="Messages" subtitle={`${filtered.length} messages`}>
        <SearchField value={search} onChange={setSearch} placeholder="Search..." />

        <div className="mt-3 flex gap-2">
          {(["All", "SMS", "Email"] as Tab[]).map((t) => (
            <Chip key={t} label={t} active={tab === t} onClick={() => setTab(t)} />
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {filtered.map((m) => {
            const Icon = m.type === "SMS" ? MessageSquare : Mail;
            return (
              <li
                key={m.id}
                className="press flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#B5B5F3] text-[#000080]">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-[#0F172A]">
                      {m.recipient}
                    </p>
                    <span className="shrink-0 text-[10px] text-[#6B7280]">{m.date}</span>
                  </div>
                  {m.subject && (
                    <p className="truncate text-xs font-medium text-[#374151]">
                      {m.subject}
                    </p>
                  )}
                  <p className="mt-0.5 line-clamp-2 text-xs text-[#6B7280]">
                    {m.content}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </AppShell>
      <FAB onClick={() => router.push("/messages/compose")} label="New message" />
    </>
  );
}
