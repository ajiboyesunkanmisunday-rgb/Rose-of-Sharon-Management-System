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
      { id: "ce-1", name: "John Michael", note: "Birthday thanksgiving", assignedTo: "Unassigned", dateAdded: "04/19/2026", status: "Pending" },
      { id: "ce-2", name: "Sarah Bamidele", note: "Wedding anniversary thanksgiving", assignedTo: "Unassigned", dateAdded: "04/18/2026", status: "Pending" },
    ],
  },
  {
    title: "Approved",
    headerBg: "bg-yellow-50",
    cards: [
      { id: "ce-3", name: "David Okonkwo", note: "Child dedication", assignedTo: "Pastor David", dateAdded: "04/16/2026", status: "On Track" },
      { id: "ce-4", name: "Grace Adeyemi", note: "New job thanksgiving", assignedTo: "Pastor James", dateAdded: "04/15/2026", status: "On Track" },
    ],
  },
  {
    title: "Scheduled",
    headerBg: "bg-purple-50",
    cards: [
      { id: "ce-5", name: "Emmanuel Nwosu", note: "Baby dedication 04/26", assignedTo: "Pastor David", dateAdded: "04/10/2026", status: "On Track" },
      { id: "ce-6", name: "Blessing Okoro", note: "50th birthday 05/02", assignedTo: "Deaconess Grace", dateAdded: "04/08/2026", status: "On Track" },
    ],
  },
  {
    title: "Completed",
    headerBg: "bg-green-50",
    cards: [
      { id: "ce-7", name: "Peter Adewale", note: "Wedding anniversary held", assignedTo: "Pastor David", dateAdded: "03/28/2026", status: "On Track" },
      { id: "ce-8", name: "Ruth Balogun", note: "Child dedication completed", assignedTo: "Pastor James", dateAdded: "03/22/2026", status: "On Track" },
    ],
  },
];

export default function CelebrationWorkflowPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Workflows</h1>
        <h2 className="text-[22px] font-bold text-[#000080]">Celebration Request Workflow</h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div
            key={col.title}
            className="flex min-w-[260px] flex-col rounded-xl border border-[#E5E7EB] bg-white"
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
