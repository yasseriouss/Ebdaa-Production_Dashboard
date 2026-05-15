import { db } from "./index";
import { factoriesTable, departmentsTable, tasksTable, employeesTable } from "./schema";
import * as fs from "fs";
import * as path from "path";

function normalizeHireDate(d: string | null | undefined): string | null {
  if (!d) return null;
  const m = String(d).match(/^(\d{1,2})[\\\/](\d{1,2})[\\\/](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d;
  return d;
}

function fixEmployeeData(emp: any): any {
  const hireDate = normalizeHireDate(emp.hire_date);
  let role = emp.standardized_role;
  if (emp.employee_id === "EMP-0077" && role === "Edge Bander Operator") {
    role = "Assistant";
  }
  return { ...emp, hire_date: hireDate, standardized_role: role };
}

async function seed() {
  console.log("Starting full seed...");

  // 1. Seed Capacity
  const capacityPath = path.join(process.cwd(), "factory_capacity_schema.json");
  const capacityData = JSON.parse(fs.readFileSync(capacityPath, "utf-8"));

  const factories = [capacityData.metal_factory, capacityData.woodworking_factory];

  for (const factory of factories) {
    console.log(`Seeding factory: ${factory.name}`);
    await db.insert(factoriesTable).values({
      id: factory.factory_id,
      name: factory.name,
    }).onConflictDoUpdate({
      target: factoriesTable.id,
      set: { name: factory.name },
    });

    for (const dept of factory.departments) {
      await db.insert(departmentsTable).values({
        id: dept.id,
        factoryId: factory.factory_id,
        name: dept.name,
        processStep: dept.process_step,
      }).onConflictDoUpdate({
        target: departmentsTable.id,
        set: { name: dept.name, processStep: dept.process_step },
      });

      for (const task of dept.tasks) {
        await db.insert(tasksTable).values({
          id: task.id,
          departmentId: dept.id,
          name: task.name,
          type: task.type,
          unitOfMeasure: task.capacity_metrics.unit_of_measure,
          cycleTimeSeconds: task.capacity_metrics.cycle_time_seconds,
          setupTimeMinutes: task.capacity_metrics.setup_time_minutes,
          batchSize: task.capacity_metrics.batch_size,
          efficiencyFactor: task.capacity_metrics.efficiency_factor.toString(),
          maxCapacityPerHour: task.capacity_metrics.max_capacity_per_hour.toString(),
          hourlyOperatingCost: task.cost_center_info.hourly_operating_cost.toString(),
          laborRequired: task.cost_center_info.labor_required,
        }).onConflictDoUpdate({
          target: tasksTable.id,
          set: {
            name: task.name,
            type: task.type,
            unitOfMeasure: task.capacity_metrics.unit_of_measure,
            cycleTimeSeconds: task.capacity_metrics.cycle_time_seconds,
            setupTimeMinutes: task.capacity_metrics.setup_time_minutes,
            batchSize: task.capacity_metrics.batch_size,
            efficiencyFactor: task.capacity_metrics.efficiency_factor.toString(),
            maxCapacityPerHour: task.capacity_metrics.max_capacity_per_hour.toString(),
            hourlyOperatingCost: task.cost_center_info.hourly_operating_cost.toString(),
            laborRequired: task.cost_center_info.labor_required,
          },
        });
      }
    }
  }

  // 2. Seed Departments from Departments.json
  const deptsPath = path.join(process.cwd(), "employees", "Departments.json");
  const deptsData = JSON.parse(fs.readFileSync(deptsPath, "utf-8"));
  const factoryAlloc = deptsData.factory_workforce_allocation;

  console.log(`Seeding departments for factory: ${factoryAlloc.factory_id}`);
  for (const dept of factoryAlloc.departments_workforce) {
    await db.insert(departmentsTable).values({
      id: dept.department_id,
      factoryId: factoryAlloc.factory_id,
      name: dept.department_id.replace("DEPT_", "").replace("_", " "), // Default name
      processStep: 99, // Support/Other
    }).onConflictDoUpdate({
      target: departmentsTable.id,
      set: { factoryId: factoryAlloc.factory_id },
    });
  }

  // 3. Seed Employees & Assignments
  const assignmentsPath = path.join(process.cwd(), "employees", "employee_assignments.json");
  const assignmentsData = JSON.parse(fs.readFileSync(assignmentsPath, "utf-8"));

  const factoryId = assignmentsData.factory_id; // WF-001
  
  // Seed management
  for (const raw of assignmentsData.management_layer) {
    const emp = fixEmployeeData(raw);
    await db.insert(employeesTable).values({
      id: emp.employee_id,
      name: emp.name,
      jobTitle: emp.job_title,
      standardizedRole: emp.standardized_role,
      hireDate: emp.hire_date,
      factoryId: factoryId,
      departmentId: null,
    }).onConflictDoUpdate({
      target: employeesTable.id,
      set: {
        name: emp.name,
        jobTitle: emp.job_title,
        standardizedRole: emp.standardized_role,
        hireDate: emp.hire_date,
        factoryId: factoryId,
        departmentId: null,
      },
    });
  }

  // Seed departments employees (including UNASSIGNED)
  for (const [deptId, employees] of Object.entries(assignmentsData.departments)) {
    for (const raw of (employees as any[])) {
      const emp = fixEmployeeData(raw);
      await db.insert(employeesTable).values({
        id: emp.employee_id,
        name: emp.name,
        jobTitle: emp.job_title,
        standardizedRole: emp.standardized_role,
        hireDate: emp.hire_date,
        factoryId: factoryId,
        departmentId: deptId,
      }).onConflictDoUpdate({
        target: employeesTable.id,
        set: {
          name: emp.name,
          jobTitle: emp.job_title,
          standardizedRole: emp.standardized_role,
          hireDate: emp.hire_date,
          factoryId: factoryId,
          departmentId: deptId,
        },
      });
    }
  }

  console.log("Seed completed successfully.");
}

seed().catch(console.error);
