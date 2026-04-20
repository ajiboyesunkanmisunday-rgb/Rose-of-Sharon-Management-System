"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { SelectField } from "@/components/ui/FormField";
import { TemplateProcess, MessageChannel } from "@/lib/types";

const processOptions: { label: string; value: TemplateProcess }[] = [
  { label: "First Timer", value: "First Timer" },
  { label: "Second Timer", value: "Second Timer" },
  { label: "Birthday", value: "Birthday" },
  { label: "Wedding Anniversary", value: "Wedding Anniversary" },
  { label: "New Converts", value: "New Converts" },
  { label: "New E-Member", value: "New E-Member" },
  { label: "New Member", value: "New Member" },
  { label: "Prayer Request", value: "Prayer Request" },
  { label: "Counseling Request", value: "Counseling Request" },
  { label: "Birthday Thanksgiving", value: "Birthday Thanksgiving" },
  { label: "Anniversary Thanksgiving", value: "Anniversary Thanksgiving" },
  { label: "Child Dedication", value: "Child Dedication" },
];

const channelOptions: { label: string; value: MessageChannel }[] = [
  { label: "SMS", value: "SMS" },
  { label: "Email", value: "Email" },
  { label: "Both", value: "Both" },
];

export default function AddTemplatePage() {
  const router = useRouter();

  const [process, setProcess] = useState<TemplateProcess | "">("");
  const [channel, setChannel] = useState<MessageChannel>("SMS");
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const handleProcessChange = (val: string) => {
    const p = val as TemplateProcess | "";
    setProcess(p);
    if (!nameTouched && p) {
      setName(`${p} Greeting`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Save template:", { process, channel, name, subject, content });
    router.push("/communication/templates");
  };

  const inputStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
  const labelStyles = "mb-1 block text-sm font-medium text-[#374151]";

  const showSubject = channel === "Email" || channel === "Both";

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Communication</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/communication/templates")}
            className="flex items-center text-[#000080] transition-colors hover:text-[#000066]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-[#000080]">Add Template</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
          <div className="mb-6 rounded-xl border border-[#B5B5F3] bg-[#F5F5FC] p-4">
            <p className="mb-3 text-sm font-semibold text-[#000080]">Create from Process</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                label="Process"
                options={processOptions}
                value={process}
                onChange={(e) => handleProcessChange(e.target.value)}
                placeholder="Select process"
              />
              <SelectField
                label="Channel"
                options={channelOptions}
                value={channel}
                onChange={(e) => setChannel(e.target.value as MessageChannel)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelStyles}>Template Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameTouched(true);
                }}
                placeholder="Enter template name"
                className={inputStyles}
              />
            </div>

            {showSubject && (
              <div>
                <label className={labelStyles}>Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className={inputStyles}
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className={labelStyles}>Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter template content. Use {name}, {date}, {event} as placeholder variables."
                rows={6}
                className={inputStyles}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => router.push("/communication/templates")}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
