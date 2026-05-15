import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const factoriesTable = sqliteTable("factories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const departmentsTable = sqliteTable("departments", {
  id: text("id").primaryKey(),
  factoryId: text("factory_id").notNull().references(() => factoriesTable.id),
  name: text("name").notNull(),
  processStep: integer("process_step").notNull(),
});

export const tasksTable = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  departmentId: text("department_id").notNull().references(() => departmentsTable.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'machine' | 'manual'
  unitOfMeasure: text("unit_of_measure").notNull(),
  cycleTimeSeconds: real("cycle_time_seconds").notNull(),
  setupTimeMinutes: real("setup_time_minutes").notNull(),
  batchSize: integer("batch_size").notNull(),
  efficiencyFactor: text("efficiency_factor").notNull(), // decimal as string
  maxCapacityPerHour: text("max_capacity_per_hour").notNull(), // decimal as string
  hourlyOperatingCost: text("hourly_operating_cost").notNull(), // decimal as string
  laborRequired: integer("labor_required").notNull(),
});

export type Factory = typeof factoriesTable.$inferSelect;
export type NewFactory = typeof factoriesTable.$inferInsert;
export type Department = typeof departmentsTable.$inferSelect;
export type NewDepartment = typeof departmentsTable.$inferInsert;
export type Task = typeof tasksTable.$inferSelect;
export type NewTask = typeof tasksTable.$inferInsert;
