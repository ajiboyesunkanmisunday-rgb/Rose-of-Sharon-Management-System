"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { createSuggestion, getStoredUser } from "@/lib/api";

export default function BabyChristeningPage() {
  const router      = useRouter();
  const currentUser = getStoredUser();

  const [form, setForm] = useState({
    parentName:            "",
    address:               "",
    sex:                   "",
    dateOfBirth:           "",
    namingCeremonyDate:    "",
    phoneNumber:           "",
    churchHandleNaming:    "",
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
    !!form.parentName.trim() &&
    !!form.address.trim() &&
    !!form.sex &&
    !!form.dateOfBirth &&
    !!form.namingCeremonyDate &&
    !!form.phoneNumber.trim() &&
    !!form.churchHandleNaming &&
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
        `Name of Parent: ${form.parentName}`,
        `Parents' Address: ${form.address}`,
        `Sex: ${form.sex}`,
        `Date of Birth: ${form.dateOfBirth}`,
        `Naming Ceremony Date: ${form.namingCeremonyDate}`,
        `Phone Number of Parent: ${form.phoneNumber}`,
        `Church to Handle Naming Ceremony: ${form.churchHandleNaming}`,
        `House Fellowship Centre: ${form.houseFellowshipCentre}`,
        `House Leader: ${form.houseLeader}`,
      ].join("\n");

      await createSuggestion({
        userId:  currentUser.id,
        subject: `Baby Christening – ${form.parentName}`,
        content,
      });
      router.push("/requests");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit form.");
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
          <h2 className="text-[22px] font-bold text-[#000080] dark:text-indigo-400">Baby Christening Form</h2>
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
          <p className="mt-5 text-[14px] font-extrabold uppercase text-black dark:text-slate-100 leading-tight">
            NOTIFICATION OF BIRTH AND REQUEST FOR CHURCH TO<br />
            CONDUCT BABY&apos;S CHRISTENING
          </p>
        </div>

        {/* ── Form body ─────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">

          <p className="text-[13px] font-extrabold uppercase text-black dark:text-slate-100 mb-2">
            Please fill all in block letters
          </p>

          {/* Name of Parent */}
          <div className="flex items-end gap-2 border-b border-black dark:border-slate-400 pb-0.5">
            <label className="shrink-0 text-[13px] font-bold text-black dark:text-slate-100 whitespace-nowrap">
              Name of Parent:
            </label>
            <input
              type="text"
              value={form.parentName}
              onChange={(e) => set("parentName", e.target.value)}
              onBlur={() => touch("parentName")}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] dark:text-slate-200 min-w-0"
              required
            />
          </div>
          {touched.parentName && !form.parentName.trim() && (
            <p className="text-xs text-red-500 -mt-3">Required</p>
          )}

          {/* Parents' Address — label + first underline */}
          <div className="space-y-2">
            <div className="flex items-end gap-2 border-b border-black dark:border-slate-400 pb-0.5">
              <label className="shrink-0 text-[13px] font-bold text-black dark:text-slate-100 whitespace-nowrap">
                Parents&apos; Address:
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                onBlur={() => touch("address")}
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] dark:text-slate-200 min-w-0"
                required
              />
            </div>
            {/* Second blank underline for overflow */}
            <div className="border-b border-black dark:border-slate-400 h-5" />
          </div>

          {/* Sex */}
          <div className="flex items-end gap-2 border-b border-black dark:border-slate-400 pb-0.5">
            <label className="shrink-0 text-[13px] font-bold text-black dark:text-slate-100 whitespace-nowrap">
              Sex:
            </label>
            <select
              value={form.sex}
              onChange={(e) => set("sex", e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] dark:text-slate-200 min-w-0 cursor-pointer"
              required
            >
              <option value="">—</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div className="flex items-end gap-2 border-b border-black dark:border-slate-400 pb-0.5">
            <label className="shrink-0 text-[13px] font-bold text-black dark:text-slate-100 whitespace-nowrap">
              Date of birth:
            </label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] dark:text-slate-200 min-w-0"
              required
            />
          </div>

          {/* Naming Ceremony Date */}
          <div className="flex items-end gap-2 border-b border-black dark:border-slate-400 pb-0.5">
            <label className="shrink-0 text-[13px] font-bold text-black dark:text-slate-100 whitespace-nowrap">
              Naming ceremony date:
            </label>
            <input
              type="date"
              value={form.namingCeremonyDate}
              onChange={(e) => set("namingCeremonyDate", e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] dark:text-slate-200 min-w-0"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="flex items-end gap-2 border-b border-black dark:border-slate-400 pb-0.5">
            <label className="shrink-0 text-[13px] font-bold text-black dark:text-slate-100 whitespace-nowrap">
              Phone number of Parent:
            </label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => set("phoneNumber", e.target.value)}
              onBlur={() => touch("phoneNumber")}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] dark:text-slate-200 min-w-0"
              required
            />
          </div>

          {/* Church handle naming ceremony + House Fellowship Centre */}
          <div className="space-y-2">
            <p className="text-[13px] font-bold text-black dark:text-slate-100">
              Do you want the Church to handle the naming ceremony?
            </p>
            <div className="flex items-center gap-6">
              {["Yes", "No"].map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-1.5 text-[13px] font-bold text-black dark:text-slate-100 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="churchHandleNaming"
                    value={opt}
                    checked={form.churchHandleNaming === opt}
                    onChange={() => set("churchHandleNaming", opt)}
                    className="h-4 w-4 accent-[#000080]"
                  />
                  {opt} [ ]
                </label>
              ))}
            </div>
            {/* House Fellowship Centre on same section */}
            <div className="flex items-end gap-2 border-b border-black dark:border-slate-400 pb-0.5 mt-2">
              <label className="shrink-0 text-[13px] font-bold text-black dark:text-slate-100 whitespace-nowrap">
                House Fellowship Centre:
              </label>
              <input
                type="text"
                value={form.houseFellowshipCentre}
                onChange={(e) => set("houseFellowshipCentre", e.target.value)}
                onBlur={() => touch("houseFellowshipCentre")}
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] dark:text-slate-200 min-w-0"
                required
              />
            </div>
          </div>

          {/* House Leader & Signature */}
          <div className="flex items-end gap-2 border-b border-black dark:border-slate-400 pb-0.5">
            <label className="shrink-0 text-[13px] font-bold text-black dark:text-slate-100 whitespace-nowrap">
              House Leader &amp; Signature:
            </label>
            <input
              type="text"
              value={form.houseLeader}
              onChange={(e) => set("houseLeader", e.target.value)}
              onBlur={() => touch("houseLeader")}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#374151] dark:text-slate-200 min-w-0"
              required
            />
          </div>

          {/* Note */}
          <p className="text-[12.5px] italic text-[#374151] dark:text-slate-400 pt-4">
            <span className="font-semibold not-italic">Note:</span> The second Sunday of the month
            is Baby Dedication Sunday: please notify the Church as soon as you are ready to dedicate
            the baby.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="secondary" type="button" onClick={() => router.push("/requests")}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting || !isValid}>
              {submitting ? "Submitting…" : "Submit Form"}
            </Button>
          </div>
        </form>

        {/* ── Footer — pink blocks protrude above the black base ──────────── */}
        {/*
            Physical form layout:
            [white]  [white]  [white]
            [ PINK  BLK  ] [PINK BLK] [PINK BLK] [BLK]   ← blocks rise above
            [         BLACK  BASE  STRIP           ]       ← full-width black
        */}
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
