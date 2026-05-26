"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import PhoneInput from "@/components/ui/PhoneInput";
import PhotoUpload from "@/components/ui/PhotoUpload";
import SpouseLinkModal from "@/components/user-management/SpouseLinkModal";
import type { SpouseData } from "@/components/user-management/SpouseLinkModal";
import { getUser, updateEMember, uploadProfilePicture, linkSpouse } from "@/lib/api";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { useEventServices } from "@/hooks/useEventServices";

export default function EditEMemberPage() {
  const router = useRouter();
  const params = useParams();
  const paramId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";
  const [id, setId] = useState(paramId);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 2] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [serviceAttended, setServiceAttended] = useState<string>("");
  const { services: eventServices, loading: servicesLoading } = useEventServices();
  const [photo, setPhoto] = useState<File | null>(null);
  const [spouse, setSpouse] = useState<SpouseData | null>(null);
  const [showSpouseModal, setShowSpouseModal] = useState(false);
  // Store fields not shown in form so they are preserved on update
  const [storedEmail, setStoredEmail]           = useState("");
  const [storedSex, setStoredSex]               = useState("");
  const [storedCountry, setStoredCountry]       = useState("");
  const [storedState, setStoredState]           = useState("");
  const [storedOccupation, setStoredOccupation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (f: string) => setTouched((t) => ({ ...t, [f]: true }));
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const fieldErrors = {
    firstName: !firstName.trim() ? "First name is required" : "",
    lastName: !lastName.trim() ? "Last name is required" : "",
    email: email && !EMAIL_RE.test(email) ? "Enter a valid email address" : "",
  };

  const isFormValid = !!firstName.trim() && !!lastName.trim();

  const populate = useCallback(async () => {
    if (!id || id.startsWith("em-")) return;
    try {
      const u = await getUser(id);
      setFirstName(u.firstName ?? "");
      setMiddleName(u.middleName ?? "");
      setLastName(u.lastName ?? "");
      setCountryCode(u.countryCode ? `+${u.countryCode}` : "+234");
      setPhone(u.phoneNumber ?? "");
      setEmail(u.email ?? "");
      setMaritalStatus(u.maritalStatus ?? "");
      setServiceAttended(u.serviceAttended ?? "");
      setStoredEmail(u.email ?? "");
      setStoredSex(u.sex ?? "");
      setStoredCountry(u.country ?? "");
      setStoredState(u.state ?? "");
      setStoredOccupation(u.occupation ?? "");
      if (u.spouse) {
        setSpouse({ name: [u.spouse.firstName, u.spouse.lastName].filter(Boolean).join(" "), weddingDate: "" });
      }
    } catch { /* silently fall back to empty fields */ }
  }, [id]);

  useEffect(() => { populate(); }, [populate]);

  const inputStyles =
    "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
  const selectStyles = inputStyles;
  const labelStyles = "mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    try {
      const rawCode = countryCode.replace("+", "");
      let profilePictureUrl: string | undefined;
      if (photo) {
        profilePictureUrl = await uploadProfilePicture(photo);
      }
      await updateEMember(id, {
        firstName: firstName || undefined,
        middleName: middleName || undefined,
        lastName: lastName || undefined,
        // email intentionally omitted — backend rejects email changes for admin accounts
        phoneNumber: phone || undefined,
        countryCode: rawCode || undefined,
        maritalStatus: maritalStatus || undefined,
        serviceAttended: serviceAttended || undefined,
        // Preserved fields — not shown in form but must be passed back to prevent backend clearing them
        email: storedEmail || undefined,
        sex: storedSex || undefined,
        country: storedCountry || undefined,
        state: storedState || undefined,
        occupation: storedOccupation || undefined,
        profilePictureUrl,
      });
      // Link spouse if one was selected in the modal
      if (spouse?.memberId) {
        try {
          await linkSpouse(id, spouse.memberId);
        } catch {
          // Non-fatal: member is updated, spouse link failed silently
        }
      }
      router.push(`/user-management/e-members/${id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to update e-member.");
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">User Management</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/user-management/e-members/${id}`)}
            className="flex items-center text-[#000080] dark:text-indigo-400 transition-colors hover:text-[#000066]"
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
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-[#000080] dark:text-indigo-400">
            Edit E-Member
          </h2>
        </div>
      </div>

      {/* Form Container */}
      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            {/* First Name */}
            <div>
              <label className={labelStyles}>First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={() => touch("firstName")}
                placeholder="Enter first name"
                className={`${inputStyles} ${touched.firstName && fieldErrors.firstName ? "border-red-400" : ""}`}
                required
              />
              {touched.firstName && fieldErrors.firstName && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.firstName}</p>
              )}
            </div>

            {/* Middle Name */}
            <div>
              <label className={labelStyles}>Middle Name</label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Enter middle name (optional)"
                className={inputStyles}
              />
            </div>

            {/* Last Name */}
            <div>
              <label className={labelStyles}>Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={() => touch("lastName")}
                placeholder="Enter last name"
                className={`${inputStyles} ${touched.lastName && fieldErrors.lastName ? "border-red-400" : ""}`}
                required
              />
              {touched.lastName && fieldErrors.lastName && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.lastName}</p>
              )}
            </div>

            {/* Phone */}
            <PhoneInput
              label="Phone Number"
              code={countryCode}
              number={phone}
              onCodeChange={setCountryCode}
              onNumberChange={setPhone}
              placeholder="Enter phone number"
              required
            />

            {/* Email — display only, not sent on update */}
            <div>
              <label className={labelStyles}>Email</label>
              <input
                type="email"
                value={email}
                readOnly
                className={`${inputStyles} cursor-not-allowed bg-[#F9FAFB] text-[#9CA3AF] dark:text-slate-400`}
                title="Email cannot be changed"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className={labelStyles}>Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={inputStyles}
              />
            </div>

            {/* Marital Status */}
            <div>
              <label className={labelStyles}>Marital Status</label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className={selectStyles}
              >
                <option value="">Select Marital Status</option>
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="WIDOWED">Widowed</option>
                <option value="DIVORCED">Divorced</option>
              </select>
              {maritalStatus.toUpperCase() === "MARRIED" && (
                <button
                  type="button"
                  onClick={() => setShowSpouseModal(true)}
                  className="mt-2 text-xs font-medium text-[#000080] dark:text-indigo-400 underline hover:text-[#000066]"
                >
                  {spouse ? `Spouse: ${spouse.name} (change)` : "+ Link Spouse"}
                </button>
              )}
            </div>

            {/* Service Attended */}
            <div>
              <label className={labelStyles}>Service Attended</label>
              <SearchableSelect
                placeholder={servicesLoading ? "Loading services..." : "Select Service"}
                searchPlaceholder="Search services..."
                options={eventServices.map((s) => ({
                  label: `${s.title ?? s.topic ?? "Event"}${s.date ? " — " + new Date(s.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""}`,
                  value: s.id,
                }))}
                value={serviceAttended}
                onChange={setServiceAttended}
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div className="mt-6">
            <PhotoUpload
              label="Profile Photo"
              value={photo}
              onChange={setPhoto}
              previewSize="md"
            />
          </div>

          {/* Buttons */}
          {submitError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">{submitError}</div>
          )}
          <div className="mt-8 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push(`/user-management/e-members/${id}`)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting || !isFormValid}>
              {submitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>

      <SpouseLinkModal
        isOpen={showSpouseModal}
        onClose={() => setShowSpouseModal(false)}
        onSave={(data) => setSpouse(data)}
        initial={spouse || undefined}
      />
    </DashboardLayout>
  );
}
