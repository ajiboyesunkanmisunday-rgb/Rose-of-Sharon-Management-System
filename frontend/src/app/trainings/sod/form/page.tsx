"use client";

/**
 * /trainings/sod/form — Printable SOD Application Form
 *
 * Fill in the browser, then click "Print / Download PDF".
 * The page is laid out exactly like the physical paper form.
 * When printing, the gray background and toolbar disappear;
 * only the white paper content is output.
 */

import { useState } from "react";
import Image from "next/image";
import { Printer } from "lucide-react";

/* ─── Primitive field components ─────────────────────────────────────────── */

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

/** Single full-width row: label + expanding dotted line */
function FullRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span style={{ whiteSpace: "nowrap" }}>{label}</span>
      <F value={value} onChange={onChange} style={{ flex: 1 }} />
    </div>
  );
}

/** Two paired columns, each with label + expanding line */
function PairedRow({
  left, right,
}: {
  left:  { label: string; value: string; onChange: (v: string) => void };
  right: { label: string; value: string; onChange: (v: string) => void };
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 32 }}>
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

/* ─── Page ────────────────────────────────────────────────────────────────── */

const MARITAL = ["Single", "Married", "Engaged", "Divorced", "Widowed"];

export default function SODApplicationFormPage() {
  /* Church */
  const [session,  setSession]  = useState("");
  const [region,   setRegion]   = useState("");
  const [province, setProvince] = useState("");
  const [centre,   setCentre]   = useState("");

  /* Section A */
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

  /* Section B */
  const [inst1, setInst1] = useState("");
  const [inst2, setInst2] = useState("");
  const [inst3, setInst3] = useState("");

  return (
    <>
      {/* ── Print + screen styles ──────────────────────────────────────── */}
      <style>{`
        /* A4 page settings for print */
        @page {
          size: A4 portrait;
          margin: 15mm 18mm;
        }

        /* Hide toolbar and gray wrapper when printing */
        @media print {
          .sod-no-print { display: none !important; }
          .sod-wrapper  { background: #fff !important; padding: 0 !important; min-height: auto !important; }
          .sod-paper    { box-shadow: none !important; width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; }
        }

        /* The editable dotted-line inputs */
        .sod-f {
          border: none;
          border-bottom: 1px dotted #555;
          background: transparent;
          outline: none;
          font-size: 12px;
          font-family: Arial, sans-serif;
          color: #000;
          padding: 1px 2px 0;
          min-width: 20px;
          display: inline-block;
        }
        .sod-f:focus {
          border-bottom-color: #000080;
          background: #eef2ff;
        }
        @media print {
          .sod-f { border-bottom: 1px dotted #333; background: transparent !important; }
        }
      `}</style>

      {/* ── Screen-only toolbar ────────────────────────────────────────── */}
      <div
        className="sod-no-print"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#000080", padding: "10px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        <button
          onClick={() => window.history.back()}
          style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}
        >
          ← Back
        </button>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
          SOD Application Form — Fill &amp; Print
        </span>
        <button
          onClick={() => window.print()}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#fff", color: "#000080", border: "none",
            borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >
          <Printer size={14} />
          Print / Download PDF
        </button>
      </div>

      {/* ── Page wrapper (gray on screen, white when printing) ──────────── */}
      <div
        className="sod-wrapper"
        style={{ minHeight: "100vh", background: "#b0bec5", paddingTop: 72, paddingBottom: 48 }}
      >
        {/* ── White paper ────────────────────────────────────────────────── */}
        <div
          className="sod-paper"
          style={{
            background: "#fff",
            width: 794,
            margin: "0 auto",
            padding: "52px 64px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.28)",
            fontFamily: "Arial, sans-serif",
            fontSize: 12,
            color: "#000",
            lineHeight: 1.4,
          }}
        >

          {/* ══ HEADER ════════════════════════════════════════════════════ */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>

            {/* Logo + church name block */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Image src="/sod-logo.svg" alt="School of Disciples" width={64} height={64} style={{ objectFit: "contain", flexShrink: 0 }} />
              <div style={{ textAlign: "center", lineHeight: 1.6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>The Redeemed Christian Church of God</div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Rose of Sharon Parish</div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>The School of Disciples</div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Application Form</div>
                <div style={{ fontSize: 11, marginTop: 6, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 }}>
                  <span style={{ fontWeight: 700 }}>SESSION</span>
                  <F value={session} onChange={setSession} style={{ width: 110 }} />
                </div>
              </div>
            </div>

            {/* Passport photo box */}
            <div style={{
              width: 88, height: 108,
              border: "1px solid #000",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 9, textAlign: "center", color: "#666", lineHeight: 1.5 }}>
                Passport<br />Photograph
              </span>
            </div>
          </div>

          {/* ══ REGION / PROVINCE / CENTRE ════════════════════════════════ */}
          <table style={{ borderCollapse: "collapse", marginBottom: 22 }}>
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
                  <td style={{ border: "1px solid #000", padding: "2px 8px", width: 230 }}>
                    <F value={val} onChange={set} style={{ width: "100%" }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ══ SECTION A ═════════════════════════════════════════════════ */}
          <div style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", marginBottom: 14, letterSpacing: 0.5 }}>
            A.&nbsp;&nbsp;Personal Information
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>

            {/* 1. Name */}
            <div>
              <div style={{ marginBottom: 6 }}>1.&nbsp;&nbsp;Name:</div>
              <div style={{ display: "flex", gap: 16, paddingLeft: 20 }}>
                {(
                  [
                    ["Surname",    surname,    setSurname],
                    ["First Name", firstName,  setFirstName],
                    ["Middle Name",middleName,  setMiddleName],
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

            {/* 8. Marital Status checkboxes */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
              <span>8.&nbsp;&nbsp;Marital status:</span>
              {MARITAL.map((m) => (
                <label key={m} style={{ display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 12 }}>
                  <input
                    type="checkbox"
                    checked={marital === m}
                    onChange={() => setMarital(marital === m ? "" : m)}
                    style={{ width: 13, height: 13, accentColor: "#000080", cursor: "pointer" }}
                  />
                  {m}
                </label>
              ))}
            </div>

            {/* 9. Spouse */}
            <PairedRow
              left={{ label: "9.&nbsp;&nbsp;Spouse Name:", value: spouseName, onChange: setSpouseName }}
              right={{ label: "Spouse Phone Number:", value: spousePhone, onChange: setSpousePhone }}
            />

            {/* 10. Spouse occupation & children */}
            <PairedRow
              left={{ label: "10. Spouse's Occupation:", value: spouseOcc, onChange: setSpouseOcc }}
              right={{ label: "Number of Children:", value: numChildren, onChange: setNumChildren }}
            />
          </div>

          {/* ══ SECTION B ═════════════════════════════════════════════════ */}
          <div style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", marginTop: 28, marginBottom: 14, letterSpacing: 0.5 }}>
            B.&nbsp;&nbsp;Educational and Professional Qualifications
          </div>

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
                  <span style={{ minWidth: 22, flexShrink: 0 }}>{roman}</span>
                  <F value={val} onChange={set} style={{ flex: 1 }} />
                </div>
              ))}
            </div>
          </div>

        </div>{/* end .sod-paper */}
      </div>{/* end .sod-wrapper */}
    </>
  );
}
