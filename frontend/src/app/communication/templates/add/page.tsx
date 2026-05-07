"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { SelectField } from "@/components/ui/FormField";
import { createMessageTemplate } from "@/lib/api";

const PROCESS_OPTIONS = [
  { label: "New First Timer",          value: "NEW_FIRST_TIMER" },
  { label: "New Second Timer",         value: "NEW_SECOND_TIMER" },
  { label: "New Convert",              value: "NEW_CONVERT" },
  { label: "Wedding Anniversary",      value: "WEDDING_ANNIVERSARY" },
  { label: "Birthday",                 value: "BIRTHDAY" },
  { label: "Prayer Request",           value: "PRAYER_REQUEST" },
  { label: "New Member",               value: "NEW_MEMBER" },
  { label: "New E-Member",             value: "NEW_E_MEMBER" },
  { label: "Counseling Request",       value: "COUNSELING_REQUEST" },
];

const CHANNEL_OPTIONS = [
  { label: "SMS",   value: "SMS" },
  { label: "Email", value: "EMAIL" },
];

export default function AddTemplatePage() {
  const router = useRouter();

  const [category,     setCategory]     = useState("");
  const [channel,      setChannel]      = useState("SMS");
  const [name,         setName]         = useState("");
  const [nameTouched,  setNameTouched]  = useState(false);
  const [subject,      setSubject]      = useState("");
  const [content,      setContent]      = useState("");
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    if (!nameTouched && val) {
      const label = PROCESS_OPTIONS.find((o) => o.value === val)?.label ?? "";
      setName(`${label} Template`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !name || !content) {
      setError("Category, name, and content are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createMessageTemplate({
        category,
        channel,
        name,
        subject: channel === "EMAIL" ? subject : undefined,
        content,
      });
      router.push("/communication/templates");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create template.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
  const labelCls = "mb-1 block text-sm font-medium text-[#374151]";

  return (
    <DashboardLayout>
      <div className="mb-6">
        <button
          onClick={() => router.push("/communication/templates")}
          className="mb-1 flex items-center gap-1 text-sm text-[#000080] hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to Templates
        </button>
        <h1 className="text-[28px] font-bold text-[#000000]">Add Template</h1>
        <p className="text-sm text-[#6B7280]">Create a reusable SMS or email message template</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
          {/* Process selector */}
          <div className="mb-6 rounded-xl border border-[#B5B5F3] bg-[#F5F5FC] p-4">
            <p className="mb-3 text-sm font-semibold text-[#000080]">Template Setup</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                label="Category"
                options={PROCESS_OPTIONS}
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                placeholder="Select category"
              />
              <SelectField
                label="Channel"
                options={CHANNEL_OPTIONS}
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelCls}>Template Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameTouched(true); }}
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

            <div className="md:col-span-2">
              <label className={labelCls}>Content <span className="text-red-500">*</span></label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter template content. Use {name}, {date}, {event} as placeholders."
                rows={7}
                className={inputCls}
                required
              />
              <p className="mt-1 text-xs text-[#6B7280]">
                Placeholders: <code className="rounded bg-gray-100 px-1">{"{name}"}</code>{" "}
                <code className="rounded bg-gray-100 px-1">{"{date}"}</code>{" "}
                <code className="rounded bg-gray-100 px-1">{"{event}"}</code>
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => router.push("/communication/templates")}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save Template"}
            </Button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
