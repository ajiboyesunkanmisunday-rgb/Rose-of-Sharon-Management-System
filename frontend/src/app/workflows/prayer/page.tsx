"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KanbanBoard, { PRAYER_COLUMNS } from "@/components/workflows/KanbanBoard";
import { getPrayerWorkflow, type BoardColumn } from "@/lib/api";
import { Flame } from "lucide-react";

export default function PrayerWorkflowPage() {
  const [boardData, setBoardData] = useState<BoardColumn[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getPrayerWorkflow();
      setBoardData(res.columns ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load prayer workflow.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  const totalCount = boardData.reduce((sum, col) => sum + (col.totalCount ?? col.requests?.length ?? 0), 0);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Workflows</h1>
        <div className="mt-1 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDE9FE]">
            <Flame className="h-5 w-5 text-[#7C3AED]" />
          </div>
          <div>
            <h2 className="text-[20px] font-bold text-[#000080]">Prayer Request Workflow</h2>
            {!loading && (
              <p className="text-xs text-[#6B7280]">
                {totalCount} active prayer request{totalCount !== 1 ? "s" : ""} · Drag cards between columns to update status
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button className="font-medium underline" onClick={fetchBoard}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-[#6B7280]">
            <Flame className="h-8 w-8 animate-pulse text-[#7C3AED]" />
            <p className="text-sm">Loading prayer requests…</p>
          </div>
        </div>
      ) : (
        <KanbanBoard
          columns={PRAYER_COLUMNS}
          boardData={boardData}
          onRefresh={fetchBoard}
          loading={loading}
        />
      )}
    </DashboardLayout>
  );
}
