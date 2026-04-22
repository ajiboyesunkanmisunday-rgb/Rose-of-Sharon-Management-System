"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import BulkActionsBar from "@/components/ui/BulkActionsBar";
import Modal from "@/components/ui/Modal";
import { testimonies as initialTestimonies } from "@/lib/mock-data";
import type { Testimony } from "@/lib/types";

const ITEMS_PER_PAGE = 10;

const categoryBadgeColors: Record<string, string> = {
  Healing: "bg-[#16A34A] text-white",
  Financial: "bg-[#CA8A04] text-white",
  Marriage: "bg-[#7C3AED] text-white",
  Salvation: "bg-[#000080] text-white",
  Other: "bg-[#6B7280] text-white",
};

const statusBadgeColors: Record<string, string> = {
  Read: "bg-[#DCFCE7] text-[#16A34A]",
  "Not Read": "bg-[#FEF9C3] text-[#CA8A04]",
};

export default function TestimoniesPage() {
  const [list, setList] = useState<Testimony[]>(initialTestimonies);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [viewing, setViewing] = useState<Testimony | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.content.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.location && t.location.toLowerCase().includes(q))
    );
  }, [search, list]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const markRead = (ids: string[]) => {
    setList((prev) =>
      prev.map((t) => (ids.includes(t.id) ? { ...t, status: "Read" } : t))
    );
    console.log("Mark as Read:", ids);
  };

  const setFeatured = (ids: string[], featured: boolean) => {
    const today = new Date().toLocaleDateString("en-US");
    setList((prev) =>
      prev.map((t) =>
        ids.includes(t.id)
          ? {
              ...t,
              featured,
              featuredDate: featured ? today : undefined,
            }
          : t
      )
    );
    console.log(featured ? "Mark as Featured:" : "Unmark as Featured:", ids);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSel = new Set(selectedRows);
    paginated.forEach((t) =>
      checked ? newSel.add(t.id) : newSel.delete(t.id)
    );
    setSelectedRows(newSel);
  };

  const handleSelectRow = (id: string) => {
    const newSel = new Set(selectedRows);
    if (newSel.has(id)) newSel.delete(id);
    else newSel.add(id);
    setSelectedRows(newSel);
  };

  const allPageSelected =
    paginated.length > 0 && paginated.every((t) => selectedRows.has(t.id));

  const displayName = (t: Testimony) =>
    t.name && t.name.trim() !== "" ? (
      <span className="text-[#374151]">{t.name}</span>
    ) : (
      <span className="italic text-gray-400">Anonymous</span>
    );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Testimonies</h1>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-72">
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
          {
            label: "Mark as Read",
            onClick: () => {
              markRead(Array.from(selectedRows));
              setSelectedRows(new Set());
            },
          },
          {
            label: "Mark as Featured",
            onClick: () => {
              setFeatured(Array.from(selectedRows), true);
              setSelectedRows(new Set());
            },
          },
          {
            label: "Unmark as Featured",
            onClick: () => {
              setFeatured(Array.from(selectedRows), false);
              setSelectedRows(new Set());
            },
          },
        ]}
      />

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] focus:ring-[#000080]"
                />
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Name</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Category</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Featured</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Location</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Date</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Status</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((t) => (
              <tr
                key={t.id}
                className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                style={{ height: "56px" }}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(t.id)}
                    onChange={() => handleSelectRow(t.id)}
                    className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] focus:ring-[#000080]"
                  />
                </td>
                <td className="px-4 py-3 text-sm">{displayName(t)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      categoryBadgeColors[t.category] || "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {t.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {t.featured ? (
                    <div>
                      <div className="font-medium text-[#16A34A]">Yes</div>
                      {t.featuredDate && (
                        <div className="text-xs text-gray-500">{t.featuredDate}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {t.location || <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">{t.date}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      statusBadgeColors[t.status] || "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ActionDropdown
                    actions={[
                      { label: "View", onClick: () => setViewing(t) },
                      {
                        label: "Mark as Read",
                        onClick: () => markRead([t.id]),
                      },
                      {
                        label: t.featured ? "Unmark as Featured" : "Mark as Featured",
                        onClick: () => setFeatured([t.id], !t.featured),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No testimonies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal
        isOpen={!!viewing}
        onClose={() => setViewing(null)}
        title="Testimony Details"
        size="lg"
      >
        {viewing && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  categoryBadgeColors[viewing.category] || "bg-gray-200 text-gray-700"
                }`}
              >
                {viewing.category}
              </span>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                  statusBadgeColors[viewing.status] || "bg-gray-200 text-gray-700"
                }`}
              >
                {viewing.status}
              </span>
              {viewing.featured && (
                <span className="inline-block rounded-full bg-[#B5B5F3] px-3 py-1 text-xs font-medium text-[#000080]">
                  Featured
                </span>
              )}
            </div>

            <div>
              <div className="text-xs font-medium text-gray-500">Name</div>
              <div className="text-sm">
                {viewing.name && viewing.name.trim() !== "" ? (
                  <span className="text-[#374151]">{viewing.name}</span>
                ) : (
                  <span className="italic text-gray-400">Anonymous</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium text-gray-500">Date</div>
                <div className="text-sm text-[#374151]">{viewing.date}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Location</div>
                <div className="text-sm text-[#374151]">
                  {viewing.location || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Shared By</div>
                <div className="text-sm text-[#374151]">{viewing.sharedBy}</div>
              </div>
              {viewing.featured && viewing.featuredDate && (
                <div>
                  <div className="text-xs font-medium text-gray-500">Featured Date</div>
                  <div className="text-sm text-[#374151]">{viewing.featuredDate}</div>
                </div>
              )}
            </div>

            <div>
              <div className="mb-1 text-xs font-medium text-gray-500">Content</div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">
                {viewing.content}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
