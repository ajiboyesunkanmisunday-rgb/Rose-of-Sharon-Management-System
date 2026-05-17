"use client";

/**
 * WorkersFormCore — multi-mode WiT form
 *
 * mode = "blank"  → read-only, empty, Print Blank Form button only
 * mode = "fill"   → editable, Print + Submit buttons
 * mode = "view"   → read-only, pre-filled from initialData, Print Filled Form button only
 */

import { useState } from "react";
import { Printer, Send, CheckCircle } from "lucide-react";
import { createWorkerInTraining, uploadProfilePicture, type WorkersInTrainingResponse } from "@/lib/api";

export type WitMode = "blank" | "fill" | "view";

/* ─── Dotted-line input ────────────────────────────────────────────────────── */
function F({
  value,
  onChange,
  style,
  type = "text",
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  style?: React.CSSProperties;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <input
      type={type}
      readOnly={readOnly}
      className="wit-f"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      style={style}
    />
  );
}

function FullRow({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span style={{ whiteSpace: "nowrap", fontSize: 12 }}>{label}</span>
      <F value={value} onChange={onChange} style={{ flex: 1 }} readOnly={readOnly} />
    </div>
  );
}

function PairedRow({
  left,
  right,
  readOnly,
}: {
  left: { label: string; value: string; onChange?: (v: string) => void };
  right: { label: string; value: string; onChange?: (v: string) => void };
  readOnly?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, flex: 1, minWidth: 180 }}>
        <span style={{ whiteSpace: "nowrap", fontSize: 12 }}>{left.label}</span>
        <F value={left.value} onChange={left.onChange} style={{ flex: 1 }} readOnly={readOnly} />
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, flex: 1, minWidth: 180 }}>
        <span style={{ whiteSpace: "nowrap", fontSize: 12 }}>{right.label}</span>
        <F value={right.value} onChange={right.onChange} style={{ flex: 1 }} readOnly={readOnly} />
      </div>
    </div>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontWeight: 700, fontSize: 12, background: "#000080", color: "#fff",
      padding: "3px 8px", marginBottom: 10, marginTop: 18, letterSpacing: 0.5,
    }}>
      {children}
    </div>
  );
}

function FormTitle({ num, title }: { num: number; title: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 14 }}>
      <div style={{ fontWeight: 900, fontSize: 15, textTransform: "uppercase", letterSpacing: 1 }}>
        Redeemed Christian Church of God — Rose of Sharon Parish
      </div>
      <div style={{ fontWeight: 800, fontSize: 14, marginTop: 8, color: "#000080", textDecoration: "underline" }}>
        Workers-in-Training Programme
      </div>
      <div style={{ fontWeight: 700, fontSize: 13, marginTop: 4, textTransform: "uppercase" }}>
        Form {num}: {title}
      </div>
    </div>
  );
}

function Chk({ label, checked, onChange, readOnly }: { label: string; checked: boolean; onChange?: () => void; readOnly?: boolean }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, cursor: readOnly ? "default" : "pointer" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={readOnly ? undefined : onChange}
        readOnly={readOnly}
        style={{ width: 12, height: 12 }}
      />
      {label}
    </label>
  );
}

function SignatureLine({ label }: { label: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ borderBottom: "1px solid #000", marginBottom: 4, height: 24 }} />
      <div style={{ fontSize: 11 }}>{label}</div>
    </div>
  );
}

function safeDate(s: string): string | undefined {
  if (!s.trim()) return undefined;
  const d = new Date(s);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString().split("T")[0];
}

