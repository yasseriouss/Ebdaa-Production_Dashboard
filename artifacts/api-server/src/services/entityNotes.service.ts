import {
  db,
  entityNotesTable,
  employeesTable,
  tasksTable,
  departmentsTable,
  factoriesTable,
  fhWoodWorkOrdersTable,
  metalWorkOrdersTable,
  sharedProjectsTable,
  eq,
  and,
  desc,
  or,
} from "@workspace/db";
import type { RequestAuth } from "../lib/requestAuth";
import { assertScopedFactoryDepartment } from "../lib/dataScopeFilter";

export const ENTITY_NOTE_TYPES = [
  "employee",
  "task",
  "department",
  "factory",
  "shared_project",
  "wood_work_order",
  "metal_work_order",
] as const;
export type EntityNoteType = (typeof ENTITY_NOTE_TYPES)[number];

type ScopeResolved =
  | { factoryId: string | null; departmentId: string | null }
  | "unscoped"
  | "not_found";

function errStatus(message: string, status: number): Error {
  const e = new Error(message);
  (e as Error & { status: number }).status = status;
  return e;
}

export class EntityNotesService {
  static isValidEntityType(t: string): t is EntityNoteType {
    return (ENTITY_NOTE_TYPES as readonly string[]).includes(t);
  }

  static async resolveEntityScope(
    entityType: EntityNoteType,
    entityId: string,
  ): Promise<ScopeResolved> {
    switch (entityType) {
      case "employee": {
        const r = await db
          .select({
            factoryId: employeesTable.factoryId,
            departmentId: employeesTable.departmentId,
          })
          .from(employeesTable)
          .where(eq(employeesTable.id, entityId))
          .limit(1);
        const row = r[0];
        if (!row) return "not_found";
        return { factoryId: row.factoryId, departmentId: row.departmentId };
      }
      case "task": {
        const r = await db
          .select({
            departmentId: tasksTable.departmentId,
            factoryId: departmentsTable.factoryId,
          })
          .from(tasksTable)
          .innerJoin(departmentsTable, eq(tasksTable.departmentId, departmentsTable.id))
          .where(eq(tasksTable.id, entityId))
          .limit(1);
        const row = r[0];
        if (!row) return "not_found";
        return { factoryId: row.factoryId, departmentId: row.departmentId };
      }
      case "department": {
        const r = await db
          .select({
            id: departmentsTable.id,
            factoryId: departmentsTable.factoryId,
          })
          .from(departmentsTable)
          .where(eq(departmentsTable.id, entityId))
          .limit(1);
        const row = r[0];
        if (!row) return "not_found";
        return { factoryId: row.factoryId, departmentId: row.id };
      }
      case "factory": {
        const r = await db
          .select({ id: factoriesTable.id })
          .from(factoriesTable)
          .where(eq(factoriesTable.id, entityId))
          .limit(1);
        if (!r[0]) return "not_found";
        return { factoryId: entityId, departmentId: null };
      }
      case "shared_project": {
        const r = await db
          .select({ id: sharedProjectsTable.id })
          .from(sharedProjectsTable)
          .where(eq(sharedProjectsTable.id, entityId))
          .limit(1);
        if (!r[0]) return "not_found";
        return "unscoped";
      }
      case "wood_work_order": {
        const r = await db
          .select({
            factoryId: fhWoodWorkOrdersTable.factoryId,
            departmentId: fhWoodWorkOrdersTable.departmentId,
          })
          .from(fhWoodWorkOrdersTable)
          .where(eq(fhWoodWorkOrdersTable.workOrderId, entityId))
          .limit(1);
        const row = r[0];
        if (!row) return "not_found";
        return { factoryId: row.factoryId ?? null, departmentId: row.departmentId ?? null };
      }
      case "metal_work_order": {
        const r = await db
          .select({ id: metalWorkOrdersTable.id })
          .from(metalWorkOrdersTable)
          .where(
            or(eq(metalWorkOrdersTable.id, entityId), eq(metalWorkOrdersTable.moNumber, entityId)),
          )
          .limit(1);
        if (!r[0]) return "not_found";
        return "unscoped";
      }
      default:
        return "not_found";
    }
  }

  static async assertEntityAccessible(
    entityType: EntityNoteType,
    entityId: string,
    auth: RequestAuth,
  ): Promise<void> {
    const scope = await this.resolveEntityScope(entityType, entityId);
    if (scope === "not_found") throw errStatus("entity_not_found", 404);
    if (scope === "unscoped") return;
    assertScopedFactoryDepartment(auth, scope.factoryId, scope.departmentId);
  }

  static async listNotes(
    entityType: EntityNoteType,
    entityId: string,
    auth: RequestAuth,
  ) {
    await this.assertEntityAccessible(entityType, entityId, auth);
    return db
      .select()
      .from(entityNotesTable)
      .where(
        and(
          eq(entityNotesTable.entityType, entityType),
          eq(entityNotesTable.entityId, entityId),
        ),
      )
      .orderBy(desc(entityNotesTable.createdAt));
  }

  static async createNote(
    entityType: EntityNoteType,
    entityId: string,
    body: string,
    auth: RequestAuth,
  ) {
    await this.assertEntityAccessible(entityType, entityId, auth);
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const userId = auth.kind === "user" ? auth.userId : null;
    await db.insert(entityNotesTable).values({
      id,
      entityType,
      entityId,
      body: body.trim(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: userId,
      updatedByUserId: userId,
    });
    const row = await db
      .select()
      .from(entityNotesTable)
      .where(eq(entityNotesTable.id, id))
      .limit(1);
    return row[0] ?? null;
  }

  static async updateNote(noteId: string, body: string, auth: RequestAuth) {
    const existing = await db
      .select()
      .from(entityNotesTable)
      .where(eq(entityNotesTable.id, noteId))
      .limit(1);
    const note = existing[0];
    if (!note) throw errStatus("not_found", 404);
    await this.assertEntityAccessible(
      note.entityType as EntityNoteType,
      note.entityId,
      auth,
    );
    const now = new Date().toISOString();
    const userId = auth.kind === "user" ? auth.userId : null;
    await db
      .update(entityNotesTable)
      .set({
        body: body.trim(),
        updatedAt: now,
        updatedByUserId: userId,
      })
      .where(eq(entityNotesTable.id, noteId));
    const row = await db
      .select()
      .from(entityNotesTable)
      .where(eq(entityNotesTable.id, noteId))
      .limit(1);
    return row[0] ?? null;
  }

  static async deleteNote(noteId: string, auth: RequestAuth) {
    const existing = await db
      .select()
      .from(entityNotesTable)
      .where(eq(entityNotesTable.id, noteId))
      .limit(1);
    const note = existing[0];
    if (!note) throw errStatus("not_found", 404);
    await this.assertEntityAccessible(
      note.entityType as EntityNoteType,
      note.entityId,
      auth,
    );
    await db.delete(entityNotesTable).where(eq(entityNotesTable.id, noteId));
  }
}
