import type { WorkOrderRaw } from "@/lib/wood-orders-schema";
import { sortStageKeys } from "@/lib/stage-config";

export type WoDerivedStatus = "Pending" | "In Progress" | "Done";
export type StageUiStatus = "not_started" | "in_progress" | "completed";
export type PriorityLevel = "high" | "normal";

export type StagePatch = {
  qty_passed?: number;
  stageStatus?: StageUiStatus;
};

export type WorkOrderPatches = Record<string, Record<string, StagePatch>>;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function deriveStageStatus(
  qtyPassed: number,
  totalRequired: number
): StageUiStatus {
  if (totalRequired <= 0) return "completed";
  if (qtyPassed >= totalRequired) return "completed";
  if (qtyPassed <= 0) return "not_started";
  return "in_progress";
}

export function getEffectiveQtyRequired(
  stage: { qty_required?: number },
  orderTotal: number
): number {
  if (typeof stage.qty_required === "number") return stage.qty_required;
  return orderTotal;
}

export function getBottleneckStage(
  _wo: WorkOrderRaw,
  mergedRouting: Record<string, { qty_passed: number; qty_required: number }>
): string | null {
  const keys = sortStageKeys(Object.keys(mergedRouting));
  for (const key of keys) {
    const row = mergedRouting[key];
    if (!row) continue;
    if (row.qty_required <= 0) continue;
    if (row.qty_passed < row.qty_required) return key;
  }
  return null;
}

export function deriveWoStatus(
  wo: WorkOrderRaw,
  mergedRouting: Record<string, { qty_passed: number }>
): WoDerivedStatus {
  const { total_required, remaining, completed } = wo.quantities;
  if (remaining === 0 || completed >= total_required) return "Done";

  const keys = Object.keys(mergedRouting);
  const allZero = keys.every((k) => (mergedRouting[k]?.qty_passed ?? 0) <= 0);
  if (allZero) return "Pending";
  return "In Progress";
}

export function derivePriority(
  delivery: Date | null,
  status: WoDerivedStatus
): PriorityLevel {
  if (status === "Done") return "normal";
  if (!delivery) return "normal";
  const today = startOfDay(new Date());
  const due = startOfDay(delivery);
  const msPerDay = 86400000;
  const days = Math.ceil((due.getTime() - today.getTime()) / msPerDay);
  if (days < 0) return "high";
  if (days <= 3) return "high";
  return "normal";
}

export function isDeliveryDelayed(
  delivery: Date | null,
  status: WoDerivedStatus
): boolean {
  if (status === "Done") return false;
  if (!delivery) return false;
  return startOfDay(delivery) < startOfDay(new Date());
}

export function mergeRouting(
  wo: WorkOrderRaw,
  patches: WorkOrderPatches
): Record<
  string,
  { qty_passed: number; qty_required: number; department: string }
> {
  const out: Record<
    string,
    { qty_passed: number; qty_required: number; department: string }
  > = {};
  const woPatches = patches[wo.work_order_id] ?? {};
  for (const [key, stage] of Object.entries(wo.routing_progress)) {
    const qtyRequired = getEffectiveQtyRequired(stage, wo.quantities.total_required);
    if (typeof stage.qty_required === "number" && stage.qty_required === 0) {
      continue;
    }
    const patch = woPatches[key] ?? {};
    const qtyPassed =
      typeof patch.qty_passed === "number"
        ? patch.qty_passed
        : stage.qty_passed;
    out[key] = {
      department: stage.department,
      qty_passed: qtyPassed,
      qty_required: qtyRequired,
    };
  }
  return out;
}

export function visibleStageKeys(wo: WorkOrderRaw): string[] {
  const keys: string[] = [];
  for (const [key, stage] of Object.entries(wo.routing_progress)) {
    const eff = getEffectiveQtyRequired(stage, wo.quantities.total_required);
    if (typeof stage.qty_required === "number" && stage.qty_required === 0) {
      continue;
    }
    if (eff <= 0) continue;
    keys.push(key);
  }
  return sortStageKeys(keys);
}

export function floorProgressRatio(
  wo: WorkOrderRaw,
  merged: Record<string, { qty_passed: number; qty_required: number }>
): number {
  const total = wo.quantities.total_required;
  if (total <= 0) return 0;
  const maxPassed = Math.max(
    wo.quantities.completed,
    ...Object.values(merged).map((r) => r.qty_passed)
  );
  return Math.min(1, Math.max(0, maxPassed / total));
}

export function getStageUiStatus(
  wo: WorkOrderRaw,
  stageKey: string,
  merged: Record<string, { qty_passed: number; qty_required: number }>,
  patches: WorkOrderPatches
): StageUiStatus {
  const p = patches[wo.work_order_id]?.[stageKey]?.stageStatus;
  if (p) return p;
  const row = merged[stageKey];
  if (!row) return "not_started";
  return deriveStageStatus(row.qty_passed, row.qty_required);
}
