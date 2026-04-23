import { allEvents } from "@/lib/mock-data";
import EventDetailClient from "./EventDetailClient";

export function generateStaticParams() {
  return allEvents.map((e) => ({ id: e.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventDetailClient id={id} />;
}
