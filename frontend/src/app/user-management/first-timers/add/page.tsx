"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import PhoneInput from "@/components/ui/PhoneInput";
import PhotoUpload from "@/components/ui/PhotoUpload";
import SpouseLinkModal from "@/components/user-management/SpouseLinkModal";
import type { SpouseData } from "@/components/user-management/SpouseLinkModal";

export default function AddFirstTimerPage() {
  const router = useRouter();

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
  const [serviceAttended, setServiceAttended] = useState("");
  const [isVisiting, setIsVisiting] = useState(false);
  const [howDidYouHear, setHowDidYouHear] = useState("");
  const [howWasService, setHowWasService] = useState("");
  const [favouriteParts, setFavouriteParts] = useState("");
  const [worshippedOnline, setWorshippedOnline] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [spouse, setSpouse] = useState<SpouseData | null>(null);
  const [showSpouseModal, setShowSpouseModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit first timer form", {
      firstName,
      middleName,
      lastName,
      gender,
      email,
      countryCode,
      phone,
      whatsappCode,
      whatsappNumber,
      dob: `${dobDay}/${dobMonth}/${dobYear}`,
      street,
      city,
      state,
      country,
      maritalStatus,
      occupation,
      serviceAttended,
      isVisiting,
      howDidYouHear,
      howWasService,
      favouriteParts,
      worshippedOnline,
      photo,
      spouse,
    });
    router.push("/user-management/first-timers");
  };

  const inputStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
  const selectStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10";
  const labelStyles = "mb-1 block text-sm font-medium text-[#374151]";

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">User Management</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
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
          <h2 className="text-[22px] font-bold text-[#000080]">Add First Timer</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Enter Details Section */}
        <div className="mb-8 rounded-xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="mb-6 text-[18px] font-bold text-[#000000]">
            Enter Details
          </h2>

          {/* Is visiting checkbox */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-[#374151]">
              <input
                type="checkbox"
                checked={isVisiting}
                onChange={(e) => setIsVisiting(e.target.checked)}
                className="h-4 w-4 rounded border-[#E5E7EB] text-[#000080] focus:ring-[#000080]"
              />
              Is visiting?
            </label>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            {/* First Name */}
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
              <label className={labelStyles}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter Last Name"
                className={inputStyles}
              />
            </div>

            {/* Phone Number */}
            <PhoneInput
              label="Mobile Number"
              code={countryCode}
              number={phone}
              onCodeChange={setCountryCode}
              onNumberChange={setPhone}
              placeholder="Enter Mobile Number"
            />

            {/* Email */}
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

            {/* Gender */}
            <div>
              <label className={labelStyles}>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={selectStyles}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
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
                <select
                  value={dobYear}
                  onChange={(e) => setDobYear(e.target.value)}
                  className={selectStyles}
                >
                  <option value="">Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* WhatsApp Number */}
            <PhoneInput
              label="WhatsApp Number"
              code={whatsappCode}
              number={whatsappNumber}
              onCodeChange={setWhatsappCode}
              onNumberChange={setWhatsappNumber}
              placeholder="Enter WhatsApp Number"
            />
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
        </div>

        {/* Address Section */}
        <div className="mb-8 rounded-xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="mb-6 text-[18px] font-bold text-[#000000]">Address</h2>

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
            <div>
              <label className={labelStyles}>State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={selectStyles}
              >
                <option value="">Select State</option>
                <option value="Lagos">Lagos</option>
                <option value="Abuja">Abuja</option>
                <option value="Rivers">Rivers</option>
                <option value="Oyo">Oyo</option>
                <option value="Kano">Kano</option>
                <option value="Enugu">Enugu</option>
                <option value="Delta">Delta</option>
                <option value="Ogun">Ogun</option>
              </select>
            </div>
            <div>
              <label className={labelStyles}>Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={selectStyles}
              >
                <option value="">Select Country</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Ghana">Ghana</option>
                <option value="Kenya">Kenya</option>
                <option value="South Africa">South Africa</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
              </select>
            </div>
          </div>
        </div>

        {/* More Details Section */}
        <div className="mb-8 rounded-xl border border-[#E5E7EB] bg-white p-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
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
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
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

            {/* Select Service */}
            <div>
              <label className={labelStyles}>Select Service</label>
              <select
                value={serviceAttended}
                onChange={(e) => setServiceAttended(e.target.value)}
                className={selectStyles}
              >
                <option value="">Select Service</option>
                <option value="Sunday Service">Sunday Service</option>
                <option value="Wednesday Bible Study">Wednesday Bible Study</option>
                <option value="Friday Prayer Meeting">Friday Prayer Meeting</option>
                <option value="Special Service">Special Service</option>
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label className={labelStyles}>Occupation</label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className={selectStyles}
              >
                <option value="">Select Occupation</option>
                <option value="Student">Student</option>
                <option value="Engineer">Engineer</option>
                <option value="Doctor">Doctor</option>
                <option value="Teacher">Teacher</option>
                <option value="Business Owner">Business Owner</option>
                <option value="Tech">Tech</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* How did you hear */}
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
                <option value="Social Media">Social Media</option>
                <option value="Friend/Family">Friend/Family</option>
                <option value="Website">Website</option>
                <option value="Outreach">Outreach</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* How was service */}
            <div>
              <label className={labelStyles}>How was our service?</label>
              <select
                value={howWasService}
                onChange={(e) => setHowWasService(e.target.value)}
                className={selectStyles}
              >
                <option value="">Select</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            {/* Favourite parts */}
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
                <option value="Worship">Worship</option>
                <option value="Sermon">Sermon</option>
                <option value="Fellowship">Fellowship</option>
                <option value="Prayer">Prayer</option>
                <option value="All">All</option>
              </select>
            </div>
          </div>

          {/* Worshipped online checkbox */}
          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm text-[#374151]">
              <input
                type="checkbox"
                checked={worshippedOnline}
                onChange={(e) => setWorshippedOnline(e.target.checked)}
                className="h-4 w-4 rounded border-[#E5E7EB] text-[#000080] focus:ring-[#000080]"
              />
              Have you worshipped with us online before?
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary">
            Submit
          </Button>
        </div>
      </form>

      <SpouseLinkModal
        isOpen={showSpouseModal}
        onClose={() => setShowSpouseModal(false)}
        onSave={(data) => setSpouse(data)}
        initial={spouse || undefined}
      />
    </DashboardLayout>
  );
}
