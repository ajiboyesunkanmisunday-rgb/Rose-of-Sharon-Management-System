"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { groups } from "@/lib/mock-data";

type Tab = "members" | "meetings";

const mockMembers = [
  { id: "m1", name: "John Michael", role: "Member", joinedDate: "01/15/2025" },
  { id: "m2", name: "Sarah Bamidele", role: "Assistant Lead", joinedDate: "02/20/2025" },
  { id: "m3", name: "David Okonkwo", role: "Member", joinedDate: "03/10/2025" },
  { id: "m4", name: "Grace Adeyemi", role: "Secretary", joinedDate: "04/05/2025" },
  { id: "m5", name: "Emmanuel Nwosu", role: "Member", joinedDate: "05/12/2025" },
];

const mockMeetings = [
  { id: "mt1", title: "Weekly Practice", date: "04/19/2026", time: "4:00 PM" },
  { id: "mt2", title: "Planning Meeting", date: "04/22/2026", time: "6:00 PM" },
];

export default function GroupDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("members");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const group = groups.find((g) => g.id === id) || groups[0];

  const handleDelete = () => {
    console.log("Delete group:", group.id);
    setShowDeleteModal(false);
    router.push("/settings/groups");
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "members", label: `Members (${group.membersCount})` },
    { key: "meetings", label: "Meetings" },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        subtitle={group.name}
        backHref="/settings/groups"
      />

      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <h2 className="text-xl font-bold text-[#111827]">{group.name}</h2>
        <p className="mt-1 text-sm text-[#6B7280]">{group.description}</p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Leader</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{group.leader}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Members</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{group.membersCount}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-8 border-b border-[#E5E7EB]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === t.key
                ? "border-b-2 border-[#000080] text-[#000080]"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "members" && (
        <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#F3F4F6]">
                <th className="px-4 py-3 text-sm font-bold text-[#000080]">Name</th>
                <th className="px-4 py-3 text-sm font-bold text-[#000080]">Role</th>
                <th className="px-4 py-3 text-sm font-bold text-[#000080]">Joined</th>
              </tr>
            </thead>
            <tbody>
              {mockMembers.map((m) => (
                <tr key={m.id} className="border-b border-[#F3F4F6]">
                  <td className="px-4 py-3 font-medium text-[#111827]">{m.name}</td>
                  <td className="px-4 py-3 text-[#374151]">{m.role}</td>
                  <td className="px-4 py-3 text-[#374151]">{m.joinedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "meetings" && (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
          <ul className="space-y-3">
            {mockMeetings.map((mt) => (
              <li key={mt.id} className="flex items-center justify-between border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">{mt.title}</p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">{mt.date} · {mt.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/settings/groups")}>
          Back
        </Button>
        <Button variant="primary" onClick={() => router.push(`/settings/groups/${id}/edit`)}>
          Edit
        </Button>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Delete
        </Button>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this group?"
      />
    </DashboardLayout>
  );
}
