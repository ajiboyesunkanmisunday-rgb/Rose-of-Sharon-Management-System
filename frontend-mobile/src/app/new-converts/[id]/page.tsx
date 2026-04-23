import { newConverts } from "@/lib/mock-data";
import PageClient from "./PageClient";

export function generateStaticParams() {
  return newConverts.map((m) => ({ id: m.id }));
}

export default async function NewConvertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PageClient id={id} />;
}
