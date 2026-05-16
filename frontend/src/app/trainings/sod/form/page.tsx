"use client";

/**
 * /trainings/sod/form
 *
 * Exact digital mirror of the physical SOD Application Form (2 pages).
 * Fill in the browser → Print / Download PDF.
 */

import { useState } from "react";
import Image from "next/image";
import { Printer, Send, CheckCircle, XCircle } from "lucide-react";
import { createSchoolOfDisciple } from "@/lib/api";

/* ─── Primitive dotted-line input ────────────────────────────────────────── */
function F({
  value,
  onChange,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
}) {
  return (
    <input
      className="sod-f"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={style}
    />
  );
}

/** Label + expanding dotted line (full width) */
function FullRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span style={{ whiteSpace: "nowrap" }}>{label}</span>
      <F value={value} onChange={onChange} style={{ flex: 1 }} />
    </div>
  );
}

/** Two paired columns, each label + expanding line */
function PairedRow({
  left,
  right,
}: {
  left:  { label: string; value: string; onChange: (v: string) => void };
  right: { label: string; value: string; onChange: (v: string) => void };
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
      <div style={{ flex: 1, display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ whiteSpace: "nowrap" }}>{left.label}</span>
        <F value={left.value} onChange={left.onChange} style={{ flex: 1 }} />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ whiteSpace: "nowrap" }}>{right.label}</span>
        <F value={right.value} onChange={right.onChange} style={{ flex: 1 }} />
      </div>
    </div>
  );
}

/** Section heading (bold uppercase like the physical form) */
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

/* ─── Checkbox ────────────────────────────────────────────────────────────── */
function Chk({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 12 }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ width: 13, height: 13, cursor: "pointer" }}
      />
      {label}
    </label>
  );
}

