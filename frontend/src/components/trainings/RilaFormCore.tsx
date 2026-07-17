"use client";

/**
 * RilaFormCore — digital replica of the physical RILA Application Form
 *
 * REDEEMER'S INTERNATIONAL LEADERSHIP ACADEMY (RILA)
 * Formerly International Bible Institute & Leadership Training School (IBI & LTS)
 *
 * mode = "blank"  → read-only, empty, Print Blank Form button only
 * mode = "fill"   → editable, Print + Submit buttons (submits via createSuggestion)
 * mode = "view"   → read-only, pre-filled (used after submit confirmation)
 */

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Printer, Send, CheckCircle, XCircle } from "lucide-react";
import {
  createSuggestion,
  uploadProfilePicture,
  getStoredUser,
} from "@/lib/api";

async function compressImage(file: File, maxDim = 800, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => resolve(new File([blob!], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" })),
        "image/jpeg",
        quality,
      );
    };
    img.src = objectUrl;
  });
}

export type RilaMode = "blank" | "fill" | "view";

/* ── Style constants ─────────────────────────────────────────────────────── */
const T: React.CSSProperties = { borderCollapse: "collapse", width: "100%", marginBottom: 14, fontSize: 11 };
const LBL: React.CSSProperties = { border: "1px solid #000", padding: "3px 7px", whiteSpace: "nowrap", verticalAlign: "middle", fontWeight: 700, fontSize: 11 };
const CEL: React.CSSProperties = { border: "1px solid #000", padding: "2px 5px", verticalAlign: "middle" };
const TH: React.CSSProperties  = { border: "1px solid #000", padding: "3px 5px", fontWeight: 700, fontSize: 10, textAlign: "center", background: "#f0f0f0" };
const TD: React.CSSProperties  = { border: "1px solid #000", padding: "2px 4px", fontSize: 10, verticalAlign: "middle" };

const PAPER: React.CSSProperties = {
  background: "#fff",
  width: 794,
  margin: "0 auto",
  padding: "36px 50px",
  boxShadow: "0 8px 40px rgba(0,0,0,0.28)",
  fontFamily: "Times New Roman, serif",
  fontSize: 11,
  color: "#000",
  lineHeight: 1.5,
};

/* ── Cell Input ──────────────────────────────────────────────────────────── */
function CI({
  value, onChange, readOnly, placeholder, style, maxLength, multiline, rows = 2,
}: {
  value: string; onChange?: (v: string) => void; readOnly?: boolean;
  placeholder?: string; style?: React.CSSProperties; maxLength?: number;
  multiline?: boolean; rows?: number;
}) {
  const base: React.CSSProperties = {
    border: "none", outline: "none", background: "transparent",
    width: "100%", fontFamily: "Times New Roman, serif", fontSize: 11,
    color: "#000", padding: "1px 0", resize: "none", ...style,
  };
  if (multiline) {
    return (
      <textarea readOnly={readOnly} value={value} rows={rows}
        onChange={readOnly ? undefined : (e) => onChange?.(e.target.value)}
        maxLength={maxLength} style={base}
        placeholder={readOnly ? undefined : placeholder}
      />
    );
  }
  return (
    <input type="text" readOnly={readOnly} value={value} maxLength={maxLength}
      onChange={readOnly ? undefined : (e) => onChange?.(e.target.value)}
      style={base} placeholder={readOnly ? undefined : placeholder}
    />
  );
}

/* ── Section Heading ─────────────────────────────────────────────────────── */
function SH({ letter, title }: { letter: string; title: string }) {
  return (
    <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", marginTop: 16, marginBottom: 5, borderBottom: "1px solid #000", paddingBottom: 2 }}>
      {letter}.&nbsp;&nbsp;{title}
    </div>
  );
}

