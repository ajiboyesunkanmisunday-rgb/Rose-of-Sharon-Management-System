"use client";

import { useState } from "react";
import Image from "next/image";
import SearchableSelect from "@/components/ui/SearchableSelect";
import {
  createSecondTimer,
  createPrayerRequest,
  createSuggestion,
} from "@/lib/api";

const MARITAL_STATUS = ["Single", "Married", "Separated", "Divorced", "Single Parent", "Widowed"];

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "Uganda", "South Africa", "Egypt", "Tanzania",
  "Ethiopia", "Rwanda", "Cameroon", "Morocco", "Algeria", "Sudan", "Angola",
  "United Kingdom", "United States", "Canada", "Germany", "France", "Australia", "Other",
];

const STATES = [
  "Lagos", "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara", "FCT",
];

const FAVOURITE_PARTS = [
  "Music", "Media", "Sermon", "Ambience", "Hospitality", "Friendliness",
];

const ATTEND_REGULARLY = ["Yes", "No", "Maybe"];

const ENJOYED_OPTIONS = ["Hospitality", "First call", "SMS"];

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

export default function RegisterSecondTimerPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileCountryCode: "+234",
    mobileNumber: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    street: "",
    city: "",
    state: "",
    country: "",
    maritalStatus: "",
    favouriteParts: "",
    attendRegularly: "",
    prayerRequest: "",
    suggestions: "",
  });

  // Checkboxes for "What did you enjoy"
  const [enjoyedChecked, setEnjoyedChecked] = useState<Record<string, boolean>>({
    Hospitality: false,
    "First call": false,
    SMS: false,
    Other: false,
  });
  const [enjoyedOther, setEnjoyedOther] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEnjoyed = (option: string) => {
    setEnjoyedChecked((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.mobileNumber.trim()) {
      setSubmitError("First Name, Last Name, and Mobile Number are required.");
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    try {
      // Normalise phone: strip non-digits, remove leading 0
      const normalisePhone = (raw: string) => {
        let n = raw.trim().replace(/\D/g, "");
        if (n.startsWith("0")) n = n.slice(1);
        return n;
      };

      // Build enjoyed string from checkboxes
      const enjoyedParts = ENJOYED_OPTIONS.filter((o) => enjoyedChecked[o]);
      if (enjoyedChecked["Other"] && enjoyedOther.trim()) {
        enjoyedParts.push(enjoyedOther.trim());
      }
      const enjoyedStr = enjoyedParts.join(", ");

      const countryCodeNum = formData.mobileCountryCode.replace(/\D/g, "");

      const body = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        countryCode: countryCodeNum,
        phoneNumber: normalisePhone(formData.mobileNumber),
        dayOfBirth: formData.dobDay ? Number(formData.dobDay) : undefined,
        monthOfBirth: formData.dobMonth ? Number(formData.dobMonth) : undefined,
        yearOfBirth: formData.dobYear ? Number(formData.dobYear) : undefined,
        street: formData.street.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        maritalStatus: formData.maritalStatus || undefined,
        mediumOfInvitation: enjoyedStr || undefined,
        favouritePartOfService: formData.favouriteParts || undefined,
      };

      const created = await createSecondTimer(body);

      // Submit prayer request if provided
      if (formData.prayerRequest.trim() && created?.id) {
        try {
          await createPrayerRequest({
            userId: created.id,
            subject: "Prayer Request",
            content: formData.prayerRequest.trim(),
          });
        } catch {
          // Non-fatal
        }
      }

      // Submit suggestion if provided
      if (formData.suggestions.trim() && created?.id) {
        try {
          await createSuggestion({
            userId: created.id,
            subject: "Suggestion",
            content: formData.suggestions.trim(),
          });
        } catch {
          // Non-fatal
        }
      }

      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyles =
    "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080] bg-white dark:bg-slate-800";
  const selectStyles =
    "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080] bg-white dark:bg-slate-800";
  const labelStyles = "mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300";

  if (submitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-800 flex flex-col items-center justify-center px-8">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <Image src="/rccg-logo.svg" alt="RCCG Logo" width={160} height={43} priority />
          </div>
          <div className="rounded-2xl border border-green-200 bg-green-50 p-8">
            <div className="mb-3 text-4xl">🎉</div>
            <h2 className="text-xl font-bold text-green-800 mb-2">Welcome Back!</h2>
            <p className="text-sm text-green-700">
              Thank you for returning. We are so glad you came back and hope to continue seeing you!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-800">
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
        <h1 className="mb-8 text-center text-[28px] font-bold text-[#000000] dark:text-slate-100">
          We Are Glad You Came Back! (Second Timer)
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <h2 className="mb-6 text-base font-medium text-[#374151] dark:text-slate-300">
            Enter Your Details
          </h2>

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            {/* First Name */}
            <div>
              <label className={labelStyles}>First Name <span className="text-red-500">*</span></label>
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
              <label className={labelStyles}>Mobile Number <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <select
                  name="mobileCountryCode"
                  value={formData.mobileCountryCode}
                  onChange={handleChange}
                  className="w-[100px] rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-2 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080] bg-white dark:bg-slate-800"
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
              <label className={labelStyles}>Last Name <span className="text-red-500">*</span></label>
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

            {/* Date of Birth */}
            <div>
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
          <h2 className="mb-4 mt-8 text-base font-medium text-[#374151] dark:text-slate-300">
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
              <SearchableSelect
                placeholder="Select state…"
                searchPlaceholder="Search states…"
                options={STATES}
                value={formData.state}
                onChange={(v) => setFormData((prev) => ({ ...prev, state: v }))}
              />
            </div>

            {/* Country */}
            <div>
              <label className={labelStyles}>Country</label>
              <SearchableSelect
                placeholder="Select country…"
                searchPlaceholder="Search countries…"
                options={COUNTRIES}
                value={formData.country}
                onChange={(v) => setFormData((prev) => ({ ...prev, country: v }))}
              />
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
          </div>

          {/* What did you enjoy — checkboxes */}
          <div className="mt-6">
            <label className={labelStyles}>
              What did you enjoy that made you come back?
            </label>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-3">
              {ENJOYED_OPTIONS.map((option) => (
                <label key={option} className="flex items-center gap-2 text-sm text-[#374151] dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enjoyedChecked[option]}
                    onChange={() => toggleEnjoyed(option)}
                    className="h-4 w-4 accent-[#000080]"
                  />
                  {option}
                </label>
              ))}
              <label className="flex items-center gap-2 text-sm text-[#374151] dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enjoyedChecked["Other"]}
                  onChange={() => toggleEnjoyed("Other")}
                  className="h-4 w-4 accent-[#000080]"
                />
                Other
              </label>
            </div>
            {enjoyedChecked["Other"] && (
              <input
                type="text"
                value={enjoyedOther}
                onChange={(e) => setEnjoyedOther(e.target.value)}
                placeholder="Please specify…"
                className={"mt-2 " + inputStyles}
              />
            )}
          </div>

          {/* Favourite parts & Attend regularly */}
          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            {/* Favourite parts */}
            <div>
              <label className={labelStyles}>
                What were your favourite parts of the service?
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

            {/* Suggestions */}
            <div className="md:col-span-2">
              <label className={labelStyles}>Any suggestions for us?</label>
              <textarea
                name="suggestions"
                value={formData.suggestions}
                onChange={handleChange}
                placeholder="Share your suggestions…"
                rows={4}
                className={inputStyles + " resize-none"}
              />
            </div>

            {/* Prayer Request */}
            <div className="md:col-span-2">
              <label className={labelStyles}>Prayer Request</label>
              <textarea
                name="prayerRequest"
                value={formData.prayerRequest}
                onChange={handleChange}
                placeholder="Enter your prayer request…"
                rows={4}
                className={inputStyles + " resize-none"}
              />
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          {/* Submit */}
          <div className="mt-10 mb-10">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#000080] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#000066] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
