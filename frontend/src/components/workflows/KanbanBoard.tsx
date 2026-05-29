"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { changeRequestStatus, type RequestResponse, type BoardColumn } from "@/lib/api";
import { RefreshCw, GripVertical, User, Calendar, MessageSquare, X, ChevronDown } from "lucide-react";

// ─── Column config ────────────────────────────────────────────────────────────
export interface ColumnConfig {
  status: string;
  label:  string;
  headerBg:  string;
  headerText: string;
  dotColor:  string;
}

export const PRAYER_COLUMNS: ColumnConfig[] = [
  { status: "RECEIVED",    label: "Received",    headerBg: "bg-blue-50 dark:bg-blue-900/20",   headerText: "text-blue-800",  dotColor: "bg-blue-400"  },
  { status: "ASSIGNED",    label: "Assigned",    headerBg: "bg-yellow-50", headerText: "text-yellow-800",dotColor: "bg-yellow-400"},
  { status: "IN_PROGRESS", label: "In Progress", headerBg: "bg-purple-50", headerText: "text-purple-800",dotColor: "bg-purple-400"},
  { status: "RESOLVED",    label: "Resolved",    headerBg: "bg-green-50 dark:bg-green-900/20",  headerText: "text-green-800", dotColor: "bg-green-400" },
];

export const COUNSELING_COLUMNS: ColumnConfig[] = [
  { status: "RECEIVED",    label: "Received",   headerBg: "bg-blue-50 dark:bg-blue-900/20",   headerText: "text-blue-800",  dotColor: "bg-blue-400"  },
  { status: "ASSIGNED",    label: "Scheduled",  headerBg: "bg-yellow-50", headerText: "text-yellow-800",dotColor: "bg-yellow-400"},
  { status: "IN_PROGRESS", label: "In Session", headerBg: "bg-purple-50", headerText: "text-purple-800",dotColor: "bg-purple-400"},
  { status: "RESOLVED",    label: "Resolved",   headerBg: "bg-green-50 dark:bg-green-900/20",  headerText: "text-green-800", dotColor: "bg-green-400" },
];

