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

const ITEMS_PER_PAGE = 10;

const statusBadgeColors: Record<string, string> = {
  READ:   "bg-[#DCFCE7] text-[#16A34A]",
  UNREAD: "bg-[#FEF9C3] text-[#CA8A04]",
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

  // Client-side search filter
  const displayed = search.trim()
    ? list.filter((t) => {
        const q = search.toLowerCase();
        return (
          t.subject.toLowerCase().includes(q) ||
          t.content.toLowerCase().includes(q) ||
          fullName(t.owner).toLowerCase().includes(q) ||
          (t.state ?? "").toLowerCase().includes(q) ||
          (t.country ?? "").toLowerCase().includes(q)
        );
      })
    : list;

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
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Testimonies</h1>
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
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError} — <button className="font-medium underline" onClick={() => fetchTestimonies(currentPage)}>Retry</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4">
                <input type="checkbox" checked={allPageSelected} onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] focus:ring-[#000080]" />
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Name</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Subject</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Featured</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Location</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Date</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Status</th>
              <th className="px-4 py-4" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
            ) : displayed.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No testimonies found.</td></tr>
            ) : (
              displayed.map((t) => (
                <tr key={t.id} className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50" style={{ height: "56px" }}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedRows.has(t.id)} onChange={() => handleSelectRow(t.id)}
                      className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] focus:ring-[#000080]" />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {fullName(t.owner)
                      ? <span className="text-[#374151]">{fullName(t.owner)}</span>
                      : <span className="italic text-gray-400">Anonymous</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#374151] max-w-[200px] truncate">{t.subject}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                    {t.isFeatured ? (
                      <div>
                        <div className="font-medium text-[#16A34A]">Yes</div>
                        {t.featureDate && <div className="text-xs text-gray-500">{fmtDate(t.featureDate)}</div>}
                      </div>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151]">
                    {[t.state, t.country].filter(Boolean).join(", ") || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">{fmtDate(t.createdOn)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusBadgeColors[t.testimonyStatus ?? ""] ?? "bg-gray-100 text-gray-600"}`}>
                      {(t.testimonyStatus ?? "UNREAD").replace(/_/g, " ")}
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
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusBadgeColors[viewing.testimonyStatus ?? ""] ?? "bg-gray-200 text-gray-700"}`}>
                {(viewing.testimonyStatus ?? "UNREAD").replace(/_/g, " ")}
              </span>
              {viewing.isFeatured && (
                <span className="inline-block rounded-full bg-[#B5B5F3] px-3 py-1 text-xs font-medium text-[#000080]">
                  Featured
                </span>
              )}
            </div>

            <div>
              <div className="text-xs font-medium text-gray-500">Name</div>
              <div className="text-sm">
                {fullName(viewing.owner)
                  ? <span className="text-[#374151]">{fullName(viewing.owner)}</span>
                  : <span className="italic text-gray-400">Anonymous</span>}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-500">Subject</div>
              <div className="text-sm font-medium text-[#374151]">{viewing.subject}</div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-medium text-gray-500">Date</div>
                <div className="text-sm text-[#374151]">{fmtDate(viewing.createdOn)}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Location</div>
                <div className="text-sm text-[#374151]">
                  {[viewing.state, viewing.country].filter(Boolean).join(", ") || "—"}
                </div>
              </div>
              {viewing.isFeatured && viewing.featureDate && (
                <div>
                  <div className="text-xs font-medium text-gray-500">Featured Date</div>
                  <div className="text-sm text-[#374151]">{fmtDate(viewing.featureDate)}</div>
                </div>
              )}
            </div>

            <div>
              <div className="mb-1 text-xs font-medium text-gray-500">Content</div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">{viewing.content}</p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
