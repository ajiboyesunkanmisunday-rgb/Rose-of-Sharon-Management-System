"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import Chip from "@/components/ui/Chip";
import { Bell, CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  type: "info" | "success" | "warning" | "alert";
}

const initial: Notification[] = [
  { id: "n1", title: "New Member Registered", description: "Grace Adeyemi has completed the membership registration form and is awaiting approval.", timeAgo: "2 minutes ago", read: false, type: "info" },
  { id: "n2", title: "Follow-up Overdue", description: "Follow-up for David Okonkwo is overdue by 3 days. Please take action.", timeAgo: "15 minutes ago", read: false, type: "warning" },
  { id: "n3", title: "Prayer Request Submitted", description: "A new prayer request has been submitted by Sarah Bamidele regarding family healing.", timeAgo: "1 hour ago", read: false, type: "info" },
  { id: "n4", title: "Birthday Reminder", description: "John Michael's birthday is tomorrow. Send a greeting message.", timeAgo: "2 hours ago", read: false, type: "alert" },
  { id: "n5", title: "Report Generated Successfully", description: "Monthly attendance report for March 2026 has been generated and is ready for download.", timeAgo: "3 hours ago", read: true, type: "success" },
  { id: "n6", title: "Anniversary Reminder", description: "Peter & Mary Adewale's 3rd wedding anniversary is in 2 days.", timeAgo: "5 hours ago", read: true, type: "alert" },
  { id: "n7", title: "Counseling Session Scheduled", description: "A counseling session with Emmanuel Nwosu has been scheduled for April 18, 2026.", timeAgo: "8 hours ago", read: true, type: "success" },
  { id: "n8", title: "System Update Available", description: "A new system update is available. Please review the changelog and apply the update.", timeAgo: "1 day ago", read: true, type: "warning" },
  { id: "n9", title: "New Testimony Shared", description: "Blessing Okoro has shared a new testimony about divine provision.", timeAgo: "1 day ago", read: false, type: "info" },
  { id: "n10", title: "Attendance Alert", description: "Sunday Service attendance dropped below 80% threshold this week.", timeAgo: "2 days ago", read: true, type: "alert" },
];

const typeColors: Record<Notification["type"], string> = {
  info: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-amber-500",
  alert: "bg-red-500",
};

type Tab = "All" | "Unread" | "Read";

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>(initial);
  const [tab, setTab] = useState<Tab>("All");

  const filtered = useMemo(() => {
    if (tab === "Unread") return items.filter((n) => !n.read);
    if (tab === "Read") return items.filter((n) => n.read);
    return items;
  }, [items, tab]);

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <AppShell
      title="Notifications"
      subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
      topRight={
        unreadCount > 0 ? (
          <button
            onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
            className="press flex items-center gap-1 rounded-full bg-[#B5B5F3] px-3 py-1 text-[11px] font-semibold text-[#000080]"
          >
            <CheckCheck size={14} /> Read all
          </button>
        ) : null
      }
    >
      <div className="mb-3 flex gap-2">
        {(["All", "Unread", "Read"] as Tab[]).map((t) => (
          <Chip key={t} label={t} active={tab === t} onClick={() => setTab(t)} />
        ))}
      </div>

      <ul className="space-y-2">
        {filtered.map((n) => (
          <li key={n.id}>
            <button
              onClick={() =>
                setItems((prev) =>
                  prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
                )
              }
              className={`press flex w-full items-start gap-3 rounded-2xl border border-[#E5E7EB] p-3 text-left ${
                n.read ? "bg-white" : "bg-[#F8F8FE]"
              }`}
            >
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B5B5F3] text-[#000080]">
                  <Bell size={18} />
                </div>
                {!n.read && (
                  <span
                    className={`absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white ${typeColors[n.type]}`}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-[#0F172A]">{n.title}</p>
                  <span className="shrink-0 text-[10px] text-[#6B7280]">{n.timeAgo}</span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs text-[#6B7280]">{n.description}</p>
              </div>
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
            No notifications.
          </li>
        )}
      </ul>
    </AppShell>
  );
}
