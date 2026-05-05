import { db } from "./index";
import {
  metalWorkOrdersTable,
  metalProductionStagesTable,
  woodenWorkOrdersTable,
  woodenProductionStagesTable,
} from "./schema";

const METAL_STAGES = [
  { name: "الليزر", order: 1 }, { name: "المقص", order: 2 }, { name: "الكويل", order: 3 },
  { name: "البانش", order: 4 }, { name: "مكابس و تكويع", order: 5 }, { name: "المثقاب", order: 6 },
  { name: "التخليع", order: 7 }, { name: "التنايات", order: 8 }, { name: "لحام CO2", order: 9 },
  { name: "تجليخ", order: 10 }, { name: "لحام بنطة", order: 11 }, { name: "لحام نحاس", order: 12 },
  { name: "لحام أرجون استالنس", order: 13 }, { name: "تشطيب استالنس", order: 14 },
  { name: "الدهان", order: 15 }, { name: "التجميع", order: 16 }, { name: "التسليم", order: 17 },
];
const WOODEN_STAGES = [
  { name: "القطع", order: 1 }, { name: "التجميع", order: 2 },
  { name: "التشطيب", order: 3 }, { name: "التغليف", order: 4 },
];

const metalOrdersData = [
  { moNumber: "MO-2025-001", project: "مشروع الكيان العسكري", client: "الكيان العسكري", product: "خزائن معدنية", qty: "500", unit: "قطعة", deliveredQty: "320", completionPct: "64", backlogQty: "180", backlogStatus: "متأخر", notes: "تسليم مرحلي", status: "تحت التصنيع" },
  { moNumber: "MO-2025-002", project: "مشروع جزيرة مزارين", client: "جزيرة مزارين", product: "أبواب حديدية", qty: "200", unit: "باب", deliveredQty: "200", completionPct: "100", backlogQty: "0", backlogStatus: null, notes: "", status: "تم التسليم" },
  { moNumber: "MO-2025-003", project: "مشروع فاينست", client: "فاينست", product: "رفوف معدنية", qty: "300", unit: "قطعة", deliveredQty: "150", completionPct: "50", backlogQty: "150", backlogStatus: "تحت المراجعة", notes: "تأخر في الخامات", status: "تحت التصنيع" },
  { moNumber: "MO-2025-004", project: "مشروع الحرس الجمهوري", client: "الحرس الجمهوري", product: "طاولات اجتماعات معدنية", qty: "50", unit: "طاولة", deliveredQty: "0", completionPct: "0", backlogQty: "50", backlogStatus: "لم يبدأ", notes: "انتظار موافقة", status: "لم يتم البدء" },
  { moNumber: "MO-2025-005", project: "مشروع الكيان العسكري - مرحلة 2", client: "الكيان العسكري", product: "خزائن تبريد", qty: "120", unit: "قطعة", deliveredQty: "80", completionPct: "67", backlogQty: "40", backlogStatus: "في المخزن", notes: "", status: "في المخزن" },
  { moNumber: "MO-2025-006", project: "مشروع داخلي", client: "إبداع للأثاث", product: "هياكل معدنية", qty: "80", unit: "قطعة", deliveredQty: "80", completionPct: "100", backlogQty: "0", backlogStatus: null, notes: "مكتمل", status: "تم الانتهاء" },
  { moNumber: "MO-2025-007", project: "مشروع فاينست - إضافة", client: "فاينست", product: "أقفاص معدنية", qty: "60", unit: "قطعة", deliveredQty: "0", completionPct: "30", backlogQty: "60", backlogStatus: "تحت التصنيع", notes: "", status: "تحت التصنيع" },
  { moNumber: "MO-2025-008", project: "مشروع جزيرة مزارين 2", client: "جزيرة مزارين", product: "بوابات أمنية", qty: "15", unit: "بوابة", deliveredQty: "0", completionPct: "0", backlogQty: "15", backlogStatus: "متوقف", notes: "مواد خام متأخرة", status: "متوقف" },
  { moNumber: "MO-2025-009", project: "مشروع الحرس الجمهوري - مبنى ب", client: "الحرس الجمهوري", product: "أبراج مراقبة معدنية", qty: "8", unit: "برج", deliveredQty: "4", completionPct: "50", backlogQty: "4", backlogStatus: "تحت التصنيع", notes: "", status: "تحت التصنيع" },
  { moNumber: "MO-2025-010", project: "توريد دوري", client: "عملاء متنوعون", product: "قواطع معدنية", qty: "1000", unit: "قطعة", deliveredQty: "600", completionPct: "60", backlogQty: "400", backlogStatus: "جاري", notes: "توريد دوري", status: "تحت التصنيع" },
  { moNumber: "MO-2025-011", project: "مشروع الكيان العسكري - مرحلة 3", client: "الكيان العسكري", product: "أدراج معدنية", qty: "250", unit: "قطعة", deliveredQty: "0", completionPct: "15", backlogQty: "250", backlogStatus: "جاري", notes: "", status: "تحت التصنيع" },
  { moNumber: "MO-2025-012", project: "مشروع فاينست - لوبي", client: "فاينست", product: "ديكور معدني", qty: "45", unit: "قطعة", deliveredQty: "45", completionPct: "100", backlogQty: "0", backlogStatus: null, notes: "", status: "تم التسليم" },
];

