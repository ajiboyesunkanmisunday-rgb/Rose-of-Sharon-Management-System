"use client";

import { useState, useRef } from "react";
import { GitBranch, GripVertical, Phone, User, CalendarDays, X, ChevronDown } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { activeWorkflowCards } from "@/lib/mock-data";
import { ActiveWorkflowCard, ActiveWorkflowStage, WorkflowCardStatus } from "@/lib/types";

// ── Column config ───────────────────────────────────────────────────────────────
const COLUMNS: { stage: ActiveWorkflowStage; headerBg: string; headerText: string; dotColor: string }[] = [
  { stage: "First Timers",    headerBg: "bg-blue-50",   headerText: "text-blue-800",  dotColor: "bg-blue-400"   },
  { stage: "Follow-up Call",  headerBg: "bg-yellow-50", headerText: "text-yellow-800",dotColor: "bg-yellow-400" },
  { stage: "Follow-up Visit", headerBg: "bg-purple-50", headerText: "text-purple-800",dotColor: "bg-purple-400" },
  { stage: "Second Timers",   headerBg: "bg-green-50",  headerText: "text-green-800", dotColor: "bg-green-400"  },
  { stage: "New Converts",    headerBg: "bg-indigo-50", headerText: "text-indigo-800",dotColor: "bg-indigo-400" },
];

const STATUS_COLORS: Record<WorkflowCardStatus, string> = {
  "On Track": "bg-[#DCFCE7] text-[#16A34A]",
  Overdue:    "bg-[#FEE2E2] text-[#DC2626]",
  Pending:    "bg-[#FEF9C3] text-[#CA8A04]",
};

type ColumnsState = Record<ActiveWorkflowStage, ActiveWorkflowCard[]>;

interface DragOverCard {
  cardId: string;
  stage:  ActiveWorkflowStage;
  insertBefore: boolean;
}

function buildState(cards: ActiveWorkflowCard[]): ColumnsState {
  const state = {} as ColumnsState;
  COLUMNS.forEach((c) => { state[c.stage] = []; });
  cards.forEach((card) => {
    if (state[card.stage] !== undefined) state[card.stage].push(card);
  });
  return state;
}

