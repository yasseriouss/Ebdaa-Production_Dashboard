import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { metalWorkOrdersTable } from "./metalWorkOrders";

export const metalProductionStagesTable = pgTable("metal_production_stages", {
  id: serial("id").primaryKey(),
  metalOrderId: integer("metal_order_id").references(() => metalWorkOrdersTable.id, { onDelete: "cascade" }),
  moNumber: text("mo_number").notNull(),
  stageName: text("stage_name").notNull(),
  stageOrder: integer("stage_order").notNull(),
  qtyTarget: numeric("qty_target", { precision: 10, scale: 2 }).default("0"),
  qtyDone: numeric("qty_done", { precision: 10, scale: 2 }).default("0"),
  status: text("status").default("لم يتم البدء"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMetalProductionStageSchema = createInsertSchema(metalProductionStagesTable).omit({
  id: true,
  updatedAt: true,
});
export type InsertMetalProductionStage = z.infer<typeof insertMetalProductionStageSchema>;
export type MetalProductionStage = typeof metalProductionStagesTable.$inferSelect;
