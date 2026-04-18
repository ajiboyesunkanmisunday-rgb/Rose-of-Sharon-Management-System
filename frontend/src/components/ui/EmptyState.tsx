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
      className={`flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] bg-white p-12 text-center ${className}`}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6B7280]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[#111827]">{title}</h3>
      {message && (
        <p className="mt-1 max-w-md text-sm text-[#6B7280]">{message}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
