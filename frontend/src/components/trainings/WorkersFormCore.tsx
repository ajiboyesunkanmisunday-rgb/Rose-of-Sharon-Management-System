"use client";

/**
 * WorkersFormCore — multi-mode Workers Registration Form
 *
 * Exact digital mirror of the physical 3-page Workers Registration Form
 * (THE REDEEMED CHRISTIAN CHURCH OF GOD — Rose of Sharon Parish).
 *
 * mode = "blank"  → read-only, empty, Print Blank Form button only
 * mode = "fill"   → editable, Print + Submit buttons
 * mode = "view"   → read-only, pre-filled from initialData, Print Filled Form button only
 */

import { useState } from "react";
import { Printer, Send, CheckCircle } from "lucide-react";
import {
  createWorkerInTraining,
  uploadProfilePicture,
  type WorkersInTrainingResponse,
} from "@/lib/api";

export type WitMode = "blank" | "fill" | "view";

/* ─── helpers ──────────────────────────────────────────────────────────────── */
function safeDate(s: string): string | undefined {
  if (!s.trim()) return undefined;
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d.toISOString().split("T")[0];
}

function fmtDisplayDate(s?: string) {
  if (!s) return "";
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleDateString("en-GB");
}

/* ─── Cell input: transparent, fills the table cell ───────────────────────── */
function CI({
  value,
  onChange,
  readOnly,
  multiline,
  rows = 2,
  style,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  multiline?: boolean;
  rows?: number;
  style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "Arial, sans-serif",
    fontSize: 11,
    color: "#000",
    width: "100%",
    padding: "1px 2px",
    resize: "none",
    ...style,
  };
  if (multiline) {
    return (
      <textarea
        readOnly={readOnly}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        rows={rows}
        style={base}
      />
    );
  }
  return (
    <input
      type="text"
      readOnly={readOnly}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      style={base}
    />
  );
}

/* ─── Section header ───────────────────────────────────────────────────────── */
function SH({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontWeight: 700, fontSize: 11, marginTop: 14, marginBottom: 4 }}>
      {children}
    </div>
  );
}

/* ─── Dotted line (for E and G sections) ──────────────────────────────────── */
function DottedLine({
  value,
  onChange,
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <input
      type="text"
      readOnly={readOnly}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      style={{
        width: "100%",
        border: "none",
        borderBottom: "1px dotted #000",
        outline: "none",
        background: "transparent",
        fontFamily: "Arial, sans-serif",
        fontSize: 11,
        color: "#000",
        padding: "1px 0",
      }}
    />
  );
}

/* ─── Table styles ─────────────────────────────────────────────────────────── */
const TD: React.CSSProperties = {
  border: "1px solid #000",
  padding: "3px 5px",
  verticalAlign: "top",
};
const TDL: React.CSSProperties = {
  ...TD,
  fontWeight: 600,
  whiteSpace: "nowrap",
  fontSize: 11,
  width: 1,           // shrink to label width
  background: "transparent",
};
const TABLE: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 11,
};

const PAPER: React.CSSProperties = {
  background: "#fff",
  width: "210mm",
  maxWidth: "100%",
  padding: "14mm 18mm",
  margin: "0 auto",
  boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
  fontFamily: "Arial, sans-serif",
  fontSize: 11,
  color: "#000",
  boxSizing: "border-box",
};

