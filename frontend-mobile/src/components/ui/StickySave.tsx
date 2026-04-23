"use client";

interface StickySaveProps {
  onClick?: () => void;
  label?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function StickySave({
  onClick,
  label = "Save",
  type = "submit",
  disabled,
}: StickySaveProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E5E7EB] bg-white px-4 pb-4 pt-3"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
    >
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className="press w-full rounded-xl bg-[#000080] py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_-8px_rgba(0,0,128,0.55)] disabled:opacity-60"
      >
        {label}
      </button>
    </div>
  );
}
