import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { woodenWorkOrdersTable } from "./woodenWorkOrders";

export const woodenProductionStagesTable = sqliteTable("wooden_production_stages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  woodenOrderId: text("wooden_order_id").notNull().references(() => woodenWorkOrdersTable.id),
  stageName: text("stage_name").notNull(),
  stageOrder: integer("stage_order").notNull(),
  qtyDone: text("qty_done").notNull().default("0"),
  status: text("status").notNull().default("لم يتم البدء"),
  deletedAt: text("deleted_at"),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => ({
  unq: uniqueIndex("wooden_order_stage_unq").on(table.woodenOrderId, table.stageName),
}));

export type WoodenProductionStage = typeof woodenProductionStagesTable.$inferSelect;
export type NewWoodenProductionStage = typeof woodenProductionStagesTable.$inferInsert;
