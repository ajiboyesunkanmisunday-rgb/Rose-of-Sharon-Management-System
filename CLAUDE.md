# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a monorepo for the Rose of Sharon Management System (ROSMS), a church admin app.

- [frontend/](frontend/) — Next.js 16 App Router app (TypeScript, Tailwind v4), the only part that currently has code. Deployed as a fully static export to Netlify.
- [backend/](backend/) — placeholder; the real backend is a Spring Boot service hosted at `https://api.rccgros.org` (not in this repo).
- [database/](database/) — placeholder.
- [docs/](docs/) — team docs. [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) describes the `main`/`develop`/`feature/*` branch workflow.
- [HANDOFF.md](HANDOFF.md) — running session-handoff log; check it for current state of in-flight work and known-broken endpoints before starting a new task.
- [frontend/CLAUDE.md](frontend/CLAUDE.md) — **read this before touching any `[id]` route.** It documents the static-export placeholder pattern and the URL-read hydration trick that every dynamic route depends on.

## Common commands

All run from [frontend/](frontend/) unless noted:

```bash
npm install
npm run dev          # next dev — local dev at http://localhost:3000
npm run build        # next build — produces frontend/out/ for static export
npm run lint         # eslint
npx tsc --noEmit     # type check (no test suite exists)
```

Deploying from the repo root:

```bash
./deploy.sh "commit message"               # build + git push main + netlify deploy --prod, in parallel
./deploy.sh "commit message" --skip-build  # reuse existing frontend/out/
```

`deploy.sh` requires the `netlify` CLI to be authenticated locally. It auto-pushes to `main` and force-deploys to production — confirm with the user before running.

## Architecture: the static-export + proxy model

The single architectural fact that shapes everything else:

[frontend/next.config.ts](frontend/next.config.ts) sets `output: "export"` and `trailingSlash: true`. The build produces `frontend/out/` — a folder of pre-built HTML files. **There is no Node server at runtime.** Netlify just serves the static folder plus a handful of functions.

This has four cascading consequences:

### 1. Backend access goes through Netlify proxies, not direct calls

The Spring Boot API lives at `https://api.rccgros.org`. The frontend never calls it directly (CORS would block it). Three Netlify functions in [frontend/netlify/functions/](frontend/netlify/functions/) act as the boundary:

- `api-proxy.js` — handles `/api/*` → `https://api.rccgros.org/api/:splat` (configured as a 200 rewrite in [netlify.toml](netlify.toml)). 26-second timeout.
- `login.js` — special-cased because the backend returns the JWT in the `Authorization` *response header*; this function moves it into the response body so the browser can read it. The rewrite for `/api/v1/users/login` points here, not at `api-proxy`.
- `img-proxy.js` — for backend-served images.

The single fetch wrapper [frontend/src/lib/api.ts](frontend/src/lib/api.ts) (`apiFetchRaw`) injects the `Authorization: Bearer <token>` header from `localStorage["rosms_token"]`, and on 401 / session-expired responses clears the token and redirects to `/login`. All API calls should go through helpers in this file rather than calling `fetch` directly.

### 2. Auth is entirely client-side

JWT lives in `localStorage["rosms_token"]`; user profile in `localStorage["rosms_user"]`. Token expiry is decoded client-side. Auth gating happens in [frontend/src/components/layout/LayoutClient.tsx](frontend/src/components/layout/LayoutClient.tsx), which redirects to `/login` when no token is present and re-checks expiry every 60s. **Pages that should be reachable without auth (e.g. `/login`, `/forgot-password`, `/events/:id/check-in`) must not be wrapped in `DashboardLayout`.**

### 3. Dynamic `[id]` routes use a placeholder + URL-read pattern

Real backend UUIDs are not known at build time, so they cannot be enumerated in `generateStaticParams()`. The repo works around this:

