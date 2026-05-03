"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, TextAreaField } from "@/components/ui/FormField";
import { getGroup, updateGroup } from "@/lib/api";

export default function EditGroupClient() {
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

  const [formData, setFormData] = useState({ name: "", description: "", whatsAppLink: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const populate = useCallback(async () => {
    if (!id || id.startsWith("grp-")) return;
    try {
      const g = await getGroup(id);
      setFormData({
        name: g.name ?? "",
        description: g.description ?? "",
        whatsAppLink: g.whatsAppLink ?? "",
      });
    } catch { /* silently fall back to empty */ }
  }, [id]);

  useEffect(() => { populate(); }, [populate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await updateGroup(id, {
        name: formData.name || undefined,
        description: formData.description || undefined,
        whatsAppLink: formData.whatsAppLink || undefined,
      });
      router.push(`/settings/groups/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update group.");
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        subtitle="Edit Group"
        backHref={`/settings/groups/${id}`}
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Group Name" name="name" value={formData.name} onChange={handleChange} required />
          <TextAreaField label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} />
          <FormField label="WhatsApp Link" name="whatsAppLink" value={formData.whatsAppLink} onChange={handleChange} placeholder="https://chat.whatsapp.com/..." />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push(`/settings/groups/${id}`)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
