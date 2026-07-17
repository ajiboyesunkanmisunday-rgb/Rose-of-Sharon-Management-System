"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import {
  getAllRilas,
  searchRilas,
  shortlistRilaForInterview,
  markRilaInterviewDone,
  updateRilaAdmissionNumber,
  updateRilaAcademicOfficerApproval,
  updateRilaRectorApproval,
  deleteRila,
  markRilaAsGraduated,
  updateRilaFeesPaid,
  type RilaResponse,
} from "@/lib/api";
import { GraduationCap, PlusCircle, FileText, RefreshCw, CheckCircle, XCircle, ClipboardList, BookOpen } from "lucide-react";

const ITEMS_PER_PAGE = 20;

const STAGE_LABELS: Record<string, string> = {
  APPLIED:                       "Applied",
  SPONSOR_UPDATED:               "Sponsor Done",
  PASTOR_RECOMMENDATION_UPDATED: "Pastor Done",
  APPROVED_BY_ACADEMIC_OFFICER:  "Academic Approved",
  APPROVED_BY_RECTOR:            "Rector Approved",
  SHORTLISTED_FOR_INTERVIEW:     "Shortlisted",
  INTERVIEW_DONE:                "Interview Done",
  GRADUATED:                     "Graduated",
};

const STAGE_COLORS: Record<string, string> = {
  APPLIED:                       "bg-gray-100 text-gray-600",
  SPONSOR_UPDATED:               "bg-blue-100 text-blue-700",
  PASTOR_RECOMMENDATION_UPDATED: "bg-indigo-100 text-indigo-700",
  APPROVED_BY_ACADEMIC_OFFICER:  "bg-yellow-100 text-yellow-700",
  APPROVED_BY_RECTOR:            "bg-orange-100 text-orange-700",
  SHORTLISTED_FOR_INTERVIEW:     "bg-purple-100 text-purple-700",
  INTERVIEW_DONE:                "bg-green-100 text-green-700",
  GRADUATED:                     "bg-emerald-100 text-emerald-700",
};

function fullName(r: RilaResponse) {
  return [r.firstName, r.middleName, r.lastName].filter(Boolean).join(" ") || "—";
}

