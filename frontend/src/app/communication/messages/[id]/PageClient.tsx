"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { messages } from "@/lib/mock-data";

const statusColors: Record<string, string> = {
  Delivered: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Failed: "bg-red-100 text-red-800",
};

const typeColors: Record<string, string> = {
  SMS: "bg-[#000080] text-white",
  Email: "bg-[#B5B5F3] text-[#000080]",
};

export default function MessageDetailClient() {
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

  const message = messages.find((m) => m.id === id) || messages[0];

  const handleDelete = () => {
    console.log("Delete message:", message.id);
    setShowDeleteModal(false);
    router.push("/communication/messages");
  };

  const handleResend = () => {
    console.log("Resend message:", message.id);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Communication"
        subtitle="Message Details"
        backHref="/communication/messages"
      />

      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${typeColors[message.type]}`}>
            {message.type}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[message.status]}`}>
            {message.status}
          </span>
        </div>

        {message.subject && (
          <h2 className="mt-3 text-xl font-bold text-[#111827]">{message.subject}</h2>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Recipient</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{message.recipient}</p>
          </div>
          {message.recipientEmail && (
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Email</p>
              <p className="mt-1 text-sm text-[#374151]">{message.recipientEmail}</p>
            </div>
          )}
          {message.recipientPhone && (
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Phone</p>
              <p className="mt-1 text-sm text-[#374151]">{message.recipientPhone}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Sent By</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{message.sentBy}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Date</p>
            <p className="mt-1 text-sm font-medium text-[#111827]">{message.date}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-[#F3F4F6] pt-4">
          <p className="text-xs font-medium text-[#6B7280]">Message</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-[#374151]">{message.content}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/communication/messages")}>
          Back
        </Button>
        <Button variant="primary" onClick={handleResend}>
          Resend
        </Button>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Delete
        </Button>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this message?"
      />
    </DashboardLayout>
  );
}
