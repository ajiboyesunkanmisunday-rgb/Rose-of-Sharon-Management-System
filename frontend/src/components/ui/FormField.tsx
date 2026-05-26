"use client";

import React from "react";

const labelBase = "block text-sm font-medium text-[#374151] dark:text-slate-300";
const inputBase =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 dark:text-slate-100 outline-none placeholder:text-[#9CA3AF] dark:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#000080] dark:focus:border-indigo-500 focus:ring-1 focus:ring-[#000080] dark:focus:ring-indigo-500 transition-colors";
const selectBase =
  "w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm text-[#374151] dark:text-slate-300 dark:text-slate-100 outline-none focus:border-[#000080] dark:focus:border-indigo-500 focus:ring-1 focus:ring-[#000080] dark:focus:ring-indigo-500 transition-colors";

interface BaseProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  icon?: React.ReactNode;
  showCount?: boolean;
}

interface FormFieldProps
  extends BaseProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {}

export function FormField({
  label,
  required,
  error,
  hint,
  icon,
  className = "",
  showCount = false,
  maxLength,
  value,
  ...inputProps
}: FormFieldProps) {
  const currentLength = typeof value === "string" ? value.length : 0;
  const nearLimit = showCount && maxLength && currentLength >= Math.floor(maxLength * 0.85);

  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between">
        <label className={labelBase}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        {showCount && maxLength && (
          <span
            className={`text-xs tabular-nums ${
              nearLimit ? "text-amber-500 font-medium" : "text-[#9CA3AF] dark:text-slate-500"
            }`}
          >
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] dark:text-slate-500">
            {icon}
          </div>
        )}
        <input
          className={`${inputBase} ${icon ? "pl-10" : ""} ${
            error
              ? "border-red-400 dark:border-red-400 focus:border-red-400 focus:ring-red-400"
              : ""
          }`}
          maxLength={maxLength}
          value={value}
          {...inputProps}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">{hint}</p>}
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
  hint,
  className = "",
  options,
  placeholder = "Select",
  ...selectProps
}: SelectFieldProps) {
  return (
    <div className={className}>
      <label className={`${labelBase} mb-1`}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <select
        className={`${selectBase} ${
          error
            ? "border-red-400 dark:border-red-400 focus:border-red-400 focus:ring-red-400"
            : ""
        }`}
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
      {!error && hint && <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">{hint}</p>}
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
  hint,
  className = "",
  rows = 5,
  showCount = false,
  maxLength,
  value,
  ...textareaProps
}: TextAreaFieldProps) {
  const currentLength = typeof value === "string" ? value.length : 0;
  const nearLimit = showCount && maxLength && currentLength >= Math.floor(maxLength * 0.85);

  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between">
        <label className={labelBase}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        {showCount && maxLength && (
          <span
            className={`text-xs tabular-nums ${
              nearLimit ? "text-amber-500 font-medium" : "text-[#9CA3AF] dark:text-slate-500"
            }`}
          >
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        rows={rows}
        maxLength={maxLength}
        value={value}
        className={`${inputBase} ${
          error
            ? "border-red-400 dark:border-red-400 focus:border-red-400 focus:ring-red-400"
            : ""
        }`}
        {...textareaProps}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400">{hint}</p>}
    </div>
  );
}
