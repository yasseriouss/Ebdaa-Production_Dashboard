# Legacy adapter: Grand Line (`WoodWorkOrder`) ↔ `wooden_work_orders` / `metal_work_orders`

This document maps the **web panel JSON** (eight-stage `routing_progress`, numeric quantities) to the **legacy HTTP + SQLite** models used by `/api/wooden/*` and `/api/metal/*`. It is the contract for the optional bridge env `FH_SYNC_WOODEN=true`.

## Wooden (`/api/wooden`)

| Grand Line (`WoodWorkOrder`) | Legacy wooden row | Notes |
|-----------------------------|-------------------|--------|
| `work_order_id` | `order_no` | Primary join key for the bridge lookup. |
| `project_name` | `sub_project` | Different naming only. |
| `product_name` | `product` | |
| `client` | `client` | |
| `quantities.total_required` | `qty` | Coerced to string in DB. |
| `quantities.completed` | `done` | |
| `quantities.remaining` | `rem` | Prefer deriving from hub quantities when syncing **from** hub. |
| `dates.receive_date` | `order_date` | |
| — | `extension` | Cleared / `""` when syncing from hub. |
| `routing_progress` (8 stages) | **not stored 1:1** | Legacy uses four Arabic stages on `wooden_production_stages`. A full bidirectional mapping requires a dedicated translator (future work). |

### Consistency rules

- **Source of truth for the web dashboard** is `fh_wood_work_orders.payload` (factory-hub API) until you explicitly converge models.
- If `rem` in the legacy row disagrees with quantities derived from hub JSON, **prefer hub** when the bridge is triggered from hub writes.

## Metal (`/api/metal`)

| Area | Status |
|------|--------|
| Web JSON shape (`fh_*` for metal) | Not introduced yet; placeholder UI points to `GET /api/metal/orders`. |
| Future options | (1) Read legacy metal API directly in the browser; (2) add `fh_metal_work_orders` + optional bridge similar to wood. |

## Environment flags

| Variable | Effect |
|----------|--------|
| `FH_SYNC_WOODEN=true` | After each successful `PUT /api/factory-hub/wood-work-orders/:id`, mirror fields into `wooden_work_orders` (create or update by `order_no`). |
| `FH_ALLOW_SEED=true` | Allow `POST /api/factory-hub/seed` in production (normally dev-only). |

## Routing translator

Module: [`artifacts/api-server/src/lib/woodRoutingTranslator.ts`](../artifacts/api-server/src/lib/woodRoutingTranslator.ts).

| Legacy stage | Hub keys (bottleneck = min `qty_passed` in group) |
|--------------|---------------------------------------------------|
| القطع | `solid_wood`, `panel_saw`, `edge_banding`, `cnc_routing` |
| التجميع | `upholstery`, `assembly` |
| التشطيب | `painting` |
| التغليف | `packaging` |

When `FH_SYNC_WOODEN=true`, [`factoryHubWoodenBridge.ts`](../artifacts/api-server/src/services/factoryHubWoodenBridge.ts) mirrors order fields **and** updates existing `wooden_production_stages` rows from hub `routing_progress`. Reverse mapping (`legacyStagesToHubRouting`) is available for future hub writes from legacy UI.

Run tests: `pnpm --filter @workspace/api-server run test`.
