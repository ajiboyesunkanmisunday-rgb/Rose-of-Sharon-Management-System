"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
}

export default function SendEmailModal({
  isOpen,
  onClose,
  selectedCount,
}: SendEmailModalProps) {
  const [activeTab, setActiveTab] = useState<"templates" | "custom">(
    "templates"
  );
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    onClose();
    setSubject("");
    setMessage("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Email">
      <p className="mb-4 text-sm text-gray-500">
        ({selectedCount}) selected
      </p>

      <div className="mb-4 flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "templates"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "custom"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Custom
        </button>
      </div>

      {activeTab === "templates" ? (
        <div className="mb-4 space-y-2">
          <p className="text-sm text-gray-500">No templates available.</p>
        </div>
      ) : (
        <div className="mb-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter Subject"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter Message"
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      <Button onClick={handleSend} className="w-full">
        Send
      </Button>
    </Modal>
  );
}
