"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { changePassword } from "@/lib/api";
import { KeyRound, ShieldAlert } from "lucide-react";

// Inner component reads search params — must be inside a <Suspense> boundary
// so the static export can pre-render the shell without crashing.
function ChangePasswordInner() {
  const searchParams = useSearchParams();
  const isFirstLogin = searchParams.get("firstLogin") === "1";

  const [current, setCurrent] = useState("");
  const [next,    setNext]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState<{ type: "success" | "error"; msg: string } | null>(null);

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
      await changePassword({ oldPassword: current, newPassword: next, confirmPassword: confirm });
      showToast("success", "Password updated successfully.");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <div
          className={`fixed right-6 top-24 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.type === "success" ? "bg-green-50 dark:bg-green-900/200" : "bg-red-50 dark:bg-red-900/200"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {isFirstLogin && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 max-w-[560px]">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Action required — please change your password</p>
            <p className="mt-0.5 text-xs text-amber-700">
              Your account was set up with a temporary password. For security, please create a new personal password before continuing.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-[560px] rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Current Password" name="current" type="password" value={current}
            onChange={(e) => setCurrent(e.target.value)} placeholder="Enter current password" required />
          <FormField label="New Password" name="new" type="password" value={next}
            onChange={(e) => setNext(e.target.value)} placeholder="Enter new password" required />
          <FormField label="Confirm New Password" name="confirm" type="password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" required />
          <div className="flex justify-end pt-2">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Updating…" : "Update Password"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function ChangePasswordPage() {
  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7]">
          <KeyRound className="h-6 w-6 text-[#D97706]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Change Password</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Update your admin account password</p>
        </div>
      </div>

      <Suspense fallback={null}>
        <ChangePasswordInner />
      </Suspense>
    </DashboardLayout>
  );
}
