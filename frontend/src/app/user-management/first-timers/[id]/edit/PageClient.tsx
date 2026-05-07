"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import PhoneInput from "@/components/ui/PhoneInput";
import PhotoUpload from "@/components/ui/PhotoUpload";
import SpouseLinkModal from "@/components/user-management/SpouseLinkModal";
import type { SpouseData } from "@/components/user-management/SpouseLinkModal";
import { getUser, updateFirstTimer, uploadProfilePicture } from "@/lib/api";
import { NIGERIA_STATES, COUNTRIES } from "@/lib/nigeria-states";
import SearchableSelect from "@/components/ui/SearchableSelect";

export default function EditFirstTimerPage() {
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

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [phone, setPhone] = useState("");
  const [whatsappCode, setWhatsappCode] = useState("+234");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [occupation, setOccupation] = useState("");

  const populate = useCallback(async () => {
    if (!id || id.startsWith("ft-")) return;
    try {
      const u = await getUser(id);
      setFirstName(u.firstName ?? "");
      setMiddleName(u.middleName ?? "");
      setLastName(u.lastName ?? "");
      setGender(u.sex ?? "");
      setEmail(u.email ?? "");
      setCountryCode(u.countryCode ? `+${u.countryCode}` : "+234");
      setPhone(u.phoneNumber ?? "");
      if (u.whatsappNumber) {
        setWhatsappNumber(u.whatsappNumber);
      }
      setDobDay(u.dayOfBirth?.toString() ?? "");
      setDobMonth(u.monthOfBirth?.toString() ?? "");
      setDobYear(u.yearOfBirth?.toString() ?? "");
      setStreet(u.street ?? "");
      setCity(u.city ?? "");
      setState(u.state ?? "");
      setCountry(u.country ?? "");
      setMaritalStatus(u.maritalStatus ?? "");
      setOccupation(u.occupation ?? "");
    } catch { /* silently fall back to empty fields */ }
  }, [id]);

  useEffect(() => { populate(); }, [populate]);
  const [serviceAttended, setServiceAttended] = useState("");
  const [isVisiting, setIsVisiting] = useState(false);
  const [howDidYouHear, setHowDidYouHear] = useState("");
  const [howWasService, setHowWasService] = useState("");
  const [favouriteParts, setFavouriteParts] = useState("");
  const [worshippedOnline, setWorshippedOnline] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [spouse, setSpouse] = useState<SpouseData | null>(null);
  const [showSpouseModal, setShowSpouseModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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
      await updateFirstTimer(id, {
        firstName: firstName || undefined,
        middleName: middleName || undefined,
        lastName: lastName || undefined,
        sex: gender || undefined,
        email: email || undefined,
        countryCode: rawCode || undefined,
        phoneNumber: phone || undefined,
        dayOfBirth: dobDay ? Number(dobDay) : undefined,
        monthOfBirth: dobMonth ? Number(dobMonth) : undefined,
        yearOfBirth: dobYear ? Number(dobYear) : undefined,
        street: street || undefined,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
        maritalStatus: maritalStatus || undefined,
        occupation: occupation || undefined,
        isVisiting: isVisiting || undefined,
        mediumOfInvitation: howDidYouHear || undefined,
        favouritePartOfService: favouriteParts || undefined,
        profilePictureUrl,
      });
      router.back();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to update first timer.");
      setSubmitting(false);
    }
  };

  const inputStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
  const selectStyles =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10";
  const labelStyles = "mb-1 block text-sm font-medium text-[#374151]";

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

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
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-[#000080]">Edit First Timer</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Enter Details Section */}
        <div className="mb-8 rounded-xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="mb-6 text-[18px] font-bold text-[#000000]">Enter Details</h2>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-[#374151]">
              <input
                type="checkbox"
                checked={isVisiting}
                onChange={(e) => setIsVisiting(e.target.checked)}
                className="h-4 w-4 rounded border-[#E5E7EB] text-[#000080] focus:ring-[#000080]"
              />
              Is visiting?
            </label>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            <div>
              <label className={labelStyles}>First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter First Name" className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>Middle Name</label>
              <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Enter Middle Name (optional)" className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Enter Last Name" className={inputStyles} />
            </div>
            <PhoneInput label="Mobile Number" code={countryCode} number={phone} onCodeChange={setCountryCode} onNumberChange={setPhone} placeholder="Enter Mobile Number" />
            <div>
              <label className={labelStyles}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email" className={inputStyles} />
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
              <label className={labelStyles}>Date of Birth</label>
              <div className="grid grid-cols-3 gap-2">
                <select value={dobDay} onChange={(e) => setDobDay(e.target.value)} className={selectStyles}>
                  <option value="">Day</option>
                  {days.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={dobMonth} onChange={(e) => setDobMonth(e.target.value)} className={selectStyles}>
                  <option value="">Month</option>
                  {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
                <SearchableSelect
                  placeholder="Year"
                  searchPlaceholder="Search year…"
                  options={yearOptions}
                  value={dobYear}
                  onChange={setDobYear}
                />
              </div>
            </div>
            <PhoneInput label="WhatsApp Number" code={whatsappCode} number={whatsappNumber} onCodeChange={setWhatsappCode} onNumberChange={setWhatsappNumber} placeholder="Enter WhatsApp Number" />
          </div>

          <div className="mt-6">
            <PhotoUpload label="Profile Photo" value={photo} onChange={setPhoto} previewSize="md" />
          </div>
        </div>

        {/* Address Section */}
        <div className="mb-8 rounded-xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="mb-6 text-[18px] font-bold text-[#000000]">Address</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            <div>
              <label className={labelStyles}>Street</label>
              <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Enter Street" className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter City" className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>State</label>
              <SearchableSelect
                placeholder="Select State"
                searchPlaceholder="Search states…"
                options={NIGERIA_STATES}
                value={state}
                onChange={setState}
              />
            </div>
            <div>
              <label className={labelStyles}>Country</label>
              <SearchableSelect
                placeholder="Select Country"
                searchPlaceholder="Search countries…"
                options={COUNTRIES}
                value={country}
                onChange={setCountry}
              />
            </div>
          </div>
        </div>

        {/* More Details Section */}
        <div className="mb-8 rounded-xl border border-[#E5E7EB] bg-white p-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            <div>
              <label className={labelStyles}>Marital Status</label>
              <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className={selectStyles}>
                <option value="">Select Marital Status</option>
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="WIDOWED">Widowed</option>
              </select>
              {maritalStatus === "MARRIED" && (
                <button type="button" onClick={() => setShowSpouseModal(true)} className="mt-2 text-xs font-medium text-[#000080] underline hover:text-[#000066]">
                  {spouse ? `Spouse: ${spouse.name} (change)` : "+ Link Spouse"}
                </button>
              )}
            </div>
            <div>
              <label className={labelStyles}>Select Service</label>
              <select value={serviceAttended} onChange={(e) => setServiceAttended(e.target.value)} className={selectStyles}>
                <option value="">Select Service</option>
                <option value="Sunday Service">Sunday Service</option>
                <option value="Tuesday Bible Study">Tuesday Bible Study</option>
                <option value="Thursday Prayer Meeting">Thursday Prayer Meeting</option>
                <option value="Special Service">Special Service</option>
              </select>
            </div>
            <div>
              <label className={labelStyles}>Occupation</label>
              <select value={occupation} onChange={(e) => setOccupation(e.target.value)} className={selectStyles}>
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
            <div>
              <label className={labelStyles}>How did you hear about our church?</label>
              <select value={howDidYouHear} onChange={(e) => setHowDidYouHear(e.target.value)} className={selectStyles}>
                <option value="">Select</option>
                <option value="Social Media">Social Media</option>
                <option value="Friend/Family">Friend/Family</option>
                <option value="Website">Website</option>
                <option value="Outreach">Outreach</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelStyles}>How was our service?</label>
              <select value={howWasService} onChange={(e) => setHowWasService(e.target.value)} className={selectStyles}>
                <option value="">Select</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
            <div>
              <label className={labelStyles}>What were your favourite parts of the service?</label>
              <select value={favouriteParts} onChange={(e) => setFavouriteParts(e.target.value)} className={selectStyles}>
                <option value="">Select</option>
                <option value="Worship">Worship</option>
                <option value="Sermon">Sermon</option>
                <option value="Fellowship">Fellowship</option>
                <option value="Prayer">Prayer</option>
                <option value="All">All</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm text-[#374151]">
              <input type="checkbox" checked={worshippedOnline} onChange={(e) => setWorshippedOnline(e.target.checked)} className="h-4 w-4 rounded border-[#E5E7EB] text-[#000080] focus:ring-[#000080]" />
              Have you worshipped with us online before?
            </label>
          </div>
        </div>

        {submitError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
        )}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={submitting}>{submitting ? "Saving…" : "Save Changes"}</Button>
        </div>
      </form>

      <SpouseLinkModal
        isOpen={showSpouseModal}
        onClose={() => setShowSpouseModal(false)}
        onSave={(data) => setSpouse(data)}
        initial={spouse || undefined}
      />
    </DashboardLayout>
  );
}
