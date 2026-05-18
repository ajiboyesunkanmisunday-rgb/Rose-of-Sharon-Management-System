"use client";

/**
 * SodFormCore — multi-mode SoD application form
 *
 * mode = "blank"  → read-only, empty, Print Blank Form button only
 * mode = "fill"   → editable, Print + Submit buttons
 * mode = "view"   → read-only, pre-filled from initialData, Print Filled Form button only
 *
 * Backend-confirmed field formats (2025):
 *  - dateOfBirth: yyyy-mm-dd
 *  - noOfChildren: integer only (e.g. 1)
 *  - salvationDate / waterBaptismDate / holySpiritBaptismDate: any string
 *  - Past Worship dates: any string
 *  - Address: separate street / city / state / country fields
 *  - countryCode: separate field (default "234")
 *  - qualificationRequests: { date, institution, qualificationReceived }
 */

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Printer, Send, CheckCircle, XCircle } from "lucide-react";
import { createSchoolOfDisciple, uploadProfilePicture, type SchoolOfDiscipleFullResponse } from "@/lib/api";

export type SodMode = "blank" | "fill" | "view";

/* ─── Required asterisk ───────────────────────────────────────────────────── */
const REQ = <span style={{ color: "red", marginLeft: 2 }}>*</span>;

/* ─── Primitive dotted-line input ────────────────────────────────────────── */
function F({
  value,
  onChange,
  style,
  readOnly,
  placeholder,
}: {
  value: string;
  onChange?: (v: string) => void;
  style?: React.CSSProperties;
  readOnly?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      className="sod-f"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      style={style}
      readOnly={readOnly}
      placeholder={readOnly ? undefined : placeholder}
    />
  );
}

function FullRow({
  label,
  value,
  onChange,
  readOnly,
  required,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  required?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span style={{ whiteSpace: "nowrap" }}>{label}{required && REQ}</span>
      <F value={value} onChange={onChange} style={{ flex: 1 }} readOnly={readOnly} />
    </div>
  );
}

function PairedRow({
  left,
  right,
  readOnly,
}: {
  left:  { label: string; value: string; onChange?: (v: string) => void; required?: boolean };
  right: { label: string; value: string; onChange?: (v: string) => void; required?: boolean };
  readOnly?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
      <div style={{ flex: 1, display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ whiteSpace: "nowrap" }}>{left.label}{left.required && REQ}</span>
        <F value={left.value} onChange={left.onChange} style={{ flex: 1 }} readOnly={readOnly} />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ whiteSpace: "nowrap" }}>{right.label}{right.required && REQ}</span>
        <F value={right.value} onChange={right.onChange} style={{ flex: 1 }} readOnly={readOnly} />
      </div>
    </div>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontWeight: 700, fontSize: 12, textTransform: "uppercase",
      marginTop: 20, marginBottom: 12, letterSpacing: 0.3,
    }}>
      {children}
    </div>
  );
}

function Chk({
  label,
  checked,
  onChange,
  readOnly,
}: {
  label: string;
  checked: boolean;
  onChange?: () => void;
  readOnly?: boolean;
}) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 4, cursor: readOnly ? "default" : "pointer", fontSize: 12 }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={readOnly ? undefined : onChange}
        readOnly={readOnly}
        style={{ width: 13, height: 13, cursor: readOnly ? "default" : "pointer" }}
      />
      {label}
    </label>
  );
}

const PAPER_STYLE: React.CSSProperties = {
  background: "#fff",
  width: 794,
  margin: "0 auto",
  padding: "52px 64px",
  boxShadow: "0 8px 40px rgba(0,0,0,0.28)",
  fontFamily: "Arial, sans-serif",
  fontSize: 12,
  color: "#000",
  lineHeight: 1.5,
};

