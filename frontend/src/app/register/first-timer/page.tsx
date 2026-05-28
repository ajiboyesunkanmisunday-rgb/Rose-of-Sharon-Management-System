"use client";

import Image from "next/image";
import { useState } from "react";
import {
  createFirstTimer,
  createPrayerRequest,
} from "@/lib/api";

const inputClass =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none bg-white dark:bg-slate-800 text-[#374151] dark:text-slate-300";
const labelClass = "mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300";
const selectClass =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none appearance-none bg-white dark:bg-slate-800 text-[#374151] dark:text-slate-300";

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

const occupations = [
  "Student", "Engineer", "Doctor", "Teacher", "Lawyer", "Business Owner",
  "Civil Servant", "Banker", "Nurse", "Accountant", "Pastor/Minister",
  "IT Professional", "Trader", "Artisan", "Unemployed", "Retired", "Other",
];

const howDidYouHearOptions = [
  "Friends & Family", "Billboard", "Flyer", "Crusade",
  "TV & Radio", "Social Media", "Others",
];

const serviceRatings = ["Average", "Good", "Very Good", "Excellent"];

const favouritePartsOptions = [
  "Music", "Media", "Sermon", "Ambience", "Hospitality", "Friendliness",
];

const maritalStatusOptions = [
  "Single", "Married", "Separated", "Divorced", "Single Parent", "Widowed",
];

export default function FirstTimerPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    countryCode: "+234",
    mobileNumber: "",
    street: "",
    city: "",
    state: "",
    country: "",
    maritalStatus: "",
    occupation: "",
    howDidYouHear: "",
    serviceRating: "",
    favouriteParts: "",
    worshippedOnline: "",
    attendRegularly: "",
    preferredContact: "",
    prayerRequest: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

      // Strip leading '+' from country code for API
      const countryCodeNum = formData.countryCode.replace(/\D/g, "");

      const body = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || undefined,
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
        occupation: formData.occupation || undefined,
        mediumOfInvitation: formData.howDidYouHear || undefined,
        howWasService: formData.serviceRating || undefined,
        favouritePartOfService: formData.favouriteParts || undefined,
        fromOnline: formData.worshippedOnline === "Yes" ? true : formData.worshippedOnline === "No" ? false : undefined,
        attendRegularly: formData.attendRegularly || undefined,
        preferredContact: formData.preferredContact || undefined,
      };

      const created = await createFirstTimer(body);

      // If a prayer request was entered, submit it
      if (formData.prayerRequest.trim() && created?.id) {
        try {
          await createPrayerRequest({
            userId: created.id,
            subject: "Prayer Request",
            content: formData.prayerRequest.trim(),
          });
        } catch {
          // Prayer request failure is non-fatal
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-800 flex flex-col items-center justify-center px-8">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <Image src="/rccg-logo.svg" alt="RCCG Logo" width={160} height={43} priority />
          </div>
          <div className="rounded-2xl border border-green-200 bg-green-50 p-8">
            <div className="mb-3 text-4xl">🎉</div>
            <h2 className="text-xl font-bold text-green-800 mb-2">Welcome!</h2>
            <p className="text-sm text-green-700">
              Thank you for filling out this form. We are glad you joined us and hope to see you again soon!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-800">
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
        <h1 className="text-center text-[28px] font-bold text-[#1F2937] dark:text-slate-100">
          Getting To Know You Better (First Timer)
        </h1>

        <p className="mt-6 text-sm font-semibold text-[#374151] dark:text-slate-300">
          Enter Your Details
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* First Name / Email */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
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
              <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
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
                    <option key={d} value={d}>{d}</option>
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
                    <option key={m} value={i + 1}>{m}</option>
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
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Mobile Number */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>Mobile Number <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="w-24 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-2 py-3 text-sm focus:border-[#000080] focus:ring-1 focus:ring-[#000080] outline-none appearance-none bg-white dark:bg-slate-800 text-[#374151] dark:text-slate-300"
                >
                  <option value="+234">+234</option>
                  <option value="+44">+44</option>
                  <option value="+1">+1</option>
                  <option value="+233">+233</option>
                  <option value="+27">+27</option>
                  <option value="+0">+0</option>
                </select>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Section Header */}
          <div className="pt-2">
            <p className="text-sm font-semibold text-[#374151] dark:text-slate-300">Address</p>
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
                  <option key={s} value={s}>{s}</option>
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
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Marital Status / Occupation */}
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
                {maritalStatusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
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
                  <option key={o} value={o}>{o}</option>
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
                {howDidYouHearOptions.map((h) => (
                  <option key={h} value={h}>{h}</option>
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
                  <option key={r} value={r}>{r}</option>
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
                {favouritePartsOptions.map((f) => (
                  <option key={f} value={f}>{f}</option>
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

          {/* Attend regularly / Preferred contact */}
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
              <label className={labelClass}>Preferred means of contact</label>
              <select
                name="preferredContact"
                value={formData.preferredContact}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">Select option</option>
                <option value="Call">Call</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
              </select>
            </div>
          </div>

          {/* Prayer Request */}
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

          {/* Error */}
          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 pb-10">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#000080] px-10 py-3 text-sm font-semibold text-white hover:bg-[#000066] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
