"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { SelectField } from "@/components/ui/FormField";
import { getMessageTemplate, updateMessageTemplate } from "@/lib/api";

const CATEGORY_OPTIONS = [
  { label: "New First Timer",     value: "NEW_FIRST_TIMER" },
  { label: "New Second Timer",    value: "NEW_SECOND_TIMER" },
  { label: "New Convert",         value: "NEW_CONVERT" },
  { label: "Wedding Anniversary", value: "WEDDING_ANNIVERSARY" },
  { label: "Birthday",            value: "BIRTHDAY" },
  { label: "Prayer Request",      value: "PRAYER_REQUEST" },
  { label: "New Member",          value: "NEW_MEMBER" },
  { label: "New E-Member",        value: "NEW_E_MEMBER" },
  { label: "Counseling Request",  value: "COUNSELING_REQUEST" },
];

const CHANNEL_OPTIONS = [
  { label: "SMS",   value: "SMS" },
  { label: "Email", value: "EMAIL" },
];

export default function EditTemplateClient() {
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

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [category, setCategory] = useState("");
  const [channel,  setChannel]  = useState("SMS");
  const [subject,  setSubject]  = useState("");
  const [content,  setContent]  = useState("");
  const [name,     setName]     = useState("");

  useEffect(() => {
    if (!id || id.startsWith("tpl-")) { setLoading(false); return; }
    async function load() {
      try {
        const t = await getMessageTemplate(id);
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
    setSaving(true);
    setError("");
    try {
      await updateMessageTemplate(id, {
        category,
        channel,
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
        <h1 className="text-[28px] font-bold text-[#000000]">Edit Template</h1>
        {name && <p className="text-sm text-[#6B7280]">{name}</p>}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-10 text-center text-sm text-gray-400">
          Loading template…
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 space-y-5">
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
              <label className={labelCls}>Template Name</label>
              <input
                type="text"
                value={name}
                disabled
                className={inputCls + " bg-gray-50 cursor-not-allowed"}
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
              <p className="mt-1 text-xs text-[#6B7280]">
                Placeholders: <code className="rounded bg-gray-100 px-1">{"{name}"}</code>{" "}
                <code className="rounded bg-gray-100 px-1">{"{date}"}</code>{" "}
                <code className="rounded bg-gray-100 px-1">{"{event}"}</code>
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => router.push("/communication/templates")}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}
