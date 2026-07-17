"use client";

/**
 * RilaFormCore — pixel-perfect 4-page replica of the physical RILA Application Form
 *
 * Page 1: Cover (title, large logo, passport photo box, name/programme fields)
 * Page 2: Sections A – F  (Biographic Data → Academic History)
 * Page 3: Sections G – K  (Professional Quals → Method of Payment)
 * Page 4: Sections L – P + Official Use Only
 *
 * mode = "blank"  → read-only empty form (print blank)
 * mode = "fill"   → editable, multi-page, submit via POST /api/v1/rilas
 */

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Printer, Send, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { createRila, uploadProfilePicture } from "@/lib/api";

/* ─── image compress helper ───────────────────────────────────────────────── */
async function compressImage(file: File, maxDim = 800, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width  = Math.round(img.width  * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob(
        (b) => resolve(new File([b!], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" })),
        "image/jpeg", quality,
      );
    };
    img.src = url;
  });
}

export type RilaMode = "blank" | "fill";

/* ─── paper / global styles ───────────────────────────────────────────────── */
const FONT = "Arial, Helvetica, sans-serif";

const PAPER: React.CSSProperties = {
  background: "#fff",
  width: 794,
  minHeight: 1123,
  margin: "0 auto",
  padding: "28px 44px 36px",
  boxShadow: "0 6px 32px rgba(0,0,0,0.22)",
  fontFamily: FONT,
  fontSize: 11,
  color: "#000",
  boxSizing: "border-box",
  position: "relative",
};

/* ─── table / cell helpers ────────────────────────────────────────────────── */
const TB: React.CSSProperties = { borderCollapse: "collapse", width: "100%", marginBottom: 10 };
const C: React.CSSProperties  = { border: "1px solid #000", padding: "2px 5px", verticalAlign: "middle", fontSize: 11 };
const CH: React.CSSProperties = { ...C, fontWeight: 700, background: "#f2f2f2", fontSize: 11, textAlign: "center" };
const CL: React.CSSProperties = { ...C, fontWeight: 700, whiteSpace: "nowrap" };  // label cell

/* ─── dotted-line input (free text fill lines) ────────────────────────────── */
function DL({
  value, onChange, readOnly, width = "100%", style,
}: {
  value: string; onChange?: (v: string) => void; readOnly?: boolean;
  width?: string | number; style?: React.CSSProperties;
}) {
  return (
    <input
      type="text" value={value} readOnly={readOnly}
      onChange={readOnly ? undefined : (e) => onChange?.(e.target.value)}
      style={{
        border: "none", borderBottom: "1px dotted #555", outline: "none",
        background: "transparent", fontFamily: FONT, fontSize: 11,
        color: "#000", width, padding: "1px 2px", ...style,
      }}
    />
  );
}

/* ─── transparent cell input ─────────────────────────────────────────────── */
function CI({
  value, onChange, readOnly, placeholder, multiline, rows = 2, style,
}: {
  value: string; onChange?: (v: string) => void; readOnly?: boolean;
  placeholder?: string; multiline?: boolean; rows?: number;
  style?: React.CSSProperties;
}) {
  const base: React.CSSProperties = {
    border: "none", outline: "none", background: "transparent",
    fontFamily: FONT, fontSize: 11, color: "#000",
    width: "100%", padding: "1px 2px", resize: "none", ...style,
  };
  if (multiline)
    return <textarea value={value} readOnly={readOnly} rows={rows}
      onChange={readOnly ? undefined : (e) => onChange?.(e.target.value)}
      style={base} placeholder={readOnly ? undefined : placeholder} />;
  return <input type="text" value={value} readOnly={readOnly}
    onChange={readOnly ? undefined : (e) => onChange?.(e.target.value)}
    style={base} placeholder={readOnly ? undefined : placeholder} />;
}

/* ─── section heading ─────────────────────────────────────────────────────── */
function SH({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", marginTop: 10, marginBottom: 3 }}>
      {children}
    </div>
  );
}

/* ─── small logo ──────────────────────────────────────────────────────────── */
function SmallLogo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/rila-logo.jpeg" alt="RILA" style={{ width: 52, height: 52, objectFit: "contain" }} />
  );
}

