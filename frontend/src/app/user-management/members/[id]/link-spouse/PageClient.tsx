"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { searchMembers, linkSpouse, type UserResponse } from "@/lib/api";

export default function LinkSpousePage() {
  const router = useRouter();
  const params = useParams();
  const paramId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const [id, setId] = useState(paramId);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 2] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [search,      setSearch]      = useState("");
  const [results,     setResults]     = useState<UserResponse[]>([]);
  const [searching,   setSearching]   = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [linking,     setLinking]     = useState<string | null>(null);
  const [error,       setError]       = useState("");

  const inputStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

  const handleSearch = useCallback(async () => {
    if (!search.trim()) return;
    setSearching(true);
    setHasSearched(true);
    setError("");
    try {
      const res = await searchMembers(search.trim(), 0, 10);
      setResults(res.content ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setSearching(false);
    }
  }, [search]);

  const handleLink = async (spouseId: string) => {
    if (!id) return;
    setLinking(spouseId);
    setError("");
    try {
      await linkSpouse(id, spouseId);
      router.push(`/user-management/members/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to link spouse.");
      setLinking(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">User Management</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#000080] transition-colors hover:text-[#000066]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-[#000080]">Link Spouse</h2>
        </div>
      </div>

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <h2 className="mb-6 text-[18px] font-bold text-[#000000]">Search for a Member</h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Type name, email or phone…"
              className={inputStyles}
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-4 top-1/2 -translate-y-1/2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <Button variant="primary" onClick={handleSearch} disabled={searching || !search.trim()}>
            {searching ? "Searching…" : "Search"}
          </Button>
        </div>

        {!hasSearched ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="mt-4 text-sm text-[#6B7280]">Search for a member to link as spouse</p>
          </div>
        ) : searching ? (
          <div className="flex h-24 items-center justify-center text-gray-400">Searching…</div>
        ) : results.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#6B7280]">No members found matching your search.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F3F4F6]">
                  <th className="px-4 py-4 text-sm font-bold text-[#000080]">Name</th>
                  <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Phone</th>
                  <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Email</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {results.map((member) => (
                  <tr key={member.id} className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50" style={{ height: "56px" }}>
                    <td className="px-4 py-3 text-sm text-[#374151]">
                      {[member.firstName, member.middleName, member.lastName].filter(Boolean).join(" ")}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                      {member.phoneNumber}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                      {member.email}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="primary"
                        onClick={() => handleLink(member.id)}
                        disabled={linking === member.id}
                      >
                        {linking === member.id ? "Linking…" : "Link"}
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
