import Image from "next/image";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-screen w-full bg-[#F7F7FB]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left panel — brand */}
        <div className="relative hidden flex-col justify-between bg-[#000080] p-10 text-white lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <Image
                src="/rccg-logo.png"
                alt="RCCG Rose of Sharon"
                width={40}
                height={40}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-[#B5B5F3]">RCCG</p>
              <p className="text-lg font-semibold">Rose of Sharon</p>
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="text-[32px] font-bold leading-tight">
              Rose of Sharon Management System
            </h2>
            <p className="mt-4 text-sm text-[#B5B5F3]">
              Manage members, follow-ups, events, communications and more in
              one place.
            </p>
          </div>

          <p className="text-xs text-[#B5B5F3]">
            © {new Date().getFullYear()} RCCG Rose of Sharon. All rights
            reserved.
          </p>
        </div>

        {/* Right panel — form */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#000080]">
                <Image
                  src="/rccg-logo.png"
                  alt="RCCG Rose of Sharon"
                  width={28}
                  height={28}
                />
              </div>
              <div>
                <p className="text-xs font-medium text-[#000080]">RCCG</p>
                <p className="text-base font-semibold text-[#000000]">
                  Rose of Sharon
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <h1 className="text-[24px] font-bold text-[#000000]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>
                )}
              </div>

              {children}
            </div>

            {footer && (
              <div className="mt-6 text-center text-sm text-[#6B7280]">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
