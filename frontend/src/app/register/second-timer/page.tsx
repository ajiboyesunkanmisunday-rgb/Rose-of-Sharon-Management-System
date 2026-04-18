"use client";

import { useState } from "react";
import Image from "next/image";

const TITLES = ["Mr", "Mrs", "Miss"];
const MARITAL_STATUS = ["Single", "Married", "Divorced", "Widowed"];
const AGE_GROUPS = ["18-25", "25-35", "35-45", "45-55", "55-65", "65+"];

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "Uganda", "South Africa", "Egypt", "Tanzania",
  "Ethiopia", "Rwanda", "Cameroon", "Morocco", "Algeria", "Sudan", "Angola",
];

const STATES = [
  "Lagos", "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT",
];

const FAVOURITE_PARTS = [
  "Praise & Worship",
  "Sermon / Preaching",
  "Prayer Session",
  "Fellowship / Community",
  "Children's Ministry",
  "Music / Choir",
  "Welcoming Atmosphere",
];

const FELLOWSHIP_OPTIONS = [
  "Hearts of Ezekiel (Men's Fellowship)",
  "Debra of Righteousness (Women's Fellowship)",
  "Young Leaders and Professionals (Youth Fellowship)",
  "Not yet",
];

const ATTEND_REGULARLY = ["Yes", "No", "Maybe"];

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

