"use client";

import { useRouter } from "next/navigation";
import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backOnClick?: () => void;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  backHref,
  backOnClick,
  actions,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backOnClick) {
      backOnClick();
    } else if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  const hasBack = Boolean(backHref || backOnClick);

  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-bold text-[#000000]">{title}</h1>
        {subtitle && (
          <div className="mt-1 flex items-center gap-2">
            {hasBack && (
              <button
                onClick={handleBack}
                className="flex items-center text-[#000080] transition-colors hover:text-[#000066]"
                aria-label="Go back"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
            )}
            <h2 className="text-[22px] font-bold text-[#000080]">{subtitle}</h2>
          </div>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
