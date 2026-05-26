"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

const MAX_SUBJECT = 150;
const MAX_MESSAGE = 2000;

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
}

export default function SendEmailModal({ isOpen, onClose, selectedCount }: SendEmailModalProps) {
  const [activeTab, setActiveTab] = useState<"templates" | "custom">("templates");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const subjectNear = subject.length >= Math.floor(MAX_SUBJECT * 0.85);
  const messageNear = message.length >= Math.floor(MAX_MESSAGE * 0.85);

  // ① Submit disabled until subject + message filled
  const canSend = activeTab === "templates" || (subject.trim().length > 0 && message.trim().length > 0);

  const handleSend = () => {
    if (!canSend) return;
    onClose();
    setSubject("");
    setMessage("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Email">
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
        <div className="mb-4 space-y-3">
          {/* Subject with ③ character count */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Subject <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs tabular-nums ${subjectNear ? "text-amber-500 font-medium" : "text-gray-400"}`}>
                {subject.length}/{MAX_SUBJECT}
              </span>
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value.slice(0, MAX_SUBJECT))}
              placeholder="Enter Subject"
              maxLength={MAX_SUBJECT}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 outline-none bg-white dark:bg-slate-700 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {/* Message with ③ character count */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Message <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs tabular-nums ${messageNear ? "text-amber-500 font-medium" : "text-gray-400"}`}>
                {message.length}/{MAX_MESSAGE}
              </span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
              placeholder="Enter message…"
              rows={5}
              maxLength={MAX_MESSAGE}
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 outline-none bg-white dark:bg-slate-700 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      <Button onClick={handleSend} disabled={!canSend} className="w-full">
        Send
      </Button>
    </Modal>
  );
}
