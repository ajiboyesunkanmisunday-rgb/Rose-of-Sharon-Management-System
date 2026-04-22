"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { members } from "@/lib/mock-data";

const CATEGORY_OPTIONS = [
  { label: "Prayer", value: "Prayer" },
  { label: "Counseling", value: "Counseling" },
  { label: "Complaint", value: "Complaint" },
  { label: "Suggestion", value: "Suggestion" },
];

const STATUS_OPTIONS = [
  { label: "Received", value: "Received" },
  { label: "Assigned", value: "Assigned" },
  { label: "In Progress", value: "In Progress" },
  { label: "Resolved", value: "Resolved" },
];

const ASSIGNEE_OPTIONS = [
  { label: "Pastor David", value: "Pastor David" },
  { label: "Pastor James", value: "Pastor James" },
  { label: "Deaconess Grace", value: "Deaconess Grace" },
  { label: "Shola Damson", value: "Shola Damson" },
];

export default function AddRequestPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    submittedBy: "",
    assignedTo: "",
    status: "Not treated",
    content: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Create request:", formData);
    router.push("/requests");
  };

  const memberOptions = members.map((m) => ({
    label: `${m.firstName} ${m.lastName}`,
    value: `${m.firstName} ${m.lastName}`,
  }));

  return (
    <DashboardLayout>
      <PageHeader
        title="Requests"
        subtitle="New Request"
        backHref="/requests"
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief title for the request"
            required
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <SelectField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={CATEGORY_OPTIONS}
              required
            />
            <SelectField
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={STATUS_OPTIONS}
            />
            <SelectField
              label="Submitted By"
              name="submittedBy"
              value={formData.submittedBy}
              onChange={handleChange}
              options={memberOptions}
              required
            />
            <SelectField
              label="Assigned To"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              options={ASSIGNEE_OPTIONS}
            />
          </div>

          <TextAreaField
            label="Details"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Describe the request..."
            rows={6}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/requests")}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Request
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
