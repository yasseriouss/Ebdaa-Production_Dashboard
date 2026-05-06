import { pgTable, serial, text, numeric, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { metalWorkOrdersTable } from "./metalWorkOrders";

export const metalStageLogTable = pgTable("metal_stage_log", {
  id: serial("id").primaryKey(),
  metalOrderId: integer("metal_order_id").references(() => metalWorkOrdersTable.id, { onDelete: "cascade" }),
  moNumber: text("mo_number").notNull(),
  logDate: text("log_date").notNull(),
  stageName: text("stage_name").notNull(),
  inputQty: numeric("input_qty", { precision: 10, scale: 2 }).default("0"),
  outputQty: numeric("output_qty", { precision: 10, scale: 2 }).default("0"),
  wasteQty: numeric("waste_qty", { precision: 10, scale: 2 }).default("0"),
  operator: text("operator").default(""),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (t) => [unique("uq_metal_stage_log_mo_date_stage").on(t.metalOrderId, t.logDate, t.stageName)]);

export const insertMetalStageLogSchema = createInsertSchema(metalStageLogTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMetalStageLog = z.infer<typeof insertMetalStageLogSchema>;
export type MetalStageLog = typeof metalStageLogTable.$inferSelect;
