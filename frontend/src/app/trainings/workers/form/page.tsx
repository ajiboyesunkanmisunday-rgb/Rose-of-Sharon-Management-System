"use client";

/**
 * /trainings/workers/form
 *
 * Digital mirror of the physical Workers-in-Training Application Form.
 * Fill in the browser → Print / Download PDF, or Submit to backend.
 */

import { useState } from "react";
import { Printer, Send, CheckCircle } from "lucide-react";
import { createWorkerInTraining, uploadProfilePicture } from "@/lib/api";

/* ─── Primitive dotted-line input ─────────────────────────────────────────── */
function F({
  value,
  onChange,
  style,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  type?: string;
}) {
  return (
    <input
      type={type}
      className="wit-f"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={style}
    />
  );
}

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
      <span style={{ whiteSpace: "nowrap", fontSize: 12 }}>{label}</span>
      <F value={value} onChange={onChange} style={{ flex: 1 }} />
    </div>
  );
}

function PairedRow({
  left,
  right,
}: {
  left: { label: string; value: string; onChange: (v: string) => void };
  right: { label: string; value: string; onChange: (v: string) => void };
}) {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, flex: 1, minWidth: 200 }}>
        <span style={{ whiteSpace: "nowrap", fontSize: 12 }}>{left.label}</span>
        <F value={left.value} onChange={left.onChange} style={{ flex: 1 }} />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, flex: 1, minWidth: 200 }}>
        <span style={{ whiteSpace: "nowrap", fontSize: 12 }}>{right.label}</span>
        <F value={right.value} onChange={right.onChange} style={{ flex: 1 }} />
      </div>
    </div>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontWeight: 700,
        fontSize: 12,
        background: "#000080",
        color: "#fff",
        padding: "3px 8px",
        marginBottom: 10,
        marginTop: 18,
        letterSpacing: 0.5,
      }}
    >
      {children}
    </div>
  );
}

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
    <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer" }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ width: 12, height: 12 }} />
      {label}
    </label>
  );
}

/* ─── safeDate ─────────────────────────────────────────────────────────────── */
function safeDate(s: string): string | undefined {
  if (!s.trim()) return undefined;
  const d = new Date(s);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString().split("T")[0];
}

