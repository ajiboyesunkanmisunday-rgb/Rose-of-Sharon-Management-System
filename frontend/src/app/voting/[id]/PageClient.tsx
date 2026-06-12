"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import UserAvatar from "@/components/ui/UserAvatar";
import { Trophy, ArrowLeft, CheckCircle, XCircle, Vote } from "lucide-react";
import {
  getFaceOfTheMonth,
  approveFaceOfTheMonth,
  declineFaceOfTheMonth,
  getStoredUser,
  type FaceOfTheMonthFullResponse,
  type FaceOfTheMonthNominee,
} from "@/lib/api";

const inputClass =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none transition-colors focus:border-[#000080] focus:ring-1 focus:ring-[#000080] bg-white dark:bg-slate-800/50";

function fmtDateTime(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  return (
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " at " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}

function toLocalInputValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16);
}

function getStatus(item: FaceOfTheMonthFullResponse): string {
  const now = Date.now();
  if (!item.votingStartTime) return "Pending";
  const start = new Date(item.votingStartTime).getTime();
  const end = item.votingEndTime ? new Date(item.votingEndTime).getTime() : null;
  if (start > now) return "Approved";
  if (end && now < end) return "Voting Open";
  return "Completed";
}

function NomineeCard({ nominee, rank }: { nominee: FaceOfTheMonthNominee; rank: number }) {
  const name = [nominee.firstName, nominee.middleName, nominee.lastName].filter(Boolean).join(" ");
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <div className="relative shrink-0">
        <UserAvatar
          profilePictureUrl={nominee.profilePictureUrl}
          firstName={nominee.firstName}
          lastName={nominee.lastName}
          size="md"
        />
        {rank <= 3 && (
          <span className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
            rank === 1 ? "bg-yellow-500" : rank === 2 ? "bg-gray-400" : "bg-amber-600"
          }`}>
            {rank}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[#374151] dark:text-slate-200">{name}</p>
        <p className="text-xs text-[#6B7280] dark:text-slate-400">{nominee.occupation || nominee.email || "—"}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-lg font-bold text-[#000080] dark:text-indigo-400">{nominee.voteCount ?? 0}</p>
        <p className="text-xs text-[#6B7280] dark:text-slate-400">votes</p>
      </div>
    </div>
  );
}

export default function FaceOfTheMonthDetailClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<FaceOfTheMonthFullResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState("");

  const [declining, setDeclining] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setApiError("");
    try {
      const res = await getFaceOfTheMonth(id);
      setData(res);
      if (res.votingStartTime) setStartTime(toLocalInputValue(res.votingStartTime));
      if (res.votingEndTime) setEndTime(toLocalInputValue(res.votingEndTime));
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load event.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async () => {
    if (!data || !startTime || !endTime) return;
    setApproving(true);
    setApproveError("");
    try {
      const updated = await approveFaceOfTheMonth(data.id, {
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });
      setData(updated);
      setShowApproveModal(false);
    } catch (err) {
      setApproveError(err instanceof Error ? err.message : "Failed to approve event.");
    } finally {
      setApproving(false);
    }
  };

  const handleDecline = async () => {
    if (!data) return;
    if (!confirm("Decline this Face of the Month? This cannot be undone.")) return;
    setDeclining(true);
    try {
      await declineFaceOfTheMonth(data.id);
      router.push("/voting");
    } catch (err) {
      console.error("Decline failed:", err);
      setDeclining(false);
    }
  };

  const status = data ? getStatus(data) : "";
  const sortedNominees = data
    ? [...data.nominees].sort((a, b) => (b.voteCount ?? 0) - (a.voteCount ?? 0))
    : [];

  const currentUser = getStoredUser();

  return (
    <DashboardLayout>
      {/* Back */}
      <button
        onClick={() => router.push("/voting")}
        className="mb-4 flex items-center gap-1 text-sm text-[#6B7280] dark:text-slate-400 hover:text-[#000080] dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Face of the Month
      </button>

      {loading ? (
        <div className="py-16 text-center text-gray-400 dark:text-slate-500">Loading…</div>
      ) : apiError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {apiError} —{" "}
          <button className="font-medium underline" onClick={fetchData}>Retry</button>
        </div>
      ) : data ? (
        <>
          {/* Header card */}
          <div className="mb-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FEF9C3]">
                  <Trophy className="h-6 w-6 text-[#CA8A04]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#000000] dark:text-slate-100">{data.title}</h1>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#6B7280] dark:text-slate-400">
                    {data.votingStartTime && (
                      <span>Start: {fmtDateTime(data.votingStartTime)}</span>
                    )}
                    {data.votingEndTime && (
                      <span>End: {fmtDateTime(data.votingEndTime)}</span>
                    )}
                    <span>{data.nominees.length} nominees</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {status === "Pending" && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => setShowApproveModal(true)}
                      icon={<CheckCircle className="h-4 w-4" />}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleDecline}
                      disabled={declining}
                      icon={<XCircle className="h-4 w-4" />}
                    >
                      {declining ? "Declining…" : "Decline"}
                    </Button>
                  </>
                )}
                {status === "Approved" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300">
                    <CheckCircle className="h-4 w-4" /> Approved — voting starts soon
                  </span>
                )}
                {status === "Voting Open" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-sm font-medium text-green-700 dark:text-green-300">
                    <Vote className="h-4 w-4" /> Voting is open
                  </span>
                )}
                {status === "Completed" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-slate-700 px-3 py-1 text-sm font-medium text-gray-600 dark:text-slate-400">
                    <Trophy className="h-4 w-4" /> Completed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Nominees */}
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#374151] dark:text-slate-200">Nominees</h2>
            <span className="text-sm text-[#6B7280] dark:text-slate-400">
              {sortedNominees.length} total
            </span>
          </div>

          {sortedNominees.length === 0 ? (
            <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 py-12 text-center text-gray-400 dark:text-slate-500">
              No nominees for this event.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sortedNominees.map((nominee, idx) => (
                <NomineeCard key={nominee.id} nominee={nominee} rank={idx + 1} />
              ))}
            </div>
          )}

          {/* Current user ID info for voting integration */}
          {currentUser && status === "Voting Open" && (
            <p className="mt-4 text-xs text-[#6B7280] dark:text-slate-500">
              Voting is open. Use the mobile app or member portal to cast your vote.
            </p>
          )}
        </>
      ) : null}

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => { setShowApproveModal(false); setApproveError(""); }}
        title="Approve & Set Voting Period"
      >
        <div className="space-y-4">
          {approveError && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
              {approveError}
            </div>
          )}
          <p className="text-sm text-[#6B7280] dark:text-slate-400">
            Set the start and end date/time for the voting period. Members will be able to vote during this window.
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
              Voting Start
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
              Voting End
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => { setShowApproveModal(false); setApproveError(""); }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={approving || !startTime || !endTime}
            >
              {approving ? "Approving…" : "Approve"}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
