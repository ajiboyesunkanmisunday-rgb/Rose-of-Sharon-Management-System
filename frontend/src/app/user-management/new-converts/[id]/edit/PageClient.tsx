"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import PhoneInput from "@/components/ui/PhoneInput";
import PhotoUpload from "@/components/ui/PhotoUpload";
import { getNewConvert, updateNewConvert, uploadProfilePicture } from "@/lib/api";

export default function EditNewConvertPage() {
  const router = useRouter();
  const params = useParams();
  const paramId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const [id, setId] = useState(paramId);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 2] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [firstName,   setFirstName]   = useState("");
  const [middleName,  setMiddleName]  = useState("");
  const [lastName,    setLastName]    = useState("");
  const [gender,      setGender]      = useState("");
  const [email,       setEmail]       = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [phone,       setPhone]       = useState("");
  const [street,      setStreet]      = useState("");
  const [city,        setCity]        = useState("");
  const [state,       setState]       = useState("");
  const [country,     setCountry]     = useState("");
  const [photo,       setPhoto]       = useState<File | null>(null);
  const [eventId,     setEventId]     = useState<string | undefined>(undefined);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState("");

  const populate = useCallback(async () => {
    if (!id || id.startsWith("nc-")) return;
    try {
      const u = await getNewConvert(id);
      setFirstName(u.firstName ?? "");
      setMiddleName(u.middleName ?? "");
      setLastName(u.lastName ?? "");
      setGender(u.sex ?? "");
      setEmail(u.email ?? "");
      setCountryCode(u.countryCode ? `+${u.countryCode}` : "+234");
      setPhone(u.phoneNumber ?? "");
      setStreet(u.street ?? "");
      setCity(u.city ?? "");
      setState(u.state ?? "");
      setCountry(u.country ?? "");
      setEventId(u.service?.id ?? undefined);
    } catch { /* silently fall back */ }
  }, [id]);

  useEffect(() => { populate(); }, [populate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    try {
      const rawCode = countryCode.replace("+", "");
      let profilePictureUrl: string | undefined;
      if (photo) {
        profilePictureUrl = await uploadProfilePicture(photo);
      }
      await updateNewConvert(id, {
        firstName:        firstName   || undefined,
        middleName:       middleName  || undefined,
        lastName:         lastName    || undefined,
        sex:              gender      || undefined,
        countryCode:      rawCode     || undefined,
        phoneNumber:      phone       || undefined,
        street:           street      || undefined,
        city:             city        || undefined,
        state:            state       || undefined,
        country:          country     || undefined,
        eventId:          eventId,
        profilePictureUrl,
      });
      router.back();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to update.");
      setSubmitting(false);
    }
  };

  const inputStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
  const selectStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10";
  const labelStyles = "mb-1 block text-sm font-medium text-[#374151]";

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">User Management</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center text-[#000080] transition-colors hover:text-[#000066]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-[#000080]">Edit New Convert</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Details */}
        <div className="mb-8 rounded-xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="mb-6 text-[18px] font-bold text-[#000000]">Personal Details</h2>

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            <div>
              <label className={labelStyles}>First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter First Name" className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>Middle Name</label>
              <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Enter Middle Name" className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter Last Name" className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectStyles}>
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className={labelStyles}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email Address" className={inputStyles} />
            </div>
            <PhoneInput
              label="Phone Number"
              code={countryCode}
              number={phone}
              onCodeChange={setCountryCode}
              onNumberChange={setPhone}
              placeholder="Enter Phone Number"
            />
          </div>

          <div className="mt-6">
            <PhotoUpload label="Profile Photo" value={photo} onChange={setPhoto} previewSize="md" />
          </div>
        </div>

        {/* Address */}
        <div className="mb-8 rounded-xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="mb-6 text-[18px] font-bold text-[#000000]">Address</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            <div>
              <label className={labelStyles}>Street</label>
              <input type="text" value={street} onChange={(e) => setStreet(e.target.value)}
                placeholder="Enter Street" className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                placeholder="Enter City" className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>State</label>
              <input type="text" value={state} onChange={(e) => setState(e.target.value)}
                placeholder="Enter State" className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>Country</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                placeholder="Enter Country" className={inputStyles} />
            </div>
          </div>
        </div>

        {submitError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
