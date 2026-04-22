"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  count?: number;
}

export default function NoLongerMemberModal({
  isOpen,
  onClose,
  onConfirm,
  count,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setReason("");
      setError("");
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Please provide a reason.");
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="relative w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Navy Header */}
        <div className="flex items-center justify-between bg-[#000080] px-6 py-4">
          <h2 className="text-lg font-bold text-white">
            Mark as No longer a member
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center text-white transition-colors hover:text-gray-200"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {count !== undefined && count > 0 && (
            <p className="mb-3 text-sm text-[#374151]">
              This will mark <span className="font-semibold">{count}</span>{" "}
              {count === 1 ? "member" : "members"} as no longer a member.
            </p>
          )}
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            rows={4}
            placeholder="Enter the reason..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
          />
          {error && (
            <p className="mt-1 text-xs text-red-600">{error}</p>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="rounded-xl border-2 border-[#000080] px-6 py-2.5 text-sm font-medium text-[#000080] transition-colors hover:bg-[#000080]/5"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-xl bg-[#000080] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#000066]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