/* ── Yes/No checkbox row ─────────────────────────────────────────────────── */
function YesNoRow({
  label, value, onYes, onNo, dateValue, onDate, whereValue, onWhere, readOnly,
}: {
  label: string; value: string; onYes?: () => void; onNo?: () => void;
  dateValue: string; onDate?: (v: string) => void;
  whereValue: string; onWhere?: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <tr>
      <td style={{ ...TD, fontSize: 10, paddingLeft: 6 }}>{label}</td>
      <td style={{ ...TD, textAlign: "center", width: 40 }}>
        <input type="checkbox" checked={value === "Yes"} readOnly={readOnly}
          onChange={readOnly ? undefined : () => onYes?.()}
          style={{ cursor: readOnly ? "default" : "pointer" }}
        />
      </td>
      <td style={{ ...TD, textAlign: "center", width: 40 }}>
        <input type="checkbox" checked={value === "No"} readOnly={readOnly}
          onChange={readOnly ? undefined : () => onNo?.()}
          style={{ cursor: readOnly ? "default" : "pointer" }}
        />
      </td>
      <td style={TD}><CI value={dateValue} onChange={onDate} readOnly={readOnly} /></td>
      <td style={TD}><CI value={whereValue} onChange={onWhere} readOnly={readOnly} /></td>
    </tr>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function RilaFormCore({
  mode,
}: {
  mode: RilaMode;
}) {
  const ro = mode !== "fill";
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);

  /* ── Cover page ──────────────────────────────────────────────────────── */
  const [coverName,          setCoverName]          = useState("");
  const [programme,          setProgramme]          = useState("");
  const [matricNo,           setMatricNo]           = useState("");
  const [campus,             setCampus]             = useState("");
  const [yearAdmission,      setYearAdmission]      = useState("");
  const [yearGraduated,      setYearGraduated]      = useState("");
  const [photo,              setPhoto]              = useState<File | null>(null);
  const [photoPreview,       setPhotoPreview]       = useState("");

  /* ── A. Biographic Data ──────────────────────────────────────────────── */
  const [surname,        setSurname]        = useState("");
  const [otherNames,     setOtherNames]     = useState("");
  const [title,          setTitle]          = useState("");
  const [sex,            setSex]            = useState("");
  const [dob,            setDob]            = useState("");
  const [placeOfBirth,   setPlaceOfBirth]   = useState("");
  const [nationality,    setNationality]    = useState("");
  const [stateOfOrigin,  setStateOfOrigin]  = useState("");
  const [lga,            setLga]            = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [telHome,        setTelHome]        = useState("");
  const [telMobile,      setTelMobile]      = useState("");
  const [email,          setEmail]          = useState("");

  /* ── B. Marital Status ───────────────────────────────────────────────── */
  const [marital,      setMarital]      = useState("");
  const [spouseName,   setSpouseName]   = useState("");
  const [maidenName,   setMaidenName]   = useState("");
  const [dateMarried,  setDateMarried]  = useState("");
  const [numChildren,  setNumChildren]  = useState("");

  /* ── C. Next of Kin ──────────────────────────────────────────────────── */
  const [nokName,     setNokName]     = useState("");
  const [nokRel,      setNokRel]      = useState("");
  const [nokAddress,  setNokAddress]  = useState("");
  const [nokTel,      setNokTel]      = useState("");

  /* ── D. Employment (Present) ─────────────────────────────────────────── */
  const [empName,     setEmpName]     = useState("");
  const [occupation,  setOccupation]  = useState("");
  const [position,    setPosition]    = useState("");
  const [jobDesc,     setJobDesc]     = useState("");
  const [officeAddr,  setOfficeAddr]  = useState("");
  const [officeTel,   setOfficeTel]   = useState("");

  /* ── E. Employment (Previous) ────────────────────────────────────────── */
  const [prevEmpName,     setPrevEmpName]     = useState("");
  const [prevOccupation,  setPrevOccupation]  = useState("");
  const [prevEmpPosition, setPrevEmpPosition] = useState("");
  const [prevJobDesc,     setPrevJobDesc]     = useState("");
  const [prevOfficeAddr,  setPrevOfficeAddr]  = useState("");
  const [prevOfficeTel,   setPrevOfficeTel]   = useState("");

  /* ── F. Academic History (5 rows) ────────────────────────────────────── */
  const [academics, setAcademics] = useState(() =>
    Array.from({ length: 5 }, () => ({ school: "", from: "", to: "", field: "", qualification: "" }))
  );
  const updateAcademic = (i: number, k: keyof typeof academics[0], v: string) =>
    setAcademics((prev) => prev.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  /* ── G. Professional Qualifications (4 rows) ─────────────────────────── */
  const [profQuals, setProfQuals] = useState(() =>
    Array.from({ length: 4 }, () => ({ body: "", qualification: "", date: "" }))
  );
  const updateProfQual = (i: number, k: keyof typeof profQuals[0], v: string) =>
    setProfQuals((prev) => prev.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  /* ── H. Christian History ────────────────────────────────────────────── */
  const [salvDate,    setSalvDate]    = useState("");
  const [salvWhere,   setSalvWhere]   = useState("");
  const [waterDate,   setWaterDate]   = useState("");
  const [waterWhere,  setWaterWhere]  = useState("");
  const [hgDate,      setHgDate]      = useState("");
  const [hgWhere,     setHgWhere]     = useState("");

  const [nbcAttended,    setNbcAttended]    = useState("");
  const [nbcDate,        setNbcDate]        = useState("");
  const [nbcWhere,       setNbcWhere]       = useState("");
  const [btcAttended,    setBtcAttended]    = useState("");
  const [btcDate,        setBtcDate]        = useState("");
  const [btcWhere,       setBtcWhere]       = useState("");
  const [witAttended,    setWitAttended]    = useState("");
  const [witDate,        setWitDate]        = useState("");
  const [witWhere,       setWitWhere]       = useState("");
  const [bibleAttended,  setBibleAttended]  = useState("");
  const [bibleDate,      setBibleDate]      = useState("");
  const [bibleWhere,     setBibleWhere]     = useState("");

  /* ── I. Place of Worship ─────────────────────────────────────────────── */
  const [presentChurch,    setPresentChurch]    = useState("");
  const [presentAddr,      setPresentAddr]      = useState("");
  const [presentTel,       setPresentTel]       = useState("");
  const [presentPastor,    setPresentPastor]    = useState("");
  const [presentPastorTel, setPresentPastorTel] = useState("");
  const [presentPosition,  setPresentPosition]  = useState("");
  const [gift1,            setGift1]            = useState("");
  const [gift2,            setGift2]            = useState("");
  const [gift3,            setGift3]            = useState("");
  const [prevChurch,       setPrevChurch]       = useState("");
  const [prevChurchAddr,   setPrevChurchAddr]   = useState("");
  const [prevChurchTel,    setPrevChurchTel]    = useState("");
  const [prevPastor,       setPrevPastor]       = useState("");
  const [prevPastorTel,    setPrevPastorTel]    = useState("");
  const [prevPosition,     setPrevPosition]     = useState("");

  /* ── J. Sponsorship ──────────────────────────────────────────────────── */
  const [sponsorName,    setSponsorName]    = useState("");
  const [sponsorAddress, setSponsorAddress] = useState("");
  const [sponsorTel,     setSponsorTel]     = useState("");

  /* ── K. Method of Payment ────────────────────────────────────────────── */
  const [paymentMethod, setPaymentMethod] = useState("");

  /* ── L & M. Open questions ───────────────────────────────────────────── */
  const [howHeard,   setHowHeard]   = useState("");
  const [whyApply,   setWhyApply]   = useState("");

  /* ── N. Referees ─────────────────────────────────────────────────────── */
  const [ref1Name,    setRef1Name]    = useState("");
  const [ref1Addr,    setRef1Addr]    = useState("");
  const [ref1Tel,     setRef1Tel]     = useState("");
  const [ref2Name,    setRef2Name]    = useState("");
  const [ref2Addr,    setRef2Addr]    = useState("");
  const [ref2Tel,     setRef2Tel]     = useState("");

  /* ── O. Applicant's Declaration ──────────────────────────────────────── */
  const [declDate, setDeclDate] = useState("");

  /* ── P. Pastor Attestation ───────────────────────────────────────────── */
  const [pastorChurch,     setPastorChurch]     = useState("");
  const [pastorChurchAddr, setPastorChurchAddr] = useState("");
  const [pastorName,       setPastorName]       = useState("");
  const [pastorDate,       setPastorDate]       = useState("");

  /* ── Submit state ────────────────────────────────────────────────────── */
  const [submitting,       setSubmitting]       = useState(false);
  const [uploading,        setUploading]        = useState(false);
  const [submitError,      setSubmitError]      = useState("");
  const [submitAttempted,  setSubmitAttempted]  = useState(false);
  const [submitted,        setSubmitted]        = useState(false);

  /* ── Photo handler ───────────────────────────────────────────────────── */
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* ── Validation ──────────────────────────────────────────────────────── */
  const surnameErr  = submitAttempted && !surname.trim();
  const otherNamesErr = submitAttempted && !otherNames.trim();
  const mobileErr   = submitAttempted && !telMobile.trim();

  /* ── Submit ──────────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    setSubmitAttempted(true);
    const missing: string[] = [];
    if (!surname.trim())    missing.push("Surname");
    if (!otherNames.trim()) missing.push("Other Names");
    if (!telMobile.trim())  missing.push("Mobile Tel");
    if (missing.length > 0) {
      setSubmitError(`Please fill in: ${missing.join(", ")}.`);
      return;
    }
    setSubmitError("");
    setSubmitting(true);
    try {
      let photoUrl = "";
      if (photo) {
        setUploading(true);
        const compressed = await compressImage(photo);
        photoUrl = await uploadProfilePicture(compressed);
        setUploading(false);
      }

      const user = getStoredUser();
      const userId = user?.id ?? "";

      const acList = academics
        .filter((a) => a.school.trim())
        .map((a) => `  ${a.school} | ${a.from}-${a.to} | ${a.field} | ${a.qualification}`)
        .join("\n") || "  —";

      const pfList = profQuals
        .filter((p) => p.body.trim() || p.qualification.trim())
        .map((p) => `  ${p.body} | ${p.qualification} | ${p.date}`)
        .join("\n") || "  —";

      const content = [
        "═══ RILA APPLICATION FORM ═══",
        "",
        `Applicant Name (Surname First): ${surname.trim()} ${otherNames.trim()}`,
        `Programme: ${programme}    Matric No: ${matricNo}    Campus: ${campus}`,
        `Year of Admission: ${yearAdmission}    Year Graduated: ${yearGraduated}`,
        photoUrl ? `Passport Photo: ${photoUrl}` : "",
        "",
        "── A. BIOGRAPHIC DATA ──",
        `Surname: ${surname}    Other Names: ${otherNames}    Title: ${title}`,
        `Sex: ${sex}    Date of Birth: ${dob}    Place of Birth: ${placeOfBirth}`,
        `Nationality: ${nationality}    State of Origin: ${stateOfOrigin}    LGA: ${lga}`,
        `Contact Address: ${contactAddress}`,
        `Tel (Home): ${telHome}    Mobile: ${telMobile}    E-mail: ${email}`,
        "",
        "── B. MARITAL STATUS ──",
        `Status: ${marital}    Spouse Name: ${spouseName}    Maiden Name: ${maidenName}`,
        `Date Married: ${dateMarried}    No. of Children: ${numChildren}`,
        "",
        "── C. NEXT OF KIN ──",
        `Name: ${nokName}    Relationship: ${nokRel}`,
        `Contact Address: ${nokAddress}    Tel: ${nokTel}`,
        "",
        "── D. EMPLOYMENT HISTORY (PRESENT) ──",
        `Employer: ${empName}    Occupation: ${occupation}    Position: ${position}`,
        `Job Description: ${jobDesc}`,
        `Office Address: ${officeAddr}    Tel: ${officeTel}`,
        "",
        "── E. EMPLOYMENT HISTORY (PREVIOUS) ──",
        `Employer: ${prevEmpName}    Occupation: ${prevOccupation}    Position: ${prevEmpPosition}`,
        `Job Description: ${prevJobDesc}`,
        `Office Address: ${prevOfficeAddr}    Tel: ${prevOfficeTel}`,
        "",
        "── F. ACADEMIC HISTORY ──",
        acList,
        "",
        "── G. PROFESSIONAL QUALIFICATIONS ──",
        pfList,
        "",
        "── H. CHRISTIAN HISTORY ──",
        `Date of Salvation: ${salvDate}    Where: ${salvWhere}`,
        `Date of Water Baptism: ${waterDate}    Where: ${waterWhere}`,
        `Date of Baptism in Holy Ghost: ${hgDate}    Where: ${hgWhere}`,
        `New Believer's Class: ${nbcAttended}    Date: ${nbcDate}    Where: ${nbcWhere}`,
        `Baptismal Class: ${btcAttended}    Date: ${btcDate}    Where: ${btcWhere}`,
        `Worker's Training: ${witAttended}    Date: ${witDate}    Where: ${witWhere}`,
        `Any Bible School Before: ${bibleAttended}    Date: ${bibleDate}    Where: ${bibleWhere}`,
        "",
        "── I. PLACE OF WORSHIP ──",
        `Present Church: ${presentChurch}    Address: ${presentAddr}    Tel: ${presentTel}`,
        `Pastor-in-Charge: ${presentPastor}    Tel: ${presentPastorTel}`,
        `Position/Ministry: ${presentPosition}`,
        `Special Gifts: 1. ${gift1}    2. ${gift2}    3. ${gift3}`,
        `Previous Church: ${prevChurch}    Address: ${prevChurchAddr}    Tel: ${prevChurchTel}`,
        `Pastor-in-Charge: ${prevPastor}    Tel: ${prevPastorTel}    Previous Position: ${prevPosition}`,
        "",
        "── J. SPONSORSHIP ──",
        `Sponsor Name: ${sponsorName}    Address: ${sponsorAddress}    Tel: ${sponsorTel}`,
        "",
        "── K. METHOD OF PAYMENT ──",
        `Payment Method: ${paymentMethod}`,
        "",
        "── L. HOW DID YOU HEAR ABOUT RILA? ──",
        howHeard,
        "",
        "── M. WHY DO YOU WANT TO ATTEND? ──",
        whyApply,
        "",
        "── N. REFEREES ──",
        `Referee 1: ${ref1Name}    Address: ${ref1Addr}    Tel: ${ref1Tel}`,
        `Referee 2: ${ref2Name}    Address: ${ref2Addr}    Tel: ${ref2Tel}`,
        "",
        "── O. DECLARATION ──",
        `Date: ${declDate}`,
        "",
        "── P. PASTOR ATTESTATION ──",
        `Church: ${pastorChurch}    Address: ${pastorChurchAddr}`,
        `Pastor's Name: ${pastorName}    Date: ${pastorDate}`,
      ].filter((l) => l !== undefined).join("\n");

      await createSuggestion({
        userId: userId || "anonymous",
        subject: `RILA Application — ${surname.trim()} ${otherNames.trim()}`,
        content,
      });
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  /* ── Print ───────────────────────────────────────────────────────────── */
  const handlePrint = () => window.print();

  /* ── Success screen ──────────────────────────────────────────────────── */
  if (submitted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, fontFamily: "Arial, sans-serif" }}>
        <CheckCircle size={56} color="#16A34A" />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Application Submitted</h2>
        <p style={{ color: "#6B7280", textAlign: "center", maxWidth: 380 }}>
          Your RILA application has been received. The admissions team will review it and get in touch with you.
        </p>
        <button
          onClick={() => router.push("/trainings/rila")}
          style={{ marginTop: 8, padding: "10px 24px", borderRadius: 8, background: "#DC2626", color: "#fff", fontWeight: 600, border: "none", cursor: "pointer", fontSize: 14 }}
        >
          Back to RILA
        </button>
      </div>
    );
  }

  /* ── Shared label style ──────────────────────────────────────────────── */
  const errCell = (hasErr: boolean): React.CSSProperties => ({
    ...CEL, background: hasErr ? "#FEF2F2" : undefined,
  });

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #rila-form, #rila-form * { visibility: visible !important; }
          #rila-form { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Action bar */}
      <div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "center", padding: "16px 0 10px", flexWrap: "wrap" }}>
        <button
          onClick={() => router.push("/trainings/rila")}
          style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: 13 }}
        >
          ← Back
        </button>
        <button
          onClick={handlePrint}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, border: "1px solid #000080", background: "#fff", color: "#000080", fontWeight: 600, cursor: "pointer", fontSize: 13 }}
        >
          <Printer size={15} /> {mode === "blank" ? "Print Blank Form" : "Print Form"}
        </button>
        {mode === "fill" && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, border: "none", background: submitting ? "#9CA3AF" : "#DC2626", color: "#fff", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontSize: 13 }}
          >
            {submitting ? (
              <>{uploading ? "Uploading photo…" : "Submitting…"}</>
            ) : (
              <><Send size={15} /> Submit Application</>
            )}
          </button>
        )}
      </div>

      {submitError && (
        <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 8, maxWidth: 794, margin: "0 auto 10px", padding: "10px 14px", borderRadius: 8, border: "1px solid #FECACA", background: "#FEF2F2", color: "#991B1B", fontSize: 13 }}>
          <XCircle size={16} /> {submitError}
        </div>
      )}

      {/* ══ FORM ══ */}
      <div id="rila-form" style={PAPER}>

        {/* ── Cover / Header ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          {/* Logo placeholder — replace with <img src="/rila-logo.png" …/> once received */}
          <div style={{
            width: 80, height: 80, border: "1px solid #aaa", borderRadius: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", fontSize: 9, color: "#555", textAlign: "center",
            background: "#f8f8f8", flexShrink: 0,
          }}>
            <span style={{ fontWeight: 700, fontSize: 11, color: "#DC2626" }}>RILA</span>
            <span>Logo</span>
          </div>

          {/* Title block */}
          <div style={{ flex: 1, textAlign: "center", padding: "0 16px" }}>
            <div style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Redeemer&apos;s International Leadership Academy
            </div>
            <div style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase" }}>(RILA)</div>
            <div style={{ fontSize: 10, marginTop: 3 }}>
              Formerly International Bible Institute &amp; Leadership Training School (IBI &amp; LTS)
            </div>
            <div style={{ fontSize: 10, fontStyle: "italic", marginTop: 2 }}>
              The Leadership Training Arm of The Redeemed Christian Church of God since 1995
            </div>
            <div style={{ fontWeight: 700, fontSize: 12, marginTop: 8, textTransform: "uppercase", borderBottom: "2px solid #000", paddingBottom: 3, letterSpacing: 1 }}>
              Application Form
            </div>
          </div>

          {/* Passport photo box */}
          <div style={{ width: 80, height: 96, border: "1px solid #000", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: ro ? "default" : "pointer", position: "relative", overflow: "hidden" }}
            onClick={() => !ro && photoInputRef.current?.click()}
          >
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="Passport" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ textAlign: "center", fontSize: 9, color: "#666", padding: 4 }}>
                {ro ? "PASSPORT\nPHOTO" : "Click to\nadd photo"}
              </div>
            )}
            {!ro && (
              <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
            )}
          </div>
        </div>

        {/* Cover page fields */}
        <table style={{ ...T, marginTop: 10 }}>
          <tbody>
            <tr>
              <td style={LBL}>NAME (SURNAME FIRST)</td>
              <td style={CEL} colSpan={3}><CI value={coverName} onChange={setCoverName} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>PROGRAMME</td>
              <td style={CEL} colSpan={3}><CI value={programme} onChange={setProgramme} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>MATRIC NO</td>
              <td style={CEL}><CI value={matricNo} onChange={setMatricNo} readOnly={ro} /></td>
              <td style={LBL}>CAMPUS</td>
              <td style={CEL}><CI value={campus} onChange={setCampus} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>YEAR OF ADMISSION</td>
              <td style={CEL}><CI value={yearAdmission} onChange={setYearAdmission} readOnly={ro} /></td>
              <td style={LBL}>YEAR GRADUATED</td>
              <td style={CEL}><CI value={yearGraduated} onChange={setYearGraduated} readOnly={ro} /></td>
            </tr>
          </tbody>
        </table>

        {/* ── A. BIOGRAPHIC DATA ─────────────────────────────────────────── */}
        <SH letter="A" title="Biographic Data" />
        <table style={T}>
          <tbody>
            <tr>
              <td style={LBL}>Surname{!ro && <span style={{ color: "red" }}>*</span>}</td>
              <td style={errCell(surnameErr)}><CI value={surname} onChange={setSurname} readOnly={ro} /></td>
              <td style={LBL}>Other Names{!ro && <span style={{ color: "red" }}>*</span>}</td>
              <td style={errCell(otherNamesErr)}><CI value={otherNames} onChange={setOtherNames} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Title</td>
              <td style={CEL}><CI value={title} onChange={setTitle} readOnly={ro} maxLength={20} /></td>
              <td style={LBL}>Sex</td>
              <td style={CEL}><CI value={sex} onChange={setSex} readOnly={ro} placeholder="Male / Female" /></td>
            </tr>
            <tr>
              <td style={LBL}>Date of Birth</td>
              <td style={CEL}><CI value={dob} onChange={setDob} readOnly={ro} placeholder="DD/MM/YYYY" /></td>
              <td style={LBL}>Place of Birth</td>
              <td style={CEL}><CI value={placeOfBirth} onChange={setPlaceOfBirth} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Nationality</td>
              <td style={CEL}><CI value={nationality} onChange={setNationality} readOnly={ro} /></td>
              <td style={LBL}>State of Origin</td>
              <td style={CEL}><CI value={stateOfOrigin} onChange={setStateOfOrigin} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>L.G.A.</td>
              <td style={CEL} colSpan={3}><CI value={lga} onChange={setLga} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Contact Address<br /><span style={{ fontSize: 9, fontWeight: 400 }}>(Not P.O. Box)</span></td>
              <td style={CEL} colSpan={3}><CI value={contactAddress} onChange={setContactAddress} readOnly={ro} multiline rows={2} /></td>
            </tr>
            <tr>
              <td style={LBL}>Tel (Home)</td>
              <td style={CEL}><CI value={telHome} onChange={setTelHome} readOnly={ro} /></td>
              <td style={LBL}>Tel (Mobile){!ro && <span style={{ color: "red" }}>*</span>}</td>
              <td style={errCell(mobileErr)}><CI value={telMobile} onChange={setTelMobile} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>E-mail</td>
              <td style={CEL} colSpan={3}><CI value={email} onChange={setEmail} readOnly={ro} /></td>
            </tr>
          </tbody>
        </table>

        {/* ── B. MARITAL STATUS ──────────────────────────────────────────── */}
        <SH letter="B" title="Marital Status" />
        <div style={{ display: "flex", gap: 18, marginBottom: 8, flexWrap: "wrap" }}>
          {["Married", "Single", "Divorced", "Separated", "Widowed", "Remarried"].map((opt) => (
            <label key={opt} style={{ display: "flex", alignItems: "center", gap: 4, cursor: ro ? "default" : "pointer", fontSize: 11 }}>
              <input type="checkbox" checked={marital === opt} readOnly={ro}
                onChange={ro ? undefined : () => setMarital(marital === opt ? "" : opt)}
                style={{ cursor: ro ? "default" : "pointer" }}
              />
              {opt}
            </label>
          ))}
        </div>
        <table style={T}>
          <tbody>
            <tr>
              <td style={LBL}>Name of Spouse</td>
              <td style={CEL}><CI value={spouseName} onChange={setSpouseName} readOnly={ro} /></td>
              <td style={LBL}>Maiden Name</td>
              <td style={CEL}><CI value={maidenName} onChange={setMaidenName} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Date Married</td>
              <td style={CEL}><CI value={dateMarried} onChange={setDateMarried} readOnly={ro} placeholder="DD/MM/YYYY" /></td>
              <td style={LBL}>No. of Children</td>
              <td style={CEL}><CI value={numChildren} onChange={setNumChildren} readOnly={ro} maxLength={3} /></td>
            </tr>
          </tbody>
        </table>

        {/* ── C. NEXT OF KIN ─────────────────────────────────────────────── */}
        <SH letter="C" title="Next of Kin" />
        <table style={T}>
          <tbody>
            <tr>
              <td style={LBL}>Name</td>
              <td style={CEL}><CI value={nokName} onChange={setNokName} readOnly={ro} /></td>
              <td style={LBL}>Relationship</td>
              <td style={CEL}><CI value={nokRel} onChange={setNokRel} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Contact Address</td>
              <td style={CEL} colSpan={3}><CI value={nokAddress} onChange={setNokAddress} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Tel</td>
              <td style={CEL} colSpan={3}><CI value={nokTel} onChange={setNokTel} readOnly={ro} /></td>
            </tr>
          </tbody>
        </table>

        {/* ── D. EMPLOYMENT HISTORY (PRESENT) ────────────────────────────── */}
        <SH letter="D" title="Employment History (Present)" />
        <table style={T}>
          <tbody>
            <tr>
              <td style={LBL}>Employer&apos;s Name</td>
              <td style={CEL}><CI value={empName} onChange={setEmpName} readOnly={ro} /></td>
              <td style={LBL}>Occupation</td>
              <td style={CEL}><CI value={occupation} onChange={setOccupation} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Position</td>
              <td style={CEL}><CI value={position} onChange={setPosition} readOnly={ro} /></td>
              <td style={LBL}>Job Description</td>
              <td style={CEL}><CI value={jobDesc} onChange={setJobDesc} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Office Address</td>
              <td style={CEL} colSpan={3}><CI value={officeAddr} onChange={setOfficeAddr} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Tel</td>
              <td style={CEL} colSpan={3}><CI value={officeTel} onChange={setOfficeTel} readOnly={ro} /></td>
            </tr>
          </tbody>
        </table>

        {/* ── E. EMPLOYMENT HISTORY (PREVIOUS) ───────────────────────────── */}
        <SH letter="E" title="Employment History (Previous)" />
        <table style={T}>
          <tbody>
            <tr>
              <td style={LBL}>Employer&apos;s Name</td>
              <td style={CEL}><CI value={prevEmpName} onChange={setPrevEmpName} readOnly={ro} /></td>
              <td style={LBL}>Occupation</td>
              <td style={CEL}><CI value={prevOccupation} onChange={setPrevOccupation} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Position</td>
              <td style={CEL}><CI value={prevEmpPosition} onChange={setPrevEmpPosition} readOnly={ro} /></td>
              <td style={LBL}>Job Description</td>
              <td style={CEL}><CI value={prevJobDesc} onChange={setPrevJobDesc} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Office Address</td>
              <td style={CEL} colSpan={3}><CI value={prevOfficeAddr} onChange={setPrevOfficeAddr} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Tel</td>
              <td style={CEL} colSpan={3}><CI value={prevOfficeTel} onChange={setPrevOfficeTel} readOnly={ro} /></td>
            </tr>
          </tbody>
        </table>

        {/* ── F. ACADEMIC HISTORY ────────────────────────────────────────── */}
        <SH letter="F" title="Academic History" />
        <table style={T}>
          <thead>
            <tr>
              <th style={TH}>School</th>
              <th style={{ ...TH, width: 60 }}>From</th>
              <th style={{ ...TH, width: 60 }}>To</th>
              <th style={TH}>Field of Study</th>
              <th style={TH}>Qualification Received</th>
            </tr>
          </thead>
          <tbody>
            {academics.map((row, i) => (
              <tr key={i}>
                <td style={TD}><CI value={row.school} onChange={(v) => updateAcademic(i, "school", v)} readOnly={ro} /></td>
                <td style={TD}><CI value={row.from} onChange={(v) => updateAcademic(i, "from", v)} readOnly={ro} /></td>
                <td style={TD}><CI value={row.to} onChange={(v) => updateAcademic(i, "to", v)} readOnly={ro} /></td>
                <td style={TD}><CI value={row.field} onChange={(v) => updateAcademic(i, "field", v)} readOnly={ro} /></td>
                <td style={TD}><CI value={row.qualification} onChange={(v) => updateAcademic(i, "qualification", v)} readOnly={ro} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── G. PROFESSIONAL QUALIFICATIONS ────────────────────────────── */}
        <SH letter="G" title="Professional Qualifications" />
        <table style={T}>
          <thead>
            <tr>
              <th style={TH}>Professional Body</th>
              <th style={TH}>Qualification</th>
              <th style={{ ...TH, width: 90 }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {profQuals.map((row, i) => (
              <tr key={i}>
                <td style={TD}><CI value={row.body} onChange={(v) => updateProfQual(i, "body", v)} readOnly={ro} /></td>
                <td style={TD}><CI value={row.qualification} onChange={(v) => updateProfQual(i, "qualification", v)} readOnly={ro} /></td>
                <td style={TD}><CI value={row.date} onChange={(v) => updateProfQual(i, "date", v)} readOnly={ro} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── H. CHRISTIAN HISTORY ───────────────────────────────────────── */}
        <SH letter="H" title="Christian History" />
        <table style={{ ...T, marginBottom: 6 }}>
          <tbody>
            <tr>
              <td style={LBL}>Date of Salvation</td>
              <td style={CEL}><CI value={salvDate} onChange={setSalvDate} readOnly={ro} placeholder="DD/MM/YYYY" /></td>
              <td style={LBL}>Where</td>
              <td style={CEL}><CI value={salvWhere} onChange={setSalvWhere} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Date of Water Baptism<br /><span style={{ fontSize: 9, fontWeight: 400 }}>(by immersion)</span></td>
              <td style={CEL}><CI value={waterDate} onChange={setWaterDate} readOnly={ro} placeholder="DD/MM/YYYY" /></td>
              <td style={LBL}>Where</td>
              <td style={CEL}><CI value={waterWhere} onChange={setWaterWhere} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Date of Baptism in<br />Holy Ghost <span style={{ fontSize: 9, fontWeight: 400 }}>(with tongues)</span></td>
              <td style={CEL}><CI value={hgDate} onChange={setHgDate} readOnly={ro} placeholder="DD/MM/YYYY" /></td>
              <td style={LBL}>Where</td>
              <td style={CEL}><CI value={hgWhere} onChange={setHgWhere} readOnly={ro} /></td>
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 4 }}>Have you attended:</div>
        <table style={T}>
          <thead>
            <tr>
              <th style={{ ...TH, textAlign: "left", paddingLeft: 6 }}>Programme</th>
              <th style={{ ...TH, width: 44 }}>Yes</th>
              <th style={{ ...TH, width: 44 }}>No</th>
              <th style={TH}>Date</th>
              <th style={TH}>Where</th>
            </tr>
          </thead>
          <tbody>
            <YesNoRow label="New Believer's Class" value={nbcAttended} onYes={() => setNbcAttended("Yes")} onNo={() => setNbcAttended("No")} dateValue={nbcDate} onDate={setNbcDate} whereValue={nbcWhere} onWhere={setNbcWhere} readOnly={ro} />
            <YesNoRow label="Baptismal Class" value={btcAttended} onYes={() => setBtcAttended("Yes")} onNo={() => setBtcAttended("No")} dateValue={btcDate} onDate={setBtcDate} whereValue={btcWhere} onWhere={setBtcWhere} readOnly={ro} />
            <YesNoRow label="Worker's Training" value={witAttended} onYes={() => setWitAttended("Yes")} onNo={() => setWitAttended("No")} dateValue={witDate} onDate={setWitDate} whereValue={witWhere} onWhere={setWitWhere} readOnly={ro} />
            <YesNoRow label="Any Bible School Before" value={bibleAttended} onYes={() => setBibleAttended("Yes")} onNo={() => setBibleAttended("No")} dateValue={bibleDate} onDate={setBibleDate} whereValue={bibleWhere} onWhere={setBibleWhere} readOnly={ro} />
          </tbody>
        </table>

        {/* ── I. PLACE OF WORSHIP ────────────────────────────────────────── */}
        <SH letter="I" title="Place of Worship" />
        <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4 }}>Present Church:</div>
        <table style={{ ...T, marginBottom: 6 }}>
          <tbody>
            <tr>
              <td style={LBL}>Name of Church</td>
              <td style={CEL} colSpan={3}><CI value={presentChurch} onChange={setPresentChurch} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Address</td>
              <td style={CEL}><CI value={presentAddr} onChange={setPresentAddr} readOnly={ro} /></td>
              <td style={LBL}>Tel</td>
              <td style={CEL}><CI value={presentTel} onChange={setPresentTel} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Pastor-in-Charge</td>
              <td style={CEL}><CI value={presentPastor} onChange={setPresentPastor} readOnly={ro} /></td>
              <td style={LBL}>Tel</td>
              <td style={CEL}><CI value={presentPastorTel} onChange={setPresentPastorTel} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Your Position /<br />Ministry</td>
              <td style={CEL} colSpan={3}><CI value={presentPosition} onChange={setPresentPosition} readOnly={ro} multiline rows={2} /></td>
            </tr>
            <tr>
              <td style={LBL}>Special Gifts<br /><span style={{ fontSize: 9, fontWeight: 400 }}>(in order)</span></td>
              <td style={CEL}><span style={{ fontSize: 10, marginRight: 4 }}>1.</span><CI value={gift1} onChange={setGift1} readOnly={ro} /></td>
              <td style={CEL}><span style={{ fontSize: 10, marginRight: 4 }}>2.</span><CI value={gift2} onChange={setGift2} readOnly={ro} /></td>
              <td style={CEL}><span style={{ fontSize: 10, marginRight: 4 }}>3.</span><CI value={gift3} onChange={setGift3} readOnly={ro} /></td>
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4 }}>Previous Church Attended:</div>
        <table style={T}>
          <tbody>
            <tr>
              <td style={LBL}>Name of Church</td>
              <td style={CEL} colSpan={3}><CI value={prevChurch} onChange={setPrevChurch} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Address</td>
              <td style={CEL}><CI value={prevChurchAddr} onChange={setPrevChurchAddr} readOnly={ro} /></td>
              <td style={LBL}>Tel</td>
              <td style={CEL}><CI value={prevChurchTel} onChange={setPrevChurchTel} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Pastor-in-Charge</td>
              <td style={CEL}><CI value={prevPastor} onChange={setPrevPastor} readOnly={ro} /></td>
              <td style={LBL}>Tel</td>
              <td style={CEL}><CI value={prevPastorTel} onChange={setPrevPastorTel} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Previous Position</td>
              <td style={CEL} colSpan={3}><CI value={prevPosition} onChange={setPrevPosition} readOnly={ro} /></td>
            </tr>
          </tbody>
        </table>

        {/* ── J. SPONSORSHIP ─────────────────────────────────────────────── */}
        <SH letter="J" title="Sponsorship (if other than self)" />
        <table style={T}>
          <tbody>
            <tr>
              <td style={LBL}>Name of Sponsor</td>
              <td style={CEL} colSpan={3}><CI value={sponsorName} onChange={setSponsorName} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Address of Sponsor</td>
              <td style={CEL} colSpan={3}><CI value={sponsorAddress} onChange={setSponsorAddress} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Tel</td>
              <td style={CEL}><CI value={sponsorTel} onChange={setSponsorTel} readOnly={ro} /></td>
              <td style={LBL}>Sponsor&apos;s Signature</td>
              <td style={CEL}></td>
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: 10, fontStyle: "italic", marginBottom: 10 }}>
          NOTE: Sponsor accepts full financial responsibility for the applicant&apos;s fees.
        </div>

        {/* ── K. METHOD OF PAYMENT ───────────────────────────────────────── */}
        <SH letter="K" title="Method of Payment" />
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, fontSize: 11, cursor: ro ? "default" : "pointer" }}>
            <input type="radio" name="payment" value="full" checked={paymentMethod === "full"} readOnly={ro}
              onChange={ro ? undefined : () => setPaymentMethod("full")}
              style={{ cursor: ro ? "default" : "pointer" }}
            />
            Full payment at registration
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, cursor: ro ? "default" : "pointer" }}>
            <input type="radio" name="payment" value="50pct" checked={paymentMethod === "50pct"} readOnly={ro}
              onChange={ro ? undefined : () => setPaymentMethod("50pct")}
              style={{ cursor: ro ? "default" : "pointer" }}
            />
            50% at registration (compulsory) and balance before matriculation
          </label>
        </div>

        {/* ── L. How did you hear about RILA? ────────────────────────────── */}
        <SH letter="L" title="How Did You Get Information About This Academy?" />
        <div style={{ border: "1px solid #000", padding: "4px 6px", minHeight: 36, marginBottom: 14 }}>
          <CI value={howHeard} onChange={setHowHeard} readOnly={ro} multiline rows={2} />
        </div>

        {/* ── M. Why do you want to attend? ──────────────────────────────── */}
        <SH letter="M" title="Why Did You Want to Come to the Bible Academy?" />
        <div style={{ border: "1px solid #000", padding: "4px 6px", minHeight: 36, marginBottom: 14 }}>
          <CI value={whyApply} onChange={setWhyApply} readOnly={ro} multiline rows={2} />
        </div>

        {/* ── N. REFEREES ────────────────────────────────────────────────── */}
        <SH letter="N" title="Referees" />
        <table style={T}>
          <thead>
            <tr>
              <th style={{ ...TH, width: 24 }}>No.</th>
              <th style={TH}>Name</th>
              <th style={TH}>Address</th>
              <th style={{ ...TH, width: 100 }}>Tel</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...TD, textAlign: "center", fontWeight: 700 }}>1.</td>
              <td style={TD}><CI value={ref1Name} onChange={setRef1Name} readOnly={ro} /></td>
              <td style={TD}><CI value={ref1Addr} onChange={setRef1Addr} readOnly={ro} /></td>
              <td style={TD}><CI value={ref1Tel} onChange={setRef1Tel} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={{ ...TD, textAlign: "center", fontWeight: 700 }}>2.</td>
              <td style={TD}><CI value={ref2Name} onChange={setRef2Name} readOnly={ro} /></td>
              <td style={TD}><CI value={ref2Addr} onChange={setRef2Addr} readOnly={ro} /></td>
              <td style={TD}><CI value={ref2Tel} onChange={setRef2Tel} readOnly={ro} /></td>
            </tr>
          </tbody>
        </table>

        {/* ── O. APPLICANT'S DECLARATION ─────────────────────────────────── */}
        <SH letter="O" title="Applicant's Declaration" />
        <div style={{ border: "1px solid #000", padding: "8px 10px", marginBottom: 10, fontSize: 10, lineHeight: 1.7 }}>
          I hereby certify that all the information I have provided in this application form is true and correct
          to the best of my knowledge. I understand that any false statement or misrepresentation may lead to
          rejection of this application or dismissal from the academy. I agree to abide by all the rules and
          regulations of the Redeemer&apos;s International Leadership Academy.
        </div>
        <table style={T}>
          <tbody>
            <tr>
              <td style={{ ...LBL, width: 160 }}>Applicant&apos;s Signature</td>
              <td style={CEL}></td>
              <td style={{ ...LBL, width: 60 }}>Date</td>
              <td style={CEL}><CI value={declDate} onChange={setDeclDate} readOnly={ro} placeholder="DD/MM/YYYY" /></td>
            </tr>
          </tbody>
        </table>

        {/* ── P. ATTESTATION BY APPLICANT'S PASTOR ───────────────────────── */}
        <SH letter="P" title="Attestation by Applicant's Pastor" />
        <div style={{ border: "1px solid #000", padding: "8px 10px", marginBottom: 10, fontSize: 10, lineHeight: 1.7 }}>
          I confirm that{" "}
          <span style={{ borderBottom: "1px dotted #000", display: "inline-block", minWidth: 200 }}>
            {coverName || (ro ? "____________________________" : "")}
          </span>{" "}
          is a worthy member of my congregation and I hereby recommend him/her for admission into RILA.
          I am aware of my responsibility to ensure that the applicant attends classes faithfully.
        </div>
        <table style={T}>
          <tbody>
            <tr>
              <td style={LBL}>Name of Church</td>
              <td style={CEL} colSpan={3}><CI value={pastorChurch} onChange={setPastorChurch} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Address</td>
              <td style={CEL} colSpan={3}><CI value={pastorChurchAddr} onChange={setPastorChurchAddr} readOnly={ro} /></td>
            </tr>
            <tr>
              <td style={LBL}>Pastor&apos;s Name</td>
              <td style={CEL}><CI value={pastorName} onChange={setPastorName} readOnly={ro} /></td>
              <td style={LBL}>Date</td>
              <td style={CEL}><CI value={pastorDate} onChange={setPastorDate} readOnly={ro} placeholder="DD/MM/YYYY" /></td>
            </tr>
            <tr>
              <td style={LBL}>Signature</td>
              <td style={CEL}></td>
              <td style={LBL}>Official Stamp</td>
              <td style={CEL}></td>
            </tr>
          </tbody>
        </table>

        {/* ── OFFICIAL USE ONLY ───────────────────────────────────────────── */}
        <div style={{ marginTop: 20, border: "2px solid #000", padding: "8px 10px" }}>
          <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", textAlign: "center", marginBottom: 8, borderBottom: "1px solid #000", paddingBottom: 4 }}>
            For Official Use Only
          </div>
          <table style={{ ...T, marginBottom: 0 }}>
            <tbody>
              <tr>
                <td style={LBL}>Short Listed for Interview</td>
                <td style={{ ...CEL, width: 60 }}>YES ( )</td>
                <td style={{ ...CEL, width: 60 }}>NO ( )</td>
                <td style={LBL}>Date Interviewed</td>
                <td style={CEL}></td>
              </tr>
              <tr>
                <td style={LBL}>Decision</td>
                <td style={{ ...CEL, width: 80 }}>Admitted ( )</td>
                <td style={{ ...CEL, width: 100 }}>Not Admitted ( )</td>
                <td style={LBL}>Admission No.</td>
                <td style={CEL}></td>
              </tr>
              <tr>
                <td style={LBL}>Academic Officer<br /><span style={{ fontWeight: 400 }}>(Admissions)</span></td>
                <td style={CEL} colSpan={2}></td>
                <td style={LBL}>Rector</td>
                <td style={CEL}></td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
      {/* Bottom action bar (fill mode only) */}
      {mode === "fill" && (
        <div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "center", padding: "20px 0", flexWrap: "wrap" }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 28px", borderRadius: 8, border: "none", background: submitting ? "#9CA3AF" : "#DC2626", color: "#fff", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontSize: 14 }}
          >
            {submitting ? (uploading ? "Uploading photo…" : "Submitting…") : <><Send size={16} /> Submit Application</>}
          </button>
        </div>
      )}
    </>
  );
}
