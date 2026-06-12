import FaceOfTheMonthDetailClient from "./PageClient";

export function generateStaticParams() {
  return Array.from({ length: 5 }, (_, i) => ({ id: `fotm-${i + 1}` }));
}

export default function FaceOfTheMonthDetailPage() {
  return <FaceOfTheMonthDetailClient />;
}
