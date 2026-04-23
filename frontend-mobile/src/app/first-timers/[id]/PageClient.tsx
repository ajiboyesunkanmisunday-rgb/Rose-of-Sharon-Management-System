"use client";

import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import DetailHero from "@/components/ui/DetailHero";
import DetailSection from "@/components/ui/DetailSection";
import { firstTimers } from "@/lib/mock-data";

export default function PageClient({ id }: { id: string }) {
  const router = useRouter();
  const ft = firstTimers.find((x) => x.id === id);

  if (!ft) {
    return (
      <AppShell title="First Timer" showBack>
        <p className="mt-10 text-center text-sm text-[#6B7280]">First timer not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="First Timer" showBack>
      <DetailHero
        name={ft.name}
        avatar={ft.avatar}
        subtitle={ft.serviceAttended}
        badge={`Visit ${ft.date}`}
        phone={ft.phone}
        email={ft.email}
        onEdit={() => router.push(`/first-timers/add?id=${ft.id}`)}
      />

      <DetailSection
        title="Personal"
        rows={[
          { label: "First name", value: ft.firstName },
          { label: "Last name", value: ft.lastName },
          { label: "Gender", value: ft.gender },
          { label: "Marital status", value: ft.maritalStatus },
        ]}
      />

      <DetailSection
        title="Contact"
        rows={[
          { label: "Email", value: ft.email },
          { label: "Phone", value: `${ft.countryCode || ""} ${ft.phone}`.trim() },
        ]}
      />

      <DetailSection
        title="Follow-up"
        rows={[
          { label: "Service attended", value: ft.serviceAttended },
          { label: "Assigned officer", value: ft.assignedFollowUp },
          { label: "Visit date", value: ft.date },
          { label: "Calls made", value: String(ft.calls) },
          { label: "Visits made", value: String(ft.visits) },
          {
            label: "Worshipped online before",
            value: ft.worshippedOnlineBefore === undefined ? undefined : ft.worshippedOnlineBefore ? "Yes" : "No",
          },
        ]}
      />
    </AppShell>
  );
}
