# نظام إبداع للأثاث - ENCID Factory Management

## Overview
Bilingual (Arabic/English) factory management system for Ebdaa Company - ENCID Factories. Manages two factories (Metal & Wooden) with work orders, production stages, shared projects, planning charts, and import/export.

## Architecture

- **Monorepo**: pnpm workspaces (`lib/`, `artifacts/`)
- **API Server**: `artifacts/api-server` → port 8080 (Express 5 + Drizzle ORM + PostgreSQL)
- **Frontend**: `artifacts/factory-app` → port 3000 (React + Vite + Tailwind, RTL Arabic UI)
- **DB Package**: `lib/db` — Drizzle schema + seed data
- **API Client**: `lib/api-client-react` — Orval-generated React Query hooks
- **API Zod**: `lib/api-zod` — Zod schemas from OpenAPI spec
- **API Spec**: `lib/api-spec` — OpenAPI spec (source of truth for code generation)

## Stack

- **Backend**: Express 5, Drizzle ORM, PostgreSQL, Pino logger, Multer (file upload)
- **Frontend**: React 19, Vite, Tailwind CSS v4, shadcn/ui, Recharts, Wouter (routing)
- **Code generation**: Orval (from OpenAPI → React Query hooks + Zod schemas)
- **Database**: PostgreSQL via `DATABASE_URL` env var
- **TypeScript**: 5.9 across all packages

## Database Schema (lib/db/src/schema)
- `metalWorkOrdersTable` — Metal factory work orders (MO numbers, client, product, status, qty, backlog)
- `metalProductionStagesTable` — 17 production stages per metal order
- `woodenWorkOrdersTable` — Wooden factory work orders
- `woodenProductionStagesTable` — 4 production stages per wooden order

## API Routes (artifacts/api-server/src/routes)
- `/api/metal` → metalRouter (CRUD for metal orders + stages)
- `/api/wooden` → woodenRouter (CRUD for wooden orders + stages)
- `/api/dashboard` → dashboardRouter (stats, gantt, clients, completion-trend)
- `/api/shared-projects` → sharedProjectsRouter (clients with both metal + wooden orders)
- `/api/import` → importExportRouter (Excel file upload)
- `/api/export` → importExportRouter (download reports)

## Frontend Pages (artifacts/factory-app/src/pages)
1. **dashboard.tsx** — KPI cards + real-time stats
2. **metal-orders.tsx** — Full CRUD table with add/edit/delete dialogs
3. **metal-order-detail.tsx** — 17-stage inline editing with progress bars
4. **metal-production.tsx** — WIP heatmap (17 stages) + order×stage grid
5. **wooden-orders.tsx** — Full CRUD table with add/edit/delete dialogs
6. **wooden-order-detail.tsx** — 4-stage inline editing
7. **shared-projects.tsx** — Cross-factory projects by client with gap alerts
8. **planning.tsx** — Gantt SVG chart + PERT diagram
9. **analytics.tsx** — Recharts area/bar charts (trend + client delivery)
10. **import-export.tsx** — Excel import cards + export download buttons

## Key Commands
- `pnpm --filter @workspace/api-server run dev` — API server (dev)
- `pnpm --filter @workspace/factory-app run dev` — Frontend (dev)
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/db run push` — Push DB schema changes
- `cd lib/db && pnpm exec tsx src/seed.ts` — Seed database with sample data

## Seeding
Run from `lib/db` directory: `pnpm exec tsx src/seed.ts`
Seeds 12 metal work orders + 10 wooden work orders with production stages. Skips if data already exists.

## Port Assignments
- API Server: 8080
- Factory App (frontend): 3000
- Mockup Sandbox: 8081

## UI Design
- RTL Arabic layout (dir="rtl")
- Dark industrial theme (HSL CSS variables)
- Tajawal font (Arabic-optimized Google Font)
- Amber/gold accents (`hsl(var(--primary))`)
- shadcn/ui components
