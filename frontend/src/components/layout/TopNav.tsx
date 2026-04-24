"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";

interface TopNavProps {
  onMenuOpen?: () => void;
}

export default function TopNav({ onMenuOpen }: TopNavProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center border-b border-[#E5E7EB] bg-white px-4 lg:left-[322px] lg:px-6">
      {/* Hamburger — mobile & tablet only */}
      <button
        onClick={onMenuOpen}
        className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg text-[#000080] hover:bg-gray-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={22} strokeWidth={1.8} />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Profile */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#1F2937]">John Cooper</p>
            <p className="text-xs text-[#6B7280]">johncoopl23@gmail.com</p>
          </div>
          {/* Avatar initials on small screens */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#B5B5F3] text-xs font-bold text-[#000080] sm:hidden">
            JC
          </div>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 top-full z-50 mt-1 w-48 max-w-[calc(100vw-1rem)] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <a
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                My Profile
              </a>
              <a
                href="/settings/general"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Settings
              </a>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/login");
                }}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
              >
                Log Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
