import { db } from "@workspace/db";
import { tasksTable, departmentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

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
  /** كل ماكينة (مهمة إنتاج) مع القسم الفعلي المخزّن في قاعدة البيانات — مصدره مخطط gem_Claude */
  static async listMachinesWithDepartments(): Promise<MachineDepartmentRow[]> {
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
      .innerJoin(departmentsTable, eq(tasksTable.departmentId, departmentsTable.id))
      .orderBy(departmentsTable.factoryId, departmentsTable.processStep, tasksTable.name);

    return rows;
  }
}
