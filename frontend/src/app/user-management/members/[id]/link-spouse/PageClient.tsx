"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { members } from "@/lib/mock-data";

export default function LinkSpousePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const inputStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const query = search.toLowerCase();
    return members.filter(
      (m) =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.phone.includes(query)
    );
  }, [search]);

  const handleLink = (memberId: string) => {
    console.log("Link spouse:", memberId);
    router.back();
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">User Management</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#000080] transition-colors hover:text-[#000066]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-[#000080]">Link Spouse</h2>
        </div>
      </div>

      {/* Search Section */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <h2 className="mb-6 text-[18px] font-bold text-[#000000]">
          Search for a Member
        </h2>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-[#374151]">
            Search by name, email, or phone
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search members..."
              className={inputStyles}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {/* Search Results */}
        {search.trim() === "" ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="mt-4 text-sm text-[#6B7280]">
              Search for a member to link as spouse
            </p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-[#6B7280]">
              No members found matching your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F3F4F6]">
                  <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                    Name
                  </th>
                  <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                    Phone
                  </th>
                  <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                    Email
                  </th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                    style={{ height: "56px" }}
                  >
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      {member.phone}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      {member.email}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="primary"
                        onClick={() => handleLink(member.id)}
                      >
                        Link
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