/* ─── checkbox that toggles a string value ───────────────────────────────── */
function CB({
  label, value, option, onChange, readOnly,
}: {
  label: string; value: string; option: string;
  onChange?: (v: string) => void; readOnly?: boolean;
}) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 3, marginRight: 10, fontSize: 11, cursor: readOnly ? "default" : "pointer" }}>
      <input
        type="checkbox" checked={value === option} readOnly={readOnly}
        onChange={readOnly ? undefined : () => onChange?.(value === option ? "" : option)}
        style={{ cursor: readOnly ? "default" : "pointer", width: 11, height: 11 }}
      />
      {label}
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function RilaFormCore({ mode }: { mode: RilaMode }) {
  const ro = mode !== "fill";
  const router = useRouter();
  const photoRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Cover page fields ───────────────────────────────────────────────── */
  const [passportPreview, setPassportPreview] = useState("");
  const [passportFile,    setPassportFile]    = useState<File | null>(null);
  const [coverName,       setCoverName]       = useState("");
  const [set,             setSet]             = useState("");
  const [programme,       setProgramme]       = useState("");
  const [matricNo,        setMatricNo]        = useState("");
  const [campus,          setCampus]          = useState("");
  const [yearAdmission,   setYearAdmission]   = useState("");
  const [yearGraduated,   setYearGraduated]   = useState("");

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
  const [mobile,         setMobile]         = useState("");
  const [email,          setEmail]          = useState("");

  /* ── B. Marital Status ───────────────────────────────────────────────── */
  const [marital,     setMarital]     = useState("");
  const [spouseName,  setSpouseName]  = useState("");
  const [maidenName,  setMaidenName]  = useState("");
  const [dateMarried, setDateMarried] = useState("");
  const [numChildren, setNumChildren] = useState("");

  /* ── C. Next of Kin ──────────────────────────────────────────────────── */
  const [nokName,    setNokName]    = useState("");
  const [nokRel,     setNokRel]     = useState("");
  const [nokAddr,    setNokAddr]    = useState("");
  const [nokTel,     setNokTel]     = useState("");

  /* ── D. Employment (Present) ─────────────────────────────────────────── */
  const [empName,    setEmpName]    = useState("");
  const [empOcc,     setEmpOcc]     = useState("");
  const [empPos,     setEmpPos]     = useState("");
  const [empJobDesc, setEmpJobDesc] = useState("");
  const [empAddr,    setEmpAddr]    = useState("");
  const [empTel,     setEmpTel]     = useState("");

  /* ── E. Employment (Previous) ────────────────────────────────────────── */
  const [prevEmpName,    setPrevEmpName]    = useState("");
  const [prevEmpOcc,     setPrevEmpOcc]     = useState("");
  const [prevEmpPos,     setPrevEmpPos]     = useState("");
  const [prevEmpJobDesc, setPrevEmpJobDesc] = useState("");
  const [prevEmpAddr,    setPrevEmpAddr]    = useState("");
  const [prevEmpTel,     setPrevEmpTel]     = useState("");

  /* ── F. Academic History (6 rows) ────────────────────────────────────── */
  const [academics, setAcademics] = useState(() =>
    Array.from({ length: 6 }, () => ({ school: "", from: "", to: "", field: "", qualification: "" }))
  );
  const setAcad = (i: number, k: keyof typeof academics[0], v: string) =>
    setAcademics((p) => p.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  /* ── G. Professional Qualifications (4 rows) ─────────────────────────── */
  const [profQuals, setProfQuals] = useState(() =>
    Array.from({ length: 4 }, () => ({ body: "", qualification: "", date: "" }))
  );
  const setPQ = (i: number, k: keyof typeof profQuals[0], v: string) =>
    setProfQuals((p) => p.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  /* ── H. Christian History ────────────────────────────────────────────── */
  const [salvDate,   setSalvDate]   = useState("");
  const [salvWhere,  setSalvWhere]  = useState("");
  const [waterDate,  setWaterDate]  = useState("");
  const [waterWhere, setWaterWhere] = useState("");
  const [hgDate,     setHgDate]     = useState("");
  const [hgWhere,    setHgWhere]    = useState("");

  const [nbc,   setNbc]   = useState({ yes: false, no: false, date: "", where: "" });
  const [btc,   setBtc]   = useState({ yes: false, no: false, date: "", where: "" });
  const [wit,   setWit]   = useState({ yes: false, no: false, date: "", where: "" });
  const [bible, setBible] = useState({ yes: false, no: false, date: "", where: "" });

  /* ── I. Place of Worship ─────────────────────────────────────────────── */
  const [presentChurch,    setPresentChurch]    = useState("");
  const [presentAddr,      setPresentAddr]      = useState("");
  const [presentTel,       setPresentTel]       = useState("");
  const [presentPastor,    setPresentPastor]    = useState("");
  const [presentPastorTel, setPresentPastorTel] = useState("");
  const [presentPosition,  setPresentPosition]  = useState("");
  const [gift1, setGift1] = useState("");
  const [gift2, setGift2] = useState("");
  const [gift3, setGift3] = useState("");
  const [prevChurch,       setPrevChurch]       = useState("");
  const [prevChurchAddr,   setPrevChurchAddr]   = useState("");
  const [prevChurchTel,    setPrevChurchTel]    = useState("");
  const [prevPastor,       setPrevPastor]       = useState("");
  const [prevPastorTel,    setPrevPastorTel]    = useState("");
  const [prevPosition,     setPrevPosition]     = useState("");

  /* ── J. Sponsorship ──────────────────────────────────────────────────── */
  const [selfSponsored, setSelfSponsored] = useState(true);
  const [sponsorName,   setSponsorName]   = useState("");
  const [sponsorAddr,   setSponsorAddr]   = useState("");
  const [sponsorTel,    setSponsorTel]    = useState("");

  /* ── K. Method of Payment ────────────────────────────────────────────── */
  const [payMethod, setPayMethod] = useState("");

  /* ── L & M ───────────────────────────────────────────────────────────── */
  const [howHeard, setHowHeard] = useState("");
  const [whyApply, setWhyApply] = useState("");

  /* ── N. Referees ─────────────────────────────────────────────────────── */
  const [ref1Name, setRef1Name] = useState("");
  const [ref1Addr, setRef1Addr] = useState("");
  const [ref1Tel,  setRef1Tel]  = useState("");
  const [ref2Name, setRef2Name] = useState("");
  const [ref2Addr, setRef2Addr] = useState("");
  const [ref2Tel,  setRef2Tel]  = useState("");

  /* ── O. Declaration ──────────────────────────────────────────────────── */
  const [applicantName, setApplicantName] = useState("");
  const [declDate,      setDeclDate]      = useState("");

  /* ── P. Pastor attestation ───────────────────────────────────────────── */
  const [pastorChurch,     setPastorChurch]     = useState("");
  const [pastorChurchAddr, setPastorChurchAddr] = useState("");
  const [pastorName,       setPastorName]       = useState("");
  const [pastorDate,       setPastorDate]       = useState("");

  /* ── Submit state ────────────────────────────────────────────────────── */
  const [submitting,   setSubmitting]   = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [submitError,  setSubmitError]  = useState("");
  const [submitted,    setSubmitted]    = useState(false);
  const [submittedId,  setSubmittedId]  = useState("");
  const [copiedLink,   setCopiedLink]   = useState<"sponsor" | "pastor" | null>(null);
  const [pageErrors,   setPageErrors]   = useState<Record<number, boolean>>({});

  /* ── passport photo ──────────────────────────────────────────────────── */
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPassportFile(f);
    const r = new FileReader();
    r.onloadend = () => setPassportPreview(r.result as string);
    r.readAsDataURL(f);
  };

  /* ── page validation (required fields on page 2) ─────────────────────── */
  const validatePage2 = () => {
    const missing = !surname.trim() || !otherNames.trim() || !mobile.trim();
    setPageErrors((p) => ({ ...p, 2: missing }));
    return !missing;
  };

  /* ── submit ──────────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!validatePage2()) {
      setSubmitError("Please go back to Page 2 and fill in Surname, Other Names and Mobile number.");
      return;
    }
    if (!set.trim()) {
      setSubmitError("Please fill in the SET field on the cover page.");
      return;
    }
    setSubmitError("");
    setSubmitting(true);
    try {
      let photoUrl = "";
      if (passportFile) {
        setUploading(true);
        photoUrl = await uploadProfilePicture(await compressImage(passportFile));
        setUploading(false);
      }

      /* parse otherNames → firstName + middleName */
      const nameParts = otherNames.trim().split(/\s+/);
      const firstName  = nameParts[0] ?? "";
      const middleName = nameParts.slice(1).join(" ") || undefined;

      /* build qualificationRequests from academic history + professional quals */
      const qualificationRequests = [
        ...academics
          .filter((a) => a.school.trim() || a.qualification.trim())
          .map((a) => ({
            nameOfInstitution: a.school,
            yearFrom: a.from,
            yearTo: a.to,
            courseOfStudy: a.field,
            qualification: a.qualification,
            isProfessional: false,
          })),
        ...profQuals
          .filter((p) => p.body.trim() || p.qualification.trim())
          .map((p) => ({
            nameOfInstitution: p.body,
            yearFrom: "",
            yearTo: p.date,
            courseOfStudy: "",
            qualification: p.qualification,
            isProfessional: true,
          })),
      ];

      /* previous church */
      const createPastPlaceOfWorshipRequests = prevChurch.trim()
        ? [{ name: prevChurch, address: prevChurchAddr, phoneNumber: prevChurchTel, pastorName: prevPastor, pastorPhoneNumber: prevPastorTel, positionHeld: prevPosition }]
        : undefined;

      /* referees */
      const createStudentReferenceRequests = [
        ...(ref1Name.trim() ? [{ name: ref1Name, address: ref1Addr, phoneNumber: ref1Tel }] : []),
        ...(ref2Name.trim() ? [{ name: ref2Name, address: ref2Addr, phoneNumber: ref2Tel }] : []),
      ];

      /* gifts manifesting */
      const giftsManifesting = [gift1, gift2, gift3].filter(Boolean);

      const result = await createRila({
        set: set.trim(),
        title: title || undefined,
        programme: programme || undefined,
        campus: campus || undefined,
        firstName,
        middleName,
        lastName: surname.trim(),
        maidenName: maidenName || undefined,
        phoneNumber: mobile.trim(),
        otherPhoneNumber: telHome || undefined,
        email: email || undefined,
        profilePictureUrl: photoUrl || undefined,
        sex: sex || undefined,
        dateOfBirth: dob || undefined,
        placeOfBirth: placeOfBirth || undefined,
        nationality: nationality || undefined,
        stateOfOrigin: stateOfOrigin || undefined,
        lga: lga || undefined,
        street: contactAddress || undefined,
        maritalStatus: marital || undefined,
        spouseName: spouseName || undefined,
        weddingDate: dateMarried || undefined,
        noOfChildren: numChildren ? parseInt(numChildren, 10) : undefined,
        nextOfKinName: nokName || undefined,
        nextOfKinRelationship: nokRel || undefined,
        nextOfKinFullAddress: nokAddr || undefined,
        nextOfKinPhoneNumber: nokTel || undefined,
        employer: empName || undefined,
        occupation: empOcc || undefined,
        position: empPos || undefined,
        jobDescription: empJobDesc || undefined,
        officeFullAddress: empAddr || undefined,
        officePhoneNumber: empTel || undefined,
        previousEmployer: prevEmpName || undefined,
        previousOccupation: prevEmpOcc || undefined,
        previousPosition: prevEmpPos || undefined,
        previousJobDescription: prevEmpJobDesc || undefined,
        previousOfficeFullAddress: prevEmpAddr || undefined,
        previousOfficePhoneNumber: prevEmpTel || undefined,
        salvationDate: salvDate || undefined,
        salvationLocation: salvWhere || undefined,
        waterBaptismDate: waterDate || undefined,
        waterBaptismLocation: waterWhere || undefined,
        holySpiritBaptismDate: hgDate || undefined,
        holySpiritBaptismLocation: hgWhere || undefined,
        believerClassDate: nbc.date || undefined,
        believerClassLocation: nbc.where || undefined,
        workersInTrainingDate: wit.date || undefined,
        workersInTrainingLocation: wit.where || undefined,
        otherBibleSchoolDate: bible.date || undefined,
        otherBibleSchoolLocation: bible.where || undefined,
        currentChurchName: presentChurch || undefined,
        currentChurchAddress: presentAddr || undefined,
        currentChurchPhoneNumber: presentTel || undefined,
        currentPastorName: presentPastor || undefined,
        currentPastorPhoneNumber: presentPastorTel || undefined,
        yourMinistry: presentPosition || undefined,
        giftsManifesting: giftsManifesting.length ? giftsManifesting : undefined,
        heardAboutUs: howHeard || undefined,
        reasonForApplying: whyApply || undefined,
        selfSponsored,
        qualificationRequests: qualificationRequests.length ? qualificationRequests : undefined,
        createPastPlaceOfWorshipRequests,
        createStudentReferenceRequests: createStudentReferenceRequests.length ? createStudentReferenceRequests : undefined,
      });
      setSubmittedId(result.id ?? "");
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  /* ── success ─────────────────────────────────────────────────────────── */
  if (submitted) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const sponsorLink = `${origin}/trainings/rila/sponsor?id=${submittedId}`;
    const pastorLink  = `${origin}/trainings/rila/pastor?id=${submittedId}`;
    const copyLink = (type: "sponsor" | "pastor", url: string) => {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(type);
        setTimeout(() => setCopiedLink(null), 2000);
      });
    };
    const linkBox: React.CSSProperties = {
      display: "flex", alignItems: "center", gap: 8,
      background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8,
      padding: "8px 12px", width: "100%", maxWidth: 480,
    };
    const copyBtn: React.CSSProperties = {
      flexShrink: 0, padding: "4px 12px", borderRadius: 6, border: "1px solid #D1D5DB",
      background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#374151",
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 20, fontFamily: FONT, padding: "24px 16px" }}>
        <CheckCircle size={56} color="#16A34A" />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111", textAlign: "center" }}>Application Submitted</h2>
        <p style={{ color: "#555", textAlign: "center", maxWidth: 460, fontSize: 14, margin: 0 }}>
          Your RILA application has been received. Complete the next steps below by sharing the links with your sponsor and pastor.
        </p>

        {!selfSponsored && submittedId && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 480 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#111", margin: 0 }}>Step 2 — Share with your Sponsor</p>
            <p style={{ fontSize: 12, color: "#666", margin: 0 }}>Your sponsor needs to fill their section. Share this link with them:</p>
            <div style={linkBox}>
              <span style={{ flex: 1, fontSize: 11, color: "#374151", wordBreak: "break-all" }}>{sponsorLink}</span>
              <button style={copyBtn} onClick={() => copyLink("sponsor", sponsorLink)}>
                {copiedLink === "sponsor" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {submittedId && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 480 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#111", margin: 0 }}>
              {selfSponsored ? "Step 2" : "Step 3"} — Share with your Pastor
            </p>
            <p style={{ fontSize: 12, color: "#666", margin: 0 }}>Your pastor needs to fill the attestation section. Share this link:</p>
            <div style={linkBox}>
              <span style={{ flex: 1, fontSize: 11, color: "#374151", wordBreak: "break-all" }}>{pastorLink}</span>
              <button style={copyBtn} onClick={() => copyLink("pastor", pastorLink)}>
                {copiedLink === "pastor" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        <button onClick={() => router.push("/trainings/rila")}
          style={{ padding: "10px 24px", borderRadius: 8, background: "#DC2626", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", fontSize: 14, marginTop: 8 }}>
          Back to RILA
        </button>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
     PAGE 1 — COVER
  ══════════════════════════════════════════════════════════════════════ */
  const page1 = (
    <div style={PAPER}>
      {/* Header row: title block + passport photo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 18, textAlign: "center", lineHeight: 1.3 }}>
            REDEEMER&apos;S INTERNATIONAL LEADERSHIP ACADEMY (RILA)
          </div>
          <div style={{ background: "#000", color: "#fff", fontWeight: 700, fontSize: 10, textAlign: "center", padding: "3px 6px", marginTop: 6 }}>
            FORMERLY INTERNATIONAL BIBLE INSTITUTE &amp; LEADERSHIP TRAINING SCHOOL (IBI &amp; LTS)
          </div>
          <div style={{ fontSize: 10, textAlign: "center", marginTop: 4 }}>
            THE LEADERSHIP TRAINING ARM OF THE REDEEMED CHRISTIAN CHURCH OF GOD SINCE 1995
          </div>
        </div>

        {/* Passport photo box */}
        <div
          onClick={() => !ro && photoRef.current?.click()}
          style={{
            width: 110, height: 126, border: "1px solid #000", marginLeft: 18, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: ro ? "default" : "pointer", overflow: "hidden", position: "relative",
          }}
        >
          {passportPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={passportPreview} alt="Passport" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ textAlign: "center", fontSize: 9, color: "#555", padding: 6, lineHeight: 1.5 }}>
              Affix a recent passport photograph here and enclose three others<br /><br />Have it signed
            </div>
          )}
          {!ro && <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />}
        </div>
      </div>

      {/* Large centered logo */}
      <div style={{ display: "flex", justifyContent: "center", margin: "50px 0 60px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/rila-logo.jpeg" alt="RILA Logo" style={{ width: 240, height: 240, objectFit: "contain" }} />
      </div>

      {/* Bottom fill fields — with underlines matching physical form */}
      <div style={{ paddingTop: 8 }}>
        {[
          { label: "NAME:", note: "(SURNAME FIRST)", value: coverName, onChange: setCoverName, full: true },
          { label: "PROGRAMME:", note: "", value: programme, onChange: setProgramme, full: true },
        ].map(({ label, note, value, onChange, full }) => (
          <div key={label} style={{ display: "flex", alignItems: "baseline", marginBottom: 14, gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 11, whiteSpace: "nowrap" }}>{label}</span>
            <DL value={value} onChange={onChange} readOnly={ro} width={full ? "100%" : "40%"} />
            {note && <span style={{ fontSize: 10, whiteSpace: "nowrap", color: "#333" }}>{note}</span>}
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: 14, gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 11, whiteSpace: "nowrap" }}>SET:</span>
          <DL value={set} onChange={setSet} readOnly={ro} />
        </div>
        <div style={{ display: "flex", gap: 24, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, flex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 11, whiteSpace: "nowrap" }}>MATRIC NO:</span>
            <DL value={matricNo} onChange={setMatricNo} readOnly={ro} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, flex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 11, whiteSpace: "nowrap" }}>CAMPUS:</span>
            <DL value={campus} onChange={setCampus} readOnly={ro} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, flex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 11, whiteSpace: "nowrap" }}>YEAR OF ADMISSION:</span>
            <DL value={yearAdmission} onChange={setYearAdmission} readOnly={ro} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, flex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 11, whiteSpace: "nowrap" }}>YEAR GRADUATED:</span>
            <DL value={yearGraduated} onChange={setYearGraduated} readOnly={ro} />
          </div>
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════
     PAGE 2 — SECTIONS A – F
  ══════════════════════════════════════════════════════════════════════ */
  const page2 = (
    <div style={PAPER}>
      <SmallLogo />

      {/* A. BIOGRAPHIC DATA */}
      <SH>A.&nbsp;&nbsp;&nbsp;BIOGRAPHIC DATA</SH>
      <table style={TB}>
        <tbody>
          <tr>
            <td style={C}><span style={{ fontWeight: 700 }}>Surname:</span><CI value={surname} onChange={setSurname} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Other Names:</span><CI value={otherNames} onChange={setOtherNames} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={{ ...C, width: "14%" }}><span style={{ fontWeight: 700 }}>Title:</span><CI value={title} onChange={setTitle} readOnly={ro} /></td>
            <td style={{ ...C, width: "12%" }}><span style={{ fontWeight: 700 }}>Sex:</span><CI value={sex} onChange={setSex} readOnly={ro} /></td>
            <td style={{ ...C, width: "30%" }}><span style={{ fontWeight: 700 }}>Date of Birth:</span><CI value={dob} onChange={setDob} readOnly={ro} placeholder="DD/MM/YYYY" /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Place of Birth:</span><CI value={placeOfBirth} onChange={setPlaceOfBirth} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={C} colSpan={2}><span style={{ fontWeight: 700 }}>Nationality:</span><CI value={nationality} onChange={setNationality} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>State of Origin:</span><CI value={stateOfOrigin} onChange={setStateOfOrigin} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>L.G.A.:</span><CI value={lga} onChange={setLga} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={C} colSpan={4}>
              <div style={{ fontWeight: 700 }}>Contact Address: <span style={{ fontWeight: 400, fontSize: 10 }}>(Not Post Office:)</span></div>
              <CI value={contactAddress} onChange={setContactAddress} readOnly={ro} />
            </td>
          </tr>
          <tr>
            <td style={C} colSpan={2}><span style={{ fontWeight: 700 }}>Tel: (Home)</span><CI value={telHome} onChange={setTelHome} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>(Mobile)</span><CI value={mobile} onChange={setMobile} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>E-mail:</span><CI value={email} onChange={setEmail} readOnly={ro} /></td>
          </tr>
        </tbody>
      </table>

      {/* B. MARITAL STATUS */}
      <SH>B.&nbsp;&nbsp;&nbsp;MARITAL STATUS <span style={{ fontWeight: 400, fontSize: 10, textTransform: "none" }}>(please tick the applicable one)</span></SH>
      <div style={{ marginBottom: 4, fontSize: 11 }}>
        {["Married", "Single", "Divorced", "Separated", "Widowed", "Remarried"].map((opt) => (
          <CB key={opt} label={opt + ":"} value={marital} option={opt} onChange={setMarital} readOnly={ro} />
        ))}
      </div>
      <table style={TB}>
        <tbody>
          <tr>
            <td style={C}><span style={{ fontWeight: 700 }}>Name of Spouse:</span><CI value={spouseName} onChange={setSpouseName} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Maiden name:</span><CI value={maidenName} onChange={setMaidenName} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={C}><span style={{ fontWeight: 700 }}>Date Married:</span><CI value={dateMarried} onChange={setDateMarried} readOnly={ro} placeholder="DD/MM/YYYY" /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>No. of Children:</span><CI value={numChildren} onChange={setNumChildren} readOnly={ro} /></td>
          </tr>
        </tbody>
      </table>

      {/* C. NEXT OF KIN */}
      <SH>C.&nbsp;&nbsp;&nbsp;NEXT OF KIN</SH>
      <table style={TB}>
        <tbody>
          <tr>
            <td style={{ ...C, width: "60%" }}><span style={{ fontWeight: 700 }}>Name:</span><CI value={nokName} onChange={setNokName} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Relationship:</span><CI value={nokRel} onChange={setNokRel} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={C}><span style={{ fontWeight: 700 }}>Contact address:</span><CI value={nokAddr} onChange={setNokAddr} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Tel:</span><CI value={nokTel} onChange={setNokTel} readOnly={ro} /></td>
          </tr>
        </tbody>
      </table>

      {/* D. EMPLOYMENT HISTORY (PRESENT) */}
      <SH>D.&nbsp;&nbsp;&nbsp;EMPLOYMENT HISTORY (PRESENT)</SH>
      <table style={TB}>
        <tbody>
          <tr>
            <td style={C}><span style={{ fontWeight: 700 }}>Employer&apos;s Name:</span><CI value={empName} onChange={setEmpName} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Occupation:</span><CI value={empOcc} onChange={setEmpOcc} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={C}><span style={{ fontWeight: 700 }}>Position:</span><CI value={empPos} onChange={setEmpPos} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Job Description:</span><CI value={empJobDesc} onChange={setEmpJobDesc} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={C}><span style={{ fontWeight: 700 }}>Office Address:</span><CI value={empAddr} onChange={setEmpAddr} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Tel:</span><CI value={empTel} onChange={setEmpTel} readOnly={ro} /></td>
          </tr>
        </tbody>
      </table>

      {/* E. EMPLOYMENT HISTORY (PREVIOUS) */}
      <SH>E.&nbsp;&nbsp;&nbsp;EMPLOYMENT HISTORY (PREVIOUS)</SH>
      <table style={TB}>
        <tbody>
          <tr>
            <td style={C}><span style={{ fontWeight: 700 }}>Employer&apos;s Name:</span><CI value={prevEmpName} onChange={setPrevEmpName} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Occupation:</span><CI value={prevEmpOcc} onChange={setPrevEmpOcc} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={C}><span style={{ fontWeight: 700 }}>Position:</span><CI value={prevEmpPos} onChange={setPrevEmpPos} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Job Description:</span><CI value={prevEmpJobDesc} onChange={setPrevEmpJobDesc} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={C}><span style={{ fontWeight: 700 }}>Office Address:</span><CI value={prevEmpAddr} onChange={setPrevEmpAddr} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Tel:</span><CI value={prevEmpTel} onChange={setPrevEmpTel} readOnly={ro} /></td>
          </tr>
        </tbody>
      </table>

      {/* F. ACADEMIC HISTORY */}
      <SH>F.&nbsp;&nbsp;&nbsp;ACADEMIC HISTORY <span style={{ fontWeight: 400, fontSize: 10, textTransform: "none" }}>(from primary to university) Attach Photocopies of each certificate</span></SH>
      <table style={TB}>
        <thead>
          <tr>
            <th style={CH}>School:</th>
            <th style={{ ...CH, width: 52 }}>From</th>
            <th style={{ ...CH, width: 52 }}>To</th>
            <th style={CH}>Field of Study</th>
            <th style={CH}>Qualification received</th>
          </tr>
        </thead>
        <tbody>
          {academics.map((r, i) => (
            <tr key={i}>
              <td style={{ ...C, height: 22 }}><CI value={r.school} onChange={(v) => setAcad(i, "school", v)} readOnly={ro} /></td>
              <td style={C}><CI value={r.from} onChange={(v) => setAcad(i, "from", v)} readOnly={ro} /></td>
              <td style={C}><CI value={r.to} onChange={(v) => setAcad(i, "to", v)} readOnly={ro} /></td>
              <td style={C}><CI value={r.field} onChange={(v) => setAcad(i, "field", v)} readOnly={ro} /></td>
              <td style={C}><CI value={r.qualification} onChange={(v) => setAcad(i, "qualification", v)} readOnly={ro} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════
     PAGE 3 — SECTIONS G – K
  ══════════════════════════════════════════════════════════════════════ */
  const ynToggle = (
    field: typeof nbc,
    set: React.Dispatch<React.SetStateAction<typeof nbc>>,
    key: "yes" | "no",
  ) => {
    if (ro) return;
    set((p) => ({ ...p, yes: key === "yes" ? !p.yes : p.yes, no: key === "no" ? !p.no : p.no }));
  };

  const page3 = (
    <div style={PAPER}>
      <SmallLogo />

      {/* G. PROFESSIONAL QUALIFICATIONS */}
      <SH>G.&nbsp;&nbsp;&nbsp;PROFESSIONAL QUALIFICATIONS <span style={{ fontWeight: 400, fontSize: 10, textTransform: "none" }}>(attach 2 photocopies of each certificate)</span></SH>
      <table style={TB}>
        <thead>
          <tr>
            <th style={CH}>Body</th>
            <th style={CH}>Qualification</th>
            <th style={{ ...CH, width: 90 }}>Date.</th>
          </tr>
        </thead>
        <tbody>
          {profQuals.map((r, i) => (
            <tr key={i}>
              <td style={{ ...C, height: 22 }}><CI value={r.body} onChange={(v) => setPQ(i, "body", v)} readOnly={ro} /></td>
              <td style={C}><CI value={r.qualification} onChange={(v) => setPQ(i, "qualification", v)} readOnly={ro} /></td>
              <td style={C}><CI value={r.date} onChange={(v) => setPQ(i, "date", v)} readOnly={ro} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* H. CHRISTIAN HISTORY */}
      <SH>H.&nbsp;&nbsp;&nbsp;CHRISTIAN HISTORY <span style={{ fontWeight: 400, fontSize: 10, textTransform: "none" }}>(indicate name and the location of the church in the spaces marked where)</span></SH>
      <table style={TB}>
        <tbody>
          <tr>
            <td style={{ ...C, width: "45%" }}><span style={{ fontWeight: 700 }}>Date of salvation:</span><CI value={salvDate} onChange={setSalvDate} readOnly={ro} placeholder="DD/MM/YYYY" /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Where:</span><CI value={salvWhere} onChange={setSalvWhere} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={C}><span style={{ fontWeight: 700 }}>Date of water baptism by immersion:</span><CI value={waterDate} onChange={setWaterDate} readOnly={ro} placeholder="DD/MM/YYYY" /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Where:</span><CI value={waterWhere} onChange={setWaterWhere} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={C}>
              <span style={{ fontWeight: 700 }}>Date of baptism in the Holy Ghost</span><br />
              <span style={{ fontStyle: "italic", fontSize: 10 }}>(with evidence of speaking in tongues):</span>
              <CI value={hgDate} onChange={setHgDate} readOnly={ro} placeholder="DD/MM/YYYY" />
            </td>
            <td style={C}><span style={{ fontWeight: 700 }}>Where:</span><CI value={hgWhere} onChange={setHgWhere} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={C} colSpan={2}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Have you attended:</div>
              {/* inline Yes/No rows matching physical form */}
              {([
                ["1. New believer&apos;s class?", nbc, setNbc],
                ["2. Baptismal class?", btc, setBtc],
                ["3. Worker&apos;s training?", wit, setWit],
                ["4. Any bible school before?", bible, setBible],
              ] as const).map(([lbl, fld, setFld], idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, fontSize: 11 }}>
                  <span style={{ minWidth: 200 }} dangerouslySetInnerHTML={{ __html: lbl }} />
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 2, cursor: ro ? "default" : "pointer" }}>
                    <input type="checkbox" checked={fld.yes} readOnly={ro}
                      onChange={() => ynToggle(fld, setFld as React.Dispatch<React.SetStateAction<typeof nbc>>, "yes")}
                      style={{ width: 10, height: 10 }}
                    /> Yes
                  </label>
                  <span style={{ marginLeft: 2, marginRight: 2 }}>||</span>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 2, cursor: ro ? "default" : "pointer" }}>
                    <input type="checkbox" checked={fld.no} readOnly={ro}
                      onChange={() => ynToggle(fld, setFld as React.Dispatch<React.SetStateAction<typeof nbc>>, "no")}
                      style={{ width: 10, height: 10 }}
                    /> No
                  </label>
                  <span style={{ marginLeft: 2, marginRight: 2 }}>||</span>
                  <span style={{ fontWeight: 700 }}>Date</span>
                  <input type="text" value={fld.date} readOnly={ro}
                    onChange={ro ? undefined : (e) => (setFld as React.Dispatch<React.SetStateAction<typeof nbc>>)((p) => ({ ...p, date: e.target.value }))}
                    style={{ border: "none", borderBottom: "1px solid #aaa", outline: "none", background: "transparent", fontFamily: FONT, fontSize: 10, width: 70 }}
                  />
                  <span style={{ fontWeight: 700 }}>Where:</span>
                  <input type="text" value={fld.where} readOnly={ro}
                    onChange={ro ? undefined : (e) => (setFld as React.Dispatch<React.SetStateAction<typeof nbc>>)((p) => ({ ...p, where: e.target.value }))}
                    style={{ border: "none", borderBottom: "1px solid #aaa", outline: "none", background: "transparent", fontFamily: FONT, fontSize: 10, flex: 1 }}
                  />
                </div>
              ))}
            </td>
          </tr>
        </tbody>
      </table>

      {/* I. PLACE OF WORSHIP */}
      <SH>I.&nbsp;&nbsp;&nbsp;PLACE OF WORSHIP</SH>
      <table style={TB}>
        <tbody>
          <tr>
            <td style={C} colSpan={2}><span style={{ fontWeight: 700 }}>Present church</span><CI value={presentChurch} onChange={setPresentChurch} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={C}><span style={{ fontWeight: 700 }}>Address:</span><CI value={presentAddr} onChange={setPresentAddr} readOnly={ro} /></td>
            <td style={{ ...C, width: "35%" }}><span style={{ fontWeight: 700 }}>Tel:</span><CI value={presentTel} onChange={setPresentTel} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={C}><span style={{ fontWeight: 700 }}>Pastor-in-charge:</span><CI value={presentPastor} onChange={setPresentPastor} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Tel:</span><CI value={presentPastorTel} onChange={setPresentPastorTel} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={C} colSpan={2}>
              <span style={{ fontWeight: 700 }}>Your position or ministry in the Church (please describe in details):</span>
              <CI value={presentPosition} onChange={setPresentPosition} readOnly={ro} multiline rows={2} />
            </td>
          </tr>
          <tr>
            <td style={C} colSpan={2}>
              <div><span style={{ fontWeight: 700 }}>What special gifts do you possess?</span> <span style={{ fontSize: 10 }}>(In order of preference):</span> <span style={{ fontWeight: 700 }}>1.</span> <input type="text" value={gift1} readOnly={ro} onChange={ro ? undefined : e => setGift1(e.target.value)} style={{ border: "none", borderBottom: "1px solid #aaa", outline: "none", background: "transparent", fontFamily: FONT, fontSize: 11, width: 120 }} /></div>
              <div style={{ marginTop: 3 }}><span style={{ fontWeight: 700 }}>2.</span> <input type="text" value={gift2} readOnly={ro} onChange={ro ? undefined : e => setGift2(e.target.value)} style={{ border: "none", borderBottom: "1px solid #aaa", outline: "none", background: "transparent", fontFamily: FONT, fontSize: 11, width: 200, marginRight: 24 }} /> <span style={{ fontWeight: 700 }}>3.</span> <input type="text" value={gift3} readOnly={ro} onChange={ro ? undefined : e => setGift3(e.target.value)} style={{ border: "none", borderBottom: "1px solid #aaa", outline: "none", background: "transparent", fontFamily: FONT, fontSize: 11, width: 200 }} /></div>
            </td>
          </tr>
          <tr>
            <td style={C} colSpan={2}><span style={{ fontWeight: 700 }}>Previous Church Attended:</span><CI value={prevChurch} onChange={setPrevChurch} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={C}><span style={{ fontWeight: 700 }}>Address:</span><CI value={prevChurchAddr} onChange={setPrevChurchAddr} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Tel:</span><CI value={prevChurchTel} onChange={setPrevChurchTel} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={C}><span style={{ fontWeight: 700 }}>Pastor-in-charge:</span><CI value={prevPastor} onChange={setPrevPastor} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Tel:</span><CI value={prevPastorTel} onChange={setPrevPastorTel} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={C} colSpan={2}><span style={{ fontWeight: 700 }}>Your previous position or ministry in that church:</span><CI value={prevPosition} onChange={setPrevPosition} readOnly={ro} /></td>
          </tr>
        </tbody>
      </table>

      {/* J. SPONSORSHIP */}
      <SH>J.&nbsp;&nbsp;&nbsp;SPONSORSHIP</SH>
      <div style={{ marginBottom: 5 }}>
        {!ro && (
          <div style={{ display: "flex", gap: 20, marginBottom: 8, fontSize: 11 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input type="radio" name="selfSponsored" checked={selfSponsored} onChange={() => setSelfSponsored(true)} />
              Self-sponsored
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input type="radio" name="selfSponsored" checked={!selfSponsored} onChange={() => setSelfSponsored(false)} />
              I have a sponsor
            </label>
          </div>
        )}
        {!selfSponsored && (
          <>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
            <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>Name of Sponsor</span>
            <DL value={sponsorName} onChange={setSponsorName} readOnly={ro} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
            <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>Address of Sponsor</span>
            <DL value={sponsorAddr} onChange={setSponsorAddr} readOnly={ro} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>Tel:</span>
            <DL value={sponsorTel} onChange={setSponsorTel} readOnly={ro} width={120} />
            <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>Sponsor&apos;s Signature</span>
            <DL value="" onChange={() => {}} readOnly={true} width={160} />
            <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>Date</span>
            <DL value="" onChange={() => {}} readOnly={true} width={100} />
          </div>
          <div style={{ fontSize: 10, fontStyle: "italic", marginTop: 3 }}>
            (Sponsor should please note that the Academy will hold him or her liable for any default in payment by their students)
          </div>
          </>
        )}
      </div>

      {/* K. METHOD OF PAYMENT */}
      <SH>K.&nbsp;&nbsp;&nbsp;METHOD OF PAYMENT <span style={{ fontWeight: 400, fontSize: 10, textTransform: "none" }}>(how would you like to pay your fees? Two options are available):</span></SH>
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 5, fontSize: 11 }}>
          <span style={{ fontWeight: 700 }}>1.</span>
          <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: ro ? "default" : "pointer" }}>
            <input type="radio" name="payment" value="full" checked={payMethod === "full"} readOnly={ro}
              onChange={ro ? undefined : () => setPayMethod("full")} />
            Full payment at registration ( )
          </label>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 11 }}>
          <span style={{ fontWeight: 700 }}>2.</span>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 5, cursor: ro ? "default" : "pointer" }}>
            <input type="radio" name="payment" value="50pct" checked={payMethod === "50pct"} readOnly={ro}
              onChange={ro ? undefined : () => setPayMethod("50pct")} style={{ marginTop: 2 }} />
            <span>50% at registration (compulsory) and balance before matriculation, <em>(instalment payment may be negotiated for the balance).</em></span>
          </label>
        </div>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════
     PAGE 4 — SECTIONS L – P + OFFICIAL USE ONLY
  ══════════════════════════════════════════════════════════════════════ */
  const dotLine = { borderBottom: "1px dotted #555", display: "block", width: "100%", marginTop: 4, height: 18 } as const;

  const page4 = (
    <div style={PAPER}>
      <SmallLogo />

      {/* L. How did you get information */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>L.</span>
          <span>How did you get information about this Academy?</span>
          <DL value={howHeard} onChange={setHowHeard} readOnly={ro} />
        </div>
        <span style={dotLine} />
      </div>

      {/* M. Why did you want to come */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>M.</span>
          <span>Why did you want to come to the Bible Academy?</span>
          <DL value={whyApply} onChange={setWhyApply} readOnly={ro} />
        </div>
        <span style={dotLine} />
      </div>

      {/* N. REFEREES */}
      <SH>N.&nbsp;&nbsp;&nbsp;REFEREES</SH>
      <table style={TB}>
        <tbody>
          <tr>
            <td style={C}><span style={{ fontWeight: 700 }}>Name:</span><CI value={ref1Name} onChange={setRef1Name} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Address:</span><CI value={ref1Addr} onChange={setRef1Addr} readOnly={ro} /></td>
            <td style={{ ...C, width: 120 }}><span style={{ fontWeight: 700 }}>Tel:</span><CI value={ref1Tel} onChange={setRef1Tel} readOnly={ro} /></td>
          </tr>
          <tr>
            <td style={C}><span style={{ fontWeight: 700 }}>Name:</span><CI value={ref2Name} onChange={setRef2Name} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Address:</span><CI value={ref2Addr} onChange={setRef2Addr} readOnly={ro} /></td>
            <td style={C}><span style={{ fontWeight: 700 }}>Tel:</span><CI value={ref2Tel} onChange={setRef2Tel} readOnly={ro} /></td>
          </tr>
        </tbody>
      </table>

      {/* O. APPLICANT'S DECLARATION */}
      <SH>O.&nbsp;&nbsp;&nbsp;APPLICANT&apos;S DECLARATION</SH>
      <div style={{ fontSize: 11, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 3 }}>
          <span>I</span>
          <DL value={applicantName} onChange={setApplicantName} readOnly={ro} width={280} style={{ marginLeft: 6, marginRight: 6 }} />
        </div>
        <p style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 11, lineHeight: 1.7, margin: "4px 0 10px" }}>
          HEREBY DECLARE THAT THE ABOVE INFORMATION PROVIDED IS TRUE. I PROMISE THAT
          I SHALL, IF ADMITTED, ABIDE BY THE RULES AND REGULATIONS OF THE ACADEMY, BE
          OBEDIENT TO ITS AUTHORITIES AND UPHOLD THEM IN PRAYERS. I PROMISE TO PROMOTE
          THE LOFTY GOALS OF THE ACADEMY AS A WORTHY AMBASSADOR, AS WELL AS
          COOPERATE WITH AND ENCOURAGE MY FELLOW STUDENTS AND ALUMNI.
        </p>
      </div>
      <div style={{ display: "flex", gap: 80, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <span style={dotLine} />
          <div style={{ fontSize: 10, textAlign: "center", fontWeight: 700, marginTop: 2 }}>SIGNATURE</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <DL value={declDate} onChange={setDeclDate} readOnly={ro} />
          </div>
          <div style={{ fontSize: 10, textAlign: "center", fontWeight: 700, marginTop: 2 }}>DATE</div>
        </div>
      </div>

      {/* P. ATTESTATION BY APPLICANT'S PASTOR */}
      <SH>P.&nbsp;&nbsp;&nbsp;ATTESTATION BY APPLICANT&apos;S PASTOR</SH>
      <div style={{ fontSize: 11, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 3, marginBottom: 4 }}>
          <span>I confirm that (applicant&apos;s name)</span>
          <DL value={coverName || ""} onChange={setCoverName} readOnly={true} width={220} />
          <span>is a worthy Member of my congregation.</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 5 }}>
          <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>Name of Church</span>
          <DL value={pastorChurch} onChange={setPastorChurch} readOnly={ro} />
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 5 }}>
          <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>Address</span>
          <DL value={pastorChurchAddr} onChange={setPastorChurchAddr} readOnly={ro} />
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 10 }}>
          <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>Pastor&apos;s Name</span>
          <DL value={pastorName} onChange={setPastorName} readOnly={ro} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <span style={dotLine} />
          <div style={{ fontSize: 10, textAlign: "center", fontWeight: 700, marginTop: 2 }}>SIGNATURE</div>
        </div>
        <div style={{ flex: 1 }}>
          <span style={dotLine} />
          <div style={{ fontSize: 10, textAlign: "center", fontWeight: 700, marginTop: 2 }}>OFFICIAL STAMP</div>
        </div>
        <div style={{ flex: 1 }}>
          <DL value={pastorDate} onChange={setPastorDate} readOnly={ro} />
          <div style={{ fontSize: 10, textAlign: "center", fontWeight: 700, marginTop: 2 }}>DATE</div>
        </div>
      </div>
      <div style={{ fontSize: 10, fontStyle: "italic", marginBottom: 4 }}>
        * (Pastors are advised to be sure of who they are recommending as the Academy will look up to them should the Applicant default in payment, character, etc).
      </div>
      <div style={{ fontSize: 10, fontStyle: "italic", marginBottom: 16 }}>
        * PLEASE NOTE: A separate letter from your Pastor recommending you for admission to this Academy must accompany your application. The letter should be on the Church&apos;s letter headed paper.
      </div>

      {/* OFFICIAL USE ONLY */}
      <div style={{ borderTop: "1px dotted #555", paddingTop: 8, marginTop: 8 }}>
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 11, marginBottom: 8 }}>OFFICIAL USE ONLY</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6, fontSize: 11 }}>
          <span style={{ fontWeight: 700 }}>SHORT LISTED FOR INTERVIEW:</span>
          <span>YES|&nbsp;&nbsp;|</span>
          <span>NO|&nbsp;&nbsp;|</span>
          <span style={{ fontWeight: 700 }}>DATE INTERVIEWED</span>
          <DL value="" onChange={() => {}} readOnly={true} width={160} />
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16, fontSize: 11 }}>
          <span>ADMITTED|&nbsp;&nbsp;|</span>
          <span>NOT ADMITTED|&nbsp;&nbsp;|</span>
          <span style={{ fontWeight: 700 }}>ADMISSION NO.</span>
          <DL value="" onChange={() => {}} readOnly={true} />
        </div>
        <div style={{ display: "flex", gap: 60 }}>
          <div style={{ flex: 1 }}>
            <span style={dotLine} />
            <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2 }}>ACADEMIC OFFICER (ADMISSIONS)</div>
          </div>
          <div style={{ flex: 1 }}>
            <span style={dotLine} />
            <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2 }}>RECTOR</div>
          </div>
        </div>
      </div>
    </div>
  );

  const pages = [page1, page2, page3, page4];

  /* ══════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #rila-print-area, #rila-print-area * { visibility: visible !important; }
          #rila-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .rila-no-print { display: none !important; }
        }
      `}</style>

      {/* Top action bar */}
      <div className="rila-no-print" style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "center", padding: "14px 0 8px", flexWrap: "wrap", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => router.push("/trainings/rila")}
          style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
          ← Back
        </button>
        <button onClick={() => window.print()}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, border: "1px solid #000080", background: "#fff", color: "#000080", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
          <Printer size={14} /> Print Page {currentPage}
        </button>
        {mode === "fill" && (
          <button onClick={handleSubmit} disabled={submitting}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 20px", borderRadius: 8, border: "none", background: submitting ? "#9ca3af" : "#DC2626", color: "#fff", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontSize: 13 }}>
            {submitting ? (uploading ? "Uploading…" : "Submitting…") : <><Send size={14} /> Submit Application</>}
          </button>
        )}
      </div>

      {submitError && (
        <div className="rila-no-print" style={{ display: "flex", alignItems: "center", gap: 8, maxWidth: 794, margin: "6px auto", padding: "9px 14px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b", fontSize: 13 }}>
          <XCircle size={16} /> {submitError}
        </div>
      )}

      {/* Page indicator */}
      <div className="rila-no-print" style={{ textAlign: "center", padding: "10px 0 6px", fontSize: 13, color: "#6b7280", fontFamily: FONT }}>
        Page {currentPage} of 4
      </div>

      {/* Form paper */}
      <div id="rila-print-area" style={{ padding: "0 0 24px" }}>
        {pages[currentPage - 1]}
      </div>

      {/* Page navigation */}
      <div className="rila-no-print" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, padding: "16px 0 32px", flexWrap: "wrap" }}>
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "9px 22px", borderRadius: 8, border: "1px solid #d1d5db", background: currentPage === 1 ? "#f9fafb" : "#fff", color: currentPage === 1 ? "#9ca3af" : "#374151", fontWeight: 600, cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: 14 }}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {/* Page dots */}
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 4].map((n) => (
            <button key={n} onClick={() => setCurrentPage(n)}
              style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid", borderColor: n === currentPage ? "#DC2626" : "#d1d5db", background: n === currentPage ? "#DC2626" : "#fff", color: n === currentPage ? "#fff" : "#6b7280", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
              {n}
            </button>
          ))}
        </div>

        {currentPage < 4 ? (
          <button onClick={() => setCurrentPage((p) => Math.min(4, p + 1))}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "9px 22px", borderRadius: 8, border: "none", background: "#DC2626", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
            Next <ChevronRight size={16} />
          </button>
        ) : mode === "fill" ? (
          <button onClick={handleSubmit} disabled={submitting}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 24px", borderRadius: 8, border: "none", background: submitting ? "#9ca3af" : "#16a34a", color: "#fff", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontSize: 14 }}>
            {submitting ? "Submitting…" : <><Send size={16} /> Submit Application</>}
          </button>
        ) : null}
      </div>
    </>
  );
}
