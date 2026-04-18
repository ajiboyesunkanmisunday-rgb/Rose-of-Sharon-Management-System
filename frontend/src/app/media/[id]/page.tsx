import PageClient from "./PageClient";

export function generateStaticParams() {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `med-${i + 1}`,
  }));
}

export default function Page() {
  return <PageClient />;
}
