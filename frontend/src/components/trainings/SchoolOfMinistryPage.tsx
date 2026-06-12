"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import {
  getSchoolOfMinistries,
  searchSchoolOfMinistries,
  markSomAsGraduated,
  giveSomOfficialRemark,
  updateSomFeesPaid,
  type SchoolOfMinistryResponse,
} from "@/lib/api";
import {
  BookOpen, Phone, RefreshCw, PlusCircle, FileText, Users,
  CheckCircle, MessageSquare, X, GraduationCap,
} from "lucide-react";

const ACCENT    = "#059669";
const ACCENT10  = "#05966918";
const ITEMS_PER_PAGE = 20;

function fullName(u: SchoolOfMinistryResponse) {
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

function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4,5].map((i) => (
        <td key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6" }}>
          <div style={{ height: 14, background: "#E5E7EB", borderRadius: 4, width: i === 1 ? "70%" : i === 2 ? "50%" : i === 3 ? "60%" : i === 4 ? "40%" : "30%" }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Official Remark Modal ─────────────────────────────────────────────────────
function RemarkModal({
  record,
  onClose,
  onSave,
}: {
  record: SchoolOfMinistryResponse;
  onClose: () => void;
  onSave: (id: string, text: string) => Promise<void>;
}) {
  const [text, setText] = useState(record.officialRemarks ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!text.trim()) { setError("Remark cannot be empty."); return; }
    setSaving(true);
    setError("");
    try {
      await onSave(record.id, text.trim());
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save remark.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-slate-700 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-[#111827] dark:text-slate-100">Official Remark</h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400">{fullName(record)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[#F3F4F6] dark:hover:bg-slate-700/30">
            <X className="h-4 w-4 text-[#6B7280] dark:text-slate-400" />
          </button>
        </div>
        <div className="p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Enter official remark…"
            className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 placeholder-[#9CA3AF] focus:border-[#059669] focus:outline-none resize-none bg-white dark:bg-slate-900"
          />
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] dark:border-slate-700 px-5 py-4">
          <button onClick={onClose} className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-2 text-sm font-medium text-[#374151] dark:text-slate-300 hover:bg-[#F9FAFB]">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !text.trim()}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}
          >
            {saving ? "Saving…" : "Save Remark"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Fees Paid Modal ───────────────────────────────────────────────────────────
function FeesPaidModal({
  record,
  onClose,
  onSave,
}: {
  record: SchoolOfMinistryResponse;
  onClose: () => void;
  onSave: (id: string, fees: number) => Promise<void>;
}) {
  const [amount, setAmount] = useState(String(record.feesPaid ?? ""));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    const val = Number(amount);
    if (isNaN(val) || val < 0) { setError("Please enter a valid amount."); return; }
    setSaving(true);
    setError("");
    try {
      await onSave(record.id, val);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update fees paid.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-slate-700 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-[#111827] dark:text-slate-100">Update Fees Paid</h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400">{fullName(record)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[#F3F4F6] dark:hover:bg-slate-700/30">
            <X className="h-4 w-4 text-[#6B7280] dark:text-slate-400" />
          </button>
        </div>
        <div className="p-5">
          <label className="mb-1.5 block text-xs font-semibold text-[#374151] dark:text-slate-300">Amount Paid (₦)</label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 5000"
            className="w-full rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-3 py-2.5 text-sm text-[#111827] dark:text-slate-100 focus:border-[#059669] focus:outline-none bg-white dark:bg-slate-900"
          />
          {record.feesPaid != null && (
            <p className="mt-1.5 text-xs text-[#9CA3AF] dark:text-slate-400">Current: ₦{record.feesPaid.toLocaleString()}</p>
          )}
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] dark:border-slate-700 px-5 py-4">
          <button onClick={onClose} className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-2 text-sm font-medium text-[#374151] dark:text-slate-300 hover:bg-[#F9FAFB]">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SchoolOfMinistryPage() {
  const router  = useRouter();
  const [records,  setRecords]  = useState<SchoolOfMinistryResponse[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const [somSet,   setSomSet]   = useState(String(new Date().getFullYear()));

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Modals
  const [remarkRecord,   setRemarkRecord]   = useState<SchoolOfMinistryResponse | null>(null);
  const [feesRecord,     setFeesRecord]     = useState<SchoolOfMinistryResponse | null>(null);
  const [graduating,     setGraduating]     = useState(false);
  const [actionError,    setActionError]    = useState("");

  const load = useCallback(async (pg: number, set?: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await getSchoolOfMinistries(pg - 1, ITEMS_PER_PAGE, set);
      setRecords(res.content ?? []);
      setTotal(res.totalElements ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page, somSet); }, [load, page, somSet]);

  const handleSearch = async () => {
    if (!search.trim()) { load(page, somSet); return; }
    setLoading(true);
    setError("");
    try {
      const res = await searchSchoolOfMinistries(search.trim(), 0, ITEMS_PER_PAGE, somSet);
      setRecords(res.content ?? []);
      setTotal(res.totalElements ?? 0);
      setPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const handleGraduate = async () => {
    if (selected.size === 0) return;
    setGraduating(true);
    setActionError("");
    try {
      await markSomAsGraduated(Array.from(selected));
      setSelected(new Set());
      await load(page, somSet);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to mark as graduated.");
    } finally {
      setGraduating(false);
    }
  };

  const handleSaveRemark = async (id: string, text: string) => {
    await giveSomOfficialRemark(id, text);
    // Refresh record inline
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, officialRemarks: text } : r));
  };

  const handleSaveFees = async (id: string, fees: number) => {
    await updateSomFeesPaid(id, fees);
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, feesPaid: fees } : r));
  };

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start gap-3 sm:flex-nowrap sm:items-center">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: ACCENT10 }}
        >
          <BookOpen className="h-6 w-6" style={{ color: ACCENT }} />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#000000] dark:text-slate-100">School of Ministry</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Members enrolled in the SOM programme</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
          <button
            onClick={() => router.push("/trainings/som/form")}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: ACCENT }}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Application
          </button>
          <button
            onClick={() => router.push("/trainings/som/form?mode=blank")}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors"
            style={{ borderColor: ACCENT, color: ACCENT }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = ACCENT; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = ""; (e.currentTarget as HTMLButtonElement).style.color = ACCENT; }}
          >
            <FileText className="h-3.5 w-3.5" />
            Blank Form
          </button>
          <button
            onClick={() => load(page, somSet)}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-[#374151] dark:text-slate-300 hover:border-[#059669] hover:text-[#059669] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Errors */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button onClick={() => load(page, somSet)} className="font-medium underline">Retry</button>
        </div>
      )}
      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Set selector — year-based (matches what the application form submits) */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-[#374151] dark:text-slate-300">Set (Year):</span>
        {Array.from({ length: 8 }, (_, i) => String(new Date().getFullYear() - 3 + i)).map((yr) => (
          <button
            key={yr}
            onClick={() => {
              setSomSet(yr);
              setPage(1);
              setSearch("");
              setSelected(new Set());
            }}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              somSet === yr
                ? "text-white"
                : "border border-[#E5E7EB] dark:border-slate-600 text-[#6B7280] dark:text-slate-400"
            }`}
            style={somSet === yr ? { backgroundColor: ACCENT } : undefined}
          >
            {yr}
          </button>
        ))}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#059669]/30 bg-[#ECFDF5] dark:bg-emerald-900/20 px-4 py-3">
          <span className="text-sm font-medium text-[#059669]">{selected.size} selected</span>
          <button
            onClick={handleGraduate}
            disabled={graduating}
            className="flex items-center gap-1.5 rounded-lg bg-[#059669] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#047857] disabled:opacity-50"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            {graduating ? "Graduating…" : "Mark as Graduated"}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-[#6B7280] hover:text-[#374151] underline"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Search + count */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); if (!v.trim()) load(1, somSet); }}
            onSearch={handleSearch}
            placeholder="Search by name, phone, occupation…"
          />
        </div>
        <span className="ml-auto text-sm text-[#6B7280] dark:text-slate-400">
          {total} {total === 1 ? "record" : "records"}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              <th style={{ padding: "10px 16px", width: 36, borderBottom: "1px solid #E5E7EB" }} />
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #E5E7EB" }}>Name</th>
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #E5E7EB" }}>Phone</th>
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #E5E7EB" }}>Occupation</th>
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #E5E7EB" }}>Fees Paid</th>
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #E5E7EB" }}>Enrolled</th>
              <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #E5E7EB" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "48px 16px", textAlign: "center" }}>
                  <Users className="mx-auto mb-3 h-10 w-10 text-[#E5E7EB]" />
                  <p className="text-sm font-medium text-[#374151] dark:text-slate-300">No records found</p>
                  <p className="mt-1 text-xs text-[#9CA3AF] dark:text-slate-400">SOM applications will appear here once submitted.</p>
                </td>
              </tr>
            ) : (
              records.map((rec) => {
                const phone = rec.phoneNumber
                  ? `+${rec.countryCode ?? ""} ${rec.phoneNumber}`.trim()
                  : null;
                const isGraduated = !!rec.graduationDate;
                return (
                  <tr
                    key={rec.id}
                    style={{ borderBottom: "1px solid #F3F4F6", background: selected.has(rec.id) ? "#ECFDF5" : undefined }}
                    className="hover:bg-[#F0FDF4] transition-colors"
                  >
                    {/* Checkbox */}
                    <td style={{ padding: "12px 16px" }}>
                      <input
                        type="checkbox"
                        checked={selected.has(rec.id)}
                        onChange={() => toggleSelect(rec.id)}
                        className="h-4 w-4 cursor-pointer accent-[#059669]"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>

                    {/* Name — clicking goes to form view */}
                    <td
                      style={{ padding: "12px 16px", cursor: "pointer" }}
                      onClick={() => router.push(`/trainings/som/form?mode=view&id=${rec.id}`)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {rec.profilePictureUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={rec.profilePictureUrl}
                            alt={fullName(rec)}
                            style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                            background: ACCENT10, display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, fontSize: 11, color: ACCENT,
                          }}>
                            {`${(rec.firstName ?? "")[0] ?? ""}${(rec.lastName ?? "")[0] ?? ""}`.toUpperCase() || "?"}
                          </div>
                        )}
                        <div>
                          <p style={{ fontWeight: 600, color: "#111827" }}>{fullName(rec)}</p>
                          {isGraduated && (
                            <span style={{ fontSize: 10, color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: 2 }}>
                              <CheckCircle size={10} /> Graduated
                            </span>
                          )}
                          {rec.officialRemarks && (
                            <p style={{ fontSize: 10, color: "#D97706", marginTop: 2 }}>
                              Remark: {rec.officialRemarks.length > 40 ? rec.officialRemarks.slice(0, 38) + "…" : rec.officialRemarks}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "12px 16px", color: "#374151" }}>
                      {phone ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Phone className="h-3 w-3 text-[#9CA3AF] dark:text-slate-400" />
                          {phone}
                        </div>
                      ) : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#6B7280" }}>{rec.occupation ?? "—"}</td>
                    <td style={{ padding: "12px 16px", color: "#6B7280" }}>
                      {rec.feesPaid != null ? `₦${rec.feesPaid.toLocaleString()}` : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#6B7280" }}>{fmtDate(rec.createdOn)}</td>

                    {/* Action buttons */}
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setRemarkRecord(rec); }}
                          title="Official Remark"
                          className="rounded-lg p-1.5 hover:bg-amber-50 transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setFeesRecord(rec); }}
                          title="Update Fees Paid"
                          className="rounded-lg p-1.5 hover:bg-green-50 transition-colors"
                        >
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#059669", lineHeight: 1 }}>₦</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          onPageChange={(p) => { setPage(p); load(p, somSet); }}
        />
      </div>

      {/* Modals */}
      {remarkRecord && (
        <RemarkModal
          record={remarkRecord}
          onClose={() => setRemarkRecord(null)}
          onSave={handleSaveRemark}
        />
      )}
      {feesRecord && (
        <FeesPaidModal
          record={feesRecord}
          onClose={() => setFeesRecord(null)}
          onSave={handleSaveFees}
        />
      )}
    </div>
  );
}
