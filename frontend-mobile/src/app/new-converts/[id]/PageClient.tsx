"use client";

import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import DetailHero from "@/components/ui/DetailHero";
import DetailSection from "@/components/ui/DetailSection";
import { newConverts } from "@/lib/mock-data";

export default function PageClient({ id }: { id: string }) {
  const router = useRouter();
  const nc = newConverts.find((x) => x.id === id);

  if (!nc) {
    return (
      <AppShell title="New Convert" showBack>
        <p className="mt-10 text-center text-sm text-[#6B7280]">New convert not found.</p>
      </AppShell>
    );
  }

  const address = [nc.addressStreet, nc.addressCity, nc.addressState, nc.addressCountry]
    .filter(Boolean)
    .join(", ");

  return (
    <AppShell title="New Convert" showBack>
      <DetailHero
        name={nc.name}
        subtitle={nc.serviceAttended}
        badge={nc.believersClass || "Not started"}
        phone={nc.phone}
        email={nc.email}
        onEdit={() => router.push(`/new-converts/add?id=${nc.id}`)}
      />

      <DetailSection
        title="Personal"
        rows={[
          { label: "First name", value: nc.firstName },
          { label: "Last name", value: nc.lastName },
          { label: "Gender", value: nc.gender },
        ]}
      />

      <DetailSection
        title="Contact"
        rows={[
          { label: "Email", value: nc.email },
          { label: "Phone", value: `${nc.countryCode || ""} ${nc.phone}`.trim() },
          { label: "Address", value: address || undefined },
        ]}
      />

      <DetailSection
        title="Believer's Class"
        rows={[
          { label: "Current class", value: nc.believersClass || "Not started" },
          {
            label: "Attendance",
            value: nc.classAttendance
              ? `${nc.classAttendance.filter(Boolean).length} / ${nc.classAttendance.length}`
              : undefined,
          },
        ]}
      />

      <DetailSection
        title="Follow-up"
        rows={[
          { label: "Service attended", value: nc.serviceAttended },
          { label: "Assigned officer", value: nc.assignedFollowUp },
          { label: "Date", value: nc.date },
          { label: "Calls made", value: String(nc.calls) },
          { label: "Visits made", value: String(nc.visits) },
        ]}
      />
    </AppShell>
  );
}
