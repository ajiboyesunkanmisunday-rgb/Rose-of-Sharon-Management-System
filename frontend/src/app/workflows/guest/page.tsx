"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { GitBranch, GripVertical, Phone, User, CalendarDays } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { activeWorkflowCards } from "@/lib/mock-data";
import { ActiveWorkflowCard, ActiveWorkflowStage, WorkflowCardStatus } from "@/lib/types";

// ── Column config ───────────────────────────────────────────────────────────────
const COLUMNS: { stage: ActiveWorkflowStage; headerBg: string; headerText: string; dotColor: string }[] = [
  { stage: "First Timers",   headerBg: "bg-blue-50",   headerText: "text-blue-800",  dotColor: "bg-blue-400"   },
  { stage: "Follow-up Call", headerBg: "bg-yellow-50", headerText: "text-yellow-800",dotColor: "bg-yellow-400" },
  { stage: "Follow-up Visit",headerBg: "bg-purple-50", headerText: "text-purple-800",dotColor: "bg-purple-400" },
  { stage: "Second Timers",  headerBg: "bg-green-50",  headerText: "text-green-800", dotColor: "bg-green-400"  },
  { stage: "New Converts",   headerBg: "bg-indigo-50", headerText: "text-indigo-800",dotColor: "bg-indigo-400" },
];

const STATUS_COLORS: Record<WorkflowCardStatus, string> = {
  "On Track": "bg-[#DCFCE7] text-[#16A34A]",
  Overdue:    "bg-[#FEE2E2] text-[#DC2626]",
  Pending:    "bg-[#FEF9C3] text-[#CA8A04]",
};

type ColumnsState = Record<ActiveWorkflowStage, ActiveWorkflowCard[]>;

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
  const router = useRouter();

  const [columns, setColumns]   = useState<ColumnsState>(() => buildState(activeWorkflowCards));
  const [dragOver, setDragOver] = useState<ActiveWorkflowStage | null>(null);
  const [moving,   setMoving]   = useState<string | null>(null);
  const [toast,    setToast]    = useState("");

  const dragCardId  = useRef<string | null>(null);
  const dragFromCol = useRef<ActiveWorkflowStage | null>(null);

  const totalCards = Object.values(columns).reduce((s, arr) => s + arr.length, 0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Drag handlers ──
  const handleDragStart = (cardId: string, fromStage: ActiveWorkflowStage) => {
    dragCardId.current  = cardId;
    dragFromCol.current = fromStage;
    setMoving(cardId);
  };

  const handleDragOver = (e: React.DragEvent, toStage: ActiveWorkflowStage) => {
    e.preventDefault();
    setDragOver(toStage);
  };

  const handleDrop = (e: React.DragEvent, toStage: ActiveWorkflowStage) => {
    e.preventDefault();
    setDragOver(null);
    setMoving(null);

    const cardId   = dragCardId.current;
    const fromStage = dragFromCol.current;
    if (!cardId || !fromStage || fromStage === toStage) return;

    const card = columns[fromStage]?.find((c) => c.id === cardId);
    if (!card) return;

    setColumns((prev) => {
      const next = { ...prev };
      next[fromStage] = prev[fromStage].filter((c) => c.id !== cardId);
      next[toStage]   = [...(prev[toStage] ?? []), { ...card, stage: toStage }];
      return next;
    });

    showToast(`Moved "${card.memberName}" → ${toStage}`);
    // TODO: Call backend API when guest workflow endpoint is ready:
    // await updateGuestWorkflowStage(cardId, toStage);
  };

  const handleDragEnd = () => {
    setDragOver(null);
    setMoving(null);
  };

  return (
    <DashboardLayout>
      {/* Toast */}
      {toast && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 rounded-xl border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-medium text-[#111827] shadow-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF]">
          <GitBranch className="h-6 w-6 text-[#2563EB]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000]">Guest Workflow</h1>
          <p className="text-sm text-[#6B7280]">
            {totalCards} active guest{totalCards !== 1 ? "s" : ""} · Drag cards between columns to update stage
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6">
        {COLUMNS.map((col) => {
          const colCards = columns[col.stage] ?? [];
          const isOver   = dragOver === col.stage;

          return (
            <div
              key={col.stage}
              onDragOver={(e) => handleDragOver(e, col.stage)}
              onDrop={(e) => handleDrop(e, col.stage)}
              onDragLeave={() => setDragOver(null)}
              className={`flex min-w-[270px] flex-1 flex-col rounded-xl border-2 bg-white transition-all ${
                isOver ? "border-[#000080] shadow-md" : "border-[#E5E7EB]"
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

              {/* Drop zone hint */}
              {isOver && (
                <div className="mx-3 mt-2 rounded-lg border-2 border-dashed border-[#000080]/40 bg-[#F0F2FF] py-3 text-center text-xs font-medium text-[#000080]">
                  Drop here
                </div>
              )}

              {/* Cards */}
              <div className="flex flex-1 flex-col gap-2.5 p-3">
                {colCards.length === 0 && !isOver ? (
                  <div className="flex flex-1 items-center justify-center py-6 text-xs text-[#9CA3AF]">
                    No guests
                  </div>
                ) : (
                  colCards.map((card) => (
                    <GuestCard
                      key={card.id}
                      card={card}
                      isMoving={moving === card.id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onView={() => router.push(`/workflows/active/${card.id}`)}
                    />
                  ))
                )}
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
  card, isMoving, onDragStart, onDragEnd, onView,
}: {
  card: ActiveWorkflowCard;
  isMoving: boolean;
  onDragStart: (id: string, stage: ActiveWorkflowStage) => void;
  onDragEnd: () => void;
  onView: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(card.id, card.stage)}
      onDragEnd={onDragEnd}
      className={`group rounded-xl border bg-white p-3.5 shadow-sm transition-all cursor-grab active:cursor-grabbing ${
        isMoving
          ? "opacity-50 scale-95"
          : "border-[#E5E7EB] hover:border-[#000080] hover:shadow-md"
      }`}
    >
      {/* Name + grip handle */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-[#111827] leading-snug">{card.memberName}</p>
        <GripVertical className="h-4 w-4 shrink-0 text-[#D1D5DB] group-hover:text-[#9CA3AF]" />
      </div>

      {/* Meta */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-[#374151]">
          <Phone className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
          <span>{card.phone}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#374151]">
          <User className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
          <span>Assigned: <span className="font-medium">{card.assignedTo}</span></span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
          <CalendarDays className="h-3 w-3 shrink-0" />
          <span>Added {card.dateAdded}</span>
        </div>
      </div>

      {/* Status badge + view */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[card.status]}`}>
          {card.status}
        </span>
        <button
          onClick={onView}
          className="text-xs font-medium text-[#000080] underline hover:text-[#000066]"
        >
          View
        </button>
      </div>
    </div>
  );
}
