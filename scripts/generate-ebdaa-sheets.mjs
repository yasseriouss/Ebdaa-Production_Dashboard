/**
 * Ebdaa Sheets Template Generator
 * Generates .xlsx file with 5 sheets for Ebdaa Furniture Factory Management
 * Run: node scripts/generate-ebdaa-sheets.mjs
 */

import * as XLSX from "xlsx";
import { mkdir } from "fs/promises";

await mkdir(".local/outputs", { recursive: true });

const wb = XLSX.utils.book_new();

// ─── Helper: encode cell (0-based r,c) ────────────────────────────────────
const cell = (r, c) => XLSX.utils.encode_cell({ r, c });

// ─── 17 Metal Stage names (Arabic | English DB key) ───────────────────────
const METAL_STAGES = [
  { ar: "ليزر",              en: "laser" },
  { ar: "بانش",              en: "punch" },
  { ar: "تخليع",             en: "stripping" },
  { ar: "تجليخ",             en: "polishing" },
  { ar: "لحام أرجون",        en: "argon_weld" },
  { ar: "لحام بنطة",         en: "patch_weld" },
  { ar: "لحام نحاس",         en: "brass_weld" },
  { ar: "لحام CO₂",          en: "co2_weld" },
  { ar: "التنايات",          en: "bending" },
  { ar: "مكابس وتكويع",      en: "press_form" },
  { ar: "المثقاب",           en: "drill" },
  { ar: "المقص",             en: "shear" },
  { ar: "الكويل",            en: "coil" },
  { ar: "التجميع",           en: "assembly" },
  { ar: "تشطيب إستانلس",    en: "stainless_finish" },
  { ar: "الدهان",            en: "painting" },
  { ar: "التسليم",           en: "delivery" },
];

// Column indices in Metal sheet (0-based)
const M_MO   = 0;  // A — mo_number
const M_PROJ = 1;  // B — project
const M_CLI  = 2;  // C — client
const M_PROD = 3;  // D — product
const M_QTY  = 4;  // E — qty
const M_UNIT = 5;  // F — unit
// G..W (indices 6..22) — 17 stage columns
const M_STG0 = 6;
const M_STG_LAST = 22; // delivery (التسليم)
const M_COMP = 23; // X — completion_pct
const M_BACK = 24; // Y — backlog_qty
const M_BSTS = 25; // Z — backlog_status
const M_STAT = 26; // AA — status
const M_NOTE = 27; // AB — notes

// ══════════════════════════════════════════════════════════════════════════
//  1. METAL ORDERS — أوامر معدني
// ══════════════════════════════════════════════════════════════════════════
// Metal sheet columns: all DB fields from metalWorkOrdersTable + 17 stage columns + derived.
// Omitted auto fields: id, created_at, updated_at (server-generated on import).
// Derived (not in DB): completion_pct (computed from stages), backlog_qty.
const metalHeaderRow1 = [
  "رقم MOM", "المشروع", "العميل", "المنتج", "الكمية", "الوحدة",
  ...METAL_STAGES.map(s => s.ar),
  "نسبة الإنجاز %", "متأخرات", "حالة المتأخرات", "الحالة", "ملاحظات",
  "الكمية المسلّمة", "المصنع", "تاريخ التسليم المتوقع",
];
const metalHeaderRow2 = [
  "mo_number", "project", "client", "product", "qty", "unit",
  ...METAL_STAGES.map(s => s.en),
  "completion_pct(derived)", "backlog_qty(derived)", "backlog_status", "status", "notes",
  "delivered_qty", "factory", "expected_delivery_date(optional)",
];

// Sample rows — completion_pct (col X) and backlog_qty (col Y) set to null;
// formulas are injected below. delivered_qty mirrors التسليم stage value.
const metalSamples = [
  ["MOM-1001","الكيان العسكري","الكيان العسكري","كرسي معدني",50,"قطعة",
   50,48,48,47,46,46,46,46,46,46,46,45,45,44,44,44,40,
   null,null,"","تحت التصنيع","",40,"metal","2025-06-30"],
  ["MOM-1002","جزيرة مزارين","جزيرة مزارين","طاولة معدنية",30,"قطعة",
   30,30,30,29,28,28,28,28,28,27,27,27,27,26,26,25,20,
   null,null,"","تحت التصنيع","",20,"metal","2025-07-15"],
];

