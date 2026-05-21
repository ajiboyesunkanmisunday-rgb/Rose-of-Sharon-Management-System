"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/context/SidebarContext";
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
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
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
  { label: "Dashboard",        icon: ClipboardList, href: "/dashboard" },
  {
    label: "User Management", icon: CircleUser,
    children: [
      { label: "Members",       href: "/user-management/members" },
      { label: "E-Members",     href: "/user-management/e-members" },
      { label: "First Timers",  href: "/user-management/first-timers" },
      { label: "Second Timers", href: "/user-management/second-timers" },
      { label: "New Converts",  href: "/user-management/new-converts" },
    ],
  },
  {
    label: "Communication", icon: Contact,
    children: [
      { label: "Messages",  href: "/communication/messages" },
      { label: "Templates", href: "/communication/templates" },
    ],
  },
  {
    label: "Workflows", icon: RefreshCcw,
    children: [
      { label: "Guest Workflow",          href: "/workflows/guest" },
      { label: "Prayer Request Workflow", href: "/workflows/prayer" },
      { label: "Counseling Workflow",     href: "/workflows/counseling" },
    ],
  },
  { label: "Requests",             icon: UserRoundPlus, href: "/requests" },
  { label: "Prayer Requests",      icon: Flame,         href: "/prayer-requests" },
  { label: "Testimonies",          icon: Heart,         href: "/testimonies" },
  { label: "Celebrations",         icon: PartyPopper,   href: "/celebrations" },
  {
    label: "Trainings", icon: Swords,
    children: [
      { label: "Baptismal Class",     href: "/trainings/baptismal" },
      { label: "Workers-in-Training", href: "/trainings/workers" },
      { label: "School of Disciples", href: "/trainings/sod" },
      { label: "School of Ministry",  href: "/trainings/som" },
      { label: "RILA",                href: "/trainings/rila" },
    ],
  },
  { label: "Media",                icon: SquarePlay,    href: "/media" },
  { label: "Altar Announcements",  icon: Megaphone,     href: "/announcements" },
  { label: "Event Management",     icon: CalendarClock, href: "/event-management" },
  { label: "Reports",              icon: FileText,      href: "/reports" },
  {
    label: "Calendar", icon: CalendarDays,
    children: [
      { label: "Events Calendar",  href: "/calendar" },
      { label: "Ministers on Duty",href: "/calendar/ministers" },
    ],
  },
  { label: "Directory",            icon: GitFork,       href: "/directory" },
  {
    label: "Notifications", icon: BellRing,
    children: [
      { label: "All Notifications", href: "/notifications" },
      { label: "Settings",          href: "/notifications/settings" },
    ],
  },
  {
    label: "Settings", icon: Settings,
    children: [
      { label: "My Settings",       href: "/settings" },
      { label: "General",           href: "/settings/general" },
      { label: "Admin Users",       href: "/settings/admins" },
      { label: "Roles & Permissions", href: "/settings/roles" },
      { label: "Groups",            href: "/settings/groups" },
      { label: "Change Password",   href: "/settings/change-password" },
      { label: "Activity Logs",     href: "/settings/activity-logs" },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isDark } = useTheme();
  const { collapsed, toggleCollapsed } = useSidebar();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Auto-expand parent of active child
  useEffect(() => {
    const activeParents = navItems
      .filter((item) => item.children?.some((c) => pathname.startsWith(c.href)))
      .map((item) => item.label);
    setExpandedItems((prev) => Array.from(new Set([...prev, ...activeParents])));
  }, [pathname]);

  // When sidebar collapses, close all expandedItems
  useEffect(() => {
    if (collapsed) setExpandedItems([]);
  }, [collapsed]);

  const toggleExpand = (label: string) => {
    if (collapsed) return; // no submenus in collapsed mode
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const isChildActive = (href: string) =>
    href === "/settings" ? pathname === "/settings" : pathname.startsWith(href);

  const isParentActive = (item: NavItem) => {
    if (item.children) return item.children.some((c) => pathname.startsWith(c.href));
    return item.href ? pathname.startsWith(item.href) : false;
  };

  // Theme-aware colour palette
  const C = {
    sidebarBg:       isDark ? "#111827" : "#FEFEFF",
    sidebarShadow:   isDark ? "4px 0 4px 0 rgba(0,0,0,0.4)" : "4px 0px 4px 0px rgba(0, 0, 128, 0.16)",
    logoText:        isDark ? "#818cf8" : "#000080",
    divider:         isDark ? "#1e293b" : "#E5E5E5",
    navText:         isDark ? "#cbd5e1" : "#000080",
    navTextActive:   "#ffffff",
    navBgActive:     "#000080",
    navHoverBorder:  isDark ? "#818cf8" : "#000080",
    subText:         isDark ? "#94a3b8" : "#333333",
    subTextActive:   isDark ? "#a5b4fc" : "#000080",
    subBorderActive: isDark ? "#818cf8" : "#000080",
    subBgActive:     isDark ? "#1e293b" : "#EEF2FF",
    subHoverBg:      isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
    logoutText:      isDark ? "#f87171" : "#000080",
    hoverBg:         isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    collapseBtn:     isDark ? "#94a3b8" : "#6B7280",
  };

  const sidebarWidth = collapsed ? 64 : 272;

  // Helper: is this nav item hovered (and not active)?
  const isHovered = (key: string, active: boolean) =>
    !active && hoveredItem === key;

  return (
    <aside
      className={[
        "fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "transition-all duration-300 ease-in-out",
      ].join(" ")}
      style={{
        width: `${sidebarWidth}px`,
        backgroundColor: C.sidebarBg,
        boxShadow: C.sidebarShadow,
      }}
    >
      {/* ── Logo / Collapse area ──────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-3 py-5 shrink-0"
        style={{ minHeight: 80 }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/rccg-icon-small.png"
              alt="RCCG Rose of Sharon"
              className="h-[50px] w-[50px] shrink-0 rounded-full object-cover"
            />
            <div className="leading-tight min-w-0">
              <p className="text-[13px] font-bold truncate" style={{ color: C.logoText }}>Rose of Sharon</p>
              <p className="text-[11px] font-semibold text-[#DA251D] tracking-wide">RCCG</p>
            </div>
          </div>
        )}

        {collapsed && (
          /* Just the logo icon when collapsed */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/rccg-icon-small.png"
            alt="RCCG"
            className="h-10 w-10 rounded-full object-cover mx-auto"
          />
        )}

        {/* Mobile close / Desktop collapse toggle */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Mobile close */}
          {onClose && (
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full lg:hidden"
              style={{ color: C.logoutText }}
              aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          {/* Desktop collapse toggle */}
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ color: C.collapseBtn }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = C.hoverBg; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed
              ? <PanelLeftOpen size={18} strokeWidth={1.8} />
              : <PanelLeftClose size={18} strokeWidth={1.8} />
            }
          </button>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2" style={{ paddingLeft: collapsed ? 6 : 20, paddingRight: collapsed ? 6 : 12 }}>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = !!item.children;
            const isExpanded = expandedItems.includes(item.label);
            const parentActive = isParentActive(item);
            const hovered = isHovered(item.label, parentActive);

            return (
              <li key={item.label}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => {
                        if (collapsed) return;
                        toggleExpand(item.label);
                      }}
                      onMouseEnter={() => setHoveredItem(item.label)}
                      onMouseLeave={() => setHoveredItem(null)}
                      title={collapsed ? item.label : undefined}
                      className="flex w-full items-center gap-3 rounded-lg transition-all"
                      style={{
                        paddingTop: "14px",
                        paddingBottom: "14px",
                        paddingLeft: collapsed ? 10 : 12,
                        paddingRight: collapsed ? 10 : 12,
                        backgroundColor: parentActive ? C.navBgActive : "transparent",
                        color: parentActive ? C.navTextActive : C.navText,
                        borderRadius: "8px",
                        borderLeft: hovered ? `2px solid ${C.navHoverBorder}` : "2px solid transparent",
                      }}
                    >
                      <Icon className="flex-shrink-0" style={{ width: 24, height: 24, color: parentActive ? C.navTextActive : C.navText }} strokeWidth={1.5} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left" style={{ fontSize: 16, fontWeight: parentActive ? 500 : 400 }}>
                            {item.label}
                          </span>
                          {parentActive || isExpanded
                            ? <ChevronDown className="flex-shrink-0" style={{ width: 20, height: 20, color: parentActive ? C.navTextActive : C.navText }} strokeWidth={1.5} />
                            : <ChevronRight className="flex-shrink-0" style={{ width: 20, height: 20, color: C.navText }} strokeWidth={1.5} />
                          }
                        </>
                      )}
                    </button>

                    {/* Submenu — hidden when collapsed */}
                    {!collapsed && isExpanded && (
                      <>
                        {parentActive && <div style={{ height: 2, backgroundColor: C.navBgActive, margin: "2px 0" }} />}
                        <ul className="py-1">
                          {item.children!.map((child) => {
                            const childActive = isChildActive(child.href);
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  onMouseEnter={() => setHoveredItem(child.href)}
                                  onMouseLeave={() => setHoveredItem(null)}
                                  className="block transition-all relative"
                                  style={{
                                    paddingLeft: childActive ? 36 : 40,
                                    paddingTop: 10,
                                    paddingBottom: 10,
                                    fontSize: 15,
                                    fontWeight: childActive ? 600 : 400,
                                    color: childActive ? C.subTextActive : hoveredItem === child.href ? C.subTextActive : C.subText,
                                    borderLeft: childActive
                                      ? `4px solid ${C.subBorderActive}`
                                      : hoveredItem === child.href
                                        ? `4px solid ${C.navHoverBorder}`
                                        : "4px solid transparent",
                                    borderRadius: "0 6px 6px 0",
                                    backgroundColor: childActive ? C.subBgActive : hoveredItem === child.href ? C.subHoverBg : "transparent",
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
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                    title={collapsed ? item.label : undefined}
                    className="flex items-center gap-3 rounded-lg transition-all"
                    style={{
                      paddingTop: 14,
                      paddingBottom: 14,
                      paddingLeft: collapsed ? 10 : 12,
                      paddingRight: collapsed ? 10 : 12,
                      backgroundColor: isParentActive(item) ? C.navBgActive : "transparent",
                      color: isParentActive(item) ? C.navTextActive : C.navText,
                      borderRadius: "8px",
                      borderLeft: isParentActive(item)
                        ? "2px solid transparent"
                        : hovered
                          ? `2px solid ${C.navHoverBorder}`
                          : "2px solid transparent",
                    }}
                  >
                    <Icon className="flex-shrink-0" style={{ width: 24, height: 24, color: isParentActive(item) ? C.navTextActive : C.navText }} strokeWidth={1.5} />
                    {!collapsed && (
                      <span style={{ fontSize: 16, fontWeight: isParentActive(item) ? 500 : 400 }}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Log Out ──────────────────────────────────────────────────── */}
      <div className="shrink-0 py-4" style={{ borderTop: `1px solid ${C.divider}`, paddingLeft: collapsed ? 6 : 20, paddingRight: collapsed ? 6 : 20 }}>
        <button
          onClick={() => logoutUser()}
          title={collapsed ? "Log Out" : undefined}
          className="flex w-full items-center gap-3 rounded-lg transition-all"
          style={{ paddingTop: 14, paddingBottom: 14, paddingLeft: collapsed ? 10 : 12, paddingRight: collapsed ? 10 : 12, color: C.logoutText }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.hoverBg; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
        >
          <LogOut className="flex-shrink-0" style={{ width: 24, height: 24, color: C.logoutText }} strokeWidth={1.5} />
          {!collapsed && <span style={{ fontSize: 16, fontWeight: 400 }}>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
