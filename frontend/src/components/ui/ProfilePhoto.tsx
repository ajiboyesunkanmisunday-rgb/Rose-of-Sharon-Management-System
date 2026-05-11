"use client";

import { useState } from "react";

const FallbackIcon = ({ size = 64 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

interface ProfilePhotoProps {
  src?: string | null;
  alt?: string;
  className?: string;
  iconSize?: number;
}

/**
 * Profile photo with automatic fallback to the generic user icon when
 * the image URL is missing, null, or fails to load (broken URL / 403 / 404).
 */
export default function ProfilePhoto({ src, alt = "", className = "h-full w-full object-cover", iconSize = 64 }: ProfilePhotoProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <FallbackIcon size={iconSize} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} onError={() => setError(true)} />
  );
}
