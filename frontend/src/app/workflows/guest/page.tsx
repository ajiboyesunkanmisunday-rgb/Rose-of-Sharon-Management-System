"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  getGuestWorkflow,
  convertToSecondTimer,
  convertToFullMember,
  type GuestBoardColumn,
  type UserBasicResponse,
} from "@/lib/api";
import { GitBranch, RefreshCw, User, GripVertical } from "lucide-react";

const COLUMNS: {
  status: string;
  label: string;
  headerBg: string;
  headerText: string;
  dot: string;
}[] = [
  { status: "FIRST_TIMER",               label: "First Timers",         headerBg: "bg-blue-50 dark:bg-blue-900/20",    headerText: "text-blue-800 dark:text-blue-300",    dot: "bg-blue-400"   },
  { status: "SECOND_TIMER_WITHOUT_GROUP", label: "2nd Timer (No Group)", headerBg: "bg-yellow-50 dark:bg-yellow-900/20", headerText: "text-yellow-800 dark:text-yellow-300", dot: "bg-yellow-400" },
  { status: "SECOND_TIMER_WITH_GROUP",   label: "2nd Timer (In Group)", headerBg: "bg-purple-50 dark:bg-purple-900/20", headerText: "text-purple-800 dark:text-purple-300", dot: "bg-purple-400" },
  { status: "FULL_MEMBER",               label: "Full Members",         headerBg: "bg-green-50 dark:bg-green-900/20",   headerText: "text-green-800 dark:text-green-300",  dot: "bg-green-400"  },
];

const COL_ORDER = COLUMNS.map((c) => c.status);

function fullName(u: UserBasicResponse) {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

function limitWords(text: string, max: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= max) return text;
  return words.slice(0, max).join(" ") + "…";
}

// Maps a move (fromStatus → toStatus) to the API call needed, or null if unsupported
async function applyTransition(userId: string, fromStatus: string, toStatus: string): Promise<void> {
  const fromIdx = COL_ORDER.indexOf(fromStatus);
  const toIdx   = COL_ORDER.indexOf(toStatus);

  if (toIdx <= fromIdx) {
    throw new Error("Cannot move a user backwards in the workflow.");
  }

  // FIRST_TIMER → SECOND_TIMER_WITHOUT_GROUP (or further right)
  if (fromStatus === "FIRST_TIMER") {
    await convertToSecondTimer(userId);
    return;
  }

  // SECOND_TIMER_WITHOUT_GROUP → SECOND_TIMER_WITH_GROUP
  if (fromStatus === "SECOND_TIMER_WITHOUT_GROUP" && toStatus === "SECOND_TIMER_WITH_GROUP") {
    throw new Error("Assign this person to a group first — group assignment moves them here automatically.");
  }

  // Any second-timer → FULL_MEMBER
  if (toStatus === "FULL_MEMBER") {
    await convertToFullMember(userId);
    return;
  }

  throw new Error("This transition is not yet supported.");
}

