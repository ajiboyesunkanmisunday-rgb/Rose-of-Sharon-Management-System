"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { createPrayerRequest, searchMembers, type UserResponse } from "@/lib/api";

const CATEGORY_OPTIONS = [
  "Healing",
  "Finance",
  "Family",
  "Marriage",
  "Salvation",
  "Career",
  "Other",
];

export default function AddPrayerRequestPage() {
  const router = useRouter();

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [form, setForm] = useState({
    category: "",
    request: "",
  });

  // Member search state (used when not anonymous)
  const [memberQuery, setMemberQuery] = useState("");
  const [memberResults, setMemberResults] = useState<UserResponse[]>([]);
  const [selectedMember, setSelectedMember] = useState<UserResponse | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Debounced member search
  useEffect(() => {
    if (isAnonymous) return;
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
  }, [memberQuery, isAnonymous]);

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

  const handleToggleAnonymous = (checked: boolean) => {
    setIsAnonymous(checked);
    if (checked) handleClearMember();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isAnonymous && !selectedMember) {
      setError("Please search for and select a member, or enable anonymous submission.");
      return;
    }

    setSubmitting(true);
    try {
      await createPrayerRequest({
        userId: selectedMember?.id ?? "",
        subject: form.category || "Prayer Request",
        content: form.request,
      });
      router.push("/prayer-requests");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit prayer request.");
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Prayer Requests</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/prayer-requests")}
            className="flex items-center text-[#000080] transition-colors hover:text-[#000066]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-[#000080]">Add Prayer Request</h2>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">

          {/* Anonymous toggle */}
          <div className="mb-6 flex items-center gap-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => handleToggleAnonymous(e.target.checked)}
                className="sr-only"
              />
              <div className={`h-6 w-11 rounded-full transition-colors ${isAnonymous ? "bg-[#000080]" : "bg-gray-300"}`}>
                <div className={`mt-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isAnonymous ? "translate-x-5 ml-0.5" : "translate-x-0.5"}`} />
              </div>
            </label>
            <span className="text-sm font-medium text-[#374151]">Submit Anonymously</span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Member search — shown when not anonymous */}
            {!isAnonymous && (
              <div className="relative sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-[#374151]">
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
                    className={inputClass}
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
            )}

            {/* Category */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                required
              >
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Prayer request text */}
          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-medium text-[#374151]">
              Prayer Request <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              className={inputClass}
              placeholder="Describe the prayer request in detail..."
              value={form.request}
              onChange={(e) => set("request", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            type="button"
            onClick={() => router.push("/prayer-requests")}
          >
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Request"}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
