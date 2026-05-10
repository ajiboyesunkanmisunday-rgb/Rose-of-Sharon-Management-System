"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { SelectField, TextAreaField } from "@/components/ui/FormField";
import { getMembers } from "@/lib/api";

interface OfficerOption {
  label: string;
  value: string;
}

interface AssignFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (officerId: string, note: string) => void;
  memberCount?: number;
}

export default function AssignFollowUpModal({
  isOpen,
  onClose,
  onAssign,
  memberCount = 1,
}: AssignFollowUpModalProps) {
  const [officerId, setOfficerId] = useState("");
  const [note, setNote] = useState("");
  const [officerOptions, setOfficerOptions] = useState<OfficerOption[]>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoadingOfficers(true);
    getMembers(0, 100)
      .then((res) => {
        if (cancelled) return;
        const opts = (res.content ?? []).map((m) => ({
          label: `${m.firstName} ${m.lastName}`.trim(),
          value: m.id,
        }));
        setOfficerOptions(opts);
      })
      .catch(() => {
        if (!cancelled) setOfficerOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingOfficers(false);
      });
    return () => { cancelled = true; };
  }, [isOpen]);

  const handleAssign = () => {
    if (!officerId) return;
    onAssign(officerId, note);
    setOfficerId("");
    setNote("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Follow-up" size="md">
      <div className="space-y-4">
        {memberCount > 0 && (
          <p className="text-sm text-[#6B7280]">
            Assigning follow-up to{" "}
            <strong className="text-[#000080]">
              {memberCount} {memberCount === 1 ? "person" : "people"}
            </strong>
            .
          </p>
        )}

        {loadingOfficers ? (
          <p className="text-sm text-[#6B7280]">Loading officers…</p>
        ) : (
          <SelectField
            label="Follow-up Officer"
            name="officerId"
            value={officerId}
            onChange={(e) => setOfficerId(e.target.value)}
            options={officerOptions}
            required
          />
        )}

        <TextAreaField
          label="Note (optional)"
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Needs a call this week"
          rows={3}
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssign} disabled={loadingOfficers || !officerId}>
            Assign
          </Button>
        </div>
      </div>
    </Modal>
  );
}
