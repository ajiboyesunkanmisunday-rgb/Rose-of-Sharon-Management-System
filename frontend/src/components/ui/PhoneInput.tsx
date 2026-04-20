"use client";

import React from "react";

const COUNTRY_CODES = [
  { code: "+234", label: "🇳🇬 +234" },
  { code: "+233", label: "🇬🇭 +233" },
  { code: "+254", label: "🇰🇪 +254" },
  { code: "+256", label: "🇺🇬 +256" },
  { code: "+27",  label: "🇿🇦 +27" },
  { code: "+255", label: "🇹🇿 +255" },
  { code: "+251", label: "🇪🇹 +251" },
  { code: "+20",  label: "🇪🇬 +20" },
  { code: "+1",   label: "🇺🇸 +1" },
  { code: "+44",  label: "🇬🇧 +44" },
  { code: "+49",  label: "🇩🇪 +49" },
  { code: "+33",  label: "🇫🇷 +33" },
  { code: "+39",  label: "🇮🇹 +39" },
  { code: "+34",  label: "🇪🇸 +34" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+966", label: "🇸🇦 +966" },
  { code: "+91",  label: "🇮🇳 +91" },
  { code: "+86",  label: "🇨🇳 +86" },
];

interface PhoneInputProps {
  label: string;
  required?: boolean;
  code: string;
  number: string;
  onCodeChange: (code: string) => void;
  onNumberChange: (number: string) => void;
  codeName?: string;
  numberName?: string;
  placeholder?: string;
  className?: string;
}

// Styling WITHOUT a width class — width applied separately on each element
// to avoid w-full / w-24 conflict where Tailwind's CSS ordering picks the wrong one.
const sharedStyles =
  "rounded-lg border border-[#E5E7EB] px-3 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

export default function PhoneInput({
  label,
  required,
  code,
  number,
  onCodeChange,
  onNumberChange,
  codeName = "countryCode",
  numberName = "phone",
  placeholder = "Enter phone number",
  className = "",
}: PhoneInputProps) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-[#374151]">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className="flex items-stretch gap-2">
        <select
          name={codeName}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          aria-label="Country code"
          style={{ width: "96px" }}
          className={`${sharedStyles} shrink-0 grow-0 bg-white`}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="tel"
          name={numberName}
          value={number}
          onChange={(e) => onNumberChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`${sharedStyles} min-w-0 flex-1 grow`}
        />
      </div>
    </div>
  );
}

export { COUNTRY_CODES };
