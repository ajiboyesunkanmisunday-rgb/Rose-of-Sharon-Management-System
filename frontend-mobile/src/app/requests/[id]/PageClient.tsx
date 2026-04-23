"use client";

import AppShell from "@/components/shell/AppShell";
import Avatar from "@/components/ui/Avatar";
import { allRequests } from "@/lib/mock-data";
import { Request } from "@/lib/types";
import { CalendarDays, Tag, User2 } from "lucide-react";

const statusColor: Record<Request["status"], string> = {
  Received: "bg-blue-100 text-blue-700",
  Assigned: "bg-purple-100 text-purple-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Resolved: "bg-green-100 text-green-700",
};

export default function PageClient({ id }: { id: string }) {
  const req = allRequests.find((r) => r.id === id);

  if (!req) {
    return (
      <AppShell title="Request" showBack>
        <p className="text-sm text-[#6B7280]">Request not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Request" showBack>
      <div className="rounded-2xl bg-gradient-to-br from-[#000080] to-[#3B3BAE] p-5 text-white">
        <span
          className={`inline-block rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold ${statusColor[req.status]}`}
        >
          {req.status}
        </span>
        <h1 className="mt-2 text-lg font-semibold">{req.title}</h1>
        <p className="mt-1 text-xs text-white/75">{req.category}</p>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="press flex-1 rounded-xl bg-[#000080] py-2.5 text-xs font-semibold text-white">
          Assign
        </button>
        <button className="press flex-1 rounded-xl border border-[#E5E7EB] bg-white py-2.5 text-xs font-semibold text-[#000080]">
          Mark Resolved
        </button>
      </div>

      <Section title="Details">
        <p className="whitespace-pre-line text-sm text-[#374151]">{req.content}</p>
      </Section>

      <Section title="Info">
        <Row icon={<Tag size={16} />} label="Category" value={req.category} />
        <Row icon={<CalendarDays size={16} />} label="Submitted" value={req.date} />
        <Row icon={<User2 size={16} />} label="By" value={req.submittedBy} />
      </Section>

      <Section title="Assigned To">
        <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3">
          <Avatar name={req.assignedTo || "Unassigned"} size={40} />
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">
              {req.assignedTo || "Unassigned"}
            </p>
            <p className="text-xs text-[#6B7280]">Added by {req.addedBy}</p>
          </div>
        </div>
      </Section>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
        {title}
      </h2>
      {children}
    </section>
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
