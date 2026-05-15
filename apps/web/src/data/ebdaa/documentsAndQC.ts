/**
 * Structured extracts aligned with `خطة_سير_العمل_والمستندات.xlsx` (documents + QC sheets).
 * Reference-only until synced from live workflow tooling.
 */

export interface EbdaaDocumentRequirement {
  documentAr: string;
  purposeAr: string;
  issuerAr: string;
  signaturesAr: string;
  notesAr?: string;
}

export interface EbdaaQCCheckpoint {
  stageAr: string;
  checkpointAr: string;
  ownerAr: string;
  acceptanceCriteriaAr: string;
  rejectionActionsAr: string;
  importanceAr: string;
}

export const ebdaaDocumentRequirements: EbdaaDocumentRequirement[] = [
  {
    documentAr: "أمر شغل",
    purposeAr: "تحديد المنتج المطلوب والمواصفات",
    issuerAr: "مكتب التخطيط",
    signaturesAr: "مهندس التخطيط + مدير الإنتاج",
    notesAr: "يتضمن تاريخ الاستلام والتسليم",
  },
  {
    documentAr: "إذن صرف خامات",
    purposeAr: "صرف الألواح الخشبية من المخزن",
    issuerAr: "فني التقطيع",
    signaturesAr: "مهندس الإنتاج + مدير المصنع",
    notesAr: "موثق ومراجع",
  },
  {
    documentAr: "إذن صرف شريط حواف",
    purposeAr: "صرف شريط الحواف بالألوان المطلوبة",
    issuerAr: "قسم الشريط",
    signaturesAr: "مهندس الإنتاج",
    notesAr: "تحديد اللون والكمية",
  },
  {
    documentAr: "إذن ترحيل",
    purposeAr: "ترحيل القطعة بعد كل مرحلة إنتاج",
    issuerAr: "مهندس الجودة",
    signaturesAr: "مهندس الجودة بعد المراجعة",
    notesAr: "ينشأ بعد كل مرحلة وفق دليل سير العمل",
  },
  {
    documentAr: "ملفات DXF",
    purposeAr: "تحديد أماكن التخريم والتشكيل",
    issuerAr: "المكتب الفني",
    signaturesAr: "مهندس التصميم",
    notesAr: "مدخل إلزامي قبل CNC",
  },
];

export const ebdaaQCCheckpoints: EbdaaQCCheckpoint[] = [
  {
    stageAr: "التقطيع",
    checkpointAr: "دقة القياسات",
    ownerAr: "مهندس الجودة",
    acceptanceCriteriaAr: "تطابق مع الرسومات ±2mm",
    rejectionActionsAr: "إعادة التقطيع",
    importanceAr: "حرجة",
  },
  {
    stageAr: "التقطيع",
    checkpointAr: "جودة الحواف",
    ownerAr: "فني التقطيع",
    acceptanceCriteriaAr: "حواف نظيفة بدون تشققات",
    rejectionActionsAr: "معالجة أو استبدال",
    importanceAr: "مهمة",
  },
  {
    stageAr: "لصق الشريط",
    checkpointAr: "التصاق الشريط",
    ownerAr: "مهندس الجودة",
    acceptanceCriteriaAr: "التصاق كامل بدون فقاعات",
    rejectionActionsAr: "إعادة اللصق",
    importanceAr: "حرجة",
  },
];
