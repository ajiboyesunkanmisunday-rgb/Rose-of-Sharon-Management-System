import PageClient from "./PageClient";

export function generateStaticParams() {
  return Array.from({ length: 15 }, (_, i) => ({
    id: `ev-${i + 1}`,
  }));
}

export default function Page() {
  return <PageClient />;
}
