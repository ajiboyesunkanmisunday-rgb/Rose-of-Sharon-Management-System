"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

type WorkflowStatus = "On Track" | "Overdue" | "Pending";

interface WorkflowCard {
  id: string;
  name: string;
  phone: string;
  assignedTo: string;
  dateAdded: string;
  status: WorkflowStatus;
}

interface PipelineColumn {
  title: string;
  headerBg: string;
  cards: WorkflowCard[];
}

const statusColors: Record<WorkflowStatus, string> = {
  "On Track": "bg-[#DCFCE7] text-[#16A34A]",
  Overdue: "bg-[#FEE2E2] text-[#DC2626]",
  Pending: "bg-[#FEF9C3] text-[#CA8A04]",
};

const columns: PipelineColumn[] = [
  {
    title: "First Timers",
    headerBg: "bg-blue-50 text-blue-700",
    cards: [
      {
        id: "1",
        name: "Grace Adeyemi",
        phone: "+234 801 234 5678",
        assignedTo: "Pastor David",
        dateAdded: "Apr 8, 2026",
        status: "On Track",
      },
      {
        id: "2",
        name: "Tunde Bakare",
        phone: "+234 802 345 6789",
        assignedTo: "Deacon Sarah",
        dateAdded: "Apr 6, 2026",
        status: "Overdue",
      },
      {
        id: "3",
        name: "Amina Yusuf",
        phone: "+234 803 456 7890",
        assignedTo: "Sister Joy",
        dateAdded: "Apr 10, 2026",
        status: "Pending",
      },
    ],
  },
  {
    title: "Follow-up Call",
    headerBg: "bg-yellow-50 text-yellow-700",
    cards: [
      {
        id: "4",
        name: "Chinedu Okafor",
        phone: "+234 804 567 8901",
        assignedTo: "Pastor David",
        dateAdded: "Apr 3, 2026",
        status: "Overdue",
      },
      {
        id: "5",
        name: "Fatima Bello",
        phone: "+234 805 678 9012",
        assignedTo: "Deacon Sarah",
        dateAdded: "Apr 5, 2026",
        status: "On Track",
      },
    ],
  },
  {
    title: "Follow-up Visit",
    headerBg: "bg-purple-50 text-purple-700",
    cards: [
      {
        id: "6",
        name: "Emeka Nwankwo",
        phone: "+234 806 789 0123",
        assignedTo: "Sister Joy",
        dateAdded: "Mar 28, 2026",
        status: "On Track",
      },
      {
        id: "7",
        name: "Blessing Eze",
        phone: "+234 807 890 1234",
        assignedTo: "Pastor David",
        dateAdded: "Mar 30, 2026",
        status: "Pending",
      },
    ],
  },
  {
    title: "Second Timers",
    headerBg: "bg-green-50 text-green-700",
    cards: [
      {
        id: "8",
        name: "Oluwaseun Alabi",
        phone: "+234 808 901 2345",
        assignedTo: "Deacon Sarah",
        dateAdded: "Mar 22, 2026",
        status: "On Track",
      },
    ],
  },
  {
    title: "New Converts",
    headerBg: "bg-[#000080]/5 text-[#000080]",
    cards: [
      {
        id: "9",
        name: "Kemi Fashola",
        phone: "+234 809 012 3456",
        assignedTo: "Pastor David",
        dateAdded: "Mar 15, 2026",
        status: "On Track",
      },
    ],
  },
];

export default function ActiveWorkflowsPage() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Workflows</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Guest Follow-up Pipeline
        </p>
      </div>

      {/* Pipeline / Kanban View */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.title}
            className="min-w-[240px] flex-shrink-0 rounded-xl border border-[#E5E7EB] bg-white p-4"
          >
            {/* Column Header */}
            <div
              className={`mb-3 flex items-center justify-between rounded-lg px-3 py-2 ${column.headerBg}`}
            >
              <span className="text-sm font-bold">{column.title}</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/60 text-xs font-semibold">
                {column.cards.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3">
              {column.cards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  <p className="text-sm font-bold text-[#000000]">
                    {card.name}
                  </p>
                  <p className="mt-1 text-xs text-[#6B7280]">{card.phone}</p>
                  <p className="mt-2 text-xs text-[#6B7280]">
                    Assigned to:{" "}
                    <span className="font-medium text-[#374151]">
                      {card.assignedTo}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    Added: {card.dateAdded}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[card.status]}`}
                    >
                      {card.status}
                    </span>
                    <button className="text-xs font-medium text-[#000080] hover:underline">
                      View
                    </button>
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
