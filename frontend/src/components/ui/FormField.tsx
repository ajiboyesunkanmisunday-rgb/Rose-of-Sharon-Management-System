"use client";

import React from "react";

const labelBase = "mb-1 block text-sm font-medium text-[#374151]";
const inputBase =
  "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
const selectBase =
  "w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

interface BaseProps {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
}

interface FormFieldProps
  extends BaseProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {}

export function FormField({
  label,
  required,
  error,
  className = "",
  ...inputProps
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className={labelBase}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        className={`${inputBase} ${error ? "border-red-500" : ""}`}
        {...inputProps}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface SelectFieldProps
  extends BaseProps,
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
}

export function SelectField({
  label,
  required,
  error,
  className = "",
  options,
  placeholder = "Select",
  ...selectProps
}: SelectFieldProps) {
  return (
    <div className={className}>
      <label className={labelBase}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <select
        className={`${selectBase} ${error ? "border-red-500" : ""}`}
        {...selectProps}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface TextAreaFieldProps
  extends BaseProps,
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {}

export function TextAreaField({
  label,
  required,
  error,
  className = "",
  rows = 5,
  ...textareaProps
}: TextAreaFieldProps) {
  return (
    <div className={className}>
      <label className={labelBase}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <textarea
        rows={rows}
        className={`${inputBase} ${error ? "border-red-500" : ""}`}
        {...textareaProps}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
