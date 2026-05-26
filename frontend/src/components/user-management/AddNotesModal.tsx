"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";

const MAX_NOTE = 500;

interface AddNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (note: string) => void | Promise<void>;
}

export default function AddNotesModal({ isOpen, onClose, onSave }: AddNotesModalProps) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const remaining = MAX_NOTE - note.length;
  const nearLimit = remaining <= Math.floor(MAX_NOTE * 0.15); // amber when ≤85 chars left

  const handleSave = async () => {
    if (!note.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      if (onSave) {
        await onSave(note);
      }
      setNote("");
      setSaveError("");
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Notes">
      <div className="space-y-4">
        <div>
          {/* ③ Character count label row */}
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Note <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs tabular-nums ${nearLimit ? "text-amber-500 font-medium" : "text-[#9CA3AF] dark:text-slate-500"}`}>
              {note.length}/{MAX_NOTE}
            </span>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, MAX_NOTE))}
            placeholder="Enter note…"
            rows={5}
            maxLength={MAX_NOTE}
            className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 outline-none placeholder:text-gray-400 dark:text-slate-500 focus:border-[#000080] focus:ring-1 focus:ring-[#000080] transition-colors"
          />
        </div>
        {saveError && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700">
            {saveError}
          </div>
        )}
        {/* ① Submit disabled while empty */}
        <button
          onClick={handleSave}
          disabled={saving || !note.trim()}
          className="w-full rounded-lg bg-[#000080] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#000066] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save Note"}
        </button>
      </div>
    </Modal>
  );
}
