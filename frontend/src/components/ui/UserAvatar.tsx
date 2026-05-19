/**
 * UserAvatar — shows a profile picture thumbnail when one exists.
 * Falls back to a plain grey placeholder (no coloured initials).
 * Coloured initials are only used in Church Directory, not here.
 */

interface UserAvatarProps {
  id?: string;
  profilePictureUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  size?: "sm" | "md";
}

export default function UserAvatar({
  profilePictureUrl,
  firstName,
  lastName,
  size = "md",
}: UserAvatarProps) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  if (profilePictureUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profilePictureUrl}
        alt={`${firstName ?? ""} ${lastName ?? ""}`.trim() || "Profile"}
        className={`${dim} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-gray-200`}
    >
      <svg
        width={size === "sm" ? 16 : 20}
        height={size === "sm" ? 16 : 20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9CA3AF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}
