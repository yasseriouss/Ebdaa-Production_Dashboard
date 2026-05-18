# Product context — Factory Data Hub (ENCID)

## Register

Product (operations dashboard): design serves **plant managers**, **floor supervisors**, **planners**, and **permission admins**.

## Purpose

Unify **wood** and **metal** production visibility: orders, stages, workforce, planning, analytics, and audit trails in one RTL-first web app backed by a single API and LibSQL database.

## Users

- **Executive / plant manager**: home executive overview, client and load signals, navigation to analytics.
- **Supervisor / operator**: production hub for order lists and shop-floor views, daily sheets, equipment.
- **Admin**: permissions, audit log, dev diagnostics (controlled by keys).

## Strategic principles

- One **canonical** entry for order lists: **Production hub** (`/production`); legacy `/orders/*` list URLs redirect with permissions preserved.
- **Home** (`/`) is **executive-only**; fixture-heavy operational charts live under **Analytics** (`/analytics`).
- **Bilingual** Arabic/English with parity-checked message keys; factory screens use `factory.*` / `ft()` where ported from the factory bundle.

## Anti-patterns to avoid

- Duplicating order list routes in the sidebar (use production hub).
- Hardcoding user-visible strings outside `locales/*.ts`.
- Splitting trust between ad-hoc REST and undocumented shapes — prefer OpenAPI-generated clients for new endpoints.
