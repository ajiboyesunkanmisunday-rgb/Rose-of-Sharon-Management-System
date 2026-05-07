"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Celebration workflow has been removed (only PENDING/TREATED statuses —
// managed directly in the Celebrations module instead).
export default function CelebrationWorkflowRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/celebrations");
  }, [router]);
  return null;
}
