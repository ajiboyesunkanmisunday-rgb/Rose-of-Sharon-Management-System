"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import {
  getSchoolOfMinistries,
  searchSchoolOfMinistries,
  type SchoolOfMinistryResponse,
} from "@/lib/api";
import {
  BookOpen, Phone, RefreshCw, PlusCircle, FileText, Users,
} from "lucide-react";

const ACCENT    = "#059669";
const ACCENT10  = "#05966918";
const ITEMS_PER_PAGE = 20;

function fullName(u: SchoolOfMinistryResponse) {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4].map((i) => (
        <td key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6" }}>
          <div style={{ height: 14, background: "#E5E7EB", borderRadius: 4, width: i === 1 ? "70%" : i === 2 ? "50%" : i === 3 ? "60%" : "40%" }} />
        </td>
      ))}
    </tr>
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
  const [somSet,   setSomSet]   = useState(1);

  const load = useCallback(async (pg: number, set?: number) => {
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
      const res = await searchSchoolOfMinistries(search.trim(), 0, ITEMS_PER_PAGE);
      setRecords(res.content ?? []);
      setTotal(res.totalElements ?? 0);
      setPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setLoading(false);
    }
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
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors hover:text-white"
            style={{ borderColor: ACCENT, color: ACCENT }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = ACCENT; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = ""; (e.currentTarget as HTMLButtonElement).style.color = ACCENT; }}
          >
            <FileText className="h-3.5 w-3.5" />
            Download Blank Form
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

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button onClick={() => load(page)} className="font-medium underline">Retry</button>
        </div>
      )}

      {/* Set selector */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-[#374151] dark:text-slate-300">Set:</span>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => {
              setSomSet(n);
              setPage(1);
              setSearch("");
            }}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              somSet === n
                ? "text-white"
                : "border border-[#E5E7EB] dark:border-slate-600 text-[#6B7280] dark:text-slate-400"
            }`}
            style={somSet === n ? { backgroundColor: ACCENT } : undefined}
          >
            {n}
          </button>
        ))}
      </div>

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
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #E5E7EB" }}>Name</th>
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #E5E7EB" }}>Phone</th>
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #E5E7EB" }}>Occupation</th>
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #E5E7EB" }}>Date Enrolled</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "48px 16px", textAlign: "center" }}>
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
                return (
                  <tr
                    key={rec.id}
                    onClick={() => router.push(`/trainings/som/form?mode=view&id=${rec.id}`)}
                    style={{ cursor: "pointer", borderBottom: "1px solid #F3F4F6" }}
                    className="hover:bg-[#F0FDF4] transition-colors"
                  >
                    <td style={{ padding: "12px 16px" }}>
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
                        <span style={{ fontWeight: 600, color: "#111827" }}>{fullName(rec)}</span>
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
                    <td style={{ padding: "12px 16px", color: "#6B7280" }}>{fmtDate(rec.createdOn)}</td>
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
    </div>
  );
}
