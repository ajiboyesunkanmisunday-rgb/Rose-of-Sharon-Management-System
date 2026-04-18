"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { allRequests, members } from "@/lib/mock-data";

const CATEGORY_OPTIONS = [
  { label: "Prayer", value: "Prayer" },
  { label: "Counseling", value: "Counseling" },
  { label: "Complaint", value: "Complaint" },
  { label: "Suggestion", value: "Suggestion" },
];

const STATUS_OPTIONS = [
  { label: "Not treated", value: "Not treated" },
  { label: "In Progress", value: "In Progress" },
  { label: "Treated", value: "Treated" },
];

const ASSIGNEE_OPTIONS = [
  { label: "Pastor David", value: "Pastor David" },
  { label: "Pastor James", value: "Pastor James" },
  { label: "Deaconess Grace", value: "Deaconess Grace" },
  { label: "Shola Damson", value: "Shola Damson" },
];

export default function EditRequestClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const existing = allRequests.find((r) => r.id === id) || allRequests[0];

  const [formData, setFormData] = useState({
    title: existing.title,
    category: existing.category,
    submittedBy: existing.submittedBy,
    assignedTo: existing.assignedTo,
    status: existing.status,
    content: existing.content,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Update request:", id, formData);
    router.push(`/requests/${id}`);
  };

  const memberOptions = members.map((m) => ({
    label: `${m.firstName} ${m.lastName}`,
    value: `${m.firstName} ${m.lastName}`,
  }));

  return (
    <DashboardLayout>
      <PageHeader
        title="Requests"
        subtitle="Edit Request"
        backHref={`/requests/${id}`}
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
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
            rows={6}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push(`/requests/${id}`)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
