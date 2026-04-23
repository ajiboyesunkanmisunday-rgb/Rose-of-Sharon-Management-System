import Avatar from "./Avatar";
import { Phone, MessageSquare, Pencil } from "lucide-react";

interface DetailHeroProps {
  name: string;
  avatar?: string;
  subtitle?: string;
  badge?: string;
  phone?: string;
  email?: string;
  onEdit?: () => void;
}

export default function DetailHero({
  name,
  avatar,
  subtitle,
  badge,
  phone,
  email,
  onEdit,
}: DetailHeroProps) {
  return (
    <section className="-mx-4 -mt-4 mb-4 rounded-b-3xl bg-gradient-to-b from-[#000080] to-[#1E1E9A] px-4 pb-5 pt-6 text-white">
      <div className="flex items-center gap-4">
        <div className="rounded-full ring-4 ring-white/20">
          <Avatar name={name} src={avatar} size={72} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold">{name}</h2>
          {subtitle && <p className="truncate text-xs text-white/80">{subtitle}</p>}
          {badge && (
            <span className="mt-1 inline-block rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium">
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <a
          href={phone ? `tel:${phone.replace(/\s/g, "")}` : undefined}
          className="press flex flex-col items-center gap-1 rounded-xl bg-white/10 py-2.5 text-[11px] font-medium backdrop-blur"
        >
          <Phone size={16} />
          Call
        </a>
        <a
          href={phone ? `sms:${phone.replace(/\s/g, "")}` : email ? `mailto:${email}` : undefined}
          className="press flex flex-col items-center gap-1 rounded-xl bg-white/10 py-2.5 text-[11px] font-medium backdrop-blur"
        >
          <MessageSquare size={16} />
          Message
        </a>
        <button
          onClick={onEdit}
          className="press flex flex-col items-center gap-1 rounded-xl bg-white/10 py-2.5 text-[11px] font-medium backdrop-blur"
        >
          <Pencil size={16} />
          Edit
        </button>
      </div>
    </section>
  );
}
