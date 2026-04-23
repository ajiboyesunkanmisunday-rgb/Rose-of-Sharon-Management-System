"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import SearchField from "@/components/ui/SearchField";
import Chip from "@/components/ui/Chip";
import { mediaItems } from "@/lib/mock-data";
import { MediaType } from "@/lib/types";
import { Mic, Video, Image as ImageIcon, Headphones, Clock } from "lucide-react";

const TYPES: (MediaType | "All")[] = ["All", "Sermon", "Podcast", "Video", "Picture"];

const iconFor = (t: MediaType) => {
  if (t === "Sermon") return Mic;
  if (t === "Podcast") return Headphones;
  if (t === "Video") return Video;
  return ImageIcon;
};

const bgFor: Record<MediaType, string> = {
  Sermon: "from-indigo-500 to-indigo-700",
  Podcast: "from-purple-500 to-purple-700",
  Video: "from-rose-500 to-rose-700",
  Picture: "from-teal-500 to-teal-700",
};

export default function MediaPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<MediaType | "All">("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mediaItems.filter(
      (m) =>
        (type === "All" || m.type === type) &&
        (!q ||
          m.title.toLowerCase().includes(q) ||
          m.speaker.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)),
    );
  }, [search, type]);

  return (
    <AppShell title="Media" subtitle={`${filtered.length} items`}>
      <SearchField value={search} onChange={setSearch} placeholder="Search media..." />

      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {TYPES.map((t) => (
          <Chip key={t} label={t} active={type === t} onClick={() => setType(t)} />
        ))}
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3">
        {filtered.map((m) => {
          const Icon = iconFor(m.type);
          return (
            <li
              key={m.id}
              className="press overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white"
            >
              <div
                className={`flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${bgFor[m.type]} text-white`}
              >
                <Icon size={32} />
              </div>
              <div className="p-3">
                <span className="inline-block rounded-full bg-[#F4F5FB] px-2 py-0.5 text-[10px] font-semibold text-[#000080]">
                  {m.type}
                </span>
                <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-[#0F172A]">
                  {m.title}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-[#6B7280]">{m.speaker}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-[#6B7280]">
                  <Clock size={11} /> {m.duration}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {filtered.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-4 py-10 text-center text-sm text-[#6B7280]">
          No media items.
        </p>
      )}
    </AppShell>
  );
}
