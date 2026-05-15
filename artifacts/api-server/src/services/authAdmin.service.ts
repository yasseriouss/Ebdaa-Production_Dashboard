import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import {
  db,
  authRolesTable,
  authPermissionsTable,
  authRolePermissionsTable,
  authUsersTable,
  authUserRolesTable,
  PERMISSION_CATALOG,
  ALL_PERMISSION_KEYS,
  permissionKeyToStableId,
} from "@workspace/db";

const ALL_KEYS_SET = new Set(ALL_PERMISSION_KEYS);

export type RoleMatrixRow = {
  id: string;
  slug: string;
  labelAr: string | null;
  labelEn: string | null;
  permissionKeys: string[];
};

export type UserAccessRow = {
  id: string;
  email: string;
  isActive: boolean;
  employeeId: string | null;
  roles: { roleId: string; slug: string; labelAr: string | null }[];
  effectivePermissionKeys: string[];
};

export class AuthAdminService {
  static getCatalog() {
    return {
      catalog: PERMISSION_CATALOG,
      allKeys: ALL_PERMISSION_KEYS,
    };
  }

  static async getRoleMatrix(): Promise<RoleMatrixRow[]> {
    const roles = await db.select().from(authRolesTable);
    const links = await db.select().from(authRolePermissionsTable);
    const perms = await db.select().from(authPermissionsTable);
    const keyByPermId = new Map(perms.map((p) => [p.id, p.key]));

    const rows: RoleMatrixRow[] = [];
    for (const r of roles) {
      const keys = links
        .filter((l) => l.roleId === r.id)
        .map((l) => keyByPermId.get(l.permissionId))
        .filter((k): k is string => Boolean(k));
      rows.push({
        id: r.id,
        slug: r.slug,
        labelAr: r.labelAr,
        labelEn: r.labelEn,
        permissionKeys: keys.sort(),
      });
    }
    return rows.sort((a, b) => a.slug.localeCompare(b.slug));
  }

  static async replaceRolePermissions(roleSlug: string, permissionKeys: string[]): Promise<void> {
    const invalid = permissionKeys.filter((k) => !ALL_KEYS_SET.has(k));
    if (invalid.length > 0) {
      throw new Error(`Unknown permission keys: ${invalid.join(", ")}`);
    }

    const [role] = await db.select().from(authRolesTable).where(eq(authRolesTable.slug, roleSlug));
    if (!role) throw new Error(`Role not found: ${roleSlug}`);

    await db.transaction(async (tx) => {
      await tx.delete(authRolePermissionsTable).where(eq(authRolePermissionsTable.roleId, role.id));
      const ids = permissionKeys.map((k) => permissionKeyToStableId(k));
      if (ids.length === 0) return;
      await tx.insert(authRolePermissionsTable).values(
        ids.map((permissionId) => ({
          roleId: role.id,
          permissionId,
        })),
      );
    });
  }

  static async replacePermissionsMatrix(
    rolesPayload: Record<string, string[]>,
  ): Promise<void> {
    for (const [slug, keys] of Object.entries(rolesPayload)) {
      await AuthAdminService.replaceRolePermissions(slug, keys);
    }
  }

  static async listUsersWithAccess(): Promise<UserAccessRow[]> {
    const users = await db.select().from(authUsersTable);
    const userRoles = await db.select().from(authUserRolesTable);
    const roles = await db.select().from(authRolesTable);
    const matrix = await AuthAdminService.getRoleMatrix();
    const slugByRoleId = new Map(roles.map((r) => [r.id, r]));

    const permKeysByRoleSlug = new Map(matrix.map((m) => [m.slug, new Set(m.permissionKeys)]));

    const rows: UserAccessRow[] = [];
    for (const u of users) {
      const ur = userRoles.filter((x) => x.userId === u.id);
      const roleParts = ur.map((x) => {
        const role = slugByRoleId.get(x.roleId);
        return {
          roleId: x.roleId,
          slug: role?.slug ?? x.roleId,
          labelAr: role?.labelAr ?? null,
        };
      });
      const effective = new Set<string>();
      for (const rp of roleParts) {
        const set = permKeysByRoleSlug.get(rp.slug);
        if (set) {
          for (const k of set) effective.add(k);
        }
      }
      rows.push({
        id: u.id,
        email: u.email,
        isActive: u.isActive,
        employeeId: u.employeeId,
        roles: roleParts,
        effectivePermissionKeys: [...effective].sort(),
      });
    }
    return rows.sort((a, b) => a.email.localeCompare(b.email));
  }

  static async createUserPlaceholder(email: string): Promise<{ id: string; email: string }> {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) throw new Error("Invalid email");

    const [existing] = await db.select().from(authUsersTable).where(eq(authUsersTable.email, trimmed));
    if (existing) return { id: existing.id, email: existing.email };

    const id = `usr_${randomUUID().replace(/-/g, "").slice(0, 18)}`;
    await db.insert(authUsersTable).values({
      id,
      email: trimmed,
      passwordHash: null,
      employeeId: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const [row] = await db.select().from(authUsersTable).where(eq(authUsersTable.email, trimmed));
    if (!row) throw new Error("Failed to create user");
    return { id: row.id, email: row.email };
  }

  static async setUserRoles(userId: string, roleIds: string[]): Promise<void> {
    const uniq = [...new Set(roleIds)];
    if (uniq.length > 0) {
      const found = await db.select().from(authRolesTable).where(inArray(authRolesTable.id, uniq));
      if (found.length !== uniq.length) throw new Error("One or more role ids are invalid");
    }

    await db.transaction(async (tx) => {
      await tx.delete(authUserRolesTable).where(eq(authUserRolesTable.userId, userId));
      let i = 0;
      for (const roleId of uniq) {
        await tx.insert(authUserRolesTable).values({
          id: `ur_${userId}_${roleId}_${i++}`,
          userId,
          roleId,
          factoryId: null,
          departmentId: null,
        });
      }
    });
  }
}
