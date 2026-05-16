import PageClient from "./PageClient";

export function generateStaticParams() {
  return [{ id: "wft-1" }];
}

export default function Page() {
  return <PageClient />;
}
