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

// No width classes in shared style — width is applied explicitly by element.
const sharedStyles =
  "h-[46px] rounded-lg border border-[#E5E7EB] text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

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
      {/* Grid: 92px column for country code (fits flag + code); rest for phone input. */}
      <div
        className="grid items-stretch gap-2"
        style={{ gridTemplateColumns: "92px minmax(0, 1fr)" }}
      >

        <select
          name={codeName}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          aria-label="Country code"
          className={`${sharedStyles} w-full bg-white px-2 text-center`}
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
          onChange={(e) => {
            // Strip non-digit chars, remove leading trunk '0' (E.164 drops it),
            // and enforce max 15 digits
            let digits = e.target.value.replace(/\D/g, "");
            if (digits.startsWith("0")) digits = digits.slice(1);
            digits = digits.slice(0, 15);
            onNumberChange(digits);
          }}
          placeholder={placeholder}
          required={required}
          maxLength={15}
          className={`${sharedStyles} w-full px-4`}
        />
        <p className="col-span-full mt-1 text-xs text-[#9CA3AF]">
          Do not include the leading 0 (e.g. enter 8132577456 not 08132577456)
        </p>
      </div>
    </div>
  );
}

export { COUNTRY_CODES };
