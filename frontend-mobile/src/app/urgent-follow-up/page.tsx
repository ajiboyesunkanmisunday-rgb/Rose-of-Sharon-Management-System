"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import Chip from "@/components/ui/Chip";
import SearchField from "@/components/ui/SearchField";
import Avatar from "@/components/ui/Avatar";
import { urgentFollowUps } from "@/lib/mock-data";
import type { UrgentFollowUp } from "@/lib/types";
import { Phone, MessageSquare, AlertTriangle } from "lucide-react";

type Filter = "All" | "Overdue" | "Critical" | "Due Today";
const FILTERS: Filter[] = ["All", "Overdue", "Critical", "Due Today"];

const statusColor: Record<UrgentFollowUp["status"], string> = {
  Overdue: "bg-amber-100 text-amber-700",
  Critical: "bg-red-100 text-red-700",
  "Due Today": "bg-blue-100 text-blue-700",
};

export default function UrgentFollowUpPage() {
  const [f, setF] = useState<Filter>("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return urgentFollowUps.filter(
      (u) =>
        (f === "All" || u.status === f) &&
        (!s ||
          u.name.toLowerCase().includes(s) ||
          u.assignedOfficer.toLowerCase().includes(s) ||
          u.category.toLowerCase().includes(s)),
    );
  }, [f, q]);

  return (
    <AppShell title="Urgent Follow-up" subtitle={`${filtered.length} pending`} showBack>
      <SearchField value={q} onChange={setQ} placeholder="Search follow-ups..." />

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((x) => (
          <Chip key={x} label={x} active={f === x} onClick={() => setF(x)} />
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {filtered.map((u) => (
          <li
            key={u.id}
            className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3"
          >
            <Avatar name={u.name} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-[#0F172A]">{u.name}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor[u.status]}`}>
                  {u.status}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-[#6B7280]">
                {u.category} · {u.assignedOfficer}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#6B7280]">
                <AlertTriangle size={11} />
                {u.daysOverdue === 0
                  ? "Due today"
                  : `${u.daysOverdue} day${u.daysOverdue === 1 ? "" : "s"} overdue`}
                · last contact {u.lastContact}
              </p>
              <div className="mt-2 flex gap-2">
                <a
                  href={`tel:${u.phone}`}
                  className="press inline-flex items-center gap-1 rounded-lg bg-[#F3F4FF] px-2.5 py-1 text-[11px] font-semibold text-[#000080]"
                >
                  <Phone size={12} /> Call
                </a>
                <a
                  href={`sms:${u.phone}`}
                  className="press inline-flex items-center gap-1 rounded-lg bg-[#F3F4FF] px-2.5 py-1 text-[11px] font-semibold text-[#000080]"
                >
                  <MessageSquare size={12} /> SMS
                </a>
              </div>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
            No follow-ups.
          </li>
        )}
      </ul>
    </AppShell>
  );
}
