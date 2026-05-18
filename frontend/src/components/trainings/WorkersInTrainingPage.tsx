"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import {
  getWorkersInTraining,
  searchWorkersInTraining,
  markWorkersAsGraduated,
  giveOfficialRemark,
  type WorkersInTrainingResponse,
} from "@/lib/api";
import {
  GraduationCap, Phone, Mail, RefreshCw, Award, Users,
  CheckCircle, Clock, Star, ChevronDown, X, MessageSquare, PlusCircle,
  FileText, Eye,
} from "lucide-react";

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

function initials(u: WorkersInTrainingResponse) {
  return `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

function fullName(u: WorkersInTrainingResponse) {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Official Remark Modal ────────────────────────────────────────────────────
function RemarkModal({
  worker,
  onClose,
  onSave,
}: {
  worker: WorkersInTrainingResponse;
  onClose: () => void;
  onSave: (id: string, text: string) => Promise<void>;
}) {
  const [text, setText] = useState(worker.officialRemarks ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await onSave(worker.id, text.trim());
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
            <p className="text-xs text-[#6B7280]">{fullName(worker)}</p>
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
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-[#7C3AED] focus:outline-none resize-none"
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
            className="rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-medium text-white hover:bg-[#6D28D9] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Remark"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Worker Card ──────────────────────────────────────────────────────────────
function WorkerCard({
  worker,
  selected,
  onToggleSelect,
  onRemark,
  onViewForm,
}: {
  worker: WorkersInTrainingResponse;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onRemark: (w: WorkersInTrainingResponse) => void;
  onViewForm: (id: string) => void;
}) {
  const bg = avatarColor(worker.id);
  const phone = worker.phoneNumber
    ? `+${worker.countryCode ?? ""} ${worker.phoneNumber}`.trim()
    : null;
  const isGraduated = !!worker.graduationDate;

  return (
    <div
      className={`relative flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
        selected ? "border-[#7C3AED] ring-1 ring-[#7C3AED]" : "border-[#E5E7EB]"
      }`}
    >
      {/* Select checkbox */}
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggleSelect(worker.id)}
        className="absolute right-3 top-3 h-4 w-4 cursor-pointer accent-[#7C3AED]"
      />

      {/* Graduation badge */}
      {isGraduated && (
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
          <CheckCircle className="h-3 w-3" />
          Graduated
        </span>
      )}

      {/* Avatar */}
      <div className={`mt-4 mb-3 ${isGraduated ? "mt-6" : ""}`}>
        {worker.profilePictureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={worker.profilePictureUrl}
            alt={fullName(worker)}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full ${bg} text-lg font-bold text-[#000080]`}
          >
            {initials(worker)}
          </div>
        )}
      </div>

      {/* Name + set */}
      <h3 className="text-sm font-bold text-[#111827]">{fullName(worker)}</h3>
      {worker.set && (
        <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-[#7C3AED]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#7C3AED]">
          <Star className="h-2.5 w-2.5" />
          Set {worker.set}
        </span>
      )}
      {worker.occupation && (
        <p className="mt-1 text-xs text-[#6B7280]">{worker.occupation}</p>
      )}

      {/* Ministry / Gifts */}
      {(worker.yourMinistry || (worker.giftsManifesting?.length ?? 0) > 0) && (
        <div className="mt-2 space-y-0.5">
          {worker.yourMinistry && (
            <p className="text-[10px] text-[#6B7280]">
              <span className="font-medium text-[#374151]">Ministry:</span>{" "}
              {worker.yourMinistry}
            </p>
          )}
          {(worker.giftsManifesting?.length ?? 0) > 0 && (
            <p className="text-[10px] text-[#6B7280]">
              <span className="font-medium text-[#374151]">Gifts:</span>{" "}
              {worker.giftsManifesting!.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Official remarks badge */}
      {worker.officialRemarks && (
        <div className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] text-amber-700">
          <span className="font-semibold">Remark:</span> {worker.officialRemarks}
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
        {worker.email && (
          <div className="flex items-center gap-1.5 text-xs text-[#374151]">
            <Mail className="h-3 w-3 shrink-0 text-[#9CA3AF]" />
            <span className="truncate">{worker.email}</span>
          </div>
        )}
      </div>

      {/* Date enrolled */}
      {worker.createdOn && (
        <p className="mt-2 text-[10px] text-[#9CA3AF]">
          Enrolled {fmtDate(worker.createdOn)}
        </p>
      )}

      {/* Action buttons */}
      <div className="mt-3 flex flex-col gap-2">
        <button
          onClick={() => onRemark(worker)}
          className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#374151] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
        >
          <MessageSquare className="h-3 w-3" />
          {worker.officialRemarks ? "Edit Remark" : "Give Remark"}
        </button>
        <button
          onClick={() => onViewForm(worker.id)}
          className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#374151] hover:border-[#000080] hover:text-[#000080] transition-colors"
        >
          <Eye className="h-3 w-3" />
          View Form
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WorkersInTrainingPage() {
  const router = useRouter();
  const [allWorkers,    setAllWorkers]    = useState<WorkersInTrainingResponse[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [search,        setSearch]        = useState("");
  const [setFilter,     setSetFilter]     = useState("");
  const [page,          setPage]          = useState(1);
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [graduating,    setGraduating]    = useState(false);
  const [remarkWorker,  setRemarkWorker]  = useState<WorkersInTrainingResponse | null>(null);
  const [successMsg,    setSuccessMsg]    = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch up to 500 records (paginated fetchAll)
      const first = await getWorkersInTraining(0, 200);
      const rows = [...(first.content ?? [])];
      const total = Math.min(first.totalPages ?? 1, 10);
      if (total > 1) {
        const rest = await Promise.all(
          Array.from({ length: total - 1 }, (_, i) => getWorkersInTraining(i + 1, 200))
        );
        rest.forEach((r) => rows.push(...(r.content ?? [])));
      }
      setAllWorkers(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load workers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Distinct sets for filter dropdown
  const availableSets = useMemo(() => {
    const sets = new Set<string>();
    allWorkers.forEach((w) => { if (w.set) sets.add(w.set); });
    return [...sets].sort();
  }, [allWorkers]);

  // Filter + search
  const filtered = useMemo(() => {
    let list = allWorkers;
    if (setFilter) list = list.filter((w) => w.set === setFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (w) =>
          fullName(w).toLowerCase().includes(q) ||
          (w.email ?? "").toLowerCase().includes(q) ||
          (w.phoneNumber ?? "").toLowerCase().includes(q) ||
          (w.yourMinistry ?? "").toLowerCase().includes(q) ||
          (w.set ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [allWorkers, search, setFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const graduated  = allWorkers.filter((w) => !!w.graduationDate);
  const pending    = allWorkers.filter((w) => !w.graduationDate);

  // Selection helpers
  const toggleSelect  = (id: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll     = () =>
    setSelected((prev) =>
      prev.size === paginated.length
        ? new Set()
        : new Set(paginated.map((w) => w.id))
    );

  // Graduate action
  const handleGraduate = async () => {
    if (selected.size === 0) return;
    setGraduating(true);
    try {
      await markWorkersAsGraduated([...selected]);
      setSelected(new Set());
      setSuccessMsg(`${selected.size} worker${selected.size > 1 ? "s" : ""} marked as graduated.`);
      setTimeout(() => setSuccessMsg(""), 4000);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark as graduated.");
    } finally {
      setGraduating(false);
    }
  };

  // Remark save
  const handleSaveRemark = async (id: string, text: string) => {
    await giveOfficialRemark(id, text);
    setSuccessMsg("Official remark saved.");
    setTimeout(() => setSuccessMsg(""), 4000);
    await load();
  };

  // Search with backend
  const handleSearch = async () => {
    if (!search.trim()) { await load(); return; }
    setLoading(true);
    setError("");
    try {
      const res = await searchWorkersInTraining(search.trim(), 0, 200, setFilter || undefined);
      setAllWorkers(res.content ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {remarkWorker && (
        <RemarkModal
          worker={remarkWorker}
          onClose={() => setRemarkWorker(null)}
          onSave={handleSaveRemark}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED]/10">
          <GraduationCap className="h-6 w-6 text-[#7C3AED]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000]">Workers-in-Training</h1>
          <p className="text-sm text-[#6B7280]">Members enrolled in the WIT programme</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => router.push("/trainings/workers/form")}
            className="flex items-center gap-2 rounded-lg bg-[#000080] px-4 py-2 text-xs font-semibold text-white hover:bg-[#000066]"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Application
          </button>
          <button
            onClick={() => router.push("/trainings/workers/form?mode=blank")}
            className="flex items-center gap-2 rounded-lg border border-[#000080] bg-white px-4 py-2 text-xs font-semibold text-[#000080] hover:bg-[#000080] hover:text-white transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            Download Blank Form
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#374151] hover:border-[#7C3AED] hover:text-[#7C3AED] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center">
            <p className="text-2xl font-bold text-[#7C3AED]">{allWorkers.length}</p>
            <p className="mt-1 text-xs text-[#6B7280]">Total enrolled</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center">
            <p className="text-2xl font-bold text-[#16A34A]">{graduated.length}</p>
            <p className="mt-1 text-xs text-[#6B7280]">Graduated</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center">
            <p className="text-2xl font-bold text-[#D97706]">{pending.length}</p>
            <p className="mt-1 text-xs text-[#6B7280]">In training</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center">
            <p className="text-2xl font-bold text-[#000080]">{availableSets.length}</p>
            <p className="mt-1 text-xs text-[#6B7280]">Set{availableSets.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      )}

      {/* Success / error banners */}
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

        {/* Set filter */}
        {availableSets.length > 0 && (
          <div className="relative">
            <select
              value={setFilter}
              onChange={(e) => { setSetFilter(e.target.value); setPage(1); }}
              className="appearance-none rounded-lg border border-[#E5E7EB] bg-white pl-3 pr-8 py-2.5 text-sm text-[#374151] focus:border-[#7C3AED] focus:outline-none"
            >
              <option value="">All sets</option>
              {availableSets.map((s) => (
                <option key={s} value={s}>Set {s}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
        )}

        {/* Bulk actions */}
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
          {filtered.length} {filtered.length === 1 ? "worker" : "workers"}
        </span>
      </div>

      {/* Select all row */}
      {!loading && paginated.length > 0 && (
        <div className="mb-3 flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-[#6B7280]">
            <input
              type="checkbox"
              checked={selected.size === paginated.length && paginated.length > 0}
              onChange={toggleAll}
              className="h-3.5 w-3.5 accent-[#7C3AED]"
            />
            Select all on this page
          </label>
          {selected.size > 0 && (
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-[#6B7280] underline hover:text-[#374151]"
            >
              Clear selection
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex h-48 items-center justify-center text-[#9CA3AF] text-sm">
          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
          Loading workers…
        </div>
      ) : allWorkers.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-12 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-[#E5E7EB]" />
          <p className="text-sm font-medium text-[#374151]">No workers enrolled yet</p>
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-10 text-center text-sm text-[#9CA3AF]">
          No workers match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginated.map((w) => (
            <WorkerCard
              key={w.id}
              worker={w}
              selected={selected.has(w.id)}
              onToggleSelect={toggleSelect}
              onRemark={setRemarkWorker}
              onViewForm={(id) => router.push(`/trainings/workers/form?mode=view&id=${id}`)}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      {!loading && allWorkers.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#9CA3AF]">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            Graduated
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            In training
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-[#7C3AED]" />
            Set badge
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
