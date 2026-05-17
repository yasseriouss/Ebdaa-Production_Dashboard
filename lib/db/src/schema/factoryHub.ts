import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { factoriesTable, departmentsTable } from "./factoryCapacity";

/** Grand Line web panel shape: full `WoodWorkOrder` JSON per row. */
export const fhWoodWorkOrdersTable = sqliteTable("fh_wood_work_orders", {
  workOrderId: text("work_order_id").primaryKey(),
  payload: text("payload").notNull(),
  factoryId: text("factory_id").references(() => factoriesTable.id),
  departmentId: text("department_id").references(() => departmentsTable.id),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

/** Reference bundles (capacity, employees, etc.) keyed for the dashboard. */
export const fhReferenceSnapshotsTable = sqliteTable("fh_reference_snapshots", {
  key: text("key").primaryKey(),
  payload: text("payload").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const fhWorkOrderAnalysisSessionsTable = sqliteTable(
  "fh_work_order_analysis_sessions",
  {
    id: text("id").primaryKey(),
    payload: text("payload").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
);

/** Single-row draft for New Project wizard (singleton key = `default`). */
export const fhNewProjectAutosaveTable = sqliteTable("fh_new_project_autosave", {
  singletonKey: text("singleton_key").primaryKey(),
  payload: text("payload").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const insertFhWoodWorkOrderSchema = createInsertSchema(fhWoodWorkOrdersTable);
export const selectFhWoodWorkOrderSchema = createSelectSchema(fhWoodWorkOrdersTable);

export type FhWoodWorkOrderRow = typeof fhWoodWorkOrdersTable.$inferSelect;
