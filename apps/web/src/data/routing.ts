import type { DepartmentId, WoodDepartmentId, WoodRoutingProgress, WoodRoutingStageKey } from "./types";
import { findDepartment } from "./fixtures/factoryCapacity";

/**
 * Ordered list of wood-factory routing stage keys. Mirrors the sequence
 * encoded by `process_step` in the capacity schema plus the synthetic
 * `packaging` stage carried by work orders.
 */
export const WOOD_STAGE_ORDER: WoodRoutingStageKey[] = [
  "solid_wood",
  "panel_saw",
  "edge_banding",
  "cnc_routing",
  "upholstery",
  "painting",
  "assembly",
  "packaging",
];

interface StageLabel {
  english: string;
  arabic: string;
  department: WoodDepartmentId;
}

export const WOOD_STAGE_LABELS: Record<WoodRoutingStageKey, StageLabel> = {
  solid_wood: { english: "Solid Wood", arabic: "الخشب الطبيعي", department: "DEPT_SOLID_WOOD" },
  panel_saw: { english: "Panel Saw", arabic: "المقاطع", department: "DEPT_PANEL_PROC" },
  edge_banding: { english: "Edge Banding", arabic: "لصق الشريط", department: "DEPT_PANEL_PROC" },
  cnc_routing: { english: "CNC Routing", arabic: "تشغيل CNC", department: "DEPT_PANEL_PROC" },
  upholstery: { english: "Upholstery", arabic: "التنجيد", department: "DEPT_UPHOLSTERY" },
  painting: { english: "Painting", arabic: "الدهانات", department: "DEPT_WOOD_PAINT" },
  assembly: { english: "Assembly", arabic: "التجميع", department: "DEPT_WOOD_ASSY" },
  packaging: { english: "Packaging", arabic: "التغليف", department: "DEPT_PACKAGING" },
};

/** Dropdown-ready list of department options for filters. */
export const WOOD_DEPARTMENT_OPTIONS: Array<{
  id: WoodDepartmentId;
  english: string;
  arabic: string;
}> = [
  { id: "DEPT_SOLID_WOOD", english: "Solid Wood", arabic: "الخشب الطبيعي" },
  { id: "DEPT_PANEL_PROC", english: "Panel & CNC", arabic: "المسطحات و CNC" },
  { id: "DEPT_VENEER", english: "Veneer & Press", arabic: "القشرة والمكابس" },
  { id: "DEPT_JOINERY", english: "Joinery", arabic: "الحلايا" },
  { id: "DEPT_SANDING", english: "Sanding", arabic: "الصنفرة" },
  { id: "DEPT_UPHOLSTERY", english: "Upholstery", arabic: "التنجيد" },
  { id: "DEPT_WOOD_PAINT", english: "Paint Booth", arabic: "الدهانات" },
  { id: "DEPT_WOOD_ASSY", english: "Assembly", arabic: "التجميع" },
  { id: "DEPT_PACKAGING", english: "Packaging", arabic: "التغليف" },
  { id: "DEPT_MAINTENANCE", english: "Maintenance", arabic: "الصيانة" },
];

export function woodDepartmentLabel(id: WoodDepartmentId, locale: "ar" | "en"): string {
  const row = WOOD_DEPARTMENT_OPTIONS.find((x) => x.id === id);
  if (!row) return id;
  return locale === "ar" ? row.arabic : row.english;
}

export function departmentReportsToLabel(parentId: DepartmentId, locale: "ar" | "en"): string {
  const wood = WOOD_DEPARTMENT_OPTIONS.find((o) => o.id === parentId);
  if (wood) return woodDepartmentLabel(wood.id, locale);
  return findDepartment(parentId)?.name ?? parentId;
}

/** تقدير تقدّم أمر الخشب للواجهة: متوسط كميات المراحل (أي تعديل يحدّث شريط التقدّم والجدول). */
export function woodOrderUiCompletedFromRouting(routing: WoodRoutingProgress, total: number): number {
  if (total <= 0) return 0;
  const sum = WOOD_STAGE_ORDER.reduce((a, k) => a + routing[k].qty_passed, 0);
  const avg = sum / WOOD_STAGE_ORDER.length;
  return Math.max(0, Math.min(total, Math.round(avg)));
}
