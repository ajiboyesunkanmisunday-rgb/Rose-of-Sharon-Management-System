"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import {
  getProduct,
  updateProduct,
  deleteProduct,
  approveProducts,
  uploadProfilePicture,
  type ProductResponse,
} from "@/lib/api";
import { Package, Pencil, Trash2, CheckCircle } from "lucide-react";

const CATEGORY_OPTIONS = [
  { label: "Select category…", value: "" },
  { label: "Book",             value: "BOOK" },
  { label: "Electronics",      value: "ELECTRONICS" },
  { label: "Cooking Utensils", value: "COOKING_UTENSILS" },
  { label: "Automobile",       value: "AUTOMOBILE" },
  { label: "Wears",            value: "WEARS" },
];

const MAX_NAME = 120;
const MAX_DESC = 1000;
const MAX_INFO = 1000;

function fullName(u?: { firstName?: string; middleName?: string; lastName?: string } | null) {
  if (!u) return "—";
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtCategory(c?: string) {
  if (!c) return "—";
  return c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const paramId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const [id, setId] = useState(paramId);

  // When Netlify serves the pre-built placeholder HTML for a real UUID path,
  // useParams() may return the placeholder ID (e.g. "product-1") during hydration.
  // Read the actual ID from the browser URL to fix the mismatch.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 1] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [product,  setProduct]  = useState<ProductResponse | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  // Image upload
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProduct(id);
      setProduct(data);
      setFormData({
        name:             data.name ?? "",
        description:      data.description ?? "",
        price:            data.price != null ? String(data.price) : "",
        category:         data.productCategory ?? "",
        quantityLeft:     data.quantityLeft != null ? String(data.quantityLeft) : "",
        otherInformation: data.otherInformation ?? "",
        tagsRaw:          (data.tags ?? []).join(", "),
      });
      setImagePreview(data.images?.[0] ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load product.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : (product?.images?.[0] ?? null));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      let images: string[] | undefined = product?.images;
      if (imageFile) {
        setUploading(true);
        const url = await uploadProfilePicture(imageFile);
        setUploading(false);
        images = [url];
      }

      const tags = formData.tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const updated = await updateProduct(id, {
        name:             formData.name.trim(),
        description:      formData.description.trim() || undefined,
        price:            formData.price ? Number(formData.price) : undefined,
        category:         formData.category || undefined,
        otherInformation: formData.otherInformation.trim() || undefined,
        tags:             tags.length ? tags : undefined,
        owner:            product?.owner?.id,
      });

      // Merge updated data and preserve images (updateProduct response may not return images)
      setProduct({ ...updated, images: images ?? product?.images, quantityLeft: formData.quantityLeft ? Number(formData.quantityLeft) : product?.quantityLeft });
      setEditing(false);
      setImageFile(null);
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
    } finally {
      setApproving(false);
    }
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
            <div className="flex flex-wrap items-start gap-6">
              {/* Image */}
              <div className="flex-shrink-0">
                {product.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-40 w-40 rounded-xl object-cover border border-[#E5E7EB] dark:border-slate-700"
                  />
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-xl bg-[#F3F4F6] dark:bg-slate-700">
                    <Package className="h-16 w-16 text-[#D1D5DB] dark:text-slate-500" />
                  </div>
                )}
              </div>

              {/* Details */}
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
                  {product.owner.email && (
                    <p className="text-xs text-[#6B7280] dark:text-slate-400">{product.owner.email}</p>
                  )}
                  {product.owner.phoneNumber && (
                    <p className="text-xs text-[#6B7280] dark:text-slate-400">{product.owner.phoneNumber}</p>
                  )}
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

      {/* Edit mode */}
      {product && editing && (
        <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#111827] dark:text-slate-100">Edit Product</h3>
            <button
              onClick={() => {
                setEditing(false);
                setImageFile(null);
                setImagePreview(product.images?.[0] ?? null);
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
                onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                placeholder="e.g. 5000"
              />
              <FormField
                label="Quantity Available"
                name="quantityLeft"
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

            {/* Image */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#374151] dark:text-slate-300">Product Image</label>
              <div
                onClick={() => imageInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E5E7EB] dark:border-slate-600 p-6 hover:border-[#000080]"
              >
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg object-contain" />
                ) : (
                  <p className="text-sm text-[#9CA3AF]">Click to upload a new image</p>
                )}
              </div>
              <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => { setEditing(false); setImageFile(null); }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={saving || uploading || !formData.name.trim()}>
                {uploading ? "Uploading…" : saving ? "Saving…" : "Save Changes"}
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
