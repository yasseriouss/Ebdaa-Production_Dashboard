import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { metalWorkOrdersTable } from "./metalWorkOrders";

/**
 * Daily / per-shift production lines imported from the "متابعة" sheet (Excel template).
 * One row per (metal order, calendar date, stage name).
 */
export const metalStageLogTable = sqliteTable(
  "metal_stage_log",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    metalOrderId: text("metal_order_id")
      .notNull()
      .references(() => metalWorkOrdersTable.id),
    moNumber: text("mo_number").notNull(),
    logDate: text("log_date").notNull(),
    stageName: text("stage_name").notNull(),
    inputQty: text("input_qty").notNull().default("0"),
    outputQty: text("output_qty").notNull().default("0"),
    wasteQty: text("waste_qty").notNull().default("0"),
    operator: text("operator"),
    notes: text("notes"),
    createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    unq: uniqueIndex("metal_stage_log_order_date_stage_unq").on(
      table.metalOrderId,
      table.logDate,
      table.stageName,
    ),
  }),
);

export const insertMetalStageLogSchema = createInsertSchema(metalStageLogTable);
export const selectMetalStageLogSchema = createSelectSchema(metalStageLogTable);

export type MetalStageLog = typeof metalStageLogTable.$inferSelect;
export type NewMetalStageLog = typeof metalStageLogTable.$inferInsert;
