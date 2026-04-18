"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

export default function GeneralSettingsPage() {
  const [churchInfo, setChurchInfo] = useState({
    name: "RCCG Rose of Sharon",
    address: "",
    phone: "",
    email: "",
    website: "",
  });

  const [serviceTimes, setServiceTimes] = useState({
    sunday: "9:00 AM",
    wednesday: "6:00 PM",
    friday: "6:00 PM",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    console.log("Saving settings:", { churchInfo, serviceTimes });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none transition-colors focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Settings</h1>
        <h2 className="text-[22px] font-bold text-[#000080]">General</h2>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        {/* Church Information Section */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-bold text-[#000080]">
            Church Information
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151]">
                Church Name
              </label>
              <input
                type="text"
                value={churchInfo.name}
                onChange={(e) =>
                  setChurchInfo({ ...churchInfo, name: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151]">
                Address
              </label>
              <input
                type="text"
                value={churchInfo.address}
                onChange={(e) =>
                  setChurchInfo({ ...churchInfo, address: e.target.value })
                }
                placeholder="Enter church address"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151]">
                Phone
              </label>
              <input
                type="text"
                value={churchInfo.phone}
                onChange={(e) =>
                  setChurchInfo({ ...churchInfo, phone: e.target.value })
                }
                placeholder="Enter phone number"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151]">
                Email
              </label>
              <input
                type="email"
                value={churchInfo.email}
                onChange={(e) =>
                  setChurchInfo({ ...churchInfo, email: e.target.value })
                }
                placeholder="Enter email address"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151]">
                Website
              </label>
              <input
                type="text"
                value={churchInfo.website}
                onChange={(e) =>
                  setChurchInfo({ ...churchInfo, website: e.target.value })
                }
                placeholder="Enter website URL"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Service Times Section */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-bold text-[#000080]">
            Service Times
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151]">
                Sunday Service
              </label>
              <input
                type="text"
                value={serviceTimes.sunday}
                onChange={(e) =>
                  setServiceTimes({ ...serviceTimes, sunday: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151]">
                Wednesday Bible Study
              </label>
              <input
                type="text"
                value={serviceTimes.wednesday}
                onChange={(e) =>
                  setServiceTimes({
                    ...serviceTimes,
                    wednesday: e.target.value,
                  })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151]">
                Friday Prayer Meeting
              </label>
              <input
                type="text"
                value={serviceTimes.friday}
                onChange={(e) =>
                  setServiceTimes({ ...serviceTimes, friday: e.target.value })
                }
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
            <span className="text-sm text-green-600">
              Settings saved successfully!
            </span>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
