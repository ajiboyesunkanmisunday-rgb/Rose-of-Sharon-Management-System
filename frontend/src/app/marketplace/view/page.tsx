"use client";

import { Suspense } from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import {
  getProduct,
  updateProduct,
  deleteProduct,
  approveProducts,
  uploadMedia,
  type ProductResponse,
} from "@/lib/api";
import { Package, Pencil, Trash2, CheckCircle, ImagePlus, Video, X, Play } from "lucide-react";

const CATEGORY_OPTIONS = [
  { label: "Select category…", value: "" },
  { label: "Book",             value: "BOOK" },
  { label: "Electronics",      value: "ELECTRONICS" },
  { label: "Cooking Utensils", value: "COOKING_UTENSILS" },
  { label: "Automobile",       value: "AUTOMOBILE" },
  { label: "Wears",            value: "WEARS" },
];

const MAX_NAME  = 120;
const MAX_DESC  = 1000;
const MAX_INFO  = 1000;
const MAX_MEDIA = 6;

function fullName(u?: { firstName?: string; middleName?: string; lastName?: string } | null) {
  if (!u) return "—";
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fmtDate(s?: any): string {
  if (!s) return "—";
  if (Array.isArray(s)) {
    const [year, month, day] = s as number[];
    return new Date(year, month - 1, day).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  const d = new Date(s as string);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtCategory(c?: string) {
  if (!c) return "—";
  return c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|avi|mkv|m4v|ogv)(\?|$)/i.test(url) || url.includes("/VIDEOS/");
}

/** Upload a single file and return its public URL. */
async function uploadOneFile(file: File): Promise<string> {
  const isVideo = file.type.startsWith("video/");
  const result = await uploadMedia({
    title: `product-${Date.now()}-${file.name.replace(/\s+/g, "_")}`,
    category: isVideo ? "VIDEOS" : "IMAGES",
    file,
  });
  const url = result.displayUrl ?? result.url;
  if (!url) throw new Error(`Uploaded "${file.name}" but no URL was returned.`);
  return url;
}

function ProductDetailView() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  const [product,   setProduct]   = useState<ProductResponse | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [editing,   setEditing]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [approving, setApproving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    name:             "",
    description:      "",
    price:            "",
    category:         "",
    quantityLeft:     "",
    otherInformation: "",
    tagsRaw:          "",
  });

  // Existing media URLs (from the saved product) — can be removed
  const [existingMedia, setExistingMedia] = useState<string[]>([]);
  // New files staged for upload
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
  const [uploading,     setUploading]     = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Lightbox
  const [lightbox, setLightbox] = useState<string | null>(null);

  const totalMediaCount = existingMedia.length + newMediaFiles.length;

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const data = await getProduct(id);
      setProduct(data);
      setFormData({
        name:             data.name ?? "",
        description:      data.description ?? "",
        price:            data.price != null ? data.price.toLocaleString("en-NG") : "",
        category:         data.productCategory ?? "",
        quantityLeft:     data.quantityLeft != null ? String(data.quantityLeft) : "",
        otherInformation: data.otherInformation ?? "",
        tagsRaw:          (data.tags ?? []).join(", "),
      });
      setExistingMedia(data.images ?? []);
      setNewMediaFiles([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load product.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!incoming.length) return;
    setNewMediaFiles((prev) => {
      const slots = MAX_MEDIA - existingMedia.length - prev.length;
      if (slots <= 0) return prev;
      return [...prev, ...incoming.slice(0, slots)];
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      let newUrls: string[] = [];
      if (newMediaFiles.length > 0) {
        setUploading(true);
        newUrls = await Promise.all(newMediaFiles.map(uploadOneFile));
        setUploading(false);
      }

      const images = existingMedia.length > 0 || newUrls.length > 0
        ? [...existingMedia, ...newUrls]
        : undefined;

      const tags = formData.tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);

      const updated = await updateProduct(id, {
        name:             formData.name.trim(),
        description:      formData.description.trim() || undefined,
        price:            formData.price ? Number(formData.price.replace(/,/g, "")) : undefined,
        category:         formData.category || undefined,
        otherInformation: formData.otherInformation.trim() || undefined,
        tags:             tags.length ? tags : undefined,
        owner:            product?.owner?.id,
        images,
      });

      const finalImages = images ?? product?.images;
      const finalQty    = formData.quantityLeft
        ? parseInt(formData.quantityLeft, 10)
        : product?.quantityLeft;

      setProduct({ ...updated, images: finalImages, quantityLeft: finalQty });
      setExistingMedia(finalImages ?? []);
      setNewMediaFiles([]);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save product.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      await approveProducts([id]);
      setProduct((p) => p ? { ...p, isApproved: true } : p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to approve product.");
    } finally { setApproving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(id);
      router.push("/marketplace");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete product.");
      setDeleting(false);
    }
  };

  if (!id) {
    return (
      <DashboardLayout>
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          No product ID provided.{" "}
          <button onClick={() => router.push("/marketplace")} className="font-medium underline">Back to Marketplace</button>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-[#9CA3AF] dark:text-slate-500">Loading…</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !product) {
    return (
      <DashboardLayout>
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button onClick={load} className="font-medium underline">Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>
          {isVideoUrl(lightbox) ? (
            <video
              src={lightbox}
              controls
              autoPlay
              className="max-h-[80vh] max-w-full rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lightbox}
              alt="Product media"
              className="max-h-[80vh] max-w-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}

      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/marketplace")}
            className="flex items-center text-[#000080] dark:text-indigo-400 hover:text-[#000066] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-[#000080] dark:text-indigo-400">Product Details</h2>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {product && !editing && (
        <>
          {/* View mode */}
          <div className="mb-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            {/* Media gallery */}
            {(product.images ?? []).length > 0 && (
              <div className="mb-5">
                {/* Primary display */}
                <div
                  className="mb-2 cursor-pointer overflow-hidden rounded-xl"
                  onClick={() => setLightbox(product.images![0])}
                >
                  {isVideoUrl(product.images![0]) ? (
                    <div className="relative flex h-56 items-center justify-center rounded-xl bg-black">
                      <video src={product.images![0]} className="max-h-56 rounded-xl" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-white/30 p-4">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images![0]}
                      alt={product.name}
                      className="h-56 w-full rounded-xl object-cover"
                    />
                  )}
                </div>
                {/* Thumbnails strip */}
                {product.images!.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {product.images!.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLightbox(url)}
                        className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 border-[#E5E7EB] dark:border-slate-700 hover:border-[#000080] transition-colors"
                      >
                        {isVideoUrl(url) ? (
                          <div className="flex h-full w-full items-center justify-center bg-[#1a1a2e]">
                            <Video className="h-5 w-5 text-white" />
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={url} alt="" className="h-full w-full object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* If no media */}
            {!(product.images ?? []).length && (
              <div className="mb-5 flex h-40 items-center justify-center rounded-xl bg-[#F3F4F6] dark:bg-slate-700">
                <Package className="h-16 w-16 text-[#D1D5DB] dark:text-slate-500" />
              </div>
            )}

            {/* Product details */}
            <div className="flex-1 min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-[#111827] dark:text-slate-100">{product.name}</h3>
                {product.isApproved ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
                    <CheckCircle className="h-3 w-3" /> Approved
                  </span>
                ) : (
                  <span className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:text-yellow-300">
                    Pending Approval
                  </span>
                )}
              </div>

              {product.description && (
                <p className="mb-4 text-sm text-[#374151] dark:text-slate-300 leading-relaxed">{product.description}</p>
              )}

              <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="font-medium text-[#6B7280] dark:text-slate-400">Price</dt>
                  <dd className="font-bold text-[#111827] dark:text-slate-100">
                    {product.price != null ? `₦${product.price.toLocaleString("en-NG")}` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-[#6B7280] dark:text-slate-400">Category</dt>
                  <dd className="text-[#374151] dark:text-slate-300">{fmtCategory(product.productCategory)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-[#6B7280] dark:text-slate-400">Qty Available</dt>
                  <dd className="text-[#374151] dark:text-slate-300">{product.quantityLeft ?? "—"}</dd>
                </div>
                {product.averageRating != null && (
                  <div>
                    <dt className="font-medium text-[#6B7280] dark:text-slate-400">Avg. Rating</dt>
                    <dd className="text-[#374151] dark:text-slate-300">{product.averageRating.toFixed(1)} / 5</dd>
                  </div>
                )}
                <div>
                  <dt className="font-medium text-[#6B7280] dark:text-slate-400">Listed</dt>
                  <dd className="text-[#374151] dark:text-slate-300">{fmtDate(product.createdOn)}</dd>
                </div>
              </dl>

              {product.tags && product.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-[#F3F4F6] dark:bg-slate-700 px-2.5 py-0.5 text-xs text-[#374151] dark:text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {product.otherInformation && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">Other Information</p>
                  <p className="mt-1 text-sm text-[#374151] dark:text-slate-300">{product.otherInformation}</p>
                </div>
              )}
            </div>
          </div>

          {/* Owner card */}
          {product.owner && (
            <div className="mb-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h4 className="mb-3 text-sm font-bold text-[#111827] dark:text-slate-100">Owner</h4>
              <div className="flex items-center gap-3">
                {product.owner.profilePictureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.owner.profilePictureUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#000080]/10 text-sm font-bold text-[#000080] dark:text-indigo-400">
                    {`${product.owner.firstName?.[0] ?? ""}${product.owner.lastName?.[0] ?? ""}`.toUpperCase() || "?"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-[#111827] dark:text-slate-100">{fullName(product.owner)}</p>
                  {product.owner.email && <p className="text-xs text-[#6B7280] dark:text-slate-400">{product.owner.email}</p>}
                  {product.owner.phoneNumber && <p className="text-xs text-[#6B7280] dark:text-slate-400">{product.owner.phoneNumber}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
            {!product.isApproved && (
              <Button variant="secondary" onClick={handleApprove} disabled={approving}>
                <CheckCircle className="h-4 w-4 mr-1" />
                {approving ? "Approving…" : "Approve"}
              </Button>
            )}
            <Button variant="primary" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
          </div>
        </>
      )}

      {/* ── Edit mode ── */}
      {product && editing && (
        <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#111827] dark:text-slate-100">Edit Product</h3>
            <button
              onClick={() => {
                setEditing(false);
                setNewMediaFiles([]);
                setExistingMedia(product.images ?? []);
              }}
              className="text-sm text-[#6B7280] hover:underline"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-5">
            <FormField
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value.slice(0, MAX_NAME) }))}
              placeholder="Product name"
              required
              showCount
              maxLength={MAX_NAME}
            />

            <TextAreaField
              label="Description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value.slice(0, MAX_DESC) }))}
              placeholder="Describe the product…"
              rows={4}
              showCount
              maxLength={MAX_DESC}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                label="Price (₦)"
                name="price"
                value={formData.price}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  const formatted = raw === "" ? "" : Number(raw).toLocaleString("en-NG");
                  setFormData((p) => ({ ...p, price: formatted }));
                }}
                placeholder="e.g. 5,000"
              />
              <FormField
                label="Quantity Available"
                name="quantityLeft"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={formData.quantityLeft}
                onChange={(e) => setFormData((p) => ({ ...p, quantityLeft: e.target.value }))}
                placeholder="e.g. 1"
              />
            </div>

            <SelectField
              label="Category"
              name="category"
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              options={CATEGORY_OPTIONS}
            />

            <FormField
              label="Tags (comma-separated)"
              name="tags"
              value={formData.tagsRaw}
              onChange={(e) => setFormData((p) => ({ ...p, tagsRaw: e.target.value }))}
              placeholder="e.g. phone, android, second-hand"
            />

            <TextAreaField
              label="Other Information"
              name="otherInformation"
              value={formData.otherInformation}
              onChange={(e) => setFormData((p) => ({ ...p, otherInformation: e.target.value.slice(0, MAX_INFO) }))}
              placeholder="Any additional details…"
              rows={3}
              showCount
              maxLength={MAX_INFO}
            />

            {/* ── Media management ── */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#374151] dark:text-slate-300">
                Product Images &amp; Video
                <span className="ml-1 text-xs font-normal text-[#6B7280] dark:text-slate-400">
                  (up to {MAX_MEDIA} files)
                </span>
              </label>

              {/* Combined grid: existing URLs + new files */}
              {(existingMedia.length > 0 || newMediaFiles.length > 0) && (
                <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {/* Existing URLs */}
                  {existingMedia.map((url, idx) => (
                    <div key={`existing-${idx}`} className="group relative aspect-square overflow-hidden rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F3F4F6] dark:bg-slate-700">
                      {isVideoUrl(url) ? (
                        <div className="flex h-full w-full items-center justify-center bg-[#1a1a2e]">
                          <Video className="h-6 w-6 text-white/70" />
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => setExistingMedia((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                      <span className="absolute bottom-0.5 left-0.5 rounded bg-black/50 px-1 py-0.5 text-[8px] font-medium text-white uppercase">
                        {isVideoUrl(url) ? "video" : "img"}
                      </span>
                    </div>
                  ))}

                  {/* New staged files */}
                  {newMediaFiles.map((file, idx) => (
                    <div key={`new-${idx}`} className="group relative aspect-square overflow-hidden rounded-lg border border-[#000080]/40 dark:border-indigo-500/40 bg-[#F3F4F6] dark:bg-slate-700">
                      {file.type.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={URL.createObjectURL(file)} alt={file.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-1 text-center">
                          <Video className="h-6 w-6 text-[#6B7280] dark:text-slate-400" />
                          <span className="line-clamp-2 text-[9px] text-[#6B7280] dark:text-slate-400 break-all">{file.name}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setNewMediaFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                      {/* "New" badge */}
                      <span className="absolute bottom-0.5 left-0.5 rounded bg-[#000080]/80 px-1 py-0.5 text-[8px] font-medium text-white uppercase">
                        new
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add-more button */}
              {totalMediaCount < MAX_MEDIA ? (
                <button
                  type="button"
                  onClick={() => mediaInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E5E7EB] dark:border-slate-600 py-4 text-sm font-medium text-[#6B7280] dark:text-slate-400 hover:border-[#000080] dark:hover:border-indigo-500 hover:text-[#000080] dark:hover:text-indigo-400 transition-colors"
                >
                  <ImagePlus className="h-4 w-4" />
                  {totalMediaCount === 0 ? "Add images or video" : `Add more (${totalMediaCount}/${MAX_MEDIA})`}
                </button>
              ) : (
                <p className="text-center text-xs text-[#6B7280] dark:text-slate-400">
                  Maximum {MAX_MEDIA} files reached.
                </p>
              )}

              <input
                ref={mediaInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaChange}
                className="hidden"
              />
              {newMediaFiles.length > 0 && (
                <p className="mt-1.5 text-xs text-[#9CA3AF] dark:text-slate-400">
                  Blue-bordered thumbnails are new and will be uploaded on save.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => {
                setEditing(false);
                setNewMediaFiles([]);
                setExistingMedia(product.images ?? []);
              }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={saving || uploading || !formData.name.trim()}>
                {uploading ? "Uploading media…" : saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-xl">
            <h3 className="mb-2 text-base font-bold text-[#111827] dark:text-slate-100">Delete Product</h3>
            <p className="mb-5 text-sm text-[#6B7280] dark:text-slate-400">
              Are you sure you want to permanently delete <strong>{product?.name}</strong>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setConfirmDelete(false)} disabled={deleting}>Cancel</Button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function MarketplaceViewPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-[#9CA3AF] dark:text-slate-500">Loading…</p>
        </div>
      </DashboardLayout>
    }>
      <ProductDetailView />
    </Suspense>
  );
}
