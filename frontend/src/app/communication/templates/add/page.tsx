"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

export default function AddTemplatePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [type, setType] = useState<"SMS" | "Email">("SMS");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Save template:", { name, type, subject, content });
    router.push("/communication/templates");
  };

  const inputStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
  const selectStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10";
  const labelStyles = "mb-1 block text-sm font-medium text-[#374151]";

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Communication</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/communication/templates")}
            className="flex items-center text-[#000080] transition-colors hover:text-[#000066]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-[#000080]">Add Template</h2>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Template Name */}
            <div>
              <label className={labelStyles}>Template Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter template name"
                className={inputStyles}
              />
            </div>

            {/* Type */}
            <div>
              <label className={labelStyles}>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "SMS" | "Email")}
                className={selectStyles}
              >
                <option value="SMS">SMS</option>
                <option value="Email">Email</option>
              </select>
            </div>

            {/* Subject (shown only for Email) */}
            {type === "Email" && (
              <div className="md:col-span-2">
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

            {/* Content */}
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

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push("/communication/templates")}
            >
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