- Each `[id]` route pre-builds a handful of placeholder IDs (`m-1` for members, `em-1` for e-members, `ft-1`, `st-1`, `nc-1`, `ev-1`, `cel-1`, `grp-1`, `ann-1`, `msg-1`, `cal-1`, `course-1`, `sch-1`, `dir-1`, `med-1`, `pr-1`, `req-1`, `t-1`, `tpl-1`, `wft-1`, `aw-1`, `role-1`).
- [netlify.toml](netlify.toml) has `status = 200` (rewrite, **not** 301/302) rules that serve the placeholder HTML for any real ID at the same URL.
- The client component reads the real ID from `window.location.pathname` in a `useEffect` (because `useParams()` returns the placeholder during hydration), and guards data fetches with `if (id.startsWith("<prefix>-")) return;` so the placeholder render doesn't hit the backend.

**Adding a new `[id]` route requires all three changes.** See [frontend/CLAUDE.md](frontend/CLAUDE.md) for the exact pattern and checklist — forgetting any piece causes either a build failure ("missing param in generateStaticParams") or a silent 404 on Netlify.

### 4. Every static route needs an explicit redirect entry

Netlify won't auto-serve `out/foo/index.html` for `/foo/` in all cases. [netlify.toml](netlify.toml) contains a long block of `status = 200` rewrites making each route's `index.html` reachable. New top-level pages must be added there or they will 404 in production.

## Conventions to follow when adding code

These are the patterns the repo applies consistently — match them when extending or adding code, even when something simpler would technically work. Drifting from them causes silent breakage (placeholder pattern) or visual inconsistency (UI primitives, dark mode).

### Route structure (mandatory for any `[id]` route)

Every dynamic `[id]` route in this repo is built from exactly three files. Don't deviate.

1. **`page.tsx`** — server component. Exports `generateStaticParams()` returning placeholder IDs with a short prefix (`m-`, `em-`, `ft-`, `st-`, `nc-`, `ev-`, `cel-`, `grp-`, `ann-`, `msg-`, `tpl-`, `cal-`, `course-`, `sch-`, `dir-`, `med-`, `pr-`, `req-`, `t-`, `wft-`, `aw-`, `role-`). Renders `<PageClient />` and nothing else.
2. **`PageClient.tsx`** — `"use client"`. Reads `params.id`, then re-reads from `window.location.pathname` in a `useEffect`. Every data-fetch callback starts with `if (!id || id.startsWith("<prefix>-")) return;`.
3. **[netlify.toml](netlify.toml) rewrite** — `status = 200` (rewrite, not 301/302) from `/your-route/:id/` → `/your-route/<prefix>-1/`. Each sub-route (`/edit/`, `/link-spouse/`, …) needs its own rewrite **and** its own placeholder in `generateStaticParams()`.

New sub-route under an existing `[id]`? Reuse the parent's prefix (don't invent `m-edit-`; keep `m-`). The full worked example is in [frontend/CLAUDE.md](frontend/CLAUDE.md).

### Data fetching

- All API calls go through helpers in [frontend/src/lib/api.ts](frontend/src/lib/api.ts). Never call `fetch` directly from a component.
- Types come from `api.ts` exports (`UserResponse`, `RequestResponse`, etc.), not from [src/lib/types.ts](frontend/src/lib/types.ts) (legacy, being phased out) or [src/lib/mock-data.ts](frontend/src/lib/mock-data.ts).
- The inline `useState + useEffect + useCallback` triplet is the de-facto pattern in `PageClient`s. TanStack Query is wired up but barely used — match the surrounding file's style rather than introducing Query in isolation.

### Auth

- Token: `localStorage["rosms_token"]`. User profile: `localStorage["rosms_user"]`. Use the helpers (`getToken`, `getStoredUser`, `isAuthenticated`, `isSessionExpired`) from `api.ts`; don't touch `localStorage` directly.
- Auth-gated pages render inside `DashboardLayout`. Public pages (`/login`, `/forgot-password`, `/register`, `/signup`, `/events/:id/check-in`) must **not** be wrapped in `DashboardLayout`.

### UI components

