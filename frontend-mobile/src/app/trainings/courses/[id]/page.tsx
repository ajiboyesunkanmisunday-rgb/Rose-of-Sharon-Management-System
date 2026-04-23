import { trainingCourses } from "@/lib/mock-data";
import PageClient from "./PageClient";

export function generateStaticParams() {
  return trainingCourses.map((c) => ({ id: c.id }));
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PageClient id={id} />;
}
