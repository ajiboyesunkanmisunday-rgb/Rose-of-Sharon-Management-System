import { secondTimers } from "@/lib/mock-data";
import PageClient from "./PageClient";

export function generateStaticParams() {
  return secondTimers.map((m) => ({ id: m.id }));
}

export default async function SecondTimerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PageClient id={id} />;
}
