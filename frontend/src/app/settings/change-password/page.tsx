"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { changePassword, getStoredUser } from "@/lib/api";
import { KeyRound, ShieldAlert, CheckCircle2, Circle } from "lucide-react";

// ── Password requirements (same rules as signup) ──────────────────────────
const PWD_RULES = [
  { label: "At least 8 characters",    test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter",     test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter",     test: (p: string) => /[a-z]/.test(p) },
  { label: "One number",               test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character",    test: (p: string) => /[!@#$%^&*()\-_=+\[\]{};':",.<>/?\\|`~]/.test(p) },
];

const inputBase =
  "w-full rounded-lg border px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none transition-colors focus:ring-1 bg-white dark:bg-slate-700 placeholder:text-[#9CA3AF] dark:placeholder:text-slate-500";
const inputOk  = "border-[#E5E7EB] dark:border-slate-600 focus:border-[#000080] dark:focus:border-indigo-500 focus:ring-[#000080] dark:focus:ring-indigo-500";
const inputErr = "border-red-400 dark:border-red-400 focus:border-red-400 focus:ring-red-400";

function PasswordRules({ password }: { password: string }) {
  if (!password) return null;
  return (
    <div className="mt-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] dark:bg-slate-700/40 px-3 py-2.5 space-y-1.5">
      {PWD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <div key={rule.label} className="flex items-center gap-2 text-xs">
            {met
              ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
              : <Circle       className="h-3.5 w-3.5 shrink-0 text-[#D1D5DB] dark:text-slate-600" />}
            <span className={met ? "text-green-700 dark:text-green-400" : "text-[#6B7280] dark:text-slate-400"}>
              {rule.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ChangePasswordInner() {
  const searchParams = useSearchParams();
  const isFirstLogin = searchParams.get("firstLogin") === "1";

  // ④ Pre-fill context — show who is changing the password
  const storedUser = getStoredUser();

  const [current, setCurrent] = useState("");
  const [next,    setNext]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ② Touched state for inline validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const pwdMeetsAll = PWD_RULES.every((r) => r.test(next));
  const passwordsMatch = next === confirm;

  // Inline errors
  const errors = {
    current: touched.current && !current.trim() ? "Current password is required" : "",
    next:    touched.next && !pwdMeetsAll && next ? "Password does not meet all requirements" : "",
    confirm: touched.confirm && confirm && !passwordsMatch ? "Passwords do not match" : "",
  };

  // ① Submit disabled until all fields filled, new password meets rules, and passwords match
  const canSubmit =
    current.trim().length > 0 &&
    pwdMeetsAll &&
    confirm.length > 0 &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ current: true, next: true, confirm: true });
    if (!canSubmit) return;

    setLoading(true);
    try {
      await changePassword({ oldPassword: current, newPassword: next, confirmPassword: confirm });
      showToast("success", "Password updated successfully.");
      setCurrent(""); setNext(""); setConfirm("");
      setTouched({});
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
          className={`fixed right-6 top-24 z-50 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-700"
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

      {/* ④ Pre-filled context: show who this password change is for */}
      {storedUser && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] dark:bg-slate-700/40 px-4 py-2.5 max-w-[560px]">
          <span className="text-xs text-[#6B7280] dark:text-slate-400">Changing password for:</span>
          <span className="text-xs font-semibold text-[#374151] dark:text-slate-200">
            {storedUser.firstName} {storedUser.lastName}
          </span>
          <span className="ml-1 text-xs text-[#9CA3AF] dark:text-slate-500">({storedUser.email})</span>
        </div>
      )}

      <div className="max-w-[560px] rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Current password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                onBlur={() => touch("current")}
                placeholder="Enter current password"
                className={`${inputBase} pr-12 ${errors.current ? inputErr : inputOk}`}
              />
              <button
                type="button"
                onClick={() => setShowPasswords((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-[#000080] dark:text-indigo-400"
              >
                {showPasswords ? "Hide" : "Show"}
              </button>
            </div>
            {errors.current && <p className="mt-1 text-xs text-red-500">{errors.current}</p>}
          </div>

          {/* New password + requirements */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              onBlur={() => touch("next")}
              placeholder="Enter new password"
              className={`${inputBase} ${errors.next ? inputErr : inputOk}`}
            />
            {/* ⑤ Real-time password requirements */}
            <PasswordRules password={next} />
          </div>

          {/* Confirm new password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onBlur={() => touch("confirm")}
              placeholder="Re-enter new password"
              className={`${inputBase} ${errors.confirm ? inputErr : inputOk}`}
            />
            {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
            {touched.confirm && !errors.confirm && confirm && passwordsMatch && (
              <p className="mt-1 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" /> Passwords match
              </p>
            )}
          </div>

          {/* ① Submit disabled until valid */}
          <div className="flex items-center justify-between pt-1 gap-4">
            {!canSubmit && (current || next || confirm) && (
              <p className="text-xs text-[#9CA3AF] dark:text-slate-500">
                Complete all fields to enable update
              </p>
            )}
            <div className="ml-auto">
              <Button variant="primary" type="submit" disabled={loading || !canSubmit}>
                {loading ? "Updating…" : "Update Password"}
              </Button>
            </div>
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
