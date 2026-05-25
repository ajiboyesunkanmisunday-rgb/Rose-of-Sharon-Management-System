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
  Droplets, Phone, RefreshCw, PlusCircle, FileText, Users,
} from "lucide-react";

const ACCENT   = "#0891B2";
const ACCENT10 = "#0891B218";
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
      {[1, 2, 3, 4].map((i) => (
        <td key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6" }}>
          <div style={{ height: 14, background: "#E5E7EB", borderRadius: 4, width: i === 1 ? "70%" : i === 2 ? "50%" : i === 3 ? "60%" : "40%" }} />
        </td>
      ))}
    </tr>
  );
}

export default function BaptismalClassPage() {
  const router = useRouter();
  const [records, setRecords] = useState<SchoolOfMinistryResponse[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(1);

  const load = useCallback(async (pg: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await getSchoolOfMinistries(pg - 1, ITEMS_PER_PAGE);
      setRecords(res.content ?? []);
      setTotal(res.totalElements ?? 0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load records.";
      if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
        setRecords([]);
        setTotal(0);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) { load(1); setPage(1); return; }
    setLoading(true);
    setError("");
    try {
      const res = await searchSchoolOfMinistries(q.trim(), 0, ITEMS_PER_PAGE);
      setRecords(res.content ?? []);
      setTotal(res.totalElements ?? 0);
      setPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => { load(page); }, [load, page]);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#000", margin: 0 }}>Trainings</h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: ACCENT, margin: 0 }}>Baptismal Class</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => router.push("/trainings/baptismal/form?mode=blank")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "transparent", border: `1.5px solid ${ACCENT}`, color: ACCENT,
                borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              <FileText size={15} />
              Print Blank Form
            </button>
            <button
              onClick={() => router.push("/trainings/baptismal/form")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: ACCENT, color: "#fff", border: "none",
                borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              <PlusCircle size={15} />
              New Application
            </button>
          </div>
        </div>
      </div>

      {/* Search + stats */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <SearchBar
            placeholder="Search by name or phone…"
            value={search}
            onChange={setSearch}
            onSearch={() => handleSearch(search)}
          />
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: ACCENT10, border: `1px solid ${ACCENT}30`,
          borderRadius: 8, padding: "6px 14px", fontSize: 13, color: ACCENT, fontWeight: 600,
        }}>
          <Users size={14} />
          {total} record{total !== 1 ? "s" : ""}
        </div>
        <button
          onClick={() => load(page)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#6B7280" }}
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginBottom: 16, padding: "10px 16px", borderRadius: 8,
          background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div style={{
        background: "#fff", borderRadius: 12,
        border: "1px solid #E5E7EB", overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {["Name", "Phone", "Occupation", "Registered"].map((h) => (
                <th key={h} style={{
                  padding: "12px 16px", textAlign: "left",
                  fontSize: 12, fontWeight: 600, color: "#6B7280",
                  borderBottom: "1px solid #E5E7EB", textTransform: "uppercase", letterSpacing: 0.5,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              : records.length === 0
              ? (
                <tr>
                  <td colSpan={4} style={{ padding: "48px 16px", textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                      <Droplets size={32} style={{ color: ACCENT, opacity: 0.4 }} />
                      {search.trim()
                        ? `No records match "${search}"`
                        : "No baptismal class applications yet. Click “New Application” to add one."}
                    </div>
                  </td>
                </tr>
              )
              : records.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => router.push(`/trainings/baptismal/form?mode=view&id=${r.id}`)}
                  style={{ cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = ACCENT10)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <td style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {r.profilePictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.profilePictureUrl}
                          alt=""
                          style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%", background: ACCENT10,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, color: ACCENT, flexShrink: 0,
                        }}>
                          {(r.firstName?.[0] ?? "") + (r.lastName?.[0] ?? "")}
                        </div>
                      )}
                      <span style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{fullName(r)}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6" }}>
                    {r.phoneNumber ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#374151" }}>
                        <Phone size={12} style={{ color: "#9CA3AF" }} />
                        {r.countryCode ? `+${r.countryCode} ` : ""}{r.phoneNumber}
                      </div>
                    ) : <span style={{ color: "#9CA3AF", fontSize: 13 }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", fontSize: 13, color: "#374151" }}>
                    {r.occupation || <span style={{ color: "#9CA3AF" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", fontSize: 13, color: "#6B7280" }}>
                    {fmtDate(r.createdOn)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ marginTop: 20 }}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => { setPage(p); load(p); }}
          />
        </div>
      )}
    </div>
  );
}
