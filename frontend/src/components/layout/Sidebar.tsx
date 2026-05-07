"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/lib/api";
import {
  ClipboardList,
  CircleUser,
  Contact,
  RefreshCcw,
  UserRoundPlus,
  PartyPopper,
  Swords,
  SquarePlay,
  CalendarClock,
  FileText,
  CalendarDays,
  GitFork,
  BellRing,
  Heart,
  Flame,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface SubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: SubItem[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: ClipboardList,
    href: "/dashboard",
  },
  {
    label: "User Management",
    icon: CircleUser,
    children: [
      { label: "Members", href: "/user-management/members" },
      { label: "E-Members", href: "/user-management/e-members" },
      { label: "First Timers", href: "/user-management/first-timers" },
      { label: "Second Timers", href: "/user-management/second-timers" },
      { label: "New Converts", href: "/user-management/new-converts" },
    ],
  },
  {
    label: "Communication",
    icon: Contact,
    children: [
      { label: "Messages", href: "/communication/messages" },
      { label: "Announcements", href: "/communication/announcements" },
      { label: "Templates", href: "/communication/templates" },
    ],
  },
  {
    label: "Workflows",
    icon: RefreshCcw,
    children: [
      { label: "Guest Workflow", href: "/workflows/guest" },
      { label: "Prayer Request Workflow", href: "/workflows/prayer" },
      { label: "Counseling Workflow", href: "/workflows/counseling" },
    ],
  },
  {
    label: "Requests",
    icon: UserRoundPlus,
    href: "/requests",
  },
  {
    label: "Testimonies",
    icon: Heart,
    href: "/testimonies",
  },
  {
    label: "Celebrations",
    icon: PartyPopper,
    href: "/celebrations",
  },
  {
    label: "Trainings",
    icon: Swords,
    children: [
      { label: "Courses", href: "/trainings/courses" },
      { label: "Schedules", href: "/trainings/schedules" },
    ],
  },
  {
    label: "Media",
    icon: SquarePlay,
    href: "/media",
  },
  {
    label: "Event Management",
    icon: CalendarClock,
    href: "/event-management",
  },
  {
    label: "Reports",
    icon: FileText,
    href: "/reports",
  },
  {
    label: "Calendar",
    icon: CalendarDays,
    children: [
      { label: "Events Calendar", href: "/calendar" },
      { label: "Ministers on Duty", href: "/calendar/ministers" },
    ],
  },
  {
    label: "Directory",
    icon: GitFork,
    href: "/directory",
  },
  {
    label: "Notifications",
    icon: BellRing,
    children: [
      { label: "All Notifications", href: "/notifications" },
      { label: "Settings", href: "/notifications/settings" },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { label: "My Settings", href: "/settings" },
      { label: "General", href: "/settings/general" },
      { label: "Roles & Permissions", href: "/settings/roles" },
      { label: "Groups", href: "/settings/groups" },
      { label: "Change Password", href: "/settings/change-password" },
      { label: "Activity Logs", href: "/settings/activity-logs" },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Auto-expand parent items whose children match the current path
  useEffect(() => {
    const activeParents = navItems
      .filter(
        (item) =>
          item.children &&
          item.children.some((child) => pathname.startsWith(child.href))
      )
      .map((item) => item.label);

    setExpandedItems((prev) => {
      const merged = new Set([...prev, ...activeParents]);
      return Array.from(merged);
    });
  }, [pathname]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  // Use exact match for the /settings root to avoid it matching all sub-pages.
  const isChildActive = (href: string) =>
    href === "/settings" ? pathname === "/settings" : pathname.startsWith(href);

  const isParentActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some((child) => pathname.startsWith(child.href));
    }
    return item.href ? pathname.startsWith(item.href) : false;
  };

  return (
    <aside
      className={[
        // Base
        "fixed left-0 top-0 z-40 flex h-screen flex-col",
        // Desktop — always visible, no transition needed
        "lg:translate-x-0",
        // Mobile — slide in/out based on isOpen
        isOpen ? "translate-x-0" : "-translate-x-full",
        "transition-transform duration-300 ease-in-out lg:transition-none",
      ].join(" ")}
      style={{
        width: "322px",
        backgroundColor: "#FEFEFF",
        boxShadow: "4px 0px 4px 0px rgba(0, 0, 128, 0.16)",
      }}
    >
      {/* Logo Area */}
      <div className="flex items-center justify-between px-5 py-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/rccg-combined-logo.svg"
          alt="Rose of Sharon - RCCG"
          className="h-[54px] w-auto"
        />
        {/* Close button — only shown on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#000080] hover:bg-gray-100 lg:hidden"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto pl-5 pr-3 py-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = !!item.children;
            const isExpanded = expandedItems.includes(item.label);
            const parentActive = isParentActive(item);

            return (
              <li key={item.label}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleExpand(item.label)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 transition-colors"
                      style={{
                        paddingTop: "14px",
                        paddingBottom: "14px",
                        backgroundColor: parentActive ? "#000080" : "transparent",
                        color: parentActive ? "#FFFFFF" : "#000080",
                        borderRadius: "8px",
                      }}
                    >
                      <Icon
                        className="flex-shrink-0"
                        style={{
                          width: "24px",
                          height: "24px",
                          color: parentActive ? "#FFFFFF" : "#000080",
                        }}
                        strokeWidth={1.5}
                      />
                      <span
                        className="flex-1 text-left"
                        style={{
                          fontSize: "16px",
                          fontWeight: parentActive ? 500 : 400,
                        }}
                      >
                        {item.label}
                      </span>
                      {parentActive || isExpanded ? (
                        <ChevronDown
                          className="flex-shrink-0"
                          style={{
                            width: "20px",
                            height: "20px",
                            color: parentActive ? "#FFFFFF" : "#000080",
                          }}
                          strokeWidth={1.5}
                        />
                      ) : (
                        <ChevronRight
                          className="flex-shrink-0"
                          style={{
                            width: "20px",
                            height: "20px",
                            color: "#000080",
                          }}
                          strokeWidth={1.5}
                        />
                      )}
                    </button>

                    {/* Submenu */}
                    {isExpanded && (
                      <>
                        {parentActive && (
                          <div
                            style={{
                              height: "2px",
                              backgroundColor: "#000080",
                              margin: "2px 0",
                            }}
                          />
                        )}
                        <ul className="py-1">
                          {item.children!.map((child) => {
                            const childActive = isChildActive(child.href);
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  className="block transition-colors"
                                  style={{
                                    paddingLeft: "40px",
                                    paddingTop: "10px",
                                    paddingBottom: "10px",
                                    fontSize: "15px",
                                    fontWeight: childActive ? 600 : 400,
                                    color: childActive ? "#000080" : "#333333",
                                  }}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg px-3 transition-colors"
                    style={{
                      paddingTop: "14px",
                      paddingBottom: "14px",
                      backgroundColor:
                        isParentActive(item) ? "#000080" : "transparent",
                      color: isParentActive(item) ? "#FFFFFF" : "#000080",
                      borderRadius: "8px",
                    }}
                  >
                    <Icon
                      className="flex-shrink-0"
                      style={{
                        width: "24px",
                        height: "24px",
                        color: isParentActive(item) ? "#FFFFFF" : "#000080",
                      }}
                      strokeWidth={1.5}
                    />
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: isParentActive(item) ? 500 : 400,
                      }}
                    >
                      {item.label}
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Log Out */}
      <div
        className="px-5 py-4"
        style={{ borderTop: "1px solid #E5E5E5" }}
      >
        <button
          onClick={() => logoutUser()}
          className="flex w-full items-center gap-3 rounded-lg px-3 transition-colors hover:bg-gray-100"
          style={{
            paddingTop: "14px",
            paddingBottom: "14px",
            color: "#000080",
          }}
        >
          <LogOut
            className="flex-shrink-0"
            style={{ width: "24px", height: "24px", color: "#000080" }}
            strokeWidth={1.5}
          />
          <span style={{ fontSize: "16px", fontWeight: 400 }}>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
