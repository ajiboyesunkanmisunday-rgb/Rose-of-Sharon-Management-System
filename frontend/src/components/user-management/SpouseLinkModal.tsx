"use client";

import { useState, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import PhotoUpload from "@/components/ui/PhotoUpload";
import { members } from "@/lib/mock-data";

interface SpouseData {
  memberId?: string;
  name: string;
  weddingDate: string;
  anniversaryPhoto?: File | null;
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
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string } | null>(
    initial.memberId
      ? {
          id: initial.memberId,
          name: initial.name || "",
        }
      : null
  );
  const [name, setName] = useState(initial.name || "");
  const [weddingDate, setWeddingDate] = useState(initial.weddingDate || "");
  const [photo, setPhoto] = useState<File | null>(initial.anniversaryPhoto || null);

  const filtered = useMemo(() => {
    if (!search.trim()) return members.slice(0, 6);
    const q = search.toLowerCase();
    return members
      .filter(
        (m) =>
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
          m.phone.includes(q) ||
          m.email.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [search]);

  const handleSelect = (m: (typeof members)[number]) => {
    setSelectedMember({ id: m.id, name: `${m.firstName} ${m.lastName}` });
    setName(`${m.firstName} ${m.lastName}`);
  };

  const handleSubmit = () => {
    if (!name || !weddingDate) return;
    onSave({
      memberId: selectedMember?.id,
      name,
      weddingDate,
      anniversaryPhoto: photo,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Link Spouse" size="md">
      <div className="space-y-5">
        <div className="flex gap-2 border-b border-[#E5E7EB]">
          <button
            onClick={() => setMode("search")}
            className={`pb-2 text-sm font-medium transition-colors ${
              mode === "search"
                ? "border-b-2 border-[#000080] text-[#000080]"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            Search Existing
          </button>
          <button
            onClick={() => setMode("add")}
            className={`pb-2 text-sm font-medium transition-colors ${
              mode === "add"
                ? "border-b-2 border-[#000080] text-[#000080]"
                : "text-[#6B7280] hover:text-[#374151]"
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
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-[#E5E7EB]">
              {filtered.length === 0 ? (
                <p className="p-3 text-center text-sm text-[#6B7280]">No matches</p>
              ) : (
                filtered.map((m) => {
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
                        <p className="text-sm font-medium text-[#111827]">{full}</p>
                        <p className="text-xs text-[#6B7280]">{m.email}</p>
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
          <Button variant="primary" onClick={handleSubmit}>
            Save Spouse
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export type { SpouseData };
