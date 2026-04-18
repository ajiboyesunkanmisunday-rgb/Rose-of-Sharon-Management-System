import PageClient from "./PageClient";

export function generateStaticParams() {
  return Array.from({ length: 9 }, (_, i) => ({
    id: `aw-${i + 1}`,
  }));
}

export default function Page() {
  return <PageClient />;
}
