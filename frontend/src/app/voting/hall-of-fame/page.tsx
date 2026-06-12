"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Pagination from "@/components/ui/Pagination";
import UserAvatar from "@/components/ui/UserAvatar";
import { Star, Trophy } from "lucide-react";
import {
  getFaceOfTheMonths,
  getFaceOfTheMonth,
  type FaceOfTheMonthResponse,
  type FaceOfTheMonthNominee,
} from "@/lib/api";

const ITEMS_PER_PAGE = 20;

interface Winner {
  eventId: string;
  eventTitle: string;
  votingEndTime: string;
  nominee: FaceOfTheMonthNominee;
}

function fmtDate(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default function HallOfFamePage() {
  const router = useRouter();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchWinners = useCallback(async (page: number) => {
    setLoading(true);
    setApiError("");
    try {
      const res = await getFaceOfTheMonths(page - 1, ITEMS_PER_PAGE);
      const now = Date.now();
      // Only show completed events (past votingEndTime) that have nominees
      const completed: FaceOfTheMonthResponse[] = (res.content ?? []).filter(
        (e) => e.votingEndTime && new Date(e.votingEndTime).getTime() < now
      );

      // Fetch full details to get nominees with vote counts
      const details = await Promise.all(
        completed.map((e) => getFaceOfTheMonth(e.id).catch(() => null))
      );

      const result: Winner[] = [];
      for (const detail of details) {
        if (!detail || !detail.nominees.length) continue;
        const winner = [...detail.nominees].sort((a, b) => (b.voteCount ?? 0) - (a.voteCount ?? 0))[0];
        result.push({
          eventId: detail.id,
          eventTitle: detail.title,
          votingEndTime: detail.votingEndTime ?? "",
          nominee: winner,
        });
      }

      setWinners(result);
      setTotalPages(res.totalPages ?? 1);
      setTotalItems(res.totalElements ?? 0);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load hall of fame.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWinners(currentPage); }, [currentPage, fetchWinners]);

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

      {/* Error banner */}
      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={() => fetchWinners(currentPage)}>
            Retry
          </button>
        </div>
      )}

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
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
          <p className="text-[#9CA3AF] dark:text-slate-500">No completed voting events yet.</p>
          <p className="mt-1 text-sm text-[#9CA3AF] dark:text-slate-600">Winners will appear here once a voting period ends.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {winners.map((w) => {
            const name = [w.nominee.firstName, w.nominee.middleName, w.nominee.lastName].filter(Boolean).join(" ");
            return (
              <div
                key={w.eventId}
                onClick={() => router.push(`/voting/${w.eventId}`)}
                className="relative rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 flex flex-col items-center gap-3 hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Trophy badge */}
                <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#FEF9C3]">
                  <Trophy className="h-4 w-4 text-[#CA8A04]" />
                </div>

                {/* Avatar */}
                <div className="h-20 w-20 overflow-hidden">
                  {w.nominee.profilePictureUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={w.nominee.profilePictureUrl}
                      alt={name}
                      className="h-20 w-20 rounded-full object-cover border-4 border-[#FEF9C3]"
                    />
                  ) : (
                    <div className="h-20 w-20 flex items-center justify-center rounded-full bg-[#F3F4F6] dark:bg-slate-700 border-4 border-[#E5E7EB] dark:border-slate-600">
                      <UserAvatar firstName={w.nominee.firstName} lastName={w.nominee.lastName} size="md" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="text-center">
                  <div className="font-semibold text-[#374151] dark:text-slate-200 text-lg">{name}</div>
                  {w.nominee.occupation && (
                    <div className="mt-0.5 text-xs text-[#6B7280] dark:text-slate-400">{w.nominee.occupation}</div>
                  )}
                  <div className="mt-1 text-sm text-[#6B7280] dark:text-slate-400">{fmtDate(w.votingEndTime)}</div>
                  <div className="mt-1 text-sm font-medium text-[#6B7280] dark:text-slate-400">
                    {w.nominee.voteCount ?? 0} votes
                  </div>
                  <div className="mt-2 text-xs text-[#6B7280] dark:text-slate-500 italic truncate max-w-[160px]">{w.eventTitle}</div>
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
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} onPageChange={setCurrentPage} />
      </div>
    </DashboardLayout>
  );
}
