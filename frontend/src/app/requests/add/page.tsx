"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import {
  createCounselingRequest,
  createPrayerRequest,
  createSuggestion,
  searchMembers,
  type UserResponse,
} from "@/lib/api";

// Backend enum values for request type
const CATEGORY_OPTIONS = [
  { label: "Prayer",     value: "PRAYER"     },
  { label: "Counseling", value: "COUNSELING" },
  { label: "Suggestion", value: "SUGGESTIONS" },
];

export default function AddRequestPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    content: "",
  });

  // Member search state
  const [memberQuery, setMemberQuery] = useState("");
  const [memberResults, setMemberResults] = useState<UserResponse[]>([]);
  const [selectedMember, setSelectedMember] = useState<UserResponse | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Debounced member search
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!memberQuery.trim() || selectedMember) {
      setMemberResults([]);
      return;
    }
    searchDebounce.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await searchMembers(memberQuery.trim());
        setMemberResults(res.content ?? []);
      } catch {
        setMemberResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberQuery]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectMember = (member: UserResponse) => {
    setSelectedMember(member);
    setMemberQuery(`${member.firstName ?? ""} ${member.lastName ?? ""}`.trim());
    setMemberResults([]);
  };

  const handleClearMember = () => {
    setSelectedMember(null);
    setMemberQuery("");
    setMemberResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedMember) {
      setError("Please search for and select a member first.");
      return;
    }
    if (!formData.category) {
      setError("Please select a request category.");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        userId: selectedMember.id,
        subject: formData.subject,
        content: formData.content,
      };

      if (formData.category === "PRAYER") {
        await createPrayerRequest(body);
      } else if (formData.category === "COUNSELING") {
        await createCounselingRequest(body);
      } else {
        await createSuggestion(body);
      }

      router.push("/requests");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create request.");
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Requests"
        subtitle="New Request"
        backHref="/requests"
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Brief subject for the request"
            required
          />

          <SelectField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={CATEGORY_OPTIONS}
            required
          />

          {/* Member search — replaces mock memberOptions */}
          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-[#374151]">
              Submitted By <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={memberQuery}
                onChange={(e) => {
                  if (selectedMember) handleClearMember();
                  setMemberQuery(e.target.value);
                }}
                placeholder="Search member by name…"
                className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
                autoComplete="off"
              />
              {selectedMember && (
                <button
                  type="button"
                  onClick={handleClearMember}
                  className="flex-shrink-0 rounded-lg border border-[#E5E7EB] px-3 py-3 text-sm text-gray-500 hover:bg-gray-100"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Dropdown results */}
            {memberResults.length > 0 && (
              <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white shadow-md">
                {memberResults.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectMember(m)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#000080]/5"
                    >
                      {`${m.firstName ?? ""} ${m.lastName ?? ""}`.trim()}
                      {m.email && (
                        <span className="ml-2 text-xs text-gray-400">{m.email}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {searchLoading && (
              <p className="mt-1 text-xs text-gray-400">Searching…</p>
            )}
            {!searchLoading && memberQuery.length > 1 && !selectedMember && memberResults.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">No members found.</p>
            )}
          </div>

          <TextAreaField
            label="Details"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Describe the request…"
            rows={6}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/requests")}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save Request"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
