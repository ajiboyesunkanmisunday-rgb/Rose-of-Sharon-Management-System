"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";
import PhoneInput from "@/components/ui/PhoneInput";
import { CheckCircle2, Circle } from "lucide-react";

const inputBase =
  "w-full rounded-lg border px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none transition-colors focus:ring-1 placeholder:text-[#9CA3AF] dark:placeholder:text-slate-500 dark:bg-slate-800";

const inputOk  = "border-[#E5E7EB] dark:border-slate-700 focus:border-[#000080] focus:ring-[#000080]";
const inputErr = "border-red-400 dark:border-red-400 focus:border-red-400 focus:ring-red-400";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Password requirements ────────────────────────────────────────────────────
const PWD_RULES = [
  { label: "At least 8 characters",    test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter",     test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter",     test: (p: string) => /[a-z]/.test(p) },
  { label: "One number",               test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character",    test: (p: string) => /[!@#$%^&*()\-_=+\[\]{};':",.<>/?\\|`~]/.test(p) },
];

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
              : <Circle      className="h-3.5 w-3.5 shrink-0 text-[#D1D5DB] dark:text-slate-600" />}
            <span className={met ? "text-green-700 dark:text-green-400" : "text-[#6B7280] dark:text-slate-400"}>
              {rule.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Inner form (reads searchParams) ─────────────────────────────────────────
function SignupInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    firstName: "",
    lastName:  "",
    email:     searchParams.get("email") ?? "",   // ④ pre-fill from invite link
    countryCode: "+234",
    phone:     "",
    password:  "",
    confirmPassword: "",
    agree:     false,
  });

  // ── Touched state (inline validation triggers on blur) ───────────────────
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [submitting,   setSubmitting]   = useState(false);

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  // ── Validation helpers ────────────────────────────────────────────────────
  const pwdMeetsAll = PWD_RULES.every((r) => r.test(form.password));

  const fieldErrors = {
    firstName: !form.firstName.trim()     ? "First name is required" : "",
    lastName:  !form.lastName.trim()      ? "Last name is required"  : "",
    email:     !form.email.trim()         ? "Email is required"
             : !EMAIL_RE.test(form.email) ? "Enter a valid email address"
             : "",
    phone:     !form.phone.trim()         ? "Phone number is required" : "",
    password:  !pwdMeetsAll              ? "Password does not meet requirements" : "",
    confirmPassword:
      form.confirmPassword && form.password !== form.confirmPassword
        ? "Passwords do not match"
        : "",
    agree: !form.agree ? "You must accept the terms" : "",
  };

  // ① Submit button disabled until everything valid
  const isFormValid =
    !fieldErrors.firstName &&
    !fieldErrors.lastName &&
    !fieldErrors.email &&
    !fieldErrors.phone &&
    pwdMeetsAll &&
    form.confirmPassword === form.password &&
    form.confirmPassword.length > 0 &&
    form.agree;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Mark all fields touched so errors show
    setTouched({
      firstName: true, lastName: true, email: true,
      phone: true, password: true, confirmPassword: true, agree: true,
    });
    if (!isFormValid) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      router.push("/login");
    }, 400);
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up access to the management system."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#000080] dark:text-indigo-400 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Name row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
              First name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              onBlur={() => touch("firstName")}
              placeholder="First name"
              className={`${inputBase} ${touched.firstName && fieldErrors.firstName ? inputErr : inputOk}`}
            />
            {touched.firstName && fieldErrors.firstName && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.firstName}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
              Last name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              onBlur={() => touch("lastName")}
              placeholder="Last name"
              className={`${inputBase} ${touched.lastName && fieldErrors.lastName ? inputErr : inputOk}`}
            />
            {touched.lastName && fieldErrors.lastName && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={() => touch("email")}   /* ② inline validation on blur */
            placeholder="you@example.com"
            className={`${inputBase} ${touched.email && fieldErrors.email ? inputErr : inputOk}`}
          />
          {touched.email && fieldErrors.email && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
          )}
        </div>

        {/* Phone — ⑥ forgiving: PhoneInput already strips dashes/spaces */}
        <PhoneInput
          label="Phone number"
          required
          code={form.countryCode}
          number={form.phone}
          onCodeChange={(v) => update("countryCode", v)}
          onNumberChange={(v) => update("phone", v)}
          onBlur={() => touch("phone")}
          error={touched.phone && fieldErrors.phone ? fieldErrors.phone : undefined}
        />

        {/* Password */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              onBlur={() => touch("password")}
              placeholder="At least 8 characters"
              className={`${inputBase} pr-12 ${touched.password && fieldErrors.password ? inputErr : inputOk}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-[#000080] dark:text-indigo-400"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {/* ⑤ Real-time password requirements */}
          <PasswordRules password={form.password} />
        </div>

        {/* Confirm password */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
            Confirm password <span className="text-red-500">*</span>
          </label>
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            onBlur={() => touch("confirmPassword")}
            placeholder="Re-enter your password"
            className={`${inputBase} ${touched.confirmPassword && fieldErrors.confirmPassword ? inputErr : inputOk}`}
          />
          {touched.confirmPassword && fieldErrors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>
          )}
          {touched.confirmPassword && !fieldErrors.confirmPassword && form.confirmPassword && (
            <p className="mt-1 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3" /> Passwords match
            </p>
          )}
        </div>

        {/* Terms */}
        <label className="flex cursor-pointer items-start gap-2 text-sm text-[#374151] dark:text-slate-300">
          <input
            type="checkbox"
            checked={form.agree}
            onChange={(e) => { update("agree", e.target.checked); touch("agree"); }}
            className="mt-0.5 h-4 w-4 rounded border-[#E5E7EB] dark:border-slate-700 text-[#000080] dark:text-indigo-400 focus:ring-[#000080]"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="font-medium text-[#000080] dark:text-indigo-400 hover:underline">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-[#000080] dark:text-indigo-400 hover:underline">Privacy Policy</Link>.
          </span>
        </label>
        {touched.agree && fieldErrors.agree && (
          <p className="-mt-2 text-xs text-red-500">{fieldErrors.agree}</p>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ① Submit disabled until form valid */}
        <Button
          type="submit"
          variant="primary"
          disabled={submitting || !isFormValid}
          className="w-full"
        >
          {submitting ? "Creating account…" : "Create Account"}
        </Button>

        {/* Helper text when button is disabled */}
        {!isFormValid && (
          <p className="text-center text-xs text-[#9CA3AF] dark:text-slate-500">
            Fill in all required fields above to continue
          </p>
        )}
      </form>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupInner />
    </Suspense>
  );
}
