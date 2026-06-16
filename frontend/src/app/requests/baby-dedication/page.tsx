"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { createSuggestion, getStoredUser } from "@/lib/api";

export default function BabyDedicationPage() {
  const router      = useRouter();
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
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) {
      setError("You must be logged in to submit this form.");
      return;
    }
    // Re-read values from the form DOM directly so autofill is always captured
    const el = (e.target as HTMLFormElement).elements;
    const getValue = (name: string) =>
      ((el.namedItem(name) as HTMLInputElement | null)?.value ?? "").trim();

    const fatherName            = getValue("fatherName")            || form.fatherName.trim();
    const motherName            = getValue("motherName")            || form.motherName.trim();
    const childFullName         = getValue("childFullName")         || form.childFullName.trim();
    const dateOfBirth           = getValue("dateOfBirth")           || form.dateOfBirth.trim();
    const placeOfBirth          = getValue("placeOfBirth")          || form.placeOfBirth.trim();
    const meaningOfNames        = getValue("meaningOfNames")        || form.meaningOfNames.trim();
    const phoneNumber           = getValue("phoneNumber")           || form.phoneNumber.trim();
    const houseFellowshipCentre = getValue("houseFellowshipCentre") || form.houseFellowshipCentre.trim();
    const houseLeader           = getValue("houseLeader")           || form.houseLeader.trim();

    if (!fatherName || !motherName || !childFullName || !dateOfBirth || !placeOfBirth ||
        !meaningOfNames || !phoneNumber || !houseFellowshipCentre || !houseLeader) {
      setError("Please fill in all required fields before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const content = [
        `Name of Father: ${fatherName}`,
        `Name of Mother: ${motherName}`,
        `Full Name of Child: ${childFullName}`,
        `Date of Birth: ${dateOfBirth}`,
        `Place of Birth: ${placeOfBirth}`,
        `Meaning of Names: ${meaningOfNames}`,
        `Phone Number: ${phoneNumber}`,
        `House Fellowship Centre: ${houseFellowshipCentre}`,
        `House Leader: ${houseLeader}`,
      ].join("\n");

      await createSuggestion({
        userId:  currentUser.id,
        subject: `Baby Dedication – ${childFullName}`,
        content,
      });
      router.push("/requests");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit form.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Requests</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#000080] dark:text-indigo-400 hover:text-[#000066]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-[#000080] dark:text-indigo-400">Baby Dedication Form</h2>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Paper form card ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">

        {/* ── Church header ─────────────────────────────────────────────── */}
        <div className="flex flex-col items-center px-8 pt-8 pb-6 text-center">
          <Image
            src="/rccg-icon.png"
            alt="RCCG Logo"
            width={80}
            height={80}
            className="mb-3 object-contain"
          />
          <p className="text-[16px] font-extrabold uppercase tracking-wide text-black dark:text-slate-100">
            THE REDEEMED CHRISTIAN CHURCH OF GOD
          </p>
          <p
            className="mt-1 text-[20px] font-bold italic text-black dark:text-slate-100"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            Rose of Sharon
          </p>
          <p className="mt-5 text-[16px] font-extrabold uppercase text-black dark:text-slate-100">
            BABY DEDICATION FORM
          </p>
        </div>

        {/* ── Form body ─────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">

          <p className="text-[13px] italic font-bold text-black dark:text-slate-100 mb-2">
            PLEASE NOTE: YOU ARE TO WRITE ALL IN BLOCK LETTERS
          </p>

          {/* Name of Father */}
          <div className="flex items-end gap-2 border-b border-black dark:border-slate-400 pb-0.5">
            <label className="shrink-0 text-[13px] text-black dark:text-slate-100 whitespace-nowrap">
              Name of Father:
            </label>
            <input
              type="text"
              name="fatherName"
              value={form.fatherName}
              onChange={(e) => set("fatherName", e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] dark:text-slate-200 min-w-0"
              required
            />
          </div>

          {/* Name of Mother */}
          <div className="flex items-end gap-2 border-b border-black dark:border-slate-400 pb-0.5">
            <label className="shrink-0 text-[13px] text-black dark:text-slate-100 whitespace-nowrap">
              Name of Mother:
            </label>
            <input
              type="text"
              name="motherName"
              value={form.motherName}
              onChange={(e) => set("motherName", e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] dark:text-slate-200 min-w-0"
              required
            />
          </div>

          {/* Full name of Child */}
          <div className="flex items-end gap-2 border-b border-black dark:border-slate-400 pb-0.5">
            <label className="shrink-0 text-[13px] text-black dark:text-slate-100 whitespace-nowrap">
              Full name of Child:
            </label>
            <input
              type="text"
              name="childFullName"
              value={form.childFullName}
              onChange={(e) => set("childFullName", e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] dark:text-slate-200 min-w-0"
              required
            />
          </div>

          {/* Date of Birth */}
          <div className="flex items-end gap-2 border-b border-black dark:border-slate-400 pb-0.5">
            <label className="shrink-0 text-[13px] text-black dark:text-slate-100 whitespace-nowrap">
              Date of Birth:
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] dark:text-slate-200 min-w-0"
              required
            />
          </div>

          {/* Place of Birth */}
          <div className="flex items-end gap-2 border-b border-black dark:border-slate-400 pb-0.5">
            <label className="shrink-0 text-[13px] text-black dark:text-slate-100 whitespace-nowrap">
              Place of Birth:
            </label>
            <input
              type="text"
              name="placeOfBirth"
              value={form.placeOfBirth}
              onChange={(e) => set("placeOfBirth", e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] dark:text-slate-200 min-w-0"
              required
            />
          </div>

          {/* Meaning of names — label + first underline + second blank underline */}
          <div className="space-y-2">
            <div className="flex items-end gap-2 border-b border-black dark:border-slate-400 pb-0.5">
              <label className="shrink-0 text-[13px] text-black dark:text-slate-100 whitespace-nowrap">
                Meaning of names:
              </label>
              <input
                type="text"
                name="meaningOfNames"
                value={form.meaningOfNames}
                onChange={(e) => set("meaningOfNames", e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] dark:text-slate-200 min-w-0"
                required
              />
            </div>
            {/* Second blank underline */}
            <div className="border-b border-black dark:border-slate-400 h-5" />
          </div>

          {/* Phone number */}
          <div className="flex items-end gap-2 border-b border-black dark:border-slate-400 pb-0.5">
            <label className="shrink-0 text-[13px] text-black dark:text-slate-100 whitespace-nowrap">
              Phone number:
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={(e) => set("phoneNumber", e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] dark:text-slate-200 min-w-0"
              required
            />
          </div>

          {/* House Fellowship Centre */}
          <div className="flex items-end gap-2 border-b border-black dark:border-slate-400 pb-0.5">
            <label className="shrink-0 text-[13px] text-black dark:text-slate-100 whitespace-nowrap">
              House Fellowship Centre:
            </label>
            <input
              type="text"
              name="houseFellowshipCentre"
              value={form.houseFellowshipCentre}
              onChange={(e) => set("houseFellowshipCentre", e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] dark:text-slate-200 min-w-0"
              required
            />
          </div>

          {/* House Leader & Signature */}
          <div className="flex items-end gap-2 border-b border-black dark:border-slate-400 pb-0.5">
            <label className="shrink-0 text-[13px] text-black dark:text-slate-100 whitespace-nowrap">
              House Leader &amp; Signature:
            </label>
            <input
              type="text"
              name="houseLeader"
              value={form.houseLeader}
              onChange={(e) => set("houseLeader", e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] dark:text-slate-200 min-w-0"
              required
            />
          </div>

          {/* Notes */}
          <div className="pt-4 space-y-3">
            <p className="text-[13px] text-[#374151] dark:text-slate-400">
              Please note that the 2nd Sunday of the month is baby dedication Sunday.
            </p>
            <p className="text-[13px] text-[#374151] dark:text-slate-400">
              On the day of dedication, Parents should endeavor to get to church very early and
              intimate the Pastor in Charge through the head usher that they are around.
            </p>
            <p className="text-[13px] italic text-[#374151] dark:text-slate-400">
              God bless you and remain blessed.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push("/requests")}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Form"}
            </Button>
          </div>
        </form>

        {/* ── Footer — pink blocks protrude above the black base ──────────── */}
        <div className="relative overflow-hidden" style={{ height: 44 }}>
          {/* Full-width black base at bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-black" style={{ height: 20 }} />
          {/* Three pink blocks protruding above the black */}
          <div
            className="absolute flex"
            style={{ bottom: 4, left: 14, right: 14, height: 30, gap: 8 }}
          >
            <div style={{ flex: 5, background: "#E8198B" }} />
            <div style={{ flex: 3, background: "#E8198B" }} />
            <div style={{ flex: 3, background: "#E8198B" }} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
