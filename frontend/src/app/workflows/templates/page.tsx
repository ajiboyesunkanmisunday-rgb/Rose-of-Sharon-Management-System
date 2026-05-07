"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutTemplate } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { workflowTemplates } from "@/lib/mock-data";

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
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function WorkflowTemplatesPage() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    console.log("Delete template:", selectedId);
    setShowDeleteModal(false);
    setSelectedId(null);
  };

  const handleDuplicate = (id: string) => {
    console.log("Duplicate template:", id);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FDF4FF]">
            <LayoutTemplate className="h-6 w-6 text-[#A21CAF]" />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-[#000000]">Workflow Templates</h1>
            <p className="text-sm text-[#6B7280]">Reusable step sequences for guest follow-up workflows</p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push("/workflows/templates/add")}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {workflowTemplates.map((template) => (
          <div
            key={template.id}
            className="rounded-xl border border-[#E5E7EB] bg-white p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-bold text-[#000080]">{template.name}</h3>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  template.active
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {template.active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-2 text-sm text-[#6B7280]">{template.description}</p>
            <p className="mt-2 text-xs text-[#9CA3AF]">
              Trigger: <span className="font-medium text-[#374151]">{template.trigger}</span>
            </p>

            <ol className="mt-4 space-y-2">
              {template.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-[#374151]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#000080] text-white">
                    <StepIcon />
                  </span>
                  <span>
                    <span className="font-medium">{step.order}.</span> {step.label}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-5 flex items-center justify-between border-t border-[#F3F4F6] pt-4 text-xs text-[#6B7280]">
              <span>
                Created by <strong>{template.createdBy}</strong> · {template.lastModified}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => router.push(`/workflows/templates/${template.id}/edit`)}
                className="text-xs font-medium text-[#000080] underline transition-colors hover:text-[#000066]"
              >
                Edit
              </button>
              <span className="text-xs text-[#D1D5DB]">·</span>
              <button
                onClick={() => handleDuplicate(template.id)}
                className="text-xs font-medium text-[#000080] underline transition-colors hover:text-[#000066]"
              >
                Duplicate
              </button>
              <span className="text-xs text-[#D1D5DB]">·</span>
              <button
                onClick={() => handleDeleteClick(template.id)}
                className="text-xs font-medium text-red-600 underline transition-colors hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this workflow template?"
      />
    </DashboardLayout>
  );
}