const woodenOrdersData = [
  { orderNo: "WO-2025-001", extension: "B1", orderDate: "2025-01-15", manufactureRequest: "MR-001", sapCode: "SAP-001", client: "الكيان العسكري", subProject: "مبنى إدارة", product: "مكاتب خشبية", category: "مكاتب", uom: "قطعة", qty: "50", done: "35", rem: "15", status: "Production", prodDateStart: "2025-01-20", prodDateEnd: "2025-03-20", prodDateFinished: "" },
  { orderNo: "WO-2025-002", extension: "A2", orderDate: "2025-01-20", manufactureRequest: "MR-002", sapCode: "SAP-002", client: "جزيرة مزارين", subProject: "فيلات سكنية", product: "غرف نوم", category: "غرف", uom: "طقم", qty: "30", done: "30", rem: "0", status: "Delivered", prodDateStart: "2025-01-25", prodDateEnd: "2025-04-01", prodDateFinished: "2025-03-28" },
  { orderNo: "WO-2025-003", extension: "C1", orderDate: "2025-02-01", manufactureRequest: "MR-003", sapCode: "SAP-003", client: "فاينست", subProject: "مقر الشركة", product: "أثاث مكتبي", category: "مكاتب", uom: "قطعة", qty: "100", done: "60", rem: "40", status: "Production", prodDateStart: "2025-02-10", prodDateEnd: "2025-05-10", prodDateFinished: "" },
  { orderNo: "WO-2025-004", extension: "D3", orderDate: "2025-02-15", manufactureRequest: "MR-004", sapCode: "SAP-004", client: "الحرس الجمهوري", subProject: "قاعة اجتماعات", product: "طاولات مؤتمرات", category: "طاولات", uom: "طاولة", qty: "20", done: "20", rem: "0", status: "Delivered", prodDateStart: "2025-02-20", prodDateEnd: "2025-04-20", prodDateFinished: "2025-04-15" },
  { orderNo: "WO-2025-005", extension: "A1", orderDate: "2025-03-01", manufactureRequest: "MR-005", sapCode: "SAP-005", client: "الكيان العسكري", subProject: "مبنى ضباط", product: "خزائن ملابس", category: "خزائن", uom: "قطعة", qty: "80", done: "40", rem: "40", status: "Production", prodDateStart: "2025-03-10", prodDateEnd: "2025-06-10", prodDateFinished: "" },
  { orderNo: "WO-2025-006", extension: "B2", orderDate: "2025-03-15", manufactureRequest: "MR-006", sapCode: "SAP-006", client: "فاينست", subProject: "استقبال", product: "ديكورات خشبية", category: "ديكور", uom: "قطعة", qty: "40", done: "10", rem: "30", status: "Production", prodDateStart: "2025-03-20", prodDateEnd: "2025-06-20", prodDateFinished: "" },
  { orderNo: "WO-2025-007", extension: "E1", orderDate: "2025-04-01", manufactureRequest: "MR-007", sapCode: "SAP-007", client: "جزيرة مزارين", subProject: "أفنية", product: "كراسي خارجية", category: "كراسي", uom: "قطعة", qty: "200", done: "120", rem: "80", status: "Production", prodDateStart: "2025-04-10", prodDateEnd: "2025-07-10", prodDateFinished: "" },
  { orderNo: "WO-2025-008", extension: "F1", orderDate: "2025-04-15", manufactureRequest: "MR-008", sapCode: "SAP-008", client: "الحرس الجمهوري", subProject: "مبنى رئاسي", product: "أثاث VIP", category: "فاخر", uom: "طقم", qty: "10", done: "5", rem: "5", status: "Production", prodDateStart: "2025-04-20", prodDateEnd: "2025-07-20", prodDateFinished: "" },
  { orderNo: "WO-2025-009", extension: "C2", orderDate: "2025-05-01", manufactureRequest: "MR-009", sapCode: "SAP-009", client: "الكيان العسكري", subProject: "غرف ضيافة", product: "أسرة مفردة", category: "أسرة", uom: "قطعة", qty: "60", done: "20", rem: "40", status: "Production", prodDateStart: "2025-05-10", prodDateEnd: "2025-08-10", prodDateFinished: "" },
  { orderNo: "WO-2025-010", extension: "G1", orderDate: "2025-05-15", manufactureRequest: "MR-010", sapCode: "SAP-010", client: "جزيرة مزارين", subProject: "نادي", product: "طاولات بلياردو", category: "ترفيه", uom: "قطعة", qty: "8", done: "8", rem: "0", status: "Delivered", prodDateStart: "2025-05-20", prodDateEnd: "2025-07-15", prodDateFinished: "2025-07-10" },
];

