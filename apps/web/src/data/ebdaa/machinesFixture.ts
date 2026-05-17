import type { FactoryId, WoodDepartmentId } from "../types";
import { factoryCapacityFixture, findDepartment } from "../fixtures/factoryCapacity";

/** Arabic factory label from capacity fixture (single wood plant in this register). */
const WF_FACTORY_NAME_AR = factoryCapacityFixture.woodworking_factory.name;

export function ebdaaMachineMainDepartmentAr(dept: WoodDepartmentId): string {
  return findDepartment(dept)?.name ?? dept;
}

export interface EbdaaMachine {
  index: number;
  serial: string;
  model: string;
  nameAr: string;
  /** Top facility (wood line in current fixture). */
  factoryId: FactoryId;
  /** Closest GL / capacity department for permissions & routing. */
  departmentHint: WoodDepartmentId;
  /** Workshop or production line under the main department (Arabic). */
  subDepartmentAr: string;
  /** Finer cell under the line (e.g. router vs boring under CNC). */
  workCellAr?: string;
  critical: boolean;
}

/** Single RTL breadcrumb for UI tooltips / compact export. */
export function ebdaaMachineHierarchyAr(m: EbdaaMachine): string {
  const factoryName =
    m.factoryId === "WF-001" ? WF_FACTORY_NAME_AR : factoryCapacityFixture.metal_factory.name;
  const main = ebdaaMachineMainDepartmentAr(m.departmentHint);
  const parts = [factoryName, main, m.subDepartmentAr];
  if (m.workCellAr) parts.push(m.workCellAr);
  return parts.join(" › ");
}

/**
 * Master register — HOMAG/KAESER line per Tajawal consolidated report.
 * Hierarchy: مصنع → قسم (سعة/GL) → قسم فرعي/خط → [خلية] → ماكينة.
 */
