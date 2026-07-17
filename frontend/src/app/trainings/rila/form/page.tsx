"use client";

/**
 * /trainings/rila/form
 *
 * ?mode=blank   → blank read-only form for printing
 * (default)     → fill mode — editable + submit
 */

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RilaFormCore from "@/components/trainings/RilaFormCore";

function RilaFormInner() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  if (mode === "blank") return <RilaFormCore mode="blank" />;
  return <RilaFormCore mode="fill" />;
}

export default function RilaFormPage() {
  return (
    <Suspense fallback={null}>
      <RilaFormInner />
    </Suspense>
  );
}
