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

## CURRENT STATE (as of 2026-05-15)

### What's live and working
- Auth (login/logout), Dashboard
- User Management: Members, E-Members, First/Second Timers, New Converts (list + profile + edit)
- Marital status guard: Spouse section + Link Spouse button hidden for non-MARRIED members ✅
- Workflows: Prayer ✅, Counseling ✅, Guest (now wired to real API — endpoint TBC)
- Trainings: School of Disciples (list + attendance + remarks + graduation + **Enroll Student button** ✅)
- Testing Hub at `/test` with real-API test pages for: Testimonies, Prayer Requests, Celebrations, Announcements, New Converts
- SOD test page at `/trainings/sod/test` now uses real API ✅

### What uses mock/localStorage data (needs real API)
- Guest Workflow — wired to `/api/v1/requests/guest/workflow` but endpoint NOT confirmed with backend team yet

### Known permission errors (backend role issue, not frontend)
- First-timer, E-member, Second-timer list endpoints return 400 "You do not have permission"
- Frontend handles this gracefully (shows empty state)

---

## FILES IN FLIGHT / RECENTLY MODIFIED

| File | What changed |
|------|-------------|
| `frontend/src/components/trainings/SchoolOfDisciplesPage.tsx` | Added `AddStudentModal` + "Enroll Student" button (calls real API) |
| `frontend/src/app/trainings/sod/test/page.tsx` | Rewritten — now calls real API instead of localStorage |
| `frontend/src/app/workflows/guest/page.tsx` | Rewritten — now uses `getGuestWorkflow()` + KanbanBoard |
| `frontend/src/components/workflows/KanbanBoard.tsx` | Added `GUEST_COLUMNS` export |
| `frontend/src/lib/api.ts` | Added `getGuestWorkflow()` at `/api/v1/requests/guest/workflow` |
| `frontend/src/app/user-management/members/[id]/PageClient.tsx` | Spouse guard + Link Spouse button guard |
| `frontend/src/app/user-management/e-members/[id]/PageClient.tsx` | Same spouse guard |

---

## CHANGED THIS SESSION

1. **SOD "Enroll Student"** — added `AddStudentModal` to real SOD page; calls `createSchoolOfDisciple()`
2. **SOD test page** — rewrote from localStorage to real API (`createSchoolOfDisciple`)
3. **Guest Workflow** — replaced mock data with real API call (`getGuestWorkflow`)
4. **GUEST_COLUMNS** — added to KanbanBoard.tsx matching existing Prayer/Counseling column pattern
5. **Marital status fix** — committed & pushed (members + e-members spouse guard)
6. **Handoff.md** — this file created

---

## FAILED ATTEMPTS / KNOWN PITFALLS

- `rccg-combined-logo.svg` has a 917KB base64 PNG embedded in a `<pattern>` — fails as `<img src>` in prod. Fixed: use `rccg-icon-small.png` (17KB PNG) + CSS text instead.
- SOD test page originally used localStorage — data never reached the backend. Fixed: now calls real API.
- Guest Workflow was using `mock-data.ts` / `activeWorkflowCards`. Fixed: now calls real API.
- Netlify requires explicit `[[redirects]]` entries for every static route with trailing slash (see `netlify.toml`).
- `useParams()` may return placeholder ID (e.g. `m-1`) during hydration on Netlify. Fix: read real ID from `window.location.pathname` in a `useEffect`.

---

## NEXT STEPS (in priority order)

1. **Confirm Guest Workflow API endpoint** — ask backend team if `/api/v1/requests/guest/workflow` is correct. If not, update `getGuestWorkflow()` in `api.ts` and `GUEST_COLUMNS` statuses to match what the API returns.
2. **TypeScript check + commit** — run `npx tsc --noEmit` then commit today's SOD + Guest Workflow changes.
3. **New Converts profile page** — verify "Last Service Attended" shows correctly (field: `serviceAttended`).
4. **Reports page** — follow-up report at `/reports/followup` needs real data wired.
5. **Public website** — when ready to build, the `/test/*` pages show exactly what each form needs.

---

## KEY API PATTERNS

```typescript
// Workflow board (Prayer, Counseling, Guest same shape)
GET /api/v1/requests/{type}/workflow
→ { columns: [{ status: string, totalCount: number, requests: RequestResponse[] }] }

// SOD enrolment
POST /api/v1/school-of-disciples  body: CreateSchoolOfDisciplesRequest
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
