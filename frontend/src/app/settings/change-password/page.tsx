"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { changePassword } from "@/lib/api";

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (next !== confirm) {
      showToast("error", "New password and confirm password do not match.");
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        oldPassword: current,
        newPassword: next,
        confirmPassword: confirm,
      });
      showToast("success", "Password updated successfully.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update password.";
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-1">
        <h1 className="text-[28px] font-bold text-[#000000]">Settings</h1>
      </div>
      <div className="mb-6">
        <p className="text-sm text-[#6B7280]">Change Password</p>
      </div>

      {toast && (
        <div
          className={`fixed right-6 top-24 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.msg}
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
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Updating…" : "Update Password"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
