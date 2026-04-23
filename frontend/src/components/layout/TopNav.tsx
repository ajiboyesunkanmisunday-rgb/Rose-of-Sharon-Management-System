"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

export default function TopNav() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="fixed left-[322px] right-0 top-0 z-30 flex h-16 items-center justify-end border-b border-[#E5E7EB] bg-white px-6">
      {/* User Profile */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50"
        >
          <div className="text-right">
            <p className="text-sm font-bold text-[#1F2937]">John Cooper</p>
            <p className="text-xs text-[#6B7280]">johncoopl23@gmail.com</p>
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
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
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
