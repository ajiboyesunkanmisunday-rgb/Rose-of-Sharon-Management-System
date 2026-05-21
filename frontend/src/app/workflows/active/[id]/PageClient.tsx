"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { activeWorkflowCards, workflowTemplates } from "@/lib/mock-data";
import { WorkflowCardStatus } from "@/lib/types";

const statusColors: Record<WorkflowCardStatus, string> = {
  "On Track": "bg-[#DCFCE7] dark:bg-green-900/30 text-[#16A34A] dark:text-green-300",
  Overdue: "bg-[#FEE2E2] dark:bg-red-900/30 text-[#DC2626] dark:text-red-400",
  Pending: "bg-[#FEF9C3] dark:bg-yellow-900/30 text-[#CA8A04] dark:text-yellow-300",
};

export default function ActiveWorkflowDetailClient() {
  const router = useRouter();
  const params = useParams();
  const paramId = params.id as string;
  const [id, setId] = useState(paramId);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 1] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const card =
    activeWorkflowCards.find((c) => c.id === id) || activeWorkflowCards[0];
  const template =
    workflowTemplates.find((t) => t.id === card.templateId) ||
    workflowTemplates[0];

  const [currentStep, setCurrentStep] = useState(card.currentStepIndex);

  const handleAdvance = () => {
    if (currentStep < template.steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      console.log("Advance workflow:", card.id, "to step", next);
    }
  };

  const auditLog = [
    { action: "Workflow created", actor: "System", date: card.dateAdded },
    { action: `Assigned to ${card.assignedTo}`, actor: "Admin", date: card.dateAdded },
    { action: `Stage: ${card.stage}`, actor: "System", date: card.dateAdded },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Workflows"
        subtitle={`Workflow · ${card.memberName}`}
        backHref="/workflows/active"
      />

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#6B7280] dark:text-slate-400">Workflow Info</h3>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[card.status]}`}>
                {card.status}
              </span>
            </div>
            <h2 className="mt-3 text-xl font-bold text-[#111827] dark:text-slate-100">{card.memberName}</h2>
            <p className="mt-1 text-sm text-[#6B7280] dark:text-slate-400">{card.phone}</p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">Template</p>
                <p className="mt-1 text-sm font-medium text-[#111827] dark:text-slate-100">{template.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">Current Stage</p>
                <p className="mt-1 text-sm font-medium text-[#111827] dark:text-slate-100">{card.stage}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">Assigned To</p>
                <p className="mt-1 text-sm font-medium text-[#111827] dark:text-slate-100">{card.assignedTo}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">Date Added</p>
                <p className="mt-1 text-sm font-medium text-[#111827] dark:text-slate-100">{card.dateAdded}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <h3 className="mb-4 text-sm font-semibold text-[#111827] dark:text-slate-100">Step Progress</h3>
            <ol className="space-y-3">
              {template.steps.map((step, idx) => {
                const done = idx < currentStep;
                const current = idx === currentStep;
                return (
                  <li key={idx} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        done
                          ? "bg-green-50 dark:bg-green-900/200 text-white"
                          : current
                          ? "bg-[#000080] text-white"
                          : "bg-[#F3F4F6] dark:bg-slate-700/30 text-[#6B7280] dark:text-slate-400"
                      }`}
                    >
                      {done ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <span
                      className={`text-sm ${
                        current
                          ? "font-semibold text-[#000080] dark:text-indigo-400"
                          : done
                          ? "text-[#6B7280] dark:text-slate-400 line-through"
                          : "text-[#374151] dark:text-slate-300"
                      }`}
                    >
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>

            {currentStep < template.steps.length - 1 && (
              <Button variant="primary" onClick={handleAdvance} className="mt-5">
                Mark step complete
              </Button>
            )}
          </div>
        </div>

        <aside>
          <h3 className="mb-3 text-sm font-semibold text-[#111827] dark:text-slate-100">Audit Log</h3>
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <ul className="space-y-3">
              {auditLog.map((entry, idx) => (
                <li key={idx} className="flex items-start gap-3 border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#000080]" />
                  <div>
                    <p className="text-sm text-[#374151] dark:text-slate-300">{entry.action}</p>
                    <p className="mt-0.5 text-xs text-[#9CA3AF] dark:text-slate-400">
                      {entry.actor} · {entry.date}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/workflows/active")}>
          Back
        </Button>
      </div>
    </DashboardLayout>
  );
}
