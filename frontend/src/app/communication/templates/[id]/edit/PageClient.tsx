"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { communicationTemplates } from "@/lib/mock-data";

const TYPE_OPTIONS = [
  { label: "SMS", value: "SMS" },
  { label: "Email", value: "Email" },
];

export default function EditTemplateClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const existing =
    communicationTemplates.find((t) => t.id === id) || communicationTemplates[0];

  const [formData, setFormData] = useState({
    name: existing.name,
    type: existing.type,
    subject: existing.subject || "",
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
    console.log("Update template:", id, formData);
    router.push("/communication/templates");
  };

  const isEmail = formData.type === "Email";

  return (
    <DashboardLayout>
      <PageHeader
        title="Communication"
        subtitle="Edit Template"
        backHref="/communication/templates"
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Template Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <SelectField
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={TYPE_OPTIONS}
            required
          />

          {isEmail && (
            <FormField
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          )}

          <TextAreaField
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={8}
            required
          />
          <p className="text-xs text-[#6B7280]">
            Available variables: {"{name}"}, {"{date}"}, {"{event}"}
          </p>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/communication/templates")}
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