- Pull from [frontend/src/components/ui/](frontend/src/components/ui/) first: `Button`, `Modal`, `FormField`, `PhoneInput`, `SearchBar`, `Pagination`, `MultiSelect`, `StatusFilterTabs`, `Skeleton`, `EmptyState`, `Breadcrumbs`, `PageHeader`, `ActionDropdown`, `BulkActionsBar`, `DateRangePicker`, `PhotoUpload`, `ProfilePhoto`, `UserAvatar`, `SearchableSelect`, `CountryStateSelect`.
- Icons: `lucide-react`. Don't add inline SVG icon components in new files (some legacy `PageClient`s do this — don't propagate).
- Phone inputs: always `maxLength={10}` on raw `<input>`s, or use [PhoneInput](frontend/src/components/ui/PhoneInput.tsx) which already enforces it.
- List-page actions open dedicated modals from [components/user-management/](frontend/src/components/user-management/) (`AddMemberModal`, `BulkImportModal`, `SendEmailModal`, `SendSMSModal`, `AssignFollowUpModal`, `QRCodeModal`, `DeleteConfirmModal`, `SpouseLinkModal`, etc.) rather than navigating to a new page.
- Loading state: render a skeleton from [Skeleton.tsx](frontend/src/components/ui/Skeleton.tsx) (e.g. `<SkeletonProfile />`), not "Loading…" text.
- Empty state: use [EmptyState](frontend/src/components/ui/EmptyState.tsx).

### Styling

- Tailwind v4 (`@tailwindcss/postcss`). Every color class must have a `dark:` counterpart. Example pattern from the codebase: `bg-[#DBEAFE] dark:bg-blue-900/30 text-[#1D4ED8] dark:text-blue-300`. Surfaces: `bg-white dark:bg-slate-800`, page: `bg-gray-50 dark:bg-slate-900`.
- Status colors are kept in per-page `Record<string, string>` maps (e.g. `reqStatusColors` in `members/[id]/PageClient.tsx`). Match that convention rather than scattering inline classes.
- Don't introduce new font families. The three loaded in [layout.tsx](frontend/src/app/layout.tsx) (`Geist`, `Geist_Mono`, `Dancing_Script`) are the available set.

### Toasts

The repo has two systems mounted in parallel: [ToastContext](frontend/src/context/ToastContext.tsx) (`useToast().addToast(msg, type)`) and Sonner's `<Toaster>` (`toast.success(...)` from `sonner`). When editing an existing file, **match what that file already uses.** When creating a new file, prefer `useToast().addToast(...)` — it's the more widely used one in `PageClient`s.

### Module layout

App router pages under [frontend/src/app/](frontend/src/app/). The established top-level modules are: `user-management/{members,e-members,first-timers,second-timers,new-converts}`, `communication/{messages,announcements,templates}`, `workflows/{guest,prayer,counseling,celebration,active,templates}`, `requests/`, `testimonies/`, `celebrations/`, `media/`, `event-management/`, `events/` (public check-in only), `reports/`, `calendar/`, `directory/`, `notifications/`, `settings/{general,admins,roles,groups,activity-logs,change-password}`, `trainings/{sod,som,rila,baptismal,workers,courses,schedules}`. New features should slot into one of these unless the user explicitly asks for a new top-level module.

`/test/*` exists as a QA hub that calls the real backend — read those pages to learn exactly what fields a given endpoint expects.

### What not to do (footguns)

- Don't edit `frontend/netlify.toml` — it's dead. Netlify reads the one at the repo root.
- Don't trust `useParams()` alone on a `[id]` page — always pair it with the `window.location.pathname` re-read.
- Don't call `fetch` directly. Don't read `localStorage` directly. Don't hand-write JWT decoding.
- Don't add a new placeholder-prefix scheme — reuse the existing one for the sibling routes.
- Don't add server components that do data fetching. There is no Node server at runtime; the build is `output: "export"`.
- Don't add a third toast system.
- Don't commit changes unless the user asks. When you do, follow the `feature/*` PR workflow in [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) — never push directly to `main` or `develop`.

## Branch + commit rules (from docs/CONTRIBUTING.md)

- Never push directly to `main` or `develop`; open a PR from a `feature/*` or `fix/*` branch.
- Run `npm run build` locally before pushing — Netlify's build is unforgiving about static-export errors.
- Prefer `git add <file1> <file2>` over `git add .` to avoid accidentally committing `.env` or unrelated changes.

Note: `deploy.sh` pushes directly to `main` and bypasses the PR workflow. Confirm with the user before invoking it.
