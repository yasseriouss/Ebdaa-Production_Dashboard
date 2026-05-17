/**
 * حالات أمر الشغل الخشبي — قيم موحّدة في الجدول والفلاتر والتعديل السريع.
 * قاعدة البيانات تقبل أي نص؛ هذه القائمة للواجهة والاتساق.
 */
export const WOODEN_ORDER_STATUSES = [
  "تحت التصنيع",
  "به مشكله",
  "تحت التعديل",
  "فى انتظار خامات",
  "لم يتم البدء",
  "متوقف",
  "تم التسليم",
] as const;

export type WoodenOrderStatusLabel = (typeof WOODEN_ORDER_STATUSES)[number];

/** ألوان شارة الحالة (خلفية / نص / حدود) */
export const WOODEN_STATUS_BADGE_CLASS: Record<string, string> = {
  "تحت التصنيع": "bg-blue-500/15 text-blue-400 border-blue-500/35",
  "به مشكله": "bg-rose-500/15 text-rose-400 border-rose-500/35",
  "تحت التعديل": "bg-violet-500/15 text-violet-300 border-violet-500/35",
  "فى انتظار خامات": "bg-amber-500/15 text-amber-400 border-amber-500/35",
  "لم يتم البدء": "bg-slate-500/15 text-slate-400 border-slate-500/35",
  "متوقف": "bg-orange-500/15 text-orange-400 border-orange-500/35",
  "تم التسليم": "bg-emerald-500/15 text-emerald-400 border-emerald-500/35",
  Production: "bg-blue-500/15 text-blue-400 border-blue-500/35",
  Delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/35",
};

export function getWoodenStatusBadgeClass(status: string | null | undefined): string {
  if (!status) return "bg-muted/50 text-muted-foreground border-border";
  return WOODEN_STATUS_BADGE_CLASS[status] ?? "bg-muted/50 text-muted-foreground border-border";
}
