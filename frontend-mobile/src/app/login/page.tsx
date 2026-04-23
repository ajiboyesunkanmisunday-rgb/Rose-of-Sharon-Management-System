"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-xl bg-white px-4 py-3.5 text-sm text-[#111827] outline-none ring-1 ring-[#E5E7EB] transition focus:ring-2 focus:ring-[#000080]";

export default function MobileLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#000080] to-[#1a1aa6] text-white">
      {/* Hero */}
      <div
        className="flex flex-col items-center px-6 pb-10 pt-16"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 48px)" }}
      >
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg">
          <Image src="/rccg-logo.png" alt="RCCG Rose of Sharon" width={56} height={56} />
        </div>
        <p className="text-xs font-medium tracking-widest text-[#B5B5F3]">RCCG</p>
        <h1 className="mt-1 text-2xl font-bold">Rose of Sharon</h1>
        <p className="mt-2 text-center text-sm text-[#B5B5F3]">
          Welcome back. Sign in to continue.
        </p>
      </div>

      {/* Sheet */}
      <div
        className="flex-1 rounded-t-[32px] bg-[#F4F5FB] px-6 pb-10 pt-8"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-[#0F172A]">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#374151]">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-[#374151]">Password</label>
              <Link href="/forgot-password" className="text-xs font-semibold text-[#000080]">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`${inputClass} pr-14`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-[#000080]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="press mt-2 w-full rounded-xl bg-[#000080] py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_-8px_rgba(0,0,128,0.55)]"
          >
            Sign In
          </button>

          <p className="pt-4 text-center text-sm text-[#374151]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[#000080]">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
