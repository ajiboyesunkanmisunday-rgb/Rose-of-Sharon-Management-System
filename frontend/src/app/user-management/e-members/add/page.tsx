"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import PhoneInput from "@/components/ui/PhoneInput";
import PhotoUpload from "@/components/ui/PhotoUpload";
import SpouseLinkModal from "@/components/user-management/SpouseLinkModal";
import type { SpouseData } from "@/components/user-management/SpouseLinkModal";
import { createEMember, uploadProfilePicture } from "@/lib/api";
import { NIGERIA_STATES } from "@/lib/nigeria-states";

export default function AddEMemberPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [state, setState] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [serviceAttended, setServiceAttended] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [spouse, setSpouse] = useState<SpouseData | null>(null);
  const [showSpouseModal, setShowSpouseModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
  const selectStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10";
  const labelStyles = "mb-1 block text-sm font-medium text-[#374151]";

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Parse wedding date from spouse data when married
    let dayOfWedding: number | undefined;
    let monthOfWedding: number | undefined;
    let yearOfWedding: number | undefined;
    if (maritalStatus === "MARRIED" && spouse?.weddingDate) {
      const parts = spouse.weddingDate.split("-");
      if (parts.length === 3) {
        yearOfWedding = Number(parts[0]);
        monthOfWedding = Number(parts[1]);
        dayOfWedding = Number(parts[2]);
      }
    }

    try {
      let profilePictureUrl: string | undefined;
      if (photo) {
        profilePictureUrl = await uploadProfilePicture(photo);
      }
      await createEMember({
        firstName,
        middleName: middleName || undefined,
        lastName,
        email,
        phoneNumber: phone,
        countryCode: countryCode.replace(/^\+/, ""),
        sex: gender || undefined,
        state: state || undefined,
        country: "Nigeria",
        dayOfBirth: dobDay ? Number(dobDay) : undefined,
        monthOfBirth: dobMonth ? Number(dobMonth) : undefined,
        yearOfBirth: dobYear ? Number(dobYear) : undefined,
        maritalStatus: maritalStatus || undefined,
        profilePictureUrl,
        // serviceAttended is display-only; backend links via eventId (UUID)
        spouseId: spouse?.memberId || undefined,
        dayOfWedding,
        monthOfWedding,
        yearOfWedding,
      });
      router.push("/user-management/e-members");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save e-member.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">
          User Management
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/user-management/e-members")}
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
            Add E-Member
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

            {/* Gender */}
            <div>
              <label className={labelStyles}>
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={selectStyles}
                required
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
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
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={dobDay}
                  onChange={(e) => setDobDay(e.target.value)}
                  className={selectStyles}
                >
                  <option value="">Day</option>
                  {days.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select
                  value={dobMonth}
                  onChange={(e) => setDobMonth(e.target.value)}
                  className={selectStyles}
                >
                  <option value="">Month</option>
                  {months.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  value={dobYear}
                  onChange={(e) => setDobYear(e.target.value)}
                  className={selectStyles}
                >
                  <option value="">Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
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

            {/* State */}
            <div>
              <label className={labelStyles}>State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={selectStyles}
              >
                <option value="">Select State</option>
                {NIGERIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
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

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push("/user-management/e-members")}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Saving…" : "Add E-Member"}
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
