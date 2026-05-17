"use client";

/**
 * /trainings/sod/form
 *
 * ?mode=blank → blank read-only form for printing
 * (default)   → fill mode — editable + submit
 */

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SodFormCore from "@/components/trainings/SodFormCore";

function SodFormInner() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "blank" ? "blank" : "fill";
  return <SodFormCore mode={mode} />;
}

export default function SODApplicationFormPage() {
  return (
    <Suspense fallback={null}>
      <SodFormInner />
    </Suspense>
  );
}
