"use client";

import { useState } from "react";
import AppShell from "@/components/shell/AppShell";

interface Toggle {
  key: string;
  label: string;
  hint: string;
}

const emailPrefs: Toggle[] = [
  { key: "e-announcements", label: "Announcements", hint: "New announcements from leadership" },
  { key: "e-events", label: "Events", hint: "Upcoming and updated events" },
  { key: "e-urgent", label: "Urgent Follow-ups", hint: "Critical and overdue tasks" },
  { key: "e-reports", label: "Weekly Reports", hint: "Receive digest every Monday" },
];

const pushPrefs: Toggle[] = [
  { key: "p-messages", label: "Direct Messages", hint: "SMS and in-app messages" },
  { key: "p-workflows", label: "Workflow Updates", hint: "Assignments and stage changes" },
  { key: "p-mentions", label: "Mentions", hint: "When you are tagged" },
];

export default function NotificationsSettingsPage() {
  const [state, setState] = useState<Record<string, boolean>>({
    "e-announcements": true,
    "e-events": true,
    "e-urgent": true,
    "e-reports": false,
    "p-messages": true,
    "p-workflows": true,
    "p-mentions": true,
  });

  const toggle = (k: string) => setState((s) => ({ ...s, [k]: !s[k] }));

  return (
    <AppShell title="Notifications" showBack hideTabBar>
      <div className="space-y-5 pb-20">
        <Group title="Email" items={emailPrefs} state={state} toggle={toggle} />
        <Group title="Push" items={pushPrefs} state={state} toggle={toggle} />

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
          <button className="press w-full rounded-xl bg-[#000080] py-3.5 text-sm font-semibold text-white">
            Save Preferences
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Group({
  title,
  items,
  state,
  toggle,
}: {
  title: string;
  items: Toggle[];
  state: Record<string, boolean>;
  toggle: (k: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
        {title}
      </p>
      <ul className="divide-y divide-[#F1F2F7] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        {items.map((it) => (
          <li key={it.key} className="flex items-center gap-3 px-4 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#0F172A]">{it.label}</p>
              <p className="truncate text-xs text-[#6B7280]">{it.hint}</p>
            </div>
            <button
              onClick={() => toggle(it.key)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${state[it.key] ? "bg-[#000080]" : "bg-[#E5E7EB]"}`}
              aria-label={`Toggle ${it.label}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${state[it.key] ? "left-[22px]" : "left-0.5"}`}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
