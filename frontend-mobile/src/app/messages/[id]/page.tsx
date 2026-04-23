import { messages } from "@/lib/mock-data";
import MessageDetailClient from "./MessageDetailClient";

export function generateStaticParams() {
  return messages.map((m) => ({ id: m.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MessageDetailClient id={id} />;
}
