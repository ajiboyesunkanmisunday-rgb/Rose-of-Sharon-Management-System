"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import DateRangePicker from "@/components/ui/DateRangePicker";
import StatusFilterTabs from "@/components/ui/StatusFilterTabs";
import SendSMSModal from "@/components/user-management/SendSMSModal";
import SendEmailModal from "@/components/user-management/SendEmailModal";
import {
  getBirthdays,
  getWeddingAnniversaries,
  getCelebrations,
  markCelebrationsAsTreated,
  type UserResponse,
  type CelebrationResponse,
} from "@/lib/api";
import { PartyPopper } from "lucide-react";

type Tab = "birthdays" | "anniversaries" | "thanksgiving";
type ThanksgivingStatus = "All" | "PENDING" | "TREATED";

const ITEMS_PER_PAGE = 50;
const CELEB_PER_PAGE = 10;

function fullName(u?: { firstName?: string; middleName?: string; lastName?: string } | null) {
  if (!u) return "—";
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

function monthName(m?: number) {
  if (!m) return "—";
  return new Date(2000, m - 1, 1).toLocaleDateString("en-US", { month: "short" });
}

function fmtBirthday(u: UserResponse) {
  if (!u.dayOfBirth || !u.monthOfBirth) return "—";
  return `${monthName(u.monthOfBirth)} ${u.dayOfBirth}`;
}

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function todayISO() { return new Date().toISOString().slice(0, 10); }
function monthStartISO() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), 1).toISOString().slice(0, 10);
}

function isoToParts(iso: string) {
  const [, mm, dd] = iso.split("-").map(Number);
  return { day: dd, month: mm };
}

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
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

