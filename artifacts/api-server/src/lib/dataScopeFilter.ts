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
