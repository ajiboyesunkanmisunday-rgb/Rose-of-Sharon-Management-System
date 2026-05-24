"use client";

/**
 * /trainings/workers/form
 *
 * ?mode=blank          → blank read-only form for printing
 * ?mode=view&id=[id]   → view / print a submitted record (client-side fetch)
 * (default)            → fill mode — editable + submit
 */

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import WorkersFormCore from "@/components/trainings/WorkersFormCore";
import { getWorkerInTraining, type WorkersInTrainingFullResponse } from "@/lib/api";
import { RefreshCw } from "lucide-react";

function WorkersFormViewLoader({ id }: { id: string }) {
  const [record, setRecord] = useState<WorkersInTrainingFullResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getWorkerInTraining(id)
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
  return <WorkersFormCore mode="view" initialData={record} />;
}

function WorkersFormInner() {
  const searchParams = useSearchParams();
  const mode   = searchParams.get("mode");
  const id     = searchParams.get("id");
  const userId = searchParams.get("userId") ?? undefined;

  if (mode === "blank") return <WorkersFormCore mode="blank" />;
  if (mode === "view" && id) return <WorkersFormViewLoader id={id} />;
  return <WorkersFormCore mode="fill" userId={userId} />;
}

export default function WorkersInTrainingFormPage() {
  return (
    <Suspense fallback={null}>
      <WorkersFormInner />
    </Suspense>
  );
}
