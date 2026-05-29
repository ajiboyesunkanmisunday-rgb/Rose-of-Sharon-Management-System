import VotingCyclePageClient from "./PageClient";

export function generateStaticParams() {
  return Array.from({ length: 5 }, (_, i) => ({ id: `v-${i + 1}` }));
}

export default function VotingCycleDetailPage() {
  return <VotingCyclePageClient />;
}
