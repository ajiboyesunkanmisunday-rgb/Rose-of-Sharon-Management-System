"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { updateRilaPastorRecommendation } from "@/lib/api";

const FONT = "Arial, Helvetica, sans-serif";

function RilaPastorInner() {
  const searchParams = useSearchParams();
  const rilaId = searchParams.get("id") ?? "";

  const [name,       setName]       = useState("");
  const [phone,      setPhone]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [submitted,  setSubmitted]  = useState(false);

  if (!rilaId) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: FONT }}>
        <p style={{ color: "#DC2626", fontSize: 14 }}>Invalid link — no application ID found.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await updateRilaPastorRecommendation(rilaId, { name: name.trim(), phoneNumber: phone.trim() });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16, fontFamily: FONT, padding: 24 }}>
        <CheckCircle size={56} color="#16A34A" />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111", textAlign: "center" }}>Pastor Attestation Submitted</h2>
        <p style={{ color: "#555", textAlign: "center", maxWidth: 360, fontSize: 14 }}>
          Thank you. Your attestation for this RILA applicant has been recorded.
        </p>
      </div>
    );
  }

  const fieldStyle: React.CSSProperties = {
    display: "flex", flexDirection: "column", gap: 6,
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 700, color: "#111",
  };
  const inputStyle: React.CSSProperties = {
    border: "1px solid #D1D5DB", borderRadius: 8, padding: "10px 12px",
    fontSize: 13, outline: "none", fontFamily: FONT, width: "100%", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: FONT }}>
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", padding: "36px 32px", width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/rila-logo.jpeg" alt="RILA" style={{ width: 64, height: 64, objectFit: "contain", marginBottom: 12 }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111", margin: 0 }}>RILA Pastor Attestation</h1>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 6 }}>
            You have been invited to provide your pastoral attestation for a RILA application.
          </p>
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#DC2626", marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Pastor&apos;s Full Name *</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Phone Number *</label>
            <input style={inputStyle} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 08012345678" required />
          </div>

          <div style={{ background: "#FEF9C3", border: "1px solid #FDE68A", borderRadius: 8, padding: "12px 14px", fontSize: 12, color: "#92400E" }}>
            By submitting this form, you attest that you know this applicant and recommend them for the RILA programme.
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "12px 0", borderRadius: 10, background: "#DC2626", color: "#fff",
              fontWeight: 700, border: "none", cursor: submitting ? "not-allowed" : "pointer",
              fontSize: 14, opacity: submitting ? 0.7 : 1, marginTop: 4,
            }}
          >
            {submitting ? "Submitting…" : "Submit Attestation"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RilaPastorPage() {
  return (
    <Suspense fallback={null}>
      <RilaPastorInner />
    </Suspense>
  );
}
