"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { isAuthenticated, isSessionExpired, logoutUser } from "@/lib/api";
import { ToastProvider } from "@/context/ToastContext";
import { useState, useCallback } from "react";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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

        {/* Main content */}
        <main className="mt-16 min-h-[calc(100vh-64px)] bg-white dark:bg-slate-800 p-4 sm:p-6 lg:ml-[272px]">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
