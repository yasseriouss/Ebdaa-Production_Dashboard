/**
 * Maps Grand Line eight-key `routing_progress` to four legacy `wooden_production_stages`
 * (القطع، التجميع، التشطيب، التغليف). See docs/legacy-adapter-factory-hub.md.
 */

export const HUB_ROUTING_KEYS = [
  "solid_wood",
  "panel_saw",
  "edge_banding",
  "cnc_routing",
  "upholstery",
  "painting",
  "assembly",
  "packaging",
] as const;

export type HubRoutingKey = (typeof HUB_ROUTING_KEYS)[number];

export const LEGACY_WOOD_STAGES = [
  { name: "القطع", order: 1 },
  { name: "التجميع", order: 2 },
  { name: "التشطيب", order: 3 },
  { name: "التغليف", order: 4 },
] as const;

export type LegacyWoodStageName = (typeof LEGACY_WOOD_STAGES)[number]["name"];

/** Hub routing keys aggregated into each legacy stage (bottleneck = min passed qty in group). */
export const HUB_KEYS_BY_LEGACY_STAGE: Record<LegacyWoodStageName, readonly HubRoutingKey[]> = {
  القطع: ["solid_wood", "panel_saw", "edge_banding", "cnc_routing"],
  التجميع: ["upholstery", "assembly"],
  التشطيب: ["painting"],
  التغليف: ["packaging"],
};

export interface HubRoutingStageSlice {
  qty_passed?: number;
}

export type HubRoutingProgressInput = Partial<Record<HubRoutingKey, HubRoutingStageSlice>>;

export interface LegacyStageSnapshot {
  stageName: LegacyWoodStageName;
  stageOrder: number;
  qtyDone: string;
  status: "لم يتم البدء" | "تحت التصنيع" | "تم الانتهاء";
}

function readPassed(routing: HubRoutingProgressInput, key: HubRoutingKey): number {
  const raw = routing[key]?.qty_passed;
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0) return 0;
  return raw;
}

/** Bottleneck qty for a legacy stage: minimum passed among mapped hub keys present in routing. */
export function legacyStageQtyFromHub(
  routing: HubRoutingProgressInput,
  legacyName: LegacyWoodStageName,
): number {
  const keys = HUB_KEYS_BY_LEGACY_STAGE[legacyName];
  const present = keys.filter((k) => routing[k] !== undefined);
  if (present.length === 0) return 0;
  return Math.min(...present.map((k) => readPassed(routing, k)));
}

export function legacyStageStatus(qtyDone: number, totalRequired: number): LegacyStageSnapshot["status"] {
  if (totalRequired <= 0) {
    return qtyDone > 0 ? "تحت التصنيع" : "لم يتم البدء";
  }
  if (qtyDone >= totalRequired) return "تم الانتهاء";
  if (qtyDone > 0) return "تحت التصنيع";
  return "لم يتم البدء";
}

export function hubRoutingToLegacyStages(
  routing: HubRoutingProgressInput,
  totalRequired: number,
): LegacyStageSnapshot[] {
  return LEGACY_WOOD_STAGES.map((s) => {
    const qty = legacyStageQtyFromHub(routing, s.name);
    return {
      stageName: s.name,
      stageOrder: s.order,
      qtyDone: String(qty),
      status: legacyStageStatus(qty, totalRequired),
    };
  });
}

/** Reverse: distribute legacy stage qty to each mapped hub key (same qty per key in group). */
export function legacyStagesToHubRouting(
  stages: Array<{ stageName: string; qtyDone?: string | number }>,
  totalRequired: number,
): Record<HubRoutingKey, { qty_passed: number; department: string }> {
  const byName = new Map(stages.map((s) => [s.stageName, parseFloat(String(s.qtyDone ?? "0")) || 0]));
  const out = {} as Record<HubRoutingKey, { qty_passed: number; department: string }>;
  for (const key of HUB_ROUTING_KEYS) {
    out[key] = { qty_passed: 0, department: "" };
  }
  for (const legacy of LEGACY_WOOD_STAGES) {
    const qty = byName.get(legacy.name) ?? 0;
    for (const key of HUB_KEYS_BY_LEGACY_STAGE[legacy.name]) {
      out[key] = { qty_passed: qty, department: out[key]?.department ?? "" };
    }
  }
  void totalRequired;
  return out;
}

export function parseHubRoutingFromPayload(payload: Record<string, unknown>): HubRoutingProgressInput {
  const raw = payload["routing_progress"];
  if (!raw || typeof raw !== "object") return {};
  return raw as HubRoutingProgressInput;
}

export function parseTotalRequiredFromPayload(payload: Record<string, unknown>): number {
  const quantities = payload["quantities"] as Record<string, unknown> | undefined;
  const total = quantities?.["total_required"];
  if (typeof total === "number" && Number.isFinite(total)) return Math.max(0, total);
  if (typeof total === "string") {
    const n = parseFloat(total);
    if (Number.isFinite(n)) return Math.max(0, n);
  }
  return 0;
}
