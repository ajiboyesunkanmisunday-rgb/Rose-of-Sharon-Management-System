import { eMembers } from "@/lib/mock-data";
import PageClient from "./PageClient";

export function generateStaticParams() {
  return eMembers.map((m) => ({ id: m.id }));
}

export default async function EMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PageClient id={id} />;
}
