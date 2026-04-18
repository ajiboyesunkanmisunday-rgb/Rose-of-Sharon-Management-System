"use client";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const variantStyles: Record<string, string> = {
  primary: "bg-[#000080] text-white hover:bg-[#000066]",
  secondary: "bg-[#B5B5F3] text-[#000080] hover:bg-[#A3A3E8]",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export default function Button({
  variant = "secondary",
  children,
  onClick,
  icon,
  className = "",
  type = "button",
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="flex shrink-0 items-center">{icon}</span>}
      {children}
    </button>
  );
}
