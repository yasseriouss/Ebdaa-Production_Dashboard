# Factory-app → apps/web parity matrix

| factory route | factory file | web route (unified) | decision |
|---------------|--------------|---------------------|----------|
| `/` | dashboard.tsx | `/` (executive only; `#operational` → `/analytics`) | executive dashboard embedded in ENCID home (live API, lazy-loaded) |
| `/production` | production-hub.tsx | `/production` (`?factory` / `?view`) | port |
| `/metal/orders` | metal-orders.tsx | `/production?factory=metal&view=orders` | redirect; hub embeds lists |
| `/metal/orders/:id` | metal-order-detail.tsx | `/orders/metal/:id` | factory detail canonical |
| `/wooden/orders` | wooden-orders.tsx | `/production?factory=wood&view=orders` | redirect; hub embeds lists |
| `/wooden/orders/:id` | wooden-order-detail.tsx | `/orders/wood/:id` | factory detail canonical (no modal duplicate) |
| `/projects` | projects-hub.tsx | `/projects/hub` | port |
| `/projects/joint` | shared-projects.tsx | `/projects/joint` | port |
| `/workforce` | workforce.tsx | `/workforce` | port |
| `/planning` | planning.tsx | `/planning` | factory planning page |
| `/analytics` | analytics.tsx | `/analytics` | factory analytics + embedded operational block |
| `/import-export` | import-export.tsx | `/import-export` | port |
| `/__internal/project-atlas` | internal/project-atlas.tsx | `/dev/project-atlas` | DEV only |

## Primary dashboard (`/`)

| Section | Source | Data |
|---------|--------|------|
| Command center header + quick links | [`Dashboard.tsx`](../apps/web/src/pages/Dashboard.tsx) | i18n |
| **Executive overview** (`/` and `#executive`) | [`ExecutiveDashboardSection`](../apps/web/src/components/dashboard/ExecutiveDashboardSection.tsx) → [`factory/pages/dashboard.tsx`](../apps/web/src/factory/pages/dashboard.tsx) | Live API |
| Operational analytics (fixtures-heavy) | [`DashboardOperationalAnalytics`](../apps/web/src/components/DashboardOperationalAnalytics.tsx) on [`factory/pages/analytics.tsx`](../apps/web/src/factory/pages/analytics.tsx) | fixtures + hub hooks |

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
