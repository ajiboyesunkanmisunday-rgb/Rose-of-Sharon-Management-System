"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import SearchField from "@/components/ui/SearchField";
import Chip from "@/components/ui/Chip";
import FAB from "@/components/ui/FAB";
import Avatar from "@/components/ui/Avatar";
import { celebrations } from "@/lib/mock-data";
import { CelebrationType } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Cake, Gift, Heart, Baby } from "lucide-react";

const TYPES: (CelebrationType | "All")[] = [
  "All",
  "Birthday",
  "Wedding Anniversary",
  "Thanksgiving",
  "Child Dedication",
];

const iconFor = (t: CelebrationType) => {
  if (t === "Birthday") return Cake;
  if (t === "Wedding Anniversary") return Heart;
  if (t === "Thanksgiving") return Gift;
  return Baby;
};

export default function CelebrationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<CelebrationType | "All">("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return celebrations.filter(
      (c) =>
        (type === "All" || c.type === type) &&
        (!q || c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)),
    );
  }, [search, type]);

  return (
    <>
      <AppShell title="Celebrations" subtitle={`${filtered.length} upcoming`}>
        <SearchField value={search} onChange={setSearch} placeholder="Search celebrations..." />

        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {TYPES.map((t) => (
            <Chip key={t} label={t} active={type === t} onClick={() => setType(t)} />
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {filtered.map((c) => {
            const Icon = iconFor(c.type);
            return (
              <li
                key={c.id}
                className="press flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3"
              >
                <Avatar name={c.name || "?"} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-[#0F172A]">{c.name}</p>
                    <span className="shrink-0 text-[10px] text-[#6B7280]">{c.date}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[#374151]">
                    <Icon size={14} className="text-[#000080]" />
                    <span>
                      {c.type}
                      {c.years ? ` · ${c.years} yrs` : ""}
                    </span>
                  </div>
                  {c.notes && (
                    <p className="mt-1 line-clamp-2 text-xs text-[#6B7280]">{c.notes}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 self-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                    c.status === "Completed" || c.status === "Treated"
                      ? "bg-gray-100 text-gray-600"
                      : c.status === "Pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {c.status}
                </span>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
              No celebrations.
            </li>
          )}
        </ul>
      </AppShell>
      <FAB onClick={() => router.push("/celebrations/add")} label="Add celebration" />
    </>
  );
}
