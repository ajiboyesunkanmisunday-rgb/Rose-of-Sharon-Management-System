import PageClient from "./PageClient";

export function generateStaticParams() {
  return [{ id: "req-1" }];
}

export default function Page() {
  return <PageClient />;
}