const PAPER: React.CSSProperties = {
  background: "#fff",
  width: "210mm",
  maxWidth: "100%",
  minHeight: "297mm",
  padding: "16mm 20mm",
  margin: "0 auto",
  boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
  fontFamily: "Arial, sans-serif",
  fontSize: 12,
  color: "#000",
  boxSizing: "border-box",
};

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function WorkersFormCore({
  mode,
  initialData,
}: {
  mode: WitMode;
  initialData?: WorkersInTrainingResponse;
}) {
  const ro = mode === "blank" || mode === "view";

  /* ══ FORM 1 – Student Application ══════════════════════════════════════ */
  const [set, setSet]                   = useState(initialData?.set ?? "");
  const [photo, setPhoto]               = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(initialData?.profilePictureUrl ?? "");
  const [firstName, setFirstName]       = useState(initialData?.firstName ?? "");
  const [lastName, setLastName]         = useState(initialData?.lastName ?? "");
  const [dob, setDob]                   = useState(initialData?.dateOfBirth ?? "");
  const [gender, setGender]             = useState(() => {
    const s = initialData?.sex ?? "";
    if (!s) return "";
    if (s.toUpperCase() === "MALE") return "Male";
    if (s.toUpperCase() === "FEMALE") return "Female";
    return s;
  });
  // nationality not in WorkersInTrainingResponse (not returned by API)
  const [nationality, setNationality]   = useState("");

  // Home address
  const [homeStreet, setHomeStreet]     = useState(initialData?.street ?? "");
  const [homeCity, setHomeCity]         = useState(initialData?.city ?? "");
  const [homeState, setHomeState]       = useState(initialData?.state ?? "");
  const [homePostal, setHomePostal]     = useState("");
  const [homeCountry, setHomeCountry]   = useState(initialData?.country ?? "");

  // Mailing address
  const [mailSameAsHome, setMailSameAsHome] = useState(false);
  const [mailStreet, setMailStreet]     = useState("");
  const [mailCity, setMailCity]         = useState("");
  const [mailState, setMailState]       = useState("");
  const [mailPostal, setMailPostal]     = useState("");
  const [mailCountry, setMailCountry]   = useState("");

  const [email, setEmail]               = useState(initialData?.email ?? "");
  const [phone, setPhone]               = useState(initialData?.phoneNumber ?? "");

  // Previous schools (up to 3) — not in API response, blank in view
  const [schools, setSchools] = useState([
    { name: "", location: "", datesAttended: "", gradeCompleted: "" },
    { name: "", location: "", datesAttended: "", gradeCompleted: "" },
    { name: "", location: "", datesAttended: "", gradeCompleted: "" },
  ]);
  const updateSchool = (i: number, field: keyof (typeof schools)[0], v: string) =>
    setSchools((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: v } : s)));

  // Guardian 1
  const [g1Name, setG1Name]             = useState(initialData?.nextOfKinName ?? "");
  const [g1Rel, setG1Rel]               = useState(initialData?.nextOfKinRelationship ?? "");
  const [g1Phone, setG1Phone]           = useState(initialData?.nextOfKinPhoneNumber ?? "");
  const [g1Email, setG1Email]           = useState("");

  // Guardian 2
  const [g2Name, setG2Name]             = useState("");
  const [g2Rel, setG2Rel]               = useState("");
  const [g2Phone, setG2Phone]           = useState("");
  const [g2Email, setG2Email]           = useState("");

  const [dateSigned, setDateSigned]     = useState("");

  /* ══ FORM 2 – Medical ══════════════════════════════════════════════════ */
  // Medical fields not in API response — always blank in view mode
  const [hasAllergies, setHasAllergies]       = useState<boolean | null>(null);
  const [allergiesList, setAllergiesList]     = useState("");
  const [hasMeds, setHasMeds]                 = useState<boolean | null>(null);
  const [medsList, setMedsList]               = useState("");
  const [hasConditions, setHasConditions]     = useState<boolean | null>(null);
  const [conditionsList, setConditionsList]   = useState("");
  const [lastPhysical, setLastPhysical]       = useState("");

  const VACCINES = [
    "MMR", "Polio", "Tetanus/Diphtheria/Pertussis",
    "Hepatitis B", "Varicella", "Meningococcal", "Influenza",
  ];
  const [immunizations, setImmunizations] = useState<Record<string, string>>({});
  const updateImmunization = (vaccine: string, date: string) =>
    setImmunizations((prev) => ({ ...prev, [vaccine]: date }));
  const [otherVaccine, setOtherVaccine]   = useState("");
  const [otherVaccineDate, setOtherVaccineDate] = useState("");

  const [specialNeeds, setSpecialNeeds]   = useState("");
  const [pcpName, setPcpName]             = useState("");
  const [pcpPhone, setPcpPhone]           = useState("");

  const [ec1Name, setEc1Name]             = useState("");
  const [ec1Phone, setEc1Phone]           = useState("");
  const [ec2Name, setEc2Name]             = useState("");
  const [ec2Phone, setEc2Phone]           = useState("");

  const [medConsentDate, setMedConsentDate] = useState("");
  const [medCompletedBy, setMedCompletedBy] = useState("");
  const [medCompletedRel, setMedCompletedRel] = useState("");
  const [medCompletedDate, setMedCompletedDate] = useState("");

  /* ══ FORM 3 – Course Selection ═════════════════════════════════════════ */
  const [gradeLevel, setGradeLevel]         = useState("");
  const [schoolYear, setSchoolYear]         = useState("");
  const [courseELA, setCourseELA]           = useState("");
  const [courseMath, setCourseMath]         = useState("");
  const [courseScience, setCourseScience]   = useState("");
  const [courseSocial, setCourseSocial]     = useState("");
  const [elective1, setElective1]           = useState("");
  const [elective2, setElective2]           = useState("");
  const [elective3, setElective3]           = useState("");
  const [electiveAlt, setElectiveAlt]       = useState("");
  const [totalCredits, setTotalCredits]     = useState("");
  const [prerequisites, setPrerequisites]   = useState("");
  const [courseSubmitDate, setCourseSubmitDate] = useState("");

  /* ══ Submit state ═══════════════════════════════════════════════════════ */
  const [submitting, setSubmitting]     = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError]   = useState("");

  /* ── Photo handler ───────────────────────────────────────────────────── */
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  /* ── Submit ──────────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setSubmitError("First Name, Last Name, and Phone Number are required.");
      return;
    }
    setSubmitError("");
    setSubmitting(true);
    try {
      let profilePictureUrl: string | undefined;
      if (photo) {
        setUploading(true);
        profilePictureUrl = await uploadProfilePicture(photo);
        setUploading(false);
      }

      const genderNorm = gender.toLowerCase().startsWith("f") ? "FEMALE"
                       : gender.toLowerCase().startsWith("m") ? "MALE"
                       : gender || undefined;

      const qualItems = schools
        .filter((s) => s.name.trim())
        .map((s) => ({
          institution: s.name,
          qualificationReceived: s.gradeCompleted || undefined,
          date: s.datesAttended || undefined,
        }));

      await createWorkerInTraining({
        set:               set.trim() || undefined,
        profilePictureUrl,
        firstName:         firstName.trim(),
        lastName:          lastName.trim(),
        countryCode:       "234",
        phoneNumber:       phone.trim(),
        email:             email.trim() || undefined,
        sex:               genderNorm as string | undefined,
        dateOfBirth:       safeDate(dob),
        // nationality not in CreateWorkersInTrainingRequest
        street:            homeStreet.trim() || undefined,
        city:              homeCity.trim() || undefined,
        state:             homeState.trim() || undefined,
        country:           homeCountry.trim() || undefined,
        nextOfKinName:         g1Name.trim() || undefined,
        nextOfKinRelationship: g1Rel.trim() || undefined,
        nextOfKinPhoneNumber:  g1Phone.trim() || undefined,
        nextOfKinFullAddress:  undefined,
        consent: true,
        ...(qualItems.length ? { qualificationRequests: qualItems } : {}),
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

  /* ── Toolbar label ───────────────────────────────────────────────────── */
  const toolbarTitle = "Workers-in-Training Application Form";

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
          .wit-page      { page-break-before: always; break-before: page; margin-top: 0 !important; }
        }
        .wit-f {
          border: none; border-bottom: 1px dotted #555;
          background: transparent; outline: none;
          font-size: 12px; font-family: Arial, sans-serif; color: #000;
          padding: 0 2px; min-width: 20px; display: inline-block;
        }
        .wit-f:focus { border-bottom-color: #000080; background: #eef2ff; }
        .wit-f[readonly]:focus { background: transparent; border-bottom-color: #555; }
        @media print { .wit-f { border-bottom: 1px dotted #333; background: transparent !important; } }
        .wit-td { border: 1px solid #000; padding: 3px 6px; }
        .wit-td .wit-f { width: 100%; }
      `}</style>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="wit-no-print" style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#000080", padding: "10px 20px",
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "Arial, sans-serif" }}>
          {toolbarTitle}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          {mode === "blank" && (
            <button
              onClick={() => window.print()}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#fff", border: "none",
                color: "#000080", borderRadius: 6, padding: "6px 14px",
                fontSize: 13, cursor: "pointer", fontFamily: "Arial, sans-serif", fontWeight: 700,
              }}
            >
              <Printer size={15} /> Print Blank Form
            </button>
          )}
          {mode === "fill" && (
            <>
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
                  fontSize: 13, fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                <Send size={15} />
                {uploading ? "Uploading…" : submitting ? "Submitting…" : "Submit"}
              </button>
            </>
          )}
          {mode === "view" && (
            <button
              onClick={() => window.print()}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#fff", border: "none",
                color: "#000080", borderRadius: 6, padding: "6px 14px",
                fontSize: 13, cursor: "pointer", fontFamily: "Arial, sans-serif", fontWeight: 700,
              }}
            >
              <Printer size={15} /> Print Filled Form
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
            FORM 1 — Student Application Form
        ══════════════════════════════════════════════════════════════════ */}
        <div className="wit-paper" style={PAPER}>
          <FormTitle num={1} title="Student Application Form" />

          {/* Set / Batch */}
          <div style={{ textAlign: "right", fontSize: 12, marginBottom: 10 }}>
            <span>Set / Batch: </span>
            <F value={set} onChange={setSet} style={{ width: 90 }} readOnly={ro} />
          </div>

          {/* Photo + name block */}
          <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <FullRow label="First Name:" value={firstName} onChange={setFirstName} readOnly={ro} />
              <FullRow label="Last Name (Surname):" value={lastName} onChange={setLastName} readOnly={ro} />
              <PairedRow
                left={{ label: "Date of Birth:", value: dob, onChange: setDob }}
                right={{ label: "Nationality:", value: nationality, onChange: setNationality }}
                readOnly={ro}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12 }}>Gender:</span>
                {["Male", "Female", "Other", "Prefer not to say"].map((g) => (
                  <Chk
                    key={g}
                    label={g}
                    checked={gender === g}
                    onChange={() => setGender(gender === g ? "" : g)}
                    readOnly={ro}
                  />
                ))}
              </div>
            </div>
            {/* Photo box — clickable in fill mode only */}
            {mode === "fill" && (
              <div
                className="wit-no-print"
                style={{
                  width: 90, height: 110, border: "1px solid #000", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", overflow: "hidden", fontSize: 10, color: "#666",
                  textAlign: "center", padding: 4,
                }}
                onClick={() => document.getElementById("wit-photo")?.click()}
              >
                {photoPreview
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={photoPreview} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : "Click to add passport photo"}
                <input id="wit-photo" type="file" accept="image/*" hidden onChange={handlePhotoChange} />
              </div>
            )}
            {/* In view/blank mode, show static photo box (with photo if available) */}
            {mode !== "fill" && (
              <div style={{
                width: 90, height: 110, border: "1px solid #000", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", fontSize: 10, color: "#666", textAlign: "center",
              }}>
                {photoPreview
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={photoPreview} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : "Passport Photo"}
              </div>
            )}
            {/* Print-only photo box */}
            <div style={{ width: 90, height: 110, border: "1px solid #000", flexShrink: 0, display: "none" }}
              className="wit-print-photo" />
          </div>

          {/* Home Address */}
          <SectionHead>Home Address</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <FullRow label="Street:" value={homeStreet} onChange={setHomeStreet} readOnly={ro} />
            <PairedRow
              left={{ label: "City:", value: homeCity, onChange: setHomeCity }}
              right={{ label: "State / Province:", value: homeState, onChange: setHomeState }}
              readOnly={ro}
            />
            <PairedRow
              left={{ label: "Postal Code:", value: homePostal, onChange: setHomePostal }}
              right={{ label: "Country:", value: homeCountry, onChange: setHomeCountry }}
              readOnly={ro}
            />
          </div>

          {/* Mailing Address */}
          <SectionHead>Mailing Address (if different from Home Address)</SectionHead>
          <div style={{ marginBottom: 8 }}>
            <Chk
              label="Same as home address"
              checked={mailSameAsHome}
              onChange={() => setMailSameAsHome((v) => !v)}
              readOnly={ro}
            />
          </div>
          {!mailSameAsHome && (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <FullRow label="Street:" value={mailStreet} onChange={setMailStreet} readOnly={ro} />
              <PairedRow
                left={{ label: "City:", value: mailCity, onChange: setMailCity }}
                right={{ label: "State / Province:", value: mailState, onChange: setMailState }}
                readOnly={ro}
              />
              <PairedRow
                left={{ label: "Postal Code:", value: mailPostal, onChange: setMailPostal }}
                right={{ label: "Country:", value: mailCountry, onChange: setMailCountry }}
                readOnly={ro}
              />
            </div>
          )}

          {/* Contact */}
          <SectionHead>Contact Information</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <FullRow label="Email Address:" value={email} onChange={setEmail} readOnly={ro} />
            <FullRow label="Phone Number:" value={phone} onChange={setPhone} readOnly={ro} />
          </div>

          {/* Previous Schools */}
          <SectionHead>Previous School(s) Attended</SectionHead>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
            <thead>
              <tr>
                <th className="wit-td" style={{ textAlign: "center", width: 24 }}></th>
                <th className="wit-td" style={{ textAlign: "center" }}>Name</th>
                <th className="wit-td" style={{ textAlign: "center" }}>Location</th>
                <th className="wit-td" style={{ textAlign: "center", width: 90 }}>Dates Attended</th>
                <th className="wit-td" style={{ textAlign: "center", width: 90 }}>Grade Level Completed</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((s, i) => (
                <tr key={i}>
                  <td className="wit-td" style={{ textAlign: "center", fontWeight: 700 }}>
                    {["I.", "II.", "III."][i]}
                  </td>
                  <td className="wit-td">
                    <F value={s.name} onChange={(v) => updateSchool(i, "name", v)} style={{ width: "100%" }} readOnly={ro} />
                  </td>
                  <td className="wit-td">
                    <F value={s.location} onChange={(v) => updateSchool(i, "location", v)} style={{ width: "100%" }} readOnly={ro} />
                  </td>
                  <td className="wit-td">
                    <F value={s.datesAttended} onChange={(v) => updateSchool(i, "datesAttended", v)} style={{ width: "100%" }} readOnly={ro} />
                  </td>
                  <td className="wit-td">
                    <F value={s.gradeCompleted} onChange={(v) => updateSchool(i, "gradeCompleted", v)} style={{ width: "100%" }} readOnly={ro} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Parent / Guardian 1 */}
          <SectionHead>Parent / Guardian 1</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <PairedRow
              left={{ label: "Name:", value: g1Name, onChange: setG1Name }}
              right={{ label: "Relationship:", value: g1Rel, onChange: setG1Rel }}
              readOnly={ro}
            />
            <PairedRow
              left={{ label: "Phone:", value: g1Phone, onChange: setG1Phone }}
              right={{ label: "Email:", value: g1Email, onChange: setG1Email }}
              readOnly={ro}
            />
          </div>

          {/* Parent / Guardian 2 */}
          <SectionHead>Parent / Guardian 2 (Optional)</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <PairedRow
              left={{ label: "Name:", value: g2Name, onChange: setG2Name }}
              right={{ label: "Relationship:", value: g2Rel, onChange: setG2Rel }}
              readOnly={ro}
            />
            <PairedRow
              left={{ label: "Phone:", value: g2Phone, onChange: setG2Phone }}
              right={{ label: "Email:", value: g2Email, onChange: setG2Email }}
              readOnly={ro}
            />
          </div>

          {/* Signatures */}
          <SectionHead>Signatures</SectionHead>
          <div style={{ display: "flex", gap: 24, marginBottom: 8 }}>
            <SignatureLine label="Applicant's Signature" />
            <SignatureLine label="Parent / Guardian Signature" />
          </div>
          <FullRow label="Date Signed:" value={dateSigned} onChange={setDateSigned} readOnly={ro} />
        </div>{/* end Form 1 */}

        {/* ══════════════════════════════════════════════════════════════════
            FORM 2 — Student Medical Form
        ══════════════════════════════════════════════════════════════════ */}
        <div className="wit-paper wit-page" style={{ ...PAPER, marginTop: 0 }}>
          <FormTitle num={2} title="Student Medical Form" />

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 4, alignItems: "baseline" }}>
              <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>Student Name (Full):</span>
              <F
                value={`${firstName} ${lastName}`.trim()}
                readOnly
                style={{ flex: 1, color: "#444" }}
              />
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "baseline" }}>
              <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>Date of Birth:</span>
              <F value={dob} readOnly style={{ width: 130, color: "#444" }} />
            </div>
          </div>

          {/* Allergies */}
          <SectionHead>Allergies</SectionHead>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
            <span style={{ fontSize: 12 }}>Does the student have any allergies?</span>
            <Chk label="Yes" checked={hasAllergies === true}  onChange={() => setHasAllergies(hasAllergies === true  ? null : true)}  readOnly={ro} />
            <Chk label="No"  checked={hasAllergies === false} onChange={() => setHasAllergies(hasAllergies === false ? null : false)} readOnly={ro} />
          </div>
          {hasAllergies && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ fontSize: 12 }}>List allergies (specify severity / reaction):</div>
              <F value={allergiesList} onChange={setAllergiesList} style={{ width: "100%" }} readOnly={ro} />
              <F value="" onChange={() => {}} style={{ width: "100%" }} readOnly={ro} />
            </div>
          )}

          {/* Medications */}
          <SectionHead>Current Medications</SectionHead>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
            <span style={{ fontSize: 12 }}>Is the student currently on any medications?</span>
            <Chk label="Yes" checked={hasMeds === true}  onChange={() => setHasMeds(hasMeds === true  ? null : true)}  readOnly={ro} />
            <Chk label="No"  checked={hasMeds === false} onChange={() => setHasMeds(hasMeds === false ? null : false)} readOnly={ro} />
          </div>
          {hasMeds && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ fontSize: 12 }}>List medications (specify dosage / frequency):</div>
              <F value={medsList} onChange={setMedsList} style={{ width: "100%" }} readOnly={ro} />
              <F value="" onChange={() => {}} style={{ width: "100%" }} readOnly={ro} />
            </div>
          )}

          {/* Chronic Conditions */}
          <SectionHead>Chronic Medical Conditions</SectionHead>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
            <span style={{ fontSize: 12 }}>Does the student have any chronic medical conditions?</span>
            <Chk label="Yes" checked={hasConditions === true}  onChange={() => setHasConditions(hasConditions === true  ? null : true)}  readOnly={ro} />
            <Chk label="No"  checked={hasConditions === false} onChange={() => setHasConditions(hasConditions === false ? null : false)} readOnly={ro} />
          </div>
          {hasConditions && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ fontSize: 12 }}>List conditions:</div>
              <F value={conditionsList} onChange={setConditionsList} style={{ width: "100%" }} readOnly={ro} />
            </div>
          )}

          {/* Last Physical */}
          <SectionHead>Last Physical Examination</SectionHead>
          <FullRow label="Date of Last Physical Exam:" value={lastPhysical} onChange={setLastPhysical} readOnly={ro} />

          {/* Immunizations */}
          <SectionHead>Immunization Records</SectionHead>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 11 }}>
            <thead>
              <tr>
                <th className="wit-td" style={{ textAlign: "left", padding: "3px 8px" }}>Vaccine</th>
                <th className="wit-td" style={{ textAlign: "center", width: 120 }}>Date Received</th>
                <th className="wit-td" style={{ textAlign: "center", width: 60 }}>Received?</th>
              </tr>
            </thead>
            <tbody>
              {VACCINES.map((v) => (
                <tr key={v}>
                  <td className="wit-td" style={{ padding: "3px 8px" }}>{v}</td>
                  <td className="wit-td">
                    <F
                      value={immunizations[v] ?? ""}
                      onChange={(val) => updateImmunization(v, val)}
                      style={{ width: "100%" }}
                      readOnly={ro}
                    />
                  </td>
                  <td className="wit-td" style={{ textAlign: "center" }}>
                    <Chk
                      label=""
                      checked={!!immunizations[v]}
                      onChange={() => !ro && updateImmunization(v, immunizations[v] ? "" : "✓")}
                      readOnly={ro}
                    />
                  </td>
                </tr>
              ))}
              <tr>
                <td className="wit-td">
                  <span style={{ fontSize: 12 }}>Other: </span>
                  <F value={otherVaccine} onChange={setOtherVaccine} style={{ width: 120 }} readOnly={ro} />
                </td>
                <td className="wit-td">
                  <F value={otherVaccineDate} onChange={setOtherVaccineDate} style={{ width: "100%" }} readOnly={ro} />
                </td>
                <td className="wit-td" style={{ textAlign: "center" }}>
                  <Chk label="" checked={!!otherVaccineDate} onChange={() => {}} readOnly />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Special needs */}
          <SectionHead>Special Medical Needs / Accommodations</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <F value={specialNeeds} onChange={setSpecialNeeds} style={{ width: "100%" }} readOnly={ro} />
            <F value="" onChange={() => {}} style={{ width: "100%" }} readOnly={ro} />
          </div>

          {/* PCP */}
          <SectionHead>Primary Care Physician</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <FullRow label="Name:" value={pcpName} onChange={setPcpName} readOnly={ro} />
            <FullRow label="Contact Number:" value={pcpPhone} onChange={setPcpPhone} readOnly={ro} />
          </div>

          {/* Emergency Contacts */}
          <SectionHead>Emergency Contacts</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <PairedRow
              left={{ label: "Emergency Contact 1 Name:", value: ec1Name, onChange: setEc1Name }}
              right={{ label: "Phone:", value: ec1Phone, onChange: setEc1Phone }}
              readOnly={ro}
            />
            <PairedRow
              left={{ label: "Emergency Contact 2 Name:", value: ec2Name, onChange: setEc2Name }}
              right={{ label: "Phone:", value: ec2Phone, onChange: setEc2Phone }}
              readOnly={ro}
            />
          </div>

          {/* Medical consent */}
          <SectionHead>Parent / Guardian Consent for Emergency Treatment</SectionHead>
          <p style={{ fontSize: 12, lineHeight: 1.7, marginBottom: 10 }}>
            I hereby give consent for emergency medical treatment to be administered to my child/ward
            in the event that I cannot be reached.
          </p>
          <div style={{ display: "flex", gap: 24, marginBottom: 8 }}>
            <SignatureLine label="Parent / Guardian Signature" />
            <div style={{ flex: 1 }}>
              <FullRow label="Date:" value={medConsentDate} onChange={setMedConsentDate} readOnly={ro} />
            </div>
          </div>

          {/* Completed by */}
          <SectionHead>Completed By</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <PairedRow
              left={{ label: "Name:", value: medCompletedBy, onChange: setMedCompletedBy }}
              right={{ label: "Relationship to Student:", value: medCompletedRel, onChange: setMedCompletedRel }}
              readOnly={ro}
            />
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
            <SignatureLine label="Signature" />
            <div style={{ flex: 1 }}>
              <FullRow label="Date:" value={medCompletedDate} onChange={setMedCompletedDate} readOnly={ro} />
            </div>
          </div>
        </div>{/* end Form 2 */}

        {/* ══════════════════════════════════════════════════════════════════
            FORM 3 — Course Selection / Preference Form
        ══════════════════════════════════════════════════════════════════ */}
        <div className="wit-paper wit-page" style={{ ...PAPER, marginTop: 0 }}>
          <FormTitle num={3} title="Course Selection / Preference Form" />

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 4, alignItems: "baseline" }}>
              <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>Student Name:</span>
              <F
                value={`${firstName} ${lastName}`.trim()}
                readOnly
                style={{ flex: 1, color: "#444" }}
              />
            </div>
            <PairedRow
              left={{ label: "Grade Level:", value: gradeLevel, onChange: setGradeLevel }}
              right={{ label: "Current School Year:", value: schoolYear, onChange: setSchoolYear }}
              readOnly={ro}
            />
          </div>

          {/* Core subjects */}
          <SectionHead>Core Subject Preferences</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <FullRow label="Desired English / Language Arts Course:" value={courseELA} onChange={setCourseELA} readOnly={ro} />
            <FullRow label="Desired Mathematics Course:" value={courseMath} onChange={setCourseMath} readOnly={ro} />
            <FullRow label="Desired Science Course:" value={courseScience} onChange={setCourseScience} readOnly={ro} />
            <FullRow label="Desired Social Studies / History Course:" value={courseSocial} onChange={setCourseSocial} readOnly={ro} />
          </div>

          {/* Electives */}
          <SectionHead>Elective Choices</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <PairedRow
              left={{ label: "Elective Choice 1 (Title / Code):", value: elective1, onChange: setElective1 }}
              right={{ label: "Elective Choice 2 (Title / Code):", value: elective2, onChange: setElective2 }}
              readOnly={ro}
            />
            <PairedRow
              left={{ label: "Elective Choice 3 (Title / Code):", value: elective3, onChange: setElective3 }}
              right={{ label: "Alternative Elective (Title / Code):", value: electiveAlt, onChange: setElectiveAlt }}
              readOnly={ro}
            />
          </div>

          {/* Summary */}
          <SectionHead>Summary</SectionHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <FullRow label="Total Number of Credits / Courses Selected:" value={totalCredits} onChange={setTotalCredits} readOnly={ro} />
            <div>
              <div style={{ fontSize: 12, marginBottom: 5 }}>Prerequisites Met / Needed:</div>
              <F value={prerequisites} onChange={setPrerequisites} style={{ width: "100%" }} readOnly={ro} />
            </div>
          </div>

          {/* Signatures */}
          <SectionHead>Signatures</SectionHead>
          <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
            <SignatureLine label="Student Signature" />
            <SignatureLine label="Parent / Guardian Signature (Approval)" />
          </div>
          <FullRow label="Date of Submission:" value={courseSubmitDate} onChange={setCourseSubmitDate} readOnly={ro} />
        </div>{/* end Form 3 */}

      </div>{/* end wrapper */}
    </>
  );
}
