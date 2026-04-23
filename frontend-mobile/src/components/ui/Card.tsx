import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = "", onClick }: CardProps) {
  const base =
    "rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]";
  if (onClick) {
    return (
      <button onClick={onClick} className={`press ${base} text-left ${className}`}>
        {children}
      </button>
    );
  }
  return <div className={`${base} ${className}`}>{children}</div>;
}
