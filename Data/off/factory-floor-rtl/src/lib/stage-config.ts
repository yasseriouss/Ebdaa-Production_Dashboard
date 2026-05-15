export const CANONICAL_STAGE_ORDER = [
  "solid_wood",
  "panel_saw",
  "edge_banding",
  "cnc_routing",
  "upholstery",
  "painting",
  "assembly",
  "packaging",
] as const;

export type StageKey = (typeof CANONICAL_STAGE_ORDER)[number];

export const STAGE_LABELS: Record<
  string,
  { ar: string; en: string; short: string }
> = {
  solid_wood: { ar: "الأخشاب الصلبة", en: "Solid Wood", short: "SW" },
  panel_saw: { ar: "منشار الألواح", en: "Panel Saw", short: "PS" },
  edge_banding: { ar: "تلبيس الحواف", en: "Edge Banding", short: "EB" },
  cnc_routing: { ar: "التوجيه CNC", en: "CNC", short: "CNC" },
  upholstery: { ar: "التنجيد", en: "Upholstery", short: "UP" },
  painting: { ar: "الدهان", en: "Painting", short: "PT" },
  assembly: { ar: "التجميع", en: "Assembly", short: "AS" },
  packaging: { ar: "التعبئة", en: "Packaging", short: "PK" },
};

/** Department filter: stage key → bottleneck match */
export const DEPARTMENT_FILTER_OPTIONS: {
  value: StageKey | "all";
  labelAr: string;
}[] = [
  { value: "all", labelAr: "كل الأقسام" },
  { value: "solid_wood", labelAr: "الأخشاب الصلبة" },
  { value: "panel_saw", labelAr: "منشار الألواح" },
  { value: "edge_banding", labelAr: "تلبيس الحواف" },
  { value: "cnc_routing", labelAr: "CNC" },
  { value: "upholstery", labelAr: "التنجيد" },
  { value: "painting", labelAr: "الدهان" },
  { value: "assembly", labelAr: "التجميع" },
  { value: "packaging", labelAr: "التعبئة" },
];

export function sortStageKeys(keys: string[]): string[] {
  const set = new Set(keys);
  const ordered: string[] = [];
  for (const k of CANONICAL_STAGE_ORDER) {
    if (set.has(k)) ordered.push(k);
  }
  for (const k of keys) {
    if (!ordered.includes(k)) ordered.push(k);
  }
  return ordered;
}
