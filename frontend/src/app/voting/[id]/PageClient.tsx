"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import UserAvatar from "@/components/ui/UserAvatar";
import {
  ChevronRight,
  RefreshCw,
  Trophy,
} from "lucide-react";
import {
  getVotingCycle,
  generateNominees,
  approveNominees,
  swapNominee,
  scheduleVoting,
  openVoting,
  closeVoting,
  extendVotingDeadline,
  announceWinner,
  getVotingResults,
  type VotingCycle,
  type VotingNominee,
  type VotingResultsResponse,
} from "@/lib/api";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const STATUS_ORDER = [
  "DRAFT",
  "NOMINEES_PENDING",
  "NOMINEES_APPROVED",
  "VOTING_OPEN",
  "VOTING_CLOSED",
  "WINNER_ANNOUNCED",
] as const;

const STATUS_LABEL: Record<string, string> = {
  DRAFT:             "Draft",
  NOMINEES_PENDING:  "Nominees Pending",
  NOMINEES_APPROVED: "Nominees Approved",
  VOTING_OPEN:       "Voting Open",
  VOTING_CLOSED:     "Voting Closed",
  WINNER_ANNOUNCED:  "Winner Announced",
};

const STATUS_BADGE_COLOR: Record<string, string> = {
  DRAFT:             "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400",
  NOMINEES_PENDING:  "bg-[#FEF9C3] dark:bg-yellow-900/30 text-[#CA8A04] dark:text-yellow-300",
  NOMINEES_APPROVED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  VOTING_OPEN:       "bg-[#DCFCE7] dark:bg-green-900/30 text-[#16A34A] dark:text-green-300",
  VOTING_CLOSED:     "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  WINNER_ANNOUNCED:  "bg-[#EDE9FE] dark:bg-purple-900/30 text-[#7C3AED] dark:text-purple-300",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fmtDate(s?: any): string {
  if (!s) return "—";
  if (Array.isArray(s)) {
    const [year, month, day] = s as number[];
    return new Date(year, month - 1, day).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  const d = new Date(s as string);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fmtDateTime(s?: any): string {
  if (!s) return "—";
  if (Array.isArray(s)) {
    const [year, month, day, hour = 0, minute = 0] = s as number[];
    return new Date(year, month - 1, day, hour, minute).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  const d = new Date(s as string);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function VotingCyclePageClient() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [cycle,        setCycle]        = useState<VotingCycle | null>(null);
  const [nominees,     setNominees]     = useState<VotingNominee[]>([]);
  const [results,      setResults]      = useState<VotingResultsResponse | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [apiError,     setApiError]     = useState("");
  const [successMsg,   setSuccessMsg]   = useState("");
  const [activeTab,    setActiveTab]    = useState<"nominees" | "schedule" | "results" | "winner">("nominees");
  const [saving,       setSaving]       = useState(false);
  const [actionError,  setActionError]  = useState("");

  // Schedule form
  const [schedStart,   setSchedStart]   = useState("");
  const [schedEnd,     setSchedEnd]     = useState("");
  const [extendDate,   setExtendDate]   = useState("");

  // Swap modal
  const [swapOpen,     setSwapOpen]     = useState(false);
  const [swapNominee_, setSwapNominee_] = useState<VotingNominee | null>(null);
  const [swapUserId,   setSwapUserId]   = useState("");
  const [swapping,     setSwapping]     = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const fetchCycle = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setApiError("");
    try {
      const data = await getVotingCycle(id);
      setCycle(data);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load cycle.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchResults = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getVotingResults(id);
      setResults(data);
      setNominees(data.nominees ?? []);
    } catch {
      // non-blocking
    }
  }, [id]);

  useEffect(() => { fetchCycle(); }, [fetchCycle]);
  useEffect(() => {
    if (cycle && ["VOTING_OPEN", "VOTING_CLOSED", "WINNER_ANNOUNCED"].includes(cycle.status)) {
      fetchResults();
    }
  }, [cycle, fetchResults]);

  const doAction = async (label: string, fn: () => Promise<unknown>) => {
    setSaving(true);
    setActionError("");
    try {
      await fn();
      showSuccess(`${label} successful.`);
      fetchCycle();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : `${label} failed.`);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateNominees = () =>
    doAction("Generate nominees", async () => {
      const list = await generateNominees(id);
      setNominees(list ?? []);
    });

  const handleApproveNominees = () =>
    doAction("Approve nominees", () => approveNominees(id));

  const handleOpenVoting = () =>
    doAction("Open voting", () => openVoting(id));

  const handleCloseVoting = () => {
    if (!window.confirm("Close voting early? This cannot be undone.")) return;
    doAction("Close voting", () => closeVoting(id));
  };

  const handleSaveSchedule = () => {
    if (!schedStart || !schedEnd) { setActionError("Both start and end dates are required."); return; }
    doAction("Save schedule", () => scheduleVoting(id, schedStart, schedEnd));
  };

  const handleExtend = () => {
    if (!extendDate) { setActionError("New end date is required."); return; }
    doAction("Extend deadline", () => extendVotingDeadline(id, extendDate));
  };

  const handleAnnounceWinner = (nomineeId: string) => {
    if (!window.confirm("Announce this nominee as the winner? This cannot be undone.")) return;
    doAction("Announce winner", () => announceWinner(id, nomineeId));
  };

  const handleSwap = async () => {
    if (!swapNominee_ || !swapUserId.trim()) return;
    setSwapping(true);
    try {
      await swapNominee(id, swapNominee_.id, swapUserId.trim());
      showSuccess("Nominee swapped successfully.");
      setSwapOpen(false);
      setSwapUserId("");
      setSwapNominee_(null);
      fetchCycle();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Swap failed.");
    } finally {
      setSwapping(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#000080] border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!cycle) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-6 text-center text-red-700">
          {apiError || "Cycle not found."}
          <div className="mt-3">
            <Button variant="outline" onClick={() => router.push("/voting")}>Back to Voting</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statusIdx = STATUS_ORDER.indexOf(cycle.status as typeof STATUS_ORDER[number]);
  const canSwap = ["DRAFT", "NOMINEES_PENDING"].includes(cycle.status);

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-[#6B7280] dark:text-slate-400">
        <Link href="/voting" className="hover:text-[#000080] dark:hover:text-indigo-400">Voting</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-[#374151] dark:text-slate-300 font-medium truncate max-w-[300px]">{cycle.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#000000] dark:text-slate-100">{cycle.title}</h1>
          <p className="mt-1 text-sm text-[#6B7280] dark:text-slate-400">
            {MONTHS[cycle.month - 1]} {cycle.year} · {cycle.categoryName ?? "—"}
          </p>
        </div>
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE_COLOR[cycle.status] ?? ""}`}>
          {STATUS_LABEL[cycle.status] ?? cycle.status}
        </span>
      </div>

      {/* Status Pipeline */}
      <div className="mb-6 overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <div className="flex min-w-max items-center gap-0">
          {STATUS_ORDER.map((s, i) => {
            const done    = i < statusIdx;
            const current = i === statusIdx;
            return (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      done    ? "bg-[#000080] text-white" :
                      current ? "bg-[#7C3AED] text-white ring-2 ring-[#7C3AED] ring-offset-2" :
                                "bg-[#F3F4F6] dark:bg-slate-700 text-[#9CA3AF]"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <span className={`text-[10px] text-center max-w-[70px] leading-tight ${
                    current ? "font-semibold text-[#7C3AED]" :
                    done    ? "text-[#000080] dark:text-indigo-400" :
                              "text-[#9CA3AF] dark:text-slate-500"
                  }`}>
                    {STATUS_LABEL[s]}
                  </span>
                </div>
                {i < STATUS_ORDER.length - 1 && (
                  <div className={`mx-2 h-0.5 w-10 flex-shrink-0 ${i < statusIdx ? "bg-[#000080]" : "bg-[#E5E7EB] dark:bg-slate-700"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Success / Action error banners */}
      {successMsg && (
        <div className="mb-4 rounded-lg border border-green-200 bg-[#DCFCE7] px-4 py-3 text-sm text-[#16A34A]">
          {successMsg}
        </div>
      )}
      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-[#F3F4F6] dark:bg-slate-700/30 p-1">
        {(["nominees", "schedule", "results", "winner"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "bg-white dark:bg-slate-800 text-[#000080] dark:text-indigo-400 shadow-sm"
                : "text-[#6B7280] dark:text-slate-400 hover:text-[#374151] dark:hover:text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── NOMINEES TAB ──────────────────────────────────────────────────── */}
      {activeTab === "nominees" && (
        <div>
          <div className="mb-4 flex flex-wrap gap-3">
            {(cycle.status === "DRAFT" || cycle.status === "NOMINEES_PENDING") && nominees.length === 0 && (
              <Button variant="primary" loading={saving} onClick={handleGenerateNominees}>
                Generate Nominees
              </Button>
            )}
            {cycle.status === "NOMINEES_PENDING" && nominees.length > 0 && (
              <Button variant="primary" loading={saving} onClick={handleApproveNominees}>
                Approve All Nominees
              </Button>
            )}
          </div>

          {nominees.length === 0 ? (
            <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-10 text-center text-[#6B7280] dark:text-slate-400">
              No nominees yet. Generate nominees to begin.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {nominees.map((nom) => (
                <div
                  key={nom.id}
                  className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex flex-col items-center gap-3"
                >
                  <UserAvatar
                    profilePictureUrl={nom.profilePictureUrl}
                    firstName={nom.firstName}
                    lastName={nom.lastName}
                    size="md"
                  />
                  <div className="text-center">
                    <div className="font-semibold text-[#374151] dark:text-slate-300">
                      {nom.firstName} {nom.lastName}
                    </div>
                    {["VOTING_OPEN", "VOTING_CLOSED", "WINNER_ANNOUNCED"].includes(cycle.status) && (
                      <div className="mt-1 text-sm text-[#6B7280] dark:text-slate-400">
                        {nom.voteCount} vote{nom.voteCount !== 1 ? "s" : ""}
                      </div>
                    )}
                    {nom.isApproved && (
                      <span className="mt-1 inline-block rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-medium text-[#16A34A]">
                        Approved
                      </span>
                    )}
                  </div>
                  {canSwap && (
                    <button
                      className="text-xs text-[#7C3AED] hover:underline"
                      onClick={() => { setSwapNominee_(nom); setSwapOpen(true); }}
                    >
                      Swap
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SCHEDULE TAB ──────────────────────────────────────────────────── */}
      {activeTab === "schedule" && (
        <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          {cycle.status === "NOMINEES_APPROVED" && !cycle.votingStartDate && (
            <div className="space-y-4">
              <h3 className="font-semibold text-[#374151] dark:text-slate-300">Set Voting Schedule</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">Start Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={schedStart}
                    onChange={(e) => setSchedStart(e.target.value)}
                    className="w-full rounded-xl border border-[#E5E7EB] dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-[#374151] dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#000080]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">End Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={schedEnd}
                    onChange={(e) => setSchedEnd(e.target.value)}
                    className="w-full rounded-xl border border-[#E5E7EB] dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-[#374151] dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#000080]"
                  />
                </div>
              </div>
              <Button variant="primary" loading={saving} onClick={handleSaveSchedule}>
                Save Schedule
              </Button>
            </div>
          )}

          {cycle.status === "NOMINEES_APPROVED" && cycle.votingStartDate && (
            <div className="space-y-4">
              <h3 className="font-semibold text-[#374151] dark:text-slate-300">Scheduled Voting Window</h3>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <div className="text-xs text-[#6B7280] dark:text-slate-400">Start</div>
                  <div className="text-[#374151] dark:text-slate-300">{fmtDateTime(cycle.votingStartDate)}</div>
                </div>
                <div>
                  <div className="text-xs text-[#6B7280] dark:text-slate-400">End</div>
                  <div className="text-[#374151] dark:text-slate-300">{fmtDateTime(cycle.votingEndDate)}</div>
                </div>
              </div>
              <Button variant="primary" loading={saving} onClick={handleOpenVoting}>
                Open Voting Now
              </Button>
            </div>
          )}

          {cycle.status === "VOTING_OPEN" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-[#374151] dark:text-slate-300">Current Voting Window</h3>
                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                  <div>
                    <div className="text-xs text-[#6B7280] dark:text-slate-400">Start</div>
                    <div className="text-[#374151] dark:text-slate-300">{fmtDateTime(cycle.votingStartDate)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#6B7280] dark:text-slate-400">End</div>
                    <div className="text-[#374151] dark:text-slate-300">{fmtDateTime(cycle.votingEndDate)}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[#E5E7EB] dark:border-slate-600 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-[#374151] dark:text-slate-300">Extend Deadline</h4>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-[#6B7280] dark:text-slate-400">New End Date &amp; Time</label>
                    <input
                      type="datetime-local"
                      value={extendDate}
                      onChange={(e) => setExtendDate(e.target.value)}
                      className="w-full rounded-xl border border-[#E5E7EB] dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-[#374151] dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#000080]"
                    />
                  </div>
                  <Button variant="secondary" loading={saving} onClick={handleExtend}>
                    Extend
                  </Button>
                </div>
              </div>

              <Button variant="danger" loading={saving} onClick={handleCloseVoting}>
                Close Voting Early
              </Button>
            </div>
          )}

          {(cycle.status === "VOTING_CLOSED" || cycle.status === "WINNER_ANNOUNCED") && (
            <div>
              <h3 className="mb-3 font-semibold text-[#374151] dark:text-slate-300">Voting Window (Closed)</h3>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <div className="text-xs text-[#6B7280] dark:text-slate-400">Start</div>
                  <div className="text-[#374151] dark:text-slate-300">{fmtDateTime(cycle.votingStartDate)}</div>
                </div>
                <div>
                  <div className="text-xs text-[#6B7280] dark:text-slate-400">End</div>
                  <div className="text-[#374151] dark:text-slate-300">{fmtDateTime(cycle.votingEndDate)}</div>
                </div>
              </div>
            </div>
          )}

          {!["NOMINEES_APPROVED", "VOTING_OPEN", "VOTING_CLOSED", "WINNER_ANNOUNCED"].includes(cycle.status) && (
            <p className="text-sm text-[#6B7280] dark:text-slate-400">
              Schedule will be available once nominees are approved.
            </p>
          )}
        </div>
      )}

      {/* ── RESULTS TAB ───────────────────────────────────────────────────── */}
      {activeTab === "results" && (
        <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          {!["VOTING_OPEN", "VOTING_CLOSED", "WINNER_ANNOUNCED"].includes(cycle.status) ? (
            <p className="text-sm text-[#6B7280] dark:text-slate-400">
              Results will be available once voting opens.
            </p>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#374151] dark:text-slate-300">Live Results</h3>
                  <p className="text-sm text-[#6B7280] dark:text-slate-400">
                    Total votes: <span className="font-medium">{results?.totalVotes ?? 0}</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  icon={<RefreshCw className="h-4 w-4" />}
                  onClick={fetchResults}
                >
                  Refresh
                </Button>
              </div>

              {/* CSS Bar Chart */}
              <div className="mb-6 space-y-3">
                {[...(results?.nominees ?? [])].sort((a, b) => b.voteCount - a.voteCount).map((nom, i) => {
                  const pct = results && results.totalVotes > 0
                    ? Math.round((nom.voteCount / results.totalVotes) * 100)
                    : 0;
                  return (
                    <div key={nom.id} className="flex items-center gap-3">
                      <div className="w-5 text-xs text-right text-[#9CA3AF]">{i + 1}</div>
                      <div className="w-24 truncate text-xs text-[#374151] dark:text-slate-300">{nom.firstName} {nom.lastName}</div>
                      <div className="flex-1 rounded-full bg-[#F3F4F6] dark:bg-slate-700 h-5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#000080] dark:bg-indigo-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-12 text-right text-xs font-medium text-[#374151] dark:text-slate-300">{pct}%</div>
                    </div>
                  );
                })}
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] dark:border-slate-700">
                      <th className="pb-2 text-left text-xs font-bold text-[#000080] dark:text-indigo-400">Rank</th>
                      <th className="pb-2 text-left text-xs font-bold text-[#000080] dark:text-indigo-400">Name</th>
                      <th className="pb-2 text-right text-xs font-bold text-[#000080] dark:text-indigo-400">Votes</th>
                      <th className="pb-2 text-right text-xs font-bold text-[#000080] dark:text-indigo-400">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...(results?.nominees ?? [])].sort((a, b) => b.voteCount - a.voteCount).map((nom, i) => {
                      const pct = results && results.totalVotes > 0
                        ? Math.round((nom.voteCount / results.totalVotes) * 100)
                        : 0;
                      return (
                        <tr key={nom.id} className="border-b border-[#F3F4F6] dark:border-slate-700">
                          <td className="py-2 text-[#9CA3AF] dark:text-slate-500">#{i + 1}</td>
                          <td className="py-2 text-[#374151] dark:text-slate-300">{nom.firstName} {nom.lastName}</td>
                          <td className="py-2 text-right font-medium text-[#374151] dark:text-slate-300">{nom.voteCount}</td>
                          <td className="py-2 text-right text-[#6B7280] dark:text-slate-400">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── WINNER TAB ────────────────────────────────────────────────────── */}
      {activeTab === "winner" && (
        <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          {cycle.status === "WINNER_ANNOUNCED" ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE9FE]">
                <Trophy className="h-8 w-8 text-[#7C3AED]" />
              </div>
              <UserAvatar
                profilePictureUrl={cycle.winnerPhotoUrl}
                firstName={cycle.winnerName?.split(" ")[0]}
                lastName={cycle.winnerName?.split(" ").slice(1).join(" ")}
                size="md"
              />
              <div className="text-center">
                <div className="text-2xl font-bold text-[#374151] dark:text-slate-100">{cycle.winnerName}</div>
                <div className="mt-1 text-sm text-[#7C3AED] font-medium">Face of the Month</div>
                <div className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">
                  {MONTHS[cycle.month - 1]} {cycle.year}
                </div>
              </div>
            </div>
          ) : cycle.status === "VOTING_CLOSED" ? (
            <div>
              <h3 className="mb-4 font-semibold text-[#374151] dark:text-slate-300">Announce Winner</h3>
              <p className="mb-4 text-sm text-[#6B7280] dark:text-slate-400">
                Select a nominee to announce as the winner.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[...(results?.nominees ?? nominees)].sort((a, b) => b.voteCount - a.voteCount).map((nom, i) => (
                  <div
                    key={nom.id}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      i === 0
                        ? "border-[#7C3AED] bg-[#EDE9FE]/50 dark:bg-purple-900/20"
                        : "border-[#E5E7EB] dark:border-slate-700"
                    }`}
                  >
                    <UserAvatar profilePictureUrl={nom.profilePictureUrl} firstName={nom.firstName} lastName={nom.lastName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#374151] dark:text-slate-300 truncate">{nom.firstName} {nom.lastName}</div>
                      <div className="text-xs text-[#6B7280] dark:text-slate-400">{nom.voteCount} votes</div>
                    </div>
                    {i === 0 && <Trophy className="h-4 w-4 text-[#7C3AED] flex-shrink-0" />}
                    <Button variant="primary" className="!py-1.5 !px-3 !text-xs" onClick={() => handleAnnounceWinner(nom.id)}>
                      Announce
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#6B7280] dark:text-slate-400">
              Winner will be determined after voting closes.
            </p>
          )}
        </div>
      )}

      {/* Swap Nominee Modal */}
      <Modal isOpen={swapOpen} onClose={() => { setSwapOpen(false); setSwapUserId(""); }} title="Swap Nominee" size="sm">
        <div className="space-y-4">
          {swapNominee_ && (
            <p className="text-sm text-[#6B7280] dark:text-slate-400">
              Replacing <span className="font-medium text-[#374151] dark:text-slate-300">{swapNominee_.firstName} {swapNominee_.lastName}</span>
            </p>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">New User ID</label>
            <input
              type="text"
              value={swapUserId}
              onChange={(e) => setSwapUserId(e.target.value)}
              placeholder="Enter user ID..."
              className="w-full rounded-xl border border-[#E5E7EB] dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-[#374151] dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#000080]"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setSwapOpen(false); setSwapUserId(""); }}>
              Cancel
            </Button>
            <Button variant="primary" loading={swapping} onClick={handleSwap}>
              Swap
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
