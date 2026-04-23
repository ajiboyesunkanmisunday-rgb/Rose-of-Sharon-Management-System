"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";

const inputClass =
  "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none transition-colors focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth is not wired up yet — pass through to the app.
    router.push("/dashboard");
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your dashboard."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-[#000080] hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-[#374151]"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-[#374151]"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[#000080] hover:underline"
            >
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
              placeholder="Enter your password"
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-[#000080]"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-[#374151]">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-[#E5E7EB] text-[#000080] focus:ring-[#000080]"
          />
          Keep me signed in
        </label>

        <Button type="submit" variant="primary" className="w-full">
          Sign In
        </Button>
      </form>
    </AuthShell>
  );
}
