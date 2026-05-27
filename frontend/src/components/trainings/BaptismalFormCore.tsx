"use client";

/**
 * BaptismalFormCore — digital replica of the physical
 * "FOUNDATION AND WATER BAPTISM COURSE" form.
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

export type BaptismalMode = "blank" | "fill" | "view";

/* ── Table/cell style constants ─────────────────────────────────────────── */
const T: React.CSSProperties = {
  borderCollapse: "collapse",
  width: "100%",
  marginBottom: 16,
  fontSize: 12,
};
/* Label cell */
const LBL: React.CSSProperties = {
  border: "1px solid #000",
  padding: "4px 8px",
  whiteSpace: "nowrap",
  verticalAlign: "middle",
  fontSize: 12,
  fontWeight: 700,
};
/* Input cell */
const CEL: React.CSSProperties = {
  border: "1px solid #000",
  padding: "2px 6px",
  verticalAlign: "middle",
};
/* Numbered cell */
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

/* ── Cell Input ──────────────────────────────────────────────────────────── */
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

/* ── Section heading ────────────────────────────────────────────────────── */
function SH({ letter, title }: { letter: string; title: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 16,
        fontWeight: 700,
        fontSize: 12,
        textTransform: "uppercase",
        marginTop: 20,
        marginBottom: 6,
      }}
    >
      <span style={{ minWidth: 24 }}>{letter}:</span>
      <span>{title}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function BaptismalFormCore({
  mode,
  initialData,
}: {
  mode: BaptismalMode;
  initialData?: SchoolOfMinistryFullResponse;
}) {
  const ro = mode === "blank" || mode === "view";
  const router = useRouter();

  /* ── Section A — Biographical Data ─────────────────────────────────────── */
  const [surname, setSurname] = useState(initialData?.lastName ?? "");
  const [firstName, setFirstName] = useState(initialData?.firstName ?? "");
  const [middleName, setMiddleName] = useState(initialData?.middleName ?? "");
  const [sex, setSex] = useState(() => {
    const s = initialData?.sex ?? "";
    if (s.toUpperCase() === "MALE") return "Male";
    if (s.toUpperCase() === "FEMALE") return "Female";
    return s;
  });
  const [dob, setDob] = useState(initialData?.dateOfBirth ?? "");
  const [marital, setMarital] = useState(() => {
    const m = initialData?.maritalStatus ?? "";
    if (!m) return "";
    return m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
  });
  const [stateOfOrigin, setStateOfOrigin] = useState("");
  const [spouseName, setSpouseName] = useState(initialData?.spouseName ?? "");
  const [numChildren, setNumChildren] = useState(
    initialData?.noOfChildren != null ? String(initialData.noOfChildren) : ""
  );
  const [formalReligion, setFormalReligion] = useState("");

  /* ── Section B (Addresses) ──────────────────────────────────────────────── */
  const [homeAddress, setHomeAddress] = useState(
    [initialData?.street, initialData?.city, initialData?.state, initialData?.country].filter(Boolean).join(", ") ?? ""
  );
  const [countryCode, setCountryCode] = useState(
    initialData?.countryCode ?? "234"
  );
  const [phone, setPhone] = useState(initialData?.phoneNumber ?? "");
  const [occupation, setOccupation] = useState(initialData?.occupation ?? "");
  const [email, setEmail] = useState("");
  const [placeOfWork, setPlaceOfWork] = useState(
    initialData?.placeOfWork ?? ""
  );
  const [socialMedia, setSocialMedia] = useState("");
  const [officeAddress, setOfficeAddress] = useState(
    initialData?.officeFullAddress ?? ""
  );
  const [workPhone, setWorkPhone] = useState(
    initialData?.officePhoneNumber ?? ""
  );

  /* ── Section B (Qualifications) ─────────────────────────────────────────── */
  const [quals, setQuals] = useState(() => {
    const fromData = (initialData?.qualifications ?? []).map((q) => ({
      schoolAttended: q.institution ?? "",
      dates: q.date ?? "",
      qualificationReceived: q.qualificationReceived ?? "",
    }));
    while (fromData.length < 3)
      fromData.push({
        schoolAttended: "",
        dates: "",
        qualificationReceived: "",
      });
    return fromData.slice(0, 3);
  });
  const updateQual = (
    i: number,
    k: keyof (typeof quals)[0],
    v: string
  ) => setQuals((prev) => prev.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));

  /* ── Section C — Christian History ─────────────────────────────────────── */
  const [worshipPlaces, setWorshipPlaces] = useState(() => {
    const fromData = (initialData?.pastPlaceOfWorships ?? []).map(
      (w) => w.name ?? ""
    );
    while (fromData.length < 2) fromData.push("");
    return fromData.slice(0, 2);
  });
  const updateWp = (i: number, v: string) =>
    setWorshipPlaces((prev) => prev.map((r, idx) => (idx === i ? v : r)));

  const [salvationDate, setSalvationDate] = useState(
    initialData?.salvationDate ?? ""
  );
  const [salvationWhere, setSalvationWhere] = useState(
    initialData?.salvationLocation ?? ""
  );
  const [holySpiritAnswer, setHolySpiritAnswer] = useState(
    initialData?.holySpiritBaptismLocation ?? ""
  );
  const [holySpiritWhere, setHolySpiritWhere] = useState(
    initialData?.holySpiritBaptismDate ?? ""
  );

  /* ── Section D — Departments ─────────────────────────────────────────────── */
  const [depts, setDepts] = useState(() => {
    const fromData = (initialData?.studentDepartments ?? []).map((d) => ({
      name: d.name ?? "",
      date: d.date ?? "",
    }));
    while (fromData.length < 3) fromData.push({ name: "", date: "" });
    return fromData.slice(0, 3);
  });
  const updateDept = (
    i: number,
    k: keyof (typeof depts)[0],
    v: string
  ) => setDepts((prev) => prev.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));

  /* ── Section F — New Converts Class ─────────────────────────────────────── */
  const [newConvertsText, setNewConvertsText] = useState(() => {
    if (initialData?.goneThroughNewConverts === true) return "Yes";
    if (initialData?.goneThroughNewConverts === false) return "No";
    return "";
  });

  /* ── Section G — Afraid of Water ────────────────────────────────────────── */
  const [afraidOfWater, setAfraidOfWater] = useState("");

  /* ── Section H — Reasons for attending (3 boxes) ────────────────────────── */
  const [reasons, setReasons] = useState<string[]>(() => {
    const fromData = [...(initialData?.reasonsForApplying ?? [])];
    while (fromData.length < 3) fromData.push("");
    return fromData.slice(0, 3);
  });
  const updateReason = (i: number, v: string) =>
    setReasons((prev) => prev.map((r, idx) => (idx === i ? v : r)));

  /* ── Section I — Other Information ──────────────────────────────────────── */
  const [otherInfoText, setOtherInfoText] = useState(() => {
    const raw = initialData?.otherInformation ?? "";
    // If it came from a previous submission that prepended afraid-of-water, show
    // only the "other" part after the prefix line.
    const lines = raw.split("\n");
    if (lines[0]?.startsWith("Afraid of water:")) {
      return lines.slice(1).join("\n").trimStart();
    }
    return raw;
  });

  /* ── Section K — Official Remarks ───────────────────────────────────────── */
  const [officialRemarks, setOfficialRemarks] = useState(
    initialData?.officialRemarks ?? ""
  );

  /* ── Bottom approval section (UI-only) ───────────────────────────────────── */
  const [approveNewConvert, setApproveNewConvert] = useState("");
  const [approveBaptism, setApproveBaptism] = useState("");

  /* ── Photo ──────────────────────────────────────────────────────────────── */
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialData?.profilePictureUrl ?? null
  );
  const [uploading, setUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  /* ── Submit ─────────────────────────────────────────────────────────────── */
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async () => {
    const missing: string[] = [];
    if (!firstName.trim()) missing.push("First Name");
    if (!surname.trim()) missing.push("Surname");
    if (!countryCode.trim()) missing.push("Country Code");
    if (!phone.trim()) missing.push("Phone Number");
    if (phone.trim() && !/\d/.test(phone))
      missing.push("Phone Number (must contain digits)");
    if (missing.length > 0) {
      setSubmitError(`Please fill in: ${missing.join(", ")}.`);
      return;
    }

    const parseYesNo = (text: string): boolean | undefined => {
      const t = text.trim().toLowerCase();
      if (t === "yes" || t === "y") return true;
      if (t === "no" || t === "n") return false;
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
        institution:           q.schoolAttended.trim(),
        date:                  q.dates.trim() || undefined,
        qualificationReceived: q.qualificationReceived.trim() || undefined,
      }));

    const wpItems = worshipPlaces
      .filter((n) => n.trim())
      .map((n) => ({ name: n.trim() }));

    const deptItems = depts
      .filter((d) => d.name.trim())
      .map((d) => ({ name: d.name.trim(), date: d.date.trim() || undefined }));

    const reasonItems = reasons.filter((r) => r.trim());

    // Build otherInformation: prepend afraid-of-water if provided
    let otherInfoStr: string | undefined;
    const parts: string[] = [];
    if (afraidOfWater.trim()) {
      parts.push(`Afraid of water: ${afraidOfWater.trim()}`);
    }
    if (otherInfoText.trim()) {
      parts.push(otherInfoText.trim());
    }
    otherInfoStr = parts.length > 0 ? parts.join("\n") : undefined;

    const maritalMap: Record<string, string> = {
      Single: "SINGLE",
      Married: "MARRIED",
      Engaged: "ENGAGED",
      Divorced: "DIVORCED",
      Widowed: "WIDOWED",
    };
    const sexNorm = sex.trim().toLowerCase().startsWith("f")
      ? "FEMALE"
      : sex.trim().toLowerCase().startsWith("m")
      ? "MALE"
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
        firstName: firstName.trim(),
        lastName: surname.trim(),
        middleName: middleName.trim() || undefined,
        sex: sexNorm as string | undefined,
        dateOfBirth: dob.trim() || undefined,
        maritalStatus: marital.trim()
          ? maritalMap[marital.trim()] ?? marital.trim().toUpperCase()
          : undefined,
        noOfChildren: numChildren.trim() ? Number(numChildren.trim()) : undefined,
        spouseName: spouseName.trim() || undefined,
        countryCode: countryCode.trim().replace(/^\+/, ""),
        phoneNumber: normalisePhone(phone, countryCode),
        street: homeAddress.trim() || undefined,
        occupation: occupation.trim() || undefined,
        placeOfWork: placeOfWork.trim() || undefined,
        officePhoneNumber: workPhone.trim()
          ? normalisePhone(workPhone, countryCode)
          : undefined,
        officeFullAddress: officeAddress.trim() || undefined,
        profilePictureUrl,
        salvationDate: salvationDate.trim() || undefined,
        salvationLocation: salvationWhere.trim() || undefined,
        holySpiritBaptismDate: holySpiritWhere.trim() || undefined,
        holySpiritBaptismLocation: holySpiritAnswer.trim() || undefined,
        goneThroughNewConverts: parseYesNo(newConvertsText),
        otherInformation: otherInfoStr,
        ...(qualItems.length ? { qualificationRequests:            qualItems }  : {}),
        ...(wpItems.length   ? { createPastPlaceOfWorshipRequests: wpItems }    : {}),
        ...(deptItems.length ? { createStudentDepartmentRequests:  deptItems }  : {}),
        ...(reasonItems.length ? { reasonsForApplying:             reasonItems } : {}),
      });

      const savedId = (created as { id?: string })?.id;
      if (!savedId) {
        setSubmitError(
          "The server accepted the form but did not return a record ID. Please check the Baptismal list or contact the backend team."
        );
        return;
      }

      setSubmitSuccess(true);
      setSubmitError("");
      setTimeout(() => {
        router.refresh();
        router.push("/trainings/baptismal");
      }, 1500);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit. Please try again.";
      setSubmitError(
        `${msg} (Check browser console → F12 → Console for the full server error.)`
      );
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
          .bap-no-print   { display: none !important; }
          .bap-wrapper    { background: #fff !important; padding: 0 !important; min-height: auto !important; }
          .bap-paper      { box-shadow: none !important; width: 100% !important; max-width: none !important;
                            margin: 0 !important; padding: 20px 30px !important; }
          .bap-page2      { page-break-before: always; break-before: page; margin-top: 0 !important; }
        }

        .bap-ci:focus { background: #eef2ff !important; }
        .bap-ci[readonly]:focus { background: transparent !important; }
      `}</style>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div
        className="bap-no-print"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "#000080",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 24px",
          }}
        >
          <button
            onClick={() => router.push("/trainings/baptismal")}
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 13,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            ← Back to List
          </button>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
            {mode === "blank"
              ? "Baptismal Form — Blank"
              : mode === "view"
              ? "Baptismal Form — View Record"
              : "Baptismal Form — Fill & Submit"}
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            {mode === "fill" && (
              <button
                onClick={handleSubmit}
                disabled={submitting || uploading || submitSuccess}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: submitSuccess ? "#16A34A" : "#22c55e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "7px 18px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor:
                    submitting || uploading || submitSuccess
                      ? "not-allowed"
                      : "pointer",
                  opacity: submitting || uploading ? 0.7 : 1,
                }}
              >
                {submitSuccess ? (
                  <>
                    <CheckCircle size={14} /> Saved to System
                  </>
                ) : uploading ? (
                  <>
                    <Send size={14} /> Uploading Photo…
                  </>
                ) : submitting ? (
                  <>
                    <Send size={14} /> Submitting…
                  </>
                ) : (
                  <>
                    <Send size={14} /> Submit to System
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => window.print()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#fff",
                color: "#000080",
                border: "none",
                borderRadius: 8,
                padding: "7px 18px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <Printer size={14} />
              {mode === "blank"
                ? "Print Blank Form"
                : mode === "view"
                ? "Print Filled Form"
                : "Print / Download PDF"}
            </button>
          </div>
        </div>

        {submitError && (
          <div
            style={{
              background: "#FEF2F2",
              color: "#991B1B",
              padding: "8px 24px",
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderTop: "1px solid #FECACA",
            }}
          >
            <XCircle size={14} />
            {submitError}
            <button
              onClick={() => setSubmitError("")}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#991B1B",
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>
        )}

        {submitSuccess && (
          <div
            style={{
              background: "#F0FDF4",
              color: "#15803D",
              padding: "8px 24px",
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderTop: "1px solid #BBF7D0",
            }}
          >
            <CheckCircle size={14} />
            Application submitted successfully!
            <a
              href="/trainings/baptismal"
              style={{
                marginLeft: 12,
                color: "#15803D",
                textDecoration: "underline",
                fontWeight: 700,
              }}
            >
              View Baptismal List →
            </a>
          </div>
        )}
      </div>

      {/* ── Gray wrapper ──────────────────────────────────────────────────── */}
      <div
        className="bap-wrapper"
        style={{
          minHeight: "100vh",
          background: "#b0bec5",
          paddingTop: submitError || submitSuccess ? 110 : 72,
          paddingBottom: 48,
          display: "flex",
          flexDirection: "column",
          gap: 32,
          transition: "padding-top 0.2s",
          overflowX: "auto",
        }}
      >
        {/* ══════════════════ PAGE 1 ══════════════════════════════════════ */}
        <div className="bap-paper" style={PAPER}>

          {/* ── HEADER ──────────────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 20,
            }}
          >
            {/* Left: logo */}
            <div
              style={{
                width: 72,
                height: 72,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/rccg-logo.svg"
                alt="RCCG Logo"
                style={{ width: 64, height: 64, objectFit: "contain" }}
              />
            </div>

            {/* Center: title block */}
            <div
              style={{
                flex: 1,
                textAlign: "center",
                lineHeight: 1.9,
                padding: "0 12px",
              }}
            >
              <div
                style={{
                  fontFamily: "Times New Roman, serif",
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                THE REDEEMED CHRISTIAN CHURCH OF GOD
              </div>
              <div
                style={{
                  fontFamily: "Times New Roman, serif",
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                ROSE OF SHARON PARISH
              </div>
              <div
                style={{
                  fontFamily: "Times New Roman, serif",
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  textDecoration: "underline",
                }}
              >
                FOUNDATION AND WATER BAPTISM COURSE
              </div>
              <div
                style={{
                  fontFamily: "Times New Roman, serif",
                  fontSize: 12,
                  fontStyle: "italic",
                }}
              >
                (PLEASE ANSWER EVERY QUESTION)
              </div>
            </div>

            {/* Right: Passport photo box */}
            {mode === "fill" ? (
              <div
                className="bap-no-print"
                onClick={() => photoInputRef.current?.click()}
                style={{
                  width: 80,
                  height: 96,
                  border: "1px solid #000",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                  background: photoPreview ? "transparent" : "#fafafa",
                }}
                title="Click to upload passport photograph"
              >
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview}
                    alt="Passport"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 8,
                      textAlign: "center",
                      color: "#9CA3AF",
                      lineHeight: 1.4,
                    }}
                  >
                    Passport
                    <br />
                    Photo
                    <br />
                    (click)
                  </span>
                )}
              </div>
            ) : (
              <div
                style={{
                  width: 80,
                  height: 96,
                  border: "1px solid #000",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview}
                    alt="Passport"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 8,
                      textAlign: "center",
                      color: "#666",
                      lineHeight: 1.6,
                    }}
                  >
                    Passport
                    <br />
                    Photograph
                  </span>
                )}
              </div>
            )}
            {mode === "fill" && (
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
            )}
          </div>

          {/* Admission No. — only shown in view mode (table ID from backend) */}
          {mode === "view" && initialData?.id && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "Times New Roman, serif", border: "1px solid #000", padding: "2px 10px" }}>
                Admission No:&nbsp;<span style={{ fontWeight: 400 }}>{initialData.id}</span>
              </span>
            </div>
          )}

          {/* ══ SECTION A — BIOGRAPHICAL DATA ═══════════════════════════ */}
          <SH letter="A" title="Biographical Data" />
          <table style={T}>
            <tbody>
              <tr>
                <td style={LBL}>SURNAME:</td>
                <td style={CEL}>
                  <CI value={surname} onChange={setSurname} readOnly={ro} />
                </td>
                <td style={LBL}>FIRST NAME:</td>
                <td style={CEL}>
                  <CI
                    value={firstName}
                    onChange={setFirstName}
                    readOnly={ro}
                  />
                </td>
              </tr>
              <tr>
                <td style={LBL}>MIDDLE NAME:</td>
                <td style={CEL}>
                  <CI
                    value={middleName}
                    onChange={setMiddleName}
                    readOnly={ro}
                  />
                </td>
                <td style={LBL}>SEX:</td>
                <td style={CEL}>
                  <CI
                    value={sex}
                    onChange={setSex}
                    readOnly={ro}
                    placeholder="Male / Female"
                  />
                </td>
              </tr>
              <tr>
                <td style={LBL}>DATE OF BIRTH:</td>
                <td style={CEL}>
                  <CI
                    value={dob}
                    onChange={setDob}
                    readOnly={ro}
                    placeholder="dd/mm/yyyy"
                  />
                </td>
                <td style={LBL}>MARITAL STATUS:</td>
                <td style={CEL}>
                  <CI
                    value={marital}
                    onChange={setMarital}
                    readOnly={ro}
                    placeholder="Single / Married…"
                  />
                </td>
              </tr>
              <tr>
                <td style={LBL}>STATE OF ORIGIN:</td>
                <td style={CEL}>
                  <CI
                    value={stateOfOrigin}
                    onChange={ro ? undefined : setStateOfOrigin}
                    readOnly={ro}
                  />
                </td>
                <td style={{ ...LBL, whiteSpace: "normal" }}>
                  NAME OF SPOUSE: (IF MARRIED)
                </td>
                <td style={CEL}>
                  <CI
                    value={spouseName}
                    onChange={setSpouseName}
                    readOnly={ro}
                  />
                </td>
              </tr>
              <tr>
                <td style={LBL}>NUMBER OF CHILDREN:</td>
                <td style={CEL}>
                  <CI
                    value={numChildren}
                    onChange={setNumChildren}
                    readOnly={ro}
                  />
                </td>
                <td style={LBL}>FORMAL RELIGION:</td>
                <td style={CEL}>
                  <CI
                    value={formalReligion}
                    onChange={ro ? undefined : setFormalReligion}
                    readOnly={ro}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* ══ SECTION B — ADDRESSES ═══════════════════════════════════ */}
          <SH letter="B" title="Addresses" />
          <table style={T}>
            <tbody>
              <tr>
                <td style={LBL}>HOME ADDRESS</td>
                <td style={{ ...CEL, width: "40%" }}>
                  <CI
                    value={homeAddress}
                    onChange={setHomeAddress}
                    readOnly={ro}
                  />
                </td>
                <td style={LBL}>PHONE:</td>
                <td style={CEL}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {!ro && (
                      <>
                        <CI
                          value={countryCode}
                          onChange={setCountryCode}
                          readOnly={ro}
                          placeholder="234"
                          style={{ width: 40 }}
                        />
                        <span style={{ color: "#555" }}>-</span>
                      </>
                    )}
                    <CI
                      value={phone}
                      onChange={setPhone}
                      readOnly={ro}
                      placeholder="08012345678"
                      style={{ flex: 1 }}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td style={LBL}>OCCUPATION</td>
                <td style={CEL}>
                  <CI
                    value={occupation}
                    onChange={setOccupation}
                    readOnly={ro}
                  />
                </td>
                <td style={LBL}>E-MAIL:</td>
                <td style={CEL}>
                  <CI
                    value={email}
                    onChange={ro ? undefined : setEmail}
                    readOnly={ro}
                  />
                </td>
              </tr>
              <tr>
                <td style={LBL}>PLACE OF WORK</td>
                <td style={CEL}>
                  <CI
                    value={placeOfWork}
                    onChange={setPlaceOfWork}
                    readOnly={ro}
                  />
                </td>
                <td style={LBL}>SOCIAL MEDIA HANDLE:</td>
                <td style={CEL}>
                  <CI
                    value={socialMedia}
                    onChange={ro ? undefined : setSocialMedia}
                    readOnly={ro}
                  />
                </td>
              </tr>
              <tr>
                <td style={LBL}>OFFICE ADDRESS</td>
                <td style={CEL}>
                  <CI
                    value={officeAddress}
                    onChange={setOfficeAddress}
                    readOnly={ro}
                  />
                </td>
                <td style={LBL}>PHONE:</td>
                <td style={CEL}>
                  <CI
                    value={workPhone}
                    onChange={setWorkPhone}
                    readOnly={ro}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* ══ SECTION B — EDUCATION & PROFESSIONAL QUALIFICATIONS ═════ */}
          {/* Note: same letter B as on the physical form */}
          <SH
            letter="B"
            title="Education &amp; Professional Qualifications School"
          />
          <table style={T}>
            <thead>
              <tr>
                <th style={{ ...LBL, textAlign: "center", width: "44%" }}>
                  SCHOOLS ATTENDED
                </th>
                <th style={{ ...LBL, textAlign: "center", width: "18%" }}>
                  DATES
                </th>
                <th style={{ ...LBL, textAlign: "center" }}>
                  QUALIFICATION RECEIVED
                </th>
              </tr>
            </thead>
            <tbody>
              {quals.map((q, i) => (
                <tr key={i}>
                  <td style={{ ...NUM, width: 24, textAlign: "center" }}>
                    {i + 1}
                  </td>
                  <td style={CEL}>
                    <CI
                      value={q.schoolAttended}
                      onChange={(v) => updateQual(i, "schoolAttended", v)}
                      readOnly={ro}
                    />
                  </td>
                  <td style={CEL}>
                    <CI
                      value={q.dates}
                      onChange={(v) => updateQual(i, "dates", v)}
                      readOnly={ro}
                    />
                  </td>
                  <td style={CEL}>
                    <CI
                      value={q.qualificationReceived}
                      onChange={(v) =>
                        updateQual(i, "qualificationReceived", v)
                      }
                      readOnly={ro}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ SECTION C — CHRISTIAN HISTORY ═══════════════════════════ */}
          <SH letter="C" title="Christian History" />
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 6,
              textTransform: "uppercase",
            }}
          >
            LIST YOUR 2 MOST RECENT PLACES OF WORSHIP APART FROM ROSE OF
            SHARON PARISH (INCL. NON-CHRISTIAN)
          </div>

          <table style={{ ...T, marginBottom: 12 }}>
            <tbody>
              {worshipPlaces.map((wp, i) => (
                <tr key={i}>
                  <td style={NUM}>{i + 1}.</td>
                  <td style={CEL}>
                    <CI
                      value={wp}
                      onChange={(v) => updateWp(i, v)}
                      readOnly={ro}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Salvation + Holy Spirit table */}
          <table style={T}>
            <tbody>
              <tr>
                <td
                  style={{
                    ...LBL,
                    fontWeight: 700,
                    whiteSpace: "normal",
                    width: "55%",
                  }}
                >
                  DATE OF SALVATION (When did you give your life to Christ?)
                </td>
                <td style={LBL}>WHERE:</td>
                <td style={CEL}>
                  <CI
                    value={salvationWhere}
                    onChange={setSalvationWhere}
                    readOnly={ro}
                  />
                </td>
              </tr>
              <tr>
                <td style={CEL}>
                  <CI
                    value={salvationDate}
                    onChange={setSalvationDate}
                    readOnly={ro}
                    placeholder="e.g. 15 March 2010"
                  />
                </td>
                <td style={LBL} colSpan={2}></td>
              </tr>
              <tr>
                <td
                  style={{
                    ...LBL,
                    fontWeight: 700,
                    whiteSpace: "normal",
                    width: "55%",
                  }}
                >
                  ARE YOU BAPTIZED IN THE HOLYGHOST (with evidence of speaking
                  in tongues)
                </td>
                <td style={LBL}>WHERE:</td>
                <td style={CEL}>
                  <CI
                    value={holySpiritAnswer}
                    onChange={setHolySpiritAnswer}
                    readOnly={ro}
                    placeholder="Yes / No"
                  />
                </td>
              </tr>
              <tr>
                <td style={CEL}>
                  <CI
                    value={holySpiritWhere}
                    onChange={setHolySpiritWhere}
                    readOnly={ro}
                    placeholder="Church / Location"
                  />
                </td>
                <td style={LBL} colSpan={2}></td>
              </tr>
            </tbody>
          </table>

          {/* ══ SECTION D — DEPARTMENTS ══════════════════════════════════ */}
          <SH
            letter="D"
            title="Do you belong to any department within the church? (If yes, please list)"
          />
          <table style={T}>
            <tbody>
              {depts.map((d, i) => (
                <tr key={i}>
                  <td style={NUM}>{i + 1}.</td>
                  <td style={{ ...CEL, width: "68%" }}>
                    <CI
                      value={d.name}
                      onChange={(v) => updateDept(i, "name", v)}
                      readOnly={ro}
                      placeholder="Department name"
                    />
                  </td>
                  <td style={LBL}>DATES</td>
                  <td style={{ ...CEL, width: "18%" }}>
                    <CI
                      value={d.date}
                      onChange={(v) => updateDept(i, "date", v)}
                      readOnly={ro}
                      placeholder="e.g. Jan 2020"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Page 1 number */}
          <div style={{ textAlign: "center", fontSize: 11, marginTop: 12 }}>
            1
          </div>
        </div>
        {/* end page 1 */}

        {/* ══════════════════ PAGE 2 ══════════════════════════════════════ */}
        <div className="bap-paper bap-page2" style={{ ...PAPER, marginTop: 0 }}>

          {/* ══ SECTION F — NEW CONVERTS CLASS ══════════════════════════ */}
          <SH
            letter="F"
            title="Have you gone through New Converts Classes in Rose of Sharon?"
          />
          <table style={T}>
            <tbody>
              <tr>
                <td
                  style={{
                    ...CEL,
                    height: 26,
                    borderBottom: "1px dotted #000",
                    border: "none",
                    borderBottomStyle: "dotted" as const,
                  }}
                >
                  <CI
                    value={newConvertsText}
                    onChange={setNewConvertsText}
                    readOnly={ro}
                    placeholder="Yes / No"
                  />
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    height: 26,
                    borderBottom: "1px dotted #000",
                    border: "none",
                    borderBottomStyle: "dotted" as const,
                    padding: "2px 0",
                  }}
                ></td>
              </tr>
            </tbody>
          </table>

          {/* ══ SECTION G — AFRAID OF WATER ══════════════════════════════ */}
          <SH letter="G" title="Are you afraid of water?" />
          <table style={T}>
            <tbody>
              <tr>
                <td
                  style={{
                    height: 26,
                    borderBottom: "1px dotted #000",
                    border: "none",
                    borderBottomStyle: "dotted" as const,
                    padding: "2px 0",
                  }}
                >
                  <CI
                    value={afraidOfWater}
                    onChange={ro ? undefined : setAfraidOfWater}
                    readOnly={ro}
                    placeholder="Yes / No"
                  />
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    height: 26,
                    borderBottom: "1px dotted #000",
                    border: "none",
                    borderBottomStyle: "dotted" as const,
                    padding: "2px 0",
                  }}
                ></td>
              </tr>
            </tbody>
          </table>

          {/* ══ SECTION H — REASONS FOR ATTENDING ═══════════════════════ */}
          <SH
            letter="H"
            title="List reasons why you will like to go through the Water Baptism Classes."
          />
          <table style={T}>
            <tbody>
              {reasons.map((r, i) => (
                <tr key={i}>
                  <td style={NUM}>{i + 1}.</td>
                  <td style={{ ...CEL, height: 44, verticalAlign: "top" }}>
                    <CI
                      value={r}
                      onChange={(v) => updateReason(i, v)}
                      readOnly={ro}
                      style={{ height: "100%" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ SECTION I — OTHER INFORMATION ═══════════════════════════ */}
          <SH letter="I" title="Other Information" />
          <div
            style={{
              borderBottom: "1px dotted #000",
              minHeight: 24,
              marginBottom: 4,
              padding: "2px 0",
            }}
          >
            <CI
              value={otherInfoText}
              onChange={ro ? undefined : setOtherInfoText}
              readOnly={ro}
              style={{ width: "100%" }}
            />
          </div>

          {/* ══ SECTION J — SIGNATURE + DATE ════════════════════════════ */}
          <div
            style={{
              fontWeight: 700,
              fontSize: 12,
              marginTop: 20,
              marginBottom: 6,
            }}
          >
            J:
          </div>
          <table style={{ ...T, marginBottom: 20 }}>
            <tbody>
              <tr>
                <td
                  style={{
                    width: "65%",
                    paddingBottom: 4,
                    verticalAlign: "bottom",
                  }}
                >
                  <div
                    style={{ borderBottom: "1px solid #000", minHeight: 32 }}
                  ></div>
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 11,
                      marginTop: 2,
                      fontWeight: 700,
                    }}
                  >
                    SIGNATURE
                  </div>
                </td>
                <td style={{ width: 20 }}></td>
                <td style={{ paddingBottom: 4, verticalAlign: "bottom" }}>
                  <div
                    style={{ borderBottom: "1px solid #000", minHeight: 32 }}
                  ></div>
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 11,
                      marginTop: 2,
                      fontWeight: 700,
                    }}
                  >
                    DATE
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ══ SECTION K — OFFICIAL REMARKS ════════════════════════════ */}
          <SH letter="K" title="Official Remarks" />
          <div
            style={{
              border: "1px solid #000",
              minHeight: 80,
              padding: "6px 8px",
              marginBottom: 16,
            }}
          >
            {mode === "view" ? (
              <textarea
                value={officialRemarks}
                onChange={(e) => setOfficialRemarks(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  width: "100%",
                  minHeight: 68,
                  fontSize: 12,
                  fontFamily: "Times New Roman, serif",
                  color: "#000",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            ) : mode === "fill" ? (
              <textarea
                value={officialRemarks}
                onChange={(e) => setOfficialRemarks(e.target.value)}
                placeholder="Official remarks (not submitted to system)"
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  width: "100%",
                  minHeight: 68,
                  fontSize: 12,
                  fontFamily: "Times New Roman, serif",
                  color: "#000",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: 12,
                  fontFamily: "Times New Roman, serif",
                  minHeight: 68,
                  color: "#000",
                  whiteSpace: "pre-wrap",
                }}
              >
                {officialRemarks}
              </div>
            )}
          </div>

          {/* ══ BOTTOM APPROVAL SECTION ══════════════════════════════════ */}
          <div
            style={{
              fontWeight: 700,
              fontSize: 12,
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            APPROVED AS FOLLOWS:
          </div>
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontFamily: "Times New Roman, serif",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  fontWeight: 700,
                }}
              >
                TO ATTEND NEW CONVERT CLASS:
              </span>
              <div
                style={{
                  flex: 1,
                  borderBottom: "1px dotted #000",
                  minHeight: 20,
                  padding: "0 4px",
                }}
              >
                <CI
                  value={approveNewConvert}
                  onChange={ro ? undefined : setApproveNewConvert}
                  readOnly={ro}
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "Times New Roman, serif",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  fontWeight: 700,
                }}
              >
                ATTEND BAPTISM CLASS:
              </span>
              <div
                style={{
                  flex: 1,
                  borderBottom: "1px dotted #000",
                  minHeight: 20,
                  padding: "0 4px",
                }}
              >
                <CI
                  value={approveBaptism}
                  onChange={ro ? undefined : setApproveBaptism}
                  readOnly={ro}
                />
              </div>
            </div>
          </div>

          {/* Page 2 number */}
          <div style={{ textAlign: "center", fontSize: 11, marginTop: 16 }}>
            2
          </div>
        </div>
        {/* end page 2 */}
      </div>
      {/* end wrapper */}
    </>
  );
}
