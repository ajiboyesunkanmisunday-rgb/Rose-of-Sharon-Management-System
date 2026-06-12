"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { Tag, ArrowLeft, Info } from "lucide-react";

export default function VotingCategoriesPage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDE9FE]">
          <Tag className="h-6 w-6 text-[#7C3AED]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Voting Categories</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Face of the Month category management</p>
        </div>
      </div>

      <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-8 flex flex-col items-center text-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EDE9FE]">
          <Info className="h-7 w-7 text-[#7C3AED]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#374151] dark:text-slate-200">
            Categories are managed by the system
          </h2>
          <p className="mt-2 max-w-md text-sm text-[#6B7280] dark:text-slate-400">
            Nominee selection and categorisation for Face of the Month is handled automatically by the backend based on member activity and engagement. No manual category configuration is required.
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push("/voting")} icon={<ArrowLeft className="h-4 w-4" />}>
          Back to Face of the Month
        </Button>
      </div>
    </DashboardLayout>
  );
}
