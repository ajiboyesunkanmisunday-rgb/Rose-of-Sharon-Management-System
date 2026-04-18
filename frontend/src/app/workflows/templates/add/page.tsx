"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";

const TRIGGER_OPTIONS = [
  { label: "First Timer Registration", value: "First Timer Registration" },
  { label: "Second Timer Visit", value: "Second Timer Visit" },
  { label: "Member Registration", value: "Member Registration" },
  { label: "Prayer Request Submitted", value: "Prayer Request Submitted" },
  { label: "Manual Trigger", value: "Manual Trigger" },
];

export default function AddWorkflowTemplatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger: "",
    active: true,
  });
  const [steps, setSteps] = useState<string[]>(["", "", ""]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleStepChange = (idx: number, value: string) => {
    setSteps((prev) => prev.map((s, i) => (i === idx ? value : s)));
  };

  const addStep = () => setSteps((prev) => [...prev, ""]);
  const removeStep = (idx: number) =>
    setSteps((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedSteps = steps
      .filter((s) => s.trim())
      .map((label, idx) => ({ label, order: idx + 1 }));
    console.log("Create template:", { ...formData, steps: cleanedSteps });
    router.push("/workflows/templates");
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Workflows"
        subtitle="Create Template"
        backHref="/workflows/templates"
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Template Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Member Onboarding"
            required
          />

          <TextAreaField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what this workflow does"
            rows={3}
            required
          />

          <SelectField
            label="Trigger"
            name="trigger"
            value={formData.trigger}
            onChange={handleChange}
            options={TRIGGER_OPTIONS}
            required
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151]">
              Steps
            </label>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#000080] text-sm font-bold text-white">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    placeholder={`Step ${idx + 1} description`}
                    className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      aria-label="Remove step"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addStep}
              className="mt-2 text-sm font-medium text-[#000080] underline transition-colors hover:text-[#000066]"
            >
              + Add step
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 rounded border-[#E5E7EB] text-[#000080] focus:ring-[#000080]"
            />
            <label htmlFor="active" className="text-sm text-[#374151]">
              Activate template immediately
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/workflows/templates")}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Template
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
