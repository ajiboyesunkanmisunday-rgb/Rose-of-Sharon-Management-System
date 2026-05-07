"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import {
  getMessageTemplates,
  deleteMessageTemplate,
  type MessageTemplateResponse,
} from "@/lib/api";
import { FileText } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const CATEGORY_LABELS: Record<string, string> = {
  NEW_FIRST_TIMER:    "New First Timer",
  NEW_SECOND_TIMER:   "New Second Timer",
  NEW_CONVERT:        "New Convert",
  WEDDING_ANNIVERSARY:"Wedding Anniversary",
  BIRTHDAY:           "Birthday",
  PRAYER_REQUEST:     "Prayer Request",
  NEW_MEMBER:         "New Member",
  NEW_E_MEMBER:       "New E-Member",
  COUNSELING_REQUEST: "Counseling Request",
};

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function TemplatesPage() {
  const router = useRouter();

  const [templates,    setTemplates]    = useState<MessageTemplateResponse[]>([]);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalItems,   setTotalItems]   = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [apiError,     setApiError]     = useState("");
  const [search,       setSearch]       = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [deleteId,     setDeleteId]     = useState<string | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  const fetchTemplates = useCallback(async (page: number) => {
    setLoading(true);
    setApiError("");
    try {
      const res = await getMessageTemplates(page - 1, ITEMS_PER_PAGE);
      setTemplates(res.content ?? []);
      setTotalPages(res.totalPages ?? 1);
      setTotalItems(res.totalElements ?? 0);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates(currentPage);
  }, [currentPage, fetchTemplates]);

  const displayed = search.trim()
    ? templates.filter((t) => {
        const q = search.toLowerCase();
        return (
          (t.name ?? "").toLowerCase().includes(q) ||
          (t.subject ?? "").toLowerCase().includes(q) ||
          (t.content ?? "").toLowerCase().includes(q) ||
          (CATEGORY_LABELS[t.messageTemplateCategory] ?? "").toLowerCase().includes(q)
        );
      })
    : templates;

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteMessageTemplate(deleteId);
      setDeleteId(null);
      fetchTemplates(currentPage);
    } catch {
      // keep modal open on error
    } finally {
      setDeleting(false);
    }
  };

  const getChannelBadge = (channel: string) => {
    if (channel === "SMS") {
      return (
        <span className="inline-flex items-center rounded-full bg-[#000080] px-2.5 py-0.5 text-xs font-medium text-white">
          SMS
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-[#B5B5F3] px-2.5 py-0.5 text-xs font-medium text-[#000080]">
        Email
      </span>
    );
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF]">
          <FileText className="h-6 w-6 text-[#000080]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000]">Templates</h1>
          <p className="text-sm text-[#6B7280]">Reusable SMS and email message templates</p>
        </div>
      </div>

      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setCurrentPage(1); }}
            onSearch={() => setCurrentPage(1)}
            placeholder="Search templates..."
          />
        </div>
        <Button
          variant="primary"
          onClick={() => router.push("/communication/templates/add")}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          }
        >
          Add Template
        </Button>
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={() => fetchTemplates(currentPage)}>
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Name</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Channel</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Category</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Subject</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080]">Created</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading templates…</td>
              </tr>
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No templates found.</td>
              </tr>
            ) : (
              displayed.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50 cursor-pointer"
                  style={{ height: "56px" }}
                >
                  <td className="px-4 py-3 text-sm font-medium text-[#374151]">{t.name}</td>
                  <td className="px-4 py-3">{getChannelBadge(t.channel)}</td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                    {CATEGORY_LABELS[t.messageTemplateCategory] ?? t.messageTemplateCategory}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#374151]">
                    {t.subject ?? <span className="text-[#9CA3AF]">—</span>}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-[#374151]">{fmtDate(t.createdOn)}</td>
                  <td className="px-4 py-3">
                    <ActionDropdown
                      actions={[
                        {
                          label: "Edit",
                          onClick: () => router.push(`/communication/templates/${t.id}/edit`),
                        },
                        {
                          label: "Delete",
                          onClick: () => setDeleteId(t.id),
                        },
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
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this template? This cannot be undone."
      />
    </DashboardLayout>
  );
}
