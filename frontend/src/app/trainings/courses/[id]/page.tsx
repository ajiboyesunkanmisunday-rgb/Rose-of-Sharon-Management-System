import PageClient from "./PageClient";

export function generateStaticParams() {
  return [{ id: "course-1" }];
}

export default function Page() {
  return <PageClient />;
}
