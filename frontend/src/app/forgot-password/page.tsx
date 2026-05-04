"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";

const inputClass =
  "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none transition-colors focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and an administrator will assist you with resetting your password."
      footer={
        <>
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-medium text-[#000080] hover:underline"
          >
            Back to Sign In
          </Link>
        </>
      }
    >
      {submitted ? (
        <div className="space-y-5">
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
            <p className="font-medium">Request received</p>
            <p className="mt-1 text-green-700">
              Your password reset request for{" "}
              <span className="font-medium">{email}</span> has been noted. A
              system administrator will contact you shortly to help you regain
              access.
            </p>
          </div>

          <p className="text-sm text-[#6B7280]">
            If you need immediate assistance, please contact your church
            administrator directly.
          </p>

          <Link
            href="/login"
            className="block w-full rounded-lg bg-[#000080] px-4 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
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
              required
            />
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Send Reset Request
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
