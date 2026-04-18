import PageClient from "./PageClient";

export function generateStaticParams() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `nc-${i + 1}`,
  }));
}

export default function Page() {
  return <PageClient />;
}
