import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { woodenWorkOrdersTable } from "./woodenWorkOrders";

/**
 * Daily / per-shift production lines for the Woodworking factory.
 * One row per (wood order, calendar date, stage name).
 */
export const woodenStageLogTable = sqliteTable(
  "wooden_stage_log",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    woodenOrderId: text("wooden_order_id")
      .notNull()
      .references(() => woodenWorkOrdersTable.id),
    orderNo: text("order_no").notNull(),
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
    unq: uniqueIndex("wooden_stage_log_order_date_stage_unq").on(
      table.woodenOrderId,
      table.logDate,
      table.stageName,
    ),
  }),
);

export const insertWoodenStageLogSchema = createInsertSchema(woodenStageLogTable);
export const selectWoodenStageLogSchema = createSelectSchema(woodenStageLogTable);

export type WoodenStageLog = typeof woodenStageLogTable.$inferSelect;
export type NewWoodenStageLog = typeof woodenStageLogTable.$inferInsert;
