"use client";

/**
 * /test — Testing Hub
 *
 * Simulates both:
 *  1. Public-website form submissions (testimonies, prayer requests, celebrations,
 *     announcements, new-convert / first-timer registration) — so admin staff can
 *     verify the receiving end works before the public site is built.
 *  2. Admin-side feature tests that don't need a live backend (e.g. SOD page).
 *
 * All public-submission pages hit the real API using the admin auth token, so
 * you can verify the records appear in the correct admin section immediately.
 */

import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  AlertTriangle, BookOpen, Heart, Megaphone, Star, UserPlus,
  Users, ArrowRight, ExternalLink, FlaskConical,
} from "lucide-react";

interface Card {
  title: string;
  description: string;
  href: string;
  adminHref: string;
  adminLabel: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  tag: "public" | "admin";
}

const CARDS: Card[] = [
  // ── Public-website simulations ────────────────────────────────────────────
  {
    title: "Testimony",
    description:
      "Simulate a church member submitting a testimony on the public website. Verify it appears in the Testimonies admin section.",
    href: "/test/testimonies",
    adminHref: "/testimonies",
    adminLabel: "View Testimonies",
    icon: <Star className="h-6 w-6" />,
    color: "#F59E0B",
    bg: "#FEF3C7",
    tag: "public",
  },
  {
    title: "Prayer Request",
    description:
      "Submit a prayer request, counseling request, or suggestion as a member would on the public site. Verify in Requests / Workflows.",
    href: "/test/prayer-requests",
    adminHref: "/prayer-requests",
    adminLabel: "View Prayer Requests",
    icon: <Heart className="h-6 w-6" />,
    color: "#EF4444",
    bg: "#FEE2E2",
    tag: "public",
  },
  {
    title: "Celebration",
    description:
      "Announce a birthday, anniversary, child dedication, or wedding as a member would. Verify it appears in Celebrations.",
    href: "/test/celebrations",
    adminHref: "/celebrations",
    adminLabel: "View Celebrations",
    icon: <Star className="h-6 w-6" />,
    color: "#8B5CF6",
    bg: "#EDE9FE",
    tag: "public",
  },
  {
    title: "Announcement Request",
    description:
      "Submit a church announcement request for admin approval. Verify it appears in the Announcements queue with RECEIVED status.",
    href: "/test/announcements",
    adminHref: "/communication/announcements",
    adminLabel: "View Announcements",
    icon: <Megaphone className="h-6 w-6" />,
    color: "#0EA5E9",
    bg: "#E0F2FE",
    tag: "public",
  },
  {
    title: "Guest Workflow [TEST]",
    description:
      "Test the guest workflow: register a first-time visitor as they would fill the guest form on the public website. Verify they appear in the Guest Workflow board under 'First Timers'.",
    href: "/test/guest-workflow",
    adminHref: "/workflows/guest",
    adminLabel: "View Guest Workflow",
    icon: <Users className="h-6 w-6" />,
    color: "#2563EB",
    bg: "#EFF6FF",
    tag: "public",
  },
  // ── Member self-registration ──────────────────────────────────────────────
  {
    title: "New Convert Registration",
    description:
      "Register a new convert as they would fill the form after giving their life to Christ. Verify in New Converts under User Management.",
    href: "/test/new-convert",
    adminHref: "/user-management/new-converts",
    adminLabel: "View New Converts",
    icon: <UserPlus className="h-6 w-6" />,
    color: "#16A34A",
    bg: "#DCFCE7",
    tag: "public",
  },
  // ── Admin feature tests (no live backend needed) ──────────────────────────
  {
    title: "School of Disciples",
    description:
      "Test all SOD admin features locally: student cards, class & exam attendance, official remarks, bulk graduation, search, filters. Uses localStorage — no API.",
    href: "/trainings/sod/test",
    adminHref: "/trainings/sod",
    adminLabel: "Live SOD page",
    icon: <BookOpen className="h-6 w-6" />,
    color: "#D97706",
    bg: "#FEF3C7",
    tag: "admin",
  },
];

export default function TestHubPage() {
  const router = useRouter();

  const publicCards = CARDS.filter((c) => c.tag === "public");
  const adminCards  = CARDS.filter((c) => c.tag === "admin");

  return (
    <DashboardLayout>
      {/* Banner */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-bold text-amber-800">Testing Hub — Pre-Production QA Area</p>
          <p className="mt-0.5 text-xs text-amber-700 leading-relaxed">
            This section lets you test features that will eventually live on the public-facing
            website before that site is built. Public-submission tests hit the{" "}
            <span className="font-semibold">real backend API</span> using your admin credentials, so
            you can immediately verify the record appears in the correct admin section. Admin feature
            tests use local data only.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDE9FE] dark:bg-purple-900/30">
          <FlaskConical className="h-6 w-6 text-[#7C3AED] dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000] dark:text-slate-100">Testing Hub</h1>
          <p className="text-sm text-[#6B7280] dark:text-slate-400">Simulate public submissions and test admin features before launch</p>
        </div>
      </div>

      {/* Public Website Simulations */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-[#6B7280] dark:text-slate-400" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#374151] dark:text-slate-300">
            Public Website Form Simulations
          </h2>
          <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            Hits real API
          </span>
        </div>
        <p className="mb-4 text-xs text-[#6B7280] dark:text-slate-400">
          These forms replicate what church members will fill out on the public website. After
          submitting, click &ldquo;View in admin&rdquo; to confirm the record was created correctly.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {publicCards.map((card) => (
            <TestCard key={card.href} card={card} onNavigate={router.push} />
          ))}
        </div>
      </div>

      {/* Admin Feature Tests */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#6B7280] dark:text-slate-400" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#374151] dark:text-slate-300">
            Admin Feature Tests
          </h2>
          <span className="rounded-full border border-blue-200 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
            Local data only
          </span>
        </div>
        <p className="mb-4 text-xs text-[#6B7280] dark:text-slate-400">
          Test admin UI features with local mock data — no backend required. Great for verifying
          layouts, interactions, and edge cases.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminCards.map((card) => (
            <TestCard key={card.href} card={card} onNavigate={router.push} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

function TestCard({ card, onNavigate }: { card: Card; onNavigate: (href: string) => void }) {
  return (
    <div className="flex flex-col rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm transition-shadow hover:shadow-md">
      <div
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ backgroundColor: card.bg, color: card.color }}
      >
        {card.icon}
      </div>
      <h3 className="text-sm font-bold text-[#111827] dark:text-slate-100">{card.title}</h3>
      <p className="mt-1 flex-1 text-xs text-[#6B7280] dark:text-slate-400 leading-relaxed">{card.description}</p>

      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={() => onNavigate(card.href)}
          className="flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: card.color }}
        >
          Test Now <ArrowRight className="h-3 w-3" />
        </button>
        <button
          onClick={() => onNavigate(card.adminHref)}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-2 text-xs font-medium text-[#374151] dark:text-slate-300 hover:bg-[#F9FAFB]"
        >
          <ExternalLink className="h-3 w-3" /> {card.adminLabel}
        </button>
      </div>
    </div>
  );
}