const MARITAL = ["Single", "Married", "Engaged", "Divorced", "Widowed"];

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function SodFormCore({
  mode,
  initialData,
}: {
  mode: SodMode;
  initialData?: SchoolOfDiscipleFullResponse;
}) {
  const ro = mode === "blank" || mode === "view";
  const router = useRouter();

  /* Church identifiers */
  const [set,      setSet]      = useState(initialData?.set      ?? "");
  const [region,   setRegion]   = useState(initialData?.region   ?? "");
  const [province, setProvince] = useState(initialData?.province ?? "");
  const [centre,   setCentre]   = useState(initialData?.centre   ?? "");

  /* ── Section A — Personal ── */
  const [surname,       setSurname]       = useState(initialData?.lastName ?? "");
  const [firstName,     setFirstName]     = useState(initialData?.firstName ?? "");
  const [middleName,    setMiddleName]    = useState(initialData?.middleName ?? "");

  /* Address — separate fields per backend spec */
  const [street,        setStreet]        = useState(initialData?.street ?? "");
  const [city,          setCity]          = useState(initialData?.city ?? "");
  const [addrState,     setAddrState]     = useState(initialData?.state ?? "");
  const [country,       setCountry]       = useState(initialData?.country ?? "");

  const [dob,           setDob]           = useState(initialData?.dateOfBirth ?? "");
  const [sex,           setSex]           = useState(() => {
    const s = initialData?.sex ?? "";
    if (!s) return "";
    if (s.toUpperCase() === "MALE") return "Male";
    if (s.toUpperCase() === "FEMALE") return "Female";
    return s;
  });
  const [nationality,   setNationality]   = useState(initialData?.nationality   ?? "");
  const [stateOfOrigin, setStateOfOrigin] = useState(initialData?.stateOfOrigin ?? "");
  const [homeTown,      setHomeTown]      = useState(initialData?.homeTown      ?? "");

  /* Phone — split countryCode / phoneNumber */
  const [countryCode,   setCountryCode]   = useState(initialData?.countryCode ?? "234");
  const [phone,         setPhone]         = useState(initialData?.phoneNumber ?? "");

  const [email,         setEmail]         = useState(initialData?.email ?? "");
  const [occupation,    setOccupation]    = useState(initialData?.occupation ?? "");
  const [officeAddr,    setOfficeAddr]    = useState(initialData?.officeFullAddress ?? "");
  const [marital,       setMarital]       = useState(() => {
    const m = initialData?.maritalStatus ?? "";
    if (!m) return "";
    const cap = m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
    return MARITAL.includes(cap) ? cap : m;
  });
  const [spouseName,    setSpouseName]    = useState(initialData?.spouseName        ?? "");
  const [spousePhone,   setSpousePhone]   = useState(initialData?.spousePhoneNumber ?? "");
  const [spouseOcc,     setSpouseOcc]     = useState(initialData?.spouseOccupation  ?? "");
  const [numChildren,   setNumChildren]   = useState(
    initialData?.noOfChildren != null ? String(initialData.noOfChildren) : ""
  );

  /* ── Section B — Qualifications (date + institution + qualification received) ── */
  const [quals, setQuals] = useState(() => {
    const fromData = (initialData?.qualifications ?? []).map((q) => ({
      institution:           q.institution           ?? "",
      date:                  q.date                  ?? "",
      qualificationReceived: q.qualificationReceived ?? "",
    }));
    while (fromData.length < 3) fromData.push({ institution: "", date: "", qualificationReceived: "" });
    return fromData.slice(0, 3);
  });
  const updateQual = (i: number, k: keyof typeof quals[0], v: string) =>
    setQuals((prev) => prev.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  /* ── Section C — worship places ── */
  const [wp,  setWp]  = useState(() => {
    const fromData = (initialData?.pastPlaceOfWorships ?? []).map((w) => ({
      name:    w.name    ?? "",
      address: w.address ?? "",
      date:    w.date    ?? "",
    }));
    while (fromData.length < 3) fromData.push({ name: "", address: "", date: "" });
    return fromData.slice(0, 3);
  });
  const updateWp = (i: number, k: keyof typeof wp[0], v: string) =>
    setWp((prev) => prev.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  /* ── Section C — positions held ── */
  const [ph,  setPh]  = useState(() => {
    const fromData = (initialData?.pastPositionHeldList ?? []).map((p) => ({
      name:     p.worshipPlace ?? "",
      position: p.positionHeld ?? "",
    }));
    while (fromData.length < 3) fromData.push({ name: "", position: "" });
    return fromData.slice(0, 3);
  });
  const updatePh = (i: number, k: keyof typeof ph[0], v: string) =>
    setPh((prev) => prev.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  /* ── Spiritual dates — sent as raw strings per backend spec ── */
  const [salvationDate,      setSalvationDate]      = useState(initialData?.salvationDate ?? "");
  const [salvationWhere,     setSalvationWhere]     = useState(initialData?.salvationLocation ?? "");
  const [waterBaptismDate,   setWaterBaptismDate]   = useState(initialData?.waterBaptismDate ?? "");
  const [waterBaptismChurch, setWaterBaptismChurch] = useState(initialData?.waterBaptismLocation ?? "");
  const [holyGhostDate,      setHolyGhostDate]      = useState(initialData?.holySpiritBaptismDate ?? "");
  const [holyGhostWhere,     setHolyGhostWhere]     = useState(initialData?.holySpiritBaptismLocation ?? "");
  const [pastorName,         setPastorName]         = useState(initialData?.currentParishPastorName        ?? "");
  const [pastorPhone,        setPastorPhone]        = useState(initialData?.currentParishPastorPhoneNumber ?? "");
  const [activity1,          setActivity1]          = useState(initialData?.activityInCurrentParish        ?? "");
  const [activity2,          setActivity2]          = useState("");
  const [otherTraining,      setOtherTraining]      = useState<"yes" | "no" | "">(
    initialData?.hasAnotherSimultaneousProgram === true  ? "yes" :
    initialData?.hasAnotherSimultaneousProgram === false ? "no"  : ""
  );
  const [pastorKnows,        setPastorKnows]        = useState("");

  /* ── Section D ── */
  const [otherInfo1, setOtherInfo1] = useState(initialData?.otherInformation ?? "");
  const [otherInfo2, setOtherInfo2] = useState("");

  /* ── Section E — Declaration ── */
  const [declName, setDeclName] = useState(`${firstName} ${surname}`.trim());
  const [declOf,   setDeclOf]   = useState("");
  const [consent,  setConsent]  = useState(false);

  /* ── Section F ── */
  const [remarks1, setRemarks1] = useState(initialData?.officialRemarks ?? "");
  const [remarks2, setRemarks2] = useState("");

  /* ── Photo ── */
  const [photo,        setPhoto]        = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.profilePictureUrl ?? null);
  const [uploading,    setUploading]    = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  /* ── Submit ── */
  const [submitting,    setSubmitting]    = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError,   setSubmitError]   = useState("");

  const handleSubmit = async () => {
    // Validate required fields
    const missing: string[] = [];
    if (!set.trim())          missing.push("Set");
    if (!region.trim())       missing.push("Region");
    if (!province.trim())     missing.push("Province");
    if (!centre.trim())       missing.push("Centre");
    if (!firstName.trim())    missing.push("First Name");
    if (!surname.trim())      missing.push("Last Name");
    if (!countryCode.trim())  missing.push("Country Code");
    if (!phone.trim())        missing.push("Phone Number");
    if (!dob.trim())          missing.push("Date of Birth");
    if (!nationality.trim())  missing.push("Nationality");
    if (!street.trim())       missing.push("Street Address");
    if (!city.trim())         missing.push("City");
    if (!addrState.trim())    missing.push("State");
    if (!country.trim())      missing.push("Country");
    if (!occupation.trim())   missing.push("Occupation");
    if (!officeAddr.trim())   missing.push("Office Address");
    if (!salvationDate.trim())      missing.push("Salvation Date");
    if (!salvationWhere.trim())     missing.push("Salvation Location");
    if (!waterBaptismDate.trim())   missing.push("Water Baptism Date");
    if (!waterBaptismChurch.trim()) missing.push("Water Baptism Location");
    if (!holyGhostDate.trim())      missing.push("Holy Spirit Baptism Date");
    if (!holyGhostWhere.trim())     missing.push("Holy Spirit Baptism Location");
    if (!pastorName.trim())         missing.push("Current Parish Pastor Name");
    if (!photoPreview && !photo)    missing.push("Profile Picture");
    if (quals.filter((q) => q.institution.trim()).length === 0) missing.push("At least one Qualification");
    if (!consent) missing.push("Consent to form declaration");
    if (marital === "Married" && !spouseName.trim()) missing.push("Spouse Name (required if Married)");

    if (missing.length > 0) {
      setSubmitError(`Please fill in: ${missing.join(", ")}.`);
      return;
    }

    setSubmitError("");
    setSubmitting(true);
    setUploading(false);
    try {
      let profilePictureUrl: string | undefined;
      if (photo) {
        setUploading(true);
        profilePictureUrl = await uploadProfilePicture(photo);
        setUploading(false);
      }

      const maritalMap: Record<string, string> = {
        Single: "SINGLE", Married: "MARRIED", Engaged: "ENGAGED",
        Divorced: "DIVORCED", Widowed: "WIDOWED",
      };
      const sexNorm = sex.trim().toLowerCase().startsWith("f") ? "FEMALE"
                    : sex.trim().toLowerCase().startsWith("m") ? "MALE"
                    : sex.trim() || undefined;

      // Qualifications — all three columns
      const qualItems = quals
        .filter((q) => q.institution.trim())
        .map((q) => ({
          institution:           q.institution.trim(),
          date:                  q.date.trim() || undefined,
          qualificationReceived: q.qualificationReceived.trim() || undefined,
        }));

      // Worship places — date sent as raw string
      const wpItems = wp
        .filter((r) => r.name.trim())
        .map((r) => ({
          name:    r.name.trim(),
          address: r.address.trim() || undefined,
          date:    r.date.trim() || undefined,
        }));

      // Positions held — worshipPlace = church name, positionHeld = position
      const phItems = ph
        .filter((r) => r.name.trim() || r.position.trim())
        .map((r) => ({
          worshipPlace: r.name.trim() || undefined,
          positionHeld: r.position.trim() || undefined,
        }));

      const created = await createSchoolOfDisciple({
        set:               set.trim(),
        region:            region.trim()   || undefined,
        province:          province.trim() || undefined,
        centre:            centre.trim()   || undefined,
        profilePictureUrl,
        firstName:         firstName.trim(),
        lastName:          surname.trim(),
        middleName:        middleName.trim() || undefined,
        countryCode:       countryCode.trim(),
        phoneNumber:       phone.trim(),
        email:             email.trim() || undefined,
        sex:               sexNorm as string | undefined,
        dateOfBirth:       dob.trim() || undefined,          // yyyy-mm-dd from date input
        maritalStatus:     marital ? (maritalMap[marital] ?? marital.toUpperCase()) : undefined,
        spouseName:        spouseName.trim()  || undefined,
        spousePhoneNumber: spousePhone.trim() || undefined,
        spouseOccupation:  spouseOcc.trim()   || undefined,
        noOfChildren:      numChildren.trim() ? Number(numChildren.trim()) : undefined,
        nationality:       nationality.trim()   || undefined,
        homeTown:          homeTown.trim()      || undefined,
        stateOfOrigin:     stateOfOrigin.trim() || undefined,
        // Address — separate fields
        street:            street.trim()     || undefined,
        city:              city.trim()       || undefined,
        state:             addrState.trim()  || undefined,
        country:           country.trim()    || undefined,
        occupation:        occupation.trim()  || undefined,
        officeFullAddress: officeAddr.trim()  || undefined,
        // Spiritual history — raw strings
        salvationDate:             salvationDate.trim()      || undefined,
        salvationLocation:         salvationWhere.trim()     || undefined,
        waterBaptismDate:          waterBaptismDate.trim()   || undefined,
        waterBaptismLocation:      waterBaptismChurch.trim() || undefined,
        holySpiritBaptismDate:     holyGhostDate.trim()      || undefined,
        holySpiritBaptismLocation: holyGhostWhere.trim()     || undefined,
        currentParishPastorName:        pastorName.trim()  || undefined,
        currentParishPastorPhoneNumber: pastorPhone.trim() || undefined,
        activityInCurrentParish: [activity1, activity2].filter(Boolean).join(" ") || undefined,
        hasAnotherSimultaneousProgram: otherTraining === "yes" ? true
                                      : otherTraining === "no"  ? false
                                      : undefined,
        otherInformation: [otherInfo1, otherInfo2].filter(Boolean).join(" ") || undefined,
        consent: true,
        ...(qualItems.length ? { qualificationRequests: qualItems } : {}),
        ...(wpItems.length   ? { createPastPlaceOfWorshipRequests: wpItems } : {}),
        ...(phItems.length   ? { createPositionHeldRequests: phItems }       : {}),
      });

      const savedId = (created as { id?: string })?.id;
      if (!savedId) {
        // Backend returned 200 but no record ID — treat as backend failure
        setSubmitError(
          "The server accepted the form but did not return a record ID, which means the record may not have been saved. Please check the SoD list or contact the backend team. (Check browser console for the full server response.)"
        );
        return;
      }

      setSubmitSuccess(true);
      setSubmitError("");
      // Navigate to the list so the new record is immediately visible
      setTimeout(() => router.push("/trainings/sod"), 1500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 12mm 16mm; }

        @media print {
          .sod-no-print  { display: none !important; }
          .sod-print-only { display: flex !important; }
          .sod-wrapper  { background: #fff !important; padding: 0 !important; min-height: auto !important; }
          .sod-paper    { box-shadow: none !important; width: 100% !important; max-width: none !important;
                          margin: 0 !important; padding: 0 !important; }
          .sod-page2    { page-break-before: always; break-before: page; margin-top: 0 !important; }
        }

        .sod-f {
          border: none;
          border-bottom: 1px dotted #555;
          background: transparent;
          outline: none;
          font-size: 12px;
          font-family: Arial, sans-serif;
          color: #000;
          padding: 0 2px;
          min-width: 20px;
          display: inline-block;
        }
        .sod-f:focus { border-bottom-color: #000080; background: #eef2ff; }
        .sod-f[readonly]:focus { background: transparent; border-bottom-color: #555; }
        @media print { .sod-f { border-bottom: 1px dotted #333; background: transparent !important; } }

        .sod-td-input {
          border: 1px solid #000;
          padding: 2px 6px;
        }
      `}</style>

      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="sod-no-print" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "#000080", boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 24px",
        }}>
          <button onClick={() => window.history.back()}
            style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}>
            ← Back
          </button>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
            {mode === "blank" ? "SOD Application Form — Blank"
              : mode === "view" ? "SOD Application Form — View Record"
              : "SOD Application Form — Fill & Submit"}
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            {mode === "fill" && (
              <button
                onClick={handleSubmit}
                disabled={submitting || uploading || submitSuccess}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: submitSuccess ? "#16A34A" : "#22c55e",
                  color: "#fff", border: "none",
                  borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 700,
                  cursor: submitting || uploading || submitSuccess ? "not-allowed" : "pointer",
                  opacity: submitting || uploading ? 0.7 : 1,
                }}
              >
                {submitSuccess ? <><CheckCircle size={14} /> Saved to System</>
                  : uploading   ? <><Send size={14} /> Uploading Photo…</>
                  : submitting  ? <><Send size={14} /> Submitting…</>
                  : <><Send size={14} /> Submit to System</>}
              </button>
            )}
            <button onClick={() => window.print()} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#fff", color: "#000080", border: "none",
              borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              <Printer size={14} />
              {mode === "blank" ? "Print Blank Form" : mode === "view" ? "Print Filled Form" : "Print / Download PDF"}
            </button>
          </div>
        </div>

        {/* Error banner */}
        {submitError && (
          <div style={{
            background: "#FEF2F2", color: "#991B1B",
            padding: "8px 24px", fontSize: 12, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8,
            borderTop: "1px solid #FECACA",
          }}>
            <XCircle size={14} />
            {submitError}
            <button onClick={() => setSubmitError("")}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#991B1B", fontWeight: 700 }}>
              ✕
            </button>
          </div>
        )}

        {/* Success banner */}
        {submitSuccess && (
          <div style={{
            background: "#F0FDF4", color: "#15803D",
            padding: "8px 24px", fontSize: 12, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8,
            borderTop: "1px solid #BBF7D0",
          }}>
            <CheckCircle size={14} />
            Application submitted successfully! The student record has been saved.
            <a href="/trainings/sod" style={{ marginLeft: 12, color: "#15803D", textDecoration: "underline", fontWeight: 700 }}>
              View SOD List →
            </a>
          </div>
        )}
      </div>

      {/* ── Gray screen wrapper ─────────────────────────────────────────── */}
      <div className="sod-wrapper" style={{
        minHeight: "100vh", background: "#b0bec5",
        paddingTop: submitError || submitSuccess ? 110 : 72, paddingBottom: 48,
        display: "flex", flexDirection: "column", gap: 32,
        transition: "padding-top 0.2s",
      }}>

        {/* ════════════════════════════════════════════════════════════════
            PAGE 1
        ════════════════════════════════════════════════════════════════ */}
        <div className="sod-paper" style={PAPER_STYLE}>

          {/* ── HEADER ──────────────────────────────────────────────── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>

            {/* Logo + church name */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Image src="/sod-logo.svg" alt="SOD" width={60} height={60} style={{ objectFit: "contain", flexShrink: 0 }} />
              <div style={{ textAlign: "center", lineHeight: 1.65 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>The Redeemed Christian Church of God</div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Rose of Sharon Parish</div>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>The School of Disciples</div>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>Application Form</div>
                <div style={{ fontSize: 11, marginTop: 4, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 }}>
                  <span>SET{REQ}</span>
                  <F
                    value={set}
                    onChange={setSet}
                    readOnly={ro}
                    placeholder="e.g. 2026"
                    style={{ width: 120, borderBottom: (!ro && !set.trim()) ? "1.5px solid red" : undefined }}
                  />
                </div>
              </div>
            </div>

            {/* Passport photo */}
            {mode === "fill" ? (
              <div
                className="sod-no-print"
                onClick={() => photoInputRef.current?.click()}
                style={{
                  width: 90, height: 110, border: !photoPreview ? "2px dashed red" : "2px dashed #000080",
                  borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", flexShrink: 0, cursor: "pointer",
                  overflow: "hidden", background: photoPreview ? "transparent" : "#fff5f5",
                }}
                title="Profile picture is required — click to upload"
              >
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Passport" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span style={{ fontSize: 8, textAlign: "center", color: "#dc2626", lineHeight: 1.4, marginTop: 4 }}>
                      Photo{REQ}<br />(click to upload)
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div style={{
                width: 90, height: 110, border: "1px solid #000", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
              }}>
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Passport" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 9, textAlign: "center", color: "#666", lineHeight: 1.6 }}>
                    Passport<br />Photograph
                  </span>
                )}
              </div>
            )}

            {mode === "fill" && (
              <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
            )}
          </div>

          {/* ── REGION / PROVINCE / CENTRE ──────────────────────────── */}
          <table style={{ borderCollapse: "collapse", marginBottom: 20 }}>
            <tbody>
              {(
                [
                  ["REGION",   region,   setRegion,   true],
                  ["PROVINCE", province, setProvince, true],
                  ["CENTRE",   centre,   setCentre,   true],
                ] as [string, string, (v: string) => void, boolean][]
              ).map(([lbl, val, setter, req]) => (
                <tr key={lbl}>
                  <td style={{ border: "1px solid #000", padding: "4px 10px", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap" }}>
                    {lbl}{req && REQ}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "2px 8px", width: 240 }}>
                    <F value={val} onChange={setter} style={{ width: "100%" }} readOnly={ro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ SECTION A ═══════════════════════════════════════════════ */}
          <SectionHead>A.  Personal Information</SectionHead>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* 1. Name */}
            <div>
              <div style={{ marginBottom: 6 }}>1.  Name:</div>
              <div style={{ display: "flex", gap: 14, paddingLeft: 18 }}>
                {(
                  [
                    ["Surname *",     surname,    setSurname],
                    ["First Name *",  firstName,  setFirstName],
                    ["Middle Name",   middleName, setMiddleName],
                  ] as [string, string, (v: string) => void][]
                ).map(([lbl, val, setter]) => (
                  <div key={lbl} style={{ flex: 1 }}>
                    <F value={val} onChange={setter} style={{ width: "100%" }} readOnly={ro} />
                    <div style={{ fontSize: 9, textAlign: "center", color: "#666", marginTop: 2 }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Address — Street / City / State / Country */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <FullRow label="2.  Street Address:" value={street} onChange={setStreet} readOnly={ro} required />
              <PairedRow
                left={{  label: "City:",    value: city,      onChange: setCity,      required: true }}
                right={{ label: "State:",   value: addrState, onChange: setAddrState, required: true }}
                readOnly={ro}
              />
              <FullRow label="    Country:" value={country} onChange={setCountry} readOnly={ro} required />
            </div>

            {/* 3 & 3b */}
            <PairedRow
              left={{  label: "3.  Date of Birth (yyyy-mm-dd):", value: dob, onChange: setDob, required: true }}
              right={{ label: "3b. Sex:", value: sex, onChange: setSex }}
              readOnly={ro}
            />

            {/* 4 & 4b */}
            <PairedRow
              left={{  label: "4.  Nationality:", value: nationality, onChange: setNationality, required: true }}
              right={{ label: "4b. State of Origin:", value: stateOfOrigin, onChange: setStateOfOrigin }}
              readOnly={ro}
            />

            {/* 5 & 5b */}
            <PairedRow
              left={{  label: "5.  Home Town:", value: homeTown, onChange: setHomeTown }}
              right={{ label: "5b. Phone Number:", value: phone, onChange: setPhone, required: true }}
              readOnly={ro}
            />

            {/* Country code inline before phone note */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, paddingLeft: 18, fontSize: 11, color: "#555" }}>
              <span>Country Code{REQ}:</span>
              <F
                value={countryCode}
                onChange={setCountryCode}
                readOnly={ro}
                placeholder="e.g. 234"
                style={{ width: 70 }}
              />
              <span style={{ color: "#888" }}>(digits only, e.g. 234 for Nigeria)</span>
            </div>

            {/* 6 & 6b */}
            <PairedRow
              left={{  label: "6.  Email Address:", value: email, onChange: setEmail }}
              right={{ label: "6b. Occupation:", value: occupation, onChange: setOccupation, required: true }}
              readOnly={ro}
            />

            {/* 7. Office / Occupation Address */}
            <FullRow label="7.  Office / Occupation Address:" value={officeAddr} onChange={setOfficeAddr} readOnly={ro} required />

            {/* 8. Marital Status */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
              <span>8.  Marital status:</span>
              {MARITAL.map((m) => (
                <Chk key={m} label={m} checked={marital === m} onChange={() => setMarital(marital === m ? "" : m)} readOnly={ro} />
              ))}
            </div>

            {/* 9 & 9b */}
            <PairedRow
              left={{  label: "9.  Spouse Name:", value: spouseName, onChange: setSpouseName,
                       required: marital === "Married" }}
              right={{ label: "Spouse Phone Number:", value: spousePhone, onChange: setSpousePhone }}
              readOnly={ro}
            />

            {/* 10 & 10b */}
            <PairedRow
              left={{  label: "10. Spouse's Occupation:", value: spouseOcc, onChange: setSpouseOcc }}
              right={{ label: "Number of Children (digits only):", value: numChildren, onChange: setNumChildren }}
              readOnly={ro}
            />
          </div>

          {/* ══ SECTION B — Qualifications ══════════════════════════════ */}
          <SectionHead>B.  Educational and Professional Qualifications{REQ}</SectionHead>

          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #000", width: 24, padding: "3px 4px" }}></th>
                <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "left", fontWeight: 700 }}>Institution</th>
                <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "left", fontWeight: 700, width: 90 }}>Date</th>
                <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "left", fontWeight: 700 }}>Qualification Received</th>
              </tr>
            </thead>
            <tbody>
              {quals.map((q, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #000", padding: "2px 4px", textAlign: "center", fontWeight: 700 }}>
                    {["i.", "ii.", "iii."][i]}
                  </td>
                  <td className="sod-td-input">
                    <F value={q.institution} onChange={(v) => updateQual(i, "institution", v)} style={{ width: "100%" }} readOnly={ro} placeholder="e.g. UNILAG" />
                  </td>
                  <td className="sod-td-input">
                    <F value={q.date} onChange={(v) => updateQual(i, "date", v)} style={{ width: "100%" }} readOnly={ro} placeholder="e.g. 2018" />
                  </td>
                  <td className="sod-td-input">
                    <F value={q.qualificationReceived} onChange={(v) => updateQual(i, "qualificationReceived", v)} style={{ width: "100%" }} readOnly={ro} placeholder="e.g. B.Sc." />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>{/* end page 1 */}

        {/* ════════════════════════════════════════════════════════════════
            PAGE 2
        ════════════════════════════════════════════════════════════════ */}
        <div className="sod-paper sod-page2" style={{ ...PAPER_STYLE, marginTop: 0 }}>

          {/* Page number */}
          <div style={{ textAlign: "center", fontSize: 12, marginBottom: 16 }}>2</div>

          {/* ══ SECTION C ═══════════════════════════════════════════════ */}
          <SectionHead>C.  Spiritual Information</SectionHead>

          {/* 12. Places of worship */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ marginBottom: 8, fontSize: 12 }}>
              12. List your place(s) of worship for the past five years
            </div>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #000", width: 24, padding: "3px 4px" }}></th>
                  <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "center", fontWeight: 700 }}>Name</th>
                  <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "center", fontWeight: 700 }}>Address</th>
                  <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "center", fontWeight: 700, width: 80 }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {wp.map((row, i) => (
                  <tr key={i}>
                    <td style={{ border: "1px solid #000", padding: "2px 4px", textAlign: "center", fontWeight: 700 }}>
                      {["I.", "II.", "III."][i]}
                    </td>
                    <td className="sod-td-input">
                      <F value={row.name} onChange={(v) => updateWp(i, "name", v)} style={{ width: "100%" }} readOnly={ro} />
                    </td>
                    <td className="sod-td-input">
                      <F value={row.address} onChange={(v) => updateWp(i, "address", v)} style={{ width: "100%" }} readOnly={ro} />
                    </td>
                    <td className="sod-td-input">
                      <F value={row.date} onChange={(v) => updateWp(i, "date", v)} style={{ width: "100%" }} readOnly={ro} placeholder="e.g. 2020–2023" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 13. Positions held */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontSize: 12 }}>
              13. What position did you hold in the above place(s)?
            </div>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #000", width: 24, padding: "3px 4px" }}></th>
                  <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "center", fontWeight: 700 }}>Church Name</th>
                  <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "center", fontWeight: 700 }}>Position Held</th>
                </tr>
              </thead>
              <tbody>
                {ph.map((row, i) => (
                  <tr key={i}>
                    <td style={{ border: "1px solid #000", padding: "2px 4px", textAlign: "center", fontWeight: 700 }}>
                      {["I.", "II.", "III."][i]}
                    </td>
                    <td className="sod-td-input">
                      <F value={row.name} onChange={(v) => updatePh(i, "name", v)} style={{ width: "100%" }} readOnly={ro} />
                    </td>
                    <td className="sod-td-input">
                      <F value={row.position} onChange={(v) => updatePh(i, "position", v)} style={{ width: "100%" }} readOnly={ro} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 14 onwards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <PairedRow
              left={{  label: "14. Salvation Date:", value: salvationDate, onChange: setSalvationDate, required: true }}
              right={{ label: "Where:", value: salvationWhere, onChange: setSalvationWhere, required: true }}
              readOnly={ro}
            />

            <PairedRow
              left={{  label: "15. Water Baptism Date (by Immersion):", value: waterBaptismDate, onChange: setWaterBaptismDate, required: true }}
              right={{ label: "Church:", value: waterBaptismChurch, onChange: setWaterBaptismChurch, required: true }}
              readOnly={ro}
            />

            <PairedRow
              left={{  label: "16. Holy Spirit Baptism Date (with speaking in tongues):", value: holyGhostDate, onChange: setHolyGhostDate, required: true }}
              right={{ label: "Where:", value: holyGhostWhere, onChange: setHolyGhostWhere, required: true }}
              readOnly={ro}
            />

            <FullRow label="17. Current Parish Pastor Name:" value={pastorName} onChange={setPastorName} readOnly={ro} required />

            <FullRow label="18. Current Parish Pastor Phone Number:" value={pastorPhone} onChange={setPastorPhone} readOnly={ro} />

            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <FullRow label="19. Your Activity / Department in your Current Parish:" value={activity1} onChange={setActivity1} readOnly={ro} />
              <F value={activity2} onChange={setActivity2} style={{ width: "100%" }} readOnly={ro} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span>20. Are you currently running or do you intend to run another training alongside SOD?</span>
              <Chk label="Yes" checked={otherTraining === "yes"} onChange={() => setOtherTraining(otherTraining === "yes" ? "" : "yes")} readOnly={ro} />
              <Chk label="No"  checked={otherTraining === "no"}  onChange={() => setOtherTraining(otherTraining === "no"  ? "" : "no")}  readOnly={ro} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <span>21. Does your Current Parish Pastor know you:</span>
              {["Closely", "Intimately", "Just as a member"].map((opt) => (
                <Chk key={opt} label={opt} checked={pastorKnows === opt} onChange={() => setPastorKnows(pastorKnows === opt ? "" : opt)} readOnly={ro} />
              ))}
            </div>
          </div>

          {/* ══ SECTION D ═══════════════════════════════════════════════ */}
          <SectionHead>D.  Other Relevant Information:</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <F value={otherInfo1} onChange={setOtherInfo1} style={{ width: "100%" }} readOnly={ro} />
            <F value={otherInfo2} onChange={setOtherInfo2} style={{ width: "100%" }} readOnly={ro} />
          </div>

          {/* ══ SECTION E — Declaration ═════════════════════════════════ */}
          <SectionHead>E.  Declaration:</SectionHead>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
            <span>I,</span>
            <F value={declName} onChange={setDeclName} style={{ flex: 1 }} readOnly={ro} />
            <span style={{ whiteSpace: "nowrap" }}> of</span>
            <F value={declOf} onChange={setDeclOf} style={{ flex: 1 }} readOnly={ro} />
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.7, margin: "0 0 12px 0" }}>
            Hereby promise that if taken as an S.O.D student, I will abide by the rules and regulations of
            the School of Disciples, obey the Authorities of the school and pray for them. I also promise
            not to be a stumbling block in the way of my fellow students.
          </p>

          {/* Consent checkbox */}
          {mode !== "view" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: ro ? "default" : "pointer", fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={mode === "blank" ? false : consent}
                  onChange={ro ? undefined : () => setConsent((p) => !p)}
                  readOnly={ro}
                  style={{ width: 14, height: 14, marginTop: 2, cursor: ro ? "default" : "pointer",
                           accentColor: "#000080" }}
                />
                <span>
                  I confirm that the information provided above is true and correct, and I consent to this
                  application being processed by the school administration.{" "}
                  {!ro && <span style={{ color: "red" }}>*</span>}
                </span>
              </label>
            </div>
          )}

          {/* Signature line */}
          <div style={{ display: "flex", gap: 48, marginTop: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ borderBottom: "1px solid #000", height: 30 }} />
              <div style={{ fontSize: 10, textAlign: "center", marginTop: 3 }}>Signature</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ borderBottom: "1px solid #000", height: 30 }} />
              <div style={{ fontSize: 10, textAlign: "center", marginTop: 3 }}>Date</div>
            </div>
          </div>

          {/* ══ SECTION F ═══════════════════════════════════════════════ */}
          <SectionHead>F.  Official Remarks:</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <F value={remarks1} onChange={setRemarks1} style={{ width: "100%" }} readOnly={ro} />
            <F value={remarks2} onChange={setRemarks2} style={{ width: "100%" }} readOnly={ro} />
          </div>

        </div>{/* end page 2 */}
      </div>{/* end wrapper */}
    </>
  );
}
