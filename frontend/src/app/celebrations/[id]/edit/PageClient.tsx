"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { getCelebration, updateCelebration } from "@/lib/api";

const TYPE_OPTIONS = [
  { label: "Birthday", value: "Birthday" },
  { label: "Wedding Anniversary", value: "Wedding Anniversary" },
  { label: "Thanksgiving", value: "Thanksgiving" },
  { label: "Child Dedication", value: "Child Dedication" },
];

function toInputDate(value: string): string {
  if (!value) return "";
  if (value.includes("T")) return value.split("T")[0];
  if (value.includes("-")) return value;
  const parts = value.split("/");
  if (parts.length !== 3) return "";
  const [m, d, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export default function EditCelebrationClient() {
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
    type: "",
    date: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const populate = useCallback(async () => {
    if (!id || id.startsWith("cel-")) return;
    try {
      const data = await getCelebration(id);
      setFormData({
        type: data.celebrationType ?? "",
        date: toInputDate(data.date ?? ""),
        notes: data.notes ?? "",
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
      await updateCelebration(id, {
        type: formData.type || undefined,
        date: formData.date || undefined,
        notes: formData.notes || undefined,
      });
      router.push(`/celebrations/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update celebration.");
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Celebrations"
        subtitle="Edit Celebration"
        backHref={`/celebrations/${id}`}
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <SelectField label="Type" name="type" value={formData.type} onChange={handleChange} options={TYPE_OPTIONS} required />
            <FormField label="Date" type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>

          <TextAreaField label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push(`/celebrations/${id}`)}>
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
