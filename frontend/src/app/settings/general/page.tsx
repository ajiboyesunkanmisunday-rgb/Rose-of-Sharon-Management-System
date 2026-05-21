"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { SlidersHorizontal } from "lucide-react";

export default function GeneralSettingsPage() {
  const [churchInfo, setChurchInfo] = useState({
    name:    "RCCG Rose of Sharon",
    address: "65 Adekunle Fajuyi Way, Ikeja GRA, Ikeja 101233, Lagos",
    phone:   "0806 767 7224",
    email:   "info@rccgros.org",
    website: "https://rccgros.org",
  });

  const [serviceTimes, setServiceTimes] = useState({
    sunday:    "9:00 AM",
    wednesday: "6:00 PM",
    friday:    "6:00 PM",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    console.log("Saving settings:", { churchInfo, serviceTimes });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass =
    "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-100 outline-none placeholder:text-[#9CA3AF] dark:placeholder:text-slate-500 transition-colors focus:border-[#000080] dark:focus:border-indigo-500 focus:ring-1 focus:ring-[#000080] dark:focus:ring-indigo-500";

  const labelClass = "mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300";

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6] dark:bg-slate-700">
          <SlidersHorizontal className="h-6 w-6 text-[#374151] dark:text-slate-300" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">General Settings</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Church information and service configurations</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        {/* Church Information Section */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-bold text-[#000080] dark:text-indigo-400">
            Church Information
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Church Name</label>
              <input
                type="text"
                value={churchInfo.name}
                onChange={(e) => setChurchInfo({ ...churchInfo, name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input
                type="text"
                value={churchInfo.address}
                onChange={(e) => setChurchInfo({ ...churchInfo, address: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="text"
                value={churchInfo.phone}
                onChange={(e) => setChurchInfo({ ...churchInfo, phone: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={churchInfo.email}
                onChange={(e) => setChurchInfo({ ...churchInfo, email: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input
                type="text"
                value={churchInfo.website}
                onChange={(e) => setChurchInfo({ ...churchInfo, website: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Service Times Section */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-bold text-[#000080] dark:text-indigo-400">
            Service Times
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={labelClass}>Sunday Service</label>
              <input
                type="text"
                value={serviceTimes.sunday}
                onChange={(e) => setServiceTimes({ ...serviceTimes, sunday: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Tuesday Bible Study</label>
              <input
                type="text"
                value={serviceTimes.wednesday}
                onChange={(e) => setServiceTimes({ ...serviceTimes, wednesday: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Thursday Prayer Meeting</label>
              <input
                type="text"
                value={serviceTimes.friday}
                onChange={(e) => setServiceTimes({ ...serviceTimes, friday: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
          {saved && (
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              ✓ Settings saved successfully!
            </span>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
