import { trainingSchedules } from "@/lib/mock-data";
import PageClient from "./PageClient";

export function generateStaticParams() {
  return trainingSchedules.map((s) => ({ id: s.id }));
}

export default async function ScheduleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PageClient id={id} />;
}
