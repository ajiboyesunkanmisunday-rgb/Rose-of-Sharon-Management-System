"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { isAuthenticated, isSessionExpired, logoutUser } from "@/lib/api";
import { ToastProvider } from "@/context/ToastContext";
import { useSidebar } from "@/context/SidebarContext";

function PageContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Re-key forces the enter animation on every route change
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarWidth } = useSidebar();

  // Detect desktop breakpoint for margin calculation
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated()) router.replace("/login");
  }, [router]);

  // Passive token expiry
  useEffect(() => {
    function checkExpiry() {
      if (isSessionExpired()) logoutUser();
    }
    const interval = setInterval(checkExpiry, 60_000);
    document.addEventListener("visibilitychange", checkExpiry);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", checkExpiry);
    };
  }, []);

  const openSidebar  = useCallback(() => setSidebarOpen(true),  []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        <TopNav onMenuOpen={openSidebar} />

        {/* Main content — margin tracks sidebar width on desktop, smooth transition */}
        <main
          className="mt-16 min-h-[calc(100vh-64px)] bg-white dark:bg-slate-800 p-4 sm:p-6"
          style={{
            marginLeft: isDesktop ? sidebarWidth : 0,
            transition: "margin-left 0.3s ease",
          }}
        >
          <PageContent>{children}</PageContent>
        </main>
      </div>
    </ToastProvider>
  );
}
