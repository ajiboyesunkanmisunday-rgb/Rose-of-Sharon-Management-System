# ROSMS Frontend — Guidance for Claude

This is a Next.js 14 App-Router frontend deployed as a **fully static export**
to Netlify (`next.config.ts` → `output: "export"`). The backend is a separate
Spring Boot API at `https://api.rccgros.org`, reached through Netlify proxy
redirects defined in [netlify.toml](netlify.toml).

The static-export constraint is the single most important thing to remember:
**there is no Node server at runtime**. Every page becomes a pre-built HTML
file at build time. That has two consequences you will hit constantly:

1. Every dynamic route segment (`[id]`, `[slug]`, …) **must** export
   `generateStaticParams()` returning a literal list of params, or the build
   fails.
2. Real backend IDs (UUIDs / DB rows) are not known at build time, so they
   are **not** pre-built. Visiting `/user-management/members/<real-uuid>/`
   would normally 404 (or, in `next dev`, throw the runtime error below).

---

## The "missing param" runtime error

```
Page "/user-management/members/[id]/page" is missing param
"/user-management/members/[id]" in "generateStaticParams()",
which is required with "output: export" config.
```

This means: at the moment Next.js tried to render that path, no entry in
`generateStaticParams()` matched the URL's `[id]`. With `output: export`,
Next.js refuses to generate the page on demand — every param has to be known
ahead of time.

### How this codebase solves it — the **placeholder + URL-read** pattern

We **cannot** enumerate real backend IDs at build time, so instead we:

1. **Pre-build a small set of placeholder routes** for each dynamic segment
   (e.g. `m-1…m-20` for members, `grp-1…grp-8` for groups, `ev-1…` for events).
2. **Tell Netlify** to serve one of those pre-built HTML files (`m-1`'s HTML)
   for *any* real ID under that path. The HTML shell is identical; only the
   URL is different.
3. **In the client component**, read the **real** ID from
   `window.location.pathname` instead of trusting `useParams()` — because
   during hydration `useParams()` returns the placeholder ID baked into the
   prerendered HTML (e.g. `"m-1"`), not the real UUID in the address bar.
4. **Guard the API fetch** so it doesn't request a member with the placeholder
   ID before the URL-read effect updates state.

### The three files involved for every `[id]` route

#### 1. `page.tsx` — server component, declares the placeholders

```tsx
import PageClient from "./PageClient";

export function generateStaticParams() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `m-${i + 1}`, // placeholders — m-1, m-2, …, m-20
  }));
}

export default function Page() {
  return <PageClient />;
}
```

The exact number is arbitrary; one placeholder is enough for Netlify's
redirect rule to work. Multiple just exist as historical artifacts.

#### 2. `PageClient.tsx` — client component, reads the real ID from the URL

```tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PageClient() {
  const params = useParams();
  const paramId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";
  const [id, setId] = useState(paramId);

  // Netlify serves the m-1 placeholder HTML for any real UUID path,
  // so useParams() returns "m-1" during hydration. Read the actual ID
  // from window.location to fix the mismatch.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 1] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guard: skip the API call while id still looks like the placeholder
  const fetchUser = useCallback(async () => {
    if (!id || id.startsWith("m-")) return;
    // … fetch real data from backend …
  }, [id]);
}
```

The placeholder-prefix guard (`id.startsWith("m-")`) is what stops the
component from sending a `GET /api/users/m-1` request to the backend during
the first render before the URL-read effect has run.

#### 3. `netlify.toml` — rewrite real-ID paths to the placeholder HTML

```toml
[[redirects]]
  from   = "/user-management/members/:id/"
  to     = "/user-management/members/m-1/"
  status = 200      # 200 = rewrite (serve other file at same URL), not 301/302
```

A `status = 200` rewrite is critical: it serves the placeholder HTML at the
**original** URL, so `window.location.pathname` still reads as the real ID.
A 301/302 redirect would change the URL bar and break the URL-read trick.

Edit-pages and other nested routes need their own rule — see the existing
entries in [netlify.toml](netlify.toml) for the full set.

---

## Checklist when adding a new dynamic `[id]` route

When creating, e.g., `src/app/announcements/[id]/page.tsx`:

- [ ] `page.tsx` exports `generateStaticParams()` returning at least one
      placeholder (convention: short prefix matching the resource, e.g.
      `ann-1`, `ev-1`, `cel-1`).
- [ ] `PageClient.tsx` uses `useParams()` **and** an effect that re-reads the
      ID from `window.location.pathname`.
- [ ] The data-fetch effect early-returns when `id.startsWith("<prefix>-")`
      so the placeholder render does not hit the backend.
- [ ] [netlify.toml](netlify.toml) has a `status = 200` rewrite for
      `/announcements/:id/` → `/announcements/ann-1/`.
- [ ] If there are sub-routes (`/[id]/edit/`, `/[id]/link-spouse/`, …), each
      needs its own placeholder in `generateStaticParams()` **and** its own
      Netlify rewrite rule.

Forgetting any one of these produces the "missing param" runtime error or a
silent 404 on Netlify.

---

## Other things worth remembering

- **`pageId` placeholders must match across siblings.** The view page, edit
  page, and link-spouse page under `/members/[id]/` all use the `m-*` prefix.
  Don't introduce a new prefix per sub-page — Netlify rules and the client
  guard rely on the same prefix.
- **All `/api/*` calls** are proxied to `https://api.rccgros.org/api/*` by a
  Netlify redirect. `apiFetchRaw` in [src/lib/api.ts](src/lib/api.ts) is the
  single fetch wrapper; it injects the `Authorization` header from
  `localStorage["rosms_token"]` and handles 401/expired-token logout.
- **Auth gating** lives in
  [src/components/layout/LayoutClient.tsx](src/components/layout/LayoutClient.tsx).
  It redirects to `/login` when no token is present and runs a passive
  expiry check every 60s. New pages that should be public (e.g. a QR-code
  landing page) must **not** be wrapped in `DashboardLayout`.
- **`/login`, `/forgot-password`, and `/events/:id/check-in`** are the only
  pages reachable without a token. Everything else assumes an authenticated
  session.
- **The login POST** goes to a Netlify Function (`/.netlify/functions/login`)
  rather than the proxy, because the JWT is returned in the
  `Authorization` response header and the function moves it into the JSON
  body so the browser can read it.
