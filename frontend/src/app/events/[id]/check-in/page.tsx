import PageClient from "./PageClient";

export function generateStaticParams() {
  return [
    { id: "ev-1" },
    { id: "ev-2" },
    { id: "ev-3" },
  ];
}

export default function CheckInPage() {
  return <PageClient />;
}
