"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { getTrainingEvents, deleteTrainingEvent, type TrainingEventResponse } from "@/lib/api";
import { CalendarClock } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const CATEGORY_LABELS: Record<string, string> = {
  BAPTISM: "Water Baptism",
  WORKERS_IN_TRAINING: "Workers in Training",
  SCHOOL_OF_DISCIPLES: "School of Disciples",
  SCHOOL_OF_MINISTRY: "School of Ministry",
};

function getStatus(dateStr?: string): "Upcoming" | "Completed" {
  if (!dateStr) return "Upcoming";
  return new Date(dateStr) > new Date() ? "Upcoming" : "Completed";
}

const STATUS_BADGE: Record<string, string> = {
  Upcoming: "bg-blue-100 text-blue-800",
  Completed: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400",
};

export default function TrainingSchedulesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [events, setEvents] = useState<TrainingEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    getTrainingEvents()
      .then(setEvents)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load schedules."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return events;
    const q = search.toLowerCase();
    return events.filter(
      (e) =>
        (e.name ?? "").toLowerCase().includes(q) ||
        (e.teacher ?? "").toLowerCase().includes(q) ||
        (e.location ?? "").toLowerCase().includes(q) ||
        (CATEGORY_LABELS[e.trainingCategory ?? ""] ?? "").toLowerCase().includes(q)
    );
  }, [search, events]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    setDeleting(true);
    try {
      await deleteTrainingEvent(selectedId);
      setEvents((prev) => prev.filter((e) => e.id !== selectedId));
    } catch {
      // silently ignore
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setSelectedId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDE9FE] dark:bg-purple-900/30">
          <CalendarClock className="h-6 w-6 text-[#7C3AED] dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Training Schedules</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Plan and track course sessions and training timetables</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchBar value={search} onChange={setSearch} onSearch={() => setCurrentPage(1)} placeholder="Search schedules..." />
        </div>
        <Button
          variant="primary"
          onClick={() => router.push("/trainings/schedules/add")}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Add Schedule
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error} —{" "}
          <button className="font-medium underline" onClick={load}>Retry</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6] dark:bg-slate-700/30">
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Name</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Category</th>
              <th className="hidden sm:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Instructor</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Date</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Venue</th>
              <th className="hidden md:table-cell px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Exam</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080] dark:text-indigo-400">Status</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">Loading schedules…</td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400 dark:text-slate-500">No schedules found.</td>
              </tr>
            ) : (
              paginated.map((e) => {
                const status = getStatus(e.date);
                return (
                  <tr
                    key={e.id}
                    className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:bg-slate-700/50"
                    style={{ height: "56px" }}
                  >
                    <td className="px-4 py-3 font-medium text-[#111827] dark:text-slate-100">{e.name || "—"}</td>
                    <td className="hidden sm:table-cell px-4 py-3 text-[#374151] dark:text-slate-300">
                      {CATEGORY_LABELS[e.trainingCategory ?? ""] ?? e.trainingCategory ?? "—"}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-[#374151] dark:text-slate-300">{e.teacher || "—"}</td>
                    <td className="px-4 py-3 text-[#374151] dark:text-slate-300">
                      {e.date ? new Date(e.date).toLocaleDateString() : "—"}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-[#374151] dark:text-slate-300">{e.location || "—"}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-[#374151] dark:text-slate-300">
                      {e.isExam ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Yes</span>
                      ) : "No"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[status]}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ActionDropdown
                        actions={[
                          { label: "View", onClick: () => router.push(`/trainings/schedules/${e.id}`) },
                          { label: "Edit", onClick: () => router.push(`/trainings/schedules/${e.id}/edit`) },
                          { label: "Delete", onClick: () => handleDeleteClick(e.id) },
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

      <div className="mt-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length} onPageChange={setCurrentPage} />
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedId(null); }}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete this schedule?${deleting ? " Deleting…" : ""}`}
      />
    </DashboardLayout>
  );
}
