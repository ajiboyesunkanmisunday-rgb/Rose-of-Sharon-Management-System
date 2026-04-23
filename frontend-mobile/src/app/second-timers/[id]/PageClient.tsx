"use client";

import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import DetailHero from "@/components/ui/DetailHero";
import DetailSection from "@/components/ui/DetailSection";
import { secondTimers } from "@/lib/mock-data";

export default function PageClient({ id }: { id: string }) {
  const router = useRouter();
  const st = secondTimers.find((x) => x.id === id);

  if (!st) {
    return (
      <AppShell title="Second Timer" showBack>
        <p className="mt-10 text-center text-sm text-[#6B7280]">Second timer not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Second Timer" showBack>
      <DetailHero
        name={st.name}
        avatar={st.avatar}
        subtitle={st.serviceAttended}
        badge={`Visit ${st.date}`}
        phone={st.phone}
        email={st.email}
        onEdit={() => router.push(`/second-timers/add?id=${st.id}`)}
      />

      <DetailSection
        title="Personal"
        rows={[
          { label: "First name", value: st.firstName },
          { label: "Last name", value: st.lastName },
          { label: "Gender", value: st.gender },
          { label: "Marital status", value: st.maritalStatus },
        ]}
      />

      <DetailSection
        title="Contact"
        rows={[
          { label: "Email", value: st.email },
          { label: "Phone", value: `${st.countryCode || ""} ${st.phone}`.trim() },
        ]}
      />

      <DetailSection
        title="Follow-up"
        rows={[
          { label: "Service attended", value: st.serviceAttended },
          { label: "Assigned officer", value: st.assignedFollowUp },
          { label: "Visit date", value: st.date },
          { label: "Calls made", value: String(st.calls) },
          { label: "Visits made", value: String(st.visits) },
          {
            label: "Worshipped online before",
            value: st.worshippedOnlineBefore === undefined ? undefined : st.worshippedOnlineBefore ? "Yes" : "No",
          },
        ]}
      />
    </AppShell>
  );
}
