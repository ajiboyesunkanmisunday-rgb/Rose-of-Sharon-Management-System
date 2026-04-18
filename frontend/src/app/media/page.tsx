"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import { mediaItems } from "@/lib/mock-data";
import { MediaType } from "@/lib/types";

type Tab = "All" | "Sermons" | "Podcasts" | "Videos";

const tabs: { key: Tab; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Sermons", label: "Sermons" },
  { key: "Podcasts", label: "Podcasts" },
  { key: "Videos", label: "Videos" },
];

const typeColors: Record<MediaType, string> = {
  Sermon: "bg-[#000080] text-white",
  Podcast: "bg-[#7C3AED] text-white",
  Video: "bg-[#16A34A] text-white",
};

export default function MediaPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const filtered = useMemo(() => {
    let items = mediaItems;
    if (activeTab !== "All") {
      const typeMap: Record<Exclude<Tab, "All">, MediaType> = {
        Sermons: "Sermon",
        Podcasts: "Podcast",
        Videos: "Video",
      };
      items = items.filter((m) => m.type === typeMap[activeTab]);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.speaker.toLowerCase().includes(q)
      );
    }
    return items;
  }, [search, activeTab]);

  const getActionLabel = (type: MediaType) =>
    type === "Podcast" ? "Listen" : "Watch";

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Media</h1>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={() => {}}
            placeholder="Search media..."
          />
        </div>
        <Button
          variant="primary"
          onClick={() => router.push("/media/upload")}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          }
        >
          Upload Media
        </Button>
      </div>

      <div className="mb-6 flex gap-8 border-b border-[#E5E7EB]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[#000080] text-[#000080]"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center text-sm text-gray-400">
          No media found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition-shadow hover:shadow-md"
            >
              <div className="flex h-[160px] items-center justify-center bg-[#F3F4F6]">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#9CA3AF" stroke="#9CA3AF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <div className="p-4">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${typeColors[item.type]}`}>
                  {item.type}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-[#111827]">{item.title}</h3>
                <p className="mt-1 text-xs text-[#6B7280]">
                  {item.speaker} · {item.date}
                </p>
                <p className="mt-1 text-xs text-[#9CA3AF]">Duration: {item.duration}</p>
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/media/${item.id}`)}
                  className="mt-3 w-full"
                >
                  {getActionLabel(item.type)}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
