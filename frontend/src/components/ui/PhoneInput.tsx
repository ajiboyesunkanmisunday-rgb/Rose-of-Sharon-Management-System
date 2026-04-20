"use client";

import React from "react";

const COUNTRY_CODES = [
  { code: "+234", label: "NG +234" },
  { code: "+233", label: "GH +233" },
  { code: "+254", label: "KE +254" },
  { code: "+256", label: "UG +256" },
  { code: "+27",  label: "ZA +27" },
  { code: "+1",   label: "US +1" },
  { code: "+44",  label: "UK +44" },
  { code: "+49",  label: "DE +49" },
  { code: "+33",  label: "FR +33" },
  { code: "+971", label: "AE +971" },
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
  const inputBase =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-[#374151]">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className="flex gap-2">
        <select
          name={codeName}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          className={`${inputBase} w-28 shrink-0 bg-white`}
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
          className={inputBase}
          required={required}
        />
      </div>
    </div>
  );
}

export { COUNTRY_CODES };
