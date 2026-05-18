# Design tokens — Factory Data Hub

## Surfaces

- **Industrial shell** (`Layout`, sidebar, glass panels): dark base, `brand-*` utilities, `glass-panel`, OKLCH chart theme in `industrialChartTheme`.
- **Factory surface** (`FactorySurface` + `factory-shadcn.css`): embedded shadcn/Radix cards and controls for ported factory pages. Use `embedded` prop when nested in industrial shells.

## Shared primitives

- **`PageHeader`** ([`apps/web/src/components/shared/PageHeader.tsx`](apps/web/src/components/shared/PageHeader.tsx)): title, optional description, actions — use for new ENCID pages and when aligning factory headers.
- **`KpiGrid`** ([`apps/web/src/components/shared/KpiGrid.tsx`](apps/web/src/components/shared/KpiGrid.tsx)): responsive KPI card grid.

## Typography & motion

- Industrial routes: `font-industrial`, tight tracking on uppercase micro-labels.
- Factory routes: inherit shadcn `text-foreground` / `text-muted-foreground`.
- Prefer **Framer Motion** layout animations sparingly on hubs; avoid motion that obscures data on first paint.

## Accessibility

- Maintain `role="main"` in `Layout`; tab panels must have stable `aria-controls` / labels when using tabs.
- Chart tooltips and tick labels must respect active `dir` / `lang` from `I18nContext` and `DirectionContext`.
