import React from "react";

// ── Built-in SVG illustrations ────────────────────────────────────────────────
const illustrations: Record<string, React.ReactNode> = {
  members: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-16 w-16">
      <circle cx="30" cy="28" r="12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <path d="M6 68c0-13.255 10.745-24 24-24s24 10.745 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="56" cy="26" r="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M44 68c0-9.941 5.373-18.6 13.336-23.283" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3"/>
    </svg>
  ),
  events: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-16 w-16">
      <rect x="10" y="18" width="60" height="52" rx="6" stroke="currentColor" strokeWidth="3"/>
      <path d="M10 30h60" stroke="currentColor" strokeWidth="3"/>
      <path d="M26 10v16M54 10v16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <rect x="22" y="42" width="10" height="10" rx="2" fill="currentColor" opacity=".4"/>
      <rect x="36" y="42" width="10" height="10" rx="2" fill="currentColor" opacity=".4"/>
      <rect x="50" y="42" width="10" height="10" rx="2" fill="currentColor" opacity=".2"/>
    </svg>
  ),
  media: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-16 w-16">
      <rect x="8" y="14" width="64" height="44" rx="6" stroke="currentColor" strokeWidth="3"/>
      <path d="M34 30l16 10-16 10V30z" fill="currentColor" opacity=".5"/>
      <path d="M20 66h40" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-16 w-16">
      <path d="M40 10a22 22 0 0 1 22 22v12l6 8H12l6-8V32A22 22 0 0 1 40 10z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M33 62a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-16 w-16">
      <circle cx="36" cy="34" r="20" stroke="currentColor" strokeWidth="3"/>
      <path d="M50 50l16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <path d="M28 34h16M36 26v16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".5"/>
    </svg>
  ),
  directory: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-16 w-16">
      <rect x="10" y="10" width="60" height="60" rx="6" stroke="currentColor" strokeWidth="3"/>
      <circle cx="40" cy="32" r="10" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M20 64c0-11.046 8.954-20 20-20s20 8.954 20 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  generic: (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-16 w-16">
      <circle cx="40" cy="36" r="18" stroke="currentColor" strokeWidth="3"/>
      <path d="M40 22v14l8 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 66h48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".3"/>
    </svg>
  ),
};

interface EmptyStateProps {
  /** Pre-built illustration type — overrides `icon` when provided */
  illustration?: keyof typeof illustrations;
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  illustration,
  icon,
  title,
  message,
  action,
  className = "",
}: EmptyStateProps) {
  const graphic = illustration ? illustrations[illustration] ?? illustrations.generic : icon;

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center ${className}`}
    >
      {graphic && (
        <div className="mb-5 text-[#000080]/30 dark:text-indigo-400/40">
          {graphic}
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
