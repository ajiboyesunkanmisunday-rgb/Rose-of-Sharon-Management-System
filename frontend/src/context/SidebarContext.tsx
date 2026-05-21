"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

interface SidebarContextValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
  /** px width of sidebar — 64 when collapsed, 272 when open */
  sidebarWidth: number;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggleCollapsed: () => {},
  sidebarWidth: 272,
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // Persist preference
  useEffect(() => {
    const stored = localStorage.getItem("rosms-sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("rosms-sidebar-collapsed", String(next));
      return next;
    });
  }, []);

  return (
    <SidebarContext.Provider
      value={{ collapsed, toggleCollapsed, sidebarWidth: collapsed ? 64 : 272 }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
