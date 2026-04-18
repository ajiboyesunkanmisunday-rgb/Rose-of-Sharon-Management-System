"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";

type MediaType = "Sermon" | "Podcast" | "Video";
type Tab = "All" | "Sermons" | "Podcasts" | "Videos";

interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  speaker: string;
  date: string;
  duration: string;
}

const mockMedia: MediaItem[] = [
  {
    id: "m1",
    title: "Sunday Sermon - Walking in Faith",
    type: "Sermon",
    speaker: "Pastor James Adewale",
    date: "Apr 12, 2026",
    duration: "45 min",
  },
  {
    id: "m2",
    title: "Midweek Teaching - The Power of Prayer",
    type: "Sermon",
    speaker: "Pastor Grace Nwosu",
    date: "Apr 8, 2026",
    duration: "38 min",
  },
  {
    id: "m3",
    title: "Youth Conference Highlights",
    type: "Video",
    speaker: "Media Team",
    date: "Apr 5, 2026",
    duration: "1h 20 min",
  },
  {
    id: "m4",
    title: "Faith & Family Podcast - Episode 12",
    type: "Podcast",
    speaker: "Deacon Emmanuel",
    date: "Apr 3, 2026",
    duration: "52 min",
  },
  {
    id: "m5",
    title: "Easter Sunday Special Service",
    type: "Video",
    speaker: "Senior Pastor",
    date: "Mar 29, 2026",
    duration: "1h 5 min",
  },
  {
    id: "m6",
    title: "Worship Night Podcast Recap",
    type: "Podcast",
    speaker: "Worship Team",
    date: "Mar 25, 2026",
    duration: "30 min",
  },
];

const typeBadgeColors: Record<MediaType, string> = {
  Sermon: "bg-[#000080] text-white",
  Podcast: "bg-purple-100 text-purple-800",
  Video: "bg-blue-100 text-blue-800",
};

const tabToType: Record<Tab, MediaType | null> = {
  All: null,
  Sermons: "Sermon",
  Podcasts: "Podcast",
  Videos: "Video",
};

export default function MediaPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const tabs: { key: Tab; label: string }[] = [
    { key: "All", label: "All" },
    { key: "Sermons", label: "Sermons" },
    { key: "Podcasts", label: "Podcasts" },
    { key: "Videos", label: "Videos" },
  ];

  const filteredMedia = useMemo(() => {
    let items = mockMedia;

    const typeFilter = tabToType[activeTab];
    if (typeFilter) {
      items = items.filter((m) => m.type === typeFilter);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      items = items.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.speaker.toLowerCase().includes(query)
      );
    }

    return items;
  }, [search, activeTab]);

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Media</h1>
      </div>

      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
          onClick={() => {}}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Add Media
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-6 border-b border-[#E5E7EB]">
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

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMedia.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden"
          >
            {/* Thumbnail */}
            <div className="flex h-[160px] items-center justify-center bg-[#F3F4F6]">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeColors[item.type]}`}
                >
                  {item.type}
                </span>
                <span className="text-xs text-[#9CA3AF]">{item.duration}</span>
              </div>
              <h3 className="text-sm font-bold text-[#111827]">{item.title}</h3>
              <p className="mt-1 text-sm text-[#6B7280]">{item.speaker}</p>
              <p className="mt-0.5 text-xs text-[#9CA3AF]">{item.date}</p>
              <div className="mt-3">
                <Button variant="secondary" onClick={() => {}} className="w-full">
                  {item.type === "Podcast" ? "Listen" : "Watch"}
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredMedia.length === 0 && (
          <div className="col-span-3 py-12 text-center text-sm text-gray-400">
            No media found.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
