# Rose of Sharon Management System (ROSMS)

A web-based church management platform for handling members, guests, follow-ups, communication (SMS/email), events, training, and reports. It features role-based access and a public website for sermons and registrations, improving efficiency and engagement.

## Project Structure

```
Rose-of-Sharon-Management-System/
├── frontend/       Next.js frontend application (TypeScript, Tailwind CSS)
├── backend/        Java/Spring Boot backend services
├── database/       Database schemas, migrations, seed data
└── docs/           Project documentation, API specs, design assets
```

## Modules

- **Dashboard** — KPI overview and activity feed
- **User Management** — Members, E-Members, First Timers, Second Timers, New Converts
- **Communication** — SMS/Email messages and templates
- **Workflows** — Guest follow-up pipelines and templates
- **Requests** — Prayer, Counseling, Complaints, Suggestions, Testimonies
- **Celebrations** — Birthdays, Wedding Anniversaries, Thanksgiving
- **Trainings** — Courses (Water Baptism, etc.) and Schedules
- **Media** — Sermons, Podcasts, Videos
- **Event Management** — Church events and registrations
- **Reports** — Attendance, follow-up, member growth reports
- **Calendar** — Events and role assignments
- **Directory** — Searchable church member directory
- **Notifications** — System and user notifications
- **Settings** — General, Roles & Permissions, Groups

## Tech Stack

**Frontend**
- Next.js 16 (App Router) with TypeScript
- Tailwind CSS v4
- Lucide React icons
- Static export for deployment

**Backend** (planned)
- Java / Spring Boot
- REST API

**Database** (planned)
- Centralized relational database (PostgreSQL or MySQL)

**Infrastructure**
- Three virtual servers (frontend, backend, website)
- SMS gateway integration
- Email service integration
- YouTube media links

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Production Build

```bash
cd frontend
npm run build
```

## Team Workflow

This project uses a branch-based workflow. See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for full guidelines.

**Quick reference:**

1. Pull latest: `git checkout develop && git pull origin develop`
2. Create branch: `git checkout -b feature/<your-feature>`
3. Commit your work: `git add . && git commit -m "Clear message"`
4. Push branch: `git push origin feature/<your-feature>`
5. Open a Pull Request on GitHub (base: `develop`, compare: your branch)
6. Request review, merge after approval

**Rules:**
- Never push directly to `main` or `develop`
- Always pull latest `develop` before starting new work
- Never commit `.env` files or credentials
- Never commit `node_modules/` or build output

## Branch Strategy

- `main` — Production. Only merged from `develop` after review.
- `develop` — Active integration branch.
- `feature/*` — New features, branched from `develop`.
- `fix/*` — Bug fixes, branched from `develop`.

## License

Proprietary — RCCG Rose of Sharon.
