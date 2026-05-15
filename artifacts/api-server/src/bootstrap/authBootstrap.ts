/**
 * يضمن وجود مستخدم إداري أولي عند تعيين `BOOTSTRAP_ADMIN_PASSWORD` (≥8 أحرف).
 */
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, authUsersTable, authUserRolesTable } from "@workspace/db";
import { hashPassword } from "../lib/passwordCrypto";

const DEMO_ID = "usr_demo_admin";

export async function bootstrapAdminFromEnv(): Promise<void> {
  const rawPass = process.env["BOOTSTRAP_ADMIN_PASSWORD"];
  if (!rawPass || rawPass.length < 8) return;

  const isDefaultDemo =
    !process.env["BOOTSTRAP_ADMIN_EMAIL"]?.trim() ||
    process.env["BOOTSTRAP_ADMIN_EMAIL"].trim().toLowerCase() === "demo@factory.local";

  const email = (process.env["BOOTSTRAP_ADMIN_EMAIL"] ?? "demo@factory.local").trim().toLowerCase();
  const hash = await hashPassword(rawPass);
  const now = new Date().toISOString();

  const [existing] = await db.select().from(authUsersTable).where(eq(authUsersTable.email, email));

  const newUserId = isDefaultDemo ? DEMO_ID : `usr_${randomUUID().replace(/-/g, "").slice(0, 22)}`;

  if (!existing) {
    await db.insert(authUsersTable).values({
      id: newUserId,
      email,
      passwordHash: hash,
      employeeId: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    await db
      .update(authUsersTable)
      .set({ passwordHash: hash, updatedAt: now })
      .where(eq(authUsersTable.id, existing.id));
  }

  const targetId = existing?.id ?? newUserId;
  await db.delete(authUserRolesTable).where(eq(authUserRolesTable.userId, targetId));
  await db.insert(authUserRolesTable).values({
    id: `ur_${targetId}_bootstrap_super`,
    userId: targetId,
    roleId: "role_super_admin",
    factoryId: null,
    departmentId: null,
  });
}