// ── Component ───────────────────────────────────────────────────────────────────
export default function GuestWorkflowPage() {
  const [columns,      setColumns]      = useState<ColumnsState>(() => buildState(activeWorkflowCards));
  const [dragOverCol,  setDragOverCol]  = useState<ActiveWorkflowStage | null>(null);
  const [dragOverCard, setDragOverCard] = useState<DragOverCard | null>(null);
  const [moving,       setMoving]       = useState<string | null>(null);
  const [toast,        setToast]        = useState("");
  const [editCard,     setEditCard]     = useState<ActiveWorkflowCard | null>(null);

  const dragCardId  = useRef<string | null>(null);
  const dragFromCol = useRef<ActiveWorkflowStage | null>(null);

  const totalCards = Object.values(columns).reduce((s, arr) => s + arr.length, 0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Drag: card start ──
  const handleDragStart = (e: React.DragEvent, cardId: string, fromStage: ActiveWorkflowStage) => {
    dragCardId.current  = cardId;
    dragFromCol.current = fromStage;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", cardId);
    setMoving(cardId);
  };

  const handleDragEnd = () => {
    setDragOverCol(null);
    setDragOverCard(null);
    setMoving(null);
    dragCardId.current  = null;
    dragFromCol.current = null;
  };

  // ── Drag: column level ──
  const handleColDragOver = (e: React.DragEvent, toStage: ActiveWorkflowStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!dragOverCard) setDragOverCol(toStage);
  };

  const handleColDrop = (e: React.DragEvent, toStage: ActiveWorkflowStage) => {
    e.preventDefault();
    if (dragOverCard && dragOverCard.stage === toStage) return;

    setDragOverCol(null);
    setDragOverCard(null);

    const cardId    = dragCardId.current;
    const fromStage = dragFromCol.current;
    if (!cardId || !fromStage) return;

    moveCard(cardId, fromStage, toStage, null);
  };

  // ── Drag: card level ──
  const handleCardDragOver = (e: React.DragEvent, targetCardId: string, stage: ActiveWorkflowStage) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const insertBefore = e.clientY < rect.top + rect.height / 2;
    setDragOverCard({ cardId: targetCardId, stage, insertBefore });
    setDragOverCol(stage);
  };

  const handleCardDrop = (e: React.DragEvent, targetCardId: string, stage: ActiveWorkflowStage) => {
    e.preventDefault();
    e.stopPropagation();

    const cardId    = dragCardId.current;
    const fromStage = dragFromCol.current;
    const info      = dragOverCard;

    setDragOverCol(null);
    setDragOverCard(null);
    setMoving(null);

    if (!cardId || !fromStage || !info) return;
    if (cardId === targetCardId) return;

    moveCard(cardId, fromStage, stage, { targetCardId, insertBefore: info.insertBefore });
  };

  // ── Core move ──
  const moveCard = (
    cardId: string,
    fromStage: ActiveWorkflowStage,
    toStage: ActiveWorkflowStage,
    position: { targetCardId: string; insertBefore: boolean } | null,
  ) => {
    const card = columns[fromStage]?.find((c) => c.id === cardId);
    if (!card) return;

    setColumns((prev) => {
      const next = { ...prev };
      next[fromStage] = prev[fromStage].filter((c) => c.id !== cardId);
      const updatedCard = { ...card, stage: toStage };
      let destArr = (prev[toStage] ?? []).filter((c) => c.id !== cardId);
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
      next[toStage] = destArr;
      return next;
    });

    if (fromStage !== toStage) {
      showToast(`Moved "${card.memberName}" → ${toStage}`);
    }
    // NOTE: no backend API for guest workflow yet — client-side only
  };

  // ── Edit save ──
  const handleSaveCard = (updated: ActiveWorkflowCard) => {
    const oldStage = (Object.entries(columns) as [ActiveWorkflowStage, ActiveWorkflowCard[]][])
      .find(([, cards]) => cards.some((c) => c.id === updated.id))?.[0];
    if (!oldStage) return;

    setColumns((prev) => {
      const next = { ...prev };
      next[oldStage]      = prev[oldStage].filter((c) => c.id !== updated.id);
      next[updated.stage] = [...(prev[updated.stage] ?? []), updated];
      return next;
    });
    setEditCard(null);
    showToast(`"${updated.memberName}" updated.`);
  };

  return (
    <DashboardLayout>
      {toast && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 rounded-xl border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-medium text-[#111827] shadow-xl">
          {toast}
        </div>
      )}

      {editCard && (
        <GuestEditModal
          card={editCard}
          onSave={handleSaveCard}
          onClose={() => setEditCard(null)}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF]">
          <GitBranch className="h-6 w-6 text-[#2563EB]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000]">Guest Workflow</h1>
          <p className="text-sm text-[#6B7280]">
            {totalCards} active guest{totalCards !== 1 ? "s" : ""} · Drag cards between columns or reorder within a column
          </p>
        </div>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-6">
        {COLUMNS.map((col) => {
          const colCards = columns[col.stage] ?? [];
          const isColOver = dragOverCol === col.stage && !dragOverCard;

          return (
            <div
              key={col.stage}
              onDragOver={(e) => handleColDragOver(e, col.stage)}
              onDrop={(e) => handleColDrop(e, col.stage)}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverCol(null);
                  setDragOverCard(null);
                }
              }}
              className={`flex min-w-[270px] flex-1 flex-col rounded-xl border-2 transition-all ${
                isColOver
                  ? "border-[#000080] bg-[#E8EAF0] shadow-md"
                  : "border-[#E5E7EB] bg-[#F3F4F6]"
              }`}
            >
              {/* Column header */}
              <div className={`flex items-center justify-between rounded-t-xl ${col.headerBg} px-4 py-3`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                  <h3 className={`text-sm font-bold ${col.headerText}`}>{col.stage}</h3>
                </div>
                <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-bold text-[#374151]">
                  {colCards.length}
                </span>
              </div>

              {isColOver && colCards.length === 0 && (
                <div className="mx-3 mt-2 rounded-lg border-2 border-dashed border-[#000080]/40 bg-[#E8EAF0] py-3 text-center text-xs font-medium text-[#000080]">
                  Drop here
                </div>
              )}

              {/* Cards */}
              <div className="flex flex-1 flex-col gap-0 p-3">
                {colCards.map((card) => {
                  const overInfo = dragOverCard?.cardId === card.id && dragOverCard.stage === col.stage
                    ? dragOverCard
                    : null;
                  return (
                    <GuestCard
                      key={card.id}
                      card={card}
                      isMoving={moving === card.id}
                      showInsertBefore={overInfo?.insertBefore === true}
                      showInsertAfter={overInfo?.insertBefore === false}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onCardDragOver={handleCardDragOver}
                      onCardDrop={handleCardDrop}
                      onDoubleClick={() => setEditCard(card)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

// ── GuestCard ────────────────────────────────────────────────────────────────────
function GuestCard({
  card, isMoving, showInsertBefore, showInsertAfter,
  onDragStart, onDragEnd, onCardDragOver, onCardDrop, onDoubleClick,
}: {
  card: ActiveWorkflowCard;
  isMoving: boolean;
  showInsertBefore: boolean;
  showInsertAfter: boolean;
  onDragStart: (e: React.DragEvent, id: string, stage: ActiveWorkflowStage) => void;
  onDragEnd: () => void;
  onCardDragOver: (e: React.DragEvent, cardId: string, stage: ActiveWorkflowStage) => void;
  onCardDrop: (e: React.DragEvent, cardId: string, stage: ActiveWorkflowStage) => void;
  onDoubleClick: () => void;
}) {
  return (
    <div className="mb-2.5">
      {showInsertBefore && (
        <div className="mb-1 h-0.5 w-full rounded-full bg-[#000080] shadow-sm" />
      )}

      <div
        draggable
        onDragStart={(e) => onDragStart(e, card.id, card.stage)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => onCardDragOver(e, card.id, card.stage)}
        onDrop={(e) => onCardDrop(e, card.id, card.stage)}
        onDoubleClick={onDoubleClick}
        title="Double-click to view / edit"
        className={`group rounded-xl border bg-white p-3.5 shadow-sm transition-all cursor-grab active:cursor-grabbing select-none ${
          isMoving
            ? "opacity-50 scale-95"
            : "border-[#E5E7EB] hover:border-[#000080] hover:shadow-md"
        }`}
      >
        {/* Name + grip */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-[#111827] leading-snug break-words">{card.memberName}</p>
          <GripVertical className="h-4 w-4 shrink-0 text-[#D1D5DB] group-hover:text-[#9CA3AF]" />
        </div>

        {/* Meta */}
        <div className="space-y-1.5">
          <div className="flex items-start gap-1.5 text-xs text-[#374151]">
            <Phone className="mt-0.5 h-3 w-3 shrink-0 text-[#9CA3AF]" />
            <span className="break-words">{card.phone}</span>
          </div>
          <div className="flex items-start gap-1.5 text-xs text-[#374151]">
            <User className="mt-0.5 h-3 w-3 shrink-0 text-[#9CA3AF]" />
            <span className="break-words">Assigned: <span className="font-medium">{card.assignedTo}</span></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <CalendarDays className="h-3 w-3 shrink-0" />
            <span>Added {card.dateAdded}</span>
          </div>
        </div>

        {/* Status badge */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[card.status]}`}>
            {card.status}
          </span>
          <p className="text-[10px] text-[#C4C9D4] select-none">Double-click to edit</p>
        </div>
      </div>

      {showInsertAfter && (
        <div className="mt-1 h-0.5 w-full rounded-full bg-[#000080] shadow-sm" />
      )}
    </div>
  );
}

// ── GuestEditModal ────────────────────────────────────────────────────────────────
function GuestEditModal({
  card, onSave, onClose,
}: {
  card: ActiveWorkflowCard;
  onSave: (updated: ActiveWorkflowCard) => void;
  onClose: () => void;
}) {
  const [form, setForm]         = useState<ActiveWorkflowCard>({ ...card });
  const [stageOpen,  setStageOpen]  = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const set = (field: keyof ActiveWorkflowCard, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const STATUSES: WorkflowCardStatus[] = ["On Track", "Pending", "Overdue"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-base font-bold text-[#111827]">Edit Guest Card</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#374151]">Name</label>
            <input
              value={form.memberName}
              onChange={(e) => set("memberName", e.target.value)}
              className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2.5 text-sm text-[#111827] focus:border-[#000080] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#374151]">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2.5 text-sm text-[#111827] focus:border-[#000080] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#374151]">Assigned To</label>
            <input
              value={form.assignedTo}
              onChange={(e) => set("assignedTo", e.target.value)}
              className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2.5 text-sm text-[#111827] focus:border-[#000080] focus:outline-none"
            />
          </div>

          {/* Stage */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#374151]">Stage</label>
            <div className="relative">
              <button
                onClick={() => setStageOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-lg border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111827] hover:border-[#000080]"
              >
                <span>{form.stage}</span>
                <ChevronDown className={`h-4 w-4 text-[#9CA3AF] transition-transform ${stageOpen ? "rotate-180" : ""}`} />
              </button>
              {stageOpen && (
                <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white shadow-lg">
                  {COLUMNS.map((col) => (
                    <button key={col.stage}
                      onClick={() => { set("stage", col.stage); setStageOpen(false); }}
                      className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-[#F9FAFB] ${
                        col.stage === form.stage ? "font-semibold text-[#000080]" : "text-[#374151]"
                      }`}>
                      <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                      {col.stage}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#374151]">Status</label>
            <div className="relative">
              <button
                onClick={() => setStatusOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-lg border border-[#D1D5DB] bg-white px-3 py-2.5 text-sm text-[#111827] hover:border-[#000080]"
              >
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[form.status]}`}>{form.status}</span>
                <ChevronDown className={`h-4 w-4 text-[#9CA3AF] transition-transform ${statusOpen ? "rotate-180" : ""}`} />
              </button>
              {statusOpen && (
                <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white shadow-lg">
                  {STATUSES.map((s) => (
                    <button key={s}
                      onClick={() => { set("status", s); setStatusOpen(false); }}
                      className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-[#F9FAFB] ${
                        s === form.status ? "font-semibold text-[#000080]" : "text-[#374151]"
                      }`}>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[s]}`}>{s}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#374151]">Notes</label>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              placeholder="Add notes about this guest…"
              className="w-full rounded-lg border border-[#D1D5DB] px-3 py-2.5 text-sm text-[#111827] focus:border-[#000080] focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
          <button onClick={onClose}
            className="rounded-lg border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]">
            Cancel
          </button>
          <button onClick={() => onSave(form)}
            className="rounded-lg bg-[#000080] px-5 py-2 text-sm font-medium text-white hover:bg-[#000066]">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
