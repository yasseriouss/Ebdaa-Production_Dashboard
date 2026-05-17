# Web UI audit — post factory-app merge

Last reviewed: 2026-05-17. Track status: **open** | **decided** | **fixed**.

## Route matrix

| Path | UI source | API client | Permission key | i18n | Responsive notes | Status |
|------|-----------|------------|----------------|------|----------------|--------|
| `/` | ENCID `Dashboard` + embedded factory executive (`#executive`) | fixtures + api-client-react | `dashboard:view` | OK + factory.* | flex sidebar; executive lazy-loaded | fixed |
| `/login` | ENCID | apiJson | — | OK | OK | OK |
| `/production` | factory hub | api-client-react | `production:hub:view` | fixed | tabs, tables | fixed |
| `/orders/metal` | ENCID list | fixtures/api | `orders:metal:view` | OK | DataTable | OK |
| `/orders/metal/:id` | factory detail | api-client-react | `orders:metal:view` | fixed | OK | fixed |
| `/orders/wood` | ENCID list | hooks | `orders:wood:view` | OK | Kanban/table | OK |
| `/orders/wood/:id` | factory detail | api-client-react | `orders:wood:view` | fixed | OK | fixed |
| `/daily/*` | ENCID | mixed | `daily:*:view` | OK | OK | OK |
| `/projects/joint` | redirect | — | `projects:joint:view` | OK | — | fixed redirect hub |
| `/projects/hub` | factory | api-client-react | `projects:hub:view` | fixed (header/tabs) | min-w-0, flex-wrap | fixed |
| `/projects/new` | ENCID | — | `projects:new:view` | OK | OK | OK |
| `/workforce` | factory | api-client-react | `workforce:view` | fixed (header/KPIs) | OK | fixed |
| `/import-export` | factory | api-client-react | `import_export:import` | fixed | cards stack | fixed |
| `/planning` | ENCID PlanningKpi | fixtures | `planning:view` | OK | OK | OK |
| `/analytics/*` | ENCID | fixtures | `analytics:*` | OK | charts | OK |
| `/admin/permissions` | ENCID | api | `admin:permissions:view` | OK | OK | OK |
| `/dev/tools` | ENCID | — | `admin:permissions:view` | OK | OK | fixed |
| `/dashboard/classic` | redirect → `/` | — | `dashboard:view` | — | — | fixed |
| `/dashboard/factory` | redirect → `/#executive` | — | `dashboard:view` | — | — | fixed |
| `/dev/project-atlas` | factory internal | — | `admin:permissions:view` | partial | DEV only | OK |

## Conflicts and decisions

| Issue | Decision | Status |
|-------|----------|--------|
| Wood detail modal vs `/orders/wood/:id` | **Canonical:** route; list navigates to `:id` | fixed |
| Metal list duplicate (ENCID vs production hub) | Hub = operational; sidebar list = ENCID table | decided |
| `/` factory vs ENCID Dashboard | Merged: live executive at `/#executive` on home; operational charts below | fixed |
| `/projects/joint` placeholder | Redirect to `/projects/hub` | fixed |
| Dual Toast systems | Factory hook bridges to ENCID Toast | fixed |
| Route permission sidebar-only | `RequirePermission` route guard | fixed |
| Nested `<a>` in wouter Link | className on `Link` only | fixed |
| factory pages hardcoded Arabic | `factory.*` keys; critical screens migrated | fixed (incremental body copy remains API labels) |

## Manual responsive checklist

Test at 360×812, 768×1024, 1280×720, 1920×1080:

- [x] Sidebar reserves width (flex + sticky aside; no overlay on main)
- [x] `/projects/hub` — overflow-x on root container
- [x] `/production` — tabs wrap; responsive padding
- [x] `/import-export` — responsive spacing
- [ ] Modals/dialogs fully visible (manual spot-check)

## Automated tests

- `pnpm --filter web run test` — Vitest (routePermissions, locale parity, redirects, cutlist, sidebar gate, uiTheme)
- `pnpm --filter web run test:e2e` — Playwright (navigation, legacy redirects, responsive overflow, i18n, factory i18n)
- CI: `.github/workflows/web.yml`
