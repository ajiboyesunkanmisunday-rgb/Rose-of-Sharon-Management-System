"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { SlidersHorizontal } from "lucide-react";
import { getSystemSettings, updateSystemSettings, type SystemSettings } from "@/lib/api";

const churchInfo = {
  name:    "RCCG Rose of Sharon",
  address: "65 Adekunle Fajuyi Way, Ikeja GRA, Ikeja 101233, Lagos",
  phone:   "0806 767 7224",
  email:   "info@rccgros.org",
  website: "https://rccgros.org",
};

const serviceTimes = [
  { label: "Sunday Service",           time: "9:00 AM" },
  { label: "Tuesday Bible Study",       time: "6:00 PM" },
  { label: "Thursday Prayer Meeting",   time: "6:00 PM" },
];

export default function GeneralSettingsPage() {
  const [sysSettings, setSysSettings] = useState<SystemSettings>({
    noOfDaysBeforeTriggeringFollowup: 0,
    announcementDeadline: "",
    memberPerFollowupPersonnel: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    getSystemSettings()
      .then(setSysSettings)
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaveError("");
    setSaving(true);
    try {
      await updateSystemSettings(sysSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-100 outline-none placeholder:text-[#9CA3AF] dark:placeholder:text-slate-500 transition-colors focus:border-[#000080] dark:focus:border-indigo-500 focus:ring-1 focus:ring-[#000080] dark:focus:ring-indigo-500";

  const labelClass = "mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300";

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6] dark:bg-slate-700">
          <SlidersHorizontal className="h-6 w-6 text-[#374151] dark:text-slate-300" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">General Settings</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Church information and system configurations</p>
        </div>
      </div>

      {/* Church Information — read-only display */}
      <div className="mb-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h3 className="mb-4 text-lg font-bold text-[#000080] dark:text-indigo-400">Church Information</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Object.entries(churchInfo).map(([key, val]) => (
            <div key={key}>
              <p className="text-xs font-medium capitalize text-[#6B7280] dark:text-slate-400">{key}</p>
              <p className="mt-1 text-sm font-medium text-[#111827] dark:text-slate-100">{val}</p>
            </div>
          ))}
        </div>

        <h3 className="mb-4 mt-6 text-lg font-bold text-[#000080] dark:text-indigo-400">Service Times</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {serviceTimes.map((s) => (
            <div key={s.label}>
              <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">{s.label}</p>
              <p className="mt-1 text-sm font-medium text-[#111827] dark:text-slate-100">{s.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* System Configuration — editable via API */}
      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h3 className="mb-4 text-lg font-bold text-[#000080] dark:text-indigo-400">System Configuration</h3>

        {loadError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-400 dark:text-slate-500">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Follow-up Trigger (days after visit)</label>
              <input
                type="number"
                min={0}
                value={sysSettings.noOfDaysBeforeTriggeringFollowup}
                onChange={(e) => setSysSettings((s) => ({ ...s, noOfDaysBeforeTriggeringFollowup: Number(e.target.value) }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Members per Follow-up Personnel</label>
              <input
                type="number"
                min={0}
                value={sysSettings.memberPerFollowupPersonnel}
                onChange={(e) => setSysSettings((s) => ({ ...s, memberPerFollowupPersonnel: Number(e.target.value) }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Announcement Deadline</label>
              <input
                type="text"
                value={sysSettings.announcementDeadline}
                onChange={(e) => setSysSettings((s) => ({ ...s, announcementDeadline: e.target.value }))}
                placeholder="e.g. Friday 5:00 PM"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {saveError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
            {saveError}
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <Button variant="primary" onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
          {saved && (
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              ✓ Settings saved successfully!
            </span>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