/* ─── Paper wrapper ───────────────────────────────────────────────────────── */
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
export default function SODApplicationFormPage() {

  /* Church identifiers */
  const [session,  setSession]  = useState("");
  const [region,   setRegion]   = useState("");
  const [province, setProvince] = useState("");
  const [centre,   setCentre]   = useState("");

  /* ── Section A ── */
  const [surname,       setSurname]       = useState("");
  const [firstName,     setFirstName]     = useState("");
  const [middleName,    setMiddleName]    = useState("");
  const [addr1,         setAddr1]         = useState("");
  const [addr2,         setAddr2]         = useState("");
  const [addr3,         setAddr3]         = useState("");
  const [dob,           setDob]           = useState("");
  const [sex,           setSex]           = useState("");
  const [nationality,   setNationality]   = useState("");
  const [stateOfOrigin, setStateOfOrigin] = useState("");
  const [homeTown,      setHomeTown]      = useState("");
  const [phone,         setPhone]         = useState("");
  const [email,         setEmail]         = useState("");
  const [occupation,    setOccupation]    = useState("");
  const [offAddr1,      setOffAddr1]      = useState("");
  const [offAddr2,      setOffAddr2]      = useState("");
  const [marital,       setMarital]       = useState("");
  const [spouseName,    setSpouseName]    = useState("");
  const [spousePhone,   setSpousePhone]   = useState("");
  const [spouseOcc,     setSpouseOcc]     = useState("");
  const [numChildren,   setNumChildren]   = useState("");

  /* ── Section B ── */
  const [inst1, setInst1] = useState("");
  const [inst2, setInst2] = useState("");
  const [inst3, setInst3] = useState("");

  /* ── Section C — worship places (12) ── */
  const [wp,  setWp]  = useState([
    { name: "", address: "", date: "" },
    { name: "", address: "", date: "" },
    { name: "", address: "", date: "" },
  ]);
  const updateWp = (i: number, k: keyof typeof wp[0], v: string) =>
    setWp((prev) => prev.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  /* ── Section C — positions held (13) ── */
  const [ph,  setPh]  = useState([
    { name: "", position: "" },
    { name: "", position: "" },
    { name: "", position: "" },
  ]);
  const updatePh = (i: number, k: keyof typeof ph[0], v: string) =>
    setPh((prev) => prev.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  /* ── Section C — spiritual dates ── */
  const [salvationDate,     setSalvationDate]     = useState("");
  const [salvationWhere,    setSalvationWhere]    = useState("");
  const [waterBaptismDate,  setWaterBaptismDate]  = useState("");
  const [waterBaptismChurch,setWaterBaptismChurch]= useState("");
  const [holyGhostDate,     setHolyGhostDate]     = useState("");
  const [holyGhostWhere,    setHolyGhostWhere]    = useState("");
  const [pastorName,        setPastorName]        = useState("");
  const [pastorPhone,       setPastorPhone]       = useState("");
  const [activity1,         setActivity1]         = useState("");
  const [activity2,         setActivity2]         = useState("");
  const [otherTraining,     setOtherTraining]     = useState<"yes" | "no" | "">("");
  const [pastorKnows,       setPastorKnows]       = useState("");

  /* ── Section D ── */
  const [otherInfo1, setOtherInfo1] = useState("");
  const [otherInfo2, setOtherInfo2] = useState("");

  /* ── Section E (declaration names/address) ── */
  const [declName, setDeclName] = useState("");
  const [declOf,   setDeclOf]   = useState("");

  /* ── Section F ── */
  const [remarks1, setRemarks1] = useState("");
  const [remarks2, setRemarks2] = useState("");

  /* ── Submit state ── */
  const [submitting,     setSubmitting]     = useState(false);
  const [submitSuccess,  setSubmitSuccess]  = useState(false);
  const [submitError,    setSubmitError]    = useState("");

  /* ─── Date helper: parse flexible input → ISO YYYY-MM-DD or undefined ─── */
  const safeDate = (v: string): string | undefined => {
    const s = v.trim();
    if (!s) return undefined;
    // Try native parse first (handles YYYY-MM-DD, MM/DD/YYYY, etc.)
    let d = new Date(s);
    // Also try DD-MM-YYYY (common Nigerian format)
    if (isNaN(d.getTime())) {
      const m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
      if (m) d = new Date(`${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`);
    }
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  /* ─── Map form → API and submit ────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!firstName.trim() || !surname.trim() || !phone.trim()) {
      setSubmitError("First Name, Surname, and Phone Number are required before submitting.");
      return;
    }
    setSubmitError("");
    setSubmitting(true);
    try {
      const maritalMap: Record<string, string> = {
        Single: "SINGLE", Married: "MARRIED", Engaged: "ENGAGED",
        Divorced: "DIVORCED", Widowed: "WIDOWED",
      };
      const sexNorm = sex.trim().toLowerCase().startsWith("f") ? "FEMALE"
                    : sex.trim().toLowerCase().startsWith("m") ? "MALE"
                    : sex.trim() || undefined;

      await createSchoolOfDisciple({
        region:   region   || undefined,
        province: province || undefined,
        centre:   centre   || undefined,
        firstName:  firstName.trim(),
        lastName:   surname.trim(),
        middleName: middleName.trim() || undefined,
        countryCode: "234",
        phoneNumber: phone.trim(),
        email:       email.trim() || undefined,
        sex:         sexNorm as string | undefined,
        dateOfBirth: safeDate(dob),
        maritalStatus: marital ? (maritalMap[marital] ?? marital.toUpperCase()) : undefined,
        spouseName:      spouseName.trim()  || undefined,
        spousePhoneNumber: spousePhone.trim() || undefined,
        spouseOccupation:  spouseOcc.trim()   || undefined,
        noOfChildren:    numChildren.trim() ? Number(numChildren.trim()) : undefined,
        nationality:   nationality.trim()   || undefined,
        homeTown:      homeTown.trim()      || undefined,
        stateOfOrigin: stateOfOrigin.trim() || undefined,
        street:          [addr1, addr2, addr3].filter(Boolean).join(", ") || undefined,
        occupation:      occupation.trim()  || undefined,
        officeFullAddress: [offAddr1, offAddr2].filter(Boolean).join(", ") || undefined,
        salvationDate:             safeDate(salvationDate),
        salvationLocation:         salvationWhere.trim()    || undefined,
        waterBaptismDate:          safeDate(waterBaptismDate),
        waterBaptismLocation:      waterBaptismChurch.trim()|| undefined,
        holySpiritBaptismDate:     safeDate(holyGhostDate),
        holySpiritBaptismLocation: holyGhostWhere.trim()    || undefined,
        currentParishPastorName:        pastorName.trim()  || undefined,
        currentParishPastorPhoneNumber: pastorPhone.trim() || undefined,
        activityInCurrentParish: [activity1, activity2].filter(Boolean).join(" ") || undefined,
        hasAnotherSimultaneousProgram: otherTraining === "yes" ? true
                                      : otherTraining === "no"  ? false
                                      : undefined,
        otherInformation: [otherInfo1, otherInfo2].filter(Boolean).join(" ") || undefined,
        qualificationRequests: [inst1, inst2, inst3]
          .filter(Boolean)
          .map((institution) => ({ institution })),
        createPastPlaceOfWorshipRequests: wp
          .filter((r) => r.name.trim())
          .map((r) => ({ name: r.name, location: r.address })),
        createPositionHeldRequests: ph
          .filter((r) => r.name.trim() || r.position.trim())
          .map((r) => ({ organisation: r.name, title: r.position })),
        consent: true,
      });
      setSubmitSuccess(true);
      setSubmitError("");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─────────────────────────────────────────────────────────────────────── */

  return (
    <>
      {/* ── Global styles ──────────────────────────────────────────────── */}
      <style>{`
        @page { size: A4 portrait; margin: 12mm 16mm; }

        @media print {
          .sod-no-print { display: none !important; }
          .sod-wrapper  { background: #fff !important; padding: 0 !important; min-height: auto !important; }
          .sod-paper    { box-shadow: none !important; width: 100% !important; max-width: none !important;
                          margin: 0 !important; padding: 0 !important; }
          .sod-page2    { page-break-before: always; break-before: page; margin-top: 0 !important; }
        }

        /* Editable dotted-line inputs */
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
        @media print { .sod-f { border-bottom: 1px dotted #333; background: transparent !important; } }

        /* Table cells with dotted-bottom inputs */
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
            SOD Application Form — Fill &amp; Print
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            {/* Submit to system */}
            <button
              onClick={handleSubmit}
              disabled={submitting || submitSuccess}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: submitSuccess ? "#16A34A" : "#22c55e",
                color: "#fff", border: "none",
                borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 700,
                cursor: submitting || submitSuccess ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitSuccess
                ? <><CheckCircle size={14} /> Saved to System</>
                : submitting
                  ? <><Send size={14} /> Submitting…</>
                  : <><Send size={14} /> Submit to System</>}
            </button>
            {/* Print */}
            <button onClick={() => window.print()} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#fff", color: "#000080", border: "none",
              borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              <Printer size={14} />
              Print / Download PDF
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
                  <span>SESSION</span>
                  <F value={session} onChange={setSession} style={{ width: 120 }} />
                </div>
              </div>
            </div>

            {/* Passport photo box */}
            <div style={{
              width: 90, height: 110, border: "1px solid #000",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ fontSize: 9, textAlign: "center", color: "#666", lineHeight: 1.6 }}>
                Passport<br />Photograph
              </span>
            </div>
          </div>

          {/* ── REGION / PROVINCE / CENTRE ──────────────────────────── */}
          <table style={{ borderCollapse: "collapse", marginBottom: 20 }}>
            <tbody>
              {(
                [
                  ["REGION",   region,   setRegion],
                  ["PROVINCE", province, setProvince],
                  ["CENTRE",   centre,   setCentre],
                ] as [string, string, (v: string) => void][]
              ).map(([lbl, val, set]) => (
                <tr key={lbl}>
                  <td style={{ border: "1px solid #000", padding: "4px 10px", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap" }}>
                    {lbl}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "2px 8px", width: 240 }}>
                    <F value={val} onChange={set} style={{ width: "100%" }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ SECTION A ═══════════════════════════════════════════════ */}
          <SectionHead>A.&nbsp;&nbsp;Personal Information</SectionHead>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* 1. Name */}
            <div>
              <div style={{ marginBottom: 6 }}>1.&nbsp;&nbsp;Name:</div>
              <div style={{ display: "flex", gap: 14, paddingLeft: 18 }}>
                {(
                  [
                    ["Surname",    surname,    setSurname],
                    ["First Name", firstName,  setFirstName],
                    ["Middle Name",middleName, setMiddleName],
                  ] as [string, string, (v: string) => void][]
                ).map(([lbl, val, set]) => (
                  <div key={lbl} style={{ flex: 1 }}>
                    <F value={val} onChange={set} style={{ width: "100%" }} />
                    <div style={{ fontSize: 9, textAlign: "center", color: "#666", marginTop: 2 }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Current Home Address */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <FullRow label="2.&nbsp;&nbsp;Current Home Address:" value={addr1} onChange={setAddr1} />
              <F value={addr2} onChange={setAddr2} style={{ width: "100%" }} />
              <F value={addr3} onChange={setAddr3} style={{ width: "100%" }} />
            </div>

            {/* 3 & 3b */}
            <PairedRow
              left={{ label: "3.&nbsp;&nbsp;Date of Birth:", value: dob, onChange: setDob }}
              right={{ label: "3b. Sex:", value: sex, onChange: setSex }}
            />

            {/* 4 & 4b */}
            <PairedRow
              left={{ label: "4.&nbsp;&nbsp;Nationality:", value: nationality, onChange: setNationality }}
              right={{ label: "4b. State of Origin:", value: stateOfOrigin, onChange: setStateOfOrigin }}
            />

            {/* 5 & 5b */}
            <PairedRow
              left={{ label: "5.&nbsp;&nbsp;Home Town:", value: homeTown, onChange: setHomeTown }}
              right={{ label: "5b. Phone Number:", value: phone, onChange: setPhone }}
            />

            {/* 6 & 6b */}
            <PairedRow
              left={{ label: "6.&nbsp;&nbsp;Email Address:", value: email, onChange: setEmail }}
              right={{ label: "6b. Occupation:", value: occupation, onChange: setOccupation }}
            />

            {/* 7. Occupation Address */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <FullRow label="7.&nbsp;&nbsp;Occupation Address:" value={offAddr1} onChange={setOffAddr1} />
              <F value={offAddr2} onChange={setOffAddr2} style={{ width: "100%" }} />
            </div>

            {/* 8. Marital Status */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
              <span>8.&nbsp;&nbsp;Marital status:</span>
              {MARITAL.map((m) => (
                <Chk key={m} label={m} checked={marital === m} onChange={() => setMarital(marital === m ? "" : m)} />
              ))}
            </div>

            {/* 9 & 9b */}
            <PairedRow
              left={{ label: "9.&nbsp;&nbsp;Spouse Name:", value: spouseName, onChange: setSpouseName }}
              right={{ label: "Spouse Phone Number:", value: spousePhone, onChange: setSpousePhone }}
            />

            {/* 10 & 10b */}
            <PairedRow
              left={{ label: "10. Spouse's Occupation:", value: spouseOcc, onChange: setSpouseOcc }}
              right={{ label: "Number of Children:", value: numChildren, onChange: setNumChildren }}
            />
          </div>

          {/* ══ SECTION B ═══════════════════════════════════════════════ */}
          <SectionHead>B.&nbsp;&nbsp;Educational and Professional Qualifications</SectionHead>

          <div>
            <div style={{ marginBottom: 10 }}>11. Institution:</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingLeft: 20 }}>
              {(
                [
                  ["i.",   inst1, setInst1],
                  ["ii.",  inst2, setInst2],
                  ["iii.", inst3, setInst3],
                ] as [string, string, (v: string) => void][]
              ).map(([roman, val, set]) => (
                <div key={roman} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ minWidth: 24, flexShrink: 0 }}>{roman}</span>
                  <F value={val} onChange={set} style={{ flex: 1 }} />
                </div>
              ))}
            </div>
          </div>
        </div>{/* end page 1 */}

        {/* ════════════════════════════════════════════════════════════════
            PAGE 2
        ════════════════════════════════════════════════════════════════ */}
        <div className="sod-paper sod-page2" style={{ ...PAPER_STYLE, marginTop: 0 }}>

          {/* Page number */}
          <div style={{ textAlign: "center", fontSize: 12, marginBottom: 16 }}>2</div>

          {/* ══ SECTION C ═══════════════════════════════════════════════ */}
          <SectionHead>C.&nbsp;&nbsp;Spiritual Information</SectionHead>

          {/* 12. Places of worship */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ marginBottom: 8, fontSize: 12 }}>
              12. List your place(s) of worship for the past three years
            </div>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #000", width: 24, padding: "3px 4px" }}></th>
                  <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "center", fontWeight: 700 }}>Name</th>
                  <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "center", fontWeight: 700 }}>Address</th>
                  <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "center", fontWeight: 700, width: 70 }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {wp.map((row, i) => (
                  <tr key={i}>
                    <td style={{ border: "1px solid #000", padding: "2px 4px", textAlign: "center", fontWeight: 700 }}>
                      {["I.", "II.", "III."][i]}
                    </td>
                    <td className="sod-td-input">
                      <F value={row.name} onChange={(v) => updateWp(i, "name", v)} style={{ width: "100%" }} />
                    </td>
                    <td className="sod-td-input">
                      <F value={row.address} onChange={(v) => updateWp(i, "address", v)} style={{ width: "100%" }} />
                    </td>
                    <td className="sod-td-input">
                      <F value={row.date} onChange={(v) => updateWp(i, "date", v)} style={{ width: "100%" }} />
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
                  <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "center", fontWeight: 700 }}>Name</th>
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
                      <F value={row.name} onChange={(v) => updatePh(i, "name", v)} style={{ width: "100%" }} />
                    </td>
                    <td className="sod-td-input">
                      <F value={row.position} onChange={(v) => updatePh(i, "position", v)} style={{ width: "100%" }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 14 & 13b */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <PairedRow
              left={{ label: "14. Date of Salvation:", value: salvationDate, onChange: setSalvationDate }}
              right={{ label: "13b. Where:", value: salvationWhere, onChange: setSalvationWhere }}
            />

            {/* 15 & 14b */}
            <PairedRow
              left={{ label: "15. Date of Water Baptism by Immersion:", value: waterBaptismDate, onChange: setWaterBaptismDate }}
              right={{ label: "14b. Church:", value: waterBaptismChurch, onChange: setWaterBaptismChurch }}
            />

            {/* 16. Holy Ghost baptism */}
            <FullRow
              label="16. Date of Baptism in the Holy Ghost with the evidence of speaking in tongues:"
              value={holyGhostDate}
              onChange={setHolyGhostDate}
            />

            {/* 17. Where */}
            <FullRow label="17. Where:" value={holyGhostWhere} onChange={setHolyGhostWhere} />

            {/* 18 */}
            <FullRow label="18. Name of your current Parish Pastor:" value={pastorName} onChange={setPastorName} />

            {/* 19 */}
            <FullRow label="19. Phone Number of your current Parish Pastor:" value={pastorPhone} onChange={setPastorPhone} />

            {/* 20 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <FullRow label="20. Your Activity/Department in your Current Parish:" value={activity1} onChange={setActivity1} />
              <F value={activity2} onChange={setActivity2} style={{ width: "100%" }} />
            </div>

            {/* 21 */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span>
                21. Are you currently running or do you intend to run another training alongside with SOD if admitted as student?
              </span>
              <Chk label="Yes" checked={otherTraining === "yes"} onChange={() => setOtherTraining(otherTraining === "yes" ? "" : "yes")} />
              <Chk label="No"  checked={otherTraining === "no"}  onChange={() => setOtherTraining(otherTraining === "no"  ? "" : "no")}  />
            </div>

            {/* 22 */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <span>22. Does your Current Parish Pastor know you:</span>
              {["Closely", "Intimately", "just as a member"].map((opt) => (
                <Chk key={opt} label={opt} checked={pastorKnows === opt} onChange={() => setPastorKnows(pastorKnows === opt ? "" : opt)} />
              ))}
            </div>
          </div>

          {/* ══ SECTION D ═══════════════════════════════════════════════ */}
          <SectionHead>D.&nbsp;&nbsp;Other Relevant Information:</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <F value={otherInfo1} onChange={setOtherInfo1} style={{ width: "100%" }} />
            <F value={otherInfo2} onChange={setOtherInfo2} style={{ width: "100%" }} />
          </div>

          {/* ══ SECTION E ═══════════════════════════════════════════════ */}
          <SectionHead>E.&nbsp;&nbsp;Decleration:</SectionHead>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
            <span>I,</span>
            <F value={declName} onChange={setDeclName} style={{ flex: 1 }} />
            <span style={{ whiteSpace: "nowrap" }}>&nbsp;of</span>
            <F value={declOf} onChange={setDeclOf} style={{ flex: 1 }} />
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.7, margin: 0 }}>
            Hereby promised that if taken as S.O.D student, will abide by the rules and regulations of the
            School of Disciples, to obey the Authorities of the school and to pray for them. I also promised
            not to be a stumbling block in the way of my fellow student.
          </p>

          {/* ══ SECTION F ═══════════════════════════════════════════════ */}
          <SectionHead>F.&nbsp;&nbsp;Official Remarks:</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <F value={remarks1} onChange={setRemarks1} style={{ width: "100%" }} />
            <F value={remarks2} onChange={setRemarks2} style={{ width: "100%" }} />
          </div>

        </div>{/* end page 2 */}
      </div>{/* end wrapper */}
    </>
  );
}
