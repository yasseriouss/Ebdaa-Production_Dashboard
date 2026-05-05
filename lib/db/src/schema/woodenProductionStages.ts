import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { woodenWorkOrdersTable } from "./woodenWorkOrders";

export const woodenProductionStagesTable = pgTable("wooden_production_stages", {
  id: serial("id").primaryKey(),
  woodenOrderId: integer("wooden_order_id").references(() => woodenWorkOrdersTable.id, { onDelete: "cascade" }),
  stageName: text("stage_name").notNull(),
  stageOrder: integer("stage_order").notNull(),
  qtyDone: numeric("qty_done", { precision: 10, scale: 2 }).default("0"),
  status: text("status").default("لم يتم البدء"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWoodenProductionStageSchema = createInsertSchema(woodenProductionStagesTable).omit({
  id: true,
  updatedAt: true,
});
export type InsertWoodenProductionStage = z.infer<typeof insertWoodenProductionStageSchema>;
export type WoodenProductionStage = typeof woodenProductionStagesTable.$inferSelect;
