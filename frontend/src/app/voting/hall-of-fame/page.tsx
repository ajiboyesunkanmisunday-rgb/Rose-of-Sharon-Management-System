"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Pagination from "@/components/ui/Pagination";
import UserAvatar from "@/components/ui/UserAvatar";
import { Star, Trophy } from "lucide-react";
import { getHallOfFame, type VotingCycle } from "@/lib/api";

const ITEMS_PER_PAGE = 20;
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function HallOfFamePage() {
  const router = useRouter();
  const [winners, setWinners] = useState<VotingCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchWinners = useCallback(async (page: number) => {
    setLoading(true);
    setApiError("");
    try {
      const res = await getHallOfFame(page - 1, ITEMS_PER_PAGE);
      setWinners(res.content ?? []);
      setTotalPages(res.totalPages ?? 1);
      setTotalItems(res.totalElements ?? 0);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load hall of fame.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWinners(currentPage);
  }, [currentPage, fetchWinners]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEF9C3]">
          <Star className="h-6 w-6 text-[#CA8A04]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Hall of Fame</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Past Face of the Month winners</p>
        </div>
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={() => fetchWinners(currentPage)}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-slate-700" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
                <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
              </div>
            </div>
          ))}
        </div>
      ) : winners.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 py-16">
          <Trophy className="mb-4 h-12 w-12 text-[#D1D5DB] dark:text-slate-600" />
          <p className="text-[#9CA3AF] dark:text-slate-500">No winners announced yet.</p>
          <p className="mt-1 text-sm text-[#9CA3AF] dark:text-slate-600">
            Winners will appear here once a voting cycle completes.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {winners.map((w) => {
            const monthName = w.month ? MONTH_NAMES[w.month - 1] : "";
            const nameParts = (w.winnerName ?? "").split(" ");
            return (
              <div
                key={w.id}
                onClick={() => router.push(`/voting/${w.id}`)}
                className="relative cursor-pointer rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 flex flex-col items-center gap-3 hover:shadow-md transition-shadow"
              >
                <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#FEF9C3]">
                  <Trophy className="h-4 w-4 text-[#CA8A04]" />
                </div>

                <div className="h-20 w-20 overflow-hidden">
                  {w.winnerPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={w.winnerPhotoUrl}
                      alt={w.winnerName ?? ""}
                      className="h-20 w-20 rounded-full object-cover border-4 border-[#FEF9C3]"
                    />
                  ) : (
                    <div className="h-20 w-20 flex items-center justify-center rounded-full bg-[#F3F4F6] dark:bg-slate-700 border-4 border-[#E5E7EB] dark:border-slate-600">
                      <UserAvatar
                        firstName={nameParts[0]}
                        lastName={nameParts.slice(1).join(" ")}
                        size="md"
                      />
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-lg font-semibold text-[#374151] dark:text-slate-200">
                    {w.winnerName || "—"}
                  </div>
                  <div className="mt-1 text-sm text-[#6B7280] dark:text-slate-400">
                    {monthName} {w.year}
                  </div>
                  {w.totalVotes != null && (
                    <div className="mt-1 text-sm font-medium text-[#6B7280] dark:text-slate-400">
                      {w.totalVotes} votes
                    </div>
                  )}
                  <div className="mt-2 max-w-[160px] truncate text-xs italic text-[#6B7280] dark:text-slate-500">
                    {w.title}
                  </div>
                  <div className="mt-2 inline-block rounded-full bg-[#FEF9C3] dark:bg-yellow-900/30 px-3 py-0.5 text-xs font-medium text-[#CA8A04] dark:text-yellow-300">
                    Face of the Month
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      </div>
    </DashboardLayout>
  );
}
