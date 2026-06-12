"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import ActionDropdown from "@/components/ui/ActionDropdown";
import { Trophy, Plus } from "lucide-react";
import {
  getFaceOfTheMonths,
  generateFaceOfTheMonth,
  declineFaceOfTheMonth,
  type FaceOfTheMonthResponse,
} from "@/lib/api";

const ITEMS_PER_PAGE = 10;

const inputClass =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none transition-colors focus:border-[#000080] focus:ring-1 focus:ring-[#000080] bg-white dark:bg-slate-800/50";

function fmtDateTime(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  return (
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}

function getStatus(item: FaceOfTheMonthResponse): { label: string; classes: string } {
  const now = Date.now();
  if (!item.votingStartTime) {
    return { label: "Pending", classes: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" };
  }
  const start = new Date(item.votingStartTime).getTime();
  const end = item.votingEndTime ? new Date(item.votingEndTime).getTime() : null;
  if (start > now) {
    return { label: "Approved", classes: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" };
  }
  if (end && now < end) {
    return { label: "Voting Open", classes: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" };
  }
  return { label: "Completed", classes: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400" };
}

export default function FaceOfTheMonthPage() {
  const router = useRouter();
  const [items, setItems] = useState<FaceOfTheMonthResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  const fetchItems = useCallback(async (page: number) => {
    setLoading(true);
    setApiError("");
    try {
      const res = await getFaceOfTheMonths(page - 1, ITEMS_PER_PAGE);
      setItems(res.content);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.totalElements || 0);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(currentPage);
  }, [currentPage, fetchItems]);

  const handleGenerate = async () => {
    if (!title.trim()) return;
    setGenerating(true);
    setGenError("");
    try {
      const result = await generateFaceOfTheMonth(title.trim());
      setShowGenerateModal(false);
      setTitle("");
      router.push(`/voting/${result.id}`);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Failed to generate nominees.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDecline = async (id: string) => {
    if (!confirm("Decline this Face of the Month? This cannot be undone.")) return;
    try {
      await declineFaceOfTheMonth(id);
      fetchItems(currentPage);
    } catch (err) {
      console.error("Decline failed:", err);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEF9C3]">
          <Trophy className="h-6 w-6 text-[#CA8A04]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Face of the Month</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Manage monthly nominations and voting events</p>
        </div>
      </div>

      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[#6B7280] dark:text-slate-400">
          {totalItems} event{totalItems !== 1 ? "s" : ""}
        </p>
        <Button
          variant="primary"
          onClick={() => setShowGenerateModal(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Generate Nominees
        </Button>
      </div>

      {/* Error */}
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={() => fetchItems(currentPage)}>
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] dark:bg-slate-700/30">
              <th className="px-4 py-4 font-bold text-[#000080] dark:text-indigo-400">Title</th>
              <th className="hidden sm:table-cell px-4 py-4 font-bold text-[#000080] dark:text-indigo-400">Voting Start</th>
              <th className="hidden sm:table-cell px-4 py-4 font-bold text-[#000080] dark:text-indigo-400">Voting End</th>
              <th className="hidden md:table-cell px-4 py-4 font-bold text-[#000080] dark:text-indigo-400">Total Votes</th>
              <th className="px-4 py-4 font-bold text-[#000080] dark:text-indigo-400">Status</th>
              <th className="px-4 py-4 font-bold text-[#000080] dark:text-indigo-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">
                  No face of the month events found.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const status = getStatus(item);
                return (
                  <tr
                    key={item.id}
                    className="border-b border-[#F3F4F6] dark:border-slate-700 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer"
                    style={{ height: "56px" }}
                    onDoubleClick={() => router.push(`/voting/${item.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-[#374151] dark:text-slate-300">{item.title}</td>
                    <td className="hidden sm:table-cell px-4 py-3 text-[#374151] dark:text-slate-300">
                      {fmtDateTime(item.votingStartTime)}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-[#374151] dark:text-slate-300">
                      {fmtDateTime(item.votingEndTime)}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-[#374151] dark:text-slate-300">
                      {item.totalVotes ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.classes}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ActionDropdown
                        actions={[
                          { label: "View", onClick: () => router.push(`/voting/${item.id}`) },
                          ...(status.label === "Pending"
                            ? [{ label: "Decline", onClick: () => handleDecline(item.id) }]
                            : []),
                        ]}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Generate Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => {
          setShowGenerateModal(false);
          setTitle("");
          setGenError("");
        }}
        title="Generate Face of the Month"
      >
        <div className="space-y-4">
          {genError && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
              <p className="font-medium">{genError}</p>
              {genError.toLowerCase().includes("nominee") && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  The system selects nominees from active members based on their engagement and activity. Ensure members are registered and active before generating.
                </p>
              )}
            </div>
          )}
          <p className="text-sm text-[#6B7280] dark:text-slate-400">
            The system will automatically select nominees from active members. Provide a title for this month&apos;s event.
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. June 2025 Face of the Month"
              className={inputClass}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowGenerateModal(false);
                setTitle("");
                setGenError("");
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleGenerate} disabled={generating || !title.trim()}>
              {generating ? "Generating…" : "Generate"}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
