"use client";

import AppShell from "@/components/shell/AppShell";
import { allAnnouncements } from "@/lib/mock-data";
import { Announcement } from "@/lib/types";
import { CalendarDays, Users, User2 } from "lucide-react";

const statusColor: Record<Announcement["status"], string> = {
  Published: "bg-green-100 text-green-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Draft: "bg-gray-100 text-gray-600",
};

export default function PageClient({ id }: { id: string }) {
  const a = allAnnouncements.find((x) => x.id === id);
  if (!a) {
    return (
      <AppShell title="Announcement" showBack>
        <p className="text-sm text-[#6B7280]">Announcement not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Announcement" showBack>
      <div className="rounded-2xl bg-gradient-to-br from-[#000080] to-[#3B3BAE] p-5 text-white">
        <span
          className={`inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold ${statusColor[a.status]}`}
        >
          {a.status}
        </span>
        <h1 className="mt-2 text-lg font-semibold">{a.title}</h1>
        <p className="mt-1 text-xs text-white/75">{a.audience}</p>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="press flex-1 rounded-xl bg-[#000080] py-2.5 text-xs font-semibold text-white">
          Publish Now
        </button>
        <button className="press flex-1 rounded-xl border border-[#E5E7EB] bg-white py-2.5 text-xs font-semibold text-[#000080]">
          Edit
        </button>
      </div>

      <section className="mt-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
          Body
        </h2>
        <p className="whitespace-pre-line rounded-xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#374151]">
          {a.body}
        </p>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
          Details
        </h2>
        <div className="rounded-xl border border-[#E5E7EB] bg-white px-3">
          <Row icon={<Users size={16} />} label="Audience" value={a.audience} />
          <Row icon={<CalendarDays size={16} />} label="Scheduled" value={a.scheduledDate} />
          <Row icon={<CalendarDays size={16} />} label="Created" value={a.createdDate} />
          <Row icon={<User2 size={16} />} label="By" value={a.createdBy} />
        </div>
      </section>
    </AppShell>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#F1F2F6] py-2.5 last:border-0">
      <span className="text-[#000080]">{icon}</span>
      <span className="flex-1 text-xs text-[#6B7280]">{label}</span>
      <span className="text-sm font-medium text-[#0F172A]">{value}</span>
    </div>
  );
}
