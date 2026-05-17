# Drizzle Kit: `generate` and metal_stage_log

## Metal stage log migration

The legacy `metal_stage_log` table (from `0000`) used `stage_id`, `action`, `qty_delta`, etc. The app schema in `src/schema/metalStageLog.ts` matches production tracking rows: `metal_order_id`, `mo_number`, `log_date`, `stage_name`, quantities, etc.

**Applied in the repo:** `drizzle/0007_metal_stage_log_sheet_shape.sql` — drops and recreates `metal_stage_log` (no data migration from the old shape).

Run migrations:

```bash
pnpm --filter @workspace/db run migrate
```

## Why `drizzle-kit generate` used to hang

`drizzle-kit generate` diffs the **last snapshot** in `drizzle/meta/*_snapshot.json` against the current TS schema. Snapshots in this repo lag behind applied SQL migrations (`0004`–`0007`), so the diff is large and Drizzle asks **interactive** questions (e.g. create vs rename `metal_order_id`). Agents and CI cannot answer those prompts.

**Locally:** run `pnpm --filter @workspace/db run generate` in a real terminal and:

1. Prefer **create column** when the schema introduced a new column (not a rename).
2. After `0007`, the DB matches `metalStageLog.ts`; you still may need several default answers until `meta` snapshots are brought in line.

**Optional:** upgrade `drizzle-kit` when your version supports documented non-interactive flags (see Drizzle release notes / GitHub issues).

Until snapshots are refreshed, **rely on hand-written migrations** in `drizzle/*.sql` and the journal instead of expecting `generate` to be fully automated here.

## Empty `__drizzle_migrations` repair

`src/migrate.ts` plus `src/migrationRepair.ts` detect an **empty** Drizzle journal while real tables exist (e.g. DB restored without the ledger). They **stamp** the latest migration inferred from `PRAGMA` / `sqlite_master`, then re-run `migrate`. Override by fixing the DB file; to fully reset, delete the DB and run `migrate` once.
