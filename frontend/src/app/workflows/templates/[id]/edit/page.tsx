import PageClient from "./PageClient";

export function generateStaticParams() {
  return Array.from({ length: 3 }, (_, i) => ({
    id: `wft-${i + 1}`,
  }));
}

export default function Page() {
  return <PageClient />;
}
