"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import BulkActionsBar from "@/components/ui/BulkActionsBar";
import Modal from "@/components/ui/Modal";
import {
  getTestimonies,
  markTestimonyAsRead,
  markTestimonyAsFeatured,
  markTestimonyAsNotFeatured,
  type TestimonyResponse,
} from "@/lib/api";
import { Heart } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const statusBadgeColors: Record<string, string> = {
  READ:     "bg-[#DCFCE7] dark:bg-green-900/30 text-[#16A34A] dark:text-green-300",
  NOT_READ: "bg-[#FEF9C3] dark:bg-yellow-900/30 text-[#CA8A04] dark:text-yellow-300",
  UNREAD:   "bg-[#FEF9C3] dark:bg-yellow-900/30 text-[#CA8A04] dark:text-yellow-300", // legacy fallback
};

function fullName(u?: { firstName?: string; middleName?: string; lastName?: string } | null) {
  if (!u) return "";
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "";
}

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TestimoniesPage() {
  const [list,         setList]         = useState<TestimonyResponse[]>([]);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalItems,   setTotalItems]   = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [apiError,     setApiError]     = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "READ" | "UNREAD">("ALL");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [viewing,      setViewing]      = useState<TestimonyResponse | null>(null);
  const [saving,       setSaving]       = useState(false);

  const fetchTestimonies = useCallback(async (page: number) => {
    setLoading(true);
    setApiError("");
    try {
      const res = await getTestimonies(page - 1, ITEMS_PER_PAGE);
      setList(res.content ?? []);
      setTotalPages(res.totalPages ?? 1);
      setTotalItems(res.totalElements ?? 0);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load testimonies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonies(currentPage);
  }, [currentPage, fetchTestimonies]);

  // Client-side filter (status + search)
  const displayed = list.filter((t) => {
    if (statusFilter !== "ALL") {
      const s = t.testimonyStatus ?? "NOT_READ";
      if (statusFilter === "READ"   && s !== "READ")  return false;
      if (statusFilter === "UNREAD" && s === "READ")  return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.subject.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        fullName(t.owner).toLowerCase().includes(q) ||
        (t.state ?? "").toLowerCase().includes(q) ||
        (t.country ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    const next = new Set(selectedRows);
    displayed.forEach((t) => (checked ? next.add(t.id) : next.delete(t.id)));
    setSelectedRows(next);
  };

  const handleSelectRow = (id: string) => {
    const next = new Set(selectedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedRows(next);
  };

  const allPageSelected = displayed.length > 0 && displayed.every((t) => selectedRows.has(t.id));

  const bulkMarkRead = async () => {
    setSaving(true);
    try {
      await markTestimonyAsRead(Array.from(selectedRows));
      setSelectedRows(new Set());
      fetchTestimonies(currentPage);
    } catch (err) {
      console.error("Mark as read failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const bulkMarkFeatured = async () => {
    setSaving(true);
    try {
      await markTestimonyAsFeatured(Array.from(selectedRows));
      setSelectedRows(new Set());
      fetchTestimonies(currentPage);
    } catch (err) {
      console.error("Mark as featured failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const bulkUnmarkFeatured = async () => {
    setSaving(true);
    try {
      await markTestimonyAsNotFeatured(Array.from(selectedRows));
      setSelectedRows(new Set());
      fetchTestimonies(currentPage);
    } catch (err) {
      console.error("Unmark as featured failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const rowMarkRead = async (id: string) => {
    try {
      await markTestimonyAsRead([id]);
      fetchTestimonies(currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  const rowToggleFeatured = async (t: TestimonyResponse) => {
    try {
      if (t.isFeatured) await markTestimonyAsNotFeatured([t.id]);
      else await markTestimonyAsFeatured([t.id]);
      fetchTestimonies(currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FCE7F3]">
          <Heart className="h-6 w-6 text-[#DB2777]" />
        </div>
        <div>
        <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Testimonies</h1>
        <p className="text-sm text-[#6B7280] dark:text-slate-400">Read and manage testimonies shared by the congregation</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={() => setCurrentPage(1)}
            placeholder="Search testimonies..."
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["ALL", "READ", "UNREAD"] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setStatusFilter(f); setCurrentPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === f
                ? "bg-[#000080] text-white"
                : "border border-[#E5E7EB] text-[#6B7280] hover:border-[#000080]"
            }`}
          >
            {f === "ALL" ? "All" : f === "READ" ? "Read" : "Unread"}
          </button>
        ))}
      </div>

      <BulkActionsBar
        count={selectedRows.size}
        onClear={() => setSelectedRows(new Set())}
        labelSingular="testimony"
        labelPlural="testimonies"
        actions={[
          { label: saving ? "Saving…" : "Mark as Read",        onClick: bulkMarkRead },
          { label: saving ? "Saving…" : "Mark as Featured",    onClick: bulkMarkFeatured },
          { label: saving ? "Saving…" : "Unmark as Featured",  onClick: bulkUnmarkFeatured },
        ]}
      />

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {apiError} — <button className="font-medium underline" onClick={() => fetchTestimonies(currentPage)}>Retry</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] dark:bg-slate-700/30">
              <th className="px-4 py-4">
                <input type="checkbox" checked={allPageSelected} onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] dark:text-indigo-400 focus:ring-[#000080]" />
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Name</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Subject</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Featured</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">ROSTV</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Location</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Date</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Status</th>
              <th className="px-4 py-4" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">Loading…</td></tr>
            ) : displayed.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">No testimonies found.</td></tr>
            ) : (
              displayed.map((t) => (
                <tr key={t.id} className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:bg-slate-700/50" style={{ height: "56px" }}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedRows.has(t.id)} onChange={() => handleSelectRow(t.id)}
                      className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] dark:text-indigo-400 focus:ring-[#000080]" />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {fullName(t.owner)
                      ? <span className="text-[#374151] dark:text-slate-300">{fullName(t.owner)}</span>
                      : <span className="italic text-gray-400 dark:text-slate-500">Anonymous</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#374151] dark:text-slate-300 max-w-[200px] truncate">{t.subject}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">
                    {t.isFeatured ? (
                      <div>
                        <div className="font-medium text-[#16A34A] dark:text-green-300">Yes</div>
                        {t.featureDate && <div className="text-xs text-gray-500 dark:text-slate-400">{fmtDate(t.featureDate)}</div>}
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-slate-500">No</span>
                    )}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm">
                    {(t.wantsToBeShot || t.isRosTv)
                      ? <span className="font-medium text-[#000080] dark:text-indigo-400">Yes</span>
                      : <span className="text-gray-400 dark:text-slate-500">No</span>}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">
                    {[t.state, t.country].filter(Boolean).join(", ") || <span className="text-gray-400 dark:text-slate-500">—</span>}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151] dark:text-slate-300">{fmtDate(t.createdOn)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusBadgeColors[t.testimonyStatus ?? ""] ?? "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400"}`}>
                      {t.testimonyStatus === "NOT_READ" ? "Unread" : (t.testimonyStatus ?? "Unread")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ActionDropdown
                      actions={[
                        { label: "View",                                 onClick: () => setViewing(t) },
                        { label: "Mark as Read",                         onClick: () => rowMarkRead(t.id) },
                        { label: t.isFeatured ? "Unmark as Featured" : "Mark as Featured", onClick: () => rowToggleFeatured(t) },
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
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} onPageChange={setCurrentPage} />
      </div>

      {/* View Modal */}
      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title="Testimony Details" size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusBadgeColors[viewing.testimonyStatus ?? ""] ?? "bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300"}`}>
                {(viewing.testimonyStatus ?? "UNREAD").replace(/_/g, " ")}
              </span>
              {viewing.isFeatured && (
                <span className="inline-block rounded-full bg-[#B5B5F3] px-3 py-1 text-xs font-medium text-[#000080] dark:text-indigo-400">
                  Featured
                </span>
              )}
            </div>

            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-slate-400">Name</div>
              <div className="text-sm">
                {fullName(viewing.owner)
                  ? <span className="text-[#374151] dark:text-slate-300">{fullName(viewing.owner)}</span>
                  : <span className="italic text-gray-400 dark:text-slate-500">Anonymous</span>}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-slate-400">Subject</div>
              <div className="text-sm font-medium text-[#374151] dark:text-slate-300">{viewing.subject}</div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-slate-400">Date</div>
                <div className="text-sm text-[#374151] dark:text-slate-300">{fmtDate(viewing.createdOn)}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-slate-400">Location</div>
                <div className="text-sm text-[#374151] dark:text-slate-300">
                  {[viewing.state, viewing.country].filter(Boolean).join(", ") || "—"}
                </div>
              </div>
              {viewing.isFeatured && viewing.featureDate && (
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-slate-400">Featured Date</div>
                  <div className="text-sm text-[#374151] dark:text-slate-300">{fmtDate(viewing.featureDate)}</div>
                </div>
              )}
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-slate-400">ROSTV Request</div>
                <div className="text-sm text-[#374151] dark:text-slate-300">
                  {(viewing.wantsToBeShot || viewing.isRosTv) ? "Yes – wants story filmed" : "No"}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-1 text-xs font-medium text-gray-500 dark:text-slate-400">Content</div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#374151] dark:text-slate-300">{viewing.content}</p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