const GIFTS_ALL = [
  "Word of Wisdom",
  "Interpretation of Tongues",
  "Discerning of Spirits",
  "Practical Service",
  "Diverse Kinds of Tongues",
  "Leadership",
  "Working of Miracles",
  "Administration",
  "Faith",
  "Giving/Prophecy",
  "Teaching",
  "Healing",
  "Exhortation",
  "Word of Knowledge",
  "Helps",
];

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function WorkersFormCore({
  mode,
  initialData,
}: {
  mode: WitMode;
  initialData?: WorkersInTrainingResponse;
}) {
  const ro = mode !== "fill";

  /* ── A. Biographical ─────────────────────────────────────────────────── */
  const [photo,        setPhoto]        = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(initialData?.profilePictureUrl ?? "");
  const [surname,      setSurname]      = useState(initialData?.lastName   ?? "");
  const [firstName,    setFirstName]    = useState(initialData?.firstName  ?? "");
  const [otherNames,   setOtherNames]   = useState(initialData?.middleName ?? "");
  const [sex,          setSex]          = useState(initialData?.sex === "FEMALE" ? "Female" : initialData?.sex === "MALE" ? "Male" : "");
  const [dob,          setDob]          = useState(fmtDisplayDate(initialData?.dateOfBirth));
  const [marital,      setMarital]      = useState(initialData?.maritalStatus ?? "");
  const [numChildren,  setNumChildren]  = useState(initialData?.noOfChildren != null ? String(initialData.noOfChildren) : "");
  const [spouseName,   setSpouseName]   = useState(initialData?.spouseName  ?? "");
  const [maidenName,   setMaidenName]   = useState(initialData?.maidenName  ?? "");
  const [nokName,      setNokName]      = useState(initialData?.nextOfKinName         ?? "");
  const [nokRel,       setNokRel]       = useState(initialData?.nextOfKinRelationship ?? "");
  const [nokPhone,     setNokPhone]     = useState(initialData?.nextOfKinPhoneNumber  ?? "");
  const [nokAddr,      setNokAddr]      = useState(initialData?.nextOfKinFullAddress  ?? "");

  /* ── B. Addresses ────────────────────────────────────────────────────── */
  const [homeAddr,   setHomeAddr]   = useState(initialData?.street ?? "");
  const [homePhone,  setHomePhone]  = useState(initialData?.phoneNumber ?? "");
  const [homeFax,    setHomeFax]    = useState("");
  const [mobile,     setMobile]     = useState(initialData?.otherPhoneNumber ?? "");
  const [occupation, setOccupation] = useState(initialData?.occupation ?? "");
  const [employer,   setEmployer]   = useState(initialData?.employer   ?? "");
  const [officeAddr, setOfficeAddr] = useState(initialData?.officeFullAddress ?? "");
  const [officePhone,setOfficePhone]= useState(initialData?.officePhoneNumber ?? "");
  const [officeFax,  setOfficeFax]  = useState("");
  const [email,      setEmail]      = useState(initialData?.email ?? "");

  /* ── C. Education ────────────────────────────────────────────────────── */
  const [quals, setQuals] = useState([
    { institution: "", dates: "", qualification: "" },
    { institution: "", dates: "", qualification: "" },
    { institution: "", dates: "", qualification: "" },
    { institution: "", dates: "", qualification: "" },
  ]);
  const updateQual = (i: number, f: keyof (typeof quals)[0], v: string) =>
    setQuals((prev) => prev.map((q, idx) => (idx === i ? { ...q, [f]: v } : q)));

  /* ── D. Christian History ─────────────────────────────────────────────  */
  const [salvDate,    setSalvDate]    = useState(fmtDisplayDate(initialData?.salvationDate));
  const [salvWhere,   setSalvWhere]   = useState(initialData?.salvationLocation ?? "");
  const [waterDate,   setWaterDate]   = useState(fmtDisplayDate(initialData?.waterBaptismDate));
  const [waterChurch, setWaterChurch] = useState(initialData?.waterBaptismLocation ?? "");
  const [hgDate,      setHgDate]      = useState(fmtDisplayDate(initialData?.holySpiritBaptismDate));
  const [hgWhere,     setHgWhere]     = useState(initialData?.holySpiritBaptismLocation ?? "");

  const [wp, setWp] = useState([
    { name: "", address: "", dates: "" },
    { name: "", address: "", dates: "" },
    { name: "", address: "", dates: "" },
    { name: "", address: "", dates: "" },
  ]);
  const updateWp = (i: number, f: keyof (typeof wp)[0], v: string) =>
    setWp((prev) => prev.map((r, idx) => (idx === i ? { ...r, [f]: v } : r)));

  const [positions, setPositions] = useState(["", "", "", ""]);
  const updatePos = (i: number, v: string) =>
    setPositions((prev) => prev.map((p, idx) => (idx === i ? v : p)));

  const [reasonLeaving, setReasonLeaving] = useState(initialData?.reasonForLeavingPastChurch ?? "");

  /* ── E & F ────────────────────────────────────────────────────────────── */
  const [lifeCenter, setLifeCenter] = useState(initialData?.lifeCenterAttended ?? "");
  const [group1,     setGroup1]     = useState((initialData?.nonRCCGChristianGroups ?? [])[0] ?? "");
  const [group2,     setGroup2]     = useState((initialData?.nonRCCGChristianGroups ?? [])[1] ?? "");

  /* ── G & H ────────────────────────────────────────────────────────────── */
  const [ministry,  setMinistry]  = useState(initialData?.yourMinistry ?? "");
  const [gifts,     setGifts]     = useState<string[]>(initialData?.giftsManifesting ?? []);
  const toggleGift = (g: string) =>
    setGifts((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);

  /* ── I & J ────────────────────────────────────────────────────────────── */
  const [whyWorker,   setWhyWorker]   = useState(initialData?.reasonForApplying ?? "");
  const [officialRem, setOfficialRem] = useState(initialData?.officialRemarks   ?? "");
  const [signDate,    setSignDate]    = useState("");

  /* ── Submit state ────────────────────────────────────────────────────── */
  const [submitting,    setSubmitting]    = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError,   setSubmitError]   = useState("");

  /* ── Photo handler ───────────────────────────────────────────────────── */
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  /* ── Submit ──────────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!firstName.trim() || !surname.trim() || !homePhone.trim()) {
      setSubmitError("First Name, Surname, and Phone Number are required.");
      return;
    }
    setSubmitError("");
    setSubmitting(true);
    try {
      let profilePictureUrl: string | undefined;
      if (photo) { setUploading(true); profilePictureUrl = await uploadProfilePicture(photo); setUploading(false); }

      const maritalMap: Record<string, string> = {
        Single: "SINGLE", Married: "MARRIED", Engaged: "ENGAGED",
        Divorced: "DIVORCED", Widowed: "WIDOWED",
      };
      const sexNorm = sex.toLowerCase().startsWith("f") ? "FEMALE"
                    : sex.toLowerCase().startsWith("m") ? "MALE"
                    : sex || undefined;

      const qualItems = quals
        .filter((q) => q.institution.trim())
        .map((q) => ({ institution: q.institution, date: q.dates || undefined, qualificationReceived: q.qualification || undefined }));

      const wpItems = wp
        .filter((r) => r.name.trim())
        .map((r) => ({ name: r.name, address: r.address || undefined, date: r.dates || undefined }));

      const phItems = positions
        .filter((p) => p.trim())
        .map((p) => ({ positionHeld: p }));

      const nonRccg = [group1, group2].filter(Boolean);

      await createWorkerInTraining({
        set:               undefined,
        profilePictureUrl,
        firstName:         firstName.trim(),
        middleName:        otherNames.trim()  || undefined,
        lastName:          surname.trim(),
        maidenName:        maidenName.trim()  || undefined,
        countryCode:       "234",
        phoneNumber:       homePhone.trim(),
        otherPhoneNumber:  mobile.trim()      || undefined,
        email:             email.trim()       || undefined,
        sex:               sexNorm as string | undefined,
        dateOfBirth:       safeDate(dob),
        maritalStatus:     marital ? (maritalMap[marital] ?? marital.toUpperCase()) : undefined,
        spouseName:        spouseName.trim()  || undefined,
        noOfChildren:      numChildren.trim() ? Number(numChildren.trim()) : undefined,
        nextOfKinName:         nokName.trim() || undefined,
        nextOfKinRelationship: nokRel.trim()  || undefined,
        nextOfKinPhoneNumber:  nokPhone.trim()|| undefined,
        nextOfKinFullAddress:  nokAddr.trim() || undefined,
        street:            homeAddr.trim()    || undefined,
        occupation:        occupation.trim()  || undefined,
        employer:          employer.trim()    || undefined,
        officeFullAddress: officeAddr.trim()  || undefined,
        officePhoneNumber: officePhone.trim() || undefined,
        salvationDate:             safeDate(salvDate),
        salvationLocation:         salvWhere.trim()   || undefined,
        waterBaptismDate:          safeDate(waterDate),
        waterBaptismLocation:      waterChurch.trim()  || undefined,
        holySpiritBaptismDate:     safeDate(hgDate),
        holySpiritBaptismLocation: hgWhere.trim()      || undefined,
        reasonForLeavingPastChurch: reasonLeaving.trim() || undefined,
        lifeCenterAttended:         lifeCenter.trim()    || undefined,
        nonRCCGChristianGroups:     nonRccg.length ? nonRccg : undefined,
        yourMinistry:      ministry.trim()      || undefined,
        giftsManifesting:  gifts.length ? gifts  : undefined,
        reasonForApplying: whyWorker.trim()     || undefined,
        consent:           true,
        ...(qualItems.length ? { qualificationRequests: qualItems } : {}),
        ...(wpItems.length   ? { createPastPlaceOfWorshipRequests: wpItems } : {}),
        ...(phItems.length   ? { createPositionHeldRequests: phItems } : {}),
      });

      setSubmitSuccess(true);
      setSubmitError("");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 10mm 14mm; }
        @media print {
          .wit-no-print  { display: none !important; }
          .wit-wrapper   { background: #fff !important; padding: 0 !important; }
          .wit-paper     { box-shadow: none !important; width: 100% !important; max-width: none !important;
                           margin: 0 !important; padding: 0 !important; }
          .wit-p2        { page-break-before: always; break-before: page; }
          .wit-p3        { page-break-before: always; break-before: page; }
        }
        .wit-ci:focus { background: #eef2ff !important; }
        .wit-ci[readonly]  { cursor: default; }
      `}</style>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="wit-no-print" style={{
        position: "sticky", top: 0, zIndex: 50, background: "#000080",
        padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "Arial, sans-serif" }}>
          Workers Registration Form
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button onClick={() => window.print()} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "transparent", border: "1px solid rgba(255,255,255,0.6)",
            color: "#fff", borderRadius: 6, padding: "6px 14px",
            fontSize: 13, cursor: "pointer", fontFamily: "Arial, sans-serif",
          }}>
            <Printer size={15} />
            {mode === "blank" ? "Print Blank Form" : mode === "view" ? "Print Filled Form" : "Print / PDF"}
          </button>
          {mode === "fill" && (
            <button onClick={handleSubmit} disabled={submitting} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: submitting ? "#555" : "#fff", border: "none", color: "#000080",
              borderRadius: 6, padding: "6px 16px",
              fontSize: 13, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "Arial, sans-serif",
            }}>
              <Send size={15} />
              {uploading ? "Uploading…" : submitting ? "Submitting…" : "Submit"}
            </button>
          )}
        </div>
      </div>

      {/* ── Banners ─────────────────────────────────────────────────────── */}
      {submitSuccess && (
        <div className="wit-no-print" style={{
          background: "#D1FAE5", border: "1px solid #6EE7B7", borderRadius: 8,
          padding: "12px 20px", margin: "16px auto", maxWidth: "210mm",
          display: "flex", alignItems: "center", gap: 10,
          fontFamily: "Arial, sans-serif", fontSize: 14,
        }}>
          <CheckCircle size={18} color="#065F46" />
          <span style={{ color: "#065F46", fontWeight: 600 }}>Application submitted successfully!</span>
        </div>
      )}
      {submitError && (
        <div className="wit-no-print" style={{
          background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 8,
          padding: "12px 20px", margin: "16px auto", maxWidth: "210mm",
          fontFamily: "Arial, sans-serif", fontSize: 14, color: "#991B1B",
        }}>
          {submitError}
        </div>
      )}

      <div className="wit-wrapper" style={{ background: "#F3F4F6", padding: "24px 16px" }}>

        {/* ══════════════════════════════════════════════════════════════════
            PAGE 1
        ══════════════════════════════════════════════════════════════════ */}
        <div className="wit-paper" style={PAPER}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              {/* Logo placeholder */}
              <div style={{
                width: 48, height: 48, borderRadius: "50%", border: "2px solid #000080",
                margin: "0 auto 4px", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, color: "#000080", textAlign: "center", lineHeight: 1.2,
              }}>
                RCCG
              </div>
              <div style={{ fontWeight: 900, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>
                The Redeemed Christian Church of God
              </div>
              <div style={{ fontWeight: 700, fontSize: 11, marginTop: 2 }}>Rose of Sharon Parish</div>
              <div style={{ fontWeight: 900, fontSize: 14, marginTop: 4, textDecoration: "underline", textTransform: "uppercase" }}>
                Workers Registration Form
              </div>
            </div>
            {/* Passport photo box */}
            <div
              className="wit-no-print"
              style={{
                width: 80, height: 96, border: "1px solid #000", flexShrink: 0,
                marginLeft: 16, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", fontSize: 9,
                color: "#555", textAlign: "center", cursor: ro ? "default" : "pointer", overflow: "hidden",
              }}
              onClick={() => !ro && document.getElementById("wit-photo")?.click()}
            >
              {photoPreview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={photoPreview} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <>Passport<br />photograph</>}
              {!ro && <input id="wit-photo" type="file" accept="image/*" hidden onChange={handlePhotoChange} />}
            </div>
            {/* Print-only photo box */}
            <div style={{ width: 80, height: 96, border: "1px solid #000", flexShrink: 0, marginLeft: 16, display: "none" }}
              className="wit-print-photo">
              <div style={{ padding: 4, fontSize: 9, textAlign: "center" }}>Passport<br />photograph</div>
            </div>
          </div>

          {/* ══ A. BIOGRAPHICAL DATA ══════════════════════════════════════ */}
          <SH>A.&nbsp;&nbsp;BIOGRAPHICAL DATA</SH>
          <table style={TABLE}>
            <tbody>
              <tr>
                <td style={TDL}>Surname:</td>
                <td style={TD}><CI value={surname} onChange={setSurname} readOnly={ro} /></td>
                <td style={TDL}>First Name:</td>
                <td style={TD}><CI value={firstName} onChange={setFirstName} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={TDL}>Other Names:</td>
                <td style={TD}><CI value={otherNames} onChange={setOtherNames} readOnly={ro} /></td>
                <td style={TDL}>Sex:</td>
                <td style={TD}><CI value={sex} onChange={setSex} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={TDL}>Date of Birth:</td>
                <td style={TD}><CI value={dob} onChange={setDob} readOnly={ro} /></td>
                <td style={TDL}>Marital Status:</td>
                <td style={TD}><CI value={marital} onChange={setMarital} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={TDL}>No. Of Children:</td>
                <td style={TD}><CI value={numChildren} onChange={setNumChildren} readOnly={ro} /></td>
                <td style={{ ...TDL, whiteSpace: "normal" }}>Name of Spouse:<br /><span style={{ fontWeight: 400 }}>(if ever Married)</span></td>
                <td style={TD}><CI value={spouseName} onChange={setSpouseName} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={{ ...TDL, whiteSpace: "normal" }}>Maiden Name:<br /><span style={{ fontWeight: 400 }}>(for Married Female)</span></td>
                <td style={TD} colSpan={3}><CI value={maidenName} onChange={setMaidenName} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={TDL}>Adult Next of Kin (excl. Spouse)</td>
                <td style={TD} colSpan={3}><CI value={nokName} onChange={setNokName} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={TDL}>Relationship:</td>
                <td style={TD}><CI value={nokRel} onChange={setNokRel} readOnly={ro} /></td>
                <td style={TDL}>Contact Phone Number:</td>
                <td style={TD}><CI value={nokPhone} onChange={setNokPhone} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={TDL}>Contact address:</td>
                <td style={TD} colSpan={3}><CI value={nokAddr} onChange={setNokAddr} readOnly={ro} /></td>
              </tr>
            </tbody>
          </table>

          {/* ══ B. ADDRESSES ══════════════════════════════════════════════ */}
          <SH>B.&nbsp;&nbsp;ADDRESSES</SH>
          <table style={TABLE}>
            <tbody>
              <tr>
                <td style={TDL}>Home Address:</td>
                <td style={TD} colSpan={5}><CI value={homeAddr} onChange={setHomeAddr} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={TDL}>Phone:</td>
                <td style={TD}><CI value={homePhone} onChange={setHomePhone} readOnly={ro} /></td>
                <td style={TDL}>Fax:</td>
                <td style={TD}><CI value={homeFax} onChange={setHomeFax} readOnly={ro} /></td>
                <td style={TDL}>Mobile:</td>
                <td style={TD}><CI value={mobile} onChange={setMobile} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={TDL}>Occupation:</td>
                <td style={TD} colSpan={5}><CI value={occupation} onChange={setOccupation} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={TDL}>Employer:</td>
                <td style={TD} colSpan={5}><CI value={employer} onChange={setEmployer} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={TDL}>Office Address:</td>
                <td style={TD} colSpan={5}><CI value={officeAddr} onChange={setOfficeAddr} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={TDL}>Phone:</td>
                <td style={TD}><CI value={officePhone} onChange={setOfficePhone} readOnly={ro} /></td>
                <td style={TDL}>Fax:</td>
                <td style={TD} colSpan={3}><CI value={officeFax} onChange={setOfficeFax} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={TDL}>E-mail:</td>
                <td style={TD} colSpan={5}><CI value={email} onChange={setEmail} readOnly={ro} /></td>
              </tr>
            </tbody>
          </table>

          {/* ══ C. EDUCATION (rows 1-2 on page 1) ═══════════════════════ */}
          <SH>C.&nbsp;&nbsp;EDUCATION AND PROFESSIONAL QUALIFICATIONS</SH>
          <table style={TABLE}>
            <thead>
              <tr>
                <th style={{ ...TD, fontWeight: 700 }}>Institution:</th>
                <th style={{ ...TD, fontWeight: 700, width: 90 }}>Dates:</th>
                <th style={{ ...TD, fontWeight: 700 }}>Qualification Received:</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1].map((i) => (
                <tr key={i}>
                  <td style={TD}>
                    <span style={{ fontWeight: 700, marginRight: 4 }}>{i + 1}.</span>
                    <CI value={quals[i].institution} onChange={(v) => updateQual(i, "institution", v)} readOnly={ro} />
                  </td>
                  <td style={TD}><CI value={quals[i].dates} onChange={(v) => updateQual(i, "dates", v)} readOnly={ro} /></td>
                  <td style={TD}><CI value={quals[i].qualification} onChange={(v) => updateQual(i, "qualification", v)} readOnly={ro} /></td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>{/* end page 1 */}

        {/* ══════════════════════════════════════════════════════════════════
            PAGE 2
        ══════════════════════════════════════════════════════════════════ */}
        <div className="wit-paper wit-p2" style={{ ...PAPER, marginTop: 0 }}>

          {/* C. continued (rows 3-4) */}
          <table style={{ ...TABLE, marginBottom: 6 }}>
            <tbody>
              {[2, 3].map((i) => (
                <tr key={i}>
                  <td style={TD}>
                    <span style={{ fontWeight: 700, marginRight: 4 }}>{i + 1}.</span>
                    <CI value={quals[i].institution} onChange={(v) => updateQual(i, "institution", v)} readOnly={ro} />
                  </td>
                  <td style={{ ...TD, width: 90 }}><CI value={quals[i].dates} onChange={(v) => updateQual(i, "dates", v)} readOnly={ro} /></td>
                  <td style={TD}><CI value={quals[i].qualification} onChange={(v) => updateQual(i, "qualification", v)} readOnly={ro} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ D. CHRISTIAN HISTORY ══════════════════════════════════════ */}
          <SH>D.&nbsp;&nbsp;CHRISTIAN HISTORY</SH>
          <table style={{ ...TABLE, marginBottom: 10 }}>
            <tbody>
              <tr>
                <td style={TDL}>Date of Salvation:</td>
                <td style={TD}><CI value={salvDate} onChange={setSalvDate} readOnly={ro} /></td>
                <td style={TDL}>Where:</td>
                <td style={TD}><CI value={salvWhere} onChange={setSalvWhere} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={TDL}>Date of Water Baptism by Immersion:</td>
                <td style={TD}><CI value={waterDate} onChange={setWaterDate} readOnly={ro} /></td>
                <td style={TDL}>Church:</td>
                <td style={TD}><CI value={waterChurch} onChange={setWaterChurch} readOnly={ro} /></td>
              </tr>
              <tr>
                <td style={{ ...TDL, whiteSpace: "normal" }}>
                  Date of Baptism of the Holy Ghost:<br />
                  <span style={{ fontWeight: 400, fontSize: 10 }}>(with evidence of speaking in tongues)</span>
                </td>
                <td style={TD}><CI value={hgDate} onChange={setHgDate} readOnly={ro} /></td>
                <td style={TDL}>Where:</td>
                <td style={TD}><CI value={hgWhere} onChange={setHgWhere} readOnly={ro} /></td>
              </tr>
            </tbody>
          </table>

          {/* Worship places */}
          <div style={{ fontSize: 11, marginBottom: 4 }}>List your place(s) of worship in the last five years</div>
          <table style={{ ...TABLE, marginBottom: 10 }}>
            <thead>
              <tr>
                <th style={{ ...TD, fontWeight: 700 }}>Name:</th>
                <th style={{ ...TD, fontWeight: 700 }}>Address:</th>
                <th style={{ ...TD, fontWeight: 700, width: 70 }}>Dates:</th>
              </tr>
            </thead>
            <tbody>
              {wp.map((r, i) => (
                <tr key={i}>
                  <td style={TD}>
                    <span style={{ fontWeight: 700, marginRight: 4 }}>{i + 1}.</span>
                    <CI value={r.name} onChange={(v) => updateWp(i, "name", v)} readOnly={ro} />
                  </td>
                  <td style={TD}><CI value={r.address} onChange={(v) => updateWp(i, "address", v)} readOnly={ro} /></td>
                  <td style={TD}><CI value={r.dates} onChange={(v) => updateWp(i, "dates", v)} readOnly={ro} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Positions held */}
          <div style={{ fontSize: 11, marginBottom: 4 }}>
            What positions/department did you hold/belong to in the above listed place(s)
          </div>
          <table style={{ ...TABLE, marginBottom: 10 }}>
            <tbody>
              <tr>
                <td style={TD}>
                  <span style={{ fontWeight: 700, marginRight: 4 }}>1.</span>
                  <CI value={positions[0]} onChange={(v) => updatePos(0, v)} readOnly={ro} />
                </td>
                <td style={TD}>
                  <span style={{ fontWeight: 700, marginRight: 4 }}>2.</span>
                  <CI value={positions[1]} onChange={(v) => updatePos(1, v)} readOnly={ro} />
                </td>
              </tr>
              <tr>
                <td style={TD}>
                  <span style={{ fontWeight: 700, marginRight: 4 }}>3.</span>
                  <CI value={positions[2]} onChange={(v) => updatePos(2, v)} readOnly={ro} />
                </td>
                <td style={TD}>
                  <span style={{ fontWeight: 700, marginRight: 4 }}>4.</span>
                  <CI value={positions[3]} onChange={(v) => updatePos(3, v)} readOnly={ro} />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Reasons for leaving */}
          <div style={{ fontSize: 11, marginBottom: 4 }}>Reasons for leaving your last church</div>
          <table style={{ ...TABLE, marginBottom: 12 }}>
            <tbody>
              <tr>
                <td style={{ ...TD, height: 52 }}>
                  <CI value={reasonLeaving} onChange={setReasonLeaving} readOnly={ro} multiline rows={3} />
                </td>
              </tr>
            </tbody>
          </table>

          {/* ══ E. LIFE CENTER ════════════════════════════════════════════ */}
          <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 4 }}>
            E.&nbsp;&nbsp;WHICH LIFE CENTER DO YOU ATTEND?
          </div>
          <DottedLine value={lifeCenter} onChange={setLifeCenter} readOnly={ro} />

          {/* ══ F. CHRISTIAN GROUPS ═══════════════════════════════════════ */}
          <div style={{ fontWeight: 700, fontSize: 11, marginTop: 10, marginBottom: 4 }}>
            F.&nbsp;&nbsp;WHICH CHRISTIAN GROUPS/ASSOCIATIONS DO YOU BELONG TO OUTSIDE RCCG?
          </div>
          <table style={TABLE}>
            <tbody>
              <tr>
                <td style={TD}>
                  <span style={{ fontWeight: 700, marginRight: 4 }}>1.</span>
                  <CI value={group1} onChange={setGroup1} readOnly={ro} />
                </td>
              </tr>
              <tr>
                <td style={TD}>
                  <span style={{ fontWeight: 700, marginRight: 4 }}>2.</span>
                  <CI value={group2} onChange={setGroup2} readOnly={ro} />
                </td>
              </tr>
            </tbody>
          </table>

        </div>{/* end page 2 */}

        {/* ══════════════════════════════════════════════════════════════════
            PAGE 3
        ══════════════════════════════════════════════════════════════════ */}
        <div className="wit-paper wit-p3" style={{ ...PAPER, marginTop: 0 }}>

          {/* ══ G. MINISTRY ═══════════════════════════════════════════════ */}
          <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 6 }}>
            G.&nbsp;&nbsp;WHICH MINISTRY DO YOU BELIEVE YOU ARE CALLED TO?
          </div>
          <DottedLine value={ministry} onChange={setMinistry} readOnly={ro} />

          {/* ══ H. GIFTS ══════════════════════════════════════════════════ */}
          <div style={{ fontWeight: 700, fontSize: 11, marginTop: 14, marginBottom: 2 }}>
            H.&nbsp;&nbsp;WHICH OF THESE GIFTS DO YOU MANIFEST? Rom 12:6-8, 1 Cor 12:4-10&amp;28.
          </div>
          <div style={{ fontSize: 11, marginBottom: 6 }}>Tick as applicable.</div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "4px 8px",
            marginBottom: 14,
          }}>
            {GIFTS_ALL.map((g) => (
              <label key={g} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, cursor: ro ? "default" : "pointer" }}>
                <input
                  type="checkbox"
                  checked={gifts.includes(g)}
                  onChange={() => !ro && toggleGift(g)}
                  readOnly={ro}
                  style={{ width: 11, height: 11, cursor: ro ? "default" : "pointer" }}
                />
                *{g}
              </label>
            ))}
          </div>

          {/* ══ I. WHY DO YOU WANT TO BE A WORKER? ═══════════════════════ */}
          <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 6 }}>
            I.&nbsp;&nbsp;WHY DO YOU WANT TO BE A WORKER?
          </div>
          <table style={{ ...TABLE, marginBottom: 16 }}>
            <tbody>
              <tr>
                <td style={{ ...TD, height: 80 }}>
                  <CI value={whyWorker} onChange={setWhyWorker} readOnly={ro} multiline rows={5} />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Signature + Date */}
          <div style={{ display: "flex", gap: 48, marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ borderBottom: "1px solid #000", marginBottom: 4, height: 30 }} />
              <div style={{ fontSize: 11, textAlign: "center" }}>Signature</div>
            </div>
            <div style={{ flex: 1 }}>
              <CI value={signDate} onChange={setSignDate} readOnly={ro}
                style={{ borderBottom: "1px solid #000", width: "100%", display: "block" }} />
              <div style={{ fontSize: 11, textAlign: "center", marginTop: 4 }}>Date</div>
            </div>
          </div>

          {/* ══ J. OFFICIAL REMARKS ═══════════════════════════════════════ */}
          <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 8 }}>
            J.&nbsp;&nbsp;OFFICIAL REMARKS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ borderBottom: "1px solid #000", minHeight: 18 }}>
                {i === 0 && (
                  <CI value={officialRem} onChange={setOfficialRem} readOnly={ro} />
                )}
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div style={{ textAlign: "center", fontWeight: 700, fontSize: 11, marginTop: 24, textDecoration: "underline" }}>
            NB: EVERY ITEM MUST BE FILLED.
          </div>

        </div>{/* end page 3 */}
      </div>{/* end wrapper */}
    </>
  );
}
