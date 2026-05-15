import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const woodenWorkOrdersTable = sqliteTable("wooden_work_orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderNo: text("order_no").notNull().unique(),
  extension: text("extension").notNull().default(""),
  client: text("client").notNull(),
  orderDate: text("order_date").notNull(),
  subProject: text("sub_project").notNull(),
  product: text("product").notNull(),
  qty: text("qty").notNull(),
  done: text("done").notNull().default("0"),
  rem: text("rem").notNull().default("0"),
  status: text("status").notNull().default("تحت التصنيع"),
  prodDateEnd: text("prod_date_end"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
  deletedAt: text("deleted_at"),
});

export const insertWoodenWorkOrderSchema = createInsertSchema(woodenWorkOrdersTable);
export const selectWoodenWorkOrderSchema = createSelectSchema(woodenWorkOrdersTable);

export type WoodenWorkOrder = typeof woodenWorkOrdersTable.$inferSelect;
export type NewWoodenWorkOrder = typeof woodenWorkOrdersTable.$inferInsert;
