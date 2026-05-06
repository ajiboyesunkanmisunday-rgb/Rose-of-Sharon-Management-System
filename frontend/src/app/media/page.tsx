"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import { getMedia, type MediaResponse } from "@/lib/api";
import { Film } from "lucide-react";

const ITEMS_PER_PAGE = 12;

// Normalise category to tab key
function toTab(cat?: string): string {
  if (!cat) return "OTHER";
  const c = cat.toUpperCase();
  if (c.includes("SERMON")) return "SERMONS";
  if (c.includes("PODCAST")) return "PODCASTS";
  if (c.includes("VIDEO")) return "VIDEOS";
  if (c.includes("PICTURE") || c.includes("IMAGE") || c.includes("PHOTO")) return "PICTURES";
  return "OTHER";
}

function fileSizeFmt(bytes?: number) {
  if (!bytes) return null;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const categoryColors: Record<string, string> = {
  SERMONS:  "bg-[#000080] text-white",
  PODCASTS: "bg-[#7C3AED] text-white",
  VIDEOS:   "bg-[#16A34A] text-white",
  PICTURES: "bg-[#F59E0B] text-white",
  OTHER:    "bg-[#6B7280] text-white",
};

const tabs: { key: string; label: string }[] = [
  { key: "ALL",      label: "All"      },
  { key: "SERMONS",  label: "Sermons"  },
  { key: "PODCASTS", label: "Podcasts" },
  { key: "VIDEOS",   label: "Videos"   },
  { key: "PICTURES", label: "Pictures" },
];

export default function MediaPage() {
  const router = useRouter();
  const [items,       setItems]       = useState<MediaResponse[]>([]);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalItems,  setTotalItems]  = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [apiError,    setApiError]    = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search,      setSearch]      = useState("");
  const [activeTab,   setActiveTab]   = useState("ALL");

  const fetchMedia = useCallback(async (page: number) => {
    setLoading(true);
    setApiError("");
    try {
      const res = await getMedia(page - 1, ITEMS_PER_PAGE);
      setItems(res.content ?? []);
      setTotalPages(res.totalPages ?? 1);
      setTotalItems(res.totalElements ?? 0);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load media.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia(currentPage);
  }, [currentPage, fetchMedia]);

  // Client-side tab + search filter
  const displayed = items.filter((item) => {
    // Backend sends "type" or "mediaCategory"; support both for compatibility
    const cat = item.mediaCategory ?? item.type ?? item.category;
    if (activeTab !== "ALL" && toTab(cat) !== activeTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        (item.title ?? "").toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q) ||
        (cat ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4]">
          <Film className="h-6 w-6 text-[#059669]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000]">Media</h1>
          <p className="text-sm text-[#6B7280]">Sermons, podcasts, videos, and pictures</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={() => setCurrentPage(1)}
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

      {/* Tabs */}
      <div className="mb-6 flex gap-8 overflow-x-auto border-b border-[#E5E7EB]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
            className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[#000080] text-[#000080]"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError} — <button className="font-medium underline" onClick={() => fetchMedia(currentPage)}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-400">Loading…</div>
      ) : displayed.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center text-sm text-gray-400">
          No media found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((item) => {
            const cat = item.mediaCategory ?? item.type ?? item.category;
            const tabKey = toTab(cat);
            const isImage = tabKey === "PICTURES";
            const mediaUrl = item.displayUrl ?? item.url;
            const mediaSize = item.size ?? item.fileSize;
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition-shadow hover:shadow-md"
              >
                <div className="flex h-[160px] items-center justify-center overflow-hidden bg-[#F3F4F6]">
                  {isImage && mediaUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl} alt={item.title ?? ""} className="h-full w-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#9CA3AF" stroke="#9CA3AF" strokeWidth="1">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </div>
                <div className="p-4">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${categoryColors[tabKey] ?? categoryColors.OTHER}`}>
                    {cat ?? tabKey}
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-[#111827]">{item.title ?? item.displayName ?? "Untitled"}</h3>
                  {item.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-[#6B7280]">{item.description}</p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-xs text-[#9CA3AF]">
                    <span>{fmtDate(item.createdOn)}</span>
                    {fileSizeFmt(mediaSize) && <span>· {fileSizeFmt(mediaSize)}</span>}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/media/${item.id}`)}
                    className="mt-3 w-full"
                  >
                    {isImage ? "View" : "Watch"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} onPageChange={setCurrentPage} />
      </div>
    </DashboardLayout>
  );
}
