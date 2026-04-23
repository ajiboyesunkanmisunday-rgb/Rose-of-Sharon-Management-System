"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import { Eye, EyeOff } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || !next || !confirm) {
      setError("All fields are required.");
      return;
    }
    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    setError(null);
    router.push("/profile");
  };

  return (
    <AppShell title="Change Password" showBack hideTabBar>
      <form onSubmit={submit} className="space-y-4 pb-20">
        <PasswordField label="Current Password" value={current} onChange={setCurrent} show={show} onToggle={() => setShow((s) => !s)} />
        <PasswordField label="New Password" value={next} onChange={setNext} show={show} onToggle={() => setShow((s) => !s)} />
        <PasswordField label="Confirm New Password" value={confirm} onChange={setConfirm} show={show} onToggle={() => setShow((s) => !s)} />

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
            {error}
          </p>
        )}

        <p className="text-xs text-[#6B7280]">
          Use at least 8 characters, mixing letters, numbers, and symbols.
        </p>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
          <button type="submit" className="press w-full rounded-xl bg-[#000080] py-3.5 text-sm font-semibold text-white">
            Update Password
          </button>
        </div>
      </form>
    </AppShell>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[#374151]">{label}</span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 pr-11 text-sm text-[#0F172A] outline-none focus:border-[#000080]"
        />
        <button
          type="button"
          onClick={onToggle}
          className="press absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#6B7280]"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}
