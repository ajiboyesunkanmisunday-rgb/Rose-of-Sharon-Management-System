"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { activeWorkflowCards } from "@/lib/mock-data";
import { ActiveWorkflowStage, WorkflowCardStatus } from "@/lib/types";

const statusColors: Record<WorkflowCardStatus, string> = {
  "On Track": "bg-[#DCFCE7] text-[#16A34A]",
  Overdue: "bg-[#FEE2E2] text-[#DC2626]",
  Pending: "bg-[#FEF9C3] text-[#CA8A04]",
};

const columnConfig: { stage: ActiveWorkflowStage; headerBg: string }[] = [
  { stage: "First Timers", headerBg: "bg-blue-50" },
  { stage: "Follow-up Call", headerBg: "bg-yellow-50" },
  { stage: "Follow-up Visit", headerBg: "bg-purple-50" },
  { stage: "Second Timers", headerBg: "bg-green-50" },
  { stage: "New Converts", headerBg: "bg-indigo-50" },
];

export default function GuestWorkflowPage() {
  const router = useRouter();

  const columns = useMemo(
    () =>
      columnConfig.map((col) => ({
        ...col,
        cards: activeWorkflowCards.filter((c) => c.stage === col.stage),
      })),
    []
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Workflows</h1>
        <h2 className="text-[22px] font-bold text-[#000080]">Guest Workflow</h2>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:overflow-x-auto sm:pb-4">
        {columns.map((col) => (
          <div
            key={col.stage}
            className="flex w-full flex-col rounded-xl border border-[#E5E7EB] bg-white sm:min-w-[260px] sm:w-auto"
          >
            <div className={`rounded-t-xl ${col.headerBg} px-4 py-3`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#000080]">{col.stage}</h3>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-[#000080]">
                  {col.cards.length}
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-3 p-3">
              {col.cards.length === 0 ? (
                <p className="rounded-lg bg-[#F9FAFB] p-3 text-center text-xs text-[#9CA3AF]">
                  No cards
                </p>
              ) : (
                col.cards.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-lg border border-[#E5E7EB] bg-white p-3"
                  >
                    <p className="text-sm font-semibold text-[#111827]">{card.memberName}</p>
                    <p className="mt-1 text-xs text-[#6B7280]">{card.phone}</p>
                    <p className="mt-2 text-xs text-[#6B7280]">
                      Assigned to: <strong>{card.assignedTo}</strong>
                    </p>
                    <p className="text-xs text-[#9CA3AF]">Added {card.dateAdded}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[card.status]}`}
                      >
                        {card.status}
                      </span>
                      <button
                        onClick={() => router.push(`/workflows/active/${card.id}`)}
                        className="text-xs font-medium text-[#000080] underline transition-colors hover:text-[#000066]"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
