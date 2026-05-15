import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { factoryCapacityFixture } from "../apps/web/src/data/fixtures/factoryCapacity.ts";
import { employeeAssignmentsFixture } from "../apps/web/src/data/fixtures/employeeAssignments.ts";
import { workforceAllocationFixture } from "../apps/web/src/data/fixtures/workforceAllocation.ts";
import { woodWorkOrdersFixture } from "../apps/web/src/data/fixtures/woodWorkOrders.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "..", "artifacts", "api-server", "src", "data", "referenceBundleSeed.json");

const refs = {
  factory_capacity: factoryCapacityFixture,
  employee_assignments: employeeAssignmentsFixture,
  workforce_allocation: workforceAllocationFixture,
  wood_orders_dataset_meta: {
    factory_id: woodWorkOrdersFixture.factory_id,
    factory_name: woodWorkOrdersFixture.factory_name,
    total_active_orders: woodWorkOrdersFixture.total_active_orders,
  },
};

writeFileSync(out, JSON.stringify(refs, null, 2));
console.log("Wrote", out);
