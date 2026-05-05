import { pgView, text, numeric, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * shared_projects_view — aggregates clients that have orders in both factories.
 * Computed at query time from metal_work_orders and wooden_work_orders.
 */
export const sharedProjectsView = pgView("shared_projects_view", {
  client: text("client").notNull(),
  metalOrderCount: integer("metal_order_count").notNull(),
  woodenOrderCount: integer("wooden_order_count").notNull(),
  metalAvgCompletion: numeric("metal_avg_completion").notNull(),
  woodenAvgCompletion: numeric("wooden_avg_completion").notNull(),
}).as(sql`
  SELECT
    m.client,
    COUNT(DISTINCT m.id)::int        AS metal_order_count,
    COUNT(DISTINCT w.id)::int        AS wooden_order_count,
    COALESCE(AVG(m.completion_pct::numeric), 0) AS metal_avg_completion,
    COALESCE(
      AVG(
        CASE WHEN w.qty::numeric > 0
          THEN (w.done::numeric / w.qty::numeric) * 100
          ELSE 0
        END
      ), 0
    )                                AS wooden_avg_completion
  FROM metal_work_orders m
  JOIN wooden_work_orders w ON LOWER(TRIM(w.client)) = LOWER(TRIM(m.client))
  WHERE m.client IS NOT NULL AND m.client <> ''
  GROUP BY m.client
  HAVING COUNT(DISTINCT m.id) > 0 AND COUNT(DISTINCT w.id) > 0
`);
