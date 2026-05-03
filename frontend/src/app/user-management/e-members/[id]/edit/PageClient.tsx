"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import PhoneInput from "@/components/ui/PhoneInput";
import PhotoUpload from "@/components/ui/PhotoUpload";
import SpouseLinkModal from "@/components/user-management/SpouseLinkModal";
import type { SpouseData } from "@/components/user-management/SpouseLinkModal";
import { getUser, updateEMember, uploadProfilePicture } from "@/lib/api";

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
  const [photo, setPhoto] = useState<File | null>(null);
  const [spouse, setSpouse] = useState<SpouseData | null>(null);
  const [showSpouseModal, setShowSpouseModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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
      if (u.spouse) {
        setSpouse({ name: [u.spouse.firstName, u.spouse.lastName].filter(Boolean).join(" "), weddingDate: "" });
      }
    } catch { /* silently fall back to empty fields */ }
  }, [id]);

  useEffect(() => { populate(); }, [populate]);

  const inputStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
  const selectStyles = inputStyles;
  const labelStyles = "mb-1 block text-sm font-medium text-[#374151]";

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
        email: email || undefined,
        phoneNumber: phone || undefined,
        countryCode: rawCode || undefined,
        maritalStatus: maritalStatus || undefined,
        serviceAttended: serviceAttended || undefined,
        profilePictureUrl,
      });
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
        <h1 className="text-[28px] font-bold text-[#000000]">User Management</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/user-management/e-members/${id}`)}
            className="flex items-center text-[#000080] transition-colors hover:text-[#000066]"
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
          <h2 className="text-[22px] font-bold text-[#000080]">
            Edit E-Member
          </h2>
        </div>
      </div>

      {/* Form Container */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            {/* First Name */}
            <div>
              <label className={labelStyles}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                className={inputStyles}
                required
              />
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
              <label className={labelStyles}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                className={inputStyles}
                required
              />
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

            {/* Email */}
            <div>
              <label className={labelStyles}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className={inputStyles}
                required
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
              {maritalStatus === "MARRIED" && (
                <button
                  type="button"
                  onClick={() => setShowSpouseModal(true)}
                  className="mt-2 text-xs font-medium text-[#000080] underline hover:text-[#000066]"
                >
                  {spouse ? `Spouse: ${spouse.name} (change)` : "+ Link Spouse"}
                </button>
              )}
            </div>

            {/* Service Attended */}
            <div>
              <label className={labelStyles}>Service Attended</label>
              <select
                value={serviceAttended}
                onChange={(e) => setServiceAttended(e.target.value)}
                className={selectStyles}
              >
                <option value="">Select Service</option>
                <option value="Sunday">Sunday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Special Service">Special Service</option>
              </select>
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
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
          )}
          <div className="mt-8 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push(`/user-management/e-members/${id}`)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
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
