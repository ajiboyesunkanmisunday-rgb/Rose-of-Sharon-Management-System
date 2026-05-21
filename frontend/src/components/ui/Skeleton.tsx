/**
 * Skeleton — a shimmer placeholder used while data is loading.
 *
 * Usage:
 *   <Skeleton className="h-4 w-32" />          // single line
 *   <Skeleton className="h-10 w-full" />        // full-width block
 *   <SkeletonCard />                             // pre-built KPI card shape
 *   <SkeletonRow columns={4} />                  // pre-built table row
 */

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** A skeleton shaped like a KPI stat card */
export function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white dark:bg-slate-800 p-5 shadow-sm border border-[#E5E7EB] dark:border-slate-700">
      <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}

/** A skeleton shaped like a table row */
export function SkeletonRow({ columns = 4 }: { columns?: number }) {
  const widths = ["w-32", "w-24", "w-20", "w-16", "w-24", "w-20"];
  return (
    <tr className="border-b border-[#F3F4F6] dark:border-slate-700">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className={`h-4 ${widths[i % widths.length]}`} />
        </td>
      ))}
    </tr>
  );
}

/** A skeleton shaped like a profile detail card */
export function SkeletonProfile() {
  return (
    <div className="mb-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
      <div className="flex flex-col gap-6 md:flex-row">
        <Skeleton className="h-[180px] w-[150px] sm:h-[250px] sm:w-[200px] rounded-xl shrink-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
