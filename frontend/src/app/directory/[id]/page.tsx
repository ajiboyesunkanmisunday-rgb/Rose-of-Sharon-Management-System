import PageClient from "./PageClient";

export function generateStaticParams() {
  return Array.from({ length: 12 }, (_, i) => ({
    id: `dir-${i + 1}`,
  }));
}

export default function Page() {
  return <PageClient />;
}
