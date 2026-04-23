"use client";

import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import DetailHero from "@/components/ui/DetailHero";
import DetailSection from "@/components/ui/DetailSection";
import { members } from "@/lib/mock-data";

export default function PageClient({ id }: { id: string }) {
  const router = useRouter();
  const m = members.find((x) => x.id === id);

  if (!m) {
    return (
      <AppShell title="Member" showBack>
        <p className="mt-10 text-center text-sm text-[#6B7280]">Member not found.</p>
      </AppShell>
    );
  }

  const fullName = [m.firstName, m.middleName, m.lastName].filter(Boolean).join(" ");

  return (
    <AppShell title="Member" showBack>
      <DetailHero
        name={fullName}
        avatar={m.avatar}
        subtitle={m.department || "Member"}
        badge={m.status === "inactive" ? "Inactive" : "Active"}
        phone={m.phone}
        email={m.email}
        onEdit={() => router.push(`/members/add?id=${m.id}`)}
      />

      <DetailSection
        title="Personal"
        rows={[
          { label: "First name", value: m.firstName },
          { label: "Middle name", value: m.middleName },
          { label: "Last name", value: m.lastName },
          { label: "Marital status", value: m.maritalStatus },
          { label: "Spouse", value: m.spouse?.name },
          { label: "Wedding date", value: m.spouse?.weddingDate },
        ]}
      />

      <DetailSection
        title="Contact"
        rows={[
          { label: "Email", value: m.email },
          { label: "Phone", value: `${m.countryCode || ""} ${m.phone}`.trim() },
          { label: "Department", value: m.department },
        ]}
      />
    </AppShell>
  );
}