function GuestCard({
  user,
  fromStatus,
  isMoving,
  showInsertBefore,
  showInsertAfter,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: {
  user: UserBasicResponse;
  fromStatus: string;
  isMoving: boolean;
  showInsertBefore: boolean;
  showInsertAfter: boolean;
  onDragStart: (e: React.DragEvent, userId: string, fromStatus: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, userId: string, fromStatus: string) => void;
  onDrop: (e: React.DragEvent, userId: string, fromStatus: string) => void;
}) {
  const name     = fullName(user);
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "?";
  const phone    = user.phoneNumber ? `+${user.countryCode ?? ""} ${user.phoneNumber}`.trim() : null;

  return (
    <div className="mb-2">
      {showInsertBefore && <div className="mb-1 h-0.5 w-full rounded-full bg-[#000080]" />}

      <div
        draggable
        onDragStart={(e) => onDragStart(e, user.id, fromStatus)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => onDragOver(e, user.id, fromStatus)}
        onDrop={(e) => onDrop(e, user.id, fromStatus)}
        title="Drag to move to next stage"
        className={`group rounded-lg border bg-white dark:bg-slate-800 p-3 shadow-sm transition-all cursor-grab active:cursor-grabbing select-none ${
          isMoving
            ? "scale-95 opacity-50"
            : "border-[#E5E7EB] dark:border-slate-700 hover:border-[#000080] hover:shadow-md"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            {user.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt={name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-bold text-blue-800 dark:text-blue-300">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#111827] dark:text-slate-100 truncate">{limitWords(name, 5)}</p>
              {user.occupation && (
                <p className="text-xs text-[#6B7280] dark:text-slate-400 truncate">{limitWords(user.occupation, 4)}</p>
              )}
            </div>
          </div>
          <GripVertical className="h-4 w-4 shrink-0 text-[#D1D5DB] group-hover:text-[#9CA3AF] dark:text-slate-400 mt-0.5" />
        </div>

        {phone && <p className="mt-2 text-xs text-[#374151] dark:text-slate-300">{phone}</p>}

        {user.assignedFollowUp && (
          <p className="mt-1 truncate text-xs text-[#6B7280] dark:text-slate-400">
            <span className="font-medium">Assigned:</span> {user.assignedFollowUp}
          </p>
        )}

        {(user.noOfCalls !== undefined || user.noOfVisits !== undefined) && (
          <div className="mt-2 flex gap-3 text-[10px] text-[#9CA3AF] dark:text-slate-400">
            {user.noOfCalls  !== undefined && <span>Calls: {user.noOfCalls}</span>}
            {user.noOfVisits !== undefined && <span>Visits: {user.noOfVisits}</span>}
          </div>
        )}

        <p className="mt-2 text-right text-[10px] text-[#C4C9D4] select-none">Drag to advance</p>
      </div>

      {showInsertAfter && <div className="mt-1 h-0.5 w-full rounded-full bg-[#000080]" />}
    </div>
  );
}

type ColState = Record<string, UserBasicResponse[]>;

interface DragOverCard { userId: string; colStatus: string; insertBefore: boolean }

export default function GuestWorkflowPage() {
  const [colState, setColState] = useState<ColState>(() =>
    Object.fromEntries(COLUMNS.map((c) => [c.status, []]))
  );
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [toast,    setToast]    = useState("");
  const [moving,   setMoving]   = useState<string | null>(null);

  const [dragOverCol,  setDragOverCol]  = useState<string | null>(null);
  const [dragOverCard, setDragOverCard] = useState<DragOverCard | null>(null);

  const dragUserId  = useRef<string | null>(null);
  const dragFromCol = useRef<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getGuestWorkflow();
      const next: ColState = Object.fromEntries(COLUMNS.map((c) => [c.status, []]));
      for (const col of res.columns ?? []) {
        if (next[col.status] !== undefined) next[col.status] = col.users ?? [];
      }
      setColState(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load guest workflow.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalCount = Object.values(colState).reduce((s, arr) => s + arr.length, 0);

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, userId: string, fromStatus: string) => {
    dragUserId.current  = userId;
    dragFromCol.current = fromStatus;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", userId);
  };

  const handleDragEnd = () => {
    setDragOverCol(null);
    setDragOverCard(null);
    dragUserId.current  = null;
    dragFromCol.current = null;
  };

  const handleColDragOver = (e: React.DragEvent, toStatus: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!dragOverCard) setDragOverCol(toStatus);
  };

  const handleCardDragOver = (e: React.DragEvent, targetUserId: string, colStatus: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const insertBefore = e.clientY < rect.top + rect.height / 2;
    setDragOverCard({ userId: targetUserId, colStatus, insertBefore });
    setDragOverCol(colStatus);
  };

  const moveUser = async (userId: string, fromCol: string, toCol: string) => {
    if (fromCol === toCol) return;

    const user = colState[fromCol]?.find((u) => u.id === userId);
    if (!user) return;

    // Optimistic update
    setColState((prev) => {
      const next = { ...prev };
      next[fromCol] = prev[fromCol].filter((u) => u.id !== userId);
      next[toCol]   = [...(prev[toCol] ?? []), { ...user }];
      return next;
    });

    setMoving(userId);
    try {
      await applyTransition(userId, fromCol, toCol);
      const colLabel = COLUMNS.find((c) => c.status === toCol)?.label ?? toCol;
      showToast(`Moved to "${colLabel}"`);
    } catch (err) {
      // Revert on failure
      setColState((prev) => {
        const next = { ...prev };
        next[toCol]   = prev[toCol].filter((u) => u.id !== userId);
        next[fromCol] = [...(prev[fromCol] ?? []), user];
        return next;
      });
      showToast(err instanceof Error ? err.message : "Move failed — please try again.");
    } finally {
      setMoving(null);
    }
  };

  const handleColDrop = async (e: React.DragEvent, toStatus: string) => {
    e.preventDefault();
    setDragOverCol(null);
    setDragOverCard(null);

    const userId  = dragUserId.current;
    const fromCol = dragFromCol.current;
    if (!userId || !fromCol) return;

    await moveUser(userId, fromCol, toStatus);
  };

  const handleCardDrop = async (e: React.DragEvent, targetUserId: string, colStatus: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCol(null);
    setDragOverCard(null);

    const userId  = dragUserId.current;
    const fromCol = dragFromCol.current;
    if (!userId || !fromCol || userId === targetUserId) return;

    await moveUser(userId, fromCol, colStatus);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      {toast && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 max-w-xs rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3 text-sm font-medium text-[#111827] dark:text-slate-100 shadow-xl">
          {toast}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] dark:bg-blue-900/30">
            <GitBranch className="h-5 w-5 text-[#2563EB] dark:text-blue-300" />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Workflows</h1>
            <h2 className="text-[20px] font-bold text-[#000080] dark:text-indigo-400">Guest Workflow</h2>
            {!loading && (
              <p className="text-xs text-[#6B7280] dark:text-slate-400">
                {totalCount} active guest{totalCount !== 1 ? "s" : ""} · Drag cards to advance stage
              </p>
            )}
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-[#374151] dark:text-slate-300 hover:bg-[#F9FAFB] disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button className="font-medium underline" onClick={load}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-[#6B7280] dark:text-slate-400">
            <GitBranch className="h-8 w-8 animate-pulse text-[#2563EB] dark:text-blue-300" />
            <p className="text-sm">Loading guest workflow…</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const users     = colState[col.status] ?? [];
            const isColOver = dragOverCol === col.status && !dragOverCard;

            return (
              <div
                key={col.status}
                onDragOver={(e) => handleColDragOver(e, col.status)}
                onDrop={(e) => handleColDrop(e, col.status)}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverCol(null);
                    setDragOverCard(null);
                  }
                }}
                className={`flex min-w-[260px] flex-1 flex-col rounded-xl border-2 transition-all ${
                  isColOver
                    ? "border-[#000080] dark:border-indigo-500 bg-[#E8EAF0] dark:bg-indigo-900/20 shadow-md"
                    : "border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] dark:bg-slate-800/50"
                }`}
              >
                {/* Column header */}
                <div className={`flex items-center justify-between rounded-t-xl px-4 py-3 ${col.headerBg}`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                    <span className={`text-sm font-semibold ${col.headerText}`}>{col.label}</span>
                  </div>
                  <span className={`rounded-full bg-white dark:bg-slate-800/80 px-2.5 py-0.5 text-xs font-bold text-[#374151] dark:text-slate-300`}>
                    {users.length}
                  </span>
                </div>

                {/* Drop hint when empty */}
                {isColOver && users.length === 0 && (
                  <div className="mx-3 mt-2 rounded-lg border-2 border-dashed border-[#000080]/40 dark:border-indigo-500/40 bg-[#E8EAF0] dark:bg-indigo-900/20 py-3 text-center text-xs font-medium text-[#000080] dark:text-indigo-400">
                    Drop here
                  </div>
                )}

                {/* Cards */}
                <div className="flex flex-1 flex-col p-3">
                  {users.length === 0 && !isColOver ? (
                    <div className="flex flex-col items-center gap-1 py-8 text-center">
                      <User className="h-6 w-6 text-[#D1D5DB]" />
                      <p className="text-xs text-[#9CA3AF] dark:text-slate-400">No guests here</p>
                    </div>
                  ) : (
                    users.map((user) => {
                      const overInfo =
                        dragOverCard?.userId === user.id && dragOverCard.colStatus === col.status
                          ? dragOverCard
                          : null;
                      return (
                        <GuestCard
                          key={user.id}
                          user={user}
                          fromStatus={col.status}
                          isMoving={moving === user.id}
                          showInsertBefore={overInfo?.insertBefore === true}
                          showInsertAfter={overInfo?.insertBefore === false}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onDragOver={handleCardDragOver}
                          onDrop={handleCardDrop}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
