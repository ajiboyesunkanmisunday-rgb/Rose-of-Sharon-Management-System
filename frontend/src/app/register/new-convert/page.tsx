"use client";

import Image from "next/image";
import { useState } from "react";
import { createNewConvert } from "@/lib/api";

const inputClass =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none";
const labelClass = "mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300";
const selectClass =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none appearance-none bg-white dark:bg-slate-800";

const countries = [
  "Nigeria", "United Kingdom", "United States", "Canada", "Ghana",
  "South Africa", "Germany", "France", "Australia", "Other",
];

const countryCodes = [
  { label: "+234 (NG)", value: "+234" },
  { label: "+44 (UK)", value: "+44" },
  { label: "+1 (US/CA)", value: "+1" },
  { label: "+233 (GH)", value: "+233" },
  { label: "+27 (ZA)", value: "+27" },
  { label: "+49 (DE)", value: "+49" },
  { label: "+33 (FR)", value: "+33" },
  { label: "+61 (AU)", value: "+61" },
];

export default function NewConvertRegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    countryCode: "+234",
    phoneNumber: "",
    email: "",
    gender: "",
    street: "",
    city: "",
    state: "",
    country: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createNewConvert({
        firstName: formData.firstName,
        middleName: formData.middleName || undefined,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        countryCode: formData.countryCode,
        email: formData.email || undefined,
        sex: formData.gender || undefined,
        street: formData.street || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-800">
        {/* Header */}
        <div className="px-8 pt-6">
          <Image
            src="/rccg-combined-logo.svg"
            alt="RCCG Rose of Sharon"
            width={202}
            height={54}
            priority
          />
        </div>
        <div className="mt-4 h-[2px] w-full bg-[#000080]" />

        <div className="mx-auto flex max-w-5xl flex-col items-center px-8 py-24 text-center">
          {/* Checkmark icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#000080]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-[#1F2937]">
            Welcome to the Family!
          </h2>
          <p className="mt-3 max-w-md text-sm text-[#6B7280] dark:text-slate-400">
            Congratulations on your decision. We are delighted to welcome you to
            RCCG Rose of Sharon. A pastor will be in touch with you soon.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setFormData({
                firstName: "",
                middleName: "",
                lastName: "",
                countryCode: "+234",
                phoneNumber: "",
                email: "",
                gender: "",
                street: "",
                city: "",
                state: "",
                country: "",
              });
            }}
            className="mt-8 rounded-xl bg-[#000080] px-8 py-3 text-sm font-semibold text-white hover:bg-[#000066] transition-colors"
          >
            Register Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-800">
      {/* Header */}
      <div className="px-8 pt-6">
        <Image
          src="/rccg-combined-logo.svg"
          alt="RCCG Rose of Sharon"
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
          New Convert Registration
        </h1>
        <p className="mt-2 text-center text-sm text-[#6B7280] dark:text-slate-400">
          We are so glad you made this decision. Please fill in your details below.
        </p>

        {/* Error Banner */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#DC2626"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <p className="mt-6 text-sm font-semibold text-[#374151] dark:text-slate-300">
          Enter Your Details
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* First Name / Last Name */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Middle Name / Phone */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                Middle Name{" "}
                <span className="font-normal text-[#9CA3AF] dark:text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                placeholder="Enter middle name"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="w-36 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-2 py-3 text-sm focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none appearance-none bg-white dark:bg-slate-800"
                >
                  {countryCodes.map((cc) => (
                    <option key={cc.value} value={cc.value}>
                      {cc.label}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className={inputClass}
                  maxLength={10}
                  required
                />
              </div>
            </div>
          </div>

          {/* Email / Gender */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                Email{" "}
                <span className="font-normal text-[#9CA3AF] dark:text-slate-400">(optional)</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Gender{" "}
                <span className="font-normal text-[#9CA3AF] dark:text-slate-400">(optional)</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Address Section */}
          <div className="pt-2">
            <p className="text-sm font-semibold text-[#374151] dark:text-slate-300">
              Address{" "}
              <span className="font-normal text-[#9CA3AF] dark:text-slate-400">(optional)</span>
            </p>
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
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                className={inputClass}
              />
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

          {/* Submit */}
          <div className="flex justify-end pt-4 pb-10">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#000080] px-10 py-3 text-sm font-semibold text-white hover:bg-[#000066] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && (
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {loading ? "Submitting..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
