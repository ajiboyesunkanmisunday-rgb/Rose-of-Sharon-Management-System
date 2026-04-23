interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`press whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-[#000080] text-white"
          : "bg-white text-[#374151] ring-1 ring-[#E5E7EB]"
      }`}
    >
      {label}
    </button>
  );
}
