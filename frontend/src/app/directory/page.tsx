"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";

interface Contact {
  id: string;
  name: string;
  role: string;
  group: string;
  phone: string;
  email: string;
}

const mockContacts: Contact[] = [
  { id: "c1", name: "Pastor James Adewale", role: "Senior Pastor", group: "Pastoral", phone: "+234 801 234 5678", email: "james.adewale@church.org" },
  { id: "c2", name: "Grace Nwosu", role: "Associate Pastor", group: "Pastoral", phone: "+234 802 345 6789", email: "grace.nwosu@church.org" },
  { id: "c3", name: "Emmanuel Okafor", role: "Deacon", group: "Deacons", phone: "+234 803 456 7890", email: "emmanuel.okafor@church.org" },
  { id: "c4", name: "Sarah Bamidele", role: "Choir Director", group: "Music", phone: "+234 804 567 8901", email: "sarah.bamidele@church.org" },
  { id: "c5", name: "David Okonkwo", role: "Youth Leader", group: "Youth", phone: "+234 805 678 9012", email: "david.okonkwo@church.org" },
  { id: "c6", name: "Blessing Okoro", role: "Children's Teacher", group: "Children", phone: "+234 806 789 0123", email: "blessing.okoro@church.org" },
  { id: "c7", name: "John Michael", role: "Usher Coordinator", group: "Ushering", phone: "+234 807 890 1234", email: "john.michael@church.org" },
  { id: "c8", name: "Ruth Balogun", role: "Women's Leader", group: "Women", phone: "+234 808 901 2345", email: "ruth.balogun@church.org" },
  { id: "c9", name: "Peter Adewale", role: "Men's Leader", group: "Men", phone: "+234 809 012 3456", email: "peter.adewale@church.org" },
  { id: "c10", name: "Mary Eze", role: "Media Coordinator", group: "Media", phone: "+234 810 123 4567", email: "mary.eze@church.org" },
  { id: "c11", name: "Samuel Chukwu", role: "Technical Director", group: "Media", phone: "+234 811 234 5678", email: "samuel.chukwu@church.org" },
  { id: "c12", name: "Esther Obi", role: "Welfare Secretary", group: "Welfare", phone: "+234 812 345 6789", email: "esther.obi@church.org" },
];

const groups = ["All", "Pastoral", "Deacons", "Music", "Youth", "Children", "Ushering", "Women", "Men", "Media", "Welfare"];

const ITEMS_PER_PAGE = 8;

export default function DirectoryPage() {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredContacts = useMemo(() => {
    let contacts = mockContacts;

    if (selectedGroup !== "All") {
      contacts = contacts.filter((c) => c.group === selectedGroup);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      contacts = contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.role.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query)
      );
    }

    return contacts;
  }, [search, selectedGroup]);

  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Church Directory</h1>
      </div>

      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="w-72">
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
          className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#374151] focus:border-[#000080] focus:outline-none focus:ring-1 focus:ring-[#000080]"
        >
          {groups.map((group) => (
            <option key={group} value={group}>
              {group === "All" ? "All Groups" : group}
            </option>
          ))}
        </select>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedContacts.map((contact) => (
          <div
            key={contact.id}
            className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center"
          >
            {/* Avatar */}
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F4F6]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            {/* Info */}
            <p className="text-sm font-bold text-[#111827]">{contact.name}</p>
            <p className="mt-0.5 text-sm text-[#6B7280]">{contact.role} - {contact.group}</p>
            <p className="mt-2 text-sm text-[#374151]">{contact.phone}</p>
            <p className="text-sm text-[#374151]">{contact.email}</p>

            {/* View Profile */}
            <button
              onClick={() => console.log("View profile:", contact.id)}
              className="mt-3 text-sm font-medium text-[#000080] underline hover:text-[#000066]"
            >
              View Profile
            </button>
          </div>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-400">
          No contacts found.
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredContacts.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </DashboardLayout>
  );
}
