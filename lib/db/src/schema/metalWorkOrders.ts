import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const metalWorkOrdersTable = sqliteTable("metal_work_orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  moNumber: text("mo_number").notNull().unique(),
  project: text("project").notNull(),
  client: text("client").notNull(),
  product: text("product").notNull(),
  qty: text("qty").notNull(),
  unit: text("unit").notNull().default("Unit"),
  status: text("status").notNull().default("تحت التصنيع"),
  completionPct: text("completion_pct").notNull().default("0"),
  deliveredQty: text("delivered_qty").notNull().default("0"),
  backlogQty: text("backlog_qty").notNull().default("0"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text("deleted_at"),
});

export const insertMetalWorkOrderSchema = createInsertSchema(metalWorkOrdersTable);
export const selectMetalWorkOrderSchema = createSelectSchema(metalWorkOrdersTable);

export type MetalWorkOrder = typeof metalWorkOrdersTable.$inferSelect;
export type NewMetalWorkOrder = typeof metalWorkOrdersTable.$inferInsert;
