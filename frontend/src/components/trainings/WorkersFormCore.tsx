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

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Printer, Send, CheckCircle } from "lucide-react";
import {
  createWorkerInTraining,
  searchWorkersInTraining,
  searchAllMembers,
  uploadProfilePicture,
  getStoredUser,
  type WorkersInTrainingFullResponse,
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
  userId,
}: {
  mode: WitMode;
  userId?: string;
  initialData?: WorkersInTrainingFullResponse;
}) {
  const ro = mode !== "fill";
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);

  /* ── Set / cohort ─────────────────────────────────────────────────────── */
  const currentYear = new Date().getFullYear();
  const setYears = Array.from({ length: 8 }, (_, i) => String(currentYear - 5 + i));
  const [set, setSet] = useState(initialData?.set ?? String(currentYear));

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
  const [homeAddr,   setHomeAddr]   = useState(initialData?.street   ?? "");
  const [homeCity,   setHomeCity]   = useState(initialData?.city     ?? "");
  const [homeState,  setHomeState]  = useState(initialData?.state    ?? "");
  const [homeCountry,setHomeCountry]= useState(initialData?.country  ?? "");
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
  const [quals, setQuals] = useState(() => {
    const fromData = (initialData?.qualifications ?? []).map((q) => ({
      institution: q.institution ?? "",
      dates:       q.date        ?? "",
      qualification: q.qualificationReceived ?? "",
    }));
    // Pad to 4 rows minimum
    while (fromData.length < 4) fromData.push({ institution: "", dates: "", qualification: "" });
    return fromData.slice(0, 4);
  });
  const updateQual = (i: number, f: keyof (typeof quals)[0], v: string) =>
    setQuals((prev) => prev.map((q, idx) => (idx === i ? { ...q, [f]: v } : q)));

  /* ── D. Christian History ─────────────────────────────────────────────  */
  const [salvDate,    setSalvDate]    = useState(fmtDisplayDate(initialData?.salvationDate));
  const [salvWhere,   setSalvWhere]   = useState(initialData?.salvationLocation ?? "");
  const [waterDate,   setWaterDate]   = useState(fmtDisplayDate(initialData?.waterBaptismDate));
  const [waterChurch, setWaterChurch] = useState(initialData?.waterBaptismLocation ?? "");
  const [hgDate,      setHgDate]      = useState(fmtDisplayDate(initialData?.holySpiritBaptismDate));
  const [hgWhere,     setHgWhere]     = useState(initialData?.holySpiritBaptismLocation ?? "");

  const [wp, setWp] = useState(() => {
    const fromData = (initialData?.pastPlaceOfWorships ?? []).map((w) => ({
      name:    w.name    ?? "",
      address: w.address ?? "",
      dates:   w.date    ?? "",
    }));
    while (fromData.length < 4) fromData.push({ name: "", address: "", dates: "" });
    return fromData.slice(0, 4);
  });
  const updateWp = (i: number, f: keyof (typeof wp)[0], v: string) =>
    setWp((prev) => prev.map((r, idx) => (idx === i ? { ...r, [f]: v } : r)));

  const [positions, setPositions] = useState(() => {
    const fromData = (initialData?.pastPositionHeldList ?? []).map((p) => ({
      worshipPlace: p.worshipPlace ?? "",
      positionHeld: p.positionHeld ?? "",
    }));
    while (fromData.length < 4) fromData.push({ worshipPlace: "", positionHeld: "" });
    return fromData.slice(0, 4);
  });
  const updatePos = (i: number, f: "worshipPlace" | "positionHeld", v: string) =>
    setPositions((prev) => prev.map((p, idx) => (idx === i ? { ...p, [f]: v } : p)));

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
  const [submitDebug,   setSubmitDebug]   = useState("");

  /* ── Photo handler ───────────────────────────────────────────────────── */
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  /* ── Submit ──────────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    // Accept any phone entered anywhere on the form as the primary contact number.
    // The "Phone:" field is in Section B (Addresses), but users often fill the
    // Next-of-Kin phone first — we use whichever phone is available.
    const effectivePhone = homePhone.trim() || mobile.trim() || nokPhone.trim();
    if (!firstName.trim() || !surname.trim() || !effectivePhone) {
      setSubmitError("First Name, Surname, and at least one Phone Number are required. (Fill the Phone field in Section B — Addresses — or the Mobile / Next-of-Kin phone.)");
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

      // Normalise phone: strip all non-digit characters, then remove a leading
      // "0" when a country code is present (Nigerian local numbers start with 0
      // but the backend expects the number without it, e.g. 8012345678 not 08012345678).
      const normalisePhone = (raw: string) => {
        let n = raw.trim().replace(/\D/g, "");
        if (n.startsWith("0")) n = n.slice(1);
        return n;
      };

      const qualItems = quals
        .filter((q) => q.institution.trim())
        .map((q) => ({ institution: q.institution, date: q.dates || undefined, qualificationReceived: q.qualification || undefined }));

      const wpItems = wp
        .filter((r) => r.name.trim())
        .map((r) => ({ name: r.name, address: r.address || undefined, date: r.dates || undefined }));

      const phItems = positions
        .filter((p) => p.positionHeld.trim() || p.worshipPlace.trim())
        .map((p) => ({
          worshipPlace: p.worshipPlace.trim() || undefined,
          positionHeld: p.positionHeld.trim() || undefined,
        }));

      const nonRccg = [group1, group2].filter(Boolean);

      // The backend requires a valid member userId. Resolution order:
      // 1. Explicit ?userId= URL param (set when admin navigates from a member profile)
      // 2. Search the members directory by the submitted phone number
      // 3. Search by first + last name as a fallback
      // 4. Admin's own stored ID as a last resort (may still fail if backend
      //    validates that the userId belongs to a MEMBER-type account)
      let effectiveUserId: string | undefined = userId || undefined;
      if (!effectiveUserId) {
        try {
          const normPhone = normalisePhone(effectivePhone);
          const byPhone = await searchAllMembers(normPhone, 0, 5);
          const phoneMatch = byPhone.content?.find(
            (m) => normalisePhone(m.phoneNumber ?? "") === normPhone,
          ) ?? byPhone.content?.[0];
          if (phoneMatch?.id) {
            effectiveUserId = phoneMatch.id;
          } else {
            // Try searching by full name
            const byName = await searchAllMembers(
              `${firstName.trim()} ${surname.trim()}`, 0, 5,
            );
            const nameMatch = byName.content?.find(
              (m) =>
                m.firstName?.toLowerCase() === firstName.trim().toLowerCase() &&
                m.lastName?.toLowerCase() === surname.trim().toLowerCase(),
            ) ?? byName.content?.[0];
            if (nameMatch?.id) {
              effectiveUserId = nameMatch.id;
            }
          }
        } catch {
          // member search failed — fall through to admin-id fallback
        }
        if (!effectiveUserId) {
          effectiveUserId = getStoredUser()?.id || undefined;
        }
      }

      const body = {
        userId:            effectiveUserId,
        set:               set.trim() || undefined,
        profilePictureUrl,
        firstName:         firstName.trim(),
        middleName:        otherNames.trim()  || undefined,
        lastName:          surname.trim(),
        maidenName:        maidenName.trim()  || undefined,
        countryCode:       "234",
        phoneNumber:       normalisePhone(effectivePhone),
        otherPhoneNumber:  mobile.trim() && mobile.trim() !== effectivePhone ? normalisePhone(mobile) : undefined,
        email:             email.trim()       || undefined,
        sex:               sexNorm as string | undefined,
        dateOfBirth:       safeDate(dob),
        maritalStatus:     marital ? (maritalMap[marital] ?? marital.toUpperCase()) : undefined,
        spouseName:        spouseName.trim()  || undefined,
        noOfChildren:      numChildren.trim() ? Number(numChildren.trim()) : undefined,
        nextOfKinName:         nokName.trim() || undefined,
        nextOfKinRelationship: nokRel.trim()  || undefined,
        nextOfKinPhoneNumber:  nokPhone.trim() ? normalisePhone(nokPhone) : undefined,
        nextOfKinFullAddress:  nokAddr.trim() || undefined,
        street:            homeAddr.trim()    || undefined,
        city:              homeCity.trim()    || undefined,
        state:             homeState.trim()   || undefined,
        country:           homeCountry.trim() || undefined,
        occupation:        occupation.trim()  || undefined,
        employer:          employer.trim()    || undefined,
        officeFullAddress: officeAddr.trim()  || undefined,
        officePhoneNumber: officePhone.trim() ? normalisePhone(officePhone) : undefined,
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
      };

      // Log the full request body so any field issues are visible in the browser
      // console (F12 → Console) before the request is sent.
      console.log("[WIT] createWorkerInTraining request body:", body);

      const created = await createWorkerInTraining(body);

      // Log the full response so the backend response structure is visible.
      console.log("[WIT] createWorkerInTraining response:", created);

      const raw         = created as unknown as Record<string, unknown>;
      const createdId   = raw?.id   as string | undefined;
      const createdMsg  = raw?.message as string | undefined;

      // If the backend didn't return an id, immediately search by name to find
      // out whether the record was actually persisted (helps diagnose pending-
      // approval vs. silent failure scenarios).
      let debugLine = `POST response: ${JSON.stringify(created)}`;
      if (!createdId) {
        try {
          const searchRes = await searchWorkersInTraining(
            `${firstName.trim()} ${surname.trim()}`, 0, 10,
          );
          console.log("[WIT] post-submit search result:", searchRes);
          const found = searchRes.totalElements ?? 0;
          debugLine += ` | Search by name found ${found} record(s): ${JSON.stringify(searchRes.content?.map(r => r.id))}`;
        } catch (searchErr) {
          debugLine += ` | Search failed: ${searchErr}`;
        }
      }
      setSubmitDebug(debugLine);

      // apiFetch throws on any non-2xx status, so reaching here means the
      // backend accepted the request.
      setSubmitSuccess(true);
      setSubmitError("");
      // router.refresh() busts the Next.js Router Cache so the list page
      // remounts and re-fetches data instead of serving a stale cached version.
      // Delay is longer so the debug info is readable before navigating.
      setTimeout(() => { router.refresh(); router.push("/trainings/workers"); }, createdId ? 1500 : 6000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit. Please try again.";
      setSubmitError(`${msg} (Open browser console — F12 → Console — for the full server error.)`);
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
          .wit-no-print       { display: none !important; }
          .wit-print-only     { display: flex !important; }
          .wit-wrapper        { background: #fff !important; padding: 0 !important; }
          .wit-paper          { box-shadow: none !important; width: 100% !important; max-width: none !important;
                                margin: 0 !important; padding: 0 !important; }
          .wit-p2             { page-break-before: always; break-before: page; }
          .wit-p3             { page-break-before: always; break-before: page; }
        }
        .wit-print-only { display: none; }
        .wit-ci:focus { background: #eef2ff !important; }
        .wit-ci[readonly] { cursor: default; }
      `}</style>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="wit-no-print" style={{
        position: "sticky", top: 0, zIndex: 50, background: "#000080",
        padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "Arial, sans-serif" }}>
          Workers Registration Form
        </span>

        {/* Set year selector — shown in fill and view modes */}
        {mode !== "blank" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Arial, sans-serif", whiteSpace: "nowrap" }}>
              Set:
            </label>
            <select
              value={set}
              onChange={(e) => setSet(e.target.value)}
              disabled={mode === "view"}
              style={{
                background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)",
                color: "#fff", borderRadius: 5, padding: "4px 8px",
                fontSize: 13, fontFamily: "Arial, sans-serif", cursor: mode === "view" ? "default" : "pointer",
                outline: "none", minWidth: 72,
              }}
            >
              {setYears.map((y) => (
                <option key={y} value={y} style={{ background: "#000080", color: "#fff" }}>{y}</option>
              ))}
            </select>
          </div>
        )}

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
          fontFamily: "Arial, sans-serif", fontSize: 14,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: submitDebug ? 8 : 0 }}>
            <CheckCircle size={18} color="#065F46" />
            <span style={{ color: "#065F46", fontWeight: 600 }}>Application submitted! Redirecting to list…</span>
          </div>
          {submitDebug && (
            <pre style={{
              margin: 0, fontSize: 10, color: "#065F46", background: "#A7F3D0",
              borderRadius: 4, padding: "6px 8px", whiteSpace: "pre-wrap", wordBreak: "break-all",
            }}>{submitDebug}</pre>
          )}
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

          {/* Header — logo centered above text, passport photo top-right */}
          <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 14 }}>

            {/* Left spacer — balances the photo box so the center block stays truly centred */}
            <div style={{ width: 90, flexShrink: 0 }} />

            {/* Centre: logo then church name stack */}
            <div style={{ flex: 1, textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/rccg-icon.png" alt="RCCG" style={{ width: 70, height: 70, objectFit: "contain", margin: "0 auto 6px", display: "block" }} />
              <div style={{ fontWeight: 900, fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5, lineHeight: 1.4 }}>
                The Redeemed Christian Church of God
              </div>
              <div style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", marginTop: 2 }}>
                Rose of Sharon Parish
              </div>
              <div style={{ fontWeight: 900, fontSize: 14, textTransform: "uppercase", textDecoration: "underline", marginTop: 5, letterSpacing: 0.3 }}>
                Workers Registration Form
              </div>
            </div>

            {/* Right: passport photo box */}
            <div style={{ width: 90, flexShrink: 0, marginLeft: 10 }}>
              {/* Screen — fill mode: dashed + clickable */}
              {mode === "fill" ? (
                <div
                  className="wit-no-print"
                  onClick={() => photoInputRef.current?.click()}
                  style={{
                    width: 90, height: 110, border: "2px dashed #000080",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", cursor: "pointer",
                    overflow: "hidden", background: photoPreview ? "transparent" : "#f0f4ff",
                  }}
                  title="Click to upload passport photo"
                >
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span style={{ fontSize: 8, color: "#000080", textAlign: "center", lineHeight: 1.4, marginTop: 4 }}>
                        Passport<br />Photograph<br /><span style={{ color: "#666" }}>(click)</span>
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="wit-no-print" style={{
                  width: 90, height: 110, border: "1px solid #000",
                  display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                }}>
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 9, textAlign: "center", color: "#555", lineHeight: 1.6 }}>
                      Passport<br />photograph
                    </span>
                  )}
                </div>
              )}

              {/* Print-only photo box */}
              <div className="wit-print-only" style={{
                width: 90, height: 110, border: "1px solid #000",
                alignItems: "center", justifyContent: "center", overflow: "hidden",
              }}>
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 9, textAlign: "center", color: "#555", lineHeight: 1.6 }}>
                    Passport<br />photograph
                  </span>
                )}
              </div>
            </div>

            {/* Hidden file input */}
            <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
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
                <td style={TDL}>City:</td>
                <td style={TD}><CI value={homeCity} onChange={setHomeCity} readOnly={ro} /></td>
                <td style={TDL}>State:</td>
                <td style={TD}><CI value={homeState} onChange={setHomeState} readOnly={ro} /></td>
                <td style={TDL}>Country:</td>
                <td style={TD}><CI value={homeCountry} onChange={setHomeCountry} readOnly={ro} /></td>
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
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <td style={{ ...TD, fontWeight: 700, fontSize: 10 }}>#</td>
                <td style={{ ...TD, fontWeight: 700, fontSize: 10 }}>Church / Place of Worship</td>
                <td style={{ ...TD, fontWeight: 700, fontSize: 10 }}>Position Held</td>
              </tr>
            </thead>
            <tbody>
              {positions.map((p, i) => (
                <tr key={i}>
                  <td style={{ ...TD, width: 22, fontWeight: 700 }}>{i + 1}.</td>
                  <td style={TD}>
                    <CI value={p.worshipPlace} onChange={(v) => updatePos(i, "worshipPlace", v)} readOnly={ro} />
                  </td>
                  <td style={TD}>
                    <CI value={p.positionHeld} onChange={(v) => updatePos(i, "positionHeld", v)} readOnly={ro} />
                  </td>
                </tr>
              ))}
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
