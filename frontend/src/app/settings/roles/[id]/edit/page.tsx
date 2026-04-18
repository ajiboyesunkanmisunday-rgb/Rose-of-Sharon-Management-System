import PageClient from "./PageClient";

export function generateStaticParams() {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `role-${i + 1}`,
  }));
}

export default function Page() {
  return <PageClient />;
}
