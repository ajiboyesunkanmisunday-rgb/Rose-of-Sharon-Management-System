"use client";

import { useState, useEffect, useRef } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Search, X, Shield, ShieldCheck } from "lucide-react";
import {
  getRoles,
  searchAllMembers,
  type UserResponse,
  type RoleResponse,
} from "@/lib/api";

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    userId: string;
    roleId?: string;
    password?: string;
    confirmPassword?: string;
  }) => void;
  type: "ADMIN" | "SUPER_ADMIN";
  isLoading?: boolean;
}

const inputClass =
  "w-full rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm text-[#374151] outline-none transition-colors focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

export default function AddAdminModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  isLoading = false,
}: AddAdminModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResponse[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedUser(null);
      setSelectedRoleId("");
      setPassword("");
      setConfirmPassword("");
      setError("");
      return;
    }

    if (type === "ADMIN") {
      getRoles(0, 100).then((res) => {
        setRoles(res.content ?? []);
      });
    }
  }, [isOpen, type]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchAllMembers(q, 0, 10);
        setSearchResults(res.content ?? []);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleConfirm = () => {
    setError("");
    if (!selectedUser) {
      setError("Please select a user.");
      return;
    }
    if (type === "ADMIN" && !selectedRoleId) {
      setError("Please select a role.");
      return;
    }
    if (!password) {
      setError("Please enter a password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    onConfirm({
      userId: selectedUser.id,
      roleId: type === "ADMIN" ? selectedRoleId : undefined,
      password,
      confirmPassword,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === "SUPER_ADMIN" ? "Add Super Admin" : "Add Admin"}
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* User Search */}
        {!selectedUser ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">
              Search Member <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name or email"
                className={`${inputClass} pl-10`}
              />
              {searching && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#000080] border-t-transparent" />
                </div>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setSelectedUser(u);
                      setSearchResults([]);
                      setSearchQuery("");
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                      {u.firstName[0]}
                      {u.lastName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {u.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#000080] text-sm font-bold text-white">
                {selectedUser.firstName[0]}
                {selectedUser.lastName[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-[#111827]">
                  {selectedUser.firstName} {selectedUser.lastName}
                </p>
                <p className="text-xs text-[#6B7280]">{selectedUser.email}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-[#6B7280]" />
            </button>
          </div>
        )}

        {/* Role Selection (Only for Admin) */}
        {type === "ADMIN" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">
              Assign Role <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isLoading || !selectedUser || !password || (type === "ADMIN" && !selectedRoleId)}
            icon={type === "SUPER_ADMIN" ? <ShieldCheck className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
          >
            {isLoading ? "Saving..." : type === "SUPER_ADMIN" ? "Add Super Admin" : "Add Admin"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
