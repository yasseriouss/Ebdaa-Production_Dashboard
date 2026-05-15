import { eq } from "drizzle-orm";
import { db } from "./index";
import {
  authPermissionsTable,
  authRolesTable,
  authRolePermissionsTable,
  authUsersTable,
  authUserRolesTable,
} from "./schema/authAudit";
import {
  PERMISSION_CATALOG,
  ROLE_PRESETS,
  permissionKeyToStableId,
} from "./permissionCatalog";

const DEMO_USER_ID = "usr_demo_admin";
const DEMO_EMAIL = "demo@factory.local";

async function seedPermissions(): Promise<void> {
  console.log("Seeding permission catalog and roles…");

  await db.transaction(async (tx) => {
    for (const p of PERMISSION_CATALOG) {
      await tx
        .insert(authPermissionsTable)
        .values({
          id: permissionKeyToStableId(p.key),
          key: p.key,
          description: `${p.labelAr} — ${p.descriptionAr}`,
        })
        .onConflictDoNothing();
    }

    for (const r of ROLE_PRESETS) {
      await tx
        .insert(authRolesTable)
        .values({
          id: r.id,
          slug: r.slug,
          labelAr: r.labelAr,
          labelEn: r.labelEn,
        })
        .onConflictDoNothing();
    }

    for (const r of ROLE_PRESETS) {
      await tx.delete(authRolePermissionsTable).where(eq(authRolePermissionsTable.roleId, r.id));
      const permIds = r.permissionKeys.map((k) => permissionKeyToStableId(k));
      for (const pid of permIds) {
        await tx.insert(authRolePermissionsTable).values({
          roleId: r.id,
          permissionId: pid,
        });
      }
    }

    await tx
      .insert(authUsersTable)
      .values({
        id: DEMO_USER_ID,
        email: DEMO_EMAIL,
        passwordHash: null,
        employeeId: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoNothing();

    await tx.delete(authUserRolesTable).where(eq(authUserRolesTable.userId, DEMO_USER_ID));
    await tx.insert(authUserRolesTable).values({
      id: "ur_demo_super",
      userId: DEMO_USER_ID,
      roleId: "role_super_admin",
      factoryId: null,
      departmentId: null,
    });
  });

  console.log("Done. Demo user:", DEMO_EMAIL, "→ role super_admin");
}

void seedPermissions().catch((e) => {
  console.error(e);
  process.exit(1);
});
