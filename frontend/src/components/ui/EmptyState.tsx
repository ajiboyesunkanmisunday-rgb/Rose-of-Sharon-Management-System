import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  message,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center ${className}`}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6] dark:bg-slate-700 text-[#6B7280] dark:text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[#111827] dark:text-slate-100">{title}</h3>
      {message && (
        <p className="mt-1 max-w-md text-sm text-[#6B7280] dark:text-slate-400">{message}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
