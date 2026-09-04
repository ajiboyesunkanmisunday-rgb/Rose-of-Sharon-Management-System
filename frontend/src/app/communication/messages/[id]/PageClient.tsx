"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import { getSentMessages, getScheduledMessages, type MessageResponse } from "@/lib/api";

const statusColors: Record<string, string> = {
  Delivered: "bg-green-100 text-green-800",
  Sent: "bg-green-100 text-green-800",
  Scheduled: "bg-yellow-100 text-yellow-800",
  Failed: "bg-red-100 text-red-800",
};

const typeColors: Record<string, string> = {
  SMS: "bg-[#000080] text-white",
  Email: "bg-[#B5B5F3] text-[#000080] dark:text-indigo-400",
};

function parseDate(isoString?: string): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  } catch {
    return "—";
  }
}

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

  const [message, setMessage] = useState<MessageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messageStatus, setMessageStatus] = useState("Sent");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      getSentMessages(0, 200),
      getScheduledMessages(0, 200),
    ])
      .then(([sent, scheduled]) => {
        const allSent = sent.content ?? [];
        const allScheduled = scheduled.content ?? [];

        const foundInSent = allSent.find((m) => m.id === id);
        if (foundInSent) {
          setMessage(foundInSent);
          setMessageStatus(foundInSent.success ? "Sent" : "Failed");
          return;
        }
        const foundInScheduled = allScheduled.find((m) => m.id === id);
        if (foundInScheduled) {
          setMessage(foundInScheduled);
          setMessageStatus("Scheduled");
          return;
        }
        setError("Message not found.");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load message."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = () => {
    setShowDeleteModal(false);
    router.push("/communication/messages");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageHeader title="Communication" subtitle="Message Details" backHref="/communication/messages" />
        <div className="flex h-32 items-center justify-center text-sm text-gray-400 dark:text-slate-500">Loading…</div>
      </DashboardLayout>
    );
  }

  if (error || !message) {
    return (
      <DashboardLayout>
        <PageHeader title="Communication" subtitle="Message Details" backHref="/communication/messages" />
        <div className="flex h-32 items-center justify-center">
          <p className="text-sm text-gray-400 dark:text-slate-500">{error || "Message not found."}</p>
        </div>
      </DashboardLayout>
    );
  }

  const msgType = message.channel === "EMAIL" ? "Email" : "SMS";

  return (
    <DashboardLayout>
      <PageHeader title="Communication" subtitle="Message Details" backHref="/communication/messages" />

      <div className="mb-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${typeColors[msgType]}`}>
            {msgType}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[messageStatus] ?? "bg-gray-100 dark:bg-slate-700 text-gray-700"}`}>
            {messageStatus}
          </span>
        </div>

        {message.subject && (
          <h2 className="mt-3 text-xl font-bold text-[#111827] dark:text-slate-100">{message.subject}</h2>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">Recipient</p>
            <p className="mt-1 text-sm font-medium text-[#111827] dark:text-slate-100">{message.receiver}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">Date Sent</p>
            <p className="mt-1 text-sm font-medium text-[#111827] dark:text-slate-100">{parseDate(message.timeSent || message.createdOn)}</p>
          </div>
          {message.receiverId && (
            <div>
              <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">Recipient ID</p>
              <p className="mt-1 text-sm text-[#374151] dark:text-slate-300">{message.receiverId}</p>
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-[#F3F4F6] pt-4">
          <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">Message</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-[#374151] dark:text-slate-300">{message.content}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/communication/messages")}>
          Back
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
