"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import UserAvatar from "@/components/ui/UserAvatar";
import { Trophy, ArrowLeft, CheckCircle, XCircle, Vote, Users, Calendar } from "lucide-react";
import {
  getVotingCycle,
  getVotingResults,
  generateNominees,
  approveNominees,
  scheduleVoting,
  openVoting,
  closeVoting,
  announceWinner,
  cancelVotingCycle,
  type VotingCycle,
  type VotingNominee,
} from "@/lib/api";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const inputClass =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none transition-colors focus:border-[#000080] focus:ring-1 focus:ring-[#000080] bg-white dark:bg-slate-800/50";

const STATUS_LABELS: Record<VotingCycle["status"], { label: string; classes: string }> = {
  DRAFT: { label: "Draft", classes: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400" },
  NOMINEES_PENDING: { label: "Nominees Pending", classes: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" },
  NOMINEES_APPROVED: { label: "Nominees Approved", classes: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
  VOTING_OPEN: { label: "Voting Open", classes: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" },
  VOTING_CLOSED: { label: "Voting Closed", classes: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" },
  WINNER_ANNOUNCED: { label: "Winner Announced", classes: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" },
};

function NomineeCard({
  nominee,
  rank,
  selectable,
  selected,
  onSelect,
}: {
  nominee: VotingNominee;
  rank: number;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}) {
  const name = [nominee.firstName, nominee.lastName].filter(Boolean).join(" ");
  return (
    <div
      className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
        selectable
          ? `cursor-pointer ${selected ? "border-[#000080] dark:border-indigo-400 bg-blue-50 dark:bg-blue-900/20" : "border-[#E5E7EB] dark:border-slate-700 hover:border-[#000080] dark:hover:border-indigo-400"}`
          : "border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800"
      }`}
      onClick={selectable ? () => onSelect?.(nominee.id) : undefined}
    >
      <div className="relative shrink-0">
        <UserAvatar
          profilePictureUrl={nominee.profilePictureUrl}
          firstName={nominee.firstName}
          lastName={nominee.lastName}
          size="md"
        />
        {rank <= 3 && (
          <span
            className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
              rank === 1 ? "bg-yellow-500" : rank === 2 ? "bg-gray-400" : "bg-amber-600"
            }`}
          >
            {rank}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[#374151] dark:text-slate-200">{name}</p>
        <p className="text-xs text-[#6B7280] dark:text-slate-400">
          {nominee.isApproved ? "Approved" : "Pending approval"}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-lg font-bold text-[#000080] dark:text-indigo-400">{nominee.voteCount ?? 0}</p>
        <p className="text-xs text-[#6B7280] dark:text-slate-400">votes</p>
      </div>
    </div>
  );
}

export default function VotingCycleDetailPage() {
  const { id: rawId } = useParams<{ id: string }>();
  const router = useRouter();
  const [id, setId] = useState(rawId);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 1] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [cycle, setCycle] = useState<VotingCycle | null>(null);
  const [nominees, setNominees] = useState<VotingNominee[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [selectedWinnerId, setSelectedWinnerId] = useState("");

  const load = useCallback(async () => {
    if (!id || id === "fotm-1") return;
    setLoading(true);
    setApiError("");
    try {
      const [cycleRes, resultsRes] = await Promise.allSettled([
        getVotingCycle(id),
        getVotingResults(id),
      ]);
      if (cycleRes.status === "fulfilled") {
        setCycle(cycleRes.value);
      } else {
        throw cycleRes.reason;
      }
      if (resultsRes.status === "fulfilled") {
        const sorted = [...resultsRes.value.nominees].sort(
          (a, b) => (b.voteCount ?? 0) - (a.voteCount ?? 0)
        );
        setNominees(sorted);
        if (sorted.length > 0 && !selectedWinnerId) setSelectedWinnerId(sorted[0].id);
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load voting cycle.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const doAction = async (action: () => Promise<unknown>) => {
    setActionLoading(true);
    setActionError("");
    try {
      await action();
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateNominees = () =>
    doAction(async () => {
      const newNominees = await generateNominees(id);
      const sorted = [...newNominees].sort((a, b) => (b.voteCount ?? 0) - (a.voteCount ?? 0));
      setNominees(sorted);
      if (sorted.length > 0) setSelectedWinnerId(sorted[0].id);
    });

  const handleApproveNominees = () => doAction(() => approveNominees(id));

  const handleSchedule = async () => {
    if (!startDate || !endDate) return;
    setActionLoading(true);
    setActionError("");
    try {
      await scheduleVoting(id, new Date(startDate).toISOString(), new Date(endDate).toISOString());
      setShowScheduleModal(false);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to schedule voting.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenVoting = () => doAction(() => openVoting(id));
  const handleCloseVoting = () => doAction(() => closeVoting(id));

  const handleAnnounceWinner = async () => {
    if (!selectedWinnerId) return;
    setActionLoading(true);
    setActionError("");
    try {
      await announceWinner(id, selectedWinnerId);
      setShowAnnounceModal(false);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to announce winner.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this voting cycle? This cannot be undone.")) return;
    doAction(() => cancelVotingCycle(id));
  };

  const statusInfo = cycle ? (STATUS_LABELS[cycle.status] ?? { label: cycle.status, classes: "bg-gray-100 text-gray-600" }) : null;
  const monthName = cycle ? `${MONTH_NAMES[(cycle.month ?? 1) - 1]} ${cycle.year}` : "";

  return (
    <DashboardLayout>
      <button
        onClick={() => router.push("/voting")}
        className="mb-4 flex items-center gap-1 text-sm text-[#6B7280] dark:text-slate-400 hover:text-[#000080] dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Voting Cycles
      </button>

      {loading ? (
        <div className="py-16 text-center text-gray-400 dark:text-slate-500">Loading…</div>
      ) : apiError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={load}>
            Retry
          </button>
        </div>
      ) : cycle ? (
        <>
          {/* Header card */}
          <div className="mb-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FEF9C3]">
                  <Trophy className="h-6 w-6 text-[#CA8A04]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#000000] dark:text-slate-100">{cycle.title}</h1>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#6B7280] dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {monthName}
                    </span>
                    {cycle.categoryName && (
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" />
                        {cycle.categoryName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {nominees.length} nominees
                    </span>
                  </div>
                </div>
              </div>
              {statusInfo && (
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusInfo.classes}`}>
                  {statusInfo.label}
                </span>
              )}
            </div>
          </div>

          {/* Winner banner */}
          {cycle.status === "WINNER_ANNOUNCED" && cycle.winnerName && (
            <div className="mb-6 flex items-center gap-4 rounded-xl border border-yellow-200 dark:border-yellow-800 bg-[#FEF9C3] dark:bg-yellow-900/20 p-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-yellow-400 dark:bg-yellow-500">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#CA8A04] dark:text-yellow-400">Winner</p>
                <p className="text-xl font-bold text-[#374151] dark:text-slate-100">{cycle.winnerName}</p>
                <p className="text-sm text-[#6B7280] dark:text-slate-400">
                  {cycle.totalVotes ?? 0} total votes · {monthName}
                </p>
              </div>
            </div>
          )}

          {/* Action error */}
          {actionError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
              {actionError}
            </div>
          )}

          {/* Actions panel */}
          {cycle.status !== "WINNER_ANNOUNCED" && (
            <div className="mb-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h2 className="mb-4 text-sm font-bold text-[#111827] dark:text-slate-100">Actions</h2>
              <div className="flex flex-wrap gap-3">
                {cycle.status === "DRAFT" && (
                  <Button
                    variant="primary"
                    onClick={handleGenerateNominees}
                    disabled={actionLoading}
                    icon={<Users className="h-4 w-4" />}
                  >
                    {actionLoading ? "Generating…" : "Generate Nominees"}
                  </Button>
                )}

                {cycle.status === "NOMINEES_PENDING" && (
                  <Button
                    variant="primary"
                    onClick={handleApproveNominees}
                    disabled={actionLoading}
                    icon={<CheckCircle className="h-4 w-4" />}
                  >
                    {actionLoading ? "Approving…" : "Approve Nominees"}
                  </Button>
                )}

                {(cycle.status === "NOMINEES_PENDING" || cycle.status === "NOMINEES_APPROVED") && (
                  <Button
                    variant="secondary"
                    onClick={() => setShowScheduleModal(true)}
                    icon={<Calendar className="h-4 w-4" />}
                  >
                    Schedule Voting
                  </Button>
                )}

                {cycle.status === "NOMINEES_APPROVED" && (
                  <Button
                    variant="primary"
                    onClick={handleOpenVoting}
                    disabled={actionLoading}
                    icon={<Vote className="h-4 w-4" />}
                  >
                    {actionLoading ? "Opening…" : "Open Voting"}
                  </Button>
                )}

                {cycle.status === "VOTING_OPEN" && (
                  <Button
                    variant="secondary"
                    onClick={handleCloseVoting}
                    disabled={actionLoading}
                    icon={<XCircle className="h-4 w-4" />}
                  >
                    {actionLoading ? "Closing…" : "Close Voting"}
                  </Button>
                )}

                {cycle.status === "VOTING_CLOSED" && (
                  <Button
                    variant="primary"
                    onClick={() => setShowAnnounceModal(true)}
                    icon={<Trophy className="h-4 w-4" />}
                  >
                    Announce Winner
                  </Button>
                )}

                {(cycle.status === "DRAFT" || cycle.status === "NOMINEES_PENDING") && (
                  <Button variant="secondary" onClick={handleCancel} disabled={actionLoading}>
                    Cancel Cycle
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Nominees list */}
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#374151] dark:text-slate-200">Nominees</h2>
            <span className="text-sm text-[#6B7280] dark:text-slate-400">{nominees.length} total</span>
          </div>

          {nominees.length === 0 ? (
            <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 py-12 text-center text-gray-400 dark:text-slate-500">
              {cycle.status === "DRAFT"
                ? "Click \"Generate Nominees\" to get started."
                : "No nominees available."}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {nominees.map((nominee, idx) => (
                <NomineeCard key={nominee.id} nominee={nominee} rank={idx + 1} />
              ))}
            </div>
          )}
        </>
      ) : null}

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Voting Period"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#6B7280] dark:text-slate-400">
            Set the start and end date/time for the voting period.
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
              Voting Start
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
              Voting End
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSchedule}
              disabled={actionLoading || !startDate || !endDate}
            >
              {actionLoading ? "Scheduling…" : "Save Schedule"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Announce Winner Modal */}
      <Modal
        isOpen={showAnnounceModal}
        onClose={() => setShowAnnounceModal(false)}
        title="Announce Winner"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#6B7280] dark:text-slate-400">
            Select the winner. The nominee with the most votes is pre-selected.
          </p>
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {nominees.map((nominee) => {
              const name = [nominee.firstName, nominee.lastName].filter(Boolean).join(" ");
              return (
                <label
                  key={nominee.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                    selectedWinnerId === nominee.id
                      ? "border-[#000080] dark:border-indigo-400 bg-blue-50 dark:bg-blue-900/20"
                      : "border-[#E5E7EB] dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="winner"
                    value={nominee.id}
                    checked={selectedWinnerId === nominee.id}
                    onChange={() => setSelectedWinnerId(nominee.id)}
                    className="accent-[#000080]"
                  />
                  <UserAvatar
                    firstName={nominee.firstName}
                    lastName={nominee.lastName}
                    size="sm"
                  />
                  <span className="flex-1 text-sm font-medium text-[#374151] dark:text-slate-200">
                    {name}
                  </span>
                  <span className="text-sm font-bold text-[#000080] dark:text-indigo-400">
                    {nominee.voteCount ?? 0} votes
                  </span>
                </label>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAnnounceModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAnnounceWinner}
              disabled={actionLoading || !selectedWinnerId}
              icon={<Trophy className="h-4 w-4" />}
            >
              {actionLoading ? "Announcing…" : "Announce Winner"}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
