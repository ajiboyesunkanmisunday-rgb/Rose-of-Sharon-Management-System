"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getGuestWorkflow, type GuestBoardColumn, type UserBasicResponse } from "@/lib/api";
import { GitBranch, RefreshCw, User } from "lucide-react";

const COLUMNS: { status: string; label: string; headerBg: string; headerText: string; dot: string }[] = [
  { status: "FIRST_TIMER",              label: "First Timers",          headerBg: "bg-blue-50",   headerText: "text-blue-800",   dot: "bg-blue-400"   },
  { status: "SECOND_TIMER_WITHOUT_GROUP", label: "2nd Timer (No Group)", headerBg: "bg-yellow-50", headerText: "text-yellow-800", dot: "bg-yellow-400" },
  { status: "SECOND_TIMER_WITH_GROUP",  label: "2nd Timer (In Group)",  headerBg: "bg-purple-50", headerText: "text-purple-800", dot: "bg-purple-400" },
  { status: "FULL_MEMBER",              label: "Full Members",          headerBg: "bg-green-50",  headerText: "text-green-800",  dot: "bg-green-400"  },
];

function fullName(u: UserBasicResponse) {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") || "—";
}

function GuestCard({ user }: { user: UserBasicResponse }) {
  const name = fullName(user);
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "?";
  const phone = user.phoneNumber ? `+${user.countryCode ?? ""} ${user.phoneNumber}`.trim() : null;

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2.5">
        {user.profilePictureUrl ? (
          <img src={user.profilePictureUrl} alt={name} className="h-9 w-9 rounded-full object-cover shrink-0" />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#111827]">{name}</p>
          {user.occupation && (
            <p className="truncate text-xs text-[#6B7280]">{user.occupation}</p>
          )}
        </div>
      </div>
      {phone && (
        <p className="mt-2 text-xs text-[#374151]">{phone}</p>
      )}
      {user.assignedFollowUp && (
        <p className="mt-1 text-xs text-[#6B7280]">
          <span className="font-medium">Assigned:</span> {user.assignedFollowUp}
        </p>
      )}
      {(user.noOfCalls !== undefined || user.noOfVisits !== undefined) && (
        <div className="mt-2 flex gap-3 text-[10px] text-[#9CA3AF]">
          {user.noOfCalls !== undefined && <span>Calls: {user.noOfCalls}</span>}
          {user.noOfVisits !== undefined && <span>Visits: {user.noOfVisits}</span>}
        </div>
      )}
    </div>
  );
}

function BoardCol({ config, data }: { config: typeof COLUMNS[0]; data?: GuestBoardColumn }) {
  const users = data?.users ?? [];
  const count = data?.totalCount ?? users.length;

  return (
    <div className="flex min-w-[260px] flex-1 flex-col rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
      <div className={`flex items-center justify-between rounded-t-xl px-4 py-3 ${config.headerBg}`}>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${config.dot}`} />
          <span className={`text-sm font-semibold ${config.headerText}`}>{config.label}</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${config.headerBg} ${config.headerText}`}>
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-3">
        {users.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8 text-center">
            <User className="h-6 w-6 text-[#D1D5DB]" />
            <p className="text-xs text-[#9CA3AF]">No guests here</p>
          </div>
        ) : (
          users.map((u) => <GuestCard key={u.id} user={u} />)
        )}
      </div>
    </div>
  );
}

export default function GuestWorkflowPage() {
  const [columns, setColumns] = useState<GuestBoardColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getGuestWorkflow();
      setColumns(res.columns ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load guest workflow.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const totalCount = columns.reduce((s, c) => s + (c.totalCount ?? c.users?.length ?? 0), 0);

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF]">
            <GitBranch className="h-5 w-5 text-[#2563EB]" />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-[#000000]">Workflows</h1>
            <h2 className="text-[20px] font-bold text-[#000080]">Guest Workflow</h2>
            {!loading && (
              <p className="text-xs text-[#6B7280]">
                {totalCount} active guest{totalCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={fetch}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#F9FAFB] disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button className="font-medium underline" onClick={fetch}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-[#6B7280]">
            <GitBranch className="h-8 w-8 animate-pulse text-[#2563EB]" />
            <p className="text-sm">Loading guest workflow…</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <BoardCol
              key={col.status}
              config={col}
              data={columns.find((c) => c.status === col.status)}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
