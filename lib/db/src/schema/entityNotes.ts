import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

/** Polymorphic notes attached to employees, tasks, work orders, etc. */
export const entityNotesTable = sqliteTable("entity_notes", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  createdByUserId: text("created_by_user_id"),
  updatedByUserId: text("updated_by_user_id"),
});

export const insertEntityNoteSchema = createInsertSchema(entityNotesTable);
export const selectEntityNoteSchema = createSelectSchema(entityNotesTable);

export type EntityNoteRow = typeof entityNotesTable.$inferSelect;
export type NewEntityNoteRow = typeof entityNotesTable.$inferInsert;
