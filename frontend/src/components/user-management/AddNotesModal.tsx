"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";

interface AddNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddNotesModal({ isOpen, onClose }: AddNotesModalProps) {
  const [note, setNote] = useState("");

  const handleSave = () => {
    console.log("Save note:", note);
    setNote("");
    onClose();
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
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleSave}
          className="w-full rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </Modal>
  );
}