function StageBadge({ stage }: { stage?: string }) {
  const key = stage ?? "";
  const label = STAGE_LABELS[key] ?? key ?? "—";
  const cls = STAGE_COLORS[key] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export default function RilaPage() {
  const router = useRouter();
  const [set,          setSet]          = useState("");
  const [setInput,     setSetInput]     = useState("");
  const [search,       setSearch]       = useState("");
  const [rilas,        setRilas]        = useState<RilaResponse[]>([]);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalItems,   setTotalItems]   = useState(0);
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [actionError,  setActionError]  = useState("");
  const [acting,       setActing]       = useState<string | null>(null);
  const [admNo,        setAdmNo]        = useState<Record<string, string>>({});
  const [fees,         setFees]         = useState<Record<string, string>>({});

  const load = useCallback(async (pg: number, searchText: string, currentSet: string) => {
    if (!currentSet.trim()) return;
    setLoading(true);
    setError("");
    try {
      let res;
      if (searchText.trim()) {
        res = await searchRilas({ text: searchText.trim() }, currentSet, pg - 1, ITEMS_PER_PAGE);
      } else {
        res = await getAllRilas(currentSet, pg - 1, ITEMS_PER_PAGE);
      }
      setRilas(res.content ?? []);
      setTotalPages(res.totalPages ?? 1);
      setTotalItems(res.totalElements ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load RILA applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (set) load(page, search, set);
  }, [page, set, load]); // search changes handled explicitly

  const applySet = () => {
    if (!setInput.trim()) return;
    setSet(setInput.trim());
    setPage(1);
    setSearch("");
    load(1, "", setInput.trim());
  };

  const doSearch = () => {
    setPage(1);
    load(1, search, set);
  };

  const act = async (label: string, fn: () => Promise<unknown>) => {
    setActing(label);
    setActionError("");
    try {
      await fn();
      load(page, search, set);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setActing(null);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start gap-3 sm:flex-nowrap sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20">
          <GraduationCap className="h-6 w-6 text-[#DC2626]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#000000] dark:text-slate-100">RILA</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Redeemer&apos;s International Leadership Academy — Application Management</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <button
            onClick={() => router.push("/trainings/rila/form")}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white bg-[#DC2626]"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Application
          </button>
          <button
            onClick={() => router.push("/trainings/rila/form?mode=blank")}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold border-[#DC2626] text-[#DC2626] bg-white dark:bg-slate-800 hover:bg-[#DC2626] hover:text-white transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            Blank Form
          </button>
          {set && (
            <button
              onClick={() => load(page, search, set)}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-[#374151] dark:text-slate-300 hover:border-[#DC2626] disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Set filter */}
      <div className="mb-5 flex gap-2">
        <input
          type="text"
          value={setInput}
          onChange={(e) => setSetInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applySet()}
          placeholder="Enter SET (e.g. SET 1, 2025A)…"
          className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-[#374151] dark:text-slate-300 outline-none focus:border-[#DC2626] w-72"
        />
        <button
          onClick={applySet}
          className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white"
        >
          Load
        </button>
      </div>

      {set && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="w-full sm:w-72">
              <SearchBar
                value={search}
                onChange={(v) => {
                  setSearch(v);
                  if (!v.trim()) { setPage(1); load(1, "", set); }
                }}
                onSearch={doSearch}
                placeholder="Search applicants…"
              />
            </div>
            <span className="ml-auto text-sm text-[#6B7280] dark:text-slate-400">
              {totalItems} applicant{totalItems !== 1 ? "s" : ""} in SET: <strong>{set}</strong>
            </span>
          </div>

          {actionError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm text-red-700">{actionError}</div>
          )}
          {error && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm text-red-700">{error}</div>
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB] dark:border-slate-700 bg-[#F9FAFB] dark:bg-slate-900">
                  {["Applicant", "Programme", "Phone", "Stage", "Adm No", "Fees Paid", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-[#374151] dark:text-slate-300 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#9CA3AF]">Loading…</td>
                  </tr>
                )}
                {!loading && rilas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#9CA3AF]">
                      No applications found for SET: {set}
                    </td>
                  </tr>
                )}
                {rilas.map((r) => (
                  <tr key={r.id} className="border-b border-[#F3F4F6] dark:border-slate-700/50 hover:bg-[#FAFAFA] dark:hover:bg-slate-700/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {r.profilePictureUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.profilePictureUrl} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-[10px] font-bold text-[#DC2626]">
                            {(r.firstName?.[0] ?? "") + (r.lastName?.[0] ?? "")}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-[#111827] dark:text-slate-100">{fullName(r)}</p>
                          <p className="text-[10px] text-[#9CA3AF]">{r.email ?? ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#374151] dark:text-slate-300">{r.programme ?? "—"}</td>
                    <td className="px-4 py-3 text-[#374151] dark:text-slate-300">{r.phoneNumber ?? "—"}</td>
                    <td className="px-4 py-3"><StageBadge stage={r.rilaApplicationStage} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={admNo[r.id] ?? r.admissionNo ?? ""}
                          onChange={(e) => setAdmNo((p) => ({ ...p, [r.id]: e.target.value }))}
                          placeholder="ADM-001"
                          className="w-20 rounded border border-[#E5E7EB] dark:border-slate-600 px-1.5 py-1 text-[11px] outline-none focus:border-[#DC2626] bg-white dark:bg-slate-800 dark:text-slate-200"
                        />
                        <button
                          disabled={acting !== null}
                          onClick={() => {
                            const val = admNo[r.id];
                            if (val?.trim()) act(`adm-${r.id}`, () => updateRilaAdmissionNumber(r.id, val.trim()));
                          }}
                          className="rounded bg-[#DC2626] px-2 py-1 text-[10px] font-semibold text-white disabled:opacity-40"
                        >
                          Set
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={fees[r.id] ?? (r.feesPaid ?? "")}
                          onChange={(e) => setFees((p) => ({ ...p, [r.id]: e.target.value }))}
                          placeholder="0"
                          className="w-20 rounded border border-[#E5E7EB] dark:border-slate-600 px-1.5 py-1 text-[11px] outline-none focus:border-[#DC2626] bg-white dark:bg-slate-800 dark:text-slate-200"
                        />
                        <button
                          disabled={acting !== null}
                          onClick={() => {
                            const val = fees[r.id];
                            if (val !== undefined && val !== "") act(`fees-${r.id}`, () => updateRilaFeesPaid(r.id, parseFloat(val)));
                          }}
                          className="rounded bg-[#DC2626] px-2 py-1 text-[10px] font-semibold text-white disabled:opacity-40"
                        >
                          Save
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {/* Academic officer approve */}
                        {!r.approvedByAcademicOfficer && (
                          <button
                            disabled={acting !== null}
                            onClick={() => act(`ao-${r.id}`, () => updateRilaAcademicOfficerApproval(r.id, true))}
                            title="Academic Officer: Approve"
                            className="flex items-center gap-0.5 rounded bg-green-100 dark:bg-green-900/30 px-2 py-1 text-[10px] font-semibold text-green-700 dark:text-green-300 disabled:opacity-40"
                          >
                            <CheckCircle className="h-3 w-3" /> AO Approve
                          </button>
                        )}
                        {r.approvedByAcademicOfficer && (
                          <button
                            disabled={acting !== null}
                            onClick={() => act(`ao-decline-${r.id}`, () => updateRilaAcademicOfficerApproval(r.id, false))}
                            title="Academic Officer: Decline"
                            className="flex items-center gap-0.5 rounded bg-red-100 dark:bg-red-900/30 px-2 py-1 text-[10px] font-semibold text-red-700 dark:text-red-300 disabled:opacity-40"
                          >
                            <XCircle className="h-3 w-3" /> AO Decline
                          </button>
                        )}
                        {/* Rector approve */}
                        {r.approvedByAcademicOfficer && !r.approvedByRector && (
                          <button
                            disabled={acting !== null}
                            onClick={() => act(`rector-${r.id}`, () => updateRilaRectorApproval(r.id, true))}
                            title="Rector: Approve"
                            className="flex items-center gap-0.5 rounded bg-orange-100 dark:bg-orange-900/30 px-2 py-1 text-[10px] font-semibold text-orange-700 dark:text-orange-300 disabled:opacity-40"
                          >
                            <CheckCircle className="h-3 w-3" /> Rector Approve
                          </button>
                        )}
                        {/* Shortlist for interview */}
                        {!r.shortlistedForInterview && (
                          <button
                            disabled={acting !== null}
                            onClick={() => act(`shortlist-${r.id}`, () => shortlistRilaForInterview([r.id]))}
                            title="Shortlist for Interview"
                            className="flex items-center gap-0.5 rounded bg-purple-100 dark:bg-purple-900/30 px-2 py-1 text-[10px] font-semibold text-purple-700 dark:text-purple-300 disabled:opacity-40"
                          >
                            <ClipboardList className="h-3 w-3" /> Shortlist
                          </button>
                        )}
                        {/* Mark interview done */}
                        {r.shortlistedForInterview && r.rilaApplicationStage !== "INTERVIEW_DONE" && r.rilaApplicationStage !== "GRADUATED" && (
                          <button
                            disabled={acting !== null}
                            onClick={() => act(`interview-${r.id}`, () => markRilaInterviewDone(r.id))}
                            title="Mark Interview Done"
                            className="flex items-center gap-0.5 rounded bg-blue-100 dark:bg-blue-900/30 px-2 py-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300 disabled:opacity-40"
                          >
                            <CheckCircle className="h-3 w-3" /> Interview Done
                          </button>
                        )}
                        {/* Graduate */}
                        {r.rilaApplicationStage === "INTERVIEW_DONE" && (
                          <button
                            disabled={acting !== null}
                            onClick={() => act(`grad-${r.id}`, () => markRilaAsGraduated([r.id]))}
                            title="Mark as Graduated"
                            className="flex items-center gap-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 disabled:opacity-40"
                          >
                            <BookOpen className="h-3 w-3" /> Graduate
                          </button>
                        )}
                        {/* Delete */}
                        <button
                          disabled={acting !== null}
                          onClick={() => { if (confirm(`Delete ${fullName(r)}?`)) act(`del-${r.id}`, () => deleteRila([r.id])); }}
                          title="Delete application"
                          className="flex items-center gap-0.5 rounded bg-gray-100 dark:bg-slate-700 px-2 py-1 text-[10px] font-semibold text-gray-600 dark:text-slate-300 disabled:opacity-40"
                        >
                          <XCircle className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={(p) => { setPage(p); load(p, search, set); }}
            />
          </div>
        </>
      )}

      {!set && (
        <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center">
          <GraduationCap className="mx-auto mb-3 h-10 w-10 text-[#E5E7EB]" />
          <p className="text-sm font-medium text-[#374151] dark:text-slate-300">Enter a SET to view applications</p>
          <p className="mt-1 text-xs text-[#9CA3AF] dark:text-slate-400">
            Type the SET identifier above (e.g. &ldquo;SET 1&rdquo; or &ldquo;2025A&rdquo;) and click Load.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
