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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toTab(cat?: string): string {
  if (!cat) return "OTHER";
  const c = cat.toUpperCase();
  if (c.includes("SERMON"))                                      return "SERMONS";
  if (c.includes("PODCAST"))                                     return "PODCASTS";
  if (c.includes("VIDEO"))                                       return "VIDEOS";
  if (c.includes("PICTURE") || c.includes("IMAGE") || c.includes("PHOTO")) return "PICTURES";
  return "OTHER";
}

const tabLabels: Record<string, string> = {
  SERMONS:  "Sermon",
  PODCASTS: "Podcast",
  VIDEOS:   "Video",
  PICTURES: "Picture",
  OTHER:    "Media",
};

function fileSizeFmt(bytes?: number) {
  if (!bytes) return null;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000)     return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Extract the external URL embedded in the description field.
 * Stored as: "[External Link]: https://..."
 * Searches anywhere in the description (not just at the start).
 */
function extractExternalLink(description?: string | null): string | null {
  if (!description) return null;
  const match = description.match(/\[External Link\]:\s*(https?:\/\/[^\s]+)/i);
  return match ? match[1] : null;
}

/**
 * Return the YouTube hqdefault thumbnail URL for any recognised YouTube URL format.
 * Uses i.ytimg.com (the CDN YouTube's own APIs reference).
 */
function getYoutubeThumbnail(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname === "youtu.be") {
      id = u.pathname.slice(1).split(/[/?#]/)[0] || null;
    } else if (u.hostname.includes("youtube.com")) {
      id =
        u.searchParams.get("v") ??
        u.pathname.split("/embed/")[1]?.split(/[/?#]/)[0] ??
        u.pathname.split("/shorts/")[1]?.split(/[/?#]/)[0] ??
        null;
    }
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
}

/** Remove the "[External Link]: URL" line from description for display. */
function cleanDescription(description?: string | null): string | null {
  if (!description) return null;
  return description.replace(/\[External Link\]:\s*https?:\/\/[^\s]+\n?/gi, "").trim() || null;
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

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlayIcon({ size = 48, color = "#9CA3AF" }: { size?: number; color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

// ─── MediaCard ────────────────────────────────────────────────────────────────

type ThumbState = "loading" | "loaded" | "error";

function MediaCard({ item, onNavigate }: { item: MediaResponse; onNavigate: () => void }) {
  const cat    = item.mediaCategory ?? item.type ?? item.category;
  const tabKey = toTab(cat);
  const isImage = tabKey === "PICTURES";
  const mediaUrl  = item.displayUrl ?? item.url ?? "";
  const mediaSize = item.size ?? item.fileSize;

  // Resolve thumbnail source
  const externalLink = extractExternalLink(item.description);
  const isExternalUpload = !!externalLink;
  const ytThumbnail = !isImage
    ? (item.thumbnailUrl || getYoutubeThumbnail(externalLink) || getYoutubeThumbnail(mediaUrl))
    : null;

  const [thumbState, setThumbState] = useState<ThumbState>("loading");

  // Reset thumb state when the item changes
  useEffect(() => { setThumbState("loading"); }, [item.id]);

  const desc = cleanDescription(item.description);

  // ── Preview area ──────────────────────────────────────────────────────────
  const renderPreview = () => {
    // PICTURES — show the image directly
    if (isImage && mediaUrl) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl}
          alt={item.title ?? ""}
          className="h-full w-full object-cover"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      );
    }

    // YouTube / external URL — show thumbnail + play overlay
    if (ytThumbnail) {
      return (
        <>
          {/* Skeleton shown while loading */}
          {thumbState === "loading" && (
            <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700" />
          )}

          {/* Fallback icon shown on error */}
          {thumbState === "error" && <PlayIcon />}

          {/* Thumbnail image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ytThumbnail}
            alt={item.title ?? ""}
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              thumbState === "loaded" ? "opacity-100" : "opacity-0 absolute"
            }`}
            onLoad={() => setThumbState("loaded")}
            onError={() => setThumbState("error")}
          />

          {/* Play overlay — only visible when thumbnail has loaded */}
          {thumbState === "loaded" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 shadow-lg">
                <PlayIcon size={22} color="white" />
              </div>
            </div>
          )}
        </>
      );
    }

    // Local video / sermon — use <video preload="metadata"> for first-frame preview
    if (!isExternalUpload && mediaUrl && (tabKey === "SERMONS" || tabKey === "VIDEOS")) {
      return (
        <>
          <video
            src={mediaUrl}
            preload="metadata"
            className="h-full w-full object-cover"
            muted
            playsInline
            onLoadedMetadata={(e) => { (e.currentTarget as HTMLVideoElement).currentTime = 1; }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 shadow-lg">
              <PlayIcon size={22} color="white" />
            </div>
          </div>
        </>
      );
    }

    // Podcast / audio — microphone icon
    if (tabKey === "PODCASTS") return <MicIcon />;

    // Generic fallback
    return <PlayIcon />;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 transition-shadow hover:shadow-md">
      {/* Preview */}
      <div className="relative flex h-[160px] items-center justify-center overflow-hidden bg-[#F3F4F6] dark:bg-slate-700/30">
        {renderPreview()}
      </div>

      {/* Card body */}
      <div className="p-4">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${categoryColors[tabKey] ?? categoryColors.OTHER}`}>
          {tabLabels[tabKey] ?? "Media"}
        </span>
        <h3 className="mt-3 text-sm font-semibold text-[#111827] dark:text-slate-100 line-clamp-2 break-all">
          {item.title ?? item.displayName ?? "Untitled"}
        </h3>
        {desc && (
          <p className="mt-1 line-clamp-2 text-xs text-[#6B7280] dark:text-slate-400">{desc}</p>
        )}
        {/* Show a clean external link label instead of the raw URL */}
        {isExternalUpload && !desc && (
          <p className="mt-1 text-xs text-[#6B7280] dark:text-slate-400 italic">External link</p>
        )}
        <div className="mt-1 flex items-center gap-2 text-xs text-[#9CA3AF] dark:text-slate-400">
          <span>{fmtDate(item.createdOn)}</span>
          {fileSizeFmt(mediaSize) && <span>· {fileSizeFmt(mediaSize)}</span>}
        </div>
        <Button
          variant="secondary"
          onClick={onNavigate}
          className="mt-3 w-full"
        >
          {isImage ? "View" : "Watch"}
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  useEffect(() => { fetchMedia(currentPage); }, [currentPage, fetchMedia]);

  const displayed = items.filter((item) => {
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
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Media</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Sermons, podcasts, videos, and pictures</p>
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
      <div className="mb-6 flex gap-8 overflow-x-auto border-b border-[#E5E7EB] dark:border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
            className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[#000080] text-[#000080] dark:text-indigo-400"
                : "text-[#6B7280] dark:text-slate-400 hover:text-[#374151] dark:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {apiError} — <button className="font-medium underline" onClick={() => fetchMedia(currentPage)}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-400 dark:text-slate-500">Loading…</div>
      ) : displayed.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center text-sm text-gray-400 dark:text-slate-500">
          No media found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayed.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onNavigate={() => router.push(`/media/${item.id}`)}
            />
          ))}
        </div>
      )}

      <div className="mt-6">
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} onPageChange={setCurrentPage} />
      </div>
    </DashboardLayout>
  );
}
