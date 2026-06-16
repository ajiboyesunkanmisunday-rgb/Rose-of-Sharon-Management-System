"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PublicFormLayout from "@/components/layout/PublicFormLayout";
import Button from "@/components/ui/Button";
import PhoneInput from "@/components/ui/PhoneInput";
import MultiSelect from "@/components/ui/MultiSelect";
import SpouseLinkModal from "@/components/user-management/SpouseLinkModal";
import type { SpouseData } from "@/components/user-management/SpouseLinkModal";
import { createMember, uploadProfilePicture, getAllGroups, isAuthenticated, type GroupResponse } from "@/lib/api";
import SearchableSelect from "@/components/ui/SearchableSelect";
import CountryStateSelect from "@/components/ui/CountryStateSelect";

export default function AddMemberPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPublic, setIsPublic] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Real groups from API
  const [availableGroups, setAvailableGroups] = useState<GroupResponse[]>([]);
  useEffect(() => {
    setIsPublic(!isAuthenticated());
    getAllGroups().then(setAvailableGroups).catch(() => {});
  }, []);
  const groupNames = availableGroups.map((g) => g.name);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [groups, setGroups] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [spouse, setSpouse] = useState<SpouseData | null>(null);
  const [showSpouseModal, setShowSpouseModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ② Inline validation: touched state
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (f: string) => setTouched((t) => ({ ...t, [f]: true }));
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const fieldErrors = {
    firstName: !firstName.trim() ? "First name is required" : "",
    lastName:  !lastName.trim()  ? "Last name is required"  : "",
    email:     email && !EMAIL_RE.test(email) ? "Enter a valid email address" : "",
  };
  // ① Submit disabled until required fields filled
  const isFormValid = !!firstName.trim() && !!lastName.trim() && (!email || EMAIL_RE.test(email));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const resolvedFirstName = firstName.trim();
    const resolvedLastName = lastName.trim();

    if (!resolvedFirstName || !resolvedLastName) {
      setError("Please fill in all required fields.");
      return;
    }
    if (email && !EMAIL_RE.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

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
      if (photoFile) {
        profilePictureUrl = await uploadProfilePicture(photoFile);
      }
      await createMember({
        firstName,
        middleName: middleName || undefined,
        lastName,
        email,
        phoneNumber: phone,
        countryCode: countryCode.replace(/^\+/, ""),
        sex: gender || undefined,
        dayOfBirth: dobDay ? Number(dobDay) : undefined,
        monthOfBirth: dobMonth ? Number(dobMonth) : undefined,
        yearOfBirth: dobYear ? Number(dobYear) : undefined,
        street: street || undefined,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
        maritalStatus: maritalStatus || undefined,
        profilePictureUrl,
        spouseId: spouse?.memberId || undefined,
        dayOfWedding,
        monthOfWedding,
        yearOfWedding,
        groupIds: groups.length > 0
          ? groups.map((name) => availableGroups.find((g) => g.name === name)?.id).filter(Boolean) as string[]
          : undefined,
      });
      if (!isAuthenticated()) {
        setSubmitted(true);
      } else {
        router.push("/user-management/members");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save member.";
      setError(msg);
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const inputStyles =
    "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none placeholder:text-[#9CA3AF] dark:text-slate-400 focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
  const selectStyles =
    "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10";
  const labelStyles = "mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300";

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

  // Loading state while checking auth
  if (isPublic === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#000080] border-t-transparent" />
      </div>
    );
  }

  // Success screen for public users
  if (submitted && isPublic) {
    return (
      <PublicFormLayout title="">
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#000080]">Submission Successful!</h2>
          <p className="mt-2 text-gray-600">Thank you! Your information has been recorded.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFirstName(""); setMiddleName(""); setLastName(""); setPhone(""); setEmail("");
              setGender(""); setDobDay(""); setDobMonth(""); setDobYear("");
              setStreet(""); setCity(""); setState(""); setCountry(""); setMaritalStatus("");
              setGroups([]); setPhotoPreview(null); setPhotoFile(null); setSpouse(null);
            }}
            className="mt-6 rounded-lg bg-[#000080] px-6 py-3 text-white font-medium"
          >
            Submit Another
          </button>
        </div>
      </PublicFormLayout>
    );
  }

  const formContent = (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Right Side - Profile Photo (30%) */}
          <div className="w-full lg:order-2 lg:w-[30%]">
            <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6">
              <h2 className="mb-6 text-[18px] font-bold text-[#000000] dark:text-slate-100">
                Profile Photo
              </h2>

              <label className="group flex cursor-pointer flex-col items-center">
                <span className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#D1D5DB] transition-colors group-hover:border-[#000080]">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </span>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <span className="mt-4 text-sm font-medium text-[#000080] dark:text-indigo-400 transition-colors group-hover:text-[#000066]">
                  Upload Photo
                </span>
              </label>
            </div>
          </div>

          {/* Left Side - Form (70%) */}
          <div className="w-full lg:order-1 lg:w-[70%]">
            <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6">
              <h2 className="mb-6 text-[18px] font-bold text-[#000000] dark:text-slate-100">
                Enter Details
              </h2>

              <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                {/* First Name */}
                <div>
                  <label className={labelStyles}>First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => touch("firstName")}
                    placeholder="Enter First Name"
                    className={`${inputStyles} ${touched.firstName && fieldErrors.firstName ? "border-red-400" : ""}`}
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
                    placeholder="Enter Middle Name (optional)"
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
                    placeholder="Enter Last Name"
                    className={`${inputStyles} ${touched.lastName && fieldErrors.lastName ? "border-red-400" : ""}`}
                  />
                  {touched.lastName && fieldErrors.lastName && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.lastName}</p>
                  )}
                </div>

                {/* Phone Number with country code */}
                <PhoneInput
                  label="Phone Number"
                  code={countryCode}
                  number={phone}
                  onCodeChange={setCountryCode}
                  onNumberChange={setPhone}
                  placeholder="Enter Phone Number"
                  required
                />

                {/* Email */}
                <div>
                  <label className={labelStyles}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => touch("email")}
                    placeholder="Enter Email"
                    className={`${inputStyles} ${touched.email && fieldErrors.email ? "border-red-400" : ""}`}
                  />
                  {touched.email && fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
                  )}
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
              </div>

              {/* Date of Birth */}
              <div className="mt-4">
                <label className={labelStyles}>Date of Birth</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={dobDay}
                    onChange={(e) => setDobDay(e.target.value)}
                    className={selectStyles}
                  >
                    <option value="">Day</option>
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <select
                    value={dobMonth}
                    onChange={(e) => setDobMonth(e.target.value)}
                    className={selectStyles}
                  >
                    <option value="">Month</option>
                    {months.map((m, i) => (
                      <option key={m} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <SearchableSelect
                    placeholder="Year"
                    searchPlaceholder="Search year…"
                    options={yearOptions}
                    value={dobYear}
                    onChange={setDobYear}
                  />
                </div>
              </div>

              {/* Address Section Header */}
              <h3 className="mb-4 mt-6 text-[16px] font-bold text-[#000000] dark:text-slate-100">
                Address
              </h3>

              <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                {/* Street */}
                <div>
                  <label className={labelStyles}>Street</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Enter Street"
                    className={inputStyles}
                  />
                </div>

                {/* City */}
                <div>
                  <label className={labelStyles}>City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter City"
                    className={inputStyles}
                  />
                </div>

                {/* Country / State */}
                <CountryStateSelect
                  country={country}
                  state={state}
                  onCountryChange={(c) => { setCountry(c); setState(""); }}
                  onStateChange={setState}
                  labelStyles={labelStyles}
                  inputStyles={inputStyles}
                />

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
                      className="mt-2 text-xs font-medium text-[#000080] dark:text-indigo-400 underline hover:text-[#000066]"
                    >
                      {spouse ? `Spouse: ${spouse.name} (change)` : "+ Link Spouse"}
                    </button>
                  )}
                </div>

                {/* Groups (multi-select dropdown) */}
                <MultiSelect
                  label="Groups"
                  options={groupNames}
                  value={groups}
                  onChange={setGroups}
                  placeholder={groupNames.length ? "Select Groups" : "Loading groups…"}
                  name="groups"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Save Member Button */}
              <div className="mt-6 flex justify-end">
                <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
                  {loading ? "Saving…" : "Save Member"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <SpouseLinkModal
        isOpen={showSpouseModal}
        onClose={() => setShowSpouseModal(false)}
        onSave={(data) => setSpouse(data)}
        initial={spouse || undefined}
      />
    </>
  );

  if (isPublic) {
    return (
      <PublicFormLayout title="New Member Registration" subtitle="Join our church community">
        {formContent}
      </PublicFormLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">User Management</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/user-management/members")}
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
          <h2 className="text-[22px] font-bold text-[#000080] dark:text-indigo-400">Add Member</h2>
        </div>
      </div>
      {formContent}
    </DashboardLayout>
  );
}
