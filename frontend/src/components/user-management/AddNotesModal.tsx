"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";

interface AddNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (note: string) => void | Promise<void>;
}

export default function AddNotesModal({ isOpen, onClose, onSave }: AddNotesModalProps) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      if (onSave) {
        await onSave(note);
      }
      setNote("");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Notes">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter Note"
            rows={5}
            className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-gray-400 focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !note.trim()}
          className="w-full rounded-lg bg-[#000080] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#000066] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </Modal>
  );
}
