import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { metalWorkOrdersTable } from "./metalWorkOrders";

export const metalProductionStagesTable = sqliteTable("metal_production_stages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  metalOrderId: text("metal_order_id").notNull().references(() => metalWorkOrdersTable.id),
  moNumber: text("mo_number").notNull(),
  stageName: text("stage_name").notNull(),
  stageOrder: integer("stage_order").notNull(),
  qtyTarget: text("qty_target").notNull(),
  qtyDone: text("qty_done").notNull().default("0"),
  status: text("status").notNull().default("لم يتم البدء"), // 'لم يتم البدء' | 'تحت التصنيع' | 'تم الانتهاء'
  notes: text("notes"),
  deletedAt: text("deleted_at"),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => ({
  unq: uniqueIndex("metal_order_stage_unq").on(table.metalOrderId, table.stageName),
}));

export type MetalProductionStage = typeof metalProductionStagesTable.$inferSelect;
export type NewMetalProductionStage = typeof metalProductionStagesTable.$inferInsert;
