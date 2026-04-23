import { allAnnouncements } from "@/lib/mock-data";
import PageClient from "./PageClient";

export function generateStaticParams() {
  return allAnnouncements.map((a) => ({ id: a.id }));
}

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PageClient id={id} />;
}
