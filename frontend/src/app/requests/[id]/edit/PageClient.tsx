"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { SelectField, TextAreaField } from "@/components/ui/FormField";
import { getRequest, changeRequestStatus } from "@/lib/api";

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

function fullName(u?: { firstName?: string; middleName?: string; lastName?: string }): string {
  if (!u) return "";
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "";
}

export default function EditRequestClient() {
  const router = useRouter();
  const params = useParams();
  const paramId = params.id as string;
  const [id, setId] = useState(paramId);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 2] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    submittedBy: "",
    assignedTo: "",
    status: "Received",
    content: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const populate = useCallback(async () => {
    if (!id || id.startsWith("req-")) return;
    try {
      const data = await getRequest(id);
      setFormData({
        subject: data.subject ?? "",
        category: data.requestType ?? "",
        submittedBy: fullName(data.owner ?? data.createdBy),
        assignedTo: fullName(data.assignedTo),
        status: data.requestStatus ?? "Received",
        content: data.content ?? "",
      });
    } catch { /* silently fall back to empty fields */ }
  }, [id]);

  useEffect(() => { populate(); }, [populate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await changeRequestStatus(id, formData.status);
      router.push(`/requests/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update request.");
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Requests"
        subtitle="Edit Request"
        backHref={`/requests/${id}`}
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#374151]">Title</label>
            <p className="h-[42px] flex items-center rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] bg-[#F9FAFB]">
              {formData.subject || "—"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#374151]">Category</label>
              <p className="h-[42px] flex items-center rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] bg-[#F9FAFB]">
                {formData.category || "—"}
              </p>
            </div>
            <SelectField
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={STATUS_OPTIONS}
            />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#374151]">Submitted By</label>
              <p className="h-[42px] flex items-center rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] bg-[#F9FAFB]">
                {formData.submittedBy || "—"}
              </p>
            </div>
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
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
