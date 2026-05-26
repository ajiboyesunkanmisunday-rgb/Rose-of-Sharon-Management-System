"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PublicFormLayout from "@/components/layout/PublicFormLayout";
import Button from "@/components/ui/Button";
import PhoneInput from "@/components/ui/PhoneInput";
import { createNewConvert, isAuthenticated } from "@/lib/api";
import SearchableSelect from "@/components/ui/SearchableSelect";
import CountryStateSelect from "@/components/ui/CountryStateSelect";
import { useEventServices } from "@/hooks/useEventServices";

export default function AddNewConvertPage() {
  const router = useRouter();

  const [isPublic, setIsPublic] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceAttended, setServiceAttended] = useState("");
  const { services: eventServices, loading: servicesLoading } = useEventServices();
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
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

  useEffect(() => {
    setIsPublic(!isAuthenticated());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createNewConvert({
        firstName,
        middleName: middleName || undefined,
        lastName,
        email: email || undefined,
        phoneNumber: phone,
        countryCode: countryCode.replace(/^\+/, ""),
        sex: gender || undefined,
        street: street || undefined,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
        eventId: serviceAttended || undefined,
      });
      if (!isAuthenticated()) {
        setSubmitted(true);
      } else {
        router.push("/user-management/new-converts");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save new convert.");
      setLoading(false);
    }
  };

  const inputStyles =
    "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none placeholder:text-[#9CA3AF] dark:text-slate-400 focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
  const selectStyles = inputStyles;
  const labelStyles = "mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300";

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
              setFirstName(""); setMiddleName(""); setLastName(""); setGender("");
              setPhone(""); setEmail(""); setServiceAttended("");
              setStreet(""); setCity(""); setState(""); setCountry("");
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
    <form onSubmit={handleSubmit}>
      <div className="mb-8 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6">
        <h2 className="mb-6 text-[18px] font-bold text-[#000000] dark:text-slate-100">
          Enter Details
        </h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
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
          <PhoneInput
            label="Phone Number"
            code={countryCode}
            number={phone}
            onCodeChange={setCountryCode}
            onNumberChange={setPhone}
            placeholder="Enter Phone Number"
          />

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

          <div>
            <label className={labelStyles}>Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={selectStyles}
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div>
            <label className={labelStyles}>Service Attended</label>
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

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={loading || !isFormValid} className="w-full sm:w-auto">
          {loading ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );

  if (isPublic) {
    return (
      <PublicFormLayout title="New Convert Registration" subtitle="Welcome to the family of God!">
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
          <h2 className="text-[22px] font-bold text-[#000080] dark:text-indigo-400">Add New Convert</h2>
        </div>
      </div>
      {formContent}
    </DashboardLayout>
  );
}
