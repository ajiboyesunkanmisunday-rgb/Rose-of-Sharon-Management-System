"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const initialSettings: NotificationSetting[] = [
  {
    id: "new_member",
    label: "New Member Registration",
    description: "Get notified when a new member completes the registration form.",
    enabled: true,
  },
  {
    id: "followup",
    label: "Follow-up Reminders",
    description: "Receive reminders for pending and overdue follow-up tasks.",
    enabled: true,
  },
  {
    id: "prayer",
    label: "Prayer Request Alerts",
    description: "Get notified when new prayer requests are submitted.",
    enabled: true,
  },
  {
    id: "birthday",
    label: "Birthday Reminders",
    description: "Receive notifications for upcoming member birthdays.",
    enabled: false,
  },
  {
    id: "anniversary",
    label: "Anniversary Reminders",
    description: "Get notified about upcoming wedding anniversaries.",
    enabled: false,
  },
  {
    id: "report",
    label: "Report Generation Complete",
    description: "Get notified when scheduled reports have been generated.",
    enabled: true,
  },
  {
    id: "system",
    label: "System Updates",
    description: "Receive notifications about system updates, maintenance, and new features.",
    enabled: true,
  },
];

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState(initialSettings);

  const handleToggle = (id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleSave = () => {
    console.log("Saved notification settings:", settings);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-1">
        <h1 className="text-[28px] font-bold text-[#000000]">Notifications</h1>
      </div>
      <div className="mb-6">
        <p className="text-sm text-[#6B7280]">Settings</p>
      </div>

      {/* Settings Card */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="divide-y divide-[#E5E7EB]">
          {settings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between py-5 first:pt-0 last:pb-0"
            >
              <div className="pr-4">
                <p className="text-sm font-bold text-[#111827]">{setting.label}</p>
                <p className="mt-1 text-sm text-[#6B7280]">{setting.description}</p>
              </div>
              {/* Toggle Switch */}
              <button
                onClick={() => handleToggle(setting.id)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
                  setting.enabled ? "bg-[#000080]" : "bg-[#D1D5DB]"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    setting.enabled ? "translate-x-[22px]" : "translate-x-[2px]"
                  } mt-[2px]`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
