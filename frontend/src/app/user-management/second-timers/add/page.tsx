"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PublicFormLayout from "@/components/layout/PublicFormLayout";
import Button from "@/components/ui/Button";
import PhoneInput from "@/components/ui/PhoneInput";
import PhotoUpload from "@/components/ui/PhotoUpload";
import SpouseLinkModal from "@/components/user-management/SpouseLinkModal";
import type { SpouseData } from "@/components/user-management/SpouseLinkModal";
import { createSecondTimer, uploadProfilePicture, isAuthenticated } from "@/lib/api";
import SearchableSelect from "@/components/ui/SearchableSelect";
import CountryStateSelect from "@/components/ui/CountryStateSelect";
import { useEventServices } from "@/hooks/useEventServices";

export default function AddSecondTimerPage() {
  const router = useRouter();

  const [isPublic, setIsPublic] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [phone, setPhone] = useState("");
  const [whatsappCode, setWhatsappCode] = useState("+234");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [occupation, setOccupation] = useState("");
  const [isVisiting, setIsVisiting] = useState(false);
  const [serviceAttended, setServiceAttended] = useState("");
  const { services: eventServices, loading: servicesLoading } = useEventServices();
  const [howDidYouHear, setHowDidYouHear] = useState("");
  const [howWasService, setHowWasService] = useState("");
  const [favouriteParts, setFavouriteParts] = useState("");
  const [worshippedOnline, setWorshippedOnline] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [spouse, setSpouse] = useState<SpouseData | null>(null);
  const [showSpouseModal, setShowSpouseModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsPublic(!isAuthenticated());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let profilePictureUrl: string | undefined;
      if (photo) {
        profilePictureUrl = await uploadProfilePicture(photo);
      }

      await createSecondTimer({
        firstName,
        middleName: middleName || undefined,
        lastName,
        email: email || undefined,
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
        occupation: occupation || undefined,
        profilePictureUrl,
        isVisiting: isVisiting || undefined,
        mediumOfInvitation: howDidYouHear || undefined,
        howWasService: howWasService || undefined,
        favouritePartOfService: favouriteParts || undefined,
        fromOnline: worshippedOnline || undefined,
        eventId: serviceAttended || undefined,
      });
      if (!isAuthenticated()) {
        setSubmitted(true);
      } else {
        router.push("/user-management/second-timers");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save second timer.");
      setLoading(false);
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
              setFirstName(""); setMiddleName(""); setLastName(""); setGender(""); setEmail("");
              setPhone(""); setWhatsappNumber(""); setDobDay(""); setDobMonth(""); setDobYear("");
              setStreet(""); setCity(""); setState(""); setCountry(""); setMaritalStatus("");
              setOccupation(""); setServiceAttended(""); setIsVisiting(false);
              setHowDidYouHear(""); setHowWasService(""); setFavouriteParts(""); setWorshippedOnline(false);
              setPhoto(null); setSpouse(null);
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
        {/* Enter Details Section */}
        <div className="mb-8 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6">
          <h2 className="mb-6 text-[18px] font-bold text-[#000000] dark:text-slate-100">
            Enter Details
          </h2>

          {/* Is visiting checkbox */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-[#374151] dark:text-slate-300">
              <input
                type="checkbox"
                checked={isVisiting}
                onChange={(e) => setIsVisiting(e.target.checked)}
                className="h-4 w-4 rounded border-[#E5E7EB] dark:border-slate-700 text-[#000080] dark:text-indigo-400 focus:ring-[#000080]"
              />
              Is visiting?
            </label>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            <div>
              <label className={labelStyles}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter First Name"
                className={inputStyles}
              />
            </div>
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
            <div>
              <label className={labelStyles}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter Last Name"
                className={inputStyles}
              />
            </div>
            <PhoneInput
              label="Mobile Number"
              code={countryCode}
              number={phone}
              onCodeChange={setCountryCode}
              onNumberChange={setPhone}
              placeholder="Enter Mobile Number"
            />
            <div>
              <label className={labelStyles}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                className={inputStyles}
              />
            </div>
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
            <PhoneInput
              label="WhatsApp Number"
              code={whatsappCode}
              number={whatsappNumber}
              onCodeChange={setWhatsappCode}
              onNumberChange={setWhatsappNumber}
              placeholder="Enter WhatsApp Number"
            />

            {/* Select Service */}
            <div>
              <label className={labelStyles}>Select Service</label>
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

          <div className="mt-6">
            <PhotoUpload
              label="Profile Photo"
              value={photo}
              onChange={setPhoto}
              previewSize="md"
            />
          </div>
        </div>

        {/* Address Section */}
        <div className="mb-8 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6">
          <h2 className="mb-6 text-[18px] font-bold text-[#000000] dark:text-slate-100">Address</h2>

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
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
            <CountryStateSelect
              country={country}
              state={state}
              onCountryChange={(c) => { setCountry(c); setState(""); }}
              onStateChange={setState}
              labelStyles={labelStyles}
              inputStyles={inputStyles}
            />
          </div>
        </div>

        {/* More Details Section */}
        <div className="mb-8 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
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
                <option value="SEPARATED">Separated</option>
                <option value="DIVORCED">Divorced</option>
                <option value="SINGLE_PARENT">Single Parent</option>
                <option value="WIDOWED">Widowed</option>
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
            <div>
              <label className={labelStyles}>Occupation</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Enter occupation"
                className={inputStyles}
              />
            </div>
            <div>
              <label className={labelStyles}>
                How did you hear about our church?
              </label>
              <select
                value={howDidYouHear}
                onChange={(e) => setHowDidYouHear(e.target.value)}
                className={selectStyles}
              >
                <option value="">Select</option>
                <option value="Friends & Family">Friends &amp; Family</option>
                <option value="Billboard">Billboard</option>
                <option value="Flyer">Flyer</option>
                <option value="Crusade">Crusade</option>
                <option value="TV & Radio">TV &amp; Radio</option>
                <option value="Social Media">Social Media</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div>
              <label className={labelStyles}>How was our service?</label>
              <select
                value={howWasService}
                onChange={(e) => setHowWasService(e.target.value)}
                className={selectStyles}
              >
                <option value="">Select</option>
                <option value="Average">Average</option>
                <option value="Good">Good</option>
                <option value="Very Good">Very Good</option>
                <option value="Excellent">Excellent</option>
              </select>
            </div>
            <div>
              <label className={labelStyles}>
                What were your favourite parts of the service?
              </label>
              <select
                value={favouriteParts}
                onChange={(e) => setFavouriteParts(e.target.value)}
                className={selectStyles}
              >
                <option value="">Select</option>
                <option value="Music">Music</option>
                <option value="Media">Media</option>
                <option value="Sermon">Sermon</option>
                <option value="Ambience">Ambience</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Friendliness">Friendliness</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm text-[#374151] dark:text-slate-300">
              <input
                type="checkbox"
                checked={worshippedOnline}
                onChange={(e) => setWorshippedOnline(e.target.checked)}
                className="h-4 w-4 rounded border-[#E5E7EB] dark:border-slate-700 text-[#000080] dark:text-indigo-400 focus:ring-[#000080]"
              />
              Have you worshipped with us online before?
            </label>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Saving…" : "Save"}
          </Button>
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
      <PublicFormLayout title="Second Timer Registration" subtitle="Welcome back! Please fill in your details">
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
            onClick={() => router.back()}
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
          <h2 className="text-[22px] font-bold text-[#000080] dark:text-indigo-400">Add Second Timer</h2>
        </div>
      </div>
      {formContent}
    </DashboardLayout>
  );
}