export default function CelebrationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("birthdays");
  const [search, setSearch] = useState("");

  // Birthdays
  const [birthdays, setBirthdays] = useState<UserResponse[]>([]);
  const [bdLoading, setBdLoading] = useState(false);
  const [bdError, setBdError] = useState("");
  const [bFrom, setBFrom] = useState(monthStartISO());
  const [bTo, setBTo] = useState(todayISO());

  // Anniversaries
  const [anniversaries, setAnniversaries] = useState<UserResponse[]>([]);
  const [annLoading, setAnnLoading] = useState(false);
  const [annError, setAnnError] = useState("");
  const [aFrom, setAFrom] = useState(monthStartISO());
  const [aTo, setATo] = useState(todayISO());

  // Thanksgiving (Celebrations)
  const [celebrations, setCelebrations] = useState<CelebrationResponse[]>([]);
  const [celebLoading, setCelebLoading] = useState(false);
  const [celebError, setCelebError] = useState("");
  const [celebPage, setCelebPage] = useState(1);
  const [celebTotalPages, setCelebTotalPages] = useState(1);
  const [celebTotalItems, setCelebTotalItems] = useState(0);
  const [tgStatus, setTgStatus] = useState<ThanksgivingStatus>("All");

  // Modals
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [smsTarget, setSmsTarget] = useState<UserResponse | null>(null);
  const [emailTarget, setEmailTarget] = useState<UserResponse | null>(null);

  const tabs: { key: Tab; label: string }[] = [
    { key: "birthdays", label: "Birthdays" },
    { key: "anniversaries", label: "Wedding Anniversaries" },
    { key: "thanksgiving", label: "Thanksgiving" },
  ];

  // ── Fetch birthdays ──────────────────────────────────────────────────────────
  const fetchBirthdays = useCallback(async (from: string, to: string) => {
    setBdLoading(true);
    setBdError("");
    try {
      const f = isoToParts(from);
      const t = isoToParts(to);
      const res = await getBirthdays(f.day, f.month, t.day, t.month, 0, ITEMS_PER_PAGE);
      setBirthdays(res.content ?? []);
    } catch (err) {
      setBdError(err instanceof Error ? err.message : "Failed to load birthdays.");
    } finally {
      setBdLoading(false);
    }
  }, []);

  // ── Fetch anniversaries ──────────────────────────────────────────────────────
  const fetchAnniversaries = useCallback(async (from: string, to: string) => {
    setAnnLoading(true);
    setAnnError("");
    try {
      const f = isoToParts(from);
      const t = isoToParts(to);
      const res = await getWeddingAnniversaries(f.day, f.month, t.day, t.month, 0, ITEMS_PER_PAGE);
      setAnniversaries(res.content ?? []);
    } catch (err) {
      setAnnError(err instanceof Error ? err.message : "Failed to load anniversaries.");
    } finally {
      setAnnLoading(false);
    }
  }, []);

  // ── Fetch thanksgiving / celebrations ───────────────────────────────────────
  const fetchCelebrations = useCallback(async (page: number) => {
    setCelebLoading(true);
    setCelebError("");
    try {
      const res = await getCelebrations(page - 1, CELEB_PER_PAGE);
      setCelebrations(res.content ?? []);
      setCelebTotalPages(res.totalPages ?? 1);
      setCelebTotalItems(res.totalElements ?? 0);
    } catch (err) {
      setCelebError(err instanceof Error ? err.message : "Failed to load thanksgiving entries.");
    } finally {
      setCelebLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "birthdays") fetchBirthdays(bFrom, bTo);
  }, [activeTab, bFrom, bTo, fetchBirthdays]);

  useEffect(() => {
    if (activeTab === "anniversaries") fetchAnniversaries(aFrom, aTo);
  }, [activeTab, aFrom, aTo, fetchAnniversaries]);

  useEffect(() => {
    if (activeTab === "thanksgiving") fetchCelebrations(celebPage);
  }, [activeTab, celebPage, fetchCelebrations]);

  // ── Filter helpers ───────────────────────────────────────────────────────────
  const q = search.toLowerCase().trim();

  const filteredBirthdays = birthdays.filter((u) => {
    if (!q) return true;
    return fullName(u).toLowerCase().includes(q);
  });

  const filteredAnniversaries = anniversaries.filter((u) => {
    if (!q) return true;
    const name = fullName(u).toLowerCase();
    const spouseName = u.spouse ? fullName(u.spouse).toLowerCase() : "";
    return name.includes(q) || spouseName.includes(q);
  });

  const filteredCelebrations = celebrations.filter((c) => {
    if (tgStatus !== "All" && c.celebrationStatus !== tgStatus) return false;
    if (!q) return true;
    return fullName(c.requester).toLowerCase().includes(q);
  });

  // ── Mark treated ─────────────────────────────────────────────────────────────
  const handleMarkTreated = async (id: string) => {
    try {
      await markCelebrationsAsTreated([id]);
      fetchCelebrations(celebPage);
    } catch (err) {
      console.error("Mark treated failed:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7]">
              <PartyPopper className="h-6 w-6 text-[#D97706]" />
            </div>
            <div>
              <h1 className="text-[28px] font-bold text-[#000000]">Celebrations</h1>
              <p className="text-sm text-[#6B7280]">Birthdays, anniversaries, and thanksgiving celebrations</p>
            </div>
          </div>
          {activeTab === "thanksgiving" ? (
            <Button
              variant="primary"
              onClick={() => router.push("/celebrations/add?type=Thanksgiving")}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            >
              Add Thanksgiving Request
            </Button>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-6 border-b border-[#E5E7EB]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSearch(""); }}
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

      {/* ── Birthdays ── */}
      {activeTab === "birthdays" && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="w-full sm:w-72">
              <SearchBar value={search} onChange={setSearch} onSearch={() => {}} placeholder="Search birthdays..." />
            </div>
            <DateRangePicker from={bFrom} to={bTo} onFromChange={setBFrom} onToChange={setBTo} />
          </div>

          {bdError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {bdError} — <button className="font-medium underline" onClick={() => fetchBirthdays(bFrom, bTo)}>Retry</button>
            </div>
          )}

          {bdLoading ? (
            <div className="py-12 text-center text-gray-400">Loading…</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBirthdays.map((u) => (
                <div key={u.id} className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5E7EB]">
                      {u.profilePictureUrl
                        ? <img src={u.profilePictureUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                        : <UserIcon />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111827]">{fullName(u)}</p>
                      <p className="text-xs text-[#6B7280]">{fmtBirthday(u)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setSmsTarget(u); setShowSMSModal(true); }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#000080] px-3 py-1.5 text-xs font-medium text-[#000080] hover:bg-[#000080]/5"
                    >
                      <MessageIcon /> Send SMS
                    </button>
                    <button
                      onClick={() => { setEmailTarget(u); setShowEmailModal(true); }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#000080] px-3 py-1.5 text-xs font-medium text-[#000080] hover:bg-[#000080]/5"
                    >
                      <MailIcon /> Send Email
                    </button>
                  </div>
                </div>
              ))}
              {filteredBirthdays.length === 0 && (
                <div className="col-span-3 py-8 text-center text-gray-400">No birthdays found.</div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Anniversaries ── */}
      {activeTab === "anniversaries" && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="w-full sm:w-72">
              <SearchBar value={search} onChange={setSearch} onSearch={() => {}} placeholder="Search anniversaries..." />
            </div>
            <DateRangePicker from={aFrom} to={aTo} onFromChange={setAFrom} onToChange={setATo} />
          </div>

          {annError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {annError} — <button className="font-medium underline" onClick={() => fetchAnniversaries(aFrom, aTo)}>Retry</button>
            </div>
          )}

          {annLoading ? (
            <div className="py-12 text-center text-gray-400">Loading…</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAnniversaries.map((u) => (
                <div key={u.id} className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5E7EB]">
                      {u.couplePictureUrl
                        ? <img src={u.couplePictureUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                        : <HeartIcon />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111827]">
                        {fullName(u)}{u.spouse ? ` & ${fullName(u.spouse)}` : ""}
                      </p>
                      <p className="text-xs text-[#6B7280]">{fmtBirthday(u)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setSmsTarget(u); setShowSMSModal(true); }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#000080] px-3 py-1.5 text-xs font-medium text-[#000080] hover:bg-[#000080]/5"
                    >
                      <MessageIcon /> Send SMS
                    </button>
                    <button
                      onClick={() => { setEmailTarget(u); setShowEmailModal(true); }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#000080] px-3 py-1.5 text-xs font-medium text-[#000080] hover:bg-[#000080]/5"
                    >
                      <MailIcon /> Send Email
                    </button>
                  </div>
                </div>
              ))}
              {filteredAnniversaries.length === 0 && (
                <div className="col-span-3 py-8 text-center text-gray-400">No anniversaries found.</div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Thanksgiving ── */}
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
                { value: "PENDING", label: "Pending" },
                { value: "TREATED", label: "Treated" },
              ]}
              active={tgStatus}
              onChange={(v) => setTgStatus(v as ThanksgivingStatus)}
            />
          </div>

          {celebError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {celebError} — <button className="font-medium underline" onClick={() => fetchCelebrations(celebPage)}>Retry</button>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F3F4F6]">
                  <th className="px-4 py-4 text-sm font-bold text-[#000080]">Name</th>
                  <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Type</th>
                  <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Submitted</th>
                  <th className="px-4 py-4 text-sm font-bold text-[#000080]">Date</th>
                  <th className="px-4 py-4 text-sm font-bold text-[#000080]">Status</th>
                  <th className="px-4 py-4" />
                </tr>
              </thead>
              <tbody>
                {celebLoading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
                ) : filteredCelebrations.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No thanksgiving entries found.</td></tr>
                ) : (
                  filteredCelebrations.map((row) => (
                    <tr key={row.id} className="border-b border-[#F3F4F6] hover:bg-gray-50" style={{ height: "56px" }}>
                      <td className="px-4 py-3 text-sm text-[#374151]">{fullName(row.requester)}</td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                        {(row.celebrationType ?? "—").replace(/_/g, " ")}
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">{fmtDate(row.createdOn)}</td>
                      <td className="px-4 py-3 text-sm text-[#374151]">{fmtDate(row.date)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          row.celebrationStatus === "TREATED"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {(row.celebrationStatus ?? "PENDING").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ActionDropdown
                          actions={[
                            { label: "View", onClick: () => router.push(`/celebrations/${row.id}`) },
                            ...(row.celebrationStatus !== "TREATED"
                              ? [{ label: "Mark as Treated", onClick: () => handleMarkTreated(row.id) }]
                              : []),
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={celebPage}
              totalPages={celebTotalPages}
              totalItems={celebTotalItems}
              onPageChange={setCelebPage}
            />
          </div>
        </>
      )}

      <SendSMSModal
        isOpen={showSMSModal}
        onClose={() => { setShowSMSModal(false); setSmsTarget(null); }}
        selectedCount={1}
      />
      <SendEmailModal
        isOpen={showEmailModal}
        onClose={() => { setShowEmailModal(false); setEmailTarget(null); }}
        selectedCount={1}
      />
    </DashboardLayout>
  );
}
