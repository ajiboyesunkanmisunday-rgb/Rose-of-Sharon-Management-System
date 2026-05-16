"use client";

/**
 * /trainings/sod/test
 *
 * Test page for School of Disciples enrolment.
 * Submits real API calls — students created here appear in /trainings/sod.
 * Use this to verify the SOD feature works end-to-end before the
 * enrolment form is embedded in a public-facing page.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createSchoolOfDisciple } from "@/lib/api";
import {
  ArrowLeft, BookOpen, CheckCircle, ExternalLink,
  AlertTriangle, Send, ChevronDown,
} from "lucide-react";

interface Submission {
  name: string;
  phone: string;
  submittedAt: string;
  status: "ok" | "error";
  message: string;
}

export default function SodTestPage() {
  const router = useRouter();

  const [firstName,   setFirstName]   = useState("");
  const [middleName,  setMiddleName]  = useState("");
  const [lastName,    setLastName]    = useState("");
  const [countryCode, setCountryCode] = useState("234");
  const [phone,       setPhone]       = useState("");
  const [email,       setEmail]       = useState("");
  const [sex,         setSex]         = useState("");
  const [set,         setSet]         = useState("");
  const [region,      setRegion]      = useState("");
  const [province,    setProvince]    = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [history,     setHistory]     = useState<Submission[]>([]);

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !region.trim() || !province.trim()) return;
    setSubmitting(true);
    try {
      await createSchoolOfDisciple({
        firstName:   firstName.trim(),
        middleName:  middleName.trim() || undefined,
        lastName:    lastName.trim(),
        countryCode: countryCode.trim() || "234",
        phoneNumber: phone.trim(),
        email:       email.trim() || undefined,
        sex:         sex || undefined,
        set:         set.trim() || undefined,
        region:      region.trim() || undefined,
        province:    province.trim() || undefined,
      });
      setHistory((p) => [{
        name: `${firstName} ${lastName}`,
        phone,
        submittedAt: new Date().toLocaleTimeString(),
        status: "ok",
        message: "Student enrolled successfully — check /trainings/sod.",
      }, ...p]);
      setFirstName(""); setMiddleName(""); setLastName("");
      setPhone(""); setEmail(""); setSex(""); setSet(""); setRegion(""); setProvince("");
    } catch (e) {
      setHistory((p) => [{
        name: `${firstName} ${lastName}`,
        phone,
        submittedAt: new Date().toLocaleTimeString(),
        status: "error",
        message: e instanceof Error ? e.message : "Unknown error.",
      }, ...p]);
    } finally {
      setSubmitting(false);
    }
  };

  const inp = "w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#111827] outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]";

  return (
    <DashboardLayout>
      {/* Back + Title */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/test")} className="text-[#000080] hover:text-[#000066]">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
          <BookOpen className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-[24px] font-bold">
            SOD Enrolment{" "}
            <span className="text-sm font-semibold text-amber-600">[TEST — Real API]</span>
          </h1>
          <p className="text-sm text-[#6B7280]">
            Enrolls a student in the School of Disciples using the real backend
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
            {/* Warning */}
            <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700">
                <span className="font-semibold">Hits the real API.</span>{" "}
                Students created here will appear in{" "}
                <button
                  onClick={() => router.push("/trainings/sod")}
                  className="font-semibold underline"
                >
                  School of Disciples
                </button>
                . Do not use with fake data you don&apos;t want to keep.
              </p>
            </div>

            <h2 className="mb-1 text-base font-bold text-[#111827]">SOD Enrolment Form</h2>
            <p className="mb-5 text-xs text-[#6B7280]">Fill in the student&apos;s details to enrol them in the programme.</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">First Name *</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Middle Name</label>
                <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Middle name" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Last Name *</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Gender</label>
                <div className="relative">
                  <select value={sex} onChange={(e) => setSex(e.target.value)} className={`${inp} appearance-none pr-8`}>
                    <option value="">Prefer not to say</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Country Code *</label>
                <input value={countryCode} onChange={(e) => setCountryCode(e.target.value)} placeholder="234" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Phone Number *</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" maxLength={10} className={inp} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Set / Batch</label>
                <input value={set} onChange={(e) => setSet(e.target.value)} placeholder="e.g. A, 2024…" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Region *</label>
                <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Region 31" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Province *</label>
                <input value={province} onChange={(e) => setProvince(e.target.value)} placeholder="e.g. Province 9" className={inp} />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !firstName.trim() || !lastName.trim() || !phone.trim() || !region.trim() || !province.trim()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Enrolling…" : "Enrol Student"}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#374151]">What to Verify</h3>
            <ul className="space-y-1.5 text-xs text-[#6B7280]">
              {[
                "Student appears in School of Disciples list",
                "Name, phone, and email are correct",
                "Gender and set are saved",
                "Can mark class attendance",
                "Can mark exam attendance",
                "Can add official remark",
                "Can mark as graduated",
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span className="mt-0.5 text-[#D1D5DB]">☐</span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push("/trainings/sod")}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-medium hover:bg-[#F9FAFB]"
            >
              <ExternalLink className="h-3 w-3" /> Open School of Disciples
            </button>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#374151]">This Session</h3>
            {history.length === 0 ? (
              <p className="text-xs text-[#9CA3AF]">No enrolments yet.</p>
            ) : (
              <ul className="space-y-2">
                {history.map((h, i) => (
                  <li
                    key={i}
                    className={`rounded-lg border px-3 py-2 text-xs ${
                      h.status === "ok"
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {h.status === "ok" ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                      )}
                      <span className="font-semibold">{h.name}</span>
                    </div>
                    <p className={h.status === "ok" ? "text-green-700" : "text-red-600"}>
                      {h.message}
                    </p>
                    <p className="text-[10px] text-[#9CA3AF]">
                      {h.phone} · {h.submittedAt}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
