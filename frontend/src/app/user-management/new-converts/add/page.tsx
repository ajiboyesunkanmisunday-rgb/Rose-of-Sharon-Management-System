"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

export default function AddNewConvertPage() {
  const router = useRouter();

  const [title, setTitle] = useState("Mr");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [socialMedia, setSocialMedia] = useState("");
  const [socialMediaHandle, setSocialMediaHandle] = useState("");
  const [occupation, setOccupation] = useState("");
  const [howDidYouHear, setHowDidYouHear] = useState("");
  const [howWasService, setHowWasService] = useState("");
  const [favouriteParts, setFavouriteParts] = useState("");
  const [worshippedOnline, setWorshippedOnline] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit new convert form");
    router.push("/user-management/new-converts");
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
          <h2 className="text-[22px] font-bold text-[#000080]">Add New Convert</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Enter Details Section */}
        <div className="mb-8 rounded-xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="mb-6 text-[18px] font-bold text-[#000000]">
            Enter Details
          </h2>

          {/* Title */}
          <div className="mb-6">
            <label className={labelStyles}>Title</label>
            <div className="flex items-center gap-6">
              {["Mr", "Mrs", "Miss"].map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm text-[#374151]">
                  <input
                    type="radio"
                    name="title"
                    value={option}
                    checked={title === option}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-4 w-4 text-[#000080] focus:ring-[#000080]"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Two-column grid */}
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

            {/* Mobile Number */}
            <div>
              <label className={labelStyles}>Mobile Number</label>
              <div className="flex overflow-hidden rounded-lg border border-[#E5E7EB] focus-within:border-[#000080] focus-within:ring-1 focus-within:ring-[#000080]">
                <span className="flex items-center bg-gray-50 px-3 text-sm text-[#6B7280]">
                  +0
                </span>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Enter Mobile Number"
                  className="w-full border-none px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className={labelStyles}>WhatsApp Number</label>
              <div className="flex overflow-hidden rounded-lg border border-[#E5E7EB] focus-within:border-[#000080] focus-within:ring-1 focus-within:ring-[#000080]">
                <span className="flex items-center bg-gray-50 px-3 text-sm text-[#6B7280]">
                  +0
                </span>
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="Enter WhatsApp Number"
                  className="w-full border-none px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="mb-8 rounded-xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="mb-6 text-[18px] font-bold text-[#000000]">Address</h2>

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

            {/* State */}
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

            {/* Country */}
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
            </div>

            {/* Age Group */}
            <div>
              <label className={labelStyles}>Age Group</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className={selectStyles}
              >
                <option value="">Select Age Group</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-45">36-45</option>
                <option value="46-55">46-55</option>
                <option value="56-65">56-65</option>
                <option value="65+">65+</option>
              </select>
            </div>

            {/* Social Media */}
            <div>
              <label className={labelStyles}>Social Media</label>
              <select
                value={socialMedia}
                onChange={(e) => setSocialMedia(e.target.value)}
                className={selectStyles}
              >
                <option value="">Select Social Media</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="Twitter">Twitter</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="TikTok">TikTok</option>
              </select>
            </div>

            {/* Social Media Handle */}
            <div>
              <label className={labelStyles}>Social Media Handle</label>
              <input
                type="text"
                value={socialMediaHandle}
                onChange={(e) => setSocialMediaHandle(e.target.value)}
                placeholder="Enter Social Media Handle"
                className={inputStyles}
              />
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

            {/* Empty cell for alignment */}
            <div />

            {/* How did you hear about our church */}
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

            {/* How was our service */}
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

            {/* Favourite parts of the service */}
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

            {/* Worshipped online before */}
            <div>
              <label className={labelStyles}>
                Have you worshipped with us online before?
              </label>
              <select
                value={worshippedOnline}
                onChange={(e) => setWorshippedOnline(e.target.value)}
                className={selectStyles}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary">
            Save
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
