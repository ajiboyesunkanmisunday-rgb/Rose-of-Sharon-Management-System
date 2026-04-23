import { members } from "@/lib/mock-data";
import PageClient from "./PageClient";

export function generateStaticParams() {
  return members.map((m) => ({ id: m.id }));
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PageClient id={id} />;
}
