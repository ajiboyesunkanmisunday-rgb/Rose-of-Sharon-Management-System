"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import ActionDropdown from "@/components/ui/ActionDropdown";
import SendSMSModal from "@/components/user-management/SendSMSModal";
import SendEmailModal from "@/components/user-management/SendEmailModal";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";

type Tab = "birthdays" | "anniversaries" | "thanksgiving";

// --- Mock Data ---

interface BirthdayCard {
  id: string;
  name: string;
  date: string;
}

interface AnniversaryCard {
  id: string;
  couple: string;
  date: string;
  years: number;
}

interface ThanksgivingRow {
  id: string;
  name: string;
  type: string;
  date: string;
  status: "Scheduled" | "Completed";
}

const birthdayCards: BirthdayCard[] = [
  { id: "b1", name: "John Michael", date: "Apr 16" },
  { id: "b2", name: "Sarah Bamidele", date: "Apr 18" },
  { id: "b3", name: "David Okonkwo", date: "Apr 19" },
  { id: "b4", name: "Grace Adeyemi", date: "Apr 20" },
  { id: "b5", name: "Emmanuel Nwosu", date: "Apr 21" },
  { id: "b6", name: "Blessing Okoro", date: "Apr 22" },
];

const anniversaryCards: AnniversaryCard[] = [
  { id: "a1", couple: "John & Sarah Michael", date: "Apr 20", years: 5 },
  { id: "a2", couple: "David & Grace Okonkwo", date: "Apr 21", years: 10 },
  { id: "a3", couple: "Peter & Mary Adewale", date: "Apr 22", years: 3 },
  { id: "a4", couple: "James & Ruth Balogun", date: "Apr 23", years: 8 },
];

const thanksgivingRows: ThanksgivingRow[] = [
  { id: "t1", name: "John Michael", type: "Child Dedication", date: "Apr 25, 2026", status: "Scheduled" },
  { id: "t2", name: "Sarah Bamidele", type: "Birthday", date: "Apr 18, 2026", status: "Completed" },
  { id: "t3", name: "David Okonkwo", type: "Wedding", date: "May 2, 2026", status: "Scheduled" },
  { id: "t4", name: "Grace Adeyemi", type: "Birthday", date: "Apr 20, 2026", status: "Scheduled" },
  { id: "t5", name: "Emmanuel Nwosu", type: "Child Dedication", date: "May 10, 2026", status: "Completed" },
];

// --- Icons ---

const GiftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export default function CelebrationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("birthdays");
  const [search, setSearch] = useState("");

  // Modal states
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const tabs: { key: Tab; label: string }[] = [
    { key: "birthdays", label: "Birthdays" },
    { key: "anniversaries", label: "Wedding Anniversaries" },
    { key: "thanksgiving", label: "Thanksgiving" },
  ];

  // Filtered data
  const filteredBirthdays = useMemo(() => {
    if (!search.trim()) return birthdayCards;
    const query = search.toLowerCase();
    return birthdayCards.filter((b) => b.name.toLowerCase().includes(query));
  }, [search]);

  const filteredAnniversaries = useMemo(() => {
    if (!search.trim()) return anniversaryCards;
    const query = search.toLowerCase();
    return anniversaryCards.filter((a) => a.couple.toLowerCase().includes(query));
  }, [search]);

  const filteredThanksgiving = useMemo(() => {
    if (!search.trim()) return thanksgivingRows;
    const query = search.toLowerCase();
    return thanksgivingRows.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.type.toLowerCase().includes(query)
    );
  }, [search]);

  const handleSearch = () => {};

  const handleDeleteClick = (id: string) => {
    setSelectedItemId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    console.log("Delete item:", selectedItemId);
    setShowDeleteModal(false);
    setSelectedItemId(null);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Celebrations</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-6 border-b border-[#E5E7EB]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setSearch("");
            }}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[#000080] text-[#000080]"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Birthdays Tab */}
      {activeTab === "birthdays" && (
        <>
          {/* Top bar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="w-72">
              <SearchBar
                value={search}
                onChange={setSearch}
                onSearch={handleSearch}
                placeholder="Search birthdays..."
              />
            </div>
            <Button
              variant="primary"
              onClick={() => setShowSMSModal(true)}
              icon={<GiftIcon />}
            >
              Send Greetings
            </Button>
          </div>

          {/* Section header */}
          <h3 className="mb-4 text-lg font-bold text-[#000080]">This Week</h3>

          {/* Cards grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBirthdays.map((card) => (
              <div
                key={card.id}
                className="rounded-xl border border-[#E5E7EB] bg-white p-5"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5E7EB]">
                    <UserIcon />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">{card.name}</p>
                    <p className="text-xs text-[#6B7280]">{card.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSMSModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#000080] px-3 py-1.5 text-xs font-medium text-[#000080] transition-colors hover:bg-[#000080]/5"
                  >
                    <MessageIcon />
                    Send SMS
                  </button>
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#000080] px-3 py-1.5 text-xs font-medium text-[#000080] transition-colors hover:bg-[#000080]/5"
                  >
                    <MailIcon />
                    Send Email
                  </button>
                </div>
              </div>
            ))}
            {filteredBirthdays.length === 0 && (
              <div className="col-span-3 py-8 text-center text-gray-400">
                No birthdays found.
              </div>
            )}
          </div>
        </>
      )}

      {/* Wedding Anniversaries Tab */}
      {activeTab === "anniversaries" && (
        <>
          {/* Top bar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="w-72">
              <SearchBar
                value={search}
                onChange={setSearch}
                onSearch={handleSearch}
                placeholder="Search anniversaries..."
              />
            </div>
            <Button
              variant="primary"
              onClick={() => setShowSMSModal(true)}
              icon={<GiftIcon />}
            >
              Send Greetings
            </Button>
          </div>

          {/* Section header */}
          <h3 className="mb-4 text-lg font-bold text-[#000080]">This Week</h3>

          {/* Cards grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAnniversaries.map((card) => (
              <div
                key={card.id}
                className="rounded-xl border border-[#E5E7EB] bg-white p-5"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5E7EB]">
                    <HeartIcon />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">{card.couple}</p>
                    <p className="text-xs text-[#6B7280]">
                      {card.date} ({card.years}
                      {card.years === 1 ? "st" : card.years === 2 ? "nd" : card.years === 3 ? "rd" : "th"} Anniversary)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSMSModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#000080] px-3 py-1.5 text-xs font-medium text-[#000080] transition-colors hover:bg-[#000080]/5"
                  >
                    <MessageIcon />
                    Send SMS
                  </button>
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#000080] px-3 py-1.5 text-xs font-medium text-[#000080] transition-colors hover:bg-[#000080]/5"
                  >
                    <MailIcon />
                    Send Email
                  </button>
                </div>
              </div>
            ))}
            {filteredAnniversaries.length === 0 && (
              <div className="col-span-3 py-8 text-center text-gray-400">
                No anniversaries found.
              </div>
            )}
          </div>
        </>
      )}

      {/* Thanksgiving Tab */}
      {activeTab === "thanksgiving" && (
        <>
          {/* Top bar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="w-72">
              <SearchBar
                value={search}
                onChange={setSearch}
                onSearch={handleSearch}
                placeholder="Search thanksgiving..."
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F3F4F6]">
                  <th className="px-4 py-4 text-sm font-bold text-[#000080]">Name</th>
                  <th className="px-4 py-4 text-sm font-bold text-[#000080]">Thanksgiving Type</th>
                  <th className="px-4 py-4 text-sm font-bold text-[#000080]">Date</th>
                  <th className="px-4 py-4 text-sm font-bold text-[#000080]">Status</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredThanksgiving.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                    style={{ height: "56px" }}
                  >
                    <td className="px-4 py-3 text-sm text-[#374151]">{row.name}</td>
                    <td className="px-4 py-3 text-sm text-[#374151]">{row.type}</td>
                    <td className="px-4 py-3 text-sm text-[#374151]">{row.date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          row.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ActionDropdown
                        actions={[
                          {
                            label: "View",
                            onClick: () => console.log("View:", row.id),
                          },
                          {
                            label: "Edit",
                            onClick: () => console.log("Edit:", row.id),
                          },
                          {
                            label: "Delete",
                            onClick: () => handleDeleteClick(row.id),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
                {filteredThanksgiving.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      No thanksgiving entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modals */}
      <SendSMSModal
        isOpen={showSMSModal}
        onClose={() => setShowSMSModal(false)}
        selectedCount={1}
      />
      <SendEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        selectedCount={1}
      />
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedItemId(null);
        }}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this thanksgiving entry?"
      />
    </DashboardLayout>
  );
}
