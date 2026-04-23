import { calendarEvents } from "@/lib/mock-data";
import CalendarDetailClient from "./CalendarDetailClient";

export function generateStaticParams() {
  return calendarEvents.map((e) => ({ id: e.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CalendarDetailClient id={id} />;
}