async function seed() {
  console.log("Checking existing data...");
  const existing = await db.select().from(metalWorkOrdersTable);
  if (existing.length > 0) {
    console.log(`Already seeded (${existing.length} metal orders). Skipping.`);
    process.exit(0);
  }

  console.log("Seeding metal work orders...");
  for (const orderData of metalOrdersData) {
    const [order] = await db.insert(metalWorkOrdersTable).values(orderData).returning();
    const stageCompletion = parseFloat(orderData.completionPct) / 100;
    const stagesToInsert = METAL_STAGES.map((s, i) => {
      const stageProgress = Math.max(0, Math.min(1, stageCompletion * METAL_STAGES.length - i));
      const qtyTarget = parseFloat(orderData.qty);
      const qtyDone = Math.round(qtyTarget * Math.min(1, stageProgress));
      const status = stageProgress >= 1 ? "تم الانتهاء" : stageProgress > 0 ? "تحت التصنيع" : "لم يتم البدء";
      return { metalOrderId: order.id, moNumber: order.moNumber, stageName: s.name, stageOrder: s.order, qtyTarget: orderData.qty, qtyDone: String(qtyDone), status };
    });
    await db.insert(metalProductionStagesTable).values(stagesToInsert);
  }

  console.log("Seeding wooden work orders...");
  for (const orderData of woodenOrdersData) {
    const [order] = await db.insert(woodenWorkOrdersTable).values(orderData).returning();
    const done = parseFloat(orderData.done);
    const qty = parseFloat(orderData.qty);
    const pct = qty > 0 ? done / qty : 0;
    const stagesToInsert = WOODEN_STAGES.map((s, i) => {
      const stageProgress = Math.max(0, Math.min(1, pct * WOODEN_STAGES.length - i));
      const qtyDone = Math.round(qty * Math.min(1, stageProgress));
      const status = stageProgress >= 1 ? "تم الانتهاء" : stageProgress > 0 ? "تحت التصنيع" : "لم يتم البدء";
      return { woodenOrderId: order.id, stageName: s.name, stageOrder: s.order, qtyDone: String(qtyDone), status };
    });
    await db.insert(woodenProductionStagesTable).values(stagesToInsert);
  }

  console.log(`Done! ${metalOrdersData.length} metal orders, ${woodenOrdersData.length} wooden orders seeded.`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
