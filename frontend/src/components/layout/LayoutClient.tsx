"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { isAuthenticated, isSessionExpired, logoutUser } from "@/lib/api";
import { ToastProvider } from "@/context/ToastContext";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Auth guard — redirect to login if no valid token
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  // Passive token expiry — check every 60 s and on tab focus
  useEffect(() => {
    function checkExpiry() {
      if (isSessionExpired()) {
        logoutUser();
      }
    }

    const interval = setInterval(checkExpiry, 60_000);
    document.addEventListener("visibilitychange", checkExpiry);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", checkExpiry);
    };
  }, []);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Close drawer whenever the user navigates to a new page on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll while drawer is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* Sidebar — always visible on desktop, drawer on mobile */}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Backdrop for mobile drawer */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* Top navigation */}
        <TopNav onMenuOpen={openSidebar} />

        {/* Main content area
            - Mobile/tablet: full width, pushed below top bar
            - Desktop: indented by sidebar width (272px) */}
        <main className="mt-16 min-h-[calc(100vh-64px)] bg-white dark:bg-slate-800 p-4 sm:p-6 lg:ml-[272px]">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
