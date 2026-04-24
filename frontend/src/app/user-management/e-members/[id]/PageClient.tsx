"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import DeleteConfirmModal from "@/components/user-management/DeleteConfirmModal";
import SpouseLinkModal from "@/components/user-management/SpouseLinkModal";
import type { SpouseData } from "@/components/user-management/SpouseLinkModal";
import { eMembers } from "@/lib/mock-data";

interface Note {
  id: string;
  content: string;
  addedBy: string;
  date: string;
}

export default function EMemberProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const eMember = eMembers.find((m) => m.id === id) || eMembers[0];
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSpouseModal, setShowSpouseModal] = useState(false);
  const [spouse, setSpouse] = useState<SpouseData | null>(
    eMember.spouse ? { name: eMember.spouse.name, weddingDate: "" } : null
  );
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const handleConfirmDelete = () => {
    console.log("Delete e-member:", eMember.id);
    setShowDeleteModal(false);
    router.push("/user-management/e-members");
  };

  const details: { label: string; value: string | undefined }[] = [
    { label: "First Name", value: eMember.firstName },
    ...(eMember.middleName
      ? [{ label: "Middle Name", value: eMember.middleName }]
      : []),
    { label: "Last Name", value: eMember.lastName },
    { label: "Email", value: eMember.email },
    { label: "Country", value: eMember.country },
    { label: "Country Code", value: eMember.countryCode },
    { label: "Phone", value: eMember.phone },
    { label: "Date of Birth", value: eMember.dateOfBirth },
    { label: "Marital Status", value: eMember.maritalStatus },
    { label: "Service Attended", value: eMember.serviceAttended },
  ];

  const showAnniversaryPhoto =
    eMember.maritalStatus === "Married" && eMember.spouse?.anniversaryPhoto;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">User Management</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/user-management/e-members")}
            className="flex items-center text-[#000080] transition-colors hover:text-[#000066]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-[#000080]">
            E-Member Profile
          </h2>
        </div>
      </div>

      {/* Profile Section */}
      <div className="mb-8 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Profile Photo Placeholder */}
          <div className="relative flex h-[250px] w-[200px] shrink-0 items-center justify-center rounded-xl bg-[#E5E7EB]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          {/* Anniversary Photo (if married + available) */}
          {showAnniversaryPhoto && (
            <div className="flex h-[250px] w-[200px] shrink-0 flex-col items-center">
              <div className="h-full w-full overflow-hidden rounded-xl bg-[#E5E7EB]">
                <img
                  src={eMember.spouse!.anniversaryPhoto}
                  alt="Anniversary"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-2 text-xs font-medium text-[#6B7280]">
                Anniversary Photo
              </p>
            </div>
          )}

          {/* Basic Details */}
          <div className="flex-1">
            <h2 className="mb-6 text-lg font-bold text-[#000000]">
              Basic Details
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">
              {details.map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-medium text-[#6B7280]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-[#111827]">
                    {item.value || "—"}
                  </p>
                </div>
              ))}

              {eMember.maritalStatus === "Married" && (
                <div>
                  <p className="text-xs font-medium text-[#6B7280]">Spouse</p>
                  {spouse ? (
                    <p className="mt-1 text-sm text-[#111827]">
                      {spouse.name}{" "}
                      <button
                        onClick={() => setShowSpouseModal(true)}
                        className="text-xs font-medium text-[#000080] underline transition-colors hover:text-[#000066]"
                      >
                        (change)
                      </button>
                    </p>
                  ) : (
                    <button
                      onClick={() => setShowSpouseModal(true)}
                      className="mt-1 text-xs font-medium text-[#000080] underline transition-colors hover:text-[#000066]"
                    >
                      + Link Spouse
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="mb-8 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#000000]">Notes</h2>
          {!addingNote && (
            <button
              onClick={() => setAddingNote(true)}
              className="flex items-center gap-1 text-sm font-medium text-[#000080] transition-colors hover:text-[#000066]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
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
                      {
                        id: `note-${Date.now()}`,
                        content: newNote.trim(),
                        addedBy: "Admin",
                        date: new Date().toLocaleDateString("en-GB"),
                      },
                    ]);
                    setNewNote("");
                    setAddingNote(false);
                  }
                }}
              >
                Save Note
              </Button>
              <Button
                variant="secondary"
                onClick={() => { setNewNote(""); setAddingNote(false); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {notes.length === 0 && !addingNote ? (
          <p className="text-sm text-[#9CA3AF]">No notes yet. Click &ldquo;Add Note&rdquo; to add one.</p>
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
                <div className="mt-2 text-xs text-[#9CA3AF]">
                  Added by: {note.addedBy} &bull; {note.date}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button
          variant="secondary"
          onClick={() => router.push("/user-management/e-members")}
        >
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() =>
            router.push(`/user-management/e-members/${eMember.id}/edit`)
          }
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
        onConfirm={handleConfirmDelete}
      />

      <SpouseLinkModal
        isOpen={showSpouseModal}
        onClose={() => setShowSpouseModal(false)}
        onSave={(data) => setSpouse(data)}
        initial={spouse || undefined}
      />
    </DashboardLayout>
  );
}
