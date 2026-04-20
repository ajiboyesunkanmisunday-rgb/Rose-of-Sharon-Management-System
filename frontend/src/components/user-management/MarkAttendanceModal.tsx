"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attended: boolean[]) => void;
  memberName: string;
  initial?: boolean[];
  classCount?: number;
}

export default function MarkAttendanceModal({
  isOpen,
  onClose,
  onSave,
  memberName,
  initial,
  classCount = 5,
}: MarkAttendanceModalProps) {
  const [attended, setAttended] = useState<boolean[]>(
    initial && initial.length === classCount ? initial : Array(classCount).fill(false)
  );

  const toggle = (idx: number) => {
    setAttended((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  const handleSave = () => {
    onSave(attended);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mark Believers Class Attendance" size="md">
      <div className="space-y-4">
        <p className="text-sm text-[#6B7280]">
          Mark which classes <strong className="text-[#111827]">{memberName}</strong> has attended.
        </p>

        <div className="space-y-2 rounded-lg border border-[#E5E7EB] p-4">
          {Array.from({ length: classCount }, (_, i) => (
            <label
              key={i}
              className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-[#F9FAFB]"
            >
              <span className="text-sm text-[#374151]">Class {i + 1}</span>
              <input
                type="checkbox"
                checked={attended[i]}
                onChange={() => toggle(i)}
                className="h-4 w-4 rounded border-[#E5E7EB] text-[#000080] focus:ring-[#000080]"
              />
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-[#6B7280]">
          <span>
            Attended: <strong className="text-[#16A34A]">{attended.filter(Boolean).length}</strong> of {classCount}
          </span>
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
