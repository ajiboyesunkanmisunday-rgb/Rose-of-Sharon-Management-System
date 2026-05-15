"use client";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "outline";
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
}

const variantStyles: Record<string, string> = {
  primary: "bg-[#000080] text-white hover:bg-[#000066]",
  secondary: "bg-[#B5B5F3] text-[#000080] hover:bg-[#A3A3E8]",
  danger: "bg-red-600 text-white hover:bg-red-700",
  outline: "bg-transparent border border-[#E5E7EB] text-[#374151] hover:bg-gray-50",
};

export default function Button({
  variant = "secondary",
  children,
  onClick,
  icon,
  className = "",
  type = "button",
  disabled = false,
  loading = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${className}`}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        icon && <span className="flex shrink-0 items-center">{icon}</span>
      )}
      {children}
    </button>
  );
}
