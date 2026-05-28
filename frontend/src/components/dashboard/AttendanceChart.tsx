"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface AttendanceItem {
  day: string;
  value: number;
}

interface AttendanceChartProps {
  data: AttendanceItem[];
  loading: boolean;
}

export default function AttendanceChart({
  data,
  loading,
}: AttendanceChartProps) {
  const isEmpty = !loading && data.length === 0;

  return (
    <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm dark:shadow-slate-900">
      <div className="mb-4 flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-[#111827] dark:text-slate-100">
          Past 6 Services Attendance
        </h2>
        {(loading || isEmpty) && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
            Loading
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex h-56 items-center justify-center text-sm text-[#6B7280] dark:text-slate-400">
          Loading attendance...
        </div>
      ) : isEmpty ? (
        <div className="flex h-56 items-end justify-between gap-2 px-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <span className="skeleton h-3 w-10" />
              <div
                className="skeleton w-full rounded-t-md"
                style={{ height: "120px" }}
              />
              <span className="skeleton h-3 w-12" />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="h-56 w-full
            [--chart-bar:#000080] dark:[--chart-bar:#6366F1]
            [--chart-grid:#E5E7EB] dark:[--chart-grid:#334155]
            [--chart-text:#6B7280] dark:[--chart-text:#94A3B8]
            [--tooltip-bg:#FFFFFF] dark:[--tooltip-bg:#1E293B]
            [--tooltip-text:#111827] dark:[--tooltip-text:#F1F5F9]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--chart-grid)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "var(--chart-text)" }}
                tickMargin={6}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "var(--chart-text)" }}
                width={32}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "var(--chart-grid)", opacity: 0.25 }}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid var(--chart-grid)",
                  backgroundColor: "var(--tooltip-bg)",
                  color: "var(--tooltip-text)",
                  fontSize: 12,
                  padding: "8px 10px",
                }}
                labelStyle={{
                  color: "var(--tooltip-text)",
                  fontWeight: 600,
                  marginBottom: 2,
                }}
                itemStyle={{ color: "var(--tooltip-text)" }}
                formatter={(value) => [`${value}`, "Attendance"]}
              />
              <Bar
                dataKey="value"
                fill="var(--chart-bar)"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  style={{
                    fill: "var(--chart-text)",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
