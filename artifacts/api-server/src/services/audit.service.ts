import { db, auditEventsTable } from "@workspace/db";
import { desc } from "@workspace/db";
import { randomUUID } from "node:crypto";
import { logger } from "../lib/logger";

export type RecordMutationAuditInput = {
  occurredAt: string;
  actorUserId: string | null;
  actorLabel: string;
  actorEmployeeId: string | null;
  departmentId: string | null;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  route: string;
  method: string;
  statusCode: number | null;
  ip: string | null;
  userAgent: string | null;
  payloadSummary: string | null;
};

export async function recordMutationAudit(input: RecordMutationAuditInput): Promise<void> {
  try {
    await db.insert(auditEventsTable).values({
      id: randomUUID(),
      occurredAt: input.occurredAt,
      actorUserId: input.actorUserId,
      actorLabel: input.actorLabel,
      actorEmployeeId: input.actorEmployeeId,
      departmentId: input.departmentId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      route: input.route,
      method: input.method,
      statusCode: input.statusCode,
      ip: input.ip,
      userAgent: input.userAgent,
      payloadSummary: input.payloadSummary,
    });
  } catch (err) {
    logger.error({ err }, "audit_events insert failed");
  }
}

export async function listRecentAuditEvents(limit: number): Promise<
  (typeof auditEventsTable.$inferSelect)[]
> {
  const rows = await db
    .select()
    .from(auditEventsTable)
    .orderBy(desc(auditEventsTable.occurredAt))
    .limit(Math.min(Math.max(limit, 1), 200));
  return rows;
}
