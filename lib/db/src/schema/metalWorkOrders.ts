import { pgTable, serial, text, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const metalWorkOrdersTable = pgTable("metal_work_orders", {
  id: serial("id").primaryKey(),
  moNumber: text("mo_number").notNull(),
  project: text("project"),
  client: text("client"),
  product: text("product").notNull(),
  qty: numeric("qty", { precision: 10, scale: 2 }).notNull().default("0"),
  unit: text("unit"),
  deliveredQty: numeric("delivered_qty", { precision: 10, scale: 2 }).default("0"),
  completionPct: numeric("completion_pct", { precision: 5, scale: 2 }).default("0"),
  backlogQty: numeric("backlog_qty", { precision: 10, scale: 2 }).default("0"),
  backlogStatus: text("backlog_status"),
  notes: text("notes"),
  status: text("status").default("لم يتم البدء"),
  factory: text("factory").default("metal"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMetalWorkOrderSchema = createInsertSchema(metalWorkOrdersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertMetalWorkOrder = z.infer<typeof insertMetalWorkOrderSchema>;
export type MetalWorkOrder = typeof metalWorkOrdersTable.$inferSelect;
