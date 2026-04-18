import PageClient from "./PageClient";

export function generateStaticParams() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `req-${i + 1}`,
  }));
}

export default function Page() {
  return <PageClient />;
}
