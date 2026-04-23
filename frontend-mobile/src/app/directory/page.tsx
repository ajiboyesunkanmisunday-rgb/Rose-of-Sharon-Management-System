"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import SearchField from "@/components/ui/SearchField";
import Chip from "@/components/ui/Chip";
import Avatar from "@/components/ui/Avatar";
import { directoryContacts } from "@/lib/mock-data";

export default function DirectoryPage() {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("All");

  const groups = useMemo(() => {
    const s = new Set<string>();
    directoryContacts.forEach((c) => s.add(c.group));
    return ["All", ...Array.from(s)];
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return directoryContacts.filter((c) => {
      const match = !q
        ? true
        : `${c.name} ${c.role} ${c.phone} ${c.email} ${c.department || ""}`
            .toLowerCase()
            .includes(q);
      const byGroup = group === "All" || c.group === group;
      return match && byGroup;
    });
  }, [search, group]);

  return (
    <AppShell title="Directory" subtitle={`${filtered.length} contacts`}>
      <SearchField value={search} onChange={setSearch} placeholder="Search the directory..." />

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {groups.map((g) => (
          <Chip key={g} label={g} active={group === g} onClick={() => setGroup(g)} />
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {filtered.map((c) => (
          <li key={c.id}>
            <Link
              href={`tel:${c.phone.replace(/\s/g, "")}`}
              className="press flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3"
            >
              <Avatar name={c.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#0F172A]">{c.name}</p>
                <p className="truncate text-xs text-[#6B7280]">
                  {c.role} · {c.group}
                </p>
              </div>
              <span className="text-[11px] font-medium text-[#000080]">{c.phone}</span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
            No contacts match your search.
          </li>
        )}
      </ul>
    </AppShell>
  );
}
