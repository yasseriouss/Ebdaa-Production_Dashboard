import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { employeesTable } from "./employees";
import { departmentsTable, factoriesTable } from "./factoryCapacity";

/** مستخدمو التطبيق (المصادقة لاحقاً؛ الجدول جاهز للبذور والربط مع الموظفين). */
export const authUsersTable = sqliteTable("auth_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  employeeId: text("employee_id").references(() => employeesTable.id),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const authRolesTable = sqliteTable("auth_roles", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  labelAr: text("label_ar"),
  labelEn: text("label_en"),
});

export const authPermissionsTable = sqliteTable("auth_permissions", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  description: text("description"),
});

export const authRolePermissionsTable = sqliteTable(
  "auth_role_permissions",
  {
    roleId: text("role_id")
      .notNull()
      .references(() => authRolesTable.id),
    permissionId: text("permission_id")
      .notNull()
      .references(() => authPermissionsTable.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
  }),
);

export const authUserRolesTable = sqliteTable("auth_user_roles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => authUsersTable.id),
  roleId: text("role_id")
    .notNull()
    .references(() => authRolesTable.id),
  factoryId: text("factory_id").references(() => factoriesTable.id),
  departmentId: text("department_id").references(() => departmentsTable.id),
});

/** سجل تدقيق HTTP (مرحلة أولى: طلبات التعديل فقط، دون فرض مصادقة). */
export const auditEventsTable = sqliteTable("audit_events", {
  id: text("id").primaryKey(),
  occurredAt: text("occurred_at").notNull(),
  actorUserId: text("actor_user_id").references(() => authUsersTable.id),
  /** عند غياب تسجيل الدخول: `guest`. */
  actorLabel: text("actor_label").notNull().default("guest"),
  actorEmployeeId: text("actor_employee_id"),
  departmentId: text("department_id"),
  action: text("action").notNull(),
  resourceType: text("resource_type"),
  resourceId: text("resource_id"),
  route: text("route").notNull(),
  method: text("method").notNull(),
  statusCode: integer("status_code"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  payloadSummary: text("payload_summary"),
});

export type AuthUser = typeof authUsersTable.$inferSelect;
export type AuditEvent = typeof auditEventsTable.$inferSelect;
export type NewAuditEvent = typeof auditEventsTable.$inferInsert;
