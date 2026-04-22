"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (highestClassAttained: string) => void;
  memberName: string;
  initial?: string;
}

const CLASS_OPTIONS = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"];

export default function MarkAttendanceModal({
  isOpen,
  onClose,
  onSave,
  memberName,
  initial,
}: MarkAttendanceModalProps) {
  const [selected, setSelected] = useState<string>(initial ?? "");

  useEffect(() => {
    if (isOpen) setSelected(initial ?? "");
  }, [isOpen, initial]);

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark Believers Class Attendance" size="md">
      <div className="space-y-4">
        <p className="text-sm text-[#6B7280]">
          Mark the highest Believers Class that{" "}
          <strong className="text-[#111827]">{memberName}</strong> has attended.
        </p>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#374151]">
            Highest Class Attended
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
          >
            <option value="">None</option>
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-[#6B7280]">
            Selecting a class marks all previous classes as also attended.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
