interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Avatar({ name, src, size = 40 }: AvatarProps) {
  const style = { width: size, height: size, fontSize: size * 0.38 };
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover"
        style={style}
      />
    );
  }
  return (
    <div
      style={style}
      className="flex items-center justify-center rounded-full bg-[#B5B5F3] font-semibold text-[#000080]"
    >
      {initials(name)}
    </div>
  );
}