export default function RegisterSecondTimerPage() {
  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    mobileCountryCode: "+234",
    mobileNumber: "",
    whatsappCountryCode: "+234",
    whatsappNumber: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    street: "",
    city: "",
    state: "",
    country: "",
    maritalStatus: "",
    ageGroup: "",
    enjoyedWhatMadeYouComeBack: "",
    favouriteParts: "",
    fellowship: "",
    attendRegularly: "",
    prayerRequest: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Save second timer:", formData);
    alert("Second timer registration saved successfully!");
  };

  const inputStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
  const selectStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
  const labelStyles = "mb-1 block text-sm font-medium text-[#374151]";

  return (
    <div className="min-h-screen bg-white">
      {/* Logo */}
      <div className="px-8 py-6">
        <Image
          src="/rccg-logo.svg"
          alt="Rose of Sharon - RCCG"
          width={202}
          height={54}
          className="h-[54px] w-auto"
          priority
        />
      </div>

      {/* Blue Divider */}
      <div className="border-t-2 border-[#000080]" />

      {/* Content */}
      <div className="mx-auto max-w-5xl px-8 py-8">
        {/* Title */}
        <h1 className="mb-8 text-center text-[28px] font-bold text-[#000000]">
          We Are Glad You Came Back! (Second Timer)
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <h2 className="mb-6 text-base font-medium text-[#374151]">
            Enter Your Details
          </h2>

          {/* Title Radio Buttons */}
          <div className="mb-5">
            <label className={labelStyles}>Title</label>
            <div className="flex items-center gap-6 pt-1">
              {TITLES.map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
                  <input
                    type="radio"
                    name="title"
                    value={t}
                    checked={formData.title === t}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[#000080]"
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            {/* First Name */}
            <div>
              <label className={labelStyles}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className={inputStyles}
                required
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className={labelStyles}>Mobile Number</label>
              <div className="flex gap-2">
                <select
                  name="mobileCountryCode"
                  value={formData.mobileCountryCode}
                  onChange={handleChange}
                  className="w-[100px] rounded-lg border border-[#E5E7EB] px-2 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
                >
                  <option value="+234">+234</option>
                  <option value="+233">+233</option>
                  <option value="+254">+254</option>
                  <option value="+256">+256</option>
                  <option value="+27">+27</option>
                  <option value="+20">+20</option>
                  <option value="+44">+44</option>
                  <option value="+1">+1</option>
                </select>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  className={inputStyles}
                  required
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className={labelStyles}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className={inputStyles}
                required
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className={labelStyles}>WhatsApp Number</label>
              <div className="flex gap-2">
                <select
                  name="whatsappCountryCode"
                  value={formData.whatsappCountryCode}
                  onChange={handleChange}
                  className="w-[100px] rounded-lg border border-[#E5E7EB] px-2 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
                >
                  <option value="+234">+234</option>
                  <option value="+233">+233</option>
                  <option value="+254">+254</option>
                  <option value="+256">+256</option>
                  <option value="+27">+27</option>
                  <option value="+20">+20</option>
                  <option value="+44">+44</option>
                  <option value="+1">+1</option>
                </select>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  placeholder="Enter WhatsApp number"
                  className={inputStyles}
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="md:col-span-2">
              <label className={labelStyles}>Date of Birth</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  name="dobDay"
                  value={formData.dobDay}
                  onChange={handleChange}
                  className={selectStyles}
                >
                  <option value="">Day</option>
                  {days.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select
                  name="dobMonth"
                  value={formData.dobMonth}
                  onChange={handleChange}
                  className={selectStyles}
                >
                  <option value="">Month</option>
                  {months.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  name="dobYear"
                  value={formData.dobYear}
                  onChange={handleChange}
                  className={selectStyles}
                >
                  <option value="">Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <h2 className="mb-4 mt-8 text-base font-medium text-[#374151]">
            Address
          </h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            {/* Street */}
            <div>
              <label className={labelStyles}>Street</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="eg. 123 street"
                className={inputStyles}
              />
            </div>

            {/* City */}
            <div>
              <label className={labelStyles}>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city name"
                className={inputStyles}
              />
            </div>

            {/* State */}
            <div>
              <label className={labelStyles}>State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="">Select</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div>
              <label className={labelStyles}>Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="">Select</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Marital Status */}
            <div>
              <label className={labelStyles}>Marital Status</label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="">Select</option>
                {MARITAL_STATUS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Age Group */}
            <div>
              <label className={labelStyles}>Age Group</label>
              <select
                name="ageGroup"
                value={formData.ageGroup}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="">Select</option>
                {AGE_GROUPS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* What did you enjoy */}
            <div>
              <label className={labelStyles}>
                What did you enjoy that made you come back?
              </label>
              <textarea
                name="enjoyedWhatMadeYouComeBack"
                value={formData.enjoyedWhatMadeYouComeBack}
                onChange={handleChange}
                placeholder="Tell us what you enjoyed..."
                rows={4}
                className={inputStyles + " resize-none"}
              />
            </div>

            {/* Favourite parts */}
            <div>
              <label className={labelStyles}>
                What were your favourite parts of the service? Tick all that apply.
              </label>
              <select
                name="favouriteParts"
                value={formData.favouriteParts}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="">Select</option>
                {FAVOURITE_PARTS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Fellowship */}
            <div>
              <label className={labelStyles}>
                Have you joined the Hearts of Ezekiel (Men&apos;s Fellowship), Debra
                of Righteousness (Women&apos;s Fellowship) or Young Leaders and
                Professionals (Youth Fellowship)?
              </label>
              <select
                name="fellowship"
                value={formData.fellowship}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="">Select</option>
                {FELLOWSHIP_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Attend Regularly */}
            <div>
              <label className={labelStyles}>
                Would you consider attending RCCG Rose of Sharon regularly?
              </label>
              <select
                name="attendRegularly"
                value={formData.attendRegularly}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="">Select</option>
                {ATTEND_REGULARLY.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Prayer Request */}
            <div className="md:col-span-2">
              <label className={labelStyles}>Prayer Request</label>
              <textarea
                name="prayerRequest"
                value={formData.prayerRequest}
                onChange={handleChange}
                placeholder="Enter your prayer request..."
                rows={4}
                className={inputStyles + " resize-none"}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="mt-10">
            <button
              type="submit"
              className="rounded-xl bg-[#000080] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#000066]"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
