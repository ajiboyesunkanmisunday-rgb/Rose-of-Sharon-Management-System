"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";
import { loginUser } from "@/lib/api";

const inputBase =
  "w-full rounded-lg border px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none transition-colors focus:ring-1 placeholder:text-[#9CA3AF] dark:bg-slate-800";
const inputOk  = "border-[#E5E7EB] dark:border-slate-700 focus:border-[#000080] focus:ring-[#000080]";
const inputErr = "border-red-400 dark:border-red-400 focus:border-red-400 focus:ring-red-400";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [remember,    setRemember]    = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  // ② Inline validation — only shown after the user has left the field
  const [emailTouched,    setEmailTouched]    = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const emailError = emailTouched && email && !EMAIL_RE.test(email)
    ? "Enter a valid email address"
    : "";

  // ① Submit disabled until both fields have content and email looks valid
  const canSubmit = email.trim().length > 0 && password.length > 0 && EMAIL_RE.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailTouched(true);
    setPasswordTouched(true);
    if (!canSubmit) return;

    setLoading(true);
    try {
      const user = await loginUser({ email, password });

      let redirectTo = "/dashboard";
      try {
        const pending: string[] = JSON.parse(
          localStorage.getItem("rosms_first_login_pending") ?? "[]",
        );
        if (user.id && pending.includes(user.id)) {
          const updated = pending.filter((uid) => uid !== user.id);
          localStorage.setItem("rosms_first_login_pending", JSON.stringify(updated));
          redirectTo = "/settings/change-password?firstLogin=1";
        }
      } catch { /* localStorage unavailable */ }

      router.push(redirectTo);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your dashboard."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-[#000080] dark:text-indigo-400 hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}   /* ② inline validation on blur */
            placeholder="you@example.com"
            className={`${inputBase} ${emailError ? inputErr : inputOk}`}
          />
          {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-[#374151] dark:text-slate-300">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-medium text-[#000080] dark:text-indigo-400 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              placeholder="Enter your password"
              className={`${inputBase} pr-12 ${
                passwordTouched && !password ? inputErr : inputOk
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-[#000080] dark:text-indigo-400"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {passwordTouched && !password && (
            <p className="mt-1 text-xs text-red-500">Password is required</p>
          )}
        </div>

        {/* Remember me */}
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[#374151] dark:text-slate-300">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-[#E5E7EB] dark:border-slate-700 text-[#000080] dark:text-indigo-400 focus:ring-[#000080]"
          />
          Keep me signed in
        </label>

        {/* ① Submit disabled until valid */}
        <Button type="submit" variant="primary" className="w-full" disabled={loading || !canSubmit}>
          {loading ? "Signing in…" : "Sign In"}
        </Button>

        {!canSubmit && (email || password) && (
          <p className="text-center text-xs text-[#9CA3AF] dark:text-slate-500">
            Enter your email and password to sign in
          </p>
        )}
      </form>
    </AuthShell>
  );
}
