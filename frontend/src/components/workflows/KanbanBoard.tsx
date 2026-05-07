"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { changeRequestStatus, type RequestResponse, type BoardColumn } from "@/lib/api";
import { RefreshCw, GripVertical, User, Calendar, MessageSquare, X, ChevronDown } from "lucide-react";

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
  const [moving, setMoving]     = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [toast, setToast]       = useState("");
  const [editCard, setEditCard] = useState<{ card: RequestResponse; fromStatus: string } | null>(null);

  // Sync cards when boardData prop changes (after refresh) — use effect, not render-time setState
  useEffect(() => {
    setCards(buildState(boardData));
  }, [boardData, buildState]);

  const dragCardId  = useRef<string | null>(null);
  const dragFromCol = useRef<string | null>(null);

  // ── Drag handlers ──
  const handleDragStart = (e: React.DragEvent, cardId: string, fromStatus: string) => {
    dragCardId.current  = cardId;
    dragFromCol.current = fromStatus;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", cardId); // required for Firefox
  };

  const handleDragOver = (e: React.DragEvent, toStatus: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(toStatus);
  };

  const handleDrop = async (e: React.DragEvent, toStatus: string) => {
    e.preventDefault();
    setDragOver(null);
    const cardId  = dragCardId.current;
    const fromCol = dragFromCol.current;
    if (!cardId || !fromCol || fromCol === toStatus) return;

    const card = cards[fromCol]?.find((c) => c.id === cardId);
    if (!card) return;

    // Optimistic update
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
      dragCardId.current  = null;
      dragFromCol.current = null;
    }
  };

  const handleDragEnd = () => {
    setDragOver(null);
    dragCardId.current  = null;
    dragFromCol.current = null;
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Status change from edit modal ──
  const handleStatusChange = async (card: RequestResponse, fromStatus: string, toStatus: string) => {
    if (fromStatus === toStatus) return;

    setCards((prev) => {
      const next = { ...prev };
      next[fromStatus] = (prev[fromStatus] ?? []).filter((c) => c.id !== card.id);
      next[toStatus]   = [...(prev[toStatus] ?? []), { ...card, requestStatus: toStatus }];
      return next;
    });

    // Update the editCard reference
    setEditCard((prev) => prev ? { ...prev, card: { ...prev.card, requestStatus: toStatus }, fromStatus: toStatus } : null);

    try {
      await changeRequestStatus(card.id, toStatus);
      showToast(`Status updated to "${columns.find((c) => c.status === toStatus)?.label ?? toStatus}"`);
    } catch {
      // Revert
      setCards((prev) => {
        const next = { ...prev };
        next[toStatus]   = (prev[toStatus] ?? []).filter((c) => c.id !== card.id);
        next[fromStatus] = [...(prev[fromStatus] ?? []), card];
        return next;
      });
      setEditCard((prev) => prev ? { ...prev, card, fromStatus } : null);
      showToast("Failed to update status — please try again.");
    }
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

      {/* Edit / Detail modal */}
      {editCard && (
        <CardDetailModal
          card={editCard.card}
          fromStatus={editCard.fromStatus}
          columns={columns}
          onStatusChange={(toStatus) => handleStatusChange(editCard.card, editCard.fromStatus, toStatus)}
          onClose={() => setEditCard(null)}
        />
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
              onDragLeave={(e) => {
                // Only clear if leaving the column entirely (not entering a child)
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOver(null);
                }
              }}
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
                    onEdit={() => setEditCard({ card, fromStatus: col.status })}
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
  card, fromStatus, isMoving, onDragStart, onDragEnd, onEdit,
}: {
  card: RequestResponse;
  fromStatus: string;
  isMoving: boolean;
  onDragStart: (e: React.DragEvent, id: string, from: string) => void;
  onDragEnd: () => void;
  onEdit: () => void;
}) {
  const typeBadge: Record<string, string> = {
    PRAYER:      "bg-[#EDE9FE] text-[#7C3AED]",
    COUNSELING:  "bg-[#DBEAFE] text-[#1D4ED8]",
    SUGGESTIONS: "bg-[#DCFCE7] text-[#16A34A]",
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card.id, fromStatus)}
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

      {/* Edit button */}
      <div className="mt-3 flex justify-end">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="text-xs font-medium text-[#000080] underline hover:text-[#000066]"
        >
          Edit / View
        </button>
      </div>
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
  const [saving, setSaving] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const currentLabel = columns.find((c) => c.status === selectedStatus)?.label ?? selectedStatus;

  const applyStatus = async (status: string) => {
    if (status === fromStatus) { setStatusOpen(false); return; }
    setSaving(true);
    setStatusOpen(false);
    await onStatusChange(status);
    setSelectedStatus(status);
    setSaving(false);
  };

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Modal header */}
        <div className="flex items-start justify-between border-b border-[#E5E7EB] px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
              {(card.requestType ?? "").replace(/_/g, " ")} REQUEST
            </p>
            <h2 className="mt-0.5 text-base font-bold text-[#111827]">{card.subject || "—"}</h2>
          </div>
          <button onClick={onClose} className="ml-4 rounded-lg p-1.5 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {/* Status changer */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#374151]">Status</label>
            <div className="relative">
              <button
                onClick={() => setStatusOpen((o) => !o)}
                disabled={saving}
                className="flex w-full items-center justify-between rounded-lg border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111827] hover:border-[#000080] disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${columns.find((c) => c.status === selectedStatus)?.dotColor ?? "bg-gray-400"}`} />
                  {currentLabel}
                </span>
                <ChevronDown className={`h-4 w-4 text-[#9CA3AF] transition-transform ${statusOpen ? "rotate-180" : ""}`} />
              </button>
              {statusOpen && (
                <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white shadow-lg">
                  {columns.map((col) => (
                    <button
                      key={col.status}
                      onClick={() => applyStatus(col.status)}
                      className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-[#F9FAFB] ${
                        col.status === selectedStatus ? "font-semibold text-[#000080]" : "text-[#374151]"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                      {col.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {saving && <p className="mt-1 text-[10px] text-[#9CA3AF]">Saving…</p>}
          </div>

          {/* Request details */}
          <div>
            <p className="mb-1 text-xs font-semibold text-[#374151]">Request Content</p>
            <div className="rounded-lg bg-[#F9FAFB] px-4 py-3 text-sm text-[#374151] leading-relaxed min-h-[80px]">
              {card.content || <span className="text-[#9CA3AF]">No content provided.</span>}
            </div>
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Submitted By</p>
              <p className="mt-0.5 text-sm font-medium text-[#111827]">{fullName(card.owner)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Assigned To</p>
              <p className="mt-0.5 text-sm font-medium text-[#111827]">{card.assignedTo ? fullName(card.assignedTo) : "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Date Submitted</p>
              <p className="mt-0.5 text-sm font-medium text-[#111827]">{fmtDate(card.createdOn)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Request Type</p>
              <p className="mt-0.5 text-sm font-medium text-[#111827]">{(card.requestType ?? "—").replace(/_/g, " ")}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-[#E5E7EB] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#000080] px-5 py-2 text-sm font-medium text-white hover:bg-[#000066]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
