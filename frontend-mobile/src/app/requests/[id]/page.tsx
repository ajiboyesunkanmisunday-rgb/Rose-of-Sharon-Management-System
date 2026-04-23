import { allRequests } from "@/lib/mock-data";
import PageClient from "./PageClient";

export function generateStaticParams() {
  return allRequests.map((r) => ({ id: r.id }));
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PageClient id={id} />;
}
