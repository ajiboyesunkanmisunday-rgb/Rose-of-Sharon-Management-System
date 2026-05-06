"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import KanbanBoard, { COUNSELING_COLUMNS } from "@/components/workflows/KanbanBoard";
import { getCounselingWorkflow, type BoardColumn } from "@/lib/api";
import { HeartHandshake } from "lucide-react";

export default function CounselingWorkflowPage() {
  const [boardData, setBoardData] = useState<BoardColumn[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCounselingWorkflow();
      setBoardData(res.columns ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load counseling workflow.");
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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DBEAFE]">
            <HeartHandshake className="h-5 w-5 text-[#1D4ED8]" />
          </div>
          <div>
            <h2 className="text-[20px] font-bold text-[#000080]">Counseling Workflow</h2>
            {!loading && (
              <p className="text-xs text-[#6B7280]">
                {totalCount} active counseling session{totalCount !== 1 ? "s" : ""} · Drag cards between columns to update status
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
            <HeartHandshake className="h-8 w-8 animate-pulse text-[#1D4ED8]" />
            <p className="text-sm">Loading counseling sessions…</p>
          </div>
        </div>
      ) : (
        <KanbanBoard
          columns={COUNSELING_COLUMNS}
          boardData={boardData}
          onRefresh={fetchBoard}
          loading={loading}
        />
      )}
    </DashboardLayout>
  );
}
