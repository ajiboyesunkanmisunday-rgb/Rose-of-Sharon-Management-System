"use client";

import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import Avatar from "@/components/ui/Avatar";
import { messages } from "@/lib/mock-data";
import type { Message } from "@/lib/types";
import { Mail, MessageSquare, Phone, CalendarDays } from "lucide-react";

const statusColor: Record<Message["status"], string> = {
  Sent: "bg-green-100 text-green-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Failed: "bg-red-100 text-red-700",
};

export default function MessageDetailClient({ id }: { id: string }) {
  const m = messages.find((x) => x.id === id);
  if (!m) {
    return (
      <AppShell title="Message" showBack>
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-12 text-center text-sm text-[#6B7280]">
          Message not found.
          <div className="mt-4">
            <Link href="/messages" className="text-[#000080] underline">Back to Messages</Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const Icon = m.type === "SMS" ? MessageSquare : Mail;

  return (
    <AppShell title="Message" showBack>
      <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4">
        <Avatar name={m.recipient} size={48} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#0F172A]">{m.recipient}</p>
          <p className="truncate text-xs text-[#6B7280]">
            {m.type === "SMS" ? m.recipientPhone : m.recipientEmail}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor[m.status]}`}>
          {m.status}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-xs text-[#6B7280]">
        <span className="flex items-center gap-1">
          <Icon size={14} /> {m.type}
        </span>
        <span className="flex items-center gap-1">
          <CalendarDays size={14} /> {m.date}{m.time ? ` · ${m.time}` : ""}
        </span>
      </div>

      {m.subject && (
        <div className="mt-4">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Subject
          </p>
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-sm font-medium text-[#0F172A]">
            {m.subject}
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
          Content
        </p>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-sm leading-relaxed text-[#374151]">
          {m.content}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 text-xs text-[#6B7280]">
        Sent by <span className="font-medium text-[#374151]">{m.sentBy}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {m.recipientPhone && (
          <a href={`tel:${m.recipientPhone}`} className="press flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white py-3 text-xs font-semibold text-[#000080]">
            <Phone size={14} /> Call
          </a>
        )}
        <Link href="/messages/compose" className="press col-span-2 flex items-center justify-center gap-2 rounded-xl bg-[#000080] py-3 text-xs font-semibold text-white">
          <MessageSquare size={14} /> Reply
        </Link>
      </div>
    </AppShell>
  );
}
