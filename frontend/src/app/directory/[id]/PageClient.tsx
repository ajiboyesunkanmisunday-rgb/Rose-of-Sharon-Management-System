"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { directoryContacts } from "@/lib/mock-data";

export default function DirectoryDetailClient() {
  const router = useRouter();
  const params = useParams();
  const paramId = params.id as string;
  const [id, setId] = useState(paramId);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 1] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const contact = directoryContacts.find((c) => c.id === id) || directoryContacts[0];

  const handleDelete = () => {
    console.log("Delete contact:", contact.id);
    setShowDeleteModal(false);
    router.push("/directory");
  };

  const details = [
    { label: "Full Name", value: contact.name },
    { label: "Role / Title", value: contact.role },
    { label: "Group", value: contact.group },
    { label: "Department", value: contact.department || "—" },
    { label: "Phone", value: contact.phone },
    { label: "Email", value: contact.email },
    { label: "Address", value: contact.address || "—" },
    { label: "Joined Date", value: contact.joinedDate || "—" },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Church Directory"
        subtitle="Contact Profile"
        backHref="/directory"
      />

      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-xl bg-[#E5E7EB]">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-[#111827]">{contact.name}</h2>
            <p className="mt-1 text-sm text-[#6B7280]">{contact.role}</p>
            <span className="mt-3 inline-block rounded-full bg-[#B5B5F3]/30 px-3 py-1 text-xs font-medium text-[#000080]">
              {contact.group}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[#F3F4F6] pt-6 md:grid-cols-2">
          {details.map((d) => (
            <div key={d.label}>
              <p className="text-xs font-medium text-[#6B7280]">{d.label}</p>
              <p className="mt-1 text-sm font-medium text-[#111827]">{d.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/directory")}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => router.push(`/directory/${id}/edit`)}
        >
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
        message="Are you sure you want to delete this contact?"
      />
    </DashboardLayout>
  );
}
