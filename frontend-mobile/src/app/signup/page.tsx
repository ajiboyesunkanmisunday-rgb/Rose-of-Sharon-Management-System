"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-xl bg-white px-4 py-3.5 text-sm text-[#111827] outline-none ring-1 ring-[#E5E7EB] transition focus:ring-2 focus:ring-[#000080]";

export default function MobileSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (!form.agree) return setError("Please accept the terms.");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#000080] to-[#1a1aa6] text-white">
      <div
        className="flex flex-col items-center px-6 pb-8 pt-12"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 40px)" }}
      >
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
          <Image src="/rccg-logo.png" alt="RCCG Rose of Sharon" width={44} height={44} />
        </div>
        <h1 className="text-xl font-bold">Create account</h1>
        <p className="mt-1 text-center text-sm text-[#B5B5F3]">
          Set up access to the management system.
        </p>
      </div>

      <div
        className="flex-1 rounded-t-[32px] bg-[#F4F5FB] px-6 pb-10 pt-6"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-[#0F172A]">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="First name"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              className={inputClass}
            />
            <input
              placeholder="Last name"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              className={inputClass}
            />
          </div>
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Password (min 8)"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            className={inputClass}
          />

          <label className="flex items-start gap-2 text-xs text-[#374151]">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => update("agree", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[#E5E7EB] text-[#000080] focus:ring-[#000080]"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="font-semibold text-[#000080]">Terms</Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold text-[#000080]">Privacy Policy</Link>.
            </span>
          </label>

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="press mt-2 w-full rounded-xl bg-[#000080] py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_-8px_rgba(0,0,128,0.55)]"
          >
            Create Account
          </button>

          <p className="pt-4 text-center text-sm text-[#374151]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#000080]">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
