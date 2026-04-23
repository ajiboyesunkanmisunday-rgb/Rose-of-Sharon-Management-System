"use client";

import { Search } from "lucide-react";

interface SearchFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchField({ value, onChange, placeholder = "Search..." }: SearchFieldProps) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-xl bg-white px-3 ring-1 ring-[#E5E7EB]">
      <Search size={18} className="text-[#9CA3AF]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#9CA3AF]"
      />
    </div>
  );
}