export const GUEST_COLUMNS: ColumnConfig[] = [
  { status: "RECEIVED",    label: "First Timers",     headerBg: "bg-blue-50 dark:bg-blue-900/20",   headerText: "text-blue-800",  dotColor: "bg-blue-400"   },
  { status: "ASSIGNED",    label: "Follow-up Call",   headerBg: "bg-yellow-50", headerText: "text-yellow-800",dotColor: "bg-yellow-400" },
  { status: "IN_PROGRESS", label: "Follow-up Visit",  headerBg: "bg-purple-50", headerText: "text-purple-800",dotColor: "bg-purple-400" },
  { status: "RESOLVED",    label: "Second Timers",    headerBg: "bg-green-50 dark:bg-green-900/20",  headerText: "text-green-800", dotColor: "bg-green-400"  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fullName(u?: { firstName?: string; middleName?: string; lastName?: string } | null) {
  if (!u) return "—";
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fmtDate(s?: any): string {
  if (!s) return "";
  if (Array.isArray(s)) {
    const [year, month, day] = s as number[];
    return new Date(year, month - 1, day).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  const d = new Date(s as string);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function limitWords(text: string, max: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= max) return text;
  return words.slice(0, max).join(" ") + "…";
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ColumnsState { [status: string]: RequestResponse[] }

interface DragOverCard {
  cardId: string;
  colStatus: string;
  insertBefore: boolean;
}

interface KanbanBoardProps {
  columns:    ColumnConfig[];
  boardData:  BoardColumn[];
  onRefresh?: () => void;
  loading?:   boolean;
}

// ─── Board Component ──────────────────────────────────────────────────────────
export default function KanbanBoard({ columns, boardData, onRefresh, loading }: KanbanBoardProps) {
  const buildState = useCallback((data: BoardColumn[]): ColumnsState => {
    const state: ColumnsState = {};
    columns.forEach((col) => { state[col.status] = []; });
    data.forEach((col) => {
      if (state[col.status] !== undefined) state[col.status] = col.requests ?? [];
    });
    return state;
  }, [columns]);

  const [cards, setCards]             = useState<ColumnsState>(() => buildState(boardData));
  const [moving, setMoving]           = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [dragOverCard, setDragOverCard] = useState<DragOverCard | null>(null);
  const [toast, setToast]             = useState("");
  const [editCard, setEditCard]       = useState<{ card: RequestResponse; fromStatus: string } | null>(null);

  useEffect(() => { setCards(buildState(boardData)); }, [boardData, buildState]);

  const dragCardId  = useRef<string | null>(null);
  const dragFromCol = useRef<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Drag: card start ──
  const handleDragStart = (e: React.DragEvent, cardId: string, fromStatus: string) => {
    dragCardId.current  = cardId;
    dragFromCol.current = fromStatus;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", cardId);
  };

  const handleDragEnd = () => {
    setDragOverCol(null);
    setDragOverCard(null);
    dragCardId.current  = null;
    dragFromCol.current = null;
  };

  // ── Drag: column level ──
  const handleColDragOver = (e: React.DragEvent, toStatus: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!dragOverCard) setDragOverCol(toStatus);
  };

  const handleColDrop = async (e: React.DragEvent, toStatus: string) => {
    e.preventDefault();
    if (dragOverCard && dragOverCard.colStatus === toStatus) return;

    setDragOverCol(null);
    setDragOverCard(null);

    const cardId  = dragCardId.current;
    const fromCol = dragFromCol.current;
    if (!cardId || !fromCol) return;

    if (fromCol === toStatus) {
      setCards((prev) => {
        const next = { ...prev };
        const arr  = prev[fromCol].filter((c) => c.id !== cardId);
        const card = prev[fromCol].find((c) => c.id === cardId)!;
        next[fromCol] = [...arr, card];
        return next;
      });
      return;
    }

    await moveCard(cardId, fromCol, toStatus, null);
  };

  // ── Drag: card level ──
  const handleCardDragOver = (e: React.DragEvent, targetCardId: string, colStatus: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const insertBefore = e.clientY < rect.top + rect.height / 2;
    setDragOverCard({ cardId: targetCardId, colStatus, insertBefore });
    setDragOverCol(colStatus);
  };

  const handleCardDrop = async (e: React.DragEvent, targetCardId: string, colStatus: string) => {
    e.preventDefault();
    e.stopPropagation();

    const cardId  = dragCardId.current;
    const fromCol = dragFromCol.current;
    const info    = dragOverCard;

    setDragOverCol(null);
    setDragOverCard(null);

    if (!cardId || !fromCol || !info) return;
    if (cardId === targetCardId) return;

    await moveCard(cardId, fromCol, colStatus, { targetCardId, insertBefore: info.insertBefore });
  };

  // ── Core move logic ──
  const moveCard = async (
    cardId: string,
    fromCol: string,
    toCol: string,
    position: { targetCardId: string; insertBefore: boolean } | null,
  ) => {
    const card = cards[fromCol]?.find((c) => c.id === cardId);
    if (!card) return;

    // Snapshot the state BEFORE the optimistic update so we can revert accurately.
    const snapshotFromCol = cards[fromCol];
    const snapshotToCol   = cards[toCol] ?? [];

    setCards((prev) => {
      const next = { ...prev };
      next[fromCol] = prev[fromCol].filter((c) => c.id !== cardId);
      const updatedCard = { ...card, requestStatus: toCol };
      let destArr = (prev[toCol] ?? []).filter((c) => c.id !== cardId);
      if (position) {
        const targetIdx = destArr.findIndex((c) => c.id === position.targetCardId);
        if (targetIdx === -1) {
          destArr = [...destArr, updatedCard];
        } else {
          const insertIdx = position.insertBefore ? targetIdx : targetIdx + 1;
          destArr.splice(insertIdx, 0, updatedCard);
        }
      } else {
        destArr = [...destArr, updatedCard];
      }
      next[toCol] = destArr;
      return next;
    });

    if (fromCol === toCol) return;

    setMoving(cardId);
    try {
      await changeRequestStatus(cardId, toCol);
      showToast(`Moved to "${columns.find((c) => c.status === toCol)?.label ?? toCol}"`);
    } catch (err) {
      // Revert to the pre-move snapshot to avoid any stale-closure issues.
      setCards((prev) => ({
        ...prev,
        [fromCol]: snapshotFromCol,
        [toCol]:   snapshotToCol,
      }));
      const msg = err instanceof Error ? err.message : "Failed to move card.";
      showToast(`Move failed: ${msg}`);
      console.error("[KanbanBoard] changeRequestStatus error:", err);
    } finally {
      setMoving(null);
    }
  };

  // ── Status change from modal ──
  const handleStatusChange = async (card: RequestResponse, fromStatus: string, toStatus: string) => {
    if (fromStatus === toStatus) return;

    // Snapshot before optimistic update.
    const snapshotFrom = cards[fromStatus] ?? [];
    const snapshotTo   = cards[toStatus]   ?? [];

    setCards((prev) => {
      const next = { ...prev };
      next[fromStatus] = (prev[fromStatus] ?? []).filter((c) => c.id !== card.id);
      next[toStatus]   = [...(prev[toStatus] ?? []), { ...card, requestStatus: toStatus }];
      return next;
    });
    setEditCard((prev) => prev
      ? { ...prev, card: { ...prev.card, requestStatus: toStatus }, fromStatus: toStatus }
      : null
    );
    try {
      await changeRequestStatus(card.id, toStatus);
      showToast(`Status updated to "${columns.find((c) => c.status === toStatus)?.label ?? toStatus}"`);
    } catch (err) {
      setCards((prev) => ({
        ...prev,
        [fromStatus]: snapshotFrom,
        [toStatus]:   snapshotTo,
      }));
      setEditCard((prev) => prev ? { ...prev, card, fromStatus } : null);
      const msg = err instanceof Error ? err.message : "Failed to update status.";
      showToast(`Update failed: ${msg}`);
      console.error("[KanbanBoard] handleStatusChange error:", err);
    }
  };

  // ── Render ──
  return (
    <div className="relative">
      {toast && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3 text-sm font-medium text-[#111827] dark:text-slate-100 shadow-xl">
          {toast}
        </div>
      )}

      {editCard && (
        <CardDetailModal
          card={editCard.card}
          fromStatus={editCard.fromStatus}
          columns={columns}
          onStatusChange={(toStatus) => handleStatusChange(editCard.card, editCard.fromStatus, toStatus)}
          onClose={() => setEditCard(null)}
        />
      )}

      {onRefresh && (
        <div className="mb-4 flex justify-end">
          <button onClick={onRefresh} disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-[#374151] dark:text-slate-300 transition hover:border-[#000080] hover:text-[#000080] dark:text-indigo-400 disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      )}

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colCards  = cards[col.status] ?? [];
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
              className={`flex min-w-[280px] flex-1 flex-col rounded-xl border-2 transition-all ${
                isColOver
                  ? "border-[#000080] bg-[#E8EAF0] shadow-md"
                  : "border-[#E5E7EB] dark:border-slate-700 bg-[#F3F4F6] dark:bg-slate-700/30"
              }`}
            >
              {/* Column header */}
              <div className={`flex items-center justify-between rounded-t-xl ${col.headerBg} px-4 py-3`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                  <h3 className={`text-sm font-bold ${col.headerText}`}>{col.label}</h3>
                </div>
                <span className="rounded-full bg-white dark:bg-slate-800/80 px-2.5 py-0.5 text-xs font-bold text-[#374151] dark:text-slate-300">
                  {colCards.length}
                </span>
              </div>

              {/* Drop hint (empty column while dragging over) */}
              {isColOver && colCards.length === 0 && (
                <div className="mx-3 mt-2 rounded-lg border-2 border-dashed border-[#000080]/40 bg-[#E8EAF0] py-3 text-center text-xs font-medium text-[#000080] dark:text-indigo-400">
                  Drop here
                </div>
              )}

              {/* Cards list */}
              <div className="flex flex-1 flex-col gap-0 p-3">
                {colCards.map((card) => {
                  const overInfo =
                    dragOverCard?.cardId === card.id && dragOverCard.colStatus === col.status
                      ? dragOverCard
                      : null;
                  return (
                    <KanbanCard
                      key={card.id}
                      card={card}
                      fromStatus={col.status}
                      isMoving={moving === card.id}
                      showInsertBefore={overInfo?.insertBefore === true}
                      showInsertAfter={overInfo?.insertBefore === false}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onCardDragOver={handleCardDragOver}
                      onCardDrop={handleCardDrop}
                      onDoubleClick={() => setEditCard({ card, fromStatus: col.status })}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── KanbanCard ───────────────────────────────────────────────────────────────
function KanbanCard({
  card, fromStatus, isMoving, showInsertBefore, showInsertAfter,
  onDragStart, onDragEnd, onCardDragOver, onCardDrop, onDoubleClick,
}: {
  card: RequestResponse;
  fromStatus: string;
  isMoving: boolean;
  showInsertBefore: boolean;
  showInsertAfter: boolean;
  onDragStart: (e: React.DragEvent, id: string, from: string) => void;
  onDragEnd: () => void;
  onCardDragOver: (e: React.DragEvent, cardId: string, colStatus: string) => void;
  onCardDrop: (e: React.DragEvent, cardId: string, colStatus: string) => void;
  onDoubleClick: () => void;
}) {
  const typeBadge: Record<string, string> = {
    PRAYER:      "bg-[#EDE9FE] dark:bg-purple-900/30 text-[#7C3AED] dark:text-purple-400",
    COUNSELING:  "bg-[#DBEAFE] dark:bg-blue-900/30 text-[#1D4ED8] dark:text-blue-300",
    SUGGESTIONS: "bg-[#DCFCE7] dark:bg-green-900/30 text-[#16A34A] dark:text-green-300",
  };

  return (
    <div className="mb-2.5">
      {showInsertBefore && (
        <div className="mb-1 h-0.5 w-full rounded-full bg-[#000080] shadow-sm" />
      )}

      <div
        draggable
        onDragStart={(e) => onDragStart(e, card.id, fromStatus)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => onCardDragOver(e, card.id, fromStatus)}
        onDrop={(e) => onCardDrop(e, card.id, fromStatus)}
        onDoubleClick={onDoubleClick}
        title="Double-click to view / edit"
        className={`group rounded-xl border bg-white dark:bg-slate-800 p-3.5 shadow-sm transition-all cursor-grab active:cursor-grabbing select-none ${
          isMoving
            ? "opacity-50 scale-95"
            : "border-[#E5E7EB] dark:border-slate-700 hover:border-[#000080] hover:shadow-md"
        }`}
      >
        {/* Type badge + grip */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${typeBadge[card.requestType ?? ""] ?? "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400"}`}>
            {(card.requestType ?? "").replace(/_/g, " ")}
          </span>
          <GripVertical className="h-4 w-4 shrink-0 text-[#D1D5DB] group-hover:text-[#9CA3AF] dark:text-slate-400" />
        </div>

        {/* Subject — 10 words max */}
        <p className="text-sm font-semibold text-[#111827] dark:text-slate-100 leading-snug break-all">
          {limitWords(card.subject || "—", 10)}
        </p>

        {/* Content — 18 words max */}
        {card.content && (
          <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400 leading-relaxed break-all">
            {limitWords(card.content, 18)}
          </p>
        )}

        {/* Meta */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-[#374151] dark:text-slate-300">
            <User className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF] dark:text-slate-400" />
            <span className="font-medium truncate">{fullName(card.owner)}</span>
          </div>
          {card.assignedTo && (
            <div className="flex items-center gap-1.5 text-xs text-[#374151] dark:text-slate-300">
              <MessageSquare className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF] dark:text-slate-400" />
              <span className="truncate">Assigned: <span className="font-medium">{fullName(card.assignedTo)}</span></span>
            </div>
          )}
          {card.createdOn && (
            <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF] dark:text-slate-400">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{fmtDate(card.createdOn)}</span>
            </div>
          )}
        </div>

        {/* Hint */}
        <p className="mt-2.5 text-[10px] text-[#C4C9D4] text-right select-none">
          Double-click to edit
        </p>
      </div>

      {showInsertAfter && (
        <div className="mt-1 h-0.5 w-full rounded-full bg-[#000080] shadow-sm" />
      )}
    </div>
  );
}

// ─── CardDetailModal ──────────────────────────────────────────────────────────
function CardDetailModal({
  card, fromStatus, columns, onStatusChange, onClose,
}: {
  card: RequestResponse;
  fromStatus: string;
  columns: ColumnConfig[];
  onStatusChange: (toStatus: string) => void;
  onClose: () => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState(fromStatus);
  const [saving, setSaving]     = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const currentLabel = columns.find((c) => c.status === selectedStatus)?.label ?? selectedStatus;

  const applyStatus = async (status: string) => {
    if (status === selectedStatus) { setStatusOpen(false); return; }
    setSaving(true);
    setStatusOpen(false);
    await onStatusChange(status);
    setSelectedStatus(status);
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E5E7EB] dark:border-slate-700 px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] dark:text-slate-400">
              {(card.requestType ?? "").replace(/_/g, " ")} REQUEST
            </p>
            <h2 className="mt-0.5 text-base font-bold text-[#111827] dark:text-slate-100 break-all">{card.subject || "—"}</h2>
          </div>
          <button onClick={onClose}
            className="ml-4 rounded-lg p-1.5 text-[#9CA3AF] dark:text-slate-400 hover:bg-[#F3F4F6] dark:bg-slate-700/30 hover:text-[#374151] dark:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {/* Status */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#374151] dark:text-slate-300">Status</label>
            <div className="relative">
              <button
                onClick={() => setStatusOpen((o) => !o)}
                disabled={saving}
                className="flex w-full items-center justify-between rounded-lg border border-[#D1D5DB] bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 hover:border-[#000080] disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${columns.find((c) => c.status === selectedStatus)?.dotColor ?? "bg-gray-400"}`} />
                  {currentLabel}
                </span>
                <ChevronDown className={`h-4 w-4 text-[#9CA3AF] dark:text-slate-400 transition-transform ${statusOpen ? "rotate-180" : ""}`} />
              </button>
              {statusOpen && (
                <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
                  {columns.map((col) => (
                    <button key={col.status} onClick={() => applyStatus(col.status)}
                      className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-[#F9FAFB] ${
                        col.status === selectedStatus ? "font-semibold text-[#000080] dark:text-indigo-400" : "text-[#374151] dark:text-slate-300"
                      }`}>
                      <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                      {col.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {saving && <p className="mt-1 text-[10px] text-[#9CA3AF] dark:text-slate-400">Saving…</p>}
          </div>

          {/* Content */}
          <div>
            <p className="mb-1 text-xs font-semibold text-[#374151] dark:text-slate-300">Request Content</p>
            <div className="rounded-lg bg-[#F9FAFB] px-4 py-3 text-sm text-[#374151] dark:text-slate-300 leading-relaxed min-h-[80px] break-all">
              {card.content || <span className="text-[#9CA3AF] dark:text-slate-400">No content provided.</span>}
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] dark:text-slate-400">Submitted By</p>
              <p className="mt-0.5 text-sm font-medium text-[#111827] dark:text-slate-100 break-all">{fullName(card.owner)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] dark:text-slate-400">Assigned To</p>
              <p className="mt-0.5 text-sm font-medium text-[#111827] dark:text-slate-100 break-all">{card.assignedTo ? fullName(card.assignedTo) : "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] dark:text-slate-400">Date Submitted</p>
              <p className="mt-0.5 text-sm font-medium text-[#111827] dark:text-slate-100">{fmtDate(card.createdOn)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] dark:text-slate-400">Request Type</p>
              <p className="mt-0.5 text-sm font-medium text-[#111827] dark:text-slate-100">{(card.requestType ?? "—").replace(/_/g, " ")}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-[#E5E7EB] dark:border-slate-700 px-6 py-4">
          <button onClick={onClose}
            className="rounded-lg bg-[#000080] px-5 py-2 text-sm font-medium text-white hover:bg-[#000066]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
