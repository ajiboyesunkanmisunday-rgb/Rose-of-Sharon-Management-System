"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import {
  createProduct,
  searchMembers,
  uploadMedia,
  type UserResponse,
} from "@/lib/api";
import { ImagePlus, Video, X } from "lucide-react";

const CATEGORY_OPTIONS = [
  { label: "Select category…",  value: "" },
  { label: "Book",              value: "BOOK" },
  { label: "Electronics",       value: "ELECTRONICS" },
  { label: "Cooking Utensils",  value: "COOKING_UTENSILS" },
  { label: "Automobile",        value: "AUTOMOBILE" },
  { label: "Wears",             value: "WEARS" },
];

const MAX_NAME  = 120;
const MAX_DESC  = 1000;
const MAX_INFO  = 1000;
const MAX_MEDIA = 6; // up to 5 images + 1 video

/** Upload a single file (image or video) and return its public URL. */
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

export default function AddProductPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name:             "",
    description:      "",
    price:            "",   // display string with commas
    category:         "",
    quantityLeft:     "",
    otherInformation: "",
    tagsRaw:          "",
  });

  // Owner search
  const [ownerQuery,    setOwnerQuery]    = useState("");
  const [ownerResults,  setOwnerResults]  = useState<UserResponse[]>([]);
  const [selectedOwner, setSelectedOwner] = useState<UserResponse | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDebounce  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Multi-media: each entry is either a File (pending upload) or a URL string (already uploaded)
  const [mediaFiles,    setMediaFiles]    = useState<File[]>([]);
  const [uploading,     setUploading]     = useState(false);
  const mediaInputRef   = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [touched,    setTouched]    = useState<Record<string, boolean>>({});
  const touch = (f: string) => setTouched((t) => ({ ...t, [f]: true }));

  const fieldErrors = {
    name:  !formData.name.trim() ? "Product name is required" : "",
    owner: !selectedOwner ? "Please select an owner (member)" : "",
    price: formData.price && isNaN(Number(formData.price.replace(/,/g, ""))) ? "Price must be a number" : "",
    qty:   formData.quantityLeft && isNaN(Number(formData.quantityLeft)) ? "Quantity must be a number" : "",
  };

  const isFormValid = !!formData.name.trim() && !!selectedOwner && !fieldErrors.price && !fieldErrors.qty;

  // Debounced owner search
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!ownerQuery.trim() || selectedOwner) { setOwnerResults([]); return; }
    searchDebounce.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await searchMembers(ownerQuery.trim());
        setOwnerResults(res.content ?? []);
      } catch { setOwnerResults([]); }
      finally   { setSearchLoading(false); }
    }, 350);
    return () => { if (searchDebounce.current) clearTimeout(searchDebounce.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerQuery]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    e.target.value = ""; // reset so same file can be picked again
    if (!incoming.length) return;

    setMediaFiles((prev) => {
      const slots = MAX_MEDIA - prev.length;
      if (slots <= 0) return prev;
      return [...prev, ...incoming.slice(0, slots)];
    });
  };

  const removeMedia = (idx: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSelectOwner = (member: UserResponse) => {
    setSelectedOwner(member);
    setOwnerQuery(`${member.firstName ?? ""} ${member.lastName ?? ""}`.trim());
    setOwnerResults([]);
  };

  const handleClearOwner = () => {
    setSelectedOwner(null);
    setOwnerQuery("");
    setOwnerResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched({ name: true, owner: true, price: true, qty: true });

    const el = (e.target as HTMLFormElement).elements;
    const getVal = (fieldName: string) =>
      ((el.namedItem(fieldName) as HTMLInputElement | null)?.value ?? "").trim();

    const productName = getVal("name") || formData.name.trim();

    if (!productName || !selectedOwner) {
      setError("Please fill in all required fields.");
      return;
    }
    if (fieldErrors.price || fieldErrors.qty) {
      setError("Please correct the field errors above.");
      return;
    }

    setSubmitting(true);
    try {
      let images: string[] | undefined;
      if (mediaFiles.length > 0) {
        setUploading(true);
        images = await Promise.all(mediaFiles.map(uploadOneFile));
        setUploading(false);
      }

      const tags = formData.tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);

      await createProduct({
        name:             formData.name.trim(),
        description:      formData.description.trim() || undefined,
        price:            formData.price ? Number(formData.price.replace(/,/g, "")) : undefined,
        category:         formData.category || undefined,
        quantityLeft:     formData.quantityLeft ? parseInt(formData.quantityLeft, 10) : undefined,
        otherInformation: formData.otherInformation.trim() || undefined,
        tags:             tags.length ? tags : undefined,
        images,
        owner:            selectedOwner!.id,
      });

      router.push("/marketplace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product.");
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Marketplace" subtitle="Add Product" backHref="/marketplace" />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* Product name */}
          <FormField
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value.slice(0, MAX_NAME) }))}
            onBlur={() => touch("name")}
            placeholder="e.g. Samsung Galaxy S21"
            required
            showCount
            maxLength={MAX_NAME}
            error={touched.name ? fieldErrors.name : undefined}
          />

          {/* Description */}
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

          {/* Price + Quantity */}
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
              onBlur={() => touch("price")}
              placeholder="e.g. 5,000"
              error={touched.price ? fieldErrors.price : undefined}
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
              onBlur={() => touch("qty")}
              placeholder="e.g. 1"
              error={touched.qty ? fieldErrors.qty : undefined}
            />
          </div>

          {/* Category */}
          <SelectField
            label="Category"
            name="category"
            value={formData.category}
            onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
            options={CATEGORY_OPTIONS}
          />

          {/* Tags */}
          <FormField
            label="Tags (comma-separated)"
            name="tags"
            value={formData.tagsRaw}
            onChange={(e) => setFormData((p) => ({ ...p, tagsRaw: e.target.value }))}
            placeholder="e.g. phone, android, second-hand"
          />

          {/* Other information */}
          <TextAreaField
            label="Other Information"
            name="otherInformation"
            value={formData.otherInformation}
            onChange={(e) => setFormData((p) => ({ ...p, otherInformation: e.target.value.slice(0, MAX_INFO) }))}
            placeholder="Any additional details about the product…"
            rows={3}
            showCount
            maxLength={MAX_INFO}
          />

          {/* Owner (member) search */}
          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-[#374151] dark:text-slate-300">
              Owner (Member) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={ownerQuery}
                onChange={(e) => { if (selectedOwner) handleClearOwner(); setOwnerQuery(e.target.value); }}
                placeholder="Search member by name…"
                className="w-full rounded-xl border border-[#E5E7EB] dark:border-slate-700 px-4 py-3 text-sm text-gray-700 dark:text-slate-300 outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
                autoComplete="off"
              />
              {selectedOwner && (
                <button type="button" onClick={handleClearOwner}
                  className="flex-shrink-0 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-3 text-sm text-gray-500 hover:bg-gray-100 dark:bg-slate-700">
                  Clear
                </button>
              )}
            </div>
            {ownerResults.length > 0 && (
              <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md">
                {ownerResults.map((m) => (
                  <li key={m.id}>
                    <button type="button" onClick={() => handleSelectOwner(m)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-slate-300 hover:bg-[#000080]/5">
                      {`${m.firstName ?? ""} ${m.lastName ?? ""}`.trim()}
                      {m.email && <span className="ml-2 text-xs text-gray-400">{m.email}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {searchLoading && <p className="mt-1 text-xs text-gray-400">Searching…</p>}
            {!searchLoading && ownerQuery.length > 1 && !selectedOwner && ownerResults.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">No members found.</p>
            )}
            {touched.owner && fieldErrors.owner && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.owner}</p>
            )}
          </div>

          {/* ── Multi-media upload ── */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#374151] dark:text-slate-300">
              Product Images &amp; Video
              <span className="ml-1 text-xs font-normal text-[#6B7280] dark:text-slate-400">
                (up to {MAX_MEDIA} files — images or video)
              </span>
            </label>

            {/* Grid of selected files */}
            {mediaFiles.length > 0 && (
              <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {mediaFiles.map((file, idx) => (
                  <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-[#F3F4F6] dark:bg-slate-700">
                    {file.type.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-1 text-center">
                        <Video className="h-6 w-6 text-[#6B7280] dark:text-slate-400" />
                        <span className="line-clamp-2 text-[9px] text-[#6B7280] dark:text-slate-400 break-all">{file.name}</span>
                      </div>
                    )}
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                    {/* File-type badge */}
                    <span className="absolute bottom-0.5 left-0.5 rounded bg-black/50 px-1 py-0.5 text-[8px] font-medium text-white uppercase">
                      {file.type.startsWith("video/") ? "video" : "img"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Add-more / upload zone */}
            {mediaFiles.length < MAX_MEDIA ? (
              <button
                type="button"
                onClick={() => mediaInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#E5E7EB] dark:border-slate-600 py-5 text-sm font-medium text-[#6B7280] dark:text-slate-400 transition-colors hover:border-[#000080] dark:hover:border-indigo-500 hover:text-[#000080] dark:hover:text-indigo-400"
              >
                <ImagePlus className="h-5 w-5" />
                {mediaFiles.length === 0 ? "Add images or video" : `Add more (${mediaFiles.length}/${MAX_MEDIA})`}
              </button>
            ) : (
              <p className="text-center text-xs text-[#6B7280] dark:text-slate-400">
                Maximum {MAX_MEDIA} files reached. Remove a file to add another.
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

            {mediaFiles.length > 0 && (
              <p className="mt-1.5 text-xs text-[#9CA3AF] dark:text-slate-400">
                Hover a thumbnail and click ✕ to remove it. Files are uploaded when you click Save.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push("/marketplace")}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting || uploading}>
              {uploading
                ? "Uploading media…"
                : submitting
                  ? "Saving…"
                  : "Save Product"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
