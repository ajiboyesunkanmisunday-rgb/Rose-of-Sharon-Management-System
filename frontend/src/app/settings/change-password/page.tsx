"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Change password", { current, next, confirm });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  return (
    <DashboardLayout>
      <div className="mb-1">
        <h1 className="text-[28px] font-bold text-[#000000]">Settings</h1>
      </div>
      <div className="mb-6">
        <p className="text-sm text-[#6B7280]">Change Password</p>
      </div>

      {showToast && (
        <div className="fixed right-6 top-24 z-50 rounded-lg bg-green-500 px-4 py-3 text-sm font-medium text-white shadow-lg">
          Password updated successfully
        </div>
      )}

      <div className="max-w-[560px] rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Current Password"
            name="current"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="Enter current password"
            required
          />
          <FormField
            label="New Password"
            name="new"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="Enter new password"
            required
          />
          <FormField
            label="Confirm New Password"
            name="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            required
          />

          <div className="flex justify-end pt-2">
            <Button variant="primary" type="submit">
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
