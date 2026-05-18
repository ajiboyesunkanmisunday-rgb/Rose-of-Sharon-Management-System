"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import PhoneInput from "@/components/ui/PhoneInput";
import { createNewConvert } from "@/lib/api";
import SearchableSelect from "@/components/ui/SearchableSelect";
import CountryStateSelect from "@/components/ui/CountryStateSelect";
import { useEventServices } from "@/hooks/useEventServices";

export default function AddNewConvertPage() {
  const router = useRouter();

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
      router.push("/user-management/new-converts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save new convert.");
      setLoading(false);
    }
  };

  const inputStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
  const selectStyles = inputStyles;
  const labelStyles = "mb-1 block text-sm font-medium text-[#374151]";

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
        <div className="mb-8 rounded-xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="mb-6 text-[18px] font-bold text-[#000000]">
            Enter Details
          </h2>

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            <div>
              <label className={labelStyles}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter First Name"
                className={inputStyles}
                required
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
                required
              />
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
                placeholder="Enter Email"
                className={inputStyles}
              />
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
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
