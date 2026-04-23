"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import { directoryContacts } from "@/lib/mock-data";

const groups = ["All", "Pastoral", "Deacons", "Music", "Youth", "Children", "Ushering", "Women", "Men", "Media", "Welfare"];
const ITEMS_PER_PAGE = 8;

export default function DirectoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let contacts = directoryContacts;
    if (selectedGroup !== "All") {
      contacts = contacts.filter((c) => c.group === selectedGroup);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      contacts = contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    return contacts;
  }, [search, selectedGroup]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Church Directory</h1>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-72">
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              onSearch={() => setCurrentPage(1)}
              placeholder="Search directory..."
            />
          </div>
          <select
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
          >
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push("/directory/add")}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          New Contact
        </Button>
      </div>

      {paginated.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center text-sm text-gray-400">
          No contacts found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginated.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E5E7EB]">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-[#111827]">{c.name}</h3>
              <p className="mt-0.5 text-xs text-[#6B7280]">{c.role}</p>
              <p className="mt-2 text-xs text-[#374151]">{c.phone}</p>
              <p className="text-xs text-[#374151]">{c.email}</p>
              <button
                onClick={() => router.push(`/directory/${c.id}`)}
                className="mt-3 text-xs font-medium text-[#000080] underline transition-colors hover:text-[#000066]"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </DashboardLayout>
  );
}
