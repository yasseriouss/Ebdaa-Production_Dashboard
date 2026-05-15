import { db } from "./index";
import { factoriesTable, departmentsTable, tasksTable } from "./schema/factoryCapacity";

async function checkData() {
  console.log("Checking seeded factory data...");
  const factories = await db.select().from(factoriesTable);
  console.log(`Factories found: ${factories.length}`);
  for (const f of factories) {
    console.log(`- Factory: ${f.name} (${f.id})`);
    const depts = await db.select().from(departmentsTable).where(({ factoryId }) => eq(factoryId, f.id));
    console.log(`  Departments: ${depts.length}`);
    for (const d of depts) {
      console.log(`    - Dept: ${d.name}`);
      const tasks = await db.select().from(tasksTable).where(({ departmentId }) => eq(departmentId, d.id));
      console.log(`      Tasks: ${tasks.length}`);
    }
  }
  process.exit(0);
}

// Helper since eq is not imported
import { eq } from "drizzle-orm";

checkData().catch(e => { console.error(e); process.exit(1); });
