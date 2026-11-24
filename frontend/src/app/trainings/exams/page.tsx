import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ExamManager from "@/components/trainings/ExamManager";

export default function ExamsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <ExamManager />
      </Suspense>
    </DashboardLayout>
  );
}
