import { pgTable, serial, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const woodenWorkOrdersTable = pgTable("wooden_work_orders", {
  id: serial("id").primaryKey(),
  orderNo: text("order_no").notNull(),
  extension: text("extension"),
  orderDate: text("order_date"),
  manufactureRequest: text("manufacture_request"),
  sapCode: text("sap_code"),
  client: text("client"),
  subProject: text("sub_project"),
  product: text("product").notNull(),
  category: text("category"),
  uom: text("uom"),
  qty: numeric("qty", { precision: 10, scale: 2 }).notNull().default("0"),
  done: numeric("done", { precision: 10, scale: 2 }).default("0"),
  rem: numeric("rem", { precision: 10, scale: 2 }).default("0"),
  status: text("status"),
  prodDateStart: text("prod_date_start"),
  prodDateEnd: text("prod_date_end"),
  prodDateFinished: text("prod_date_finished"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWoodenWorkOrderSchema = createInsertSchema(woodenWorkOrdersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertWoodenWorkOrder = z.infer<typeof insertWoodenWorkOrderSchema>;
export type WoodenWorkOrder = typeof woodenWorkOrdersTable.$inferSelect;
