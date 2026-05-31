"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { createSuggestion, getStoredUser } from "@/lib/api";

export default function BabyDedicationPage() {
  const router = useRouter();
  const currentUser = getStoredUser();

  const [form, setForm] = useState({
    fatherName:            "",
    motherName:            "",
    childFullName:         "",
    dateOfBirth:           "",
    placeOfBirth:          "",
    meaningOfNames:        "",
    phoneNumber:           "",
    houseFellowshipCentre: "",
    houseLeader:           "",
  });
  const [touched,    setTouched]    = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  const touch = (f: string) => setTouched((t) => ({ ...t, [f]: true }));
  const set   = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const isValid =
    !!form.fatherName.trim() &&
    !!form.motherName.trim() &&
    !!form.childFullName.trim() &&
    !!form.dateOfBirth &&
    !!form.placeOfBirth.trim() &&
    !!form.meaningOfNames.trim() &&
    !!form.phoneNumber.trim() &&
    !!form.houseFellowshipCentre.trim() &&
    !!form.houseLeader.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) {
      setError("You must be logged in to submit this form.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const content = [
        `Name of Father: ${form.fatherName}`,
        `Name of Mother: ${form.motherName}`,
        `Full Name of Child: ${form.childFullName}`,
        `Date of Birth: ${form.dateOfBirth}`,
        `Place of Birth: ${form.placeOfBirth}`,
        `Meaning of Names: ${form.meaningOfNames}`,
        `Phone Number: ${form.phoneNumber}`,
        `House Fellowship Centre: ${form.houseFellowshipCentre}`,
        `House Leader: ${form.houseLeader}`,
      ].join("\n");

      await createSuggestion({
        userId:  currentUser.id,
        subject: `Baby Dedication – ${form.childFullName}`,
        content,
      });
      router.push("/requests");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit form.");
      setSubmitting(false);
    }
  };

  // Underline-only input — matches the paper-form look
  const ul =
    "w-full border-0 border-b border-[#000000] dark:border-slate-500 bg-transparent outline-none px-0 py-1 text-sm text-[#374151] dark:text-slate-200 focus:border-[#000080] transition-colors";

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Requests</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#000080] dark:text-indigo-400 hover:text-[#000066]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-[#000080] dark:text-indigo-400">
            Baby Dedication Form
          </h2>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Paper form card ───────────────────────────────────────────────── */}
      <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">

        {/* ── Church header ───────────────────────────────────────────────── */}
        <div className="px-8 pt-8 pb-5 text-center">
          {/* RCCG crest */}
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#CC0000]">
            <svg viewBox="0 0 64 64" className="h-12 w-12">
              <circle cx="32" cy="32" r="30" fill="none" stroke="#CC0000" strokeWidth="2"/>
              <circle cx="32" cy="32" r="22" fill="none" stroke="#CC0000" strokeWidth="1"/>
              <text x="32" y="28" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#CC0000" fontFamily="serif">THE</text>
              <text x="32" y="36" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#CC0000" fontFamily="serif">REDEEMED</text>
              <text x="32" y="44" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="#CC0000" fontFamily="serif">CHRISTIAN</text>
              <path d="M18 20 L32 10 L46 20" fill="none" stroke="#CC0000" strokeWidth="1.5"/>
            </svg>
          </div>

          <p className="text-[15px] font-extrabold uppercase tracking-wide text-[#000000] dark:text-slate-100">
            THE REDEEMED CHRISTIAN CHURCH OF GOD
          </p>
          <p
            className="mt-0.5 text-[17px] font-bold italic text-[#000000] dark:text-slate-100"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            Rose of Sharon
          </p>
          <p className="mt-4 text-[15px] font-extrabold uppercase text-[#000000] dark:text-slate-100">
            BABY DEDICATION FORM
          </p>
        </div>

        {/* Colour bar */}
        <div className="flex h-[6px]">
          <div className="flex-1 bg-[#CC0000]"/>
          <div className="w-3 bg-black"/>
          <div className="flex-1 bg-[#FF007F]"/>
          <div className="w-3 bg-black"/>
          <div className="flex-1 bg-[#CC0000]"/>
        </div>

        {/* ── Form body ───────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-6 px-8 py-7">

          <p className="text-[11px] font-extrabold uppercase italic tracking-widest text-[#000000] dark:text-slate-100">
            Please note: you are to write all in block letters
          </p>

          {/* Name of Father */}
          <div>
            <label className="block text-[13px] font-bold text-[#000000] dark:text-slate-200">
              Name of Father: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.fatherName}
              onChange={(e) => set("fatherName", e.target.value)}
              onBlur={() => touch("fatherName")}
              className={ul}
              required
            />
            {touched.fatherName && !form.fatherName.trim() && (
              <p className="mt-1 text-xs text-red-500">Required</p>
            )}
          </div>

          {/* Name of Mother */}
          <div>
            <label className="block text-[13px] font-bold text-[#000000] dark:text-slate-200">
              Name of Mother: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.motherName}
              onChange={(e) => set("motherName", e.target.value)}
              onBlur={() => touch("motherName")}
              className={ul}
              required
            />
            {touched.motherName && !form.motherName.trim() && (
              <p className="mt-1 text-xs text-red-500">Required</p>
            )}
          </div>

          {/* Full Name of Child */}
          <div>
            <label className="block text-[13px] font-bold text-[#000000] dark:text-slate-200">
              Full Name of Child: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.childFullName}
              onChange={(e) => set("childFullName", e.target.value)}
              onBlur={() => touch("childFullName")}
              className={ul}
              required
            />
            {touched.childFullName && !form.childFullName.trim() && (
              <p className="mt-1 text-xs text-red-500">Required</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-[13px] font-bold text-[#000000] dark:text-slate-200">
              Date of Birth: <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
              className={ul}
              required
            />
          </div>

          {/* Place of Birth */}
          <div>
            <label className="block text-[13px] font-bold text-[#000000] dark:text-slate-200">
              Place of Birth: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.placeOfBirth}
              onChange={(e) => set("placeOfBirth", e.target.value)}
              onBlur={() => touch("placeOfBirth")}
              className={ul}
              required
            />
            {touched.placeOfBirth && !form.placeOfBirth.trim() && (
              <p className="mt-1 text-xs text-red-500">Required</p>
            )}
          </div>

          {/* Meaning of Names */}
          <div>
            <label className="block text-[13px] font-bold text-[#000000] dark:text-slate-200">
              Meaning of Names: <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.meaningOfNames}
              onChange={(e) => set("meaningOfNames", e.target.value)}
              onBlur={() => touch("meaningOfNames")}
              rows={2}
              className="w-full resize-none border-0 border-b border-[#000000] dark:border-slate-500 bg-transparent px-0 py-1 text-sm text-[#374151] dark:text-slate-200 outline-none focus:border-[#000080] transition-colors"
              required
            />
            {touched.meaningOfNames && !form.meaningOfNames.trim() && (
              <p className="mt-1 text-xs text-red-500">Required</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-[13px] font-bold text-[#000000] dark:text-slate-200">
              Phone Number: <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => set("phoneNumber", e.target.value)}
              onBlur={() => touch("phoneNumber")}
              className={ul}
              required
            />
            {touched.phoneNumber && !form.phoneNumber.trim() && (
              <p className="mt-1 text-xs text-red-500">Required</p>
            )}
          </div>

          {/* House Fellowship Centre */}
          <div>
            <label className="block text-[13px] font-bold text-[#000000] dark:text-slate-200">
              House Fellowship Centre: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.houseFellowshipCentre}
              onChange={(e) => set("houseFellowshipCentre", e.target.value)}
              onBlur={() => touch("houseFellowshipCentre")}
              className={ul}
              required
            />
          </div>

          {/* House Leader & Signature */}
          <div>
            <label className="block text-[13px] font-bold text-[#000000] dark:text-slate-200">
              House Leader &amp; Signature: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.houseLeader}
              onChange={(e) => set("houseLeader", e.target.value)}
              onBlur={() => touch("houseLeader")}
              className={ul}
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2 rounded-md border border-[#E5E7EB] dark:border-slate-700 bg-[#FAFAFA] dark:bg-slate-700/30 px-4 py-3">
            <p className="text-[12.5px] text-[#374151] dark:text-slate-400">
              Please note that the 2nd Sunday of the month is baby dedication Sunday.
            </p>
            <p className="text-[12.5px] text-[#374151] dark:text-slate-400">
              On the day of dedication, Parents should endeavor to get to church very early and
              intimate the Pastor in Charge through the head usher that they are around.
            </p>
            <p className="text-[12.5px] italic text-[#374151] dark:text-slate-400">
              God bless you and remain blessed.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button variant="secondary" type="button" onClick={() => router.push("/requests")}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting || !isValid}>
              {submitting ? "Submitting…" : "Submit Form"}
            </Button>
          </div>
        </form>

        {/* Footer colour bar */}
        <div className="flex h-4">
          <div className="flex-1 bg-[#CC0000]"/>
          <div className="w-3 bg-black"/>
          <div className="flex-1 bg-[#FF007F]"/>
          <div className="w-3 bg-black"/>
          <div className="flex-1 bg-[#CC0000]"/>
        </div>
      </div>
    </DashboardLayout>
  );
}
