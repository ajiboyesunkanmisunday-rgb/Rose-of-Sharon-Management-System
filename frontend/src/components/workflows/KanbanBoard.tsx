"use client";

import { useState, useRef, useCallback } from "react";
import { changeRequestStatus, type RequestResponse, type BoardColumn } from "@/lib/api";
import { RefreshCw, GripVertical, User, Calendar, MessageSquare } from "lucide-react";

// ─── Column config ────────────────────────────────────────────────────────────
export interface ColumnConfig {
  status: string;        // matches API status value
  label:  string;        // display label
  headerBg:  string;
  headerText: string;
  dotColor:  string;
}

export const PRAYER_COLUMNS: ColumnConfig[] = [
  { status: "RECEIVED",    label: "Received",    headerBg: "bg-blue-50",   headerText: "text-blue-800",  dotColor: "bg-blue-400"  },
  { status: "ASSIGNED",    label: "Assigned",    headerBg: "bg-yellow-50", headerText: "text-yellow-800",dotColor: "bg-yellow-400"},
  { status: "IN_PROGRESS", label: "In Progress", headerBg: "bg-purple-50", headerText: "text-purple-800",dotColor: "bg-purple-400"},
  { status: "RESOLVED",    label: "Resolved",    headerBg: "bg-green-50",  headerText: "text-green-800", dotColor: "bg-green-400" },
];

