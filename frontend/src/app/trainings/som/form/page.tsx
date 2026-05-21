"use client";

/**
 * /trainings/som/form
 *
 * ?mode=blank          → blank read-only form for printing
 * ?mode=view&id=[id]   → view / print a submitted record (client-side fetch)
 * (default)            → fill mode — editable + submit
 */

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SomFormCore from "@/components/trainings/SomFormCore";
import { getSchoolOfMinistry, type SchoolOfMinistryFullResponse } from "@/lib/api";
import { RefreshCw } from "lucide-react";

function SomFormViewLoader({ id }: { id: string }) {
  const [record, setRecord] = useState<SchoolOfMinistryFullResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getSchoolOfMinistry(id)
      .then((data) => { if (!cancelled) { setRecord(data); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : "Failed to load record."); setLoading(false); } });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: 10, fontFamily: "Arial, sans-serif", fontSize: 14, color: "#6B7280" }}>
      <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} />
      Loading record…
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", fontFamily: "Arial, sans-serif", fontSize: 14, color: "#991B1B" }}>{error}</div>
  );
  if (!record) return null;
  return <SomFormCore mode="view" initialData={record} />;
}

function SomFormInner() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const id   = searchParams.get("id");

  if (mode === "blank") return <SomFormCore mode="blank" />;
  if (mode === "view" && id) return <SomFormViewLoader id={id} />;
  return <SomFormCore mode="fill" />;
}

export default function SchoolOfMinistryFormPage() {
  return (
    <Suspense fallback={null}>
      <SomFormInner />
    </Suspense>
  );
}