// Build sheet as AOA (header rows + samples + blanks)
const metalAOA = [metalHeaderRow1, metalHeaderRow2, ...metalSamples];
const wsM = XLSX.utils.aoa_to_sheet(metalAOA);

// Inject formulas for all data rows (r=2..101, 0-based xlsx indexing).
// sheetRow = r+1 gives 1-based row number for formula strings.
// Completion formula: =ROUND(SUM(stages)/qty, 1) — exactly as task spec Step 2.
// "SUM(stages)/qty" gives a value where max = 17 (all 17 stage cols equal qty).
// Backlog = qty - التسليم (delivery col W = last stage).
for (let r = 2; r <= 101; r++) {
  const sheetRow = r + 1;
  const qtyRef   = `E${sheetRow}`;
  const sumRange = `G${sheetRow}:W${sheetRow}`;
  const delRef   = `W${sheetRow}`;

  wsM[cell(r, M_COMP)] = {
    f: `IF(${qtyRef}="","",IF(${qtyRef}=0,"",ROUND(SUM(${sumRange})/${qtyRef},1)))`,
    t: "n",
  };
  wsM[cell(r, M_BACK)] = {
    f: `IF(${qtyRef}="","",IF(${qtyRef}=0,"",MAX(0,${qtyRef}-${delRef})))`,
    t: "n",
  };
}

// Status dropdown validation for Metal — col AA (1-based 27, 0-based 26)
wsM["!dataValidations"] = [{
  sqref: "AA3:AA1001",
  type: "list",
  formula1: '"لم يتم البدء,تحت التصنيع,في المخزن,تم الانتهاء,تم التسليم,متوقف"',
  showDropDown: false,
  allowBlank: true,
}];

