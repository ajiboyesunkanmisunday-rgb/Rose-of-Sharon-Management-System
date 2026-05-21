"use client";

/**
 * /test/guest-workflow
 *
 * Simulates a first-timer filling the guest registration form on the public
 * church website. Submits to POST /api/v1/users/first-timer — the created
 * record appears in the Guest Workflow board under "First Timers".
 */

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createFirstTimer, uploadProfilePicture } from "@/lib/api";
import {
  ArrowLeft, GitBranch, CheckCircle, ExternalLink,
  AlertTriangle, Send, ChevronDown, Camera,
} from "lucide-react";

interface Submission {
  name: string;
  phone: string;
  submittedAt: string;
  status: "ok" | "error";
  message: string;
}

const MARITAL = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "ENGAGED"];
const RATINGS  = [1, 2, 3, 4, 5];
const MEDIA    = ["Social Media", "Friend/Family", "Flyer/Poster", "Radio/TV", "Walk-in", "Online Service", "Other"];

export default function GuestWorkflowTestPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  // Personal
  const [firstName,    setFirstName]    = useState("");
  const [middleName,   setMiddleName]   = useState("");
  const [lastName,     setLastName]     = useState("");
  const [sex,          setSex]          = useState("");
  const [maritalStatus,setMaritalStatus]= useState("");
  const [occupation,   setOccupation]   = useState("");
  // Contact
  const [countryCode,  setCountryCode]  = useState("234");
  const [phone,        setPhone]        = useState("");
  const [email,        setEmail]        = useState("");
  // Visit details
  const [isVisiting,   setIsVisiting]   = useState(false);
  const [fromOnline,   setFromOnline]   = useState(false);
  const [medium,       setMedium]       = useState("");
  const [rating,       setRating]       = useState<number | "">("");
  const [favPart,      setFavPart]      = useState("");
  const [howWas,       setHowWas]       = useState("");
  // Photo
  const [photoFile,    setPhotoFile]    = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  // UI
  const [uploading,    setUploading]    = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [history,      setHistory]      = useState<Submission[]>([]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const canSubmit = !submitting && !uploading && firstName.trim() && lastName.trim() && phone.trim() && sex;

  const reset = () => {
    setFirstName(""); setMiddleName(""); setLastName(""); setSex("");
    setMaritalStatus(""); setOccupation("");
    setCountryCode("234"); setPhone(""); setEmail("");
    setIsVisiting(false); setFromOnline(false);
    setMedium(""); setRating(""); setFavPart(""); setHowWas("");
    setPhotoFile(null); setPhotoPreview(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      let profilePictureUrl: string | undefined;
      if (photoFile) {
        setUploading(true);
        profilePictureUrl = await uploadProfilePicture(photoFile);
        setUploading(false);
      }

      // Map the dropdown to a numeric rating (same mapping as admin form)
      const ratingMap: Record<string, number> = { Excellent: 5, Good: 4, Fair: 3, Poor: 2 };
      const resolvedRating =
        rating !== "" ? Number(rating) : howWas ? ratingMap[howWas] : undefined;

      await createFirstTimer({
        firstName:             firstName.trim(),
        middleName:            middleName.trim() || undefined,
        lastName:              lastName.trim(),
        countryCode:           countryCode.trim() || "234",
        phoneNumber:           phone.trim(),
        email:                 email.trim() || undefined,
        sex:                   sex || undefined,
        maritalStatus:         maritalStatus || undefined,
        occupation:            occupation.trim() || undefined,
        isVisiting:            isVisiting || undefined,
        fromOnline:            fromOnline || undefined,
        mediumOfInvitation:    medium || undefined,
        serviceRating:         resolvedRating,
        favouritePartOfService:favPart.trim() || undefined,
        profilePictureUrl,
      });

      setHistory((p) => [{
        name: `${firstName} ${lastName}`,
        phone,
        submittedAt: new Date().toLocaleTimeString(),
        status: "ok",
        message: "First-timer registered — check Guest Workflow → First Timers column.",
      }, ...p]);
      reset();
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

  const inp = "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]";
  const sel = `${inp} appearance-none pr-8`;

  return (
    <DashboardLayout>
      {/* Back + Title */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/test")} className="text-[#000080] dark:text-indigo-400 hover:text-[#000066]">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
          <GitBranch className="h-5 w-5 text-[#2563EB]" />
        </div>
        <div>
          <h1 className="text-[24px] font-bold">
            Guest Registration{" "}
            <span className="text-sm font-semibold text-[#2563EB]">[TEST — Real API]</span>
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Registers a first-timer as they would fill the public church form</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Warning */}
          <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <p className="text-xs text-blue-700">
              <span className="font-semibold">Hits the real API.</span>{" "}
              First-timers registered here will appear in{" "}
              <button onClick={() => router.push("/workflows/guest")} className="font-semibold underline">
                Guest Workflow
              </button>{" "}
              under the <strong>First Timers</strong> column.
            </p>
          </div>

          {/* Photo */}
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
            <h2 className="mb-3 text-sm font-bold text-[#111827] dark:text-slate-100">Profile Photo</h2>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="relative flex h-18 w-18 h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#D1D5DB] hover:border-[#2563EB]">
                {photoPreview
                  ? <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                  : <Camera className="h-6 w-6 text-[#9CA3AF] dark:text-slate-400" />}
              </button>
              <div>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-[#F9FAFB]">
                  {photoPreview ? "Change photo" : "Choose photo"}
                </button>
                <p className="mt-1 text-[10px] text-[#9CA3AF] dark:text-slate-400">Optional · JPG or PNG</p>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          {/* Personal */}
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
            <h2 className="mb-4 text-sm font-bold text-[#111827] dark:text-slate-100">Personal Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">First Name *</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Middle Name</label>
                <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Middle name" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Last Name *</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Gender <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={sex} onChange={(e) => setSex(e.target.value)} className={`${sel} ${!sex ? "border-red-300" : ""}`}>
                    <option value="">Select gender…</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] dark:text-slate-400" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Marital Status</label>
                <div className="relative">
                  <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className={sel}>
                    <option value="">Select…</option>
                    {MARITAL.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] dark:text-slate-400" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Occupation</label>
                <input value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Teacher" className={inp} />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
            <h2 className="mb-4 text-sm font-bold text-[#111827] dark:text-slate-100">Contact</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Country Code *</label>
                <input value={countryCode} onChange={(e) => setCountryCode(e.target.value)} placeholder="234" className={inp} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Phone Number *</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" maxLength={10} className={inp} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className={inp} />
              </div>
            </div>
          </div>

          {/* Visit Details */}
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
            <h2 className="mb-4 text-sm font-bold text-[#111827] dark:text-slate-100">Visit Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Toggles */}
              <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2.5">
                <span className="text-sm text-[#374151] dark:text-slate-300">Just visiting?</span>
                <button type="button" onClick={() => setIsVisiting(!isVisiting)}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${isVisiting ? "bg-[#2563EB]" : "bg-[#D1D5DB]"}`}>
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white dark:bg-slate-800 shadow transition-transform ${isVisiting ? "translate-x-4" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2.5">
                <span className="text-sm text-[#374151] dark:text-slate-300">Worshipped online before?</span>
                <button type="button" onClick={() => setFromOnline(!fromOnline)}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${fromOnline ? "bg-[#2563EB]" : "bg-[#D1D5DB]"}`}>
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white dark:bg-slate-800 shadow transition-transform ${fromOnline ? "translate-x-4" : "translate-x-1"}`} />
                </button>
              </div>
              {/* Medium of invitation */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">How did you hear about us?</label>
                <div className="relative">
                  <select value={medium} onChange={(e) => setMedium(e.target.value)} className={sel}>
                    <option value="">Select…</option>
                    {MEDIA.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] dark:text-slate-400" />
                </div>
              </div>
              {/* Service rating */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Service Rating (1–5)</label>
                <div className="flex gap-2">
                  {RATINGS.map((r) => (
                    <button key={r} type="button" onClick={() => setRating(r)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                        rating === r
                          ? "border-[#2563EB] bg-[#2563EB] text-white"
                          : "border-[#E5E7EB] dark:border-slate-700 text-[#374151] dark:text-slate-300 hover:border-[#2563EB]"
                      }`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              {/* Favourite part */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">Favourite part of service</label>
                <input value={favPart} onChange={(e) => setFavPart(e.target.value)} placeholder="e.g. Worship, Sermon, Prayer…" className={inp} />
              </div>
              {/* How was service */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-[#374151] dark:text-slate-300">How was the service overall?</label>
                <div className="relative">
                  <select value={howWas} onChange={(e) => setHowWas(e.target.value)} className={sel}>
                    <option value="">Select…</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] dark:text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] py-3 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {uploading ? "Uploading photo…" : submitting ? "Registering…" : "Register First-Timer"}
          </button>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#374151] dark:text-slate-300">What to Verify</h3>
            <ul className="space-y-1.5 text-xs text-[#6B7280] dark:text-slate-400">
              {[
                "Guest appears in Guest Workflow → First Timers",
                "Name and phone number are correct",
                "Photo displays (if uploaded)",
                "Follow-up can be assigned",
                "Status can move through columns",
                "Call/visit counts update",
                "Can be converted to Second Timer",
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span className="mt-0.5 text-[#D1D5DB]">☐</span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push("/workflows/guest")}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2 text-xs font-medium hover:bg-[#F9FAFB]"
            >
              <ExternalLink className="h-3 w-3" /> Open Guest Workflow
            </button>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#374151] dark:text-slate-300">This Session</h3>
            {history.length === 0 ? (
              <p className="text-xs text-[#9CA3AF] dark:text-slate-400">No registrations yet.</p>
            ) : (
              <ul className="space-y-2">
                {history.map((h, i) => (
                  <li key={i} className={`rounded-lg border px-3 py-2 text-xs ${
                    h.status === "ok" ? "border-green-200 bg-green-50 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:bg-red-900/20"
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {h.status === "ok"
                        ? <CheckCircle className="h-3 w-3 text-green-600" />
                        : <AlertTriangle className="h-3 w-3 text-red-500" />}
                      <span className="font-semibold">{h.name}</span>
                    </div>
                    <p className={h.status === "ok" ? "text-green-700" : "text-red-600"}>{h.message}</p>
                    <p className="text-[10px] text-[#9CA3AF] dark:text-slate-400">{h.phone} · {h.submittedAt}</p>
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
