"use client";

import { useState, useEffect } from "react";
import { getEvents, type EventResponse } from "@/lib/api";

let cached: EventResponse[] | null = null;

export function useEventServices() {
  const [services, setServices] = useState<EventResponse[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) return;
    let cancelled = false;
    setLoading(true);
    getEvents(0, 200)
      .then((res) => {
        if (cancelled) return;
        const sorted = (res.content ?? []).sort((a, b) => {
          const da = a.date ? new Date(a.date).getTime() : 0;
          const db = b.date ? new Date(b.date).getTime() : 0;
          return db - da;
        });
        cached = sorted;
        setServices(sorted);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { services, loading };
}
