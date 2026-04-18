"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMemberModal({
  isOpen,
  onClose,
}: AddMemberModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");

  const handleSave = () => {
    onClose();
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setDepartment("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Member">
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter first name"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter last name"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Department
          </label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select department</option>
            <option value="ushering">Ushering</option>
            <option value="choir">Choir</option>
            <option value="media">Media</option>
            <option value="children">Children</option>
            <option value="protocol">Protocol</option>
            <option value="technical">Technical</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <Button onClick={handleSave} className="w-full">
          Save
        </Button>
      </div>
    </Modal>
  );
}