export const ebdaaMachinesFixture: EbdaaMachine[] = [
  {
    index: 1,
    serial: "0-240-67-3138",
    model: "HOMAG SAWTEQ B-300",
    nameAr: "منشار تقطيع أوتوماتيك 1",
    factoryId: "WF-001",
    departmentHint: "DEPT_PANEL_PROC",
    subDepartmentAr: "التقطيع والمقاطع",
    critical: false,
  },
  {
    index: 2,
    serial: "0-240-67-3115",
    model: "HOMAG SAWTEQ B-300",
    nameAr: "منشار تقطيع أوتوماتيك 2",
    factoryId: "WF-001",
    departmentHint: "DEPT_PANEL_PROC",
    subDepartmentAr: "التقطيع والمقاطع",
    critical: false,
  },
  {
    index: 3,
    serial: "0-341-67-3116",
    model: "HOMAG SAWTEQ B-200",
    nameAr: "منشار تقطيع أوتوماتيك 3",
    factoryId: "WF-001",
    departmentHint: "DEPT_PANEL_PROC",
    subDepartmentAr: "التقطيع والمقاطع",
    critical: false,
  },
  {
    index: 4,
    serial: "0-200-67-3062",
    model: "HOMAG EDGETEQ S-500",
    nameAr: "ماكينة لصق شريط 1",
    factoryId: "WF-001",
    departmentHint: "DEPT_PANEL_PROC",
    subDepartmentAr: "لصق الشريط",
    critical: false,
  },
  {
    index: 5,
    serial: "0-200-67-3072",
    model: "HOMAG EDGETEQ S-500",
    nameAr: "ماكينة لصق شريط 2",
    factoryId: "WF-001",
    departmentHint: "DEPT_PANEL_PROC",
    subDepartmentAr: "لصق الشريط",
    critical: false,
  },
  {
    index: 6,
    serial: "0-200-67-3063",
    model: "HOMAG EDGETEQ S-500",
    nameAr: "ماكينة لصق شريط 3",
    factoryId: "WF-001",
    departmentHint: "DEPT_PANEL_PROC",
    subDepartmentAr: "لصق الشريط",
    critical: false,
  },
  {
    index: 7,
    serial: "0-250-67-3180",
    model: "HOMAG DRILLTEQ V-200",
    nameAr: "ماكينة التخريم 1",
    factoryId: "WF-001",
    departmentHint: "DEPT_PANEL_PROC",
    subDepartmentAr: "CNC",
    workCellAr: "التخريم",
    critical: true,
  },
  {
    index: 8,
    serial: "0-250-67-3156",
    model: "HOMAG DRILLTEQ V-200",
    nameAr: "ماكينة التخريم 2",
    factoryId: "WF-001",
    departmentHint: "DEPT_PANEL_PROC",
    subDepartmentAr: "CNC",
    workCellAr: "التخريم",
    critical: true,
  },
  {
    index: 9,
    serial: "0-250-67-3157",
    model: "HOMAG DRILLTEQ V-200",
    nameAr: "ماكينة التخريم 3",
    factoryId: "WF-001",
    departmentHint: "DEPT_PANEL_PROC",
    subDepartmentAr: "CNC",
    workCellAr: "التخريم",
    critical: true,
  },
  {
    index: 10,
    serial: "0-201-67-3073",
    model: "HOMAG CenTa E-300",
    nameAr: "راوتر CNC 1 (3 محاور)",
    factoryId: "WF-001",
    departmentHint: "DEPT_PANEL_PROC",
    subDepartmentAr: "CNC",
    workCellAr: "الراوتر",
    critical: false,
  },
  {
    index: 11,
    serial: "0-201-67-3053",
    model: "HOMAG CenTa E-300",
    nameAr: "راوتر CNC 2 (3 محاور)",
    factoryId: "WF-001",
    departmentHint: "DEPT_PANEL_PROC",
    subDepartmentAr: "CNC",
    workCellAr: "الراوتر",
    critical: false,
  },
  {
    index: 12,
    serial: "0-250-67-3159",
    model: "HOMAG CenTa P-110",
    nameAr: "راوتر 5 محاور",
    factoryId: "WF-001",
    departmentHint: "DEPT_PANEL_PROC",
    subDepartmentAr: "CNC",
    workCellAr: "الراوتر",
    critical: true,
  },
  {
    index: 13,
    serial: "0-306-67-3014",
    model: "HOMAG CAB T-200",
    nameAr: "مكبس علب 1",
    factoryId: "WF-001",
    departmentHint: "DEPT_JOINERY",
    subDepartmentAr: "مكابس العلب",
    critical: false,
  },
  {
    index: 14,
    serial: "0-306-67-3015",
    model: "HOMAG CAB T-200",
    nameAr: "مكبس علب 2",
    factoryId: "WF-001",
    departmentHint: "DEPT_JOINERY",
    subDepartmentAr: "مكابس العلب",
    critical: false,
  },
  {
    index: 15,
    serial: "0-203-67-3066",
    model: "HOMAG TenON D-600",
    nameAr: "ماكينة دبل إند",
    factoryId: "WF-001",
    departmentHint: "DEPT_JOINERY",
    subDepartmentAr: "التشكيل والدبل إند",
    critical: false,
  },
  {
    index: 16,
    serial: "0-256-67-3092",
    model: "HOMAG Stand W-300",
    nameAr: "صنفرة دولاب 1",
    factoryId: "WF-001",
    departmentHint: "DEPT_SANDING",
    subDepartmentAr: "صنفرة المسطحات",
    critical: false,
  },
  {
    index: 17,
    serial: "0-256-67-3093",
    model: "HOMAG Stand W-300",
    nameAr: "صنفرة دولاب 2",
    factoryId: "WF-001",
    departmentHint: "DEPT_SANDING",
    subDepartmentAr: "صنفرة المسطحات",
    critical: false,
  },
  {
    index: 18,
    serial: "6006",
    model: "HOMAG QL4",
    nameAr: "صنفرة حلايا",
    factoryId: "WF-001",
    departmentHint: "DEPT_JOINERY",
    subDepartmentAr: "صنفرة الحلايا",
    critical: false,
  },
  {
    index: 19,
    serial: "0-254-03-2406",
    model: "HOMAG Mould M-300",
    nameAr: "ماكينة الشمبران",
    factoryId: "WF-001",
    departmentHint: "DEPT_JOINERY",
    subDepartmentAr: "تشكيل الشمبران والحلق",
    critical: false,
  },
  {
    index: 20,
    serial: "1534-7250181",
    model: "KAESER CSDX-165",
    nameAr: "كمبروسر 1",
    factoryId: "WF-001",
    departmentHint: "DEPT_MAINTENANCE",
    subDepartmentAr: "الهواء المضغوط",
    critical: true,
  },
  {
    index: 21,
    serial: "1535-7250187",
    model: "KAESER CSDX-165",
    nameAr: "كمبروسر 2",
    factoryId: "WF-001",
    departmentHint: "DEPT_MAINTENANCE",
    subDepartmentAr: "الهواء المضغوط",
    critical: true,
  },
];
