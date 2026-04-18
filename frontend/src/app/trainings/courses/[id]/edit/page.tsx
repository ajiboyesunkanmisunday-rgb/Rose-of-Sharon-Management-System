import PageClient from "./PageClient";

export function generateStaticParams() {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `course-${i + 1}`,
  }));
}

export default function Page() {
  return <PageClient />;
}
