# ROSMS Frontend

Next.js 16 frontend for the Rose of Sharon Management System.

## Tech Stack

- **Next.js 16** (App Router, static export)
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide React** (icons)

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (static export to `out/`) |
| `npm run start` | Run production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
frontend/
├── public/              Static assets (logos, icons)
├── src/
│   ├── app/             Next.js App Router pages
│   │   ├── dashboard/
│   │   ├── user-management/
│   │   ├── communication/
│   │   ├── workflows/
│   │   ├── requests/
│   │   ├── celebrations/
│   │   ├── trainings/
│   │   ├── settings/
│   │   ├── reports/
│   │   ├── calendar/
│   │   ├── media/
│   │   ├── event-management/
│   │   ├── directory/
│   │   ├── notifications/
│   │   ├── register/    Public registration forms
│   │   └── layout.tsx
│   ├── components/
│   │   ├── layout/      Sidebar, TopNav, DashboardLayout
│   │   ├── ui/          Button, Modal, SearchBar, Pagination, ActionDropdown
│   │   └── user-management/  Module-specific components and modals
│   └── lib/
│       ├── types.ts     TypeScript type definitions
│       └── mock-data.ts Mock data (to be replaced with API calls)
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Design System

- **Primary navy:** `#000080`
- **Lavender accent:** `#B5B5F3`
- **Background:** `#FFFFFF` / `#FEFEFF`
- **Border:** `#E5E7EB`
- **Text:** `#111827` / `#374151` / `#6B7280`
- **Rounded corners:** `rounded-xl` (12px) for cards, `rounded-lg` (8px) for inputs

## Deployment

Currently deployed via Netlify as a static site:

```bash
npm run build       # outputs to out/
```

The `out/` directory can be deployed to any static host (Netlify, Vercel, S3, etc.).

## Integration with Backend

Mock data lives in `src/lib/mock-data.ts`. When the backend is ready, replace mock imports with API calls (e.g., `fetch`, `axios`, or a data-fetching library).

## Contributing

See the root [docs/CONTRIBUTING.md](../docs/CONTRIBUTING.md) for team workflow.
