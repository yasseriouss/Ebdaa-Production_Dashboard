import { db } from "./index";
import { factoriesTable, departmentsTable, tasksTable } from "./schema/factoryCapacity";
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedCapacity() {
  console.log("Seeding factory capacity data...");
  const repoRoot = path.resolve(__dirname, "../../..");
  const gemPath = path.join(repoRoot, "Data", "gem_Claude", "factory_capacity_schema (2).json");
  const fallbackPath = path.join(repoRoot, "factory_capacity_schema.json");
  const schemaPath = fs.existsSync(gemPath) ? gemPath : fallbackPath;
  console.log(`  Capacity schema file: ${path.relative(repoRoot, schemaPath)}`);
  const schemaData = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));

  const factories = [schemaData.metal_factory, schemaData.woodworking_factory];

  for (const factory of factories) {
    console.log(`  Processing factory: ${factory.name} (${factory.factory_id})`);
    
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
          efficiencyFactor: String(task.capacity_metrics.efficiency_factor),
          maxCapacityPerHour: String(task.capacity_metrics.max_capacity_per_hour),
          hourlyOperatingCost: String(task.cost_center_info.hourly_operating_cost),
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
            efficiencyFactor: String(task.capacity_metrics.efficiency_factor),
            maxCapacityPerHour: String(task.capacity_metrics.max_capacity_per_hour),
            hourlyOperatingCost: String(task.cost_center_info.hourly_operating_cost),
            laborRequired: task.cost_center_info.labor_required,
          },
        });
      }
    }
  }
  console.log("Factory capacity data seeded successfully!");
}
