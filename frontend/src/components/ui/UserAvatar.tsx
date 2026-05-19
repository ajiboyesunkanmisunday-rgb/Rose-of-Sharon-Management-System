/**
 * UserAvatar — shows a profile picture thumbnail when available,
 * falling back to coloured initials. Used across all user-management
 * list pages so the behaviour is consistent everywhere.
 */

const BG_COLORS = [
  "bg-[#B5B5F3] text-[#000080]",
  "bg-[#BFDBFE] text-[#1D4ED8]",
  "bg-[#BBF7D0] text-[#15803D]",
  "bg-[#FDE68A] text-[#92400E]",
  "bg-[#FECACA] text-[#991B1B]",
  "bg-[#DDD6FE] text-[#5B21B6]",
  "bg-[#A7F3D0] text-[#065F46]",
  "bg-[#FED7AA] text-[#92400E]",
];

function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return BG_COLORS[Math.abs(hash) % BG_COLORS.length];
}

function initials(firstName?: string | null, lastName?: string | null): string {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

interface UserAvatarProps {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
  size?: "sm" | "md";
}

export default function UserAvatar({
  id,
  firstName,
  lastName,
  profilePictureUrl,
  size = "md",
}: UserAvatarProps) {
  const dim = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

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
      className={`${dim} ${avatarColor(id)} flex shrink-0 items-center justify-center rounded-full font-bold`}
    >
      {initials(firstName, lastName)}
    </div>
  );
}
