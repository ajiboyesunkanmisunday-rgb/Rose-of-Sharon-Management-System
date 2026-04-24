"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { prayerRequests } from "@/lib/mock-data";
import { PrayerStatus } from "@/lib/types";

interface Note {
  id: string;
  content: string;
  addedBy: string;
  date: string;
}

const statusOptions: PrayerStatus[] = ["Pending", "Assigned", "Prayed For", "Closed"];

const statusBadgeClass: Record<string, string> = {
  "Pending": "bg-yellow-100 text-yellow-800",
  "Assigned": "bg-blue-100 text-blue-800",
  "Prayed For": "bg-green-100 text-green-800",
  "Closed": "bg-gray-100 text-gray-600",
};

export default function PrayerRequestDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const request = prayerRequests.find((r) => r.id === id) ?? prayerRequests[0];
  const [status, setStatus] = useState<PrayerStatus>(request.status);
  const [assignedTo, setAssignedTo] = useState(request.assignedTo ?? "");
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const inputClass =
    "h-[42px] rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Prayer Requests</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/prayer-requests")}
            className="flex items-center text-[#000080] transition-colors hover:text-[#000066]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-[#000080]">Prayer Request Details</h2>
        </div>
      </div>

      {/* Request Details */}
      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass[status]}`}>
            {status}
          </span>
          <span className="inline-flex items-center rounded-full bg-[#B5B5F3] px-2.5 py-0.5 text-xs font-medium text-[#000080]">
            {request.category}
          </span>
          {request.isAnonymous && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              Anonymous
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {!request.isAnonymous && (
            <>
              <div>
                <p className="text-xs font-medium text-[#6B7280]">Submitted By</p>
                <p className="mt-1 text-sm text-[#111827]">{request.submittedBy}</p>
              </div>
              {request.phone && (
                <div>
                  <p className="text-xs font-medium text-[#6B7280]">Phone</p>
                  <p className="mt-1 text-sm text-[#111827]">{request.phone}</p>
                </div>
              )}
              {request.email && (
                <div>
                  <p className="text-xs font-medium text-[#6B7280]">Email</p>
                  <p className="mt-1 text-sm text-[#111827]">{request.email}</p>
                </div>
              )}
            </>
          )}
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Date Submitted</p>
            <p className="mt-1 text-sm text-[#111827]">{request.date}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-[#6B7280]">Prayer Request</p>
          <p className="mt-2 rounded-lg bg-[#F9FAFB] p-4 text-sm leading-relaxed text-[#374151]">
            {request.request}
          </p>
        </div>
      </div>

      {/* Status & Assignment */}
      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-[#000000]">Manage Request</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col">
            <label className="mb-1.5 text-xs font-medium text-[#374151]">Update Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PrayerStatus)}
              className={inputClass}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="mb-1.5 text-xs font-medium text-[#374151]">Assign To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className={inputClass}
            >
              <option value="">Select officer</option>
              <option value="Pastor David">Pastor David</option>
              <option value="Pastor James">Pastor James</option>
              <option value="Deaconess Grace">Deaconess Grace</option>
              <option value="Shola Damson">Shola Damson</option>
            </select>
          </div>
          <Button variant="primary">Save Changes</Button>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#000000]">Notes</h2>
          {!addingNote && (
            <button
              onClick={() => setAddingNote(true)}
              className="flex items-center gap-1 text-sm font-medium text-[#000080] transition-colors hover:text-[#000066]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Note
            </button>
          )}
        </div>

        {addingNote && (
          <div className="mb-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter note..."
              rows={3}
              className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
              autoFocus
            />
            <div className="mt-2 flex gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  if (newNote.trim()) {
                    setNotes((prev) => [
                      ...prev,
                      { id: `note-${Date.now()}`, content: newNote.trim(), addedBy: "Admin", date: new Date().toLocaleDateString("en-GB") },
                    ]);
                    setNewNote("");
                    setAddingNote(false);
                  }
                }}
              >
                Save Note
              </Button>
              <Button variant="secondary" onClick={() => { setNewNote(""); setAddingNote(false); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {notes.length === 0 && !addingNote ? (
          <p className="text-sm text-[#9CA3AF]">No notes yet.</p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-[#F3F4F6] bg-[#F9FAFB] p-4">
                <div className="flex items-start justify-between">
                  <p className="flex-1 text-sm text-[#374151]">{note.content}</p>
                  <button
                    onClick={() => setNotes((prev) => prev.filter((n) => n.id !== note.id))}
                    className="ml-4 shrink-0 text-red-400 transition-colors hover:text-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2 text-xs text-[#9CA3AF]">Added by: {note.addedBy} &bull; {note.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => router.push("/prayer-requests")}>Back</Button>
      </div>
    </DashboardLayout>
  );
}
