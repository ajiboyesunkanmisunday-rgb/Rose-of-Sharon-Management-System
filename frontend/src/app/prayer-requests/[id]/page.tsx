import PrayerRequestDetailClient from "./PageClient";

// Static export: pre-build one placeholder HTML shell.
// Netlify redirects /prayer-requests/:id/ → /prayer-requests/pr-1/
// so the pre-built page is served; the client reads the real ID from
// window.location.pathname and fetches from the API.
export function generateStaticParams() {
  return [{ id: "pr-1" }];
}

export default function PrayerRequestDetailPage() {
  return <PrayerRequestDetailClient />;
}
