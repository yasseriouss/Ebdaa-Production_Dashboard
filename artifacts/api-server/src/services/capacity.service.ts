import { db } from "@workspace/db";
import { tasksTable, departmentsTable } from "@workspace/db";
import { and, eq } from "@workspace/db";
import type { RequestAuth } from "../lib/requestAuth";
import { departmentsScopeWhere } from "../lib/dataScopeFilter";

export type MachineDepartmentRow = {
  taskId: string;
  taskName: string;
  taskType: string;
  departmentId: string;
  departmentName: string;
  processStep: number;
  factoryId: string;
};

export class CapacityService {
  /** كل ماكينة (مهمة إنتاج) مع القسم الفعلي — مع تصفية نطاق عند تمرير مستخدم JWT. */
  static async listMachinesWithDepartments(auth?: RequestAuth): Promise<MachineDepartmentRow[]> {
    const scope = auth ? departmentsScopeWhere(auth) : undefined;
    const joinOn = scope
      ? and(eq(tasksTable.departmentId, departmentsTable.id), scope)
      : eq(tasksTable.departmentId, departmentsTable.id);

    const rows = await db
      .select({
        taskId: tasksTable.id,
        taskName: tasksTable.name,
        taskType: tasksTable.type,
        departmentId: departmentsTable.id,
        departmentName: departmentsTable.name,
        processStep: departmentsTable.processStep,
        factoryId: departmentsTable.factoryId,
      })
      .from(tasksTable)
      .innerJoin(departmentsTable, joinOn)
      .orderBy(departmentsTable.factoryId, departmentsTable.processStep, tasksTable.name);

    return rows;
  }
}
