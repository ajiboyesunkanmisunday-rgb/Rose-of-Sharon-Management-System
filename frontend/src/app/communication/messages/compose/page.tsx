"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { communicationTemplates } from "@/lib/mock-data";

const TYPE_OPTIONS = [
  { label: "SMS", value: "SMS" },
  { label: "Email", value: "Email" },
];

const RECIPIENT_OPTIONS = [
  { label: "All Members", value: "All Members" },
  { label: "Workers Only", value: "Workers" },
  { label: "Choir", value: "Choir" },
  { label: "Ushering", value: "Ushering" },
  { label: "Youth", value: "Youth" },
  { label: "First Timers", value: "First Timers" },
  { label: "Custom", value: "Custom" },
];

export default function ComposeMessagePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    type: "SMS",
    recipient: "",
    customRecipients: "",
    subject: "",
    content: "",
    templateId: "",
    scheduledDate: "",
    sendNow: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    if (name === "templateId" && value) {
      const template = communicationTemplates.find((t) => t.id === value);
      if (template) {
        setFormData((prev) => ({
          ...prev,
          templateId: value,
          type: template.type,
          subject: template.subject || "",
          content: template.content,
        }));
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Send message:", formData);
    router.push("/communication/messages");
  };

  const isEmail = formData.type === "Email";

  const MAX_CONTENT = 1000;
  const MAX_SUBJECT = 150;

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (f: string) => setTouched((t) => ({ ...t, [f]: true }));

  const fieldErrors = {
    recipient: !formData.recipient ? "Recipient is required" : "",
    subject: isEmail && !formData.subject.trim() ? "Subject is required" : "",
    content: !formData.content.trim() ? "Message body is required" : "",
  };

  const isFormValid = !!formData.recipient && !!formData.content.trim() && (!isEmail || !!formData.subject.trim());

  const templateOptions = communicationTemplates
    .filter((t) => t.type === formData.type)
    .map((t) => ({ label: t.name, value: t.id }));

  return (
    <DashboardLayout>
      <PageHeader
        title="Communication"
        subtitle="New Message"
        backHref="/communication/messages"
      />

      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <SelectField label="Type" name="type" value={formData.type} onChange={handleChange} options={TYPE_OPTIONS} required />
            <SelectField label="Recipient(s)" name="recipient" value={formData.recipient} onChange={(e) => { handleChange(e); touch("recipient"); }} options={RECIPIENT_OPTIONS} required error={touched.recipient ? fieldErrors.recipient : undefined} />
          </div>

          {formData.recipient === "Custom" && (
            <TextAreaField
              label="Custom Recipients"
              name="customRecipients"
              value={formData.customRecipients}
              onChange={handleChange}
              placeholder="Enter phone numbers or emails separated by commas"
              rows={3}
            />
          )}

          {templateOptions.length > 0 && (
            <SelectField
              label="Use Template (optional)"
              name="templateId"
              value={formData.templateId}
              onChange={handleChange}
              options={templateOptions}
              placeholder="No template"
            />
          )}

          {isEmail && (
            <FormField
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value.slice(0, MAX_SUBJECT) }))}
              onBlur={() => touch("subject")}
              placeholder="Email subject"
              required
              error={touched.subject ? fieldErrors.subject : undefined}
              showCount
              maxLength={MAX_SUBJECT}
            />
          )}

          <TextAreaField
            label="Message Body"
            name="content"
            value={formData.content}
            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value.slice(0, MAX_CONTENT) }))}
            onBlur={() => touch("content")}
            placeholder={`Compose your ${formData.type.toLowerCase()}...`}
            rows={8}
            required
            error={touched.content ? fieldErrors.content : undefined}
            showCount
            maxLength={MAX_CONTENT}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="sendNow"
              name="sendNow"
              checked={formData.sendNow}
              onChange={handleChange}
              className="h-4 w-4 rounded border-[#E5E7EB] dark:border-slate-700 text-[#000080] dark:text-indigo-400 focus:ring-[#000080]"
            />
            <label htmlFor="sendNow" className="text-sm text-[#374151] dark:text-slate-300">
              Send immediately
            </label>
          </div>

          {!formData.sendNow && (
            <FormField
              label="Schedule for"
              type="datetime-local"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
            />
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push("/communication/messages")}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!isFormValid}>
              {formData.sendNow ? "Send Now" : "Schedule"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
