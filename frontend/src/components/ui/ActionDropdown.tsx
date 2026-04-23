"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface Action {
  label: string;
  onClick: () => void;
}

interface ActionDropdownProps {
  actions: Action[];
}

const MENU_WIDTH = 200;

export default function ActionDropdown({ actions }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click / escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const handleScroll = () => setIsOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isOpen]);

  // Position the menu relative to the button, flipping up if near bottom.
  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = Math.max(actions.length * 40 + 8, 48);
    const viewportH = window.innerHeight;
    const spaceBelow = viewportH - rect.bottom;
    const openUp = spaceBelow < menuHeight + 8 && rect.top > menuHeight + 8;

    const top = openUp ? rect.top - menuHeight - 4 : rect.bottom + 4;
    // Right-align menu with the button.
    let left = rect.right - MENU_WIDTH;
    if (left < 8) left = 8;
    if (left + MENU_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - MENU_WIDTH - 8;
    }

    setCoords({ top, left });
  }, [isOpen, actions.length]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-8 w-8 items-center justify-center rounded text-[#6B7280] transition-colors hover:bg-gray-100"
        aria-label="Actions"
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>

      {isOpen && coords && (
        <div
          ref={menuRef}
          className="fixed z-50 rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg"
          style={{
            top: coords.top,
            left: coords.left,
            width: MENU_WIDTH,
          }}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className="block w-full px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
