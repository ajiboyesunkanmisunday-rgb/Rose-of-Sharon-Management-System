"use client";

/**
 * SomFormCore — digital replica of the physical SOM form
 *
 * Matches the exact bordered-table layout of the physical form.
 *
 * mode = "blank"  → read-only, empty, Print Blank Form button only
 * mode = "fill"   → editable, Print + Submit buttons
 * mode = "view"   → read-only, pre-filled from initialData
 */

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Printer, Send, CheckCircle, XCircle } from "lucide-react";
import {
  createSchoolOfMinistry,
  uploadProfilePicture,
  type SchoolOfMinistryFullResponse,
} from "@/lib/api";

export type SomMode = "blank" | "fill" | "view";

/* ── Table/cell style constants ─────────────────────────────────────────── */
const T: React.CSSProperties = {
  borderCollapse: "collapse",
  width: "100%",
  marginBottom: 16,
  fontSize: 12,
};
/* Label cell — bold text, no editable content */
const LBL: React.CSSProperties = {
  border: "1px solid #000",
  padding: "4px 8px",
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  fontSize: 12,
};
/* Input cell — holds a CI component */
const CEL: React.CSSProperties = {
  border: "1px solid #000",
  padding: "2px 6px",
  verticalAlign: "middle",
};
/* Numbered cell (1. 2. 3. …) */
const NUM: React.CSSProperties = {
  border: "1px solid #000",
  padding: "4px 6px",
  fontWeight: 700,
  textAlign: "center",
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  width: 28,
};

const PAPER: React.CSSProperties = {
  background: "#fff",
  width: 794,
  margin: "0 auto",
  padding: "40px 56px",
  boxShadow: "0 8px 40px rgba(0,0,0,0.28)",
  fontFamily: "Times New Roman, serif",
  fontSize: 12,
  color: "#000",
  lineHeight: 1.5,
};

