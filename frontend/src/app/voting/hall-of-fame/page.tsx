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

interface EventWinners {
  eventId: string;
  eventTitle: string;
  votingEndTime: string;
  male:   FaceOfTheMonthNominee | null;
  female: FaceOfTheMonthNominee | null;
}

function fmtDate(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function WinnerCard({
  winner,
  category,
  eventId,
  onClick,
}: {
  winner: FaceOfTheMonthNominee;
  category: "Male" | "Female";
  eventId: string;
  onClick: () => void;
}) {
  const name = [winner.firstName, winner.middleName, winner.lastName].filter(Boolean).join(" ");
  const accent = category === "Female" ? "#E8198B" : "#000080";
  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center gap-3 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Category badge */}
      <span
        className="absolute top-3 left-3 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
        style={{ background: accent }}
      >
        {category}
      </span>
      {/* Trophy */}
      <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#FEF9C3]">
        <Trophy className="h-4 w-4 text-[#CA8A04]" />
      </div>

      {/* Avatar */}
      {winner.profilePictureUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={winner.profilePictureUrl}
          alt={name}
          className="h-20 w-20 rounded-full object-cover mt-4"
          style={{ border: `4px solid ${accent}30` }}
        />
      ) : (
        <div className="mt-4 h-20 w-20 flex items-center justify-center rounded-full bg-[#F3F4F6] dark:bg-slate-700" style={{ border: `4px solid ${accent}30` }}>
          <UserAvatar firstName={winner.firstName} lastName={winner.lastName} size="md" />
        </div>
      )}

      <div className="text-center">
        <p className="font-semibold text-[#374151] dark:text-slate-200 text-lg">{name}</p>
        {winner.occupation && (
          <p className="mt-0.5 text-xs text-[#6B7280] dark:text-slate-400">{winner.occupation}</p>
        )}
        <p className="mt-1 text-sm font-medium" style={{ color: accent }}>
          {winner.voteCount ?? 0} votes
        </p>
        <span className="mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-medium text-white" style={{ background: accent }}>
          Face of the Month
        </span>
      </div>
    </div>
  );
}

export default function HallOfFamePage() {
  const router = useRouter();
  const [events,      setEvents]      = useState<EventWinners[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [apiError,    setApiError]    = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalItems,  setTotalItems]  = useState(0);

  const fetchWinners = useCallback(async (page: number) => {
    setLoading(true);
    setApiError("");
    try {
      const res = await getFaceOfTheMonths(page - 1, ITEMS_PER_PAGE);
      const now = Date.now();
      const completed: FaceOfTheMonthResponse[] = (res.content ?? []).filter(
        (e) => e.votingEndTime && new Date(e.votingEndTime).getTime() < now
      );

      const details = await Promise.all(
        completed.map((e) => getFaceOfTheMonth(e.id).catch(() => null))
      );

      const result: EventWinners[] = [];
      for (const detail of details) {
        if (!detail || !detail.nominees.length) continue;

        const males   = detail.nominees.filter((n) => n.sex !== "FEMALE");
        const females = detail.nominees.filter((n) => n.sex === "FEMALE");

        const topMale   = males.length   ? [...males].sort((a, b)   => (b.voteCount ?? 0) - (a.voteCount ?? 0))[0]   : null;
        const topFemale = females.length ? [...females].sort((a, b) => (b.voteCount ?? 0) - (a.voteCount ?? 0))[0] : null;

        if (!topMale && !topFemale) continue;

        result.push({
          eventId:       detail.id,
          eventTitle:    detail.title,
          votingEndTime: detail.votingEndTime ?? "",
          male:   topMale,
          female: topFemale,
        });
      }

      setEvents(result);
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
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEF9C3]">
          <Star className="h-6 w-6 text-[#CA8A04]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Hall of Fame</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Past Face of the Month winners — Male &amp; Female</p>
        </div>
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={() => fetchWinners(currentPage)}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="mb-3 h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
              <div className="grid gap-4 sm:grid-cols-2">
                {[0, 1].map((j) => (
                  <div key={j} className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 flex flex-col items-center gap-3">
                    <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-slate-700 mt-4" />
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
                    <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 py-16">
          <Trophy className="mb-4 h-12 w-12 text-[#D1D5DB] dark:text-slate-600" />
          <p className="text-[#9CA3AF] dark:text-slate-500">No completed voting events yet.</p>
          <p className="mt-1 text-sm text-[#9CA3AF] dark:text-slate-600">
            Winners will appear here once a voting period ends.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {events.map((ev) => (
            <div key={ev.eventId}>
              {/* Event header */}
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FEF9C3]">
                  <Trophy className="h-4 w-4 text-[#CA8A04]" />
                </div>
                <div>
                  <p className="font-semibold text-[#374151] dark:text-slate-200">{ev.eventTitle}</p>
                  <p className="text-xs text-[#6B7280] dark:text-slate-400">{fmtDate(ev.votingEndTime)}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {ev.male && (
                  <WinnerCard
                    winner={ev.male}
                    category="Male"
                    eventId={ev.eventId}
                    onClick={() => router.push(`/voting/${ev.eventId}`)}
                  />
                )}
                {ev.female && (
                  <WinnerCard
                    winner={ev.female}
                    category="Female"
                    eventId={ev.eventId}
                    onClick={() => router.push(`/voting/${ev.eventId}`)}
                  />
                )}
              </div>
            </div>
          ))}
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
