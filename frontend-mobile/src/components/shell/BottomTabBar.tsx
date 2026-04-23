"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Calendar, MessageSquare, Menu } from "lucide-react";

interface Tab {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  match: (path: string) => boolean;
}

const tabs: Tab[] = [
  { label: "Home", href: "/dashboard", icon: Home, match: (p) => p === "/dashboard" || p === "/" },
  {
    label: "People",
    href: "/members",
    icon: Users,
    match: (p) => p.startsWith("/members") || p.startsWith("/first-timers") || p.startsWith("/second-timers") || p.startsWith("/new-converts") || p.startsWith("/e-members"),
  },
  { label: "Events", href: "/events", icon: Calendar, match: (p) => p.startsWith("/events") || p.startsWith("/calendar") },
  { label: "Messages", href: "/messages", icon: MessageSquare, match: (p) => p.startsWith("/messages") || p.startsWith("/communication") },
  { label: "More", href: "/more", icon: Menu, match: (p) => p.startsWith("/more") || p.startsWith("/settings") || p.startsWith("/profile") || p.startsWith("/reports") },
];

export default function BottomTabBar() {
  const pathname = usePathname() || "/";
  return (
    <nav
      className="sticky bottom-0 z-40 border-t border-[#E5E7EB] bg-white/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.match(pathname);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className="press flex flex-col items-center justify-center gap-1 py-2.5"
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.4 : 1.8}
                />
                <span
                  className={`text-[11px] ${active ? "font-semibold text-[#000080]" : "text-[#6B7280]"}`}
                  style={{ color: active ? "#000080" : undefined }}
                >
                  {tab.label}
                </span>
                {active && (
                  <span className="absolute mt-10 h-1 w-1 rounded-full bg-[#000080]" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