/* ── Cell Input — fills a table cell ────────────────────────────────────── */
function CI({
  value,
  onChange,
  readOnly,
  placeholder,
  style,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
}) {
  return (
    <input
      value={value}
      onChange={readOnly ? undefined : (e) => onChange?.(e.target.value)}
      readOnly={readOnly}
      placeholder={readOnly ? undefined : placeholder}
      style={{
        border: "none",
        outline: "none",
        background: "transparent",
        width: "100%",
        fontSize: 12,
        fontFamily: "Times New Roman, serif",
        color: "#000",
        padding: "2px 0",
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
}

/* ── Section heading — e.g. "A:    BIOGRAPHICAL DATA" ───────────────────── */
function SH({ letter, title }: { letter: string; title: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "baseline", gap: 16,
      fontWeight: 700, fontSize: 12,
      textTransform: "uppercase",
      marginTop: 20, marginBottom: 6,
    }}>
      <span style={{ minWidth: 24 }}>{letter}:</span>
      <span>{title}</span>
    </div>
  );
}

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

  /* ── Section A — Biographical Data ─────────────────────────────────────── */
  const [surname,     setSurname]     = useState(initialData?.lastName   ?? "");
  const [firstName,   setFirstName]   = useState(initialData?.firstName  ?? "");
  const [middleName,  setMiddleName]  = useState(initialData?.middleName ?? "");
  const [sex,         setSex]         = useState(() => {
    const s = initialData?.sex ?? "";
    if (s.toUpperCase() === "MALE")   return "Male";
    if (s.toUpperCase() === "FEMALE") return "Female";
    return s;
  });
  const [dob,         setDob]         = useState(initialData?.dateOfBirth ?? "");
  const [marital,     setMarital]     = useState(() => {
    const m = initialData?.maritalStatus ?? "";
    if (!m) return "";
    return m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
  });
  const [numChildren, setNumChildren] = useState(
    initialData?.noOfChildren != null ? String(initialData.noOfChildren) : ""
  );
  const [spouseName,  setSpouseName]  = useState(initialData?.spouseName ?? "");

  /* ── Section B — Address ────────────────────────────────────────────────── */
  const [homeAddress,   setHomeAddress]   = useState(initialData?.homeAddress    ?? "");
  const [countryCode,   setCountryCode]   = useState(initialData?.countryCode    ?? "234");
  const [phone,         setPhone]         = useState(initialData?.phoneNumber     ?? "");
  const [occupation,    setOccupation]    = useState(initialData?.occupation     ?? "");
  const [placeOfWork,   setPlaceOfWork]   = useState(initialData?.placeOfWork    ?? "");
  const [workPhone,     setWorkPhone]     = useState(initialData?.workPhoneNumber ?? "");
  const [officeAddress, setOfficeAddress] = useState(initialData?.officeAddress  ?? "");

  /* ── Section C — Educational Qualifications (4 rows) ───────────────────── */
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

  /* ── Section D — Christian History ─────────────────────────────────────── */
  const [worshipPlaces, setWorshipPlaces] = useState(() => {
    const fromData = (initialData?.recentWorshipPlaces ?? []).map((w) => w.name ?? "");
    while (fromData.length < 2) fromData.push("");
    return fromData.slice(0, 2);
  });
  const updateWp = (i: number, v: string) =>
    setWorshipPlaces((prev) => prev.map((r, idx) => idx === i ? v : r));

  const [salvationDate,      setSalvationDate]      = useState(initialData?.salvationDate          ?? "");
  const [salvationWhere,     setSalvationWhere]      = useState(initialData?.salvationLocation       ?? "");
  const [waterBaptismDate,   setWaterBaptismDate]    = useState(initialData?.waterBaptismDate        ?? "");
  const [waterBaptismChurch, setWaterBaptismChurch]  = useState(initialData?.waterBaptismChurch      ?? "");
  const [holySpiritDate,     setHolySpiritDate]      = useState(initialData?.holySpiritBaptismDate   ?? "");
  const [holySpiritChurch,   setHolySpiritChurch]    = useState(initialData?.holySpiritBaptismChurch ?? "");

  /* ── Section E — Departments (3 rows with dates) ────────────────────────── */
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

  /* ── Section F — New Converts Class (free text matching physical form) ─── */
  const [newConvertsText, setNewConvertsText] = useState(() => {
    if (initialData?.hasGoneThroughNewConvertsClass === true)  return "Yes";
    if (initialData?.hasGoneThroughNewConvertsClass === false) return "No";
    return "";
  });

  /* ── Section G — Water Baptismal Class ─────────────────────────────────── */
  const [waterClassText, setWaterClassText] = useState(() => {
    if (initialData?.hasGoneThroughWaterBaptismalClass === true)  return "Yes";
    if (initialData?.hasGoneThroughWaterBaptismalClass === false) return "No";
    return "";
  });

  /* ── Section H — Reasons for attending (5 lines) ───────────────────────── */
  const [reasons, setReasons] = useState<string[]>(() => {
    const fromData = [...(initialData?.reasonsForAttending ?? [])];
    while (fromData.length < 5) fromData.push("");
    return fromData.slice(0, 5);
  });
  const updateReason = (i: number, v: string) =>
    setReasons((prev) => prev.map((r, idx) => idx === i ? v : r));

  /* ── Section I — Other Information (3 lines) ────────────────────────────── */
  const [otherInfoLines, setOtherInfoLines] = useState<string[]>(() => {
    const raw = initialData?.otherInformation ?? "";
    const parts = raw ? raw.split("\n") : [];
    while (parts.length < 3) parts.push("");
    return parts.slice(0, 3);
  });
  const updateOtherInfo = (i: number, v: string) =>
    setOtherInfoLines((prev) => prev.map((r, idx) => idx === i ? v : r));

  /* ── Section K — Official Remarks (3 lines) ─────────────────────────────── */
  const [remarksLines, setRemarksLines] = useState<string[]>(() => {
    const raw = initialData?.officialRemarks ?? "";
    const parts = raw ? raw.split("\n") : [];
    while (parts.length < 3) parts.push("");
    return parts.slice(0, 3);
  });
  const updateRemark = (i: number, v: string) =>
    setRemarksLines((prev) => prev.map((r, idx) => idx === i ? v : r));

  /* ── Photo ──────────────────────────────────────────────────────────────── */
  const [photo,        setPhoto]        = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.profilePictureUrl ?? null);
  const [uploading,    setUploading]    = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  /* ── Submit ─────────────────────────────────────────────────────────────── */
  const [submitting,    setSubmitting]    = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError,   setSubmitError]   = useState("");

  const handleSubmit = async () => {
    const missing: string[] = [];
    if (!firstName.trim())   missing.push("First Name");
    if (!surname.trim())     missing.push("Surname");
    if (!countryCode.trim()) missing.push("Country Code");
    if (!phone.trim())       missing.push("Phone Number");
    if (phone.trim() && !/\d/.test(phone)) missing.push("Phone Number (must contain digits)");
    if (missing.length > 0) {
      setSubmitError(`Please fill in: ${missing.join(", ")}.`);
      return;
    }

    const parseYesNo = (text: string): boolean | undefined => {
      const t = text.trim().toLowerCase();
      if (t === "yes" || t === "y") return true;
      if (t === "no"  || t === "n") return false;
      return undefined;
    };

    const normalisePhone = (raw: string, cc: string) => {
      let n = raw.trim().replace(/\D/g, "");
      if (n.startsWith("0") && cc.trim()) n = n.slice(1);
      return n;
    };

    const qualItems = quals
      .filter((q) => q.schoolAttended.trim())
      .map((q) => ({
        schoolAttended:        q.schoolAttended.trim(),
        dates:                 q.dates.trim()                 || undefined,
        qualificationReceived: q.qualificationReceived.trim() || undefined,
      }));

    const wpItems = worshipPlaces
      .filter((n) => n.trim())
      .map((n) => ({ name: n.trim() }));

    const deptItems = depts
      .filter((d) => d.name.trim())
      .map((d) => ({ name: d.name.trim(), date: d.date.trim() || undefined }));

    const reasonItems  = reasons.filter((r) => r.trim());
    const otherInfoStr = otherInfoLines.filter(Boolean).join("\n") || undefined;

    const maritalMap: Record<string, string> = {
      Single: "SINGLE", Married: "MARRIED", Engaged: "ENGAGED",
      Divorced: "DIVORCED", Widowed: "WIDOWED",
    };
    const sexNorm = sex.trim().toLowerCase().startsWith("f") ? "FEMALE"
                  : sex.trim().toLowerCase().startsWith("m") ? "MALE"
                  : sex.trim() || undefined;

    setSubmitError("");
    setSubmitting(true);
    try {
      let profilePictureUrl: string | undefined;
      if (photo) {
        setUploading(true);
        profilePictureUrl = await uploadProfilePicture(photo);
        setUploading(false);
      }

      const created = await createSchoolOfMinistry({
        firstName:    firstName.trim(),
        lastName:     surname.trim(),
        middleName:   middleName.trim()   || undefined,
        sex:          sexNorm as string | undefined,
        dateOfBirth:  dob.trim()          || undefined,
        maritalStatus: marital.trim()
          ? (maritalMap[marital.trim()] ?? marital.trim().toUpperCase())
          : undefined,
        noOfChildren: numChildren.trim() ? Number(numChildren.trim()) : undefined,
        spouseName:   spouseName.trim()  || undefined,
        countryCode:  countryCode.trim().replace(/^\+/, ""),
        phoneNumber:  normalisePhone(phone, countryCode),
        homeAddress:  homeAddress.trim()   || undefined,
        occupation:   occupation.trim()    || undefined,
        placeOfWork:  placeOfWork.trim()   || undefined,
        workPhoneNumber: workPhone.trim()
          ? normalisePhone(workPhone, countryCode)
          : undefined,
        officeAddress: officeAddress.trim() || undefined,
        profilePictureUrl,
        salvationDate:           salvationDate.trim()      || undefined,
        salvationLocation:       salvationWhere.trim()     || undefined,
        waterBaptismDate:        waterBaptismDate.trim()   || undefined,
        waterBaptismChurch:      waterBaptismChurch.trim() || undefined,
        holySpiritBaptismDate:   holySpiritDate.trim()     || undefined,
        holySpiritBaptismChurch: holySpiritChurch.trim()   || undefined,
        hasGoneThroughNewConvertsClass:    parseYesNo(newConvertsText),
        hasGoneThroughWaterBaptismalClass: parseYesNo(waterClassText),
        otherInformation: otherInfoStr,
        ...(qualItems.length   ? { qualificationRequests: qualItems }  : {}),
        ...(wpItems.length     ? { recentWorshipPlaces:   wpItems }    : {}),
        ...(deptItems.length   ? { churchDepartments:     deptItems }  : {}),
        ...(reasonItems.length ? { reasonsForAttending:   reasonItems } : {}),
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
      // router.refresh() busts the Next.js Router Cache so the list page
      // remounts and re-fetches data instead of serving a stale cached version.
      setTimeout(() => { router.refresh(); router.push("/trainings/som"); }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit. Please try again.";
      setSubmitError(`${msg} (Check browser console → F12 → Console for the full server error.)`);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 10mm 14mm; }

        @media print {
          .som-no-print   { display: none !important; }
          .som-wrapper    { background: #fff !important; padding: 0 !important; min-height: auto !important; }
          .som-paper      { box-shadow: none !important; width: 100% !important; max-width: none !important;
                            margin: 0 !important; padding: 20px 30px !important; }
          .som-page2      { page-break-before: always; break-before: page; margin-top: 0 !important; }
        }

        .som-ci:focus { background: #eef2ff !important; }
        .som-ci[readonly]:focus { background: transparent !important; }
      `}</style>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="som-no-print" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "#000080", boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 24px" }}>
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
                  color: "#fff", border: "none", borderRadius: 8,
                  padding: "7px 18px", fontSize: 13, fontWeight: 700,
                  cursor: submitting || uploading || submitSuccess ? "not-allowed" : "pointer",
                  opacity: submitting || uploading ? 0.7 : 1,
                }}
              >
                {submitSuccess ? <><CheckCircle size={14} /> Saved to System</>
                  : uploading  ? <><Send size={14} /> Uploading Photo…</>
                  : submitting ? <><Send size={14} /> Submitting…</>
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

        {submitError && (
          <div style={{
            background: "#FEF2F2", color: "#991B1B", padding: "8px 24px",
            fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
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

        {submitSuccess && (
          <div style={{
            background: "#F0FDF4", color: "#15803D", padding: "8px 24px",
            fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
            borderTop: "1px solid #BBF7D0",
          }}>
            <CheckCircle size={14} />
            Application submitted successfully!
            <a href="/trainings/som" style={{ marginLeft: 12, color: "#15803D", textDecoration: "underline", fontWeight: 700 }}>
              View SOM List →
            </a>
          </div>
        )}
      </div>

      {/* ── Gray wrapper ──────────────────────────────────────────────────── */}
      <div className="som-wrapper" style={{
        minHeight: "100vh", background: "#b0bec5",
        paddingTop: submitError || submitSuccess ? 110 : 72, paddingBottom: 48,
        display: "flex", flexDirection: "column", gap: 32,
        transition: "padding-top 0.2s",
      }}>

        {/* ══════════════════ PAGE 1 ══════════════════════════════════════ */}
        <div className="som-paper" style={PAPER}>

          {/* ── HEADER ───────────────────────────────────────────────── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>

            {/* Centered title block */}
            <div style={{ flex: 1, textAlign: "center", lineHeight: 2 }}>
              <div style={{ fontFamily: "Times New Roman, serif", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>
                THE REDEEMED CHRISTIAN CHURCH OF GOD
              </div>
              <div style={{ fontFamily: "cursive, Georgia, serif", fontSize: 16, fontStyle: "italic", fontWeight: 700 }}>
                Rose of Sharon Parish
              </div>
              <div style={{ fontFamily: "Times New Roman, serif", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>
                SCHOOL OF MINISTRY PROGRAMME
              </div>
              <div style={{ fontFamily: "Times New Roman, serif", fontSize: 12, fontStyle: "italic" }}>
                (Please answer every question)
              </div>
            </div>

            {/* Passport photo box */}
            {mode === "fill" ? (
              <div
                className="som-no-print"
                onClick={() => photoInputRef.current?.click()}
                style={{
                  width: 80, height: 96, border: "1px solid #000", flexShrink: 0,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", cursor: "pointer", overflow: "hidden",
                  background: photoPreview ? "transparent" : "#fafafa",
                }}
                title="Click to upload passport photograph"
              >
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Passport" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 8, textAlign: "center", color: "#9CA3AF", lineHeight: 1.4 }}>
                    Passport<br />Photo<br />(click)
                  </span>
                )}
              </div>
            ) : (
              <div style={{
                width: 80, height: 96, border: "1px solid #000", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
              }}>
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Passport" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 8, textAlign: "center", color: "#666", lineHeight: 1.6 }}>
                    Passport<br />Photograph
                  </span>
                )}
              </div>
            )}
            {mode === "fill" && (
              <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
            )}
          </div>

          {/* ══ SECTION A — BIOGRAPHICAL DATA ════════════════════════════ */}
          <SH letter="A" title="Biographical Data" />
          <table style={T}>
            <tbody>
              <tr>
                <td style={LBL}>Surname:</td>
                <td style={CEL}><CI value={surname} onChange={setSurname} readOnly={ro} /></td>
                <td style={LBL}>First name:</td>
                <td style={CEL}><CI value={firstName} onChange={setFirstName} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={LBL}>Other Names:</td>
                <td style={CEL}><CI value={middleName} onChange={setMiddleName} readOnly={ro} /></td>
                <td style={LBL}>Sex:</td>
                <td style={CEL}><CI value={sex} onChange={setSex} readOnly={ro} placeholder="Male / Female" /></td>
              </tr>
              <tr>
                <td style={LBL}>Date of Birth:</td>
                <td style={CEL}><CI value={dob} onChange={setDob} readOnly={ro} placeholder="yyyy-mm-dd" /></td>
                <td style={LBL}>Marital Status:</td>
                <td style={CEL}><CI value={marital} onChange={setMarital} readOnly={ro} placeholder="Single / Married…" /></td>
              </tr>
              <tr>
                <td style={LBL}>No. of Children:</td>
                <td style={{ ...CEL, width: "18%" }}><CI value={numChildren} onChange={setNumChildren} readOnly={ro} /></td>
                <td style={{ ...LBL, fontWeight: 400 }} colSpan={2}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ whiteSpace: "nowrap" }}>Name of Spouse:</span>
                    <CI value={spouseName} onChange={setSpouseName} readOnly={ro} style={{ flex: 1 }} />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ══ SECTION B — ADDRESS ══════════════════════════════════════ */}
          <SH letter="B" title="Address" />
          <table style={T}>
            <tbody>
              <tr>
                <td style={LBL}>Home Address:</td>
                <td style={{ ...CEL, width: "46%" }}><CI value={homeAddress} onChange={setHomeAddress} readOnly={ro} /></td>
                <td style={LBL}>Phone no.:</td>
                <td style={CEL}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {!ro && (
                      <>
                        <CI value={countryCode} onChange={setCountryCode} readOnly={ro} placeholder="234" style={{ width: 40 }} />
                        <span style={{ color: "#555" }}>-</span>
                      </>
                    )}
                    <CI value={phone} onChange={setPhone} readOnly={ro} placeholder="08012345678" style={{ flex: 1 }} />
                  </div>
                </td>
              </tr>
              <tr>
                <td style={LBL}>Occupation:</td>
                <td style={CEL} colSpan={3}><CI value={occupation} onChange={setOccupation} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={LBL}>Place of Work:</td>
                <td style={{ ...CEL, width: "46%" }}><CI value={placeOfWork} onChange={setPlaceOfWork} readOnly={ro} /></td>
                <td style={LBL}>Phone no.:</td>
                <td style={CEL}><CI value={workPhone} onChange={setWorkPhone} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={LBL}>Office Address:</td>
                <td style={CEL} colSpan={3}><CI value={officeAddress} onChange={setOfficeAddress} readOnly={ro} /></td>
              </tr>
            </tbody>
          </table>

          {/* ══ SECTION C — EDUCATIONAL QUALIFICATIONS ═══════════════════ */}
          <SH letter="C" title="Educational &amp; Professional Qualification/Schools" />
          <table style={T}>
            <thead>
              <tr>
                <th style={{ ...LBL, textAlign: "center", width: "42%" }}>Schools Attended</th>
                <th style={{ ...LBL, textAlign: "center", width: "18%" }}>Dates</th>
                <th style={{ ...LBL, textAlign: "center" }}>Qualification Received</th>
              </tr>
            </thead>
            <tbody>
              {quals.map((q, i) => (
                <tr key={i}>
                  <td style={CEL}><CI value={q.schoolAttended} onChange={(v) => updateQual(i, "schoolAttended", v)} readOnly={ro} /></td>
                  <td style={CEL}><CI value={q.dates} onChange={(v) => updateQual(i, "dates", v)} readOnly={ro} /></td>
                  <td style={CEL}><CI value={q.qualificationReceived} onChange={(v) => updateQual(i, "qualificationReceived", v)} readOnly={ro} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ SECTION D — CHRISTIAN HISTORY ════════════════════════════ */}
          <SH letter="D" title="Christian History" />
          <div style={{ fontSize: 12, marginBottom: 6, fontStyle: "italic" }}>
            List your 2 most recent places of worship apart from Rose of Sharon Parish (including non-Christian)
          </div>

          {/* 2 worship places */}
          <table style={{ ...T, marginBottom: 12 }}>
            <tbody>
              {worshipPlaces.map((wp, i) => (
                <tr key={i}>
                  <td style={{ ...NUM, width: 28 }}>{i + 1}.</td>
                  <td style={CEL}><CI value={wp} onChange={(v) => updateWp(i, v)} readOnly={ro} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Spiritual dates table */}
          <table style={T}>
            <tbody>
              <tr>
                <td style={{ ...LBL, width: "42%", fontWeight: 700 }}>Date of Salvation:</td>
                <td style={{ ...LBL, width: "18%" }}>Where?</td>
                <td style={CEL}><CI value={salvationWhere} onChange={setSalvationWhere} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={{ ...CEL, fontWeight: 400 }}>
                  <CI value={salvationDate} onChange={setSalvationDate} readOnly={ro} placeholder="e.g. 15 March 2010" />
                </td>
                <td style={LBL} colSpan={2}></td>
              </tr>
              <tr>
                <td style={{ ...LBL, fontWeight: 400 }}>Date of water Baptism by immersion:</td>
                <td style={LBL}>Church?</td>
                <td style={CEL}><CI value={waterBaptismChurch} onChange={setWaterBaptismChurch} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={CEL}><CI value={waterBaptismDate} onChange={setWaterBaptismDate} readOnly={ro} /></td>
                <td style={LBL} colSpan={2}></td>
              </tr>
              <tr>
                <td style={{ ...LBL, fontWeight: 400 }}>
                  Date of Baptism of the Holy Spirit<br />(with the evidence of speaking in tongues):
                </td>
                <td style={LBL}>Church?</td>
                <td style={CEL}><CI value={holySpiritChurch} onChange={setHolySpiritChurch} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={CEL}><CI value={holySpiritDate} onChange={setHolySpiritDate} readOnly={ro} /></td>
                <td style={LBL} colSpan={2}></td>
              </tr>
            </tbody>
          </table>

          {/* Page 1 number */}
          <div style={{ textAlign: "center", fontSize: 11, marginTop: 12 }}>1</div>

        </div>{/* end page 1 */}

        {/* ══════════════════ PAGE 2 ══════════════════════════════════════ */}
        <div className="som-paper som-page2" style={{ ...PAPER, marginTop: 0 }}>

          {/* ══ SECTION E — DEPARTMENTS ══════════════════════════════════ */}
          <SH letter="E" title="Do you belong to any department in the church? (If yes, please list)" />
          <table style={T}>
            <tbody>
              {depts.map((d, i) => (
                <tr key={i}>
                  <td style={NUM}>{i + 1}.</td>
                  <td style={{ ...CEL, width: "70%" }}><CI value={d.name} onChange={(v) => updateDept(i, "name", v)} readOnly={ro} placeholder="Department name" /></td>
                  <td style={LBL}>Date:</td>
                  <td style={{ ...CEL, width: "18%" }}><CI value={d.date} onChange={(v) => updateDept(i, "date", v)} readOnly={ro} placeholder="e.g. Jan 2020" /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ SECTION F — NEW CONVERTS CLASS ═══════════════════════════ */}
          <SH letter="F" title="Have you gone through New Converts&apos; Class?" />
          <table style={T}>
            <tbody>
              <tr>
                <td style={{ ...CEL, height: 26 }}>
                  <CI value={newConvertsText} onChange={setNewConvertsText} readOnly={ro} placeholder="Yes / No" />
                </td>
              </tr>
              <tr>
                <td style={{ ...CEL, height: 26 }}></td>
              </tr>
            </tbody>
          </table>

          {/* ══ SECTION G — WATER BAPTISMAL CLASS ════════════════════════ */}
          <SH letter="G" title="Have you gone through the Water Baptismal Class?" />
          <table style={T}>
            <tbody>
              <tr>
                <td style={{ ...CEL, height: 26 }}>
                  <CI value={waterClassText} onChange={setWaterClassText} readOnly={ro} placeholder="Yes / No" />
                </td>
              </tr>
              <tr>
                <td style={{ ...CEL, height: 26 }}></td>
              </tr>
            </tbody>
          </table>

          {/* ══ SECTION H — REASONS FOR ATTENDING ═══════════════════════ */}
          <SH letter="H" title="List reasons why you would like to go through the School of Ministry Classes" />
          <table style={T}>
            <tbody>
              {reasons.map((r, i) => (
                <tr key={i}>
                  <td style={NUM}>{i + 1}.</td>
                  <td style={{ ...CEL, height: 24 }}><CI value={r} onChange={(v) => updateReason(i, v)} readOnly={ro} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ SECTION I — OTHER INFORMATION ════════════════════════════ */}
          <SH letter="I" title="Other Information" />
          <table style={T}>
            <tbody>
              {otherInfoLines.map((r, i) => (
                <tr key={i}>
                  <td style={NUM}>{i + 1}.</td>
                  <td style={{ ...CEL, height: 24 }}><CI value={r} onChange={(v) => updateOtherInfo(i, v)} readOnly={ro} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ SECTION J — SIGNATURE ════════════════════════════════════ */}
          <div style={{ fontWeight: 700, fontSize: 12, marginTop: 16, marginBottom: 6 }}>J:</div>
          <table style={T}>
            <tbody>
              <tr>
                <td style={{ ...LBL, width: "50%", height: 32, fontWeight: 700 }}>SIGNATURE:</td>
                <td style={{ ...LBL, fontWeight: 700 }}>DATE:</td>
              </tr>
            </tbody>
          </table>

          {/* ══ SECTION K — OFFICIAL REMARKS ═════════════════════════════ */}
          <SH letter="K" title="Official Remarks" />
          <table style={T}>
            <tbody>
              {remarksLines.map((r, i) => (
                <tr key={i}>
                  <td style={NUM}>{i + 1}.</td>
                  <td style={{ ...CEL, height: 24 }}>
                    <CI
                      value={r}
                      onChange={mode === "view" ? (v) => updateRemark(i, v) : undefined}
                      readOnly={mode !== "view"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Page 2 number */}
          <div style={{ textAlign: "center", fontSize: 11, marginTop: 12 }}>2</div>

        </div>{/* end page 2 */}
      </div>{/* end wrapper */}
    </>
  );
}
