import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const sharedProjectsTable = sqliteTable("shared_projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  description: text("description"),
  client: text("client"),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertSharedProjectSchema = createInsertSchema(sharedProjectsTable);
export const selectSharedProjectSchema = createSelectSchema(sharedProjectsTable);

export type SharedProject = typeof sharedProjectsTable.$inferSelect;
export type NewSharedProject = typeof sharedProjectsTable.$inferInsert;
