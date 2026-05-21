"use client";

/**
 * SomFormCore — multi-mode SOM application form
 *
 * mode = "blank"  → read-only, empty, Print Blank Form button only
 * mode = "fill"   → editable, Print + Submit buttons
 * mode = "view"   → read-only, pre-filled from initialData, Print Filled Form button only
 */

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Printer, Send, CheckCircle, XCircle } from "lucide-react";
import { createSchoolOfMinistry, uploadProfilePicture, type SchoolOfMinistryFullResponse } from "@/lib/api";

export type SomMode = "blank" | "fill" | "view";

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
export default function SomFormCore({
  mode,
  initialData,
}: {
  mode: SomMode;
  initialData?: SchoolOfMinistryFullResponse;
}) {
  const ro = mode === "blank" || mode === "view";
  const router = useRouter();

  /* ── Section A — Biographical Data ── */
  const [surname,    setSurname]    = useState(initialData?.lastName   ?? "");
  const [firstName,  setFirstName]  = useState(initialData?.firstName  ?? "");
  const [middleName, setMiddleName] = useState(initialData?.middleName ?? "");
  const [sex,        setSex]        = useState(() => {
    const s = initialData?.sex ?? "";
    if (!s) return "";
    if (s.toUpperCase() === "MALE")   return "Male";
    if (s.toUpperCase() === "FEMALE") return "Female";
    return s;
  });
  const [dob,        setDob]        = useState(initialData?.dateOfBirth ?? "");
  const [marital,    setMarital]    = useState(() => {
    const m = initialData?.maritalStatus ?? "";
    if (!m) return "";
    const cap = m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
    return MARITAL.includes(cap) ? cap : m;
  });
  const [numChildren, setNumChildren] = useState(
    initialData?.noOfChildren != null ? String(initialData.noOfChildren) : ""
  );
  const [spouseName,  setSpouseName]  = useState(initialData?.spouseName ?? "");

  /* ── Section B — Address ── */
  const [homeAddress,   setHomeAddress]   = useState(initialData?.homeAddress   ?? "");
  const [countryCode,   setCountryCode]   = useState(initialData?.countryCode   ?? "234");
  const [phone,         setPhone]         = useState(initialData?.phoneNumber   ?? "");
  const [occupation,    setOccupation]    = useState(initialData?.occupation    ?? "");
  const [placeOfWork,   setPlaceOfWork]   = useState(initialData?.placeOfWork   ?? "");
  const [workPhone,     setWorkPhone]     = useState(initialData?.workPhoneNumber ?? "");
  const [officeAddress, setOfficeAddress] = useState(initialData?.officeAddress  ?? "");

  /* ── Section C — Educational Qualifications (4 rows) ── */
  const [quals, setQuals] = useState(() => {
    const fromData = (initialData?.qualifications ?? []).map((q) => ({
      schoolAttended:        q.schoolAttended        ?? "",
      dates:                 q.dates                 ?? "",
      qualificationReceived: q.qualificationReceived ?? "",
    }));
    while (fromData.length < 4) fromData.push({ schoolAttended: "", dates: "", qualificationReceived: "" });
    return fromData.slice(0, 4);
  });
  const updateQual = (i: number, k: keyof typeof quals[0], v: string) =>
    setQuals((prev) => prev.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  /* ── Section D — Christian History ── */
  /* 2 recent worship places — just names */
  const [worshipPlaces, setWorshipPlaces] = useState(() => {
    const fromData = (initialData?.recentWorshipPlaces ?? []).map((w) => w.name ?? "");
    while (fromData.length < 2) fromData.push("");
    return fromData.slice(0, 2);
  });
  const updateWp = (i: number, v: string) =>
    setWorshipPlaces((prev) => prev.map((r, idx) => idx === i ? v : r));

  const [salvationDate,         setSalvationDate]         = useState(initialData?.salvationDate           ?? "");
  const [salvationWhere,        setSalvationWhere]        = useState(initialData?.salvationLocation        ?? "");
  const [waterBaptismDate,      setWaterBaptismDate]      = useState(initialData?.waterBaptismDate         ?? "");
  const [waterBaptismChurch,    setWaterBaptismChurch]    = useState(initialData?.waterBaptismChurch       ?? "");
  const [holySpiritDate,        setHolySpiritDate]        = useState(initialData?.holySpiritBaptismDate    ?? "");
  const [holySpiritChurch,      setHolySpiritChurch]      = useState(initialData?.holySpiritBaptismChurch  ?? "");

  /* ── Section E — Departments in Church (3 rows) ── */
  const [depts, setDepts] = useState(() => {
    const fromData = (initialData?.churchDepartments ?? []).map((d) => ({
      name: d.name ?? "",
      date: d.date ?? "",
    }));
    while (fromData.length < 3) fromData.push({ name: "", date: "" });
    return fromData.slice(0, 3);
  });
  const updateDept = (i: number, k: keyof typeof depts[0], v: string) =>
    setDepts((prev) => prev.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  /* ── Section F — New Converts Class ── */
  const [newConverts, setNewConverts] = useState<"yes" | "no" | "">(
    initialData?.hasGoneThroughNewConvertsClass === true  ? "yes" :
    initialData?.hasGoneThroughNewConvertsClass === false ? "no"  : ""
  );

  /* ── Section G — Water Baptismal Class ── */
  const [waterClass, setWaterClass] = useState<"yes" | "no" | "">(
    initialData?.hasGoneThroughWaterBaptismalClass === true  ? "yes" :
    initialData?.hasGoneThroughWaterBaptismalClass === false ? "no"  : ""
  );

  /* ── Section H — Reasons for attending (5 lines) ── */
  const [reasons, setReasons] = useState<string[]>(() => {
    const fromData = [...(initialData?.reasonsForAttending ?? [])];
    while (fromData.length < 5) fromData.push("");
    return fromData.slice(0, 5);
  });
  const updateReason = (i: number, v: string) =>
    setReasons((prev) => prev.map((r, idx) => idx === i ? v : r));

  /* ── Section I — Other Information (3 lines) ── */
  const [otherInfoLines, setOtherInfoLines] = useState<string[]>(() => {
    const raw = initialData?.otherInformation ?? "";
    const parts = raw ? raw.split("\n") : [];
    while (parts.length < 3) parts.push("");
    return parts.slice(0, 3);
  });
  const updateOtherInfo = (i: number, v: string) =>
    setOtherInfoLines((prev) => prev.map((r, idx) => idx === i ? v : r));

  /* ── Section K — Official Remarks (3 lines, read-only in fill mode) ── */
  const [remarksLines, setRemarksLines] = useState<string[]>(() => {
    const raw = initialData?.officialRemarks ?? "";
    const parts = raw ? raw.split("\n") : [];
    while (parts.length < 3) parts.push("");
    return parts.slice(0, 3);
  });
  const updateRemark = (i: number, v: string) =>
    setRemarksLines((prev) => prev.map((r, idx) => idx === i ? v : r));

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
    const missing: string[] = [];
    if (!firstName.trim())   missing.push("First Name");
    if (!surname.trim())     missing.push("Last Name (Surname)");
    if (!countryCode.trim()) missing.push("Country Code");
    if (!phone.trim())       missing.push("Phone Number");
    if (phone.trim() && !/\d/.test(phone)) missing.push("Phone Number (must contain digits)");

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

      const qualItems = quals
        .filter((q) => q.schoolAttended.trim())
        .map((q) => ({
          schoolAttended:        q.schoolAttended.trim(),
          dates:                 q.dates.trim() || undefined,
          qualificationReceived: q.qualificationReceived.trim() || undefined,
        }));

      const wpItems = worshipPlaces
        .filter((n) => n.trim())
        .map((n) => ({ name: n.trim() }));

      const deptItems = depts
        .filter((d) => d.name.trim())
        .map((d) => ({
          name: d.name.trim(),
          date: d.date.trim() || undefined,
        }));

      const reasonItems = reasons.filter((r) => r.trim());

      const otherInfoStr = otherInfoLines.filter(Boolean).join("\n") || undefined;

      const normalisePhone = (raw: string, cc: string) => {
        let n = raw.trim().replace(/\D/g, "");
        if (n.startsWith("0") && cc.trim()) n = n.slice(1);
        return n;
      };

      const created = await createSchoolOfMinistry({
        firstName:    firstName.trim(),
        lastName:     surname.trim(),
        middleName:   middleName.trim()   || undefined,
        sex:          sexNorm as string | undefined,
        dateOfBirth:  dob.trim()          || undefined,
        maritalStatus: marital ? (maritalMap[marital] ?? marital.toUpperCase()) : undefined,
        noOfChildren: numChildren.trim() ? Number(numChildren.trim()) : undefined,
        spouseName:   spouseName.trim()   || undefined,
        countryCode:  countryCode.trim().replace(/^\+/, ""),
        phoneNumber:  normalisePhone(phone, countryCode),
        homeAddress:  homeAddress.trim()  || undefined,
        occupation:   occupation.trim()   || undefined,
        placeOfWork:  placeOfWork.trim()  || undefined,
        workPhoneNumber: workPhone.trim() ? normalisePhone(workPhone, countryCode) : undefined,
        officeAddress: officeAddress.trim() || undefined,
        profilePictureUrl,
        salvationDate:            salvationDate.trim()      || undefined,
        salvationLocation:        salvationWhere.trim()     || undefined,
        waterBaptismDate:         waterBaptismDate.trim()   || undefined,
        waterBaptismChurch:       waterBaptismChurch.trim() || undefined,
        holySpiritBaptismDate:    holySpiritDate.trim()     || undefined,
        holySpiritBaptismChurch:  holySpiritChurch.trim()   || undefined,
        hasGoneThroughNewConvertsClass:    newConverts === "yes" ? true : newConverts === "no" ? false : undefined,
        hasGoneThroughWaterBaptismalClass: waterClass  === "yes" ? true : waterClass  === "no" ? false : undefined,
        otherInformation: otherInfoStr,
        ...(qualItems.length  ? { qualificationRequests: qualItems }  : {}),
        ...(wpItems.length    ? { recentWorshipPlaces:   wpItems }    : {}),
        ...(deptItems.length  ? { churchDepartments:     deptItems }  : {}),
        ...(reasonItems.length ? { reasonsForAttending:  reasonItems } : {}),
      });

      const savedId = (created as { id?: string })?.id;
      if (!savedId) {
        setSubmitError(
          "The server accepted the form but did not return a record ID. Please check the SOM list or contact the backend team."
        );
        return;
      }

      setSubmitSuccess(true);
      setSubmitError("");
      setTimeout(() => router.push("/trainings/som"), 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit. Please try again.";
      setSubmitError(`${msg} (Check browser console → F12 → Console for the full server error.)`);
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
          <button
            onClick={() => router.push("/trainings/som")}
            style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}>
            ← Back to List
          </button>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
            {mode === "blank" ? "SOM Application Form — Blank"
              : mode === "view" ? "SOM Application Form — View Record"
              : "SOM Application Form — Fill & Submit"}
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
            Application submitted successfully! The record has been saved.
            <a href="/trainings/som" style={{ marginLeft: 12, color: "#15803D", textDecoration: "underline", fontWeight: 700 }}>
              View SOM List →
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
              <Image src="/sod-logo.svg" alt="SOM" width={60} height={60} style={{ objectFit: "contain", flexShrink: 0 }} />
              <div style={{ textAlign: "center", lineHeight: 1.65 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>THE REDEEMED CHRISTIAN CHURCH OF GOD</div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Rose of Sharon Parish</div>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>SCHOOL OF MINISTRY PROGRAMME</div>
                <div style={{ fontSize: 11, marginTop: 2, fontStyle: "italic" }}>(Please answer every question)</div>
              </div>
            </div>

            {/* Passport photo */}
            {mode === "fill" ? (
              <div
                className="sod-no-print"
                onClick={() => photoInputRef.current?.click()}
                style={{
                  width: 90, height: 110, border: !photoPreview ? "2px dashed #aaa" : "2px dashed #000080",
                  borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", flexShrink: 0, cursor: "pointer",
                  overflow: "hidden", background: photoPreview ? "transparent" : "#f9fafb",
                }}
                title="Click to upload passport photograph"
              >
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Passport" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span style={{ fontSize: 8, textAlign: "center", color: "#9CA3AF", lineHeight: 1.4, marginTop: 4 }}>
                      Photo<br />(click to upload)
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

          {/* ══ SECTION A — Biographical Data ═══════════════════════════ */}
          <SectionHead>A.  Biographical Data</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Name row */}
            <div>
              <div style={{ marginBottom: 6 }}>Name:</div>
              <div style={{ display: "flex", gap: 14, paddingLeft: 18 }}>
                {(
                  [
                    ["Surname *",    surname,    setSurname],
                    ["First Name *", firstName,  setFirstName],
                    ["Other Names",  middleName, setMiddleName],
                  ] as [string, string, (v: string) => void][]
                ).map(([lbl, val, setter]) => (
                  <div key={lbl} style={{ flex: 1 }}>
                    <F value={val} onChange={setter} style={{ width: "100%" }} readOnly={ro} />
                    <div style={{ fontSize: 9, textAlign: "center", color: "#666", marginTop: 2 }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sex + DOB */}
            <PairedRow
              left={{  label: "Sex:", value: sex, onChange: setSex }}
              right={{ label: "Date of Birth:", value: dob, onChange: setDob }}
              readOnly={ro}
            />

            {/* Marital Status */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
              <span>Marital Status:</span>
              {MARITAL.map((m) => (
                <Chk key={m} label={m} checked={marital === m} onChange={() => setMarital(marital === m ? "" : m)} readOnly={ro} />
              ))}
            </div>

            {/* No. of Children + Spouse */}
            <PairedRow
              left={{  label: "No. of Children:", value: numChildren, onChange: setNumChildren }}
              right={{ label: "Name of Spouse:", value: spouseName, onChange: setSpouseName }}
              readOnly={ro}
            />
          </div>

          {/* ══ SECTION B — Address ═════════════════════════════════════ */}
          <SectionHead>B.  Address</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FullRow label="Home Address:" value={homeAddress} onChange={setHomeAddress} readOnly={ro} />

            <PairedRow
              left={{  label: "Phone no.:", value: phone, onChange: setPhone, required: true }}
              right={{ label: "Occupation:", value: occupation, onChange: setOccupation }}
              readOnly={ro}
            />

            {/* Country code row */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, fontSize: 11, color: "#555" }}>
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

            <PairedRow
              left={{  label: "Place of Work:", value: placeOfWork, onChange: setPlaceOfWork }}
              right={{ label: "Phone no. (Work):", value: workPhone, onChange: setWorkPhone }}
              readOnly={ro}
            />

            <FullRow label="Office Address:" value={officeAddress} onChange={setOfficeAddress} readOnly={ro} />
          </div>

          {/* ══ SECTION C — Educational & Professional Qualifications ════ */}
          <SectionHead>C.  Educational &amp; Professional Qualifications</SectionHead>

          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #000", width: 24, padding: "3px 4px" }}></th>
                <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "left", fontWeight: 700 }}>Schools Attended</th>
                <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "left", fontWeight: 700, width: 90 }}>Dates</th>
                <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "left", fontWeight: 700 }}>Qualification Received</th>
              </tr>
            </thead>
            <tbody>
              {quals.map((q, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #000", padding: "2px 4px", textAlign: "center", fontWeight: 700 }}>
                    {["i.", "ii.", "iii.", "iv."][i]}
                  </td>
                  <td className="sod-td-input">
                    <F value={q.schoolAttended} onChange={(v) => updateQual(i, "schoolAttended", v)} style={{ width: "100%" }} readOnly={ro} placeholder="e.g. University of Lagos" />
                  </td>
                  <td className="sod-td-input">
                    <F value={q.dates} onChange={(v) => updateQual(i, "dates", v)} style={{ width: "100%" }} readOnly={ro} placeholder="e.g. 2015–2019" />
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

          {/* ══ SECTION D — Christian History ════════════════════════════ */}
          <SectionHead>D.  Christian History</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* 2 most recent worship places */}
            <div style={{ marginBottom: 4 }}>
              <div style={{ marginBottom: 6, fontSize: 12 }}>Two most recent places of worship:</div>
              {worshipPlaces.map((wp, i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, minWidth: 18 }}>{i + 1}.</span>
                  <F value={wp} onChange={(v) => updateWp(i, v)} style={{ flex: 1 }} readOnly={ro} placeholder="Church / Worship place name" />
                </div>
              ))}
            </div>

            <PairedRow
              left={{  label: "Date of Salvation:", value: salvationDate, onChange: setSalvationDate }}
              right={{ label: "Where:", value: salvationWhere, onChange: setSalvationWhere }}
              readOnly={ro}
            />

            <PairedRow
              left={{  label: "Date of Water Baptism:", value: waterBaptismDate, onChange: setWaterBaptismDate }}
              right={{ label: "Church:", value: waterBaptismChurch, onChange: setWaterBaptismChurch }}
              readOnly={ro}
            />

            <PairedRow
              left={{  label: "Date of Holy Spirit Baptism:", value: holySpiritDate, onChange: setHolySpiritDate }}
              right={{ label: "Church:", value: holySpiritChurch, onChange: setHolySpiritChurch }}
              readOnly={ro}
            />
          </div>

          {/* ══ SECTION E — Departments in Church ═══════════════════════ */}
          <SectionHead>E.  Departments in Church</SectionHead>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #000", width: 24, padding: "3px 4px" }}></th>
                <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "left", fontWeight: 700 }}>Department Name</th>
                <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "left", fontWeight: 700, width: 120 }}>Date Joined</th>
              </tr>
            </thead>
            <tbody>
              {depts.map((d, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #000", padding: "2px 4px", textAlign: "center", fontWeight: 700 }}>
                    {["I.", "II.", "III."][i]}
                  </td>
                  <td className="sod-td-input">
                    <F value={d.name} onChange={(v) => updateDept(i, "name", v)} style={{ width: "100%" }} readOnly={ro} placeholder="e.g. Choir" />
                  </td>
                  <td className="sod-td-input">
                    <F value={d.date} onChange={(v) => updateDept(i, "date", v)} style={{ width: "100%" }} readOnly={ro} placeholder="e.g. Jan 2020" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ SECTION F — New Converts Class ══════════════════════════ */}
          <SectionHead>F.  Have you gone through New Converts&apos; Class?</SectionHead>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Chk label="Yes" checked={newConverts === "yes"} onChange={() => setNewConverts(newConverts === "yes" ? "" : "yes")} readOnly={ro} />
            <Chk label="No"  checked={newConverts === "no"}  onChange={() => setNewConverts(newConverts === "no"  ? "" : "no")}  readOnly={ro} />
          </div>

          {/* ══ SECTION G — Water Baptismal Class ═══════════════════════ */}
          <SectionHead>G.  Have you gone through Water Baptismal Class?</SectionHead>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Chk label="Yes" checked={waterClass === "yes"} onChange={() => setWaterClass(waterClass === "yes" ? "" : "yes")} readOnly={ro} />
            <Chk label="No"  checked={waterClass === "no"}  onChange={() => setWaterClass(waterClass === "no"  ? "" : "no")}  readOnly={ro} />
          </div>

          {/* ══ SECTION H — Reasons for attending SOM ═══════════════════ */}
          <SectionHead>H.  Reasons for attending SOM</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {reasons.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontWeight: 700, minWidth: 18 }}>{i + 1}.</span>
                <F value={r} onChange={(v) => updateReason(i, v)} style={{ flex: 1 }} readOnly={ro} />
              </div>
            ))}
          </div>

          {/* ══ SECTION I — Other Information ════════════════════════════ */}
          <SectionHead>I.  Other Information</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {otherInfoLines.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontWeight: 700, minWidth: 18 }}>{i + 1}.</span>
                <F value={r} onChange={(v) => updateOtherInfo(i, v)} style={{ flex: 1 }} readOnly={ro} />
              </div>
            ))}
          </div>

          {/* ══ SECTION J — Signature + Date ═════════════════════════════ */}
          <SectionHead>J.  Signature &amp; Date</SectionHead>
          <div style={{ display: "flex", gap: 48, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ borderBottom: "1px solid #000", height: 36 }} />
              <div style={{ fontSize: 10, textAlign: "center", marginTop: 3 }}>Signature</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ borderBottom: "1px solid #000", height: 36 }} />
              <div style={{ fontSize: 10, textAlign: "center", marginTop: 3 }}>Date</div>
            </div>
          </div>

          {/* ══ SECTION K — Official Remarks ═════════════════════════════ */}
          <SectionHead>K.  Official Remarks</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {remarksLines.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontWeight: 700, minWidth: 18 }}>{i + 1}.</span>
                <F
                  value={r}
                  onChange={mode === "view" ? (v) => updateRemark(i, v) : undefined}
                  style={{ flex: 1 }}
                  readOnly={mode !== "view"}
                />
              </div>
            ))}
          </div>

        </div>{/* end page 2 */}
      </div>{/* end wrapper */}
    </>
  );
}
