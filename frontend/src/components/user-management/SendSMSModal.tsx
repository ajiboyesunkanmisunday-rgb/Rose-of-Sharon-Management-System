"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

// SMS: standard single message = 160 chars. Show count, allow longer (multi-part).
const MAX_SMS = 480; // 3 SMS segments

interface SendSMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
}

export default function SendSMSModal({ isOpen, onClose, selectedCount }: SendSMSModalProps) {
  const [activeTab, setActiveTab] = useState<"templates" | "custom">("templates");
  const [message, setMessage] = useState("");

  const nearLimit = message.length >= Math.floor(MAX_SMS * 0.85);
  // SMS segment count (160 chars per segment)
  const segments = Math.ceil(message.length / 160) || 1;

  // ① Submit disabled until message filled
  const canSend = activeTab === "templates" || message.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    onClose();
    setMessage("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send SMS">
      <p className="mb-4 text-sm text-gray-500 dark:text-slate-400">
        ({selectedCount}) selected
      </p>

      <div className="mb-4 flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "templates"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 dark:text-slate-400 hover:text-gray-700"
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "custom"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 dark:text-slate-400 hover:text-gray-700"
          }`}
        >
          Custom
        </button>
      </div>

      {activeTab === "templates" ? (
        <div className="mb-4 space-y-2">
          <p className="text-sm text-gray-500 dark:text-slate-400">No templates available.</p>
        </div>
      ) : (
        <div className="mb-4">
          {/* ③ Character count + SMS segment indicator */}
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Message <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs tabular-nums ${nearLimit ? "text-amber-500 font-medium" : "text-gray-400"}`}>
              {message.length}/{MAX_SMS} · {segments} SMS
            </span>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_SMS))}
            placeholder="Enter SMS message…"
            rows={5}
            maxLength={MAX_SMS}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 outline-none bg-white dark:bg-slate-700 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
            Standard SMS = 160 characters. Longer messages are split automatically.
          </p>
        </div>
      )}

      <Button onClick={handleSend} disabled={!canSend} className="w-full">
        Send
      </Button>
    </Modal>
  );
}
