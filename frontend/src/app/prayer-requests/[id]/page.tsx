import { prayerRequests } from "@/lib/mock-data";
import PrayerRequestDetailClient from "./PageClient";

export function generateStaticParams() {
  return prayerRequests.map((r) => ({ id: r.id }));
}

export default function PrayerRequestDetailPage() {
  return <PrayerRequestDetailClient />;
}