const PAPER_STYLE: React.CSSProperties = {
  background: "#fff",
  width: "210mm",
  maxWidth: "100%",
  minHeight: "297mm",
  padding: "18mm 20mm",
  margin: "0 auto",
  boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
  fontFamily: "Arial, sans-serif",
  fontSize: 12,
  color: "#000",
  boxSizing: "border-box",
};

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function WorkersInTrainingFormPage() {
  /* ── Section A – Biographical ─────────────────────────────────────────── */
  const [set, setSet]                           = useState("");
  const [photo, setPhoto]                       = useState<File | null>(null);
  const [photoPreview, setPhotoPreview]         = useState("");
  const [surname, setSurname]                   = useState("");
  const [firstName, setFirstName]               = useState("");
  const [middleName, setMiddleName]             = useState("");
  const [maidenName, setMaidenName]             = useState("");
  const [sex, setSex]                           = useState("");
  const [dob, setDob]                           = useState("");
  const [marital, setMarital]                   = useState("");
  const [spouseName, setSpouseName]             = useState("");
  const [numChildren, setNumChildren]           = useState("");
  const [nationality, setNationality]           = useState("");
  const [homeTown, setHomeTown]                 = useState("");
  const [stateOfOrigin, setStateOfOrigin]       = useState("");

  /* ── Section B – Contact & Address ───────────────────────────────────── */
  const [phone, setPhone]                       = useState("");
  const [phone2, setPhone2]                     = useState("");
  const [email, setEmail]                       = useState("");
  const [addr1, setAddr1]                       = useState("");
  const [addr2, setAddr2]                       = useState("");
  const [city, setCity]                         = useState("");
  const [state, setState]                       = useState("");
  const [country, setCountry]                   = useState("");

  /* ── Section C – Next of Kin ─────────────────────────────────────────── */
  const [nokName, setNokName]                   = useState("");
  const [nokRelationship, setNokRelationship]   = useState("");
  const [nokPhone, setNokPhone]                 = useState("");
  const [nokAddr, setNokAddr]                   = useState("");

  /* ── Section D – Occupation / Employer ───────────────────────────────── */
  const [occupation, setOccupation]             = useState("");
  const [employer, setEmployer]                 = useState("");
  const [offAddr, setOffAddr]                   = useState("");
  const [offPhone, setOffPhone]                 = useState("");
  const [offEmail, setOffEmail]                 = useState("");

  /* ── Section E – Academic Qualifications ─────────────────────────────── */
  const [quals, setQuals] = useState([
    { institution: "", qualificationReceived: "", date: "" },
    { institution: "", qualificationReceived: "", date: "" },
    { institution: "", qualificationReceived: "", date: "" },
  ]);
  const updateQual = (i: number, field: keyof (typeof quals)[0], v: string) =>
    setQuals((prev) => prev.map((q, idx) => (idx === i ? { ...q, [field]: v } : q)));

  /* ── Section F – Christian History ───────────────────────────────────── */
  const [salvationDate, setSalvationDate]       = useState("");
  const [salvationWhere, setSalvationWhere]     = useState("");
  const [waterBaptismDate, setWaterBaptismDate] = useState("");
  const [waterBaptismWhere, setWaterBaptismWhere] = useState("");
  const [holyGhostDate, setHolyGhostDate]       = useState("");
  const [holyGhostWhere, setHolyGhostWhere]     = useState("");

  /* ── Section G – Past Places of Worship ─────────────────────────────── */
  const [wp, setWp] = useState([
    { name: "", address: "", date: "" },
    { name: "", address: "", date: "" },
    { name: "", address: "", date: "" },
  ]);
  const updateWp = (i: number, field: keyof (typeof wp)[0], v: string) =>
    setWp((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: v } : r)));

  /* ── Section H – Positions Held ──────────────────────────────────────── */
  const [ph, setPh] = useState([
    { worshipPlace: "", positionHeld: "" },
    { worshipPlace: "", positionHeld: "" },
    { worshipPlace: "", positionHeld: "" },
  ]);
  const updatePh = (i: number, field: keyof (typeof ph)[0], v: string) =>
    setPh((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: v } : r)));

  /* ── Section I – RCCG / Groups ───────────────────────────────────────── */
  const [reasonLeaving, setReasonLeaving]       = useState("");
  const [lifeCenter, setLifeCenter]             = useState("");
  const [nonRccg1, setNonRccg1]                 = useState("");
  const [nonRccg2, setNonRccg2]                 = useState("");
  const [nonRccg3, setNonRccg3]                 = useState("");

  /* ── Section J – Ministry & Gifts ────────────────────────────────────── */
  const GIFTS = [
    "Prophecy", "Teaching", "Helps/Service", "Administration",
    "Giving", "Healing", "Evangelism", "Mercy", "Faith",
    "Speaking in Tongues", "Exhortation", "Leadership",
  ];
  const [ministry, setMinistry]                 = useState("");
  const [gifts, setGifts]                       = useState<string[]>([]);
  const [reasonApplying, setReasonApplying]     = useState("");

  /* ── Section K – Declaration ─────────────────────────────────────────── */
  const [declName, setDeclName]                 = useState("");
  const [consent, setConsent]                   = useState(false);

  /* ── Submit state ────────────────────────────────────────────────────── */
  const [submitting, setSubmitting]             = useState(false);
  const [uploading, setUploading]               = useState(false);
  const [submitSuccess, setSubmitSuccess]       = useState(false);
  const [submitError, setSubmitError]           = useState("");

  /* ── Handlers ────────────────────────────────────────────────────────── */
  const toggleGift = (g: string) =>
    setGifts((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!firstName.trim() || !surname.trim() || !phone.trim()) {
      setSubmitError("First Name, Surname, and Phone Number are required before submitting.");
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
        .filter((q) => q.institution.trim())
        .map((q) => ({
          institution: q.institution,
          qualificationReceived: q.qualificationReceived || undefined,
          date: safeDate(q.date),
        }));

      const wpItems = wp
        .filter((r) => r.name.trim())
        .map((r) => ({ name: r.name, address: r.address || undefined, date: safeDate(r.date) }));

      const phItems = ph
        .filter((r) => r.worshipPlace.trim() || r.positionHeld.trim())
        .map((r) => ({ worshipPlace: r.worshipPlace, positionHeld: r.positionHeld }));

      const nonRccgGroups = [nonRccg1, nonRccg2, nonRccg3].filter(Boolean);

      await createWorkerInTraining({
        set:               set.trim() || undefined,
        profilePictureUrl,
        firstName:         firstName.trim(),
        middleName:        middleName.trim() || undefined,
        lastName:          surname.trim(),
        maidenName:        maidenName.trim() || undefined,
        countryCode:       "234",
        phoneNumber:       phone.trim(),
        otherPhoneNumber:  phone2.trim() || undefined,
        email:             email.trim() || undefined,
        sex:               sexNorm as string | undefined,
        dateOfBirth:       safeDate(dob),
        maritalStatus:     marital ? (maritalMap[marital] ?? marital.toUpperCase()) : undefined,
        spouseName:        spouseName.trim() || undefined,
        noOfChildren:      numChildren.trim() ? Number(numChildren.trim()) : undefined,
        nationality:       nationality.trim() || undefined,
        homeTown:          homeTown.trim() || undefined,
        stateOfOrigin:     stateOfOrigin.trim() || undefined,
        street:            [addr1, addr2].filter(Boolean).join(", ") || undefined,
        city:              city.trim() || undefined,
        state:             state.trim() || undefined,
        country:           country.trim() || undefined,
        nextOfKinName:          nokName.trim() || undefined,
        nextOfKinRelationship:  nokRelationship.trim() || undefined,
        nextOfKinPhoneNumber:   nokPhone.trim() || undefined,
        nextOfKinFullAddress:   nokAddr.trim() || undefined,
        occupation:        occupation.trim() || undefined,
        employer:          employer.trim() || undefined,
        officeFullAddress: offAddr.trim() || undefined,
        officePhoneNumber: offPhone.trim() || undefined,
        officeEmail:       offEmail.trim() || undefined,
        salvationDate:             safeDate(salvationDate),
        salvationLocation:         salvationWhere.trim() || undefined,
        waterBaptismDate:          safeDate(waterBaptismDate),
        waterBaptismLocation:      waterBaptismWhere.trim() || undefined,
        holySpiritBaptismDate:     safeDate(holyGhostDate),
        holySpiritBaptismLocation: holyGhostWhere.trim() || undefined,
        reasonForLeavingPastChurch: reasonLeaving.trim() || undefined,
        lifeCenterAttended:         lifeCenter.trim() || undefined,
        nonRCCGChristianGroups:     nonRccgGroups.length ? nonRccgGroups : undefined,
        yourMinistry:      ministry.trim() || undefined,
        giftsManifesting:  gifts.length ? gifts : undefined,
        reasonForApplying: reasonApplying.trim() || undefined,
        consent,
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
        @page { size: A4 portrait; margin: 12mm 16mm; }

        @media print {
          .wit-no-print  { display: none !important; }
          .wit-wrapper   { background: #fff !important; padding: 0 !important; min-height: auto !important; }
          .wit-paper     { box-shadow: none !important; width: 100% !important; max-width: none !important;
                           margin: 0 !important; padding: 0 !important; }
          .wit-page2     { page-break-before: always; break-before: page; margin-top: 0 !important; }
        }

        .wit-f {
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
        .wit-f:focus { border-bottom-color: #000080; background: #eef2ff; }
        @media print { .wit-f { border-bottom: 1px dotted #333; background: transparent !important; } }

        .wit-td-input {
          border: 1px solid #000;
          padding: 2px 6px;
        }
        .wit-td-input .wit-f { width: 100%; }
      `}</style>

      {/* ── Toolbar (no-print) ──────────────────────────────────────────── */}
      <div
        className="wit-no-print"
        style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "#000080", padding: "10px 20px",
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}
      >
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "Arial, sans-serif" }}>
          Workers-in-Training Application Form
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button
            onClick={() => window.print()}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "transparent", border: "1px solid rgba(255,255,255,0.6)",
              color: "#fff", borderRadius: 6, padding: "6px 14px",
              fontSize: 13, cursor: "pointer", fontFamily: "Arial, sans-serif",
            }}
          >
            <Printer size={15} /> Print / PDF
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: submitting ? "#555" : "#fff",
              border: "none", color: "#000080",
              borderRadius: 6, padding: "6px 16px",
              fontSize: 13, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <Send size={15} />
            {uploading ? "Uploading photo…" : submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>

      {/* ── Status banners ──────────────────────────────────────────────── */}
      {submitSuccess && (
        <div className="wit-no-print" style={{
          background: "#D1FAE5", border: "1px solid #6EE7B7",
          borderRadius: 8, padding: "12px 20px", margin: "16px auto",
          maxWidth: "210mm", display: "flex", alignItems: "center", gap: 10,
          fontFamily: "Arial, sans-serif", fontSize: 14,
        }}>
          <CheckCircle size={18} color="#065F46" />
          <span style={{ color: "#065F46", fontWeight: 600 }}>
            Application submitted successfully!
          </span>
        </div>
      )}
      {submitError && (
        <div className="wit-no-print" style={{
          background: "#FEE2E2", border: "1px solid #FCA5A5",
          borderRadius: 8, padding: "12px 20px", margin: "16px auto",
          maxWidth: "210mm", fontFamily: "Arial, sans-serif", fontSize: 14, color: "#991B1B",
        }}>
          {submitError}
        </div>
      )}

      {/* ── Form wrapper ────────────────────────────────────────────────── */}
      <div
        className="wit-wrapper"
        style={{ background: "#F3F4F6", padding: "24px 16px", minHeight: "100vh" }}
      >
        {/* ══════════════════ PAGE 1 ══════════════════ */}
        <div className="wit-paper" style={PAPER_STYLE}>

          {/* Church header */}
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 900, fontSize: 15, textTransform: "uppercase", letterSpacing: 1 }}>
              Redeemed Christian Church of God
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#000080", marginTop: 2 }}>
              Rose of Sharon Parish
            </div>
            <div style={{ fontWeight: 800, fontSize: 14, marginTop: 8, textDecoration: "underline", textTransform: "uppercase" }}>
              Workers-in-Training Application Form
            </div>
            <div style={{ marginTop: 6, fontSize: 12 }}>
              <span>Set/Year: </span>
              <F value={set} onChange={setSet} style={{ width: 80 }} />
            </div>
          </div>

          {/* ══ SECTION A – Biographical ══ */}
          <SectionHead>A.  Biographical Information</SectionHead>

          {/* Photo box */}
          <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <FullRow label="Surname:" value={surname} onChange={setSurname} />
                <FullRow label="First Name:" value={firstName} onChange={setFirstName} />
                <FullRow label="Middle Name:" value={middleName} onChange={setMiddleName} />
                <FullRow label="Maiden Name (if applicable):" value={maidenName} onChange={setMaidenName} />
              </div>
            </div>
            <div
              className="wit-no-print"
              style={{
                width: 90, height: 110, border: "1px solid #000",
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", flexShrink: 0, cursor: "pointer", overflow: "hidden",
              }}
              onClick={() => document.getElementById("wit-photo-input")?.click()}
            >
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 10, color: "#666", textAlign: "center", padding: 4 }}>
                  Click to add photo
                </span>
              )}
              <input id="wit-photo-input" type="file" accept="image/*" hidden onChange={handlePhotoChange} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12 }}>Sex:</span>
                <Chk label="Male"   checked={sex === "Male"}   onChange={() => setSex(sex === "Male"   ? "" : "Male")}   />
                <Chk label="Female" checked={sex === "Female"} onChange={() => setSex(sex === "Female" ? "" : "Female")} />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>Date of Birth:</span>
                <F value={dob} onChange={setDob} type="date" style={{ width: 130 }} />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12 }}>Marital Status:</span>
              {["Single", "Married", "Divorced", "Widowed"].map((m) => (
                <Chk key={m} label={m} checked={marital === m} onChange={() => setMarital(marital === m ? "" : m)} />
              ))}
            </div>

            <PairedRow
              left={{ label: "Spouse Name:", value: spouseName, onChange: setSpouseName }}
              right={{ label: "No. of Children:", value: numChildren, onChange: setNumChildren }}
            />
            <PairedRow
              left={{ label: "Nationality:", value: nationality, onChange: setNationality }}
              right={{ label: "Home Town:", value: homeTown, onChange: setHomeTown }}
            />
            <FullRow label="State of Origin:" value={stateOfOrigin} onChange={setStateOfOrigin} />
          </div>

          {/* ══ SECTION B – Contact & Address ══ */}
          <SectionHead>B.  Contact &amp; Address Information</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <PairedRow
              left={{ label: "Phone Number:", value: phone, onChange: setPhone }}
              right={{ label: "Other Phone:", value: phone2, onChange: setPhone2 }}
            />
            <FullRow label="Email Address:" value={email} onChange={setEmail} />
            <FullRow label="Residential Address (Line 1):" value={addr1} onChange={setAddr1} />
            <FullRow label="Address (Line 2):" value={addr2} onChange={setAddr2} />
            <PairedRow
              left={{ label: "City:", value: city, onChange: setCity }}
              right={{ label: "State:", value: state, onChange: setState }}
            />
            <FullRow label="Country:" value={country} onChange={setCountry} />
          </div>

          {/* ══ SECTION C – Next of Kin ══ */}
          <SectionHead>C.  Next of Kin</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <PairedRow
              left={{ label: "Name:", value: nokName, onChange: setNokName }}
              right={{ label: "Relationship:", value: nokRelationship, onChange: setNokRelationship }}
            />
            <PairedRow
              left={{ label: "Phone Number:", value: nokPhone, onChange: setNokPhone }}
              right={{ label: "Full Address:", value: nokAddr, onChange: setNokAddr }}
            />
          </div>

          {/* ══ SECTION D – Occupation ══ */}
          <SectionHead>D.  Occupation / Employer</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <PairedRow
              left={{ label: "Occupation:", value: occupation, onChange: setOccupation }}
              right={{ label: "Employer / Business Name:", value: employer, onChange: setEmployer }}
            />
            <FullRow label="Office / Business Full Address:" value={offAddr} onChange={setOffAddr} />
            <PairedRow
              left={{ label: "Office Phone:", value: offPhone, onChange: setOffPhone }}
              right={{ label: "Office Email:", value: offEmail, onChange: setOffEmail }}
            />
          </div>

          {/* ══ SECTION E – Academic Qualifications ══ */}
          <SectionHead>E.  Academic Qualifications</SectionHead>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #000", width: 24, padding: "3px 4px" }}></th>
                <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "center" }}>Institution</th>
                <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "center" }}>Qualification Received</th>
                <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "center", width: 80 }}>Year</th>
              </tr>
            </thead>
            <tbody>
              {quals.map((q, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #000", padding: "2px 4px", textAlign: "center", fontWeight: 700 }}>
                    {["I.", "II.", "III."][i]}
                  </td>
                  <td className="wit-td-input">
                    <F value={q.institution} onChange={(v) => updateQual(i, "institution", v)} style={{ width: "100%" }} />
                  </td>
                  <td className="wit-td-input">
                    <F value={q.qualificationReceived} onChange={(v) => updateQual(i, "qualificationReceived", v)} style={{ width: "100%" }} />
                  </td>
                  <td className="wit-td-input">
                    <F value={q.date} onChange={(v) => updateQual(i, "date", v)} style={{ width: "100%" }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>{/* end page 1 */}

        {/* ══════════════════ PAGE 2 ══════════════════ */}
        <div className="wit-paper wit-page2" style={{ ...PAPER_STYLE, marginTop: 0 }}>

          <div style={{ textAlign: "center", fontSize: 12, marginBottom: 16 }}>2</div>

          {/* ══ SECTION F – Christian History ══ */}
          <SectionHead>F.  Christian History</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <PairedRow
              left={{ label: "Date of Salvation:", value: salvationDate, onChange: setSalvationDate }}
              right={{ label: "Where:", value: salvationWhere, onChange: setSalvationWhere }}
            />
            <PairedRow
              left={{ label: "Date of Water Baptism by Immersion:", value: waterBaptismDate, onChange: setWaterBaptismDate }}
              right={{ label: "Church:", value: waterBaptismWhere, onChange: setWaterBaptismWhere }}
            />
            <PairedRow
              left={{ label: "Date of Holy Ghost Baptism:", value: holyGhostDate, onChange: setHolyGhostDate }}
              right={{ label: "Where:", value: holyGhostWhere, onChange: setHolyGhostWhere }}
            />
          </div>

          {/* ══ SECTION G – Past Places of Worship ══ */}
          <SectionHead>G.  Past Place(s) of Worship (Last 3 Years)</SectionHead>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #000", width: 24, padding: "3px 4px" }}></th>
                <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "center" }}>Name of Church</th>
                <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "center" }}>Address</th>
                <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "center", width: 70 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {wp.map((row, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #000", padding: "2px 4px", textAlign: "center", fontWeight: 700 }}>
                    {["I.", "II.", "III."][i]}
                  </td>
                  <td className="wit-td-input">
                    <F value={row.name} onChange={(v) => updateWp(i, "name", v)} style={{ width: "100%" }} />
                  </td>
                  <td className="wit-td-input">
                    <F value={row.address} onChange={(v) => updateWp(i, "address", v)} style={{ width: "100%" }} />
                  </td>
                  <td className="wit-td-input">
                    <F value={row.date} onChange={(v) => updateWp(i, "date", v)} style={{ width: "100%" }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ SECTION H – Positions Held ══ */}
          <SectionHead>H.  Position(s) Held in Past Place(s) of Worship</SectionHead>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #000", width: 24, padding: "3px 4px" }}></th>
                <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "center" }}>Name of Church</th>
                <th style={{ border: "1px solid #000", padding: "3px 8px", textAlign: "center" }}>Position Held</th>
              </tr>
            </thead>
            <tbody>
              {ph.map((row, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #000", padding: "2px 4px", textAlign: "center", fontWeight: 700 }}>
                    {["I.", "II.", "III."][i]}
                  </td>
                  <td className="wit-td-input">
                    <F value={row.worshipPlace} onChange={(v) => updatePh(i, "worshipPlace", v)} style={{ width: "100%" }} />
                  </td>
                  <td className="wit-td-input">
                    <F value={row.positionHeld} onChange={(v) => updatePh(i, "positionHeld", v)} style={{ width: "100%" }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ SECTION I – RCCG Information ══ */}
          <SectionHead>I.  RCCG Information</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <FullRow label="Life Centre Attended:" value={lifeCenter} onChange={setLifeCenter} />
            <FullRow label="Reason for Leaving Previous Church (if applicable):" value={reasonLeaving} onChange={setReasonLeaving} />
            <div style={{ fontSize: 12, marginBottom: 4 }}>
              Non-RCCG Christian Group(s) you belong to (if any):
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 8 }}>
              {[
                { label: "i.", val: nonRccg1, set: setNonRccg1 },
                { label: "ii.", val: nonRccg2, set: setNonRccg2 },
                { label: "iii.", val: nonRccg3, set: setNonRccg3 },
              ].map(({ label, val, set: setFn }) => (
                <div key={label} style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 12, minWidth: 20 }}>{label}</span>
                  <F value={val} onChange={setFn} style={{ flex: 1 }} />
                </div>
              ))}
            </div>
          </div>

          {/* ══ SECTION J – Ministry & Gifts ══ */}
          <SectionHead>J.  Ministry &amp; Gifts</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <FullRow label="Your Ministry:" value={ministry} onChange={setMinistry} />

            <div>
              <div style={{ fontSize: 12, marginBottom: 6 }}>
                Gifts Manifesting (tick all that apply):
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingLeft: 8 }}>
                {GIFTS.map((g) => (
                  <Chk key={g} label={g} checked={gifts.includes(g)} onChange={() => toggleGift(g)} />
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Reason for Applying:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <F value={reasonApplying} onChange={setReasonApplying} style={{ width: "100%" }} />
                <F value="" onChange={() => {}} style={{ width: "100%" }} />
              </div>
            </div>
          </div>

          {/* ══ SECTION K – Declaration ══ */}
          <SectionHead>K.  Declaration</SectionHead>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
            <span style={{ fontSize: 12 }}>I,</span>
            <F value={declName} onChange={setDeclName} style={{ flex: 1 }} />
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.7, margin: 0, marginBottom: 10 }}>
            hereby declare that all information provided in this application form is true, correct and
            complete. I understand that any false or misleading information may result in disqualification
            from the Workers-in-Training programme.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <input
              type="checkbox"
              id="wit-consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              style={{ width: 14, height: 14 }}
            />
            <label htmlFor="wit-consent" style={{ fontSize: 12, cursor: "pointer" }}>
              I agree to abide by all rules and regulations of the Workers-in-Training programme.
            </label>
          </div>

          {/* Signature line */}
          <div style={{ display: "flex", gap: 40, marginTop: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ borderBottom: "1px solid #000", marginBottom: 4 }}></div>
              <div style={{ fontSize: 11 }}>Applicant&apos;s Signature</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ borderBottom: "1px solid #000", marginBottom: 4 }}></div>
              <div style={{ fontSize: 11 }}>Date</div>
            </div>
          </div>

          {/* Official use */}
          <SectionHead>For Official Use Only</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <F value="" onChange={() => {}} style={{ width: "100%" }} />
            <F value="" onChange={() => {}} style={{ width: "100%" }} />
            <div style={{ display: "flex", gap: 40, marginTop: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ borderBottom: "1px solid #000", marginBottom: 4 }}></div>
                <div style={{ fontSize: 11 }}>Coordinator&apos;s Signature</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ borderBottom: "1px solid #000", marginBottom: 4 }}></div>
                <div style={{ fontSize: 11 }}>Date</div>
              </div>
            </div>
          </div>

        </div>{/* end page 2 */}
      </div>{/* end wrapper */}
    </>
  );
}
