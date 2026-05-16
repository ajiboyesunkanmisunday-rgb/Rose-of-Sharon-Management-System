# ROSMS — Claude Handoff File
> Updated each session. For Claude's own reference across context windows.

---

## GOAL
Build the **Rose of Sharon Management System (ROSMS)** — a church admin web app.
- Frontend: Next.js (App Router, `output: "export"`, trailingSlash), deployed on Netlify
- Backend: Java API at `https://api.rccgros.org` (proxied via Netlify `/api/*`)
- Auth token stored in `localStorage` key `rosms_token`; user in `rosms_user`

**Public church website** (not yet built) will submit forms → backend → this admin app receives them.
Test pages at `/test/*` simulate the public website using the real API.

---

## CURRENT STATE (as of 2026-05-16)

### What's live and working
- Auth (login/logout), Dashboard
- User Management: Members, E-Members, First/Second Timers, New Converts (list + profile + edit)
- Marital status guard: Spouse section + Link Spouse button hidden for non-MARRIED members ✅
- Workflows: Prayer ✅, Counseling ✅, Guest (wired to API — endpoint 404, see below)
- Trainings: School of Disciples (list + attendance + remarks + graduation)
- Testing Hub at `/test` with real-API test pages for: Testimonies, Prayer Requests, Celebrations, Announcements, New Converts
- SOD test page at `/trainings/sod/test` — calls real API ✅; now includes `region` field ✅
- Session expiry → auto-redirect to `/login` ✅
- Phone inputs capped at 10 digits across all pages ✅

### What's blocked / needs backend
- **Guest Workflow** — frontend is wired via `getGuestWorkflow()` but `/api/v1/requests/guest/workflow` returns **404**. Correct endpoint must be confirmed with backend team. Until fixed, the page shows an error.

### Known permission errors (backend role issue, not frontend)
- First-timer, E-member, Second-timer list endpoints return 400 "You do not have permission"
- Frontend handles this gracefully (shows empty state)

---

## FILES IN FLIGHT / RECENTLY MODIFIED

| File | What changed |
|------|-------------|
| `frontend/src/lib/api.ts` | Added `getGuestWorkflow()`, `region` field to `CreateSchoolOfDisciplesRequest`, session-expiry redirect |
| `frontend/src/app/trainings/sod/test/page.tsx` | Calls real API; added `region` input field |
| `frontend/src/app/workflows/guest/page.tsx` | Wired to real API via KanbanBoard |
| `frontend/src/components/workflows/KanbanBoard.tsx` | Added `GUEST_COLUMNS` export |
| `frontend/src/app/user-management/members/[id]/PageClient.tsx` | Spouse guard |
| `frontend/src/app/user-management/e-members/[id]/PageClient.tsx` | Same spouse guard |
| Phone maxLength sweep (9 files) | Added `maxLength={10}` to raw phone inputs |

---

## CHANGED THIS SESSION (2026-05-16)

1. **SOD `region` field** — added `region?: string` to `CreateSchoolOfDisciplesRequest` in `api.ts`; added `region` input to SOD test page; `region` now required for form submission
2. **Session expiry redirect** — `apiFetchRaw` now detects "session expired" / "login again" / "please login" keywords and redirects to `/login` + clears token
3. **Phone maxLength** — added `maxLength={10}` to all raw `<input>` phone fields across 9 files (PhoneInput.tsx was already correct)
4. **Guest Workflow wired** — `guest/page.tsx` replaced mock with `getGuestWorkflow()` + KanbanBoard; currently broken due to 404 on endpoint (see below)
5. **HANDOFF.md** — created and updated

---

## FAILED ATTEMPTS / KNOWN PITFALLS

- `rccg-combined-logo.svg` has a 917KB base64 PNG embedded in a `<pattern>` — fails as `<img src>` in prod. Fixed: use `rccg-icon-small.png` (17KB PNG) + CSS text instead.
- SOD test page originally used localStorage — data never reached the backend. Fixed: now calls real API.
- Guest Workflow endpoint `/api/v1/requests/guest/workflow` returns **404** — backend has not deployed this endpoint yet or it's at a different path. Prayer/Counseling use the same pattern so either the endpoint name differs or it's not yet live.
- Netlify requires explicit `[[redirects]]` entries for every static route with trailing slash (see `netlify.toml`).
- `useParams()` may return placeholder ID (e.g. `m-1`) during hydration on Netlify. Fix: read real ID from `window.location.pathname` in a `useEffect`.
- "Enroll Student" button was added to main SOD page by mistake — removed. Enrollment is test-page only.

---

## NEXT STEPS (in priority order)

1. **Confirm Guest Workflow endpoint** — ask backend team what the correct path is. HAR shows `GET /api/v1/requests/guest/workflow → 404`. Update `getGuestWorkflow()` in `api.ts` and `GUEST_COLUMNS` statuses to match the real response.
2. **TypeScript check + commit** — run `npx tsc --noEmit` then commit everything.
3. **New Converts profile page** — verify "Last Service Attended" shows correctly (field: `serviceAttended`).
4. **Reports page** — follow-up report at `/reports/followup` needs real data wired.
5. **Public website** — when ready to build, the `/test/*` pages show exactly what each form needs.

---

## KEY API PATTERNS

```typescript
// Workflow board (Prayer, Counseling shape confirmed; Guest endpoint unknown)
GET /api/v1/requests/{type}/workflow
→ { columns: [{ status: string, totalCount: number, requests: RequestResponse[] }] }

// SOD enrolment — region is REQUIRED by backend
POST /api/v1/school-of-disciples  body: CreateSchoolOfDisciplesRequest  (includes region)
GET  /api/v1/school-of-disciples?pageNo=0&pageSize=200

// Auth
POST /api/v1/users/login  (via Netlify function, not proxy)
Token: stored in localStorage["rosms_token"], sent as Bearer header
```

---

## NETLIFY NOTES
- All `[[redirects]]` in repo root `netlify.toml`
- Dynamic `[id]` routes redirect to placeholder HTML (e.g. `m-1`); real ID read from URL
- New static pages need a redirect entry added to `netlify.toml`
- API proxy: `/api/*` → `https://api.rccgros.org/api/:splat`
