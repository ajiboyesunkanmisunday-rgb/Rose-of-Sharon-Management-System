"use client";

/**
 * /trainings/sod/form/[id]
 *
 * View mode — fetches a single SoD record and renders it read-only.
 */

import { useState, useEffect, use } from "react";
import { getSchoolOfDisciple, type SchoolOfDisciplesResponse } from "@/lib/api";
import SodFormCore from "@/components/trainings/SodFormCore";
import { RefreshCw } from "lucide-react";

export default function SodViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [record, setRecord] = useState<SchoolOfDisciplesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getSchoolOfDisciple(id)
      .then((data) => {
        if (!cancelled) {
          setRecord(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load record.");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "60vh", gap: 10, fontFamily: "Arial, sans-serif",
        fontSize: 14, color: "#6B7280",
      }}>
        <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} />
        Loading record…
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "60vh", fontFamily: "Arial, sans-serif", fontSize: 14, color: "#991B1B",
      }}>
        {error}
      </div>
    );
  }

  if (!record) return null;

  return <SodFormCore mode="view" initialData={record} />;
}
