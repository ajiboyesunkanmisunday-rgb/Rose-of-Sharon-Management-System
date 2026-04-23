"use client";

import Link from "next/link";
import AppShell from "@/components/shell/AppShell";
import Avatar from "@/components/ui/Avatar";
import { profileDetails } from "@/lib/mock-data";
import {
  Mail,
  Phone,
  MapPin,
  Cake,
  Briefcase,
  Users as UsersIcon,
  CalendarDays,
  Pencil,
  KeyRound,
  ChevronRight,
} from "lucide-react";

export default function ProfilePage() {
  const p = profileDetails;
  const fullName = `${p.firstName} ${p.lastName}`;

  const contactRows = [
    { icon: Mail, label: "Email", value: p.email },
    { icon: Phone, label: "Phone", value: p.phoneNumber },
    { icon: Phone, label: "WhatsApp", value: p.whatsappNumber },
    { icon: MapPin, label: "Address", value: p.address },
  ];

  const bioRows = [
    { icon: Cake, label: "Date of Birth", value: p.dateOfBirth },
    { icon: UsersIcon, label: "Gender", value: p.gender },
    { icon: Briefcase, label: "Occupation", value: p.occupation },
    { icon: UsersIcon, label: "Marital Status", value: p.maritalStatus },
  ];

  const groupRows = [
    { icon: UsersIcon, label: "Group", value: p.group },
    { icon: CalendarDays, label: "Date Joined", value: p.dateJoined },
  ];

  return (
    <AppShell title="Profile" showBack>
      <div className="flex flex-col items-center rounded-2xl bg-gradient-to-b from-[#000080] to-[#1a1aa6] p-6 text-white">
        <Avatar name={fullName} size={88} />
        <p className="mt-3 text-base font-semibold">{fullName}</p>
        <p className="text-xs text-[#B5B5F3]">{p.email}</p>
        <div className="mt-4 flex w-full gap-2">
          <Link
            href="/profile/edit"
            className="press flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/15 py-2.5 text-xs font-semibold text-white ring-1 ring-white/20"
          >
            <Pencil size={14} /> Edit Profile
          </Link>
          <Link
            href="/profile/change-password"
            className="press flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-semibold text-[#000080]"
          >
            <KeyRound size={14} /> Password
          </Link>
        </div>
      </div>

      <Section title="Bio">{bioRows.map((r) => <InfoRow key={r.label} {...r} />)}</Section>
      <Section title="Contact">{contactRows.map((r) => <InfoRow key={r.label} {...r} />)}</Section>
      <Section title="Group">
        {groupRows.map((r) => <InfoRow key={r.label} {...r} />)}
      </Section>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
        {title}
      </p>
      <ul className="divide-y divide-[#F1F2F7] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        {children}
      </ul>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F3F4FF] text-[#000080]">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-[#6B7280]">{label}</p>
        <p className="truncate text-sm font-medium text-[#0F172A]">{value || "—"}</p>
      </div>
      <ChevronRight size={16} className="text-[#D1D5DB]" />
    </li>
  );
}
