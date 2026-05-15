import type { WoodRoutingStageKey } from "../types";

/** Stages described in Ebdaa production-line playbook (Arabic labels preserved). */
export interface EbdaaWorkflowStageRow {
  stepOrder: number;
  stageNameAr: string;
  ownerAr: string;
  descriptionAr: string;
  /** Closest routing key when the stage touches WIP on the wood order; null for upstream office steps. */
  routingKey: WoodRoutingStageKey | null;
  notesAr?: string;
}

/**
 * Maps the textual workflow to GL wood routing keys. QC sits between CNC and assembly in the playbook;
 * there is no standalone QC key in `WOOD_STAGE_ORDER`, so it is represented as explicit checkpoints elsewhere.
 */
export const ebdaaWorkflowRoutingRows: EbdaaWorkflowStageRow[] = [
  {
    stepOrder: 1,
    stageNameAr: "استلام المشروع",
    ownerAr: "المبيعات",
    descriptionAr: "التعاقد مع العميل واستلام المتطلبات",
    routingKey: null,
  },
  {
    stepOrder: 2,
    stageNameAr: "متابعة المشروع",
    ownerAr: "إدارة المشروعات",
    descriptionAr: "متابعة التفاصيل والتنسيق بين الأقسام",
    routingKey: null,
  },
  {
    stepOrder: 3,
    stageNameAr: "الرسم والتصميم",
    ownerAr: "المكتب الفني",
    descriptionAr: "رسم المنتجات وإعداد ملفات DXF للتخريم",
    routingKey: null,
    notesAr: "مدخل التخطيط قبل التقطيع.",
  },
  {
    stepOrder: 4,
    stageNameAr: "التخطيط",
    ownerAr: "مكتب التخطيط",
    descriptionAr: "إعداد أمر الشغل وتحديد المتطلبات من الخامات",
    routingKey: null,
  },
  {
    stepOrder: 5,
    stageNameAr: "صرف الخامات",
    ownerAr: "قسم التقطيع",
    descriptionAr: "استلام الألواح من المخزن بإذن صرف موثق",
    routingKey: "panel_saw",
  },
  {
    stepOrder: 6,
    stageNameAr: "التقطيع",
    ownerAr: "قسم التقطيع",
    descriptionAr: "تقطيع الألواح حسب القياسات + إذن ترحيل",
    routingKey: "panel_saw",
  },
  {
    stepOrder: 7,
    stageNameAr: "لصق الشريط",
    ownerAr: "قسم الشريط",
    descriptionAr: "لصق شريط الحواف + مراجعة + إذن ترحيل",
    routingKey: "edge_banding",
  },
  {
    stepOrder: 8,
    stageNameAr: "التخريم والتشكيل",
    ownerAr: "قسم CNC",
    descriptionAr: "التخريم والجروف والتشكيل + مراجعة + إذن ترحيل",
    routingKey: "cnc_routing",
  },
  {
    stepOrder: 9,
    stageNameAr: "فحص الجودة",
    ownerAr: "مهندس الجودة",
    descriptionAr: "مراجعة شاملة لجميع المراحل والاعتماد",
    routingKey: null,
    notesAr: "لا يوجد مفتاح مستقل في التطبيق؛ يُنفَّذ كبوابة قبل التجميع.",
  },
  {
    stepOrder: 10,
    stageNameAr: "التجميع",
    ownerAr: "قسم التجميع",
    descriptionAr: "تجميع المنتج النهائي مع الإكسسوارات",
    routingKey: "assembly",
  },
  {
    stepOrder: 11,
    stageNameAr: "التغليف",
    ownerAr: "قسم التغليف",
    descriptionAr: "تغليف المنتج للحماية أثناء النقل",
    routingKey: "packaging",
  },
  {
    stepOrder: 12,
    stageNameAr: "التخزين / الشحن",
    ownerAr: "المخزن",
    descriptionAr: "إدخال المخزن أو الشحن للموقع",
    routingKey: "packaging",
    notesAr: "يُغلق مسار التسليم بعد التغليف في الواجهة الحالية.",
  },
];
