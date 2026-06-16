"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { useToast } from "@/context/ToastContext";
import WYSIWYGEditor from "@/components/ui/WYSIWYGEditor";
import {
  getMessageTemplates,
  createMessage,
  type CreateMessageRequest,
  type MessageTemplateResponse,
} from "@/lib/api";

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
  { label: "Gender", value: "Gender" },
  { label: "Custom", value: "Custom" },
];

const GENDER_OPTIONS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
];

function mapRecipientToCategory(recipient: string): string {
  switch (recipient) {
    case "All Members": return "ALL_MEMBERS";
    case "Workers": return "WORKERS";
    case "Choir": return "CHOIR";
    case "Ushering": return "USHERING";
    case "Youth": return "YOUTH";
    case "First Timers": return "FIRST_TIMERS";
    case "Gender": return "GENDER";
    case "Custom": return "CUSTOM";
    default: return recipient.toUpperCase().replace(/\s+/g, "_");
  }
}

export default function ComposeMessagePage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [templates, setTemplates] = useState<MessageTemplateResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: "SMS",
    recipient: "",
    customRecipients: "",
    subject: "",
    content: "",
    templateId: "",
    scheduledDate: "",
    sendNow: true,
    categoryValue: "",
  });

  useEffect(() => {
    getMessageTemplates(0, 100)
      .then((res) => {
        setTemplates(res.content ?? []);
      })
      .catch((err) => {
        console.error("Failed to fetch templates:", err);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    if (name === "templateId" && value) {
      const template = templates.find((t) => t.id === value);
      if (template) {
        setFormData((prev) => ({
          ...prev,
          templateId: value,
          type: template.channel === "EMAIL" ? "Email" : "SMS",
          subject: template.subject || "",
          content: template.content,
        }));
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const isEmail = formData.type === "Email";
  const isGenderSelected = formData.recipient === "Gender";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const requestBody: CreateMessageRequest = {
        subject: isEmail ? formData.subject : undefined,
        content: formData.content,
        channel: isEmail ? "EMAIL" : "SMS",
        isInstant: formData.sendNow,
        timeSent: formData.sendNow
          ? new Date().toISOString()
          : formData.scheduledDate
            ? new Date(formData.scheduledDate).toISOString()
            : new Date().toISOString(),
        category: mapRecipientToCategory(formData.recipient),
        categoryValue: isGenderSelected ? formData.categoryValue : undefined,
        customReceivers: formData.recipient === "Custom"
          ? formData.customRecipients.split(",").map((r) => r.trim()).filter(Boolean)
          : undefined,
      };

      await createMessage(requestBody);
      addToast(
        formData.sendNow
          ? "Message sent successfully!"
          : "Message scheduled successfully!",
        "success"
      );
      router.push("/communication/messages");
    } catch (err) {
      console.error(err);
      addToast(
        err instanceof Error ? err.message : "Failed to send/schedule message.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const MAX_CONTENT = 1000;
  const MAX_SUBJECT = 150;

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (f: string) => setTouched((t) => ({ ...t, [f]: true }));

  const fieldErrors = {
    recipient: !formData.recipient ? "Recipient is required" : "",
    subject: isEmail && !formData.subject.trim() ? "Subject is required" : "",
    content: !formData.content.trim() ? "Message body is required" : "",
    categoryValue: isGenderSelected && !formData.categoryValue ? "Gender selection is required" : "",
  };

  const isFormValid =
    !!formData.recipient &&
    (!isGenderSelected || !!formData.categoryValue) &&
    !!formData.content.trim() &&
    (!isEmail || !!formData.subject.trim());

  const templateOptions = templates
    .filter((t) => (t.channel === "EMAIL" ? "Email" : "SMS") === formData.type)
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

          {isGenderSelected && (
            <SelectField
              label="Gender"
              name="categoryValue"
              value={formData.categoryValue}
              onChange={(e) => { handleChange(e); touch("categoryValue"); }}
              options={GENDER_OPTIONS}
              required
              error={touched.categoryValue ? fieldErrors.categoryValue : undefined}
            />
          )}

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

          {isEmail ? (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Message Body <span className="text-red-500">*</span>
              </label>
              <WYSIWYGEditor
                value={formData.content}
                onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
                placeholder="Compose your email..."
                error={touched.content ? fieldErrors.content : undefined}
              />
            </div>
          ) : (
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
          )}

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
            <Button variant="primary" type="submit" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? "Processing..." : formData.sendNow ? "Send Now" : "Schedule"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
