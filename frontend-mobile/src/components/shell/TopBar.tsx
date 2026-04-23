"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

export default function TopBar({ title, subtitle, showBack = false, right }: TopBarProps) {
  const router = useRouter();
  return (
    <div
      className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/90 backdrop-blur"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex h-14 items-center gap-2 px-4">
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="press -ml-2 flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-semibold leading-tight text-[#0F172A]">
            {title}
          </p>
          {subtitle ? (
            <p className="truncate text-[11px] leading-tight text-[#6B7280]">{subtitle}</p>
          ) : null}
        </div>
        {right}
      </div>
    </div>
  );
}
