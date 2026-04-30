"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import PhoneInput from "@/components/ui/PhoneInput";
import PhotoUpload from "@/components/ui/PhotoUpload";
import SpouseLinkModal from "@/components/user-management/SpouseLinkModal";
import type { SpouseData } from "@/components/user-management/SpouseLinkModal";
import { eMembers } from "@/lib/mock-data";

export default function EditEMemberPage() {
  const router = useRouter();
  const params = useParams();
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const existing = eMembers.find((m) => m.id === id) || eMembers[0];

  const [firstName, setFirstName] = useState(existing.firstName);
  const [middleName, setMiddleName] = useState(existing.middleName || "");
  const [lastName, setLastName] = useState(existing.lastName);
  const [countryCode, setCountryCode] = useState(existing.countryCode || "+234");
  const [phone, setPhone] = useState(existing.phone);
  const [email, setEmail] = useState(existing.email);
  const [dateOfBirth, setDateOfBirth] = useState(existing.dateOfBirth || "");
  const [maritalStatus, setMaritalStatus] = useState(
    existing.maritalStatus || ""
  );
  const [serviceAttended, setServiceAttended] = useState<string>(
    existing.serviceAttended || ""
  );
  const [photo, setPhoto] = useState<File | null>(null);
  const [spouse, setSpouse] = useState<SpouseData | null>(
    existing.spouse
      ? {
          name: existing.spouse.name,
          weddingDate: existing.spouse.weddingDate || "",
        }
      : null
  );
  const [showSpouseModal, setShowSpouseModal] = useState(false);

  const inputStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
  const selectStyles = inputStyles;
  const labelStyles = "mb-1 block text-sm font-medium text-[#374151]";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Edit E-Member:", id, {
      firstName,
      middleName,
      lastName,
      countryCode,
      phone,
      email,
      dateOfBirth,
      maritalStatus,
      serviceAttended,
      photo,
      spouse,
    });
    router.push(`/user-management/e-members/${id}`);
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
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
              </select>
              {maritalStatus === "Married" && (
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
          <div className="mt-8 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push(`/user-management/e-members/${id}`)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
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
