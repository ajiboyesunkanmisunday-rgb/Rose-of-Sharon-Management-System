"use client";

import Image from "next/image";

interface PublicFormLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function PublicFormLayout({ title, subtitle, children }: PublicFormLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Image
            src="/rccg-icon-small.png"
            alt="RCCG"
            width={40}
            height={40}
            className="rounded-full shrink-0"
          />
          <div>
            <p className="text-[#000080] font-bold text-base leading-tight">Rose of Sharon</p>
            <p className="text-[#DA251D] text-xs font-medium leading-tight">RCCG</p>
          </div>
        </div>
      </header>

      {/* Title / Subtitle */}
      {(title || subtitle) && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-4 py-4">
            {title && (
              <h1 className="text-xl font-bold text-[#000080]">{title}</h1>
            )}
            {subtitle && (
              <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-gray-400">Rose of Sharon RCCG Church Management System</p>
      </footer>
    </div>
  );
}
