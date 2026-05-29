"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import SearchBar from "@/components/ui/SearchBar";
import {
  getProducts,
  searchProducts,
  deleteProduct,
  approveProducts,
  updateProductQuantity,
  type ProductResponse,
} from "@/lib/api";
import { ShoppingBag, Plus, RefreshCw, Package, CheckCircle, Pencil, Check, X } from "lucide-react";

const ITEMS_PER_PAGE = 20;

type ApprovalFilter = "ALL" | "APPROVED" | "PENDING";

function fmtPrice(p?: number) {
  if (p == null) return "—";
  return `₦${p.toLocaleString("en-NG")}`;
}

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

export default function MarketplacePage() {
  const router = useRouter();
  const [products, setProducts]   = useState<ProductResponse[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>("ALL");

  // approve state
  const [approving, setApproving] = useState<string | null>(null);

  // delete confirmation
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting]           = useState(false);

  // inline qty edit state
  const [editingQtyId,  setEditingQtyId]  = useState<string | null>(null);
  const [editingQtyVal, setEditingQtyVal] = useState<string>("");
  const [savingQty,     setSavingQty]     = useState(false);

  const load = useCallback(async (pg: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await getProducts(pg - 1, ITEMS_PER_PAGE);
      setProducts(res.content ?? []);
      setTotal(res.totalElements ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [load, page]);

  const handleSearch = async () => {
    if (!search.trim()) { load(page); return; }
    setLoading(true);
    setError("");
    try {
      const res = await searchProducts(search.trim(), 0, ITEMS_PER_PAGE);
      setProducts(res.content ?? []);
      setTotal(res.totalElements ?? 0);
      setPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      await approveProducts([id]);
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isApproved: true } : p));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to approve product.");
    } finally {
      setApproving(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteProduct(confirmDelete);
      setProducts((prev) => prev.filter((p) => p.id !== confirmDelete));
      setTotal((t) => Math.max(0, t - 1));
      setConfirmDelete(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete product.");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateQty = async (id: string) => {
    const newQty = parseInt(editingQtyVal, 10);
    if (isNaN(newQty) || newQty < 0) return;
    setSavingQty(true);
    try {
      await updateProductQuantity(id, newQty);
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, quantityLeft: newQty } : p));
      setEditingQtyId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update quantity.");
    } finally {
      setSavingQty(false);
    }
  };

  const filtered = approvalFilter === "ALL"
    ? products
    : approvalFilter === "APPROVED"
      ? products.filter((p) => p.isApproved === true)
      : products.filter((p) => !p.isApproved);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start gap-3 sm:flex-nowrap sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#000080]/10">
          <ShoppingBag className="h-6 w-6 text-[#000080] dark:text-indigo-400" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#000080] dark:text-indigo-400">Marketplace</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Manage products listed by church members</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
          <Button variant="primary" onClick={() => router.push("/marketplace/add")}>
            <Plus className="h-4 w-4 mr-1" /> Add Product
          </Button>
          <button
            onClick={() => load(page)}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-[#374151] dark:text-slate-300 hover:border-[#000080] hover:text-[#000080] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button onClick={() => { setError(""); load(page); }} className="font-medium underline">Retry</button>
        </div>
      )}

      {/* Search + approval filter */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); if (!v.trim()) load(1); }}
            onSearch={handleSearch}
            placeholder="Search products…"
          />
        </div>

        {/* Approval filter chips */}
        <div className="flex flex-wrap gap-2">
          {(["ALL", "APPROVED", "PENDING"] as ApprovalFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setApprovalFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                approvalFilter === f
                  ? "bg-[#000080] text-white"
                  : "border border-[#E5E7EB] dark:border-slate-600 text-[#6B7280] dark:text-slate-400 hover:border-[#000080] hover:text-[#000080]"
              }`}
            >
              {f === "ALL" ? "All" : f === "APPROVED" ? "Approved" : "Pending Approval"}
            </button>
          ))}
        </div>

        <span className="ml-auto text-sm text-[#6B7280] dark:text-slate-400">
          {total} {total === 1 ? "product" : "products"}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#F9FAFB] dark:bg-slate-700/50">
              {["Product", "Category", "Price", "Qty Left", "Owner", "Status", "Listed", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280] dark:text-slate-400 border-b border-[#E5E7EB] dark:border-slate-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {[1,2,3,4,5,6,7,8].map((j) => (
                    <td key={j} className="px-4 py-3 border-b border-[#F3F4F6] dark:border-slate-700/50">
                      <div className="h-4 rounded bg-[#F3F4F6] dark:bg-slate-700" style={{ width: `${40 + (j * 11) % 50}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center">
                  <Package className="mx-auto mb-3 h-10 w-10 text-[#E5E7EB] dark:text-slate-600" />
                  <p className="text-sm font-medium text-[#374151] dark:text-slate-300">No products found</p>
                  <p className="mt-1 text-xs text-[#9CA3AF] dark:text-slate-500">
                    {search ? "Try a different search term." : "Products listed by members will appear here."}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-[#F9FAFB] dark:hover:bg-slate-700/30 transition-colors border-b border-[#F3F4F6] dark:border-slate-700/50 last:border-0"
                >
                  {/* Product name + image */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover flex-shrink-0 border border-[#E5E7EB] dark:border-slate-700"
                        />
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] dark:bg-slate-700">
                          <Package className="h-5 w-5 text-[#9CA3AF]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <button
                          onClick={() => {
                            if (typeof window !== "undefined") sessionStorage.setItem(`product_${product.id}`, JSON.stringify(product));
                            router.push(`/marketplace/view?id=${product.id}`);
                          }}
                          className="block truncate max-w-[200px] font-medium text-[#111827] dark:text-slate-100 hover:text-[#000080] dark:hover:text-indigo-400 text-left"
                        >
                          {product.name}
                        </button>
                        {product.tags && product.tags.length > 0 && (
                          <span className="text-xs text-[#9CA3AF] dark:text-slate-500">{product.tags.join(", ")}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3 text-[#6B7280] dark:text-slate-400">
                    {fmtCategory(product.productCategory)}
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 font-medium text-[#111827] dark:text-slate-100">
                    {fmtPrice(product.price)}
                  </td>

                  {/* Qty Left */}
                  <td className="px-4 py-3 text-[#374151] dark:text-slate-300">
                    {editingQtyId === product.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={editingQtyVal}
                          onChange={(e) => setEditingQtyVal(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleUpdateQty(product.id); if (e.key === "Escape") setEditingQtyId(null); }}
                          className="w-16 rounded border border-[#000080] px-1.5 py-1 text-xs outline-none focus:ring-1 focus:ring-[#000080] dark:bg-slate-700 dark:text-slate-100"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateQty(product.id)}
                          disabled={savingQty}
                          className="rounded p-0.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
                          title="Confirm"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingQtyId(null)}
                          className="rounded p-0.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span>{product.quantityLeft ?? "—"}</span>
                        <button
                          onClick={() => { setEditingQtyId(product.id); setEditingQtyVal(String(product.quantityLeft ?? 0)); }}
                          className="rounded p-0.5 text-[#9CA3AF] hover:text-[#000080] dark:hover:text-indigo-400"
                          title="Edit quantity"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Owner */}
                  <td className="px-4 py-3 text-[#374151] dark:text-slate-300">
                    {fullName(product.owner)}
                  </td>

                  {/* Approval status */}
                  <td className="px-4 py-3">
                    {product.isApproved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
                        <CheckCircle className="h-3 w-3" /> Approved
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:text-yellow-300">
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-[#6B7280] dark:text-slate-400 text-xs">
                    {fmtDate(product.createdOn)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {/* Approve button (only if not yet approved) */}
                      {!product.isApproved && (
                        <button
                          onClick={() => handleApprove(product.id)}
                          disabled={approving === product.id}
                          className="rounded-lg border border-green-300 dark:border-green-700 px-2.5 py-1.5 text-xs text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
                        >
                          {approving === product.id ? "…" : "Approve"}
                        </button>
                      )}

                      {/* View/Edit */}
                      <button
                        onClick={() => {
                          if (typeof window !== "undefined") sessionStorage.setItem(`product_${product.id}`, JSON.stringify(product));
                          router.push(`/marketplace/view?id=${product.id}`);
                        }}
                        className="rounded-lg border border-[#E5E7EB] dark:border-slate-600 px-2.5 py-1.5 text-xs text-[#374151] dark:text-slate-300 hover:border-[#000080] hover:text-[#000080]"
                      >
                        View
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setConfirmDelete(product.id)}
                        className="rounded-lg border border-[#E5E7EB] dark:border-slate-600 px-2.5 py-1.5 text-xs text-red-500 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && total > ITEMS_PER_PAGE && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            onPageChange={(p) => { setPage(p); load(p); }}
          />
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-xl">
            <h3 className="mb-2 text-base font-bold text-[#111827] dark:text-slate-100">Delete Product</h3>
            <p className="mb-5 text-sm text-[#6B7280] dark:text-slate-400">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setConfirmDelete(null)} disabled={deleting}>
                Cancel
              </Button>
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