wsM["!cols"] = [
  { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 7 }, { wch: 7 },
  ...Array(17).fill({ wch: 8 }),
  { wch: 13 }, { wch: 11 }, { wch: 16 }, { wch: 16 }, { wch: 22 },
  { wch: 14 }, { wch: 10 }, { wch: 20 },
];
// 31 columns: A(0)..AE(30)
wsM["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 101, c: 30 } });
XLSX.utils.book_append_sheet(wb, wsM, "أوامر معدني");

// ══════════════════════════════════════════════════════════════════════════
//  2. WOODEN ORDERS — أوامر خشبي
// ══════════════════════════════════════════════════════════════════════════
// Column indices in Wooden sheet (0-based)
const W_ORD  = 0;  // A — order_no
const W_EXT  = 1;  // B — extension (VBC-cleaned)
const W_DATE = 2;  // C — order_date
const W_MREQ = 3;  // D — manufacture_request
const W_SAP  = 4;  // E — sap_code
const W_CLI  = 5;  // F — client
const W_SUB  = 6;  // G — sub_project
const W_PROD = 7;  // H — product
const W_CAT  = 8;  // I — category
const W_UOM  = 9;  // J — uom
const W_QTY  = 10; // K — qty
const W_DONE = 11; // L — done
const W_REM  = 12; // M — rem  (auto-calculated)
const W_PCT  = 13; // N — completion_pct (auto-calculated)
const W_STAT = 14; // O — status
const W_PS   = 15; // P — prod_date_start
const W_PE   = 16; // Q — prod_date_end
const W_PF   = 17; // R — prod_date_finished

// Wooden sheet columns: all DB fields from woodenWorkOrdersTable.
// Omitted auto fields: id, created_at, updated_at (server-generated on import).
// Derived (not in DB): rem computed as qty-done; completion_pct computed as done/qty*100.
const woodenHdr1 = [
  "رقم الأمر","الامتداد (بعد تنظيف VBC)","تاريخ الأمر","طلب التصنيع","كود SAP",
  "العميل","المشروع الفرعي","المنتج","الفئة","وحدة القياس",
  "الكمية","المنجز","المتبقي","نسبة الإنجاز %","الحالة",
  "تاريخ بدء الإنتاج","تاريخ انتهاء الإنتاج","تاريخ الانتهاء الفعلي",
];
const woodenHdr2 = [
  "order_no","extension","order_date","manufacture_request","sap_code",
  "client","sub_project","product","category","uom",
  "qty","done","rem(derived)","completion_pct(derived)","status",
  "prod_date_start","prod_date_end","prod_date_finished",
];

const woodenSamples = [
  ["WO-2001","","2025-01-10","MR-101","SAP-001","الكيان العسكري","كراسي ضيوف","كرسي خشبي","أثاث","قطعة",100,80,null,null,"تحت التصنيع","2025-01-15","2025-03-15",""],
  ["WO-2002","","2025-02-01","MR-102","SAP-002","فاينست","طاولات اجتماعات","طاولة خشبية","أثاث","قطعة",20,20,null,null,"تم التسليم","2025-02-10","2025-04-10","2025-04-08"],
];

const woodenAOA = [woodenHdr1, woodenHdr2, ...woodenSamples];
const wsW = XLSX.utils.aoa_to_sheet(woodenAOA);

// Inject formulas for rows r=2..101 (r=0 hdr1, r=1 hdr2, r=2..N data)
for (let r = 2; r <= 101; r++) {
  const sRow  = r + 1; // 1-based sheet row
  const ordRef = `A${sRow}`;
  const qtyRef = `K${sRow}`;
  const donRef = `L${sRow}`;

  // Extension: strip "VBC" (case-insensitive) from order_no if Extension is blank
  wsW[cell(r, W_EXT)] = {
    f: `IF(${ordRef}="","",SUBSTITUTE(SUBSTITUTE(UPPER(${ordRef}),"VBC-",""),"-VBC",""))`,
    t: "s",
  };
  // Remaining = qty - done
  wsW[cell(r, W_REM)] = {
    f: `IF(${qtyRef}="","",IF(${qtyRef}=0,"",MAX(0,${qtyRef}-${donRef})))`,
    t: "n",
  };
  // Completion % = done / qty * 100
  wsW[cell(r, W_PCT)] = {
    f: `IF(${qtyRef}="","",IF(${qtyRef}=0,"",ROUND(${donRef}/${qtyRef}*100,1)))`,
    t: "n",
  };
}

// Status dropdown for Wooden — col O (1-based 15, 0-based 14)
wsW["!dataValidations"] = [{
  sqref: "O3:O1001",
  type: "list",
  formula1: '"تحت التصنيع,تم التسليم,متوقف,لم يتم البدء,Production,Delivered,Hold"',
  showDropDown: false,
  allowBlank: true,
}];

wsW["!cols"] = [
  { wch: 12 }, { wch: 22 }, { wch: 13 }, { wch: 16 }, { wch: 12 },
  { wch: 18 }, { wch: 20 }, { wch: 22 }, { wch: 12 }, { wch: 8  },
  { wch: 8  }, { wch: 8  }, { wch: 10 }, { wch: 13 }, { wch: 16 },
  { wch: 14 }, { wch: 14 }, { wch: 16 },
];
wsW["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 101, c: 17 } });
XLSX.utils.book_append_sheet(wb, wsW, "أوامر خشبي");

// ══════════════════════════════════════════════════════════════════════════
//  3. DASHBOARD — لوحة التحكم
//  KPIs mirror dashboard.ts:
//    metalTotalOrders, metalActiveOrders, metalCompletedOrders,
//    metalOverdueOrders, metalBacklogTotal, metalAvgCompletionPct,
//    woodenTotalOrders, woodenActiveOrders, woodenCompletedOrders,
//    woodenOverdueOrders, woodenBacklogTotal, woodenAvgCompletionPct,
//    sharedProjectsCount
// ══════════════════════════════════════════════════════════════════════════
const MO = "'أوامر معدني'"; // Metal sheet ref
const WO = "'أوامر خشبي'";  // Wooden sheet ref

// KPI formulas — exact mirrors of dashboard.ts logic
const kpiRows = [
  // [Label (AR), DB Key, Metal formula, Wooden formula, Total formula]
  [
    "إجمالي الأوامر\nTotal Orders",
    "totalOrders",
    { f: `COUNTA(${MO}!A3:A10000)` },
    { f: `COUNTA(${WO}!A3:A10000)` },
    { f: "B5+C5" },
  ],
  [
    "الأوامر النشطة\nActive Orders",
    "activeOrders",
    { f: `COUNTIF(${MO}!AA3:AA10000,"تحت التصنيع")+COUNTIF(${MO}!AA3:AA10000,"في المخزن")` },
    { f: `COUNTIF(${WO}!O3:O10000,"تحت التصنيع")+COUNTIF(${WO}!O3:O10000,"Production")` },
    { f: "B6+C6" },
  ],
  [
    "الأوامر المكتملة\nCompleted Orders",
    "completedOrders",
    { f: `COUNTIF(${MO}!AA3:AA10000,"تم الانتهاء")+COUNTIF(${MO}!AA3:AA10000,"تم التسليم")` },
    { f: `COUNTIF(${WO}!O3:O10000,"تم التسليم")+COUNTIF(${WO}!O3:O10000,"Delivered")` },
    { f: "B7+C7" },
  ],
  [
    "الأوامر المتوقفة\nOverdue / Stalled",
    "overdueOrders",
    { f: `COUNTIF(${MO}!AA3:AA10000,"متوقف")` },
    { f: `COUNTIF(${WO}!O3:O10000,"متوقف")+COUNTIF(${WO}!O3:O10000,"Hold")` },
    { f: "B8+C8" },
  ],
  [
    "إجمالي المتأخرات (كمية)\nBacklog Total (qty)",
    "backlogTotal",
    { f: `SUMIF(${MO}!Y3:Y10000,">"&0)` },
    { f: `SUMIF(${WO}!M3:M10000,">"&0)` },
    { f: "B9+C9" },
  ],
  [
    "متوسط نسبة الإنجاز %\nAvg Completion %",
    "avgCompletionPct",
    { f: `IFERROR(ROUND(AVERAGEIF(${MO}!E3:E10000,">"&0,${MO}!X3:X10000),1),"")` },
    { f: `IFERROR(ROUND(AVERAGEIF(${WO}!K3:K10000,">"&0,${WO}!N3:N10000),1),0)` },
    { f: `IFERROR(ROUND((B10+C10)/2,1),0)` },
  ],
  [
    "المشاريع المشتركة (عملاء في كلا المصنعين)\nShared Projects Count",
    "sharedProjectsCount",
    // Count UNIQUE clients appearing in BOTH Metal (col C) and Wooden (col F) — mirrors dashboard.ts sharedClients.size
    // ROWS(UNIQUE(FILTER(...))) counts distinct intersecting clients
    { f: `IFERROR(ROWS(UNIQUE(FILTER(${MO}!C3:C10000,COUNTIF(${WO}!F3:F10000,${MO}!C3:C10000)>0,${MO}!C3:C10000<>""))),0)` },
    { f: `""` },
    { f: "B11" },
  ],
];

const dashAOA = [
  ["لوحة التحكم — مصنعي إبداع للأثاث", "", "", "", ""],
  ["Dashboard — Ebdaa Factories", "", "", "", ""],
  ["آخر تحديث / Last Update:", { f: `TEXT(NOW(),"YYYY-MM-DD HH:MM")` }, "", "", ""],
  ["المؤشر / KPI", "مفتاح DB / DB Key", "معدني / Metal", "خشبي / Wooden", "الإجمالي / Total"],
  ...kpiRows,
  ["", "", "", "", ""],
  ["— راجع شيت 'مشاريع مشتركة' لتفاصيل العملاء المشتركين —", "", "", "", ""],
];

const wsDash = XLSX.utils.aoa_to_sheet(dashAOA);
wsDash["!cols"] = [
  { wch: 40 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 16 },
];
XLSX.utils.book_append_sheet(wb, wsDash, "لوحة التحكم");

// ══════════════════════════════════════════════════════════════════════════
//  4. SHARED PROJECTS — مشاريع مشتركة
//  Auto-populated via QUERY formula from both sheets (Google Sheets).
//  Shows clients who appear in BOTH Metal (col C) AND Wooden (col F).
//  Formula pattern: QUERY(UNIQUE(FILTER(MetalClients, COUNTIF(WoodenClients)>0)), "SELECT *...")
// ══════════════════════════════════════════════════════════════════════════
const sharedHdr = [
  "العميل (QUERY تلقائي)\nclient",
  "عدد أوامر معدني\nmetal_order_count",
  "عدد أوامر خشبي\nwooden_order_count",
  "إجمالي\ntotal_orders",
  "متوسط إنجاز معدني %\nmetal_completion_pct",
  "متوسط إنجاز خشبي %\nwooden_completion_pct",
  "ملاحظات\nnotes",
];

// A2: QUERY-based formula — uses QUERY to select unique shared clients.
// Mirrors dashboard.ts sharedClients = metalClients ∩ woodenClients (unique set).
// Works in Google Sheets only (QUERY + FILTER + UNIQUE are Sheets functions).
const SHARED_CLIENTS_FORMULA =
  `IFERROR(` +
    `QUERY(` +
      `UNIQUE(FILTER(${MO}!C3:C10000,COUNTIF(${WO}!F3:F10000,${MO}!C3:C10000)>0,${MO}!C3:C10000<>""))` +
      `,"SELECT * WHERE Col1 <> '' ORDER BY Col1",0),` +
    `"لا توجد مشاريع مشتركة — No shared projects")`;

const sharedAOA = [sharedHdr];
const wsShared = XLSX.utils.aoa_to_sheet(sharedAOA);

// A2 (r=1): QUERY spill formula auto-populates client list
wsShared[cell(1, 0)] = { f: SHARED_CLIENTS_FORMULA, t: "s" };

// Metric columns B..F: start at r=1 (sheet row 2 = A2 first client) through r=50
// This ensures the first shared-client row (A2) gets its computed metrics.
for (let r = 1; r <= 50; r++) {
  const sRow = r + 1; // 1-based sheet row: r=1 → row 2, r=2 → row 3 …
  const aRef = `A${sRow}`;
  wsShared[cell(r, 1)] = { f: `IF(${aRef}="","",COUNTIF(${MO}!C:C,${aRef}))`, t: "n" };
  wsShared[cell(r, 2)] = { f: `IF(${aRef}="","",COUNTIF(${WO}!F:F,${aRef}))`, t: "n" };
  wsShared[cell(r, 3)] = { f: `IF(${aRef}="","",B${sRow}+C${sRow})`, t: "n" };
  wsShared[cell(r, 4)] = { f: `IF(${aRef}="","",IFERROR(ROUND(AVERAGEIF(${MO}!C:C,${aRef},${MO}!X:X),1),""))`, t: "n" };
  wsShared[cell(r, 5)] = { f: `IF(${aRef}="","",IFERROR(ROUND(AVERAGEIF(${WO}!F:F,${aRef},${WO}!N:N),1),""))`, t: "n" };
}

wsShared["!cols"] = [
  { wch: 24 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 25 },
];
wsShared["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 50, c: 6 } });
XLSX.utils.book_append_sheet(wb, wsShared, "مشاريع مشتركة");

// ══════════════════════════════════════════════════════════════════════════
//  5. STAGE TRACKER — متابعة المراحل
// ══════════════════════════════════════════════════════════════════════════
const stageHdr1 = [
  "رقم MOM", "التاريخ", "اسم المرحلة", "الكمية الداخلة", "الكمية الخارجة",
  "الفاقد", "المشغّل", "ملاحظات",
];
const stageHdr2 = [
  "mo_number", "date", "stage_name", "input_qty", "output_qty",
  "waste_qty", "operator", "notes",
];
const stageSamples = [
  ["MOM-1001","2025-01-15","ليزر / Laser",50,50,null,"محمد",""],
  ["MOM-1001","2025-01-17","بانش / Punch",50,48,null,"أحمد","قطعتان مرفوضتان"],
  ["MOM-1001","2025-01-20","تجليخ / Polishing",48,47,null,"سعيد",""],
];

const stageAOA = [stageHdr1, stageHdr2, ...stageSamples];
const wsStage = XLSX.utils.aoa_to_sheet(stageAOA);

// Inject waste formula: waste = input - output (for rows r=2..101)
for (let r = 2; r <= 101; r++) {
  const sRow = r + 1;
  wsStage[cell(r, 5)] = {
    f: `IF(D${sRow}="","",MAX(0,D${sRow}-E${sRow}))`,
    t: "n",
  };
}

wsStage["!cols"] = [
  { wch: 14 }, { wch: 13 }, { wch: 24 }, { wch: 12 },
  { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 24 },
];
wsStage["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 101, c: 7 } });
XLSX.utils.book_append_sheet(wb, wsStage, "متابعة المراحل");

// ─── WRITE FILE ─────────────────────────────────────────────────────────────
const outPath = "/home/runner/workspace/.local/outputs/Ebdaa-Sheets-Template.xlsx";
XLSX.writeFile(wb, outPath);
console.log("✓ Written:", outPath);
