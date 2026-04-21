"use client";

import React, { useState } from "react";

interface PhotoUploadProps {
  label: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  previewSize?: "sm" | "md" | "lg";
  hint?: string;
  accept?: string;
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-20 w-20",
  md: "h-[120px] w-[120px]",
  lg: "h-[180px] w-[180px]",
};

export default function PhotoUpload({
  label,
  value,
  onChange,
  previewSize = "md",
  hint = "JPG, PNG (max 5MB)",
  accept = "image/*",
  className = "",
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className={className}>
      {/* Entire block (label + image preview + hint) is one clickable label */}
      <label className="group block cursor-pointer">
        <span className="mb-1 block text-sm font-medium text-[#374151]">
          {label}
        </span>
        <div className="flex items-center gap-4">
          <span
            className={`${SIZE_CLASSES[previewSize]} flex shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#E5E7EB] bg-white transition-colors group-hover:border-[#000080]`}
          >
            {preview || value ? (
              <img
                src={preview || (value ? URL.createObjectURL(value) : "")}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex flex-col items-center justify-center text-[#9CA3AF] group-hover:text-[#000080]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="mt-1 text-xs">Upload</span>
              </span>
            )}
          </span>
          {hint && (
            <span className="text-xs text-[#6B7280] group-hover:text-[#000080]">
              {hint}
            </span>
          )}
        </div>
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </label>
    </div>
  );
}
