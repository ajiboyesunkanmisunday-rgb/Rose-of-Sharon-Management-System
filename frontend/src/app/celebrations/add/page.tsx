"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { createCelebration, getMembers, getEMembers, type UserResponse } from "@/lib/api";

// Swagger-verified celebrationType enum values
const TYPE_OPTIONS = [
  { label: "Birthday", value: "BIRTHDAY" },
  { label: "Wedding Anniversary", value: "WEDDING" },
  { label: "Child Dedication", value: "CHILD_DEDICATION" },
  { label: "Funeral", value: "FUNERAL" },
  { label: "Others", value: "OTHERS" },
];

function fullName(u: UserResponse) {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

export default function AddCelebrationPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    type: "",
    date: "",
    notes: "",
  });
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");

  // Member search state
  const [memberQuery, setMemberQuery] = useState("");
  const [memberResults, setMemberResults] = useState<UserResponse[]>([]);
  const [allMembers, setAllMembers] = useState<UserResponse[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (f: string) => setTouched((t) => ({ ...t, [f]: true }));

  const fieldErrors = {
    member: !selectedUserId ? "Please select a church member" : "",
    type: !formData.type ? "Celebration type is required" : "",
    date: !formData.date ? "Date is required" : "",
  };

  const isFormValid = !!selectedUserId && !!formData.type && !!formData.date;

  // Load members once for search
  useEffect(() => {
    async function loadMembers() {
      setMembersLoading(true);
      try {
        const [mRes, emRes] = await Promise.allSettled([
          getMembers(0, 500),
          getEMembers(0, 500),
        ]);
        const members = mRes.status === "fulfilled" ? (mRes.value.content ?? []) : [];
        const eMembers = emRes.status === "fulfilled" ? (emRes.value.content ?? []) : [];
        setAllMembers([...members, ...eMembers]);
      } catch { /* silently ignore */ }
      finally { setMembersLoading(false); }
    }
    loadMembers();
  }, []);

  // Filter members by query
  useEffect(() => {
    if (!memberQuery.trim()) { setMemberResults([]); return; }
    const q = memberQuery.toLowerCase();
    setMemberResults(
      allMembers
        .filter((u) => fullName(u).toLowerCase().includes(q) || (u.phoneNumber ?? "").includes(q))
        .slice(0, 8)
    );
    setShowDropdown(true);
  }, [memberQuery, allMembers]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectMember = (u: UserResponse) => {
    setSelectedUserId(u.id);
    setSelectedUserName(fullName(u));
    setMemberQuery(fullName(u));
    setShowDropdown(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) { setError("Please select a church member for this celebration."); return; }
    if (!formData.type) { setError("Please select a celebration type."); return; }
    if (!formData.date) { setError("Please select a date."); return; }

    setLoading(true);
    setError("");
    try {
      await createCelebration({
        userId: selectedUserId,
        type: formData.type,
        date: formData.date,
        notes: formData.notes || undefined,
      });
      // Redirect to the matching tab so the user lands on the right section.
      const tab =
        formData.type === "BIRTHDAY" ? "birthdays"
        : formData.type === "WEDDING" ? "anniversaries"
        : "thanksgiving";
      router.push(`/celebrations?tab=${tab}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save celebration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Celebrations" subtitle="Add Celebration" backHref="/celebrations" />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Member search */}
          <div className="relative" ref={dropdownRef}>
            <label className="mb-1.5 block text-sm font-medium text-[#374151] dark:text-slate-300">
              Church Member <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={memberQuery}
              onChange={(e) => {
                setMemberQuery(e.target.value);
                if (selectedUserId && e.target.value !== selectedUserName) {
                  setSelectedUserId("");
                  setSelectedUserName("");
                }
              }}
              onBlur={() => touch("member")}
              placeholder={membersLoading ? "Loading members…" : "Search by name or phone…"}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 placeholder-[#9CA3AF] focus:border-[#000080] focus:outline-none ${touched.member && fieldErrors.member && !selectedUserId ? "border-red-400" : "border-[#E5E7EB] dark:border-slate-700"}`}
            />
            {touched.member && fieldErrors.member && !selectedUserId && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.member}</p>
            )}
            {selectedUserId && (
              <span className="absolute right-3 top-9 text-xs text-green-600 font-medium">✓ Selected</span>
            )}
            {showDropdown && memberResults.length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
                {memberResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[#111827] dark:text-slate-100 hover:bg-[#F3F4F6] dark:bg-slate-700/30 text-left"
                    onClick={() => handleSelectMember(u)}
                  >
                    <span className="font-medium">{fullName(u)}</span>
                    {u.phoneNumber && <span className="ml-auto text-xs text-[#9CA3AF] dark:text-slate-400">{u.phoneNumber}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <SelectField
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={TYPE_OPTIONS}
              required
            />
            <FormField
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <TextAreaField
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Optional notes"
            rows={3}
          />

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push("/celebrations")}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save Celebration"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
