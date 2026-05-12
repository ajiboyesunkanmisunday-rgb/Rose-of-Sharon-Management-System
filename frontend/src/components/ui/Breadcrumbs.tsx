"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumbs — renders a trail like:
 *   User Management > Members > John Doe > Edit
 *
 * Usage:
 *   <Breadcrumbs items={[
 *     { label: "User Management" },
 *     { label: "Members", href: "/user-management/members" },
 *     { label: "John Doe", href: "/user-management/members/abc" },
 *     { label: "Edit" },
 *   ]} />
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && (
              <ChevronRight className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-[#000080] hover:underline font-medium transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-semibold text-[#111827]" : "text-[#6B7280]"}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
