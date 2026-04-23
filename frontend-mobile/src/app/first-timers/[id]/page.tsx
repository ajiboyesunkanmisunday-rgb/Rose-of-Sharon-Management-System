import { firstTimers } from "@/lib/mock-data";
import PageClient from "./PageClient";

export function generateStaticParams() {
  return firstTimers.map((m) => ({ id: m.id }));
}

export default async function FirstTimerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PageClient id={id} />;
}
