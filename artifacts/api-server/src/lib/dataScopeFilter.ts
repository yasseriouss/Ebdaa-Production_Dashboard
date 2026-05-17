import { and, inArray, or, sql } from "@workspace/db";
import type { SQL } from "@workspace/db";
import { departmentsTable, employeesTable } from "@workspace/db";
import type { RequestAuth } from "./requestAuth";

/**
 * تصفية صفوف الأقسام/المهام حسب نطاق المصنع والأقسام المسموح بها.
 */
export function departmentsScopeWhere(auth: RequestAuth): SQL | undefined {
  if (auth.kind === "anonymous") return undefined;
  if (auth.dataScope.mode === "full") return undefined;
  const { factoryIds, departmentIds } = auth.dataScope;
  if (factoryIds.length === 0 && departmentIds.length === 0) {
    return sql`1 = 0`;
  }
  const parts: SQL[] = [];
  if (factoryIds.length > 0) parts.push(inArray(departmentsTable.factoryId, factoryIds));
  if (departmentIds.length > 0) parts.push(inArray(departmentsTable.id, departmentIds));
  if (parts.length === 0) return sql`1 = 0`;
  return parts.length === 1 ? parts[0] : or(...parts)!;
}

export function employeesScopeWhere(auth: RequestAuth): SQL | undefined {
  if (auth.kind === "anonymous") return undefined;
  if (auth.dataScope.mode === "full") return undefined;
  const { factoryIds, departmentIds } = auth.dataScope;
  if (factoryIds.length === 0 && departmentIds.length === 0) {
    return sql`1 = 0`;
  }
  const parts: SQL[] = [];
  if (factoryIds.length > 0) parts.push(inArray(employeesTable.factoryId, factoryIds));
  if (departmentIds.length > 0) parts.push(inArray(employeesTable.departmentId, departmentIds));
  if (parts.length === 0) return sql`1 = 0`;
  return parts.length === 1 ? parts[0] : or(...parts)!;
}

export function combineWhere(base: SQL | undefined, scope: SQL | undefined): SQL | undefined {
  if (!scope) return base;
  if (!base) return scope;
  return and(base, scope);
}

/** صفوف تحمل factory_id / department_id مباشرة (أوامر إنتاج، صفوف hub). */
export function factoryDepartmentRowScopeWhere(
  auth: RequestAuth,
  // Drizzle: عمود من lib/db قد يختلف عن نسخة drizzle-orm في api-server عند typetest
  factoryCol: Parameters<typeof inArray>[0],
  departmentCol: Parameters<typeof inArray>[0],
): SQL | undefined {
  if (auth.kind === "anonymous") return undefined;
  if (auth.dataScope.mode === "full") return undefined;
  const { factoryIds, departmentIds } = auth.dataScope;
  if (factoryIds.length === 0 && departmentIds.length === 0) {
    return sql`1 = 0`;
  }
  const parts: SQL[] = [];
  if (factoryIds.length > 0) parts.push(inArray(factoryCol, factoryIds));
  if (departmentIds.length > 0) parts.push(inArray(departmentCol, departmentIds));
  if (parts.length === 0) return sql`1 = 0`;
  return parts.length === 1 ? parts[0]! : or(...parts)!;
}

/** رفض تعيين نطاق غير مسموح للمستخدم المقيّد؛ الضيف غير المقيّد يُتجاوَى. */
export function assertScopedFactoryDepartment(
  auth: RequestAuth,
  factoryId: string | null | undefined,
  departmentId: string | null | undefined,
): void {
  if (auth.kind !== "user") return;
  if (auth.dataScope.mode === "full") return;
  const f = factoryId ?? null;
  const d = departmentId ?? null;
  const { factoryIds, departmentIds } = auth.dataScope;
  const factoryOk = f !== null && factoryIds.includes(f);
  const deptOk = d !== null && departmentIds.includes(d);
  if (factoryOk || deptOk) return;
  const err = new Error("scope_forbidden");
  (err as Error & { status: number }).status = 403;
  throw err;
}

/** للمستخدم المقيّد: لا يُنشأ سجل بلا مصنع ولا قسم (تفادي أوامر «عامة» خارج السيطرة). */
export function assertScopedRowHasSomeAssignment(
  auth: RequestAuth,
  factoryId: string | null | undefined,
  departmentId: string | null | undefined,
): void {
  if (auth.kind !== "user") return;
  if (auth.dataScope.mode === "full") return;
  const f = factoryId ?? null;
  const d = departmentId ?? null;
  if (f !== null || d !== null) {
    assertScopedFactoryDepartment(auth, f, d);
    return;
  }
  const err = new Error("scope_factory_or_department_required");
  (err as Error & { status: number }).status = 403;
  throw err;
}
