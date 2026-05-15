import type { WoodDepartmentId } from "../types";

export type EbdaaMachineSection =
  | "التقطيع"
  | "لصق الشريط"
  | "CNC تخريم"
  | "CNC راوتر"
  | "مكابس"
  | "تشكيل"
  | "صنفرة"
  | "هواء مضغوط";

export interface EbdaaMachine {
  index: number;
  serial: string;
  model: string;
  nameAr: string;
  section: EbdaaMachineSection;
  /** Maps shop section to closest GL dashboard department for UI grouping. */
  departmentHint: WoodDepartmentId;
  critical: boolean;
}

/**
 * Master register — HOMAG/KAESER line per Tajawal consolidated report.
 */
export const ebdaaMachinesFixture: EbdaaMachine[] = [
  {
    index: 1,
    serial: "0-240-67-3138",
    model: "HOMAG SAWTEQ B-300",
    nameAr: "منشار تقطيع أوتوماتيك 1",
    section: "التقطيع",
    departmentHint: "DEPT_PANEL_PROC",
    critical: false,
  },
  {
    index: 2,
    serial: "0-240-67-3115",
    model: "HOMAG SAWTEQ B-300",
    nameAr: "منشار تقطيع أوتوماتيك 2",
    section: "التقطيع",
    departmentHint: "DEPT_PANEL_PROC",
    critical: false,
  },
  {
    index: 3,
    serial: "0-341-67-3116",
    model: "HOMAG SAWTEQ B-200",
    nameAr: "منشار تقطيع أوتوماتيك 3",
    section: "التقطيع",
    departmentHint: "DEPT_PANEL_PROC",
    critical: false,
  },
  {
    index: 4,
    serial: "0-200-67-3062",
    model: "HOMAG EDGETEQ S-500",
    nameAr: "ماكينة لصق شريط 1",
    section: "لصق الشريط",
    departmentHint: "DEPT_PANEL_PROC",
    critical: false,
  },
  {
    index: 5,
    serial: "0-200-67-3072",
    model: "HOMAG EDGETEQ S-500",
    nameAr: "ماكينة لصق شريط 2",
    section: "لصق الشريط",
    departmentHint: "DEPT_PANEL_PROC",
    critical: false,
  },
  {
    index: 6,
    serial: "0-200-67-3063",
    model: "HOMAG EDGETEQ S-500",
    nameAr: "ماكينة لصق شريط 3",
    section: "لصق الشريط",
    departmentHint: "DEPT_PANEL_PROC",
    critical: false,
  },
  {
    index: 7,
    serial: "0-250-67-3180",
    model: "HOMAG DRILLTEQ V-200",
    nameAr: "ماكينة التخريم 1",
    section: "CNC تخريم",
    departmentHint: "DEPT_PANEL_PROC",
    critical: true,
  },
  {
    index: 8,
    serial: "0-250-67-3156",
    model: "HOMAG DRILLTEQ V-200",
    nameAr: "ماكينة التخريم 2",
    section: "CNC تخريم",
    departmentHint: "DEPT_PANEL_PROC",
    critical: true,
  },
  {
    index: 9,
    serial: "0-250-67-3157",
    model: "HOMAG DRILLTEQ V-200",
    nameAr: "ماكينة التخريم 3",
    section: "CNC تخريم",
    departmentHint: "DEPT_PANEL_PROC",
    critical: true,
  },
  {
    index: 10,
    serial: "0-201-67-3073",
    model: "HOMAG CenTa E-300",
    nameAr: "راوتر CNC 1 (3 محاور)",
    section: "CNC راوتر",
    departmentHint: "DEPT_PANEL_PROC",
    critical: false,
  },
  {
    index: 11,
    serial: "0-201-67-3053",
    model: "HOMAG CenTa E-300",
    nameAr: "راوتر CNC 2 (3 محاور)",
    section: "CNC راوتر",
    departmentHint: "DEPT_PANEL_PROC",
    critical: false,
  },
  {
    index: 12,
    serial: "0-250-67-3159",
    model: "HOMAG CenTa P-110",
    nameAr: "راوتر 5 محاور",
    section: "CNC راوتر",
    departmentHint: "DEPT_PANEL_PROC",
    critical: true,
  },
  {
    index: 13,
    serial: "0-306-67-3014",
    model: "HOMAG CAB T-200",
    nameAr: "مكبس علب 1",
    section: "مكابس",
    departmentHint: "DEPT_JOINERY",
    critical: false,
  },
  {
    index: 14,
    serial: "0-306-67-3015",
    model: "HOMAG CAB T-200",
    nameAr: "مكبس علب 2",
    section: "مكابس",
    departmentHint: "DEPT_JOINERY",
    critical: false,
  },
  {
    index: 15,
    serial: "0-203-67-3066",
    model: "HOMAG TenON D-600",
    nameAr: "ماكينة دبل إند",
    section: "تشكيل",
    departmentHint: "DEPT_JOINERY",
    critical: false,
  },
  {
    index: 16,
    serial: "0-256-67-3092",
    model: "HOMAG Stand W-300",
    nameAr: "صنفرة دولاب 1",
    section: "صنفرة",
    departmentHint: "DEPT_SANDING",
    critical: false,
  },
  {
    index: 17,
    serial: "0-256-67-3093",
    model: "HOMAG Stand W-300",
    nameAr: "صنفرة دولاب 2",
    section: "صنفرة",
    departmentHint: "DEPT_SANDING",
    critical: false,
  },
  {
    index: 18,
    serial: "6006",
    model: "HOMAG QL4",
    nameAr: "صنفرة حلايا",
    section: "صنفرة",
    departmentHint: "DEPT_JOINERY",
    critical: false,
  },
  {
    index: 19,
    serial: "0-254-03-2406",
    model: "HOMAG Mould M-300",
    nameAr: "ماكينة الشمبران",
    section: "تشكيل",
    departmentHint: "DEPT_JOINERY",
    critical: false,
  },
  {
    index: 20,
    serial: "1534-7250181",
    model: "KAESER CSDX-165",
    nameAr: "كمبروسر 1",
    section: "هواء مضغوط",
    departmentHint: "DEPT_PANEL_PROC",
    critical: true,
  },
  {
    index: 21,
    serial: "1535-7250187",
    model: "KAESER CSDX-165",
    nameAr: "كمبروسر 2",
    section: "هواء مضغوط",
    departmentHint: "DEPT_PANEL_PROC",
    critical: true,
  },
];
