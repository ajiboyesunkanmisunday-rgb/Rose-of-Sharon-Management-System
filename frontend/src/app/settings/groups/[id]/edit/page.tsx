import PageClient from "./PageClient";

export function generateStaticParams() {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `grp-${i + 1}`,
  }));
}

export default function Page() {
  return <PageClient />;
}
