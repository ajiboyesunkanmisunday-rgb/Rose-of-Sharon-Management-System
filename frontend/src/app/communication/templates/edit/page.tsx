"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { SelectField } from "@/components/ui/FormField";
import { getMessageTemplate, updateMessageTemplate } from "@/lib/api";

const CATEGORY_OPTIONS = [
  { label: "New First Timer", value: "NEW_FIRST_TIMER" },
  { label: "New Second Timer", value: "NEW_SECOND_TIMER" },
  { label: "New Convert", value: "NEW_CONVERT" },
  { label: "Wedding Anniversary", value: "WEDDING_ANNIVERSARY" },
  { label: "Birthday", value: "BIRTHDAY" },
  { label: "Prayer Request", value: "PRAYER_REQUEST" },
  { label: "New Member", value: "NEW_MEMBER" },
  { label: "New E-Member", value: "NEW_E_MEMBER" },
  { label: "Counseling Request", value: "COUNSELING_REQUEST" },
];

const CHANNEL_OPTIONS = [
  { label: "SMS", value: "SMS" },
  { label: "Email", value: "EMAIL" },
];

function EditTemplateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [channel, setChannel] = useState("SMS");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (!id) {
      setError("No template ID provided.");
      setLoading(false);
      return;
    }
    async function load() {
      try {
        const t = await getMessageTemplate(id as string);
        setCategory(t.messageTemplateCategory ?? "");
        setChannel(t.channel ?? "SMS");
        setName(t.name ?? "");
        setSubject(t.subject ?? "");
        setContent(t.content ?? "");
      } catch {
        setError("Failed to load template.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError("");
    try {
      await updateMessageTemplate(id, {
        category,
        channel,
        name,
        subject: channel === "EMAIL" ? subject : undefined,
        content,
      });
      router.push("/communication/templates");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update template.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none placeholder:text-[#9CA3AF] dark:text-slate-400 focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
  const labelCls = "mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300";

  if (loading) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-10 text-center text-sm text-gray-400 dark:text-slate-500">
        Loading template…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            label="Category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <SelectField
            label="Channel"
            options={CHANNEL_OPTIONS}
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          />
        </div>

        <div>
          <label className={labelCls}>Template Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter template name"
            className={inputCls}
            required
          />
        </div>

        {channel === "EMAIL" && (
          <div>
            <label className={labelCls}>Email Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject line"
              className={inputCls}
            />
          </div>
        )}

        <div>
          <label className={labelCls}>Content <span className="text-red-500">*</span></label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className={inputCls}
            required
          />
          <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">
            Placeholders: <code className="rounded bg-gray-100 dark:bg-slate-700 px-1">{"{firstName}"}</code>{" "}
            <code className="rounded bg-gray-100 dark:bg-slate-700 px-1">{"{name}"}</code>
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={() => router.push("/communication/templates")}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={saving || !id}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function EditTemplatePage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="mb-6">
        <button
          onClick={() => router.push("/communication/templates")}
          className="mb-1 flex items-center gap-1 text-sm text-[#000080] dark:text-indigo-400 hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Templates
        </button>
        <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Edit Template</h1>
      </div>

      <Suspense fallback={<div className="p-10 text-center text-gray-400 dark:text-slate-500">Loading…</div>}>
        <EditTemplateContent />
      </Suspense>
    </DashboardLayout>
  );
}
