"use client";

import { useEffect, useRef, useState } from "react";
import type { UserResponse } from "@/lib/api";

interface Props {
  isOpen: boolean;
  isLoading?: boolean;
  member?: UserResponse | null;
  onClose: () => void;
  onConfirm: (
    userId: string,
    password: string,
    confirmPassword: string,
  ) => void;
}

export default function AssignSuperAdminModal({
  isOpen,
  isLoading = false,
  member,
  onClose,
  onConfirm,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setPassword("");
      setConfirmPassword("");
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
    setError("");
    if (!password.trim() || !confirmPassword.trim()) {
      setError("Please enter and confirm a password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!member?.id) {
      setError("No member selected.");
      return;
    }
    onConfirm(member.id, password, confirmPassword);
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="relative w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-[#000080] px-6 py-4">
          <h2 className="text-lg font-bold text-white">
            Assign Super Admin Role
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center text-white"
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

        <div className="px-6 py-6">
          <p className="mb-3 text-sm text-[#374151]">
            Member:{" "}
            <span className="font-semibold">
              {member ? `${member.firstName} ${member.lastName}` : "—"}
            </span>
          </p>

          <label className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
            placeholder="Enter password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080] mb-3"
          />

          <label className="mb-1 block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError("");
            }}
            placeholder="Confirm password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
          />

          {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

          <p className="mt-4 text-sm text-yellow-700">
            ⚠️ This action grants admin privileges.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="rounded-xl border-2 border-[#000080] px-6 py-2.5 text-sm font-medium text-[#000080]"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-xl bg-[#000080] px-6 py-2.5 text-sm font-medium text-white"
            disabled={isLoading}
          >
            {isLoading ? "Assigning…" : "Assign Super Admin"}
          </button>
        </div>
      </div>
    </div>
  );
}
