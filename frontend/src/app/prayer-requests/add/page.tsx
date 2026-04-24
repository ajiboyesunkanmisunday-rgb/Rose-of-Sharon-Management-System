"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

export default function AddPrayerRequestPage() {
  const router = useRouter();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [form, setForm] = useState({
    submittedBy: "",
    phone: "",
    email: "",
    category: "",
    request: "",
    assignedTo: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const inputClass =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/prayer-requests");
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Prayer Requests</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/prayer-requests")}
            className="flex items-center text-[#000080] transition-colors hover:text-[#000066]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-[#000080]">Add Prayer Request</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
          {/* Anonymous toggle */}
          <div className="mb-6 flex items-center gap-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="sr-only"
              />
              <div className={`h-6 w-11 rounded-full transition-colors ${isAnonymous ? "bg-[#000080]" : "bg-gray-300"}`}>
                <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${isAnonymous ? "translate-x-5 ml-0.5" : "translate-x-0.5"}`} />
              </div>
            </label>
            <span className="text-sm font-medium text-[#374151]">Submit Anonymously</span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {!isAnonymous && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#374151]">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" className={inputClass} placeholder="Enter full name" value={form.submittedBy} onChange={(e) => set("submittedBy", e.target.value)} required={!isAnonymous} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#374151]">Phone Number</label>
                  <input type="tel" className={inputClass} placeholder="+234 800 000 0000" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#374151]">Email Address</label>
                  <input type="email" className={inputClass} placeholder="email@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
              </>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#374151]">Category <span className="text-red-500">*</span></label>
              <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)} required>
                <option value="">Select category</option>
                <option value="Healing">Healing</option>
                <option value="Finance">Finance</option>
                <option value="Family">Family</option>
                <option value="Marriage">Marriage</option>
                <option value="Salvation">Salvation</option>
                <option value="Career">Career</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#374151]">Assign To</label>
              <select className={inputClass} value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)}>
                <option value="">Select officer (optional)</option>
                <option value="Pastor David">Pastor David</option>
                <option value="Pastor James">Pastor James</option>
                <option value="Deaconess Grace">Deaconess Grace</option>
                <option value="Shola Damson">Shola Damson</option>
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-medium text-[#374151]">Prayer Request <span className="text-red-500">*</span></label>
            <textarea
              rows={5}
              className={inputClass}
              placeholder="Describe the prayer request in detail..."
              value={form.request}
              onChange={(e) => set("request", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => router.push("/prayer-requests")}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Submit Request
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
