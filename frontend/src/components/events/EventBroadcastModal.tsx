"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { SelectField, TextAreaField } from "@/components/ui/FormField";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { useState } from "react";
import { groups } from "@/lib/mock-data";

interface EventBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventName: string;
}

const CHANNEL_OPTIONS = [
  { label: "SMS", value: "SMS" },
  { label: "Email", value: "Email" },
  { label: "Both", value: "Both" },
];

const GENDER_OPTIONS = [
  { label: "All", value: "All" },
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

const MEMBER_TYPE_OPTIONS = [
  { label: "All", value: "All" },
  { label: "Members", value: "Members" },
  { label: "E-Members", value: "E-Members" },
  { label: "First Timers", value: "First Timers" },
  { label: "Second Timers", value: "Second Timers" },
  { label: "New Converts", value: "New Converts" },
];

export default function EventBroadcastModal({
  isOpen,
  onClose,
  eventName,
}: EventBroadcastModalProps) {
  const [channel, setChannel] = useState("SMS");
  const [group, setGroup] = useState("");
  const [gender, setGender] = useState("All");
  const [memberType, setMemberType] = useState("All");
  const [message, setMessage] = useState(
    `You are invited to: ${eventName}. See you there!`
  );

  const handleSend = () => {
    console.log("Broadcast:", { channel, group, gender, memberType, message });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Broadcast to Members" size="md">
      <div className="space-y-5">
        <SelectField
          label="Channel"
          name="channel"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          options={CHANNEL_OPTIONS}
        />

        <div className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#FAFAFA] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#111827] dark:text-slate-100">Audience Filters</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <SearchableSelect
                label="Group"
                placeholder="All Groups"
                searchPlaceholder="Search groups…"
                options={groups.map((g) => ({ label: g.name, value: g.id }))}
                value={group}
                onChange={setGroup}
              />
            </div>
            <SelectField
              label="Gender"
              name="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={GENDER_OPTIONS}
            />
            <SelectField
              label="Member Type"
              name="memberType"
              value={memberType}
              onChange={(e) => setMemberType(e.target.value)}
              options={MEMBER_TYPE_OPTIONS}
            />
          </div>
        </div>

        <TextAreaField
          label="Message"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="button" onClick={handleSend}>
            Send Broadcast
          </Button>
        </div>
      </div>
    </Modal>
  );
}
