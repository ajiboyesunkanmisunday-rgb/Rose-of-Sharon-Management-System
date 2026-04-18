"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

interface TemplateStep {
  label: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: TemplateStep[];
  active: boolean;
  createdBy: string;
  lastModified: string;
}

const templates: WorkflowTemplate[] = [
  {
    id: "1",
    name: "Guest Follow-up Workflow",
    description:
      "Automated pipeline for tracking and following up with first-time guests from their initial visit through conversion.",
    steps: [
      { label: "First visit registration" },
      { label: "Call within 48 hours" },
      { label: "Visit within 1 week" },
      { label: "Second service invite" },
      { label: "Convert tracking" },
    ],
    active: true,
    createdBy: "Pastor David",
    lastModified: "Apr 10, 2026",
  },
  {
    id: "2",
    name: "New Member Onboarding",
    description:
      "Step-by-step onboarding process for new members joining the church, from welcome to full integration.",
    steps: [
      { label: "Welcome message" },
      { label: "Assign to group" },
      { label: "Orientation class" },
      { label: "Mentor assignment" },
    ],
    active: true,
    createdBy: "Deacon Sarah",
    lastModified: "Mar 28, 2026",
  },
  {
    id: "3",
    name: "Prayer Request Pipeline",
    description:
      "Workflow for managing prayer requests from submission through counselor follow-up and resolution.",
    steps: [
      { label: "Receive request" },
      { label: "Assign counselor" },
      { label: "Follow-up" },
      { label: "Mark resolved" },
    ],
    active: false,
    createdBy: "Sister Joy",
    lastModified: "Mar 15, 2026",
  },
];

function StepIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-[#000080]"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

export default function WorkflowTemplatesPage() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#000000]">Workflows</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Templates</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {}}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {templates.map((template) => (
          <div
            key={template.id}
            className="rounded-xl border border-[#E5E7EB] bg-white p-6"
          >
            {/* Template Header */}
            <div className="mb-2 flex items-start justify-between">
              <h2 className="text-base font-bold text-[#000080]">
                {template.name}
              </h2>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  template.active
                    ? "bg-[#DCFCE7] text-[#16A34A]"
                    : "bg-[#F3F4F6] text-[#6B7280]"
                }`}
              >
                {template.active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Description */}
            <p className="mb-4 text-sm text-[#6B7280]">
              {template.description}
            </p>

            {/* Steps */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Steps
              </p>
              <ol className="flex flex-col gap-1.5">
                {template.steps.map((step, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm text-[#374151]"
                  >
                    <StepIcon />
                    <span className="text-xs font-medium text-[#6B7280]">
                      {index + 1}.
                    </span>
                    {step.label}
                  </li>
                ))}
              </ol>
            </div>

            {/* Footer */}
            <div className="border-t border-[#E5E7EB] pt-4">
              <div className="mb-3 flex items-center justify-between text-xs text-[#6B7280]">
                <span>Created by: {template.createdBy}</span>
                <span>Modified: {template.lastModified}</span>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-xs font-medium text-[#000080] hover:underline">
                  Edit
                </button>
                <button className="text-xs font-medium text-[#000080] hover:underline">
                  Duplicate
                </button>
                <button className="text-xs font-medium text-[#DC2626] hover:underline">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
