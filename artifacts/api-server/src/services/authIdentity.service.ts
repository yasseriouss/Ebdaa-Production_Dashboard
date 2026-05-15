import { eq, and, inArray } from "@workspace/db";
import {
  db,
  ALL_PERMISSION_KEYS,
  authRolesTable,
  authRolePermissionsTable,
  authPermissionsTable,
  authUsersTable,
  authUserRolesTable,
} from "@workspace/db";
import type { DataScope, RequestAuth } from "../lib/requestAuth";

async function effectiveKeysForUser(userId: string): Promise<string[]> {
  const userRoles = await db
    .select({
      roleId: authUserRolesTable.roleId,
      slug: authRolesTable.slug,
    })
    .from(authUserRolesTable)
    .innerJoin(authRolesTable, eq(authUserRolesTable.roleId, authRolesTable.id))
    .where(eq(authUserRolesTable.userId, userId));

  if (userRoles.some((r) => r.slug === "super_admin")) {
    return [...ALL_PERMISSION_KEYS];
  }

  const roleIds = [...new Set(userRoles.map((r) => r.roleId))];
  if (roleIds.length === 0) return [];

  const links = await db
    .select({ permissionId: authRolePermissionsTable.permissionId })
    .from(authRolePermissionsTable)
    .where(inArray(authRolePermissionsTable.roleId, roleIds));

  const permIds = [...new Set(links.map((l) => l.permissionId))];
  if (permIds.length === 0) return [];

  const rows = await db.select().from(authPermissionsTable).where(inArray(authPermissionsTable.id, permIds));
  return rows.map((r) => r.key).sort();
}

async function dataScopeForUser(userId: string): Promise<DataScope> {
  const userRoles = await db
    .select({
      slug: authRolesTable.slug,
      factoryId: authUserRolesTable.factoryId,
      departmentId: authUserRolesTable.departmentId,
    })
    .from(authUserRolesTable)
    .innerJoin(authRolesTable, eq(authUserRolesTable.roleId, authRolesTable.id))
    .where(eq(authUserRolesTable.userId, userId));

  for (const r of userRoles) {
    if (r.slug === "super_admin") return { mode: "full" };
  }

  for (const r of userRoles) {
    if (r.slug === "factory_admin" && r.factoryId == null && r.departmentId == null) {
      return { mode: "full" };
    }
  }

  const factoryIds = new Set<string>();
  const departmentIds = new Set<string>();
  for (const r of userRoles) {
    if (r.factoryId) factoryIds.add(r.factoryId);
    if (r.departmentId) departmentIds.add(r.departmentId);
  }

  if (factoryIds.size === 0 && departmentIds.size === 0) {
    return { mode: "full" };
  }

  return {
    mode: "scoped",
    factoryIds: [...factoryIds],
    departmentIds: [...departmentIds],
  };
}

export async function loadAuthenticatedUser(userId: string): Promise<RequestAuth | null> {
  const [user] = await db
    .select()
    .from(authUsersTable)
    .where(and(eq(authUsersTable.id, userId), eq(authUsersTable.isActive, true)));

  if (!user) return null;

  const permissionKeys = await effectiveKeysForUser(userId);
  const dataScope = await dataScopeForUser(userId);

  return {
    kind: "user",
    userId: user.id,
    email: user.email,
    employeeId: user.employeeId ?? null,
    permissionKeys,
    dataScope,
  };
}
