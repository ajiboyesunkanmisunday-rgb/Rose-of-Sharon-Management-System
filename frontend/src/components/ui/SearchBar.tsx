"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Search",
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-full border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
      />
      <button
        onClick={onSearch}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#000080] transition-colors hover:bg-[#000066]"
        aria-label="Search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </div>
  );
}
