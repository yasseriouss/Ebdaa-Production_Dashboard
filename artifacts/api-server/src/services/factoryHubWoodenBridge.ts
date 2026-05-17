import { db } from "@workspace/db";
import { woodenWorkOrdersTable } from "@workspace/db";
import { and, eq, isNull } from "@workspace/db";
import { WoodenService } from "./wooden.service";
import type { RequestAuth } from "../lib/requestAuth";

function isBridgeEnabled(): boolean {
  return process.env["FH_SYNC_WOODEN"] === "true" || process.env["FH_SYNC_WOODEN"] === "1";
}

function scopeFromHubPayload(payload: Record<string, unknown>): {
  factoryId: string | null;
  departmentId: string | null;
} {
  const factoryId =
    typeof payload["factory_id"] === "string" && payload["factory_id"] !== "" ? payload["factory_id"] : null;
  const departmentId =
    typeof payload["department_id"] === "string" && payload["department_id"] !== ""
      ? payload["department_id"]
      : null;
  return { factoryId, departmentId };
}

/**
 * Best-effort mirror of Grand Line `WoodWorkOrder` JSON into `wooden_work_orders`.
 * Governed by `FH_SYNC_WOODEN=true`. See `docs/legacy-adapter-factory-hub.md`.
 */
export async function maybeSyncHubWoodOrderToWooden(payload: Record<string, unknown>, auth: RequestAuth): Promise<void> {
  if (!isBridgeEnabled()) return;

  const workOrderId = typeof payload["work_order_id"] === "string" ? payload["work_order_id"] : "";
  if (!workOrderId) return;

  const quantities = payload["quantities"] as Record<string, unknown> | undefined;
  const dates = payload["dates"] as Record<string, unknown> | undefined;

  const qty = quantities?.["total_required"];
  const done = quantities?.["completed"] ?? "0";
  const rem = quantities?.["remaining"] ?? qty ?? "0";

  const { factoryId, departmentId } = scopeFromHubPayload(payload);

  const body: Record<string, unknown> = {
    orderNo: workOrderId,
    subProject: String(payload["project_name"] ?? ""),
    product: String(payload["product_name"] ?? ""),
    client: String(payload["client"] ?? ""),
    qty: qty !== undefined && qty !== null ? String(qty) : "0",
    done: done !== undefined && done !== null ? String(done) : "0",
    rem: rem !== undefined && rem !== null ? String(rem) : "0",
    orderDate: dates?.["receive_date"] != null ? String(dates["receive_date"]) : "",
    extension: "",
    factoryId,
    departmentId,
  };

  const rows = await db
    .select({ id: woodenWorkOrdersTable.id })
    .from(woodenWorkOrdersTable)
    .where(and(eq(woodenWorkOrdersTable.orderNo, workOrderId), isNull(woodenWorkOrdersTable.deletedAt)))
    .limit(1);

  const found = rows[0];
  if (found) {
    await WoodenService.updateOrder(found.id, body, auth);
  } else {
    await WoodenService.createOrder(body, auth);
  }
}
