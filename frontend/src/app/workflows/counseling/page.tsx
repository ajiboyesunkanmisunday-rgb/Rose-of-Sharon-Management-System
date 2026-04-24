"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

type Status = "On Track" | "Overdue" | "Pending";

const statusColors: Record<Status, string> = {
  "On Track": "bg-[#DCFCE7] text-[#16A34A]",
  Overdue: "bg-[#FEE2E2] text-[#DC2626]",
  Pending: "bg-[#FEF9C3] text-[#CA8A04]",
};

interface Card {
  id: string;
  name: string;
  note: string;
  assignedTo: string;
  dateAdded: string;
  status: Status;
}

const columns: { title: string; headerBg: string; cards: Card[] }[] = [
  {
    title: "Received",
    headerBg: "bg-blue-50",
    cards: [
      { id: "co-1", name: "John Michael", note: "Personal counseling request", assignedTo: "Unassigned", dateAdded: "04/19/2026", status: "Pending" },
      { id: "co-2", name: "Sarah Bamidele", note: "Premarital counseling", assignedTo: "Unassigned", dateAdded: "04/18/2026", status: "Pending" },
    ],
  },
  {
    title: "Scheduled",
    headerBg: "bg-yellow-50",
    cards: [
      { id: "co-3", name: "David Okonkwo", note: "Session on 04/25 at 3pm", assignedTo: "Pastor David", dateAdded: "04/16/2026", status: "On Track" },
      { id: "co-4", name: "Grace Adeyemi", note: "Session on 04/24 at 10am", assignedTo: "Pastor James", dateAdded: "04/15/2026", status: "On Track" },
    ],
  },
  {
    title: "In Session",
    headerBg: "bg-purple-50",
    cards: [
      { id: "co-5", name: "Emmanuel Nwosu", note: "Week 2 of sessions", assignedTo: "Pastor David", dateAdded: "04/08/2026", status: "On Track" },
      { id: "co-6", name: "Blessing Okoro", note: "Ongoing family counseling", assignedTo: "Deaconess Grace", dateAdded: "04/05/2026", status: "Overdue" },
    ],
  },
  {
    title: "Resolved",
    headerBg: "bg-green-50",
    cards: [
      { id: "co-7", name: "Peter Adewale", note: "Completed 4 sessions", assignedTo: "Pastor David", dateAdded: "03/28/2026", status: "On Track" },
      { id: "co-8", name: "Ruth Balogun", note: "Closed with follow-up plan", assignedTo: "Pastor James", dateAdded: "03/22/2026", status: "On Track" },
    ],
  },
];

export default function CounselingWorkflowPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Workflows</h1>
        <h2 className="text-[22px] font-bold text-[#000080]">Counseling Workflow</h2>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:overflow-x-auto sm:pb-4">
        {columns.map((col) => (
          <div
            key={col.title}
            className="flex w-full flex-col rounded-xl border border-[#E5E7EB] bg-white sm:min-w-[260px] sm:w-auto"
          >
            <div className={`rounded-t-xl ${col.headerBg} px-4 py-3`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#000080]">{col.title}</h3>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-[#000080]">
                  {col.cards.length}
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-3 p-3">
              {col.cards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-lg border border-[#E5E7EB] bg-white p-3"
                >
                  <p className="text-sm font-semibold text-[#111827]">{card.name}</p>
                  <p className="mt-1 text-xs text-[#6B7280]">{card.note}</p>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
