"use client";

/**
 * /trainings/sod/test
 *
 * Test page for School of Disciples enrolment.
 * Submits real API calls — students created here appear in /trainings/sod.
 */

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createSchoolOfDisciple, uploadProfilePicture } from "@/lib/api";
import {
  ArrowLeft, BookOpen, CheckCircle, ExternalLink,
  AlertTriangle, Send, ChevronDown, Camera,
} from "lucide-react";

interface Submission {
  name: string;
  phone: string;
  submittedAt: string;
  status: "ok" | "error";
  message: string;
}

const MARITAL_STATUSES = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"];

export default function SodTestPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Personal
  const [firstName,      setFirstName]      = useState("");
  const [middleName,     setMiddleName]     = useState("");
  const [lastName,       setLastName]       = useState("");
  const [sex,            setSex]            = useState("");
  const [dateOfBirth,    setDateOfBirth]    = useState("");
  const [maritalStatus,  setMaritalStatus]  = useState("");
  const [nationality,    setNationality]    = useState("");
  const [stateOfOrigin,  setStateOfOrigin]  = useState("");
  const [homeTown,       setHomeTown]       = useState("");
  const [occupation,     setOccupation]     = useState("");
  // Contact
  const [countryCode,    setCountryCode]    = useState("234");
  const [phone,          setPhone]          = useState("");
  const [email,          setEmail]          = useState("");
  // Church
  const [set,            setSet]            = useState("");
  const [region,         setRegion]         = useState("");
  const [province,       setProvince]       = useState("");
  const [centre,         setCentre]         = useState("");
  // Photo
  const [photoFile,      setPhotoFile]      = useState<File | null>(null);
  const [photoPreview,   setPhotoPreview]   = useState<string | null>(null);
  // UI state
  const [uploading,      setUploading]      = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [history,        setHistory]        = useState<Submission[]>([]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const canSubmit =
    !submitting && !uploading &&
    !!photoFile &&
    firstName.trim() && lastName.trim() &&
    phone.trim() &&
    dateOfBirth &&
    maritalStatus &&
    nationality.trim() &&
    stateOfOrigin.trim() &&
    homeTown.trim() &&
    occupation.trim() &&
    region.trim() && province.trim() && centre.trim();

  const resetForm = () => {
    setFirstName(""); setMiddleName(""); setLastName("");
    setSex(""); setDateOfBirth(""); setMaritalStatus("");
    setNationality(""); setStateOfOrigin(""); setHomeTown(""); setOccupation("");
    setCountryCode("234"); setPhone(""); setEmail("");
    setSet(""); setRegion(""); setProvince(""); setCentre("");
    setPhotoFile(null); setPhotoPreview(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      setUploading(true);
      const profilePictureUrl = await uploadProfilePicture(photoFile!);
      setUploading(false);

      await createSchoolOfDisciple({
        firstName:       firstName.trim(),
        middleName:      middleName.trim() || undefined,
        lastName:        lastName.trim(),
        sex:             sex || undefined,
        dateOfBirth:     dateOfBirth,
        maritalStatus:   maritalStatus,
        nationality:     nationality.trim(),
        stateOfOrigin:   stateOfOrigin.trim(),
        homeTown:        homeTown.trim(),
        occupation:      occupation.trim(),
        countryCode:     countryCode.trim() || "234",
        phoneNumber:     phone.trim(),
        email:           email.trim() || undefined,
        set:             set.trim() || undefined,
        region:          region.trim(),
        province:        province.trim(),
        centre:          centre.trim(),
        profilePictureUrl,
      });
      setHistory((p) => [{
        name: `${firstName} ${lastName}`,
        phone,
        submittedAt: new Date().toLocaleTimeString(),
        status: "ok",
        message: "Student enrolled successfully — check /trainings/sod.",
      }, ...p]);
      resetForm();
    } catch (e) {
      setUploading(false);
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
  const sel = `${inp} appearance-none pr-8`;

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
          <p className="text-sm text-[#6B7280]">Enrolls a student in the School of Disciples using the real backend</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Warning */}
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700">
              <span className="font-semibold">Hits the real API.</span>{" "}
              Students created here will appear in{" "}
              <button onClick={() => router.push("/trainings/sod")} className="font-semibold underline">
                School of Disciples
              </button>
              . Do not use with fake data you don&apos;t want to keep.
            </p>
          </div>

          {/* Photo */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
            <h2 className="mb-4 text-sm font-bold text-[#111827]">Profile Photo *</h2>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#D1D5DB] hover:border-[#D97706]">
                {photoPreview
                  ? <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                  : <Camera className="h-7 w-7 text-[#9CA3AF]" />}
              </button>
              <div>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium hover:bg-[#F9FAFB]">
                  {photoPreview ? "Change photo" : "Choose photo"}
                </button>
                <p className="mt-1 text-[10px] text-[#9CA3AF]">Required · JPG or PNG</p>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          {/* Personal */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
            <h2 className="mb-4 text-sm font-bold text-[#111827]">Personal Details</h2>
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
                  <select value={sex} onChange={(e) => setSex(e.target.value)} className={sel}>
                    <option value="">Prefer not to say</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Date of Birth *</label>
                <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Marital Status *</label>
                <div className="relative">
                  <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className={sel}>
                    <option value="">Select…</option>
                    {MARITAL_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Nationality *</label>
                <input value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="e.g. Nigerian" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">State of Origin *</label>
                <input value={stateOfOrigin} onChange={(e) => setStateOfOrigin(e.target.value)} placeholder="e.g. Lagos" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Home Town *</label>
                <input value={homeTown} onChange={(e) => setHomeTown(e.target.value)} placeholder="e.g. Ikeja" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Occupation *</label>
                <input value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Teacher" className={inp} />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
            <h2 className="mb-4 text-sm font-bold text-[#111827]">Contact</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>
          </div>

          {/* Church */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
            <h2 className="mb-4 text-sm font-bold text-[#111827]">Church Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Set / Batch</label>
                <input value={set} onChange={(e) => setSet(e.target.value)} placeholder="e.g. 2026" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Region *</label>
                <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Region 35" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Province *</label>
                <input value={province} onChange={(e) => setProvince(e.target.value)} placeholder="e.g. Province 9" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">Centre *</label>
                <input value={centre} onChange={(e) => setCentre(e.target.value)} placeholder="e.g. Rose of Sharon" className={inp} />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {uploading ? "Uploading photo…" : submitting ? "Enrolling…" : "Enrol Student"}
          </button>
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
                "Profile photo displays correctly",
                "Date of birth is correct",
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
            <button
              onClick={() => router.push("/trainings/sod/form")}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#000080] bg-[#EFF6FF] px-3 py-2 text-xs font-semibold text-[#000080] hover:bg-[#DBEAFE]"
            >
              <ExternalLink className="h-3 w-3" /> Print Application Form
            </button>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#374151]">This Session</h3>
            {history.length === 0 ? (
              <p className="text-xs text-[#9CA3AF]">No enrolments yet.</p>
            ) : (
              <ul className="space-y-2">
                {history.map((h, i) => (
                  <li key={i} className={`rounded-lg border px-3 py-2 text-xs ${
                    h.status === "ok" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {h.status === "ok"
                        ? <CheckCircle className="h-3 w-3 text-green-600" />
                        : <AlertTriangle className="h-3 w-3 text-red-500" />}
                      <span className="font-semibold">{h.name}</span>
                    </div>
                    <p className={h.status === "ok" ? "text-green-700" : "text-red-600"}>{h.message}</p>
                    <p className="text-[10px] text-[#9CA3AF]">{h.phone} · {h.submittedAt}</p>
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
