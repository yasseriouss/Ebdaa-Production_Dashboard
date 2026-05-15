/**
 * Column dictionaries for legacy Excel templates under `Data/Ebdaa Machines And Production Planning`.
 * These are documentation-only contracts for future import/export — do not treat blank/template rows as facts.
 *
 * Known issue in source workbook `حصر_وتقييم_العمالة.xlsx`: performance sheet contains `#DIV/0!`;
 * normalize formulas before attempting automated ingest.
 */

export const ebdaaExcelSheets = {
  workflowPack: {
    file: "خطة_سير_العمل_والمستندات.xlsx",
    sheets: [
      {
        name: "Workflow stages",
        columnsAr: ["المرحلة", "القسم المسؤول", "الإجراءات المطلوبة", "المستندات", "الفني المسؤول", "الوقت المتوقع", "نقطة التفتيش", "الملاحظات"],
        appMapping: "Rendered structurally as ebdaaWorkflowRoutingRows + ebdaaDocumentRequirements + ebdaaQCCheckpoints in code.",
      },
      {
        name: "Document registry",
        columnsAr: ["المستند", "الغرض", "المسؤول عن الإصدار", "التوقيعات المطلوبة", "ملاحظات"],
      },
      {
        name: "QC checkpoints",
        columnsAr: ["المرحلة", "نقطة التفتيش", "المسؤول", "معايير القبول", "إجراءات الرفض", "الأهمية"],
      },
    ],
  },
  dailyProduction: {
    file: "نظام_متابعة_الإنتاج_اليومي.xlsx",
    sheets: [
      {
        name: "Sheet1 (progress)",
        columnsAr: [
          "التاريخ",
          "اسم المشروع",
          "رقم أمر الشغل",
          "القسم/الماكينة",
          "اسم الفني",
          "المرحلة",
          "الكمية المخططة",
          "الكمية المنتجة",
          "نسبة الإنجاز %",
          "حالة العمل",
          "المشاكل/الملاحظات",
          "إذن الترحيل",
        ],
        appMapping:
          "Aligns with DailySheetRow order/project/product plus handwritten extensions on exported travelers.",
      },
      {
        name: "Sheet2 (machine productivity)",
        columnsAr: [
          "التاريخ",
          "اسم الماكينة",
          "رقم الماكينة",
          "اسم الفني",
          "ساعات التشغيل",
          "ساعات التوقف",
          "سبب التوقف",
          "عدد القطع المنتجة",
          "عدد القطع المعيبة",
          "نسبة الجودة %",
          "معدل الإنتاجية",
          "الملاحظات",
        ],
        appMapping: "Future `/planning` machine KPI ingest; optional companion to ebdaa periodic fixtures.",
      },
    ],
  },
  periodic: {
    file: "المتابعة_الدورية_الشاملة.xlsx",
    sheets: [
      {
        name: "Weekly",
        columnsAr: [
          "الأسبوع",
          "من تاريخ",
          "إلى تاريخ",
          "إجمالي المشاريع",
          "المشاريع المكتملة",
          "المشاريع الجارية",
          "المشاريع المتأخرة",
          "نسبة الإنجاز %",
          "إجمالي القطع المنتجة",
          "القطع المعيبة",
          "نسبة الجودة %",
          "ساعات التشغيل",
        ],
      },
      {
        name: "Monthly",
        columnsAr: [
          "الشهر",
          "السنة",
          "إجمالي المشاريع",
          "المشاريع المكتملة",
          "المشاريع المتأخرة",
          "نسبة الإنجاز %",
          "إجمالي الإنتاج",
          "نسبة الجودة %",
          "الإيرادات المتوقعة",
          "التكاليف",
          "هامش الربح %",
          "معدل استغلال الطاقة %",
        ],
      },
    ],
  },
  technicians: {
    file: "نظام_تتبع_الفنيين_الشامل.xlsx",
    sheets: [
      {
        name: "Daily attendance",
        columnsAr: [
          "التاريخ",
          "اسم الفني",
          "القسم",
          "الماكينة المخصصة",
          "وقت الحضور",
          "وقت الانصراف",
          "ساعات العمل الفعلية",
          "المشروع المكلف به",
        ],
      },
      {
        name: "Weekly summary",
        columnsAr: [
          "اسم الفني",
          "القسم",
          "أيام الحضور",
          "أيام الغياب",
          "إجمالي ساعات العمل",
          "متوسط الإنتاجية اليومية",
          "إجمالي الإنتاج",
          "معدل الجودة %",
        ],
      },
    ],
  },
  laborEvaluation: {
    file: "حصر_وتقييم_العمالة.xlsx",
    warning: "Repair `#DIV/0!` cells before importing evaluation grids.",
    sheets: [
      { name: "Roster", columnsAr: ["القسم", "الاسم", "المسمى الوظيفي", "مستوى المهارة", "الماكينات"] },
      { name: "Staffing gaps", columnsAr: ["القسم/الماكينة", "عدد الماكينات", "الفجوة", "الأولوية"] },
    ],
  },
  roi: {
    file: "نظام_ROI_العائد_على_الاستثمار.xlsx",
    note: "Illustrative calculator — numbers are not synced from live finance.",
  },
} as const;
