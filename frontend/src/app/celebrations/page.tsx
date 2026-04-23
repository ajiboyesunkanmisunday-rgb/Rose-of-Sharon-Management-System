"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import ActionDropdown from "@/components/ui/ActionDropdown";
import DateRangePicker from "@/components/ui/DateRangePicker";
import StatusFilterTabs from "@/components/ui/StatusFilterTabs";
import SendSMSModal from "@/components/user-management/SendSMSModal";
import SendEmailModal from "@/components/user-management/SendEmailModal";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { celebrations as celebrationsData } from "@/lib/mock-data";
import { toCSV, downloadCSV } from "@/lib/csv";
import { Celebration } from "@/lib/types";

type Tab = "birthdays" | "anniversaries" | "thanksgiving";
type ThanksgivingStatus = "All" | "Pending" | "Treated";

// Parse "MM/DD/YYYY" to Date
const parseDate = (s: string): Date => {
  const [mm, dd, yyyy] = s.split("/").map(Number);
  return new Date(yyyy, (mm || 1) - 1, dd || 1);
};

// Format "MM/DD/YYYY" to "Mon D, YYYY"
const formatDisplay = (s: string): string => {
  const d = parseDate(s);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatShort = (s: string): string => {
  const d = parseDate(s);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Convert "MM/DD/YYYY" to ISO yyyy-mm-dd
const toISO = (s: string): string => {
  const d = parseDate(s);
  return d.toISOString().slice(0, 10);
};

const monthStartISO = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
};

const todayISO = (): string => new Date().toISOString().slice(0, 10);

// photo filename parts from date "MM/DD/YYYY" => MonthDay like "Apr16"
const monthDayTag = (s: string): string => {
  const d = parseDate(s);
  const mm = d.toLocaleDateString("en-US", { month: "short" });
  return `${mm}${d.getDate()}`;
};

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

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function CelebrationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("birthdays");
  const [search, setSearch] = useState("");

  const [bFrom, setBFrom] = useState(monthStartISO());
  const [bTo, setBTo] = useState(todayISO());
  const [aFrom, setAFrom] = useState(monthStartISO());
  const [aTo, setATo] = useState(todayISO());

  const [tgStatus, setTgStatus] = useState<ThanksgivingStatus>("All");
  const [thanksgivingList, setThanksgivingList] = useState<Celebration[]>(
    celebrationsData.filter((c) => c.type === "Thanksgiving")
  );

  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const tabs: { key: Tab; label: string }[] = [
    { key: "birthdays", label: "Birthdays" },
    { key: "anniversaries", label: "Wedding Anniversaries" },
    { key: "thanksgiving", label: "Thanksgiving" },
  ];

  const birthdayItems = celebrationsData.filter((c) => c.type === "Birthday");
  const anniversaryItems = celebrationsData.filter((c) => c.type === "Wedding Anniversary");

  const withinRange = (dateStr: string, from: string, to: string) => {
    const d = parseDate(dateStr);
    const f = new Date(from);
    const t = new Date(to);
    return d >= f && d <= t;
  };

  const filteredBirthdays = useMemo(() => {
    let list = birthdayItems.filter((b) => withinRange(b.date, bFrom, bTo));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) => b.name.toLowerCase().includes(q));
    }
    return list;
  }, [birthdayItems, bFrom, bTo, search]);

  const filteredAnniversaries = useMemo(() => {
    let list = anniversaryItems.filter((a) => withinRange(a.date, aFrom, aTo));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q));
    }
    return list;
  }, [anniversaryItems, aFrom, aTo, search]);

  const filteredThanksgiving = useMemo(() => {
    let list = thanksgivingList;
    if (tgStatus !== "All") {
      list = list.filter((t) => t.status === tgStatus);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }
    return list;
  }, [thanksgivingList, tgStatus, search]);

  const handleDeleteClick = (id: string) => {
    setSelectedItemId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    console.log("Delete item:", selectedItemId);
    setShowDeleteModal(false);
    setSelectedItemId(null);
  };

  const handleMarkTreated = (id: string) => {
    console.log("Mark as treated:", id);
    setThanksgivingList((prev) => prev.map((t) => (t.id === id ? { ...t, status: "Treated" } : t)));
  };

  const exportBirthdayPhotos = () => {
    const rows = filteredBirthdays.map((b) => {
      const [first, ...rest] = b.name.trim().split(" ");
      const last = rest.join("_") || "Member";
      return { filename: `${first}_${last}_${monthDayTag(b.date)}.jpg`, name: b.name, date: formatDisplay(b.date) };
    });
    const csv = toCSV(rows, [
      { key: "filename", label: "Picture Filename" },
      { key: "name", label: "Name" },
      { key: "date", label: "Birthday" },
    ]);
    downloadCSV(csv, `birthday-photos-${todayISO()}.csv`);
  };

  const exportAnniversaryPhotos = () => {
    const rows = filteredAnniversaries.map((a) => {
      // parse "First & Last Lastname" -> "First_and_Second_MonthDay.jpg"
      const names = a.name.replace("&", "and").split(/\s+/).filter(Boolean).join("_");
      return { filename: `${names}_${monthDayTag(a.date)}.jpg`, couple: a.name, date: formatDisplay(a.date) };
    });
    const csv = toCSV(rows, [
      { key: "filename", label: "Picture Filename" },
      { key: "couple", label: "Couple" },
      { key: "date", label: "Anniversary" },
    ]);
    downloadCSV(csv, `anniversary-photos-${todayISO()}.csv`);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-[#000000]">Celebrations</h1>
          {activeTab !== "thanksgiving" && (
            <Button
              variant="primary"
              onClick={() => router.push("/celebrations/add")}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            >
              Add Celebration
            </Button>
          )}
          {activeTab === "thanksgiving" && (
            <Button
              variant="primary"
              onClick={() => router.push("/celebrations/add?type=Thanksgiving")}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            >
              Add Thanksgiving Request
            </Button>
          )}
        </div>
      </div>

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

      {activeTab === "birthdays" && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-full sm:w-72">
                <SearchBar value={search} onChange={setSearch} onSearch={() => {}} placeholder="Search birthdays..." />
              </div>
              <DateRangePicker from={bFrom} to={bTo} onFromChange={setBFrom} onToChange={setBTo} />
            </div>
            <Button variant="secondary" onClick={exportBirthdayPhotos} icon={<DownloadIcon />}>
              Filter &amp; Export
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBirthdays.map((card) => (
              <div key={card.id} className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5E7EB]">
                    <UserIcon />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">{card.name}</p>
                    <p className="text-xs text-[#6B7280]">{formatShort(card.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowSMSModal(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#000080] px-3 py-1.5 text-xs font-medium text-[#000080] hover:bg-[#000080]/5">
                    <MessageIcon /> Send SMS
                  </button>
                  <button onClick={() => setShowEmailModal(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#000080] px-3 py-1.5 text-xs font-medium text-[#000080] hover:bg-[#000080]/5">
                    <MailIcon /> Send Email
                  </button>
                </div>
              </div>
            ))}
            {filteredBirthdays.length === 0 && (
              <div className="col-span-3 py-8 text-center text-gray-400">No birthdays found.</div>
            )}
          </div>
        </>
      )}

      {activeTab === "anniversaries" && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-full sm:w-72">
                <SearchBar value={search} onChange={setSearch} onSearch={() => {}} placeholder="Search anniversaries..." />
              </div>
              <DateRangePicker from={aFrom} to={aTo} onFromChange={setAFrom} onToChange={setATo} />
            </div>
            <Button variant="secondary" onClick={exportAnniversaryPhotos} icon={<DownloadIcon />}>
              Filter &amp; Export
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAnniversaries.map((card) => (
              <div key={card.id} className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5E7EB]">
                    <HeartIcon />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">{card.name}</p>
                    <p className="text-xs text-[#6B7280]">
                      {formatShort(card.date)}
                      {card.years ? ` (${card.years}${card.years === 1 ? "st" : card.years === 2 ? "nd" : card.years === 3 ? "rd" : "th"} Anniversary)` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowSMSModal(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#000080] px-3 py-1.5 text-xs font-medium text-[#000080] hover:bg-[#000080]/5">
                    <MessageIcon /> Send SMS
                  </button>
                  <button onClick={() => setShowEmailModal(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#000080] px-3 py-1.5 text-xs font-medium text-[#000080] hover:bg-[#000080]/5">
                    <MailIcon /> Send Email
                  </button>
                </div>
              </div>
            ))}
            {filteredAnniversaries.length === 0 && (
              <div className="col-span-3 py-8 text-center text-gray-400">No anniversaries found.</div>
            )}
          </div>
        </>
      )}

      {activeTab === "thanksgiving" && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="w-full sm:w-72">
              <SearchBar value={search} onChange={setSearch} onSearch={() => {}} placeholder="Search thanksgiving..." />
            </div>
          </div>

          <div className="mb-4">
            <StatusFilterTabs
              options={[
                { value: "All", label: "All" },
                { value: "Pending", label: "Pending" },
                { value: "Treated", label: "Treated" },
              ]}
              active={tgStatus}
              onChange={(v) => setTgStatus(v as ThanksgivingStatus)}
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F3F4F6]">
                  <th className="px-4 py-4 text-sm font-bold text-[#000080]">Name</th>
                  <th className="px-4 py-4 text-sm font-bold text-[#000080]">Created Date</th>
                  <th className="px-4 py-4 text-sm font-bold text-[#000080]">Thanksgiving Date</th>
                  <th className="px-4 py-4 text-sm font-bold text-[#000080]">Status</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredThanksgiving.map((row) => (
                  <tr key={row.id} className="border-b border-[#F3F4F6] hover:bg-gray-50" style={{ height: "56px" }}>
                    <td className="px-4 py-3 text-sm text-[#374151]">{row.name}</td>
                    <td className="px-4 py-3 text-sm text-[#374151]">{row.createdDate ? formatDisplay(row.createdDate) : "—"}</td>
                    <td className="px-4 py-3 text-sm text-[#374151]">{formatDisplay(row.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.status === "Treated" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ActionDropdown
                        actions={[
                          { label: "View", onClick: () => router.push(`/celebrations/${row.id}`) },
                          { label: "Edit", onClick: () => router.push(`/celebrations/${row.id}/edit`) },
                          ...(row.status !== "Treated"
                            ? [{ label: "Mark as Treated", onClick: () => handleMarkTreated(row.id) }]
                            : []),
                          { label: "Delete", onClick: () => handleDeleteClick(row.id) },
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

      <SendSMSModal isOpen={showSMSModal} onClose={() => setShowSMSModal(false)} selectedCount={1} />
      <SendEmailModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} selectedCount={1} />
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
