"use client";

/**
 * /trainings/workers/form
 *
 * ?mode=blank → blank read-only form for printing
 * (default)   → fill mode — editable + submit
 */

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import WorkersFormCore from "@/components/trainings/WorkersFormCore";

function WorkersFormInner() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "blank" ? "blank" : "fill";
  return <WorkersFormCore mode={mode} />;
}

export default function WorkersInTrainingFormPage() {
  return (
    <Suspense fallback={null}>
      <WorkersFormInner />
    </Suspense>
  );
}
