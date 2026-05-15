import type { DailySheetRow } from "../../lib/dailySheet";

/**
 * Bridges Ebdaa daily Excel (`نظام_متابعة_الإنتاج_اليومي.xlsx` sheet 1) with {@link DailySheetRow}.
 * Extra Excel columns (technician, stage, quantities, etc.) are floor-captured outside the current export.
 */
export type EbdaaDailyProgressExcelKeys =
  | "التاريخ"
  | "اسم المشروع"
  | "رقم أمر الشغل"
  | "القسم/الماكينة"
  | "اسم الفني"
  | "المرحلة"
  | "الكمية المخططة"
  | "الكمية المنتجة"
  | "نسبة الإنجاز %"
  | "حالة العمل"
  | "المشاكل/الملاحظات"
  | "إذن الترحيل";

export const ebdaaDailySheetFieldMap: Record<
  keyof Pick<DailySheetRow, "order_id" | "project" | "product">,
  EbdaaDailyProgressExcelKeys
> = {
  order_id: "رقم أمر الشغل",
  project: "اسم المشروع",
  /** Traveller `product` is SKU/description; closest Ebdaa column is department/machine line. */
  product: "القسم/الماكينة",
};

export const ebdaaDailySheetMappingNotes: string[] = [
  "DailySheetRow.product describes SKU/description on travelers; Arabic sheet separates المرحلة (stage) — split columns when importing.",
  "target_qty ↔ الكمية المخططة; completed quantities remain paper-only until digital capture ships.",
];
