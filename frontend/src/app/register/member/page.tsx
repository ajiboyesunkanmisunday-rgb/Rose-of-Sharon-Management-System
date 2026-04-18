"use client";

import { useState } from "react";
import Image from "next/image";

const GENDERS = ["Male", "Female"];
const MARITAL_STATUS = ["Single", "Married", "Divorced", "Widowed"];
const GROUPS = ["Choir", "Ushering", "Technical", "Protocol", "Media", "Children", "Youth", "Prayer"];

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

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

export default function RegisterMemberPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    gender: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    street: "",
    city: "",
    state: "",
    country: "",
    maritalStatus: "",
    group: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Save member:", { ...formData, photo: photoFile });
    alert("Member saved successfully!");
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

      {/* Divider */}
      <div className="border-t border-[#E5E7EB]" />

      {/* Content */}
      <div className="mx-auto max-w-5xl px-8 py-8">
        {/* Title + Photo Upload */}
        <div className="mb-8 flex items-start justify-between">
          <h1 className="text-[28px] font-bold text-[#000000]">Add Member</h1>

          {/* Profile Photo */}
          <div className="text-center">
            <p className={labelStyles}>Profile Photo</p>
            <label className="mt-2 flex h-[120px] w-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E5E7EB] bg-white transition-colors hover:border-[#000080]">
              {photoFile ? (
                <img
                  src={URL.createObjectURL(photoFile)}
                  alt="Preview"
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span className="mt-1 text-xs text-[#9CA3AF]">
                    Upload Photo
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <h2 className="mb-6 text-base font-medium text-[#374151]">
            Enter Details
          </h2>

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

            {/* Phone Number */}
            <div>
              <label className={labelStyles}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className={inputStyles}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className={labelStyles}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className={inputStyles}
                required
              />
            </div>
          </div>

          {/* Address Section */}
          <h2 className="mb-4 mt-8 text-base font-medium text-[#374151]">
            Address
          </h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
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

            {/* Gender */}
            <div>
              <label className={labelStyles}>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="">Select</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className={labelStyles}>Date of Birth</label>
              <div className="flex gap-2">
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
          </div>

          {/* Bottom Fields */}
          <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
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

            {/* Group */}
            <div>
              <label className={labelStyles}>Group</label>
              <select
                name="group"
                value={formData.group}
                onChange={handleChange}
                className={selectStyles}
              >
                <option value="">No yet</option>
                {GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-10">
            <button
              type="submit"
              className="rounded-xl bg-[#000080] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#000066]"
            >
              Save Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