export const COUNSELING_COLUMNS: ColumnConfig[] = [
  { status: "RECEIVED",    label: "Received",   headerBg: "bg-blue-50",   headerText: "text-blue-800",  dotColor: "bg-blue-400"  },
  { status: "ASSIGNED",    label: "Scheduled",  headerBg: "bg-yellow-50", headerText: "text-yellow-800",dotColor: "bg-yellow-400"},
  { status: "IN_PROGRESS", label: "In Session", headerBg: "bg-purple-50", headerText: "text-purple-800",dotColor: "bg-purple-400"},
  { status: "RESOLVED",    label: "Resolved",   headerBg: "bg-green-50",  headerText: "text-green-800", dotColor: "bg-green-400" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fullName(u?: { firstName?: string; middleName?: string; lastName?: string } | null) {
  if (!u) return "—";
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}
function fmtDate(s?: string) {
  if (!s) return "";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ColumnsState {
  [status: string]: RequestResponse[];
}

interface KanbanBoardProps {
  columns:    ColumnConfig[];
  boardData:  BoardColumn[];
  onRefresh?: () => void;
  loading?:   boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function KanbanBoard({ columns, boardData, onRefresh, loading }: KanbanBoardProps) {
  // Build initial state from API data
  const buildState = useCallback((data: BoardColumn[]): ColumnsState => {
    const state: ColumnsState = {};
    columns.forEach((col) => { state[col.status] = []; });
    data.forEach((col) => {
      if (state[col.status] !== undefined) {
        state[col.status] = col.requests ?? [];
      }
    });
    return state;
  }, [columns]);

  const [cards, setCards]       = useState<ColumnsState>(() => buildState(boardData));
  const [moving, setMoving]     = useState<string | null>(null);  // card ID being moved
  const [dragOver, setDragOver] = useState<string | null>(null);  // column status being hovered
  const [toast, setToast]       = useState("");

  // Keep cards in sync when boardData prop changes (after refresh)
  const prevDataRef = useRef<BoardColumn[]>([]);
  if (prevDataRef.current !== boardData) {
    prevDataRef.current = boardData;
    setCards(buildState(boardData));
  }

  const dragCardId  = useRef<string | null>(null);
  const dragFromCol = useRef<string | null>(null);

  // ── Drag handlers ──
  const handleDragStart = (cardId: string, fromStatus: string) => {
    dragCardId.current  = cardId;
    dragFromCol.current = fromStatus;
  };

  const handleDragOver = (e: React.DragEvent, toStatus: string) => {
    e.preventDefault();
    setDragOver(toStatus);
  };

  const handleDrop = async (e: React.DragEvent, toStatus: string) => {
    e.preventDefault();
    setDragOver(null);
    const cardId  = dragCardId.current;
    const fromCol = dragFromCol.current;
    if (!cardId || !fromCol || fromCol === toStatus) return;

    // Optimistic update
    const card = cards[fromCol]?.find((c) => c.id === cardId);
    if (!card) return;

    setCards((prev) => {
      const next = { ...prev };
      next[fromCol] = prev[fromCol].filter((c) => c.id !== cardId);
      next[toStatus] = [...(prev[toStatus] ?? []), { ...card, requestStatus: toStatus }];
      return next;
    });

    setMoving(cardId);
    try {
      await changeRequestStatus(cardId, toStatus);
      showToast(`Moved to "${columns.find((c) => c.status === toStatus)?.label ?? toStatus}"`);
    } catch {
      // Revert
      setCards((prev) => {
        const next = { ...prev };
        next[toStatus] = prev[toStatus].filter((c) => c.id !== cardId);
        next[fromCol] = [...(prev[fromCol] ?? []), card];
        return next;
      });
      showToast("Failed to move card — please try again.");
    } finally {
      setMoving(null);
    }
  };

  const handleDragEnd = () => { setDragOver(null); };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Render ──
  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 rounded-xl border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-medium text-[#111827] shadow-xl">
          {toast}
        </div>
      )}

      {/* Refresh bar */}
      {onRefresh && (
        <div className="mb-4 flex justify-end">
          <button onClick={onRefresh} disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#374151] transition hover:border-[#000080] hover:text-[#000080] disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      )}

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colCards = cards[col.status] ?? [];
          const isOver   = dragOver === col.status;

          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDrop={(e) => handleDrop(e, col.status)}
              onDragLeave={() => setDragOver(null)}
              className={`flex min-w-[280px] flex-1 flex-col rounded-xl border-2 bg-white transition-all ${
                isOver ? "border-[#000080] shadow-md" : "border-[#E5E7EB]"
              }`}
            >
              {/* Column header */}
              <div className={`flex items-center justify-between rounded-t-xl ${col.headerBg} px-4 py-3`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                  <h3 className={`text-sm font-bold ${col.headerText}`}>{col.label}</h3>
                </div>
                <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-bold text-[#374151]">
                  {colCards.length}
                </span>
              </div>

              {/* Drop zone hint */}
              {isOver && (
                <div className="mx-3 mt-2 rounded-lg border-2 border-dashed border-[#000080]/40 bg-[#F0F2FF] py-3 text-center text-xs font-medium text-[#000080]">
                  Drop here
                </div>
              )}

              {/* Cards */}
              <div className="flex flex-1 flex-col gap-2.5 p-3">
                {colCards.length === 0 && !isOver && (
                  <div className="flex flex-1 items-center justify-center py-6 text-xs text-[#9CA3AF]">
                    No requests
                  </div>
                )}
                {colCards.map((card) => (
                  <KanbanCard
                    key={card.id}
                    card={card}
                    fromStatus={col.status}
                    isMoving={moving === card.id}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))}
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
  card, fromStatus, isMoving, onDragStart, onDragEnd,
}: {
  card: RequestResponse;
  fromStatus: string;
  isMoving: boolean;
  onDragStart: (id: string, from: string) => void;
  onDragEnd: () => void;
}) {
  const typeBadge: Record<string, string> = {
    PRAYER:      "bg-[#EDE9FE] text-[#7C3AED]",
    COUNSELING:  "bg-[#DBEAFE] text-[#1D4ED8]",
    SUGGESTIONS: "bg-[#DCFCE7] text-[#16A34A]",
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(card.id, fromStatus)}
      onDragEnd={onDragEnd}
      className={`group rounded-xl border bg-white p-3.5 shadow-sm transition-all cursor-grab active:cursor-grabbing ${
        isMoving ? "opacity-50 scale-95" : "border-[#E5E7EB] hover:border-[#000080] hover:shadow-md"
      }`}
    >
      {/* Drag handle + type badge */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${typeBadge[card.requestType ?? ""] ?? "bg-gray-100 text-gray-600"}`}>
          {(card.requestType ?? "").replace(/_/g, " ")}
        </span>
        <GripVertical className="h-4 w-4 shrink-0 text-[#D1D5DB] group-hover:text-[#9CA3AF]" />
      </div>

      {/* Subject */}
      <p className="text-sm font-semibold text-[#111827] leading-snug">{card.subject || "—"}</p>

      {/* Content preview */}
      {card.content && (
        <p className="mt-1 line-clamp-2 text-xs text-[#6B7280] leading-relaxed">{card.content}</p>
      )}

      {/* Meta */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-[#374151]">
          <User className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
          <span className="font-medium">{fullName(card.owner)}</span>
        </div>
        {card.assignedTo && (
          <div className="flex items-center gap-1.5 text-xs text-[#374151]">
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
            <span>Assigned: <span className="font-medium">{fullName(card.assignedTo)}</span></span>
          </div>
        )}
        {card.createdOn && (
          <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{fmtDate(card.createdOn)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
