import { db } from "@workspace/db";
import { employeesTable, departmentsTable, factoriesTable } from "@workspace/db";
import { eq, like, sql, and } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

function redactName(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0].charAt(0) + "***";
  return parts[0] + " " + parts.slice(1).map(p => p.charAt(0) + ".").join(" ");
}

interface ListFilters {
  departmentId?: string;
  role?: string;
  factoryId?: string;
  search?: string;
  redact?: boolean;
}

export class EmployeesService {
  static async listEmployees(filters: ListFilters) {
    const conditions = [];

    if (filters.departmentId) {
      conditions.push(eq(employeesTable.departmentId, filters.departmentId));
    }
    if (filters.role) {
      conditions.push(eq(employeesTable.standardizedRole, filters.role));
    }
    if (filters.factoryId) {
      conditions.push(eq(employeesTable.factoryId, filters.factoryId));
    }
    if (filters.search) {
      conditions.push(like(employeesTable.name, `%${filters.search}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select({
        id: employeesTable.id,
        name: employeesTable.name,
        jobTitle: employeesTable.jobTitle,
        standardizedRole: employeesTable.standardizedRole,
        hireDate: employeesTable.hireDate,
        departmentId: employeesTable.departmentId,
        factoryId: employeesTable.factoryId,
        departmentName: departmentsTable.name,
      })
      .from(employeesTable)
      .leftJoin(departmentsTable, eq(employeesTable.departmentId, departmentsTable.id))
      .where(where)
      .orderBy(employeesTable.departmentId, employeesTable.id);

    if (filters.redact) {
      return rows.map(r => ({ ...r, name: redactName(r.name) }));
    }
    return rows;
  }

  static async getRosterStats() {
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(employeesTable);
    const total = totalResult[0]?.count ?? 0;

    const byDepartment = await db
      .select({
        departmentId: employeesTable.departmentId,
        departmentName: departmentsTable.name,
        count: sql<number>`count(*)`,
      })
      .from(employeesTable)
      .leftJoin(departmentsTable, eq(employeesTable.departmentId, departmentsTable.id))
      .groupBy(employeesTable.departmentId)
      .orderBy(sql`count(*) desc`);

    const roles = await db
      .select({
        role: employeesTable.standardizedRole,
        count: sql<number>`count(*)`,
      })
      .from(employeesTable)
      .groupBy(employeesTable.standardizedRole)
      .orderBy(sql`count(*) desc`);

    const departments = byDepartment.map(d => ({
      departmentId: d.departmentId || "MANAGEMENT",
      departmentName: d.departmentName || "Management",
      count: d.count,
    }));

    return { total, departments, roles };
  }

  static async getHeadcount() {
    const deptsPath = path.join(process.cwd(), "employees", "Departments.json");
    let planned: Record<string, number> = {};

    try {
      const deptsData = JSON.parse(fs.readFileSync(deptsPath, "utf-8"));
      const alloc = deptsData.factory_workforce_allocation;

      let mgmtCount = 0;
      for (const r of alloc.management_engineering_layer || []) {
        mgmtCount += r.count || 0;
      }
      planned["MANAGEMENT"] = mgmtCount;

      for (const dept of alloc.departments_workforce || []) {
        let total = 0;
        for (const s of dept.staff || []) {
          total += s.count || 0;
        }
        planned[dept.department_id] = total;
      }
    } catch {
      // Departments.json not found — return actual-only
    }

    const actual = await db
      .select({
        departmentId: employeesTable.departmentId,
        count: sql<number>`count(*)`,
      })
      .from(employeesTable)
      .groupBy(employeesTable.departmentId);

    const actualMap: Record<string, number> = {};
    for (const row of actual) {
      const key = row.departmentId || "MANAGEMENT";
      actualMap[key] = row.count;
    }

    const allKeys = new Set([...Object.keys(planned), ...Object.keys(actualMap)]);
    const result = Array.from(allKeys).sort().map(key => ({
      departmentId: key,
      plannedCount: planned[key] || 0,
      actualCount: actualMap[key] || 0,
      delta: (actualMap[key] || 0) - (planned[key] || 0),
    }));

    return result;
  }

  static async exportCsv(filters: ListFilters): Promise<string> {
    const rows = await this.listEmployees(filters);
    const headers = ["id", "name", "jobTitle", "standardizedRole", "hireDate", "departmentId", "factoryId", "departmentName"];

    function csvEscape(v: unknown): string {
      if (v == null) return "";
      const s = String(v);
      if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    }

    const lines = [headers.join(",")];
    for (const row of rows) {
      lines.push(headers.map(h => csvEscape((row as any)[h])).join(","));
    }
    return lines.join("\r\n");
  }
}
