"use client";

import Image from "next/image";
import { useState } from "react";

const inputClass =
  "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none";
const labelClass = "mb-1 block text-sm font-medium text-[#374151]";
const selectClass =
  "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none appearance-none bg-white";

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const countries = [
  "Nigeria", "United Kingdom", "United States", "Canada", "Ghana",
  "South Africa", "Germany", "France", "Australia", "Other",
];

const ageGroups = ["18-25", "25-35", "35-45", "45-55", "55-65", "65+"];

const socialMediaPlatforms = ["Facebook", "Instagram", "Twitter", "TikTok"];

const occupations = [
  "Student", "Engineer", "Doctor", "Teacher", "Lawyer", "Business Owner",
  "Civil Servant", "Banker", "Nurse", "Accountant", "Pastor/Minister",
  "IT Professional", "Trader", "Artisan", "Unemployed", "Retired", "Other",
];

const howDidYouHear = [
  "Friend/Family", "Social Media", "Website", "Flyer/Poster",
  "Walk-in", "Online Service", "Outreach/Evangelism", "Other",
];

const serviceRatings = ["Excellent", "Very Good", "Good", "Fair", "Poor"];

const favouriteParts = [
  "Worship", "Sermon/Word", "Prayers", "Fellowship", "Choir/Music",
  "Children's Church", "Hospitality", "All of the above", "Other",
];

const joinGroups = [
  "Choir/Music", "Ushering", "Media/Tech", "Children's Church",
  "Protocol", "Evangelism", "Prayer Team", "Hospitality",
  "Youth Fellowship", "Men's Fellowship", "Women's Fellowship",
  "Not sure yet",
];

const contactMethods = ["Phone", "Email", "WhatsApp", "SMS"];

export default function FirstTimerPage() {
  const [title, setTitle] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    countryCode: "+234",
    mobileNumber: "",
    whatsappCountryCode: "+234",
    whatsappNumber: "",
    street: "",
    city: "",
    state: "",
    country: "",
    maritalStatus: "",
    ageGroup: "",
    socialMedia: "",
    socialMediaHandle: "",
    occupation: "",
    howDidYouHear: "",
    serviceRating: "",
    favouriteParts: "",
    worshippedOnline: "",
    attendRegularly: "",
    joinGroup: "",
    prayerRequest: "",
    preferredContact: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title, ...formData };
    console.log("First Timer Registration:", payload);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-8 pt-6">
        <Image
          src="/rccg-logo.svg"
          alt="RCCG Logo"
          width={202}
          height={54}
          priority
        />
      </div>

      {/* Blue Divider */}
      <div className="mt-4 h-[2px] w-full bg-[#000080]" />

      {/* Content */}
      <div className="mx-auto max-w-5xl px-8 py-10">
        {/* Heading */}
        <h1 className="text-center text-[28px] font-bold text-[#1F2937]">
          Getting To Know You Better (First Timer)
        </h1>

        <p className="mt-6 text-sm font-semibold text-[#374151]">
          Enter Your Details
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* Title */}
          <div>
            <label className={labelClass}>Title</label>
            <div className="mt-1 flex items-center gap-6">
              {["Mr", "Mrs", "Miss"].map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
                  <input
                    type="radio"
                    name="title"
                    value={t}
                    checked={title === t}
                    onChange={() => setTitle(t)}
                    className="h-4 w-4 accent-[#000080]"
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          {/* First Name / Email */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={inputClass}
              />
            </div>
          </div>

          {/* Last Name / Date of Birth */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  name="dobDay"
                  value={formData.dobDay}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="">Day</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  name="dobMonth"
                  value={formData.dobMonth}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="">Month</option>
                  {months.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  name="dobYear"
                  value={formData.dobYear}
                  onChange={handleChange}
                  className={selectClass}
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
          </div>

          {/* Mobile Number / WhatsApp Number */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>Mobile Number</label>
              <div className="flex gap-2">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="w-24 rounded-lg border border-[#E5E7EB] px-2 py-3 text-sm focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none appearance-none bg-white"
                >
                  <option value="+0">+0</option>
                  <option value="+234">+234</option>
                  <option value="+44">+44</option>
                  <option value="+1">+1</option>
                  <option value="+233">+233</option>
                  <option value="+27">+27</option>
                </select>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>WhatsApp Number</label>
              <div className="flex gap-2">
                <select
                  name="whatsappCountryCode"
                  value={formData.whatsappCountryCode}
                  onChange={handleChange}
                  className="w-24 rounded-lg border border-[#E5E7EB] px-2 py-3 text-sm focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none appearance-none bg-white"
                >
                  <option value="+0">+0</option>
                  <option value="+234">+234</option>
                  <option value="+44">+44</option>
                  <option value="+1">+1</option>
                  <option value="+233">+233</option>
                  <option value="+27">+27</option>
                </select>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  placeholder="Enter WhatsApp number"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Address Section Header */}
          <div className="pt-2">
            <p className="text-sm font-semibold text-[#374151]">Address</p>
          </div>

          {/* Street / City */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>Street</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Enter street address"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                className={inputClass}
              />
            </div>
          </div>

          {/* State / Country */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select state</option>
                {nigerianStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select country</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Marital Status / Age Group */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>Marital Status</label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select marital status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Age Group</label>
              <select
                name="ageGroup"
                value={formData.ageGroup}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select age group</option>
                {ageGroups.map((ag) => (
                  <option key={ag} value={ag}>
                    {ag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Social Media / Social Media Handle */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>Social Media</label>
              <select
                name="socialMedia"
                value={formData.socialMedia}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select platform</option>
                {socialMediaPlatforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Social Media Handle</label>
              <input
                type="text"
                name="socialMediaHandle"
                value={formData.socialMediaHandle}
                onChange={handleChange}
                placeholder="Enter your handle"
                className={inputClass}
              />
            </div>
          </div>

          {/* Occupation */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>Occupation</label>
              <select
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select occupation</option>
                {occupations.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* How did you hear / How was our service */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>How did you hear about our church?</label>
              <select
                name="howDidYouHear"
                value={formData.howDidYouHear}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select option</option>
                {howDidYouHear.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>How was our service?</label>
              <select
                name="serviceRating"
                value={formData.serviceRating}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select rating</option>
                {serviceRatings.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Favourite parts / Worshipped online */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                What were your favourite parts of the service?
              </label>
              <select
                name="favouriteParts"
                value={formData.favouriteParts}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select option</option>
                {favouriteParts.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>
                Have you worshipped with us online before?
              </label>
              <select
                name="worshippedOnline"
                value={formData.worshippedOnline}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Attend regularly / Join group */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                Would you consider attending RCCG Rose of Sharon regularly?
              </label>
              <select
                name="attendRegularly"
                value={formData.attendRegularly}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Maybe">Maybe</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>I would like to join:</label>
              <select
                name="joinGroup"
                value={formData.joinGroup}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select a group</option>
                {joinGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prayer Request / Preferred Contact */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>Prayer Request</label>
              <textarea
                name="prayerRequest"
                value={formData.prayerRequest}
                onChange={handleChange}
                placeholder="Enter your prayer request"
                rows={4}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Preferred means of contact</label>
              <select
                name="preferredContact"
                value={formData.preferredContact}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select option</option>
                {contactMethods.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 pb-10">
            <button
              type="submit"
              className="rounded-xl bg-[#000080] px-10 py-3 text-sm font-semibold text-white hover:bg-[#000066] transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
