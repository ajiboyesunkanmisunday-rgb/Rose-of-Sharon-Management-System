"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { isAuthenticated } from "@/lib/api";

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
    <div className="min-h-screen bg-gray-50">
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
          - Desktop: indented by sidebar width */}
      <main className="mt-16 min-h-[calc(100vh-64px)] bg-white p-4 sm:p-6 lg:ml-[322px]">
        {children}
      </main>
    </div>
  );
}
