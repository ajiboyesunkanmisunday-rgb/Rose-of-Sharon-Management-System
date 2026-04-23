"use client";

import { Plus } from "lucide-react";

interface FABProps {
  onClick: () => void;
  label?: string;
}

export default function FAB({ onClick, label = "Add" }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="press fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#000080] text-white shadow-[0_10px_30px_-8px_rgba(0,0,128,0.6)]"
      aria-label={label}
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 80px)" }}
    >
      <Plus size={24} strokeWidth={2.4} />
    </button>
  );
}
