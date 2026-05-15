"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import {
  getSchoolOfDisciples,
  searchSchoolOfDisciples,
  markSodAsGraduated,
  giveSodOfficialRemark,
  type SchoolOfDisciplesResponse,
} from "@/lib/api";
import {
  BookOpen, Phone, Mail, RefreshCw, Award, Users,
  CheckCircle, Clock, Star, ChevronDown, X, MessageSquare,
} from "lucide-react";

const ACCENT   = "#D97706";
const ACCENT10 = "#D9770618";
const ITEMS_PER_PAGE = 12;

const avatarBgColors = [
  "bg-[#B5B5F3]", "bg-[#BFDBFE]", "bg-[#BBF7D0]",
  "bg-[#FDE68A]", "bg-[#FECACA]", "bg-[#DDD6FE]",
];

function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return avatarBgColors[Math.abs(hash) % avatarBgColors.length];
}

function initials(u: SchoolOfDisciplesResponse) {
  return `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

function fullName(u: SchoolOfDisciplesResponse) {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Official Remark Modal ────────────────────────────────────────────────────
function RemarkModal({
  student,
  onClose,
  onSave,
}: {
  student: SchoolOfDisciplesResponse;
  onClose: () => void;
  onSave: (id: string, text: string) => Promise<void>;
}) {
  const [text, setText] = useState(student.officialRemarks ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await onSave(student.id, text.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-[#111827]">Official Remark</h2>
            <p className="text-xs text-[#6B7280]">{fullName(student)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[#F3F4F6]">
            <X className="h-4 w-4 text-[#6B7280]" />
          </button>
        </div>
        <div className="p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Enter official remark…"
            className="w-full resize-none rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#D97706]"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !text.trim()}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: ACCENT }}
          >
            {saving ? "Saving…" : "Save Remark"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Student Card ─────────────────────────────────────────────────────────────
function StudentCard({
  student,
  selected,
  onToggleSelect,
  onRemark,
}: {
  student: SchoolOfDisciplesResponse;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onRemark: (s: SchoolOfDisciplesResponse) => void;
}) {
  const bg = avatarColor(student.id);
  const phone = student.phoneNumber
    ? `+${student.countryCode ?? ""} ${student.phoneNumber}`.trim()
    : null;
  const isGraduated = !!student.graduationDate;

  return (
    <div
      className={`relative flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
        selected ? "ring-1" : "border-[#E5E7EB]"
      }`}
      style={selected ? { borderColor: ACCENT, boxShadow: `0 0 0 1px ${ACCENT}` } : {}}
    >
      {/* Select */}
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggleSelect(student.id)}
        className="absolute right-3 top-3 h-4 w-4 cursor-pointer"
        style={{ accentColor: ACCENT }}
      />

      {/* Graduation badge */}
      {isGraduated && (
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
          <CheckCircle className="h-3 w-3" />
          Graduated
        </span>
      )}

      {/* Avatar */}
      <div className={`mb-3 ${isGraduated ? "mt-6" : "mt-4"}`}>
        {student.profilePictureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={student.profilePictureUrl}
            alt={fullName(student)}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${bg} text-lg font-bold text-[#000080]`}>
            {initials(student)}
          </div>
        )}
      </div>

      {/* Name + set */}
      <h3 className="text-sm font-bold text-[#111827]">{fullName(student)}</h3>
      {student.set && (
        <span
          className="mt-1 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white"
          style={{ backgroundColor: ACCENT }}
        >
          <Star className="h-2.5 w-2.5" />
          Set {student.set}
        </span>
      )}
      {student.occupation && (
        <p className="mt-1 text-xs text-[#6B7280]">{student.occupation}</p>
      )}

      {/* Ministry / Gifts */}
      {(student.yourMinistry || (student.giftsManifesting?.length ?? 0) > 0) && (
        <div className="mt-2 space-y-0.5">
          {student.yourMinistry && (
            <p className="text-[10px] text-[#6B7280]">
              <span className="font-medium text-[#374151]">Ministry:</span>{" "}
              {student.yourMinistry}
            </p>
          )}
          {(student.giftsManifesting?.length ?? 0) > 0 && (
            <p className="text-[10px] text-[#6B7280]">
              <span className="font-medium text-[#374151]">Gifts:</span>{" "}
              {student.giftsManifesting!.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Official remark badge */}
      {student.officialRemarks && (
        <div className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] text-amber-700">
          <span className="font-semibold">Remark:</span> {student.officialRemarks}
        </div>
      )}

      {/* Contact */}
      <div className="mt-3 space-y-1">
        {phone && (
          <div className="flex items-center gap-1.5 text-xs text-[#374151]">
            <Phone className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
            <span>{phone}</span>
          </div>
        )}
        {student.email && (
          <div className="flex items-center gap-1.5 text-xs text-[#374151]">
            <Mail className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
            <span className="truncate">{student.email}</span>
          </div>
        )}
      </div>

      {/* Dates */}
      {student.createdOn && (
        <p className="mt-2 text-[10px] text-[#9CA3AF]">Enrolled {fmtDate(student.createdOn)}</p>
      )}
      {student.graduationDate && (
        <p className="mt-0.5 text-[10px] font-medium text-green-600">Graduated {fmtDate(student.graduationDate)}</p>
      )}

      {/* Remark button */}
      <button
        onClick={() => onRemark(student)}
        className="mt-3 flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:border-[#D97706] hover:text-[#D97706]"
      >
        <MessageSquare className="h-3 w-3" />
        {student.officialRemarks ? "Edit Remark" : "Give Remark"}
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SchoolOfDisciplesPage() {
  const [allStudents,   setAllStudents]   = useState<SchoolOfDisciplesResponse[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [search,        setSearch]        = useState("");
  const [setFilter,     setSetFilter]     = useState("");
  const [page,          setPage]          = useState(1);
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [graduating,    setGraduating]    = useState(false);
  const [remarkStudent, setRemarkStudent] = useState<SchoolOfDisciplesResponse | null>(null);
  const [successMsg,    setSuccessMsg]    = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const first = await getSchoolOfDisciples(0, 200);
      const rows = [...(first.content ?? [])];
      const totalPages = Math.min(first.totalPages ?? 1, 10);
      if (totalPages > 1) {
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) => getSchoolOfDisciples(i + 1, 200))
        );
        rest.forEach((r) => rows.push(...(r.content ?? [])));
      }
      setAllStudents(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const availableSets = useMemo(() => {
    const sets = new Set<string>();
    allStudents.forEach((s) => { if (s.set) sets.add(s.set); });
    return [...sets].sort();
  }, [allStudents]);

  const filtered = useMemo(() => {
    let list = allStudents;
    if (setFilter) list = list.filter((s) => s.set === setFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          fullName(s).toLowerCase().includes(q) ||
          (s.email ?? "").toLowerCase().includes(q) ||
          (s.phoneNumber ?? "").toLowerCase().includes(q) ||
          (s.yourMinistry ?? "").toLowerCase().includes(q) ||
          (s.set ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [allStudents, search, setFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const graduated = allStudents.filter((s) => !!s.graduationDate);
  const inTraining = allStudents.filter((s) => !s.graduationDate);

  const toggleSelect = (id: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () =>
    setSelected((prev) =>
      prev.size === paginated.length
        ? new Set()
        : new Set(paginated.map((s) => s.id))
    );

  const handleGraduate = async () => {
    if (selected.size === 0) return;
    setGraduating(true);
    try {
      await markSodAsGraduated([...selected]);
      setSelected(new Set());
      setSuccessMsg(`${selected.size} student${selected.size > 1 ? "s" : ""} marked as graduated.`);
      setTimeout(() => setSuccessMsg(""), 4000);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark as graduated.");
    } finally {
      setGraduating(false);
    }
  };

  const handleSaveRemark = async (id: string, text: string) => {
    await giveSodOfficialRemark(id, text);
    setSuccessMsg("Official remark saved.");
    setTimeout(() => setSuccessMsg(""), 4000);
    await load();
  };

  const handleSearch = async () => {
    if (!search.trim()) { await load(); return; }
    setLoading(true);
    setError("");
    try {
      const res = await searchSchoolOfDisciples(search.trim(), 0, 200);
      setAllStudents(res.content ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {remarkStudent && (
        <RemarkModal
          student={remarkStudent}
          onClose={() => setRemarkStudent(null)}
          onSave={handleSaveRemark}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: ACCENT10 }}>
          <BookOpen className="h-6 w-6" style={{ color: ACCENT }} />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000]">School of Disciples</h1>
          <p className="text-sm text-[#6B7280]">Members enrolled in the SOD programme</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="ml-auto flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#374151] hover:text-[#D97706] hover:border-[#D97706] disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: ACCENT }}>{allStudents.length}</p>
            <p className="mt-1 text-xs text-[#6B7280]">Total enrolled</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center">
            <p className="text-2xl font-bold text-[#16A34A]">{graduated.length}</p>
            <p className="mt-1 text-xs text-[#6B7280]">Graduated</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center">
            <p className="text-2xl font-bold text-[#000080]">{inTraining.length}</p>
            <p className="mt-1 text-xs text-[#6B7280]">In training</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center">
            <p className="text-2xl font-bold text-[#374151]">{availableSets.length}</p>
            <p className="mt-1 text-xs text-[#6B7280]">Set{availableSets.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      )}

      {/* Banners */}
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button onClick={load} className="font-medium underline">Retry</button>
        </div>
      )}

      {/* Controls */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            onSearch={handleSearch}
            placeholder="Search by name, phone, ministry…"
          />
        </div>

        {availableSets.length > 0 && (
          <div className="relative">
            <select
              value={setFilter}
              onChange={(e) => { setSetFilter(e.target.value); setPage(1); }}
              className="appearance-none rounded-lg border border-[#E5E7EB] bg-white pl-3 pr-8 py-2.5 text-sm text-[#374151] outline-none focus:border-[#D97706]"
            >
              <option value="">All sets</option>
              {availableSets.map((s) => (
                <option key={s} value={s}>Set {s}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
        )}

        {selected.size > 0 && (
          <button
            onClick={handleGraduate}
            disabled={graduating}
            className="flex items-center gap-2 rounded-lg bg-[#16A34A] px-3 py-2 text-xs font-semibold text-white hover:bg-[#15803D] disabled:opacity-50"
          >
            <Award className="h-3.5 w-3.5" />
            {graduating ? "Graduating…" : `Graduate ${selected.size} selected`}
          </button>
        )}

        <span className="ml-auto text-sm text-[#6B7280]">
          {filtered.length} {filtered.length === 1 ? "student" : "students"}
        </span>
      </div>

      {/* Select-all row */}
      {!loading && paginated.length > 0 && (
        <div className="mb-3 flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-[#6B7280]">
            <input
              type="checkbox"
              checked={selected.size === paginated.length && paginated.length > 0}
              onChange={toggleAll}
              className="h-3.5 w-3.5"
              style={{ accentColor: ACCENT }}
            />
            Select all on this page
          </label>
          {selected.size > 0 && (
            <button onClick={() => setSelected(new Set())} className="text-xs text-[#6B7280] underline hover:text-[#374151]">
              Clear selection
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center text-sm text-[#9CA3AF]">
          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
          Loading students…
        </div>
      ) : allStudents.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-[#E5E7EB]" />
          <p className="text-sm font-medium text-[#374151]">No students enrolled yet</p>
          <p className="mt-1 text-xs text-[#9CA3AF]">Students added to the School of Disciples programme will appear here.</p>
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-10 text-center text-sm text-[#9CA3AF]">
          No students match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginated.map((s) => (
            <StudentCard
              key={s.id}
              student={s}
              selected={selected.has(s.id)}
              onToggleSelect={toggleSelect}
              onRemark={setRemarkStudent}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      {!loading && allStudents.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#9CA3AF]">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Graduated
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-500" /> In training
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5" style={{ color: ACCENT }} /> Set badge
          </span>
        </div>
      )}

      <div className="mt-6">
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      </div>
    </DashboardLayout>
  );
}
