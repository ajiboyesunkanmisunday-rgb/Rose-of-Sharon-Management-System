"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, TextAreaField } from "@/components/ui/FormField";
import { getCelebration, updateCelebration } from "@/lib/api";

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
    date: "",
    notes: "",
  });

  const [celebrationType, setCelebrationType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const populate = useCallback(async () => {
    if (!id || id.startsWith("cel-")) return;
    try {
      const data = await getCelebration(id);
      setFormData({
        date: toInputDate(data.date ?? ""),
        notes: data.notes ?? "",
      });
      setCelebrationType(data.celebrationType ?? "");
    } catch { /* silently fall back to empty fields */ }
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
    setLoading(true);
    try {
      // UpdateCelebrationRequest only accepts { date, notes } — no type field
      await updateCelebration(id, {
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
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Type is read-only — backend does not allow changing it after creation */}
          {celebrationType && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#374151] dark:text-slate-300">Type</label>
              <div className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] px-3 py-2.5 text-sm text-[#374151] dark:text-slate-300">
                {celebrationType}
                <span className="ml-2 text-xs text-[#9CA3AF] dark:text-slate-400">(cannot be changed)</span>
              </div>
            </div>
          )}

          <FormField
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

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
