"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { updateRilaSponsor } from "@/lib/api";

const FONT = "Arial, Helvetica, sans-serif";

function RilaSponsorInner() {
  const searchParams = useSearchParams();
  const rilaId = searchParams.get("id") ?? "";

  const [name,      setName]      = useState("");
  const [address,   setAddress]   = useState("");
  const [phone,     setPhone]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,     setError]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!rilaId) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: FONT }}>
        <p style={{ color: "#DC2626", fontSize: 14 }}>Invalid link — no application ID found.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !phone.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await updateRilaSponsor(rilaId, { name: name.trim(), address: address.trim(), phoneNumber: phone.trim() });
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
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111", textAlign: "center" }}>Sponsorship Confirmed</h2>
        <p style={{ color: "#555", textAlign: "center", maxWidth: 360, fontSize: 14 }}>
          Thank you for sponsoring this RILA applicant. Your details have been recorded.
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
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111", margin: 0 }}>RILA Sponsor Form</h1>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 6 }}>
            You have been invited to fill the sponsorship section of a RILA application.
          </p>
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#DC2626", marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Full Name *</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Sponsor's full name" required />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Address *</label>
            <textarea
              style={{ ...inputStyle, resize: "none" }}
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Sponsor's full address"
              required
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Phone Number *</label>
            <input style={inputStyle} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 08012345678" required />
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
            {submitting ? "Submitting…" : "Submit Sponsorship"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RilaSponsorPage() {
  return (
    <Suspense fallback={null}>
      <RilaSponsorInner />
    </Suspense>
  );
}
