import {
  db,
  auditEventsTable,
  employeesTable,
  departmentsTable,
  woodenProductionStagesTable,
  woodenWorkOrdersTable,
  metalProductionStagesTable,
  metalWorkOrdersTable,
} from "@workspace/db";
import { sql, eq, and, gte, isNull } from "@workspace/db";
import type { RequestAuth } from "../lib/requestAuth";
import { employeesScopeWhere } from "../lib/dataScopeFilter";
import { CapacityService } from "./capacity.service";

export type DepartmentPerfRow = {
  departmentId: string;
  departmentName: string;
  factoryId: string;
  employeeCount: number;
  machineTaskCount: number;
};

export type PeoplePerfRow = {
  employeeId: string;
  name: string;
  departmentId: string | null;
  departmentName: string | null;
  auditActions30d: number;
};

export class PerformanceService {
  static async throughputTotals() {
    const [woodRow] = await db
      .select({ sum: sql<string>`coalesce(sum(cast(${woodenProductionStagesTable.qtyDone} as real)), 0)` })
      .from(woodenProductionStagesTable)
      .innerJoin(
        woodenWorkOrdersTable,
        eq(woodenProductionStagesTable.woodenOrderId, woodenWorkOrdersTable.id),
      )
      .where(and(isNull(woodenWorkOrdersTable.deletedAt), isNull(woodenProductionStagesTable.deletedAt)));

    const [metalRow] = await db
      .select({ sum: sql<string>`coalesce(sum(cast(${metalProductionStagesTable.qtyDone} as real)), 0)` })
      .from(metalProductionStagesTable)
      .innerJoin(
        metalWorkOrdersTable,
        eq(metalProductionStagesTable.metalOrderId, metalWorkOrdersTable.id),
      )
      .where(and(isNull(metalWorkOrdersTable.deletedAt), isNull(metalProductionStagesTable.deletedAt)));

    return {
      woodQtyDoneSum: woodRow?.sum ?? "0",
      metalQtyDoneSum: metalRow?.sum ?? "0",
    };
  }

  static async departmentsFromCapacity(auth: RequestAuth): Promise<DepartmentPerfRow[]> {
    const machines = await CapacityService.listMachinesWithDepartments(auth);
    const byDept = new Map<string, { name: string; factoryId: string; tasks: number }>();
    for (const m of machines) {
      const cur = byDept.get(m.departmentId) ?? {
        name: m.departmentName,
        factoryId: m.factoryId,
        tasks: 0,
      };
      cur.tasks += 1;
      byDept.set(m.departmentId, cur);
    }

    const scope = employeesScopeWhere(auth);
    const rows: DepartmentPerfRow[] = [];
    for (const [departmentId, meta] of byDept) {
      const deptFilter = eq(employeesTable.departmentId, departmentId);
      const whereEmp = scope ? and(deptFilter, scope) : deptFilter;
      const [ec] = await db
        .select({ c: sql<number>`count(*)` })
        .from(employeesTable)
        .where(whereEmp);
      rows.push({
        departmentId,
        departmentName: meta.name,
        factoryId: meta.factoryId,
        employeeCount: ec?.c ?? 0,
        machineTaskCount: meta.tasks,
      });
    }
    rows.sort((a, b) => a.departmentName.localeCompare(b.departmentName, "ar"));
    return rows;
  }

  static async peopleActivity(auth: RequestAuth, limit = 80): Promise<PeoplePerfRow[]> {
    const scope = employeesScopeWhere(auth);
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceIso = since.toISOString();

    const emps = await db
      .select({
        id: employeesTable.id,
        name: employeesTable.name,
        departmentId: employeesTable.departmentId,
        departmentName: departmentsTable.name,
      })
      .from(employeesTable)
      .leftJoin(departmentsTable, eq(employeesTable.departmentId, departmentsTable.id))
      .where(scope)
      .orderBy(employeesTable.name)
      .limit(500);

    const out: PeoplePerfRow[] = [];
    for (const e of emps.slice(0, limit)) {
      const [row] = await db
        .select({ c: sql<number>`count(*)` })
        .from(auditEventsTable)
        .where(
          and(
            gte(auditEventsTable.occurredAt, sinceIso),
            eq(auditEventsTable.actorEmployeeId, e.id),
          ),
        );
      out.push({
        employeeId: e.id,
        name: e.name,
        departmentId: e.departmentId,
        departmentName: e.departmentName,
        auditActions30d: row?.c ?? 0,
      });
    }
    out.sort((a, b) => b.auditActions30d - a.auditActions30d);
    return out;
  }
}
