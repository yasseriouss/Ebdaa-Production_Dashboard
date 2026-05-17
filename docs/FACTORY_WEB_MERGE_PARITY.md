# Factory-app → apps/web parity matrix

| factory route | factory file | web route (unified) | decision |
|---------------|--------------|---------------------|----------|
| `/` | dashboard.tsx | `/` (`#executive` section) | executive dashboard embedded in ENCID home (live API, lazy-loaded) |
| `/production` | production-hub.tsx | `/production` | port |
| `/metal/orders` | metal-orders.tsx | `/orders/metal` | ENCID list canonical; hub embeds factory lists |
| `/metal/orders/:id` | metal-order-detail.tsx | `/orders/metal/:id` | factory detail canonical |
| `/wooden/orders` | wooden-orders.tsx | `/orders/wood` | ENCID list; navigate to `:id` for detail |
| `/wooden/orders/:id` | wooden-order-detail.tsx | `/orders/wood/:id` | factory detail canonical (no modal duplicate) |
| `/projects` | projects-hub.tsx | `/projects/hub` | port |
| `/projects/joint` | — | `/projects/hub` | redirect (joint placeholder removed) |
| `/workforce` | workforce.tsx | `/workforce` | port |
| `/planning` | planning.tsx | `/planning` | ENCID PlanningKpi only (factory file unused) |
| `/analytics` | analytics.tsx | `/analytics` | ENCID Analytics only |
| `/import-export` | import-export.tsx | `/import-export` | port |
| `/__internal/project-atlas` | internal/project-atlas.tsx | `/dev/project-atlas` | DEV only |

## Primary dashboard (`/`)

| Section | Source | Data |
|---------|--------|------|
| Command center header + quick links | [`Dashboard.tsx`](../apps/web/src/pages/Dashboard.tsx) | i18n |
| **Executive overview** (`#executive`) | [`ExecutiveDashboardSection`](../apps/web/src/components/dashboard/ExecutiveDashboardSection.tsx) → [`factory/pages/dashboard.tsx`](../apps/web/src/factory/pages/dashboard.tsx) | Live API (`api-client-react`) |
| Operational analytics | [`Dashboard.tsx`](../apps/web/src/pages/Dashboard.tsx) | Fixtures / reference snapshots |

## Legacy redirects

| Route | Target |
|-------|--------|
| `/dashboard/factory` | `/#executive` |
| `/dashboard/classic` | `/` |

## i18n

- Navigation: `nav.*` in ar/en.
- Factory screens: `factory.*` namespace.
- Server stage/status labels: display as API values (product data).

See [WEB_UI_AUDIT.md](./WEB_UI_AUDIT.md) for full audit matrix.
