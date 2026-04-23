"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import SearchField from "@/components/ui/SearchField";
import Chip from "@/components/ui/Chip";
import FAB from "@/components/ui/FAB";
import { allRequests } from "@/lib/mock-data";
import { Request } from "@/lib/types";

const CATEGORIES: (Request["category"] | "All")[] = [
  "All",
  "Counseling",
  "Prayer",
  "Complaint",
  "Suggestion",
];

const statusColor: Record<Request["status"], string> = {
  Received: "bg-blue-100 text-blue-700",
  Assigned: "bg-purple-100 text-purple-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Resolved: "bg-green-100 text-green-700",
};

export default function RequestsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<Request["category"] | "All">("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRequests.filter(
      (r) =>
        (cat === "All" || r.category === cat) &&
        (!q ||
          r.title.toLowerCase().includes(q) ||
          r.submittedBy.toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q)),
    );
  }, [search, cat]);

  return (
    <>
      <AppShell title="Requests" subtitle={`${filtered.length} requests`}>
        <SearchField value={search} onChange={setSearch} placeholder="Search requests..." />

        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {CATEGORIES.map((c) => (
            <Chip key={c} label={c} active={cat === c} onClick={() => setCat(c)} />
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {filtered.map((r) => (
            <li key={r.id}>
              <Link
                href={`/requests/${r.id}`}
                className="press block rounded-2xl border border-[#E5E7EB] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-[#0F172A]">{r.title}</p>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColor[r.status]}`}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-[#6B7280]">{r.content}</p>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-[#6B7280]">
                  <span>By {r.submittedBy}</span>
                  <span>·</span>
                  <span>{r.date}</span>
                </div>
              </Link>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
              No requests.
            </li>
          )}
        </ul>
      </AppShell>
      <FAB onClick={() => router.push("/requests/add")} label="Add request" />
    </>
  );
}
