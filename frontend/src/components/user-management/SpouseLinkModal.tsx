"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import PhotoUpload from "@/components/ui/PhotoUpload";
import { getMembers, uploadProfilePicture, type UserResponse } from "@/lib/api";

interface SpouseData {
  memberId?: string;
  name: string;
  weddingDate: string;
  anniversaryPhoto?: File | null;
  couplePictureUrl?: string;
}

interface SpouseLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SpouseData) => void;
  initial?: Partial<SpouseData>;
}

type Mode = "search" | "add";

export default function SpouseLinkModal({
  isOpen,
  onClose,
  onSave,
  initial = {},
}: SpouseLinkModalProps) {
  const [mode, setMode] = useState<Mode>("search");
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState<UserResponse[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string } | null>(
    initial.memberId ? { id: initial.memberId, name: initial.name || "" } : null
  );
  const [name, setName] = useState(initial.name || "");
  const [weddingDate, setWeddingDate] = useState(initial.weddingDate || "");
  const [photo, setPhoto] = useState<File | null>(initial.anniversaryPhoto || null);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (f: string) => setTouched((t) => ({ ...t, [f]: true }));
  const [uploading, setUploading] = useState(false);

  const isFormValid = !!name.trim() && !!weddingDate;

  // Load members when modal opens or search changes
  useEffect(() => {
    if (!isOpen || mode !== "search") return;
    const timer = setTimeout(async () => {
      setLoadingMembers(true);
      try {
        const res = await getMembers(0, 20);
        setMembers(res.content);
      } catch {
        // silently ignore — user can still add by name
      } finally {
        setLoadingMembers(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [isOpen, mode, search]);

  const filteredMembers = members.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const full = `${m.firstName} ${m.lastName}`.toLowerCase();
    return (
      full.includes(q) ||
      (m.email ?? "").toLowerCase().includes(q) ||
      (m.phoneNumber ?? "").includes(q)
    );
  }).slice(0, 10);

  const handleSelect = (m: UserResponse) => {
    const full = `${m.firstName} ${m.lastName}`;
    setSelectedMember({ id: m.id, name: full });
    setName(full);
  };

  const handleSubmit = async () => {
    if (!name || !weddingDate) return;
    let couplePictureUrl: string | undefined;
    if (photo) {
      setUploading(true);
      try {
        couplePictureUrl = await uploadProfilePicture(photo);
      } catch {
        // non-fatal — proceed without the photo URL
      } finally {
        setUploading(false);
      }
    }
    onSave({
      memberId: selectedMember?.id,
      name,
      weddingDate,
      anniversaryPhoto: photo,
      couplePictureUrl,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Link Spouse" size="md">
      <div className="space-y-5">
        <div className="flex gap-2 border-b border-[#E5E7EB] dark:border-slate-700">
          <button
            onClick={() => setMode("search")}
            className={`pb-2 text-sm font-medium transition-colors ${
              mode === "search"
                ? "border-b-2 border-[#000080] text-[#000080] dark:text-indigo-400"
                : "text-[#6B7280] dark:text-slate-400 hover:text-[#374151] dark:text-slate-300"
            }`}
          >
            Search Existing
          </button>
          <button
            onClick={() => setMode("add")}
            className={`pb-2 text-sm font-medium transition-colors ${
              mode === "add"
                ? "border-b-2 border-[#000080] text-[#000080] dark:text-indigo-400"
                : "text-[#6B7280] dark:text-slate-400 hover:text-[#374151] dark:text-slate-300"
            }`}
          >
            Add New
          </button>
        </div>

        {mode === "search" && (
          <>
            <FormField
              label="Search Members"
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or email..."
            />
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-[#E5E7EB] dark:border-slate-700">
              {loadingMembers ? (
                <p className="p-3 text-center text-sm text-[#6B7280] dark:text-slate-400">Loading…</p>
              ) : filteredMembers.length === 0 ? (
                <p className="p-3 text-center text-sm text-[#6B7280] dark:text-slate-400">No matches found</p>
              ) : (
                filteredMembers.map((m) => {
                  const full = `${m.firstName} ${m.lastName}`;
                  const isSelected = selectedMember?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSelect(m)}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-[#F9FAFB] ${
                        isSelected ? "bg-[#F5F5FC]" : ""
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-[#111827] dark:text-slate-100">{full}</p>
                        <p className="text-xs text-[#6B7280] dark:text-slate-400">{m.email}</p>
                      </div>
                      {isSelected && (
                        <span className="rounded-full bg-[#000080] px-2 py-0.5 text-[10px] font-medium text-white">
                          Selected
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}

        {mode === "add" && (
          <FormField
            label="Spouse's Full Name"
            name="spouseName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter spouse's full name"
            required
          />
        )}

        <FormField
          label="Wedding Anniversary Date"
          type="date"
          name="weddingDate"
          value={weddingDate}
          onChange={(e) => setWeddingDate(e.target.value)}
          required
        />

        <PhotoUpload
          label="Wedding Anniversary Photo (optional)"
          value={photo}
          onChange={setPhoto}
          previewSize="md"
          hint="This photo appears on the member's anniversary card."
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isFormValid || uploading}
          >
            {uploading ? "Uploading photo…" : "Save Spouse"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export type { SpouseData };
