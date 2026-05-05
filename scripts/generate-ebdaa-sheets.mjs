import * as XLSX from "xlsx";
import { mkdir } from "fs/promises";
import path from "path";

await mkdir(".local/outputs", { recursive: true });

const wb = XLSX.utils.book_new();

// ─── 1. METAL ORDERS ────────────────────────────────────────────────────────
const metalHeaders = [
  "رقم MOM\nMO Number",
  "المشروع\nProject",
  "العميل\nClient",
  "المنتج\nProduct",
  "الكمية\nQty",
  "الوحدة\nUnit",
  // 17 production stages
  "ليزر\nLaser",
  "بانش\nPunch",
  "تخليع\nStripping",
  "تجليخ\nPolishing",
  "لحام أرجون\nArgon Weld",
  "لحام بنطة\nPatch Weld",
  "لحام نحاس\nBrass Weld",
  "لحام CO₂\nCO₂ Weld",
  "التنايات\nBending",
  "مكابس وتكويع\nPress & Form",
  "المثقاب\nDrill",
  "المقص\nShear",
  "الكويل\nCoil",
  "التجميع\nAssembly",
  "تشطيب إستانلس\nStainless Finish",
  "الدهان\nPainting",
  "التسليم\nDelivery",
  // Calculated
  "نسبة الإنجاز %\nCompletion %",
  "متأخرات\nBacklog Qty",
  "حالة المتأخرات\nBacklog Status",
  "الحالة\nStatus",
  "ملاحظات\nNotes",
];

// Stage columns span G:W (indices 6..22), qty is col E (index 4)
// Completion % formula: =IF(E2=0,"",ROUND(SUM(G2:W2)/E2*100,1))
// Backlog formula: =IF(E2=0,"",E2-W2)  (Qty - Delivered)
const metalSampleRows = [
  ["MOM-1001", "الكيان العسكري", "الكيان العسكري", "كرسي معدني", 50, "قطعة",
   50,48,48,47,46,46,46,46,46,46,46,45,45,44,44,44,40,
   "", "", "", "تحت التصنيع", ""],
  ["MOM-1002", "جزيرة مزارين", "جزيرة مزارين", "طاولة معدنية", 30, "قطعة",
   30,30,30,29,28,28,28,28,28,27,27,27,27,26,26,25,20,
   "", "", "", "تحت التصنيع", ""],
];

const metalData = [metalHeaders, ...metalSampleRows];
const wsMetalRaw = XLSX.utils.aoa_to_sheet(metalData);

// Inject completion % and backlog formulas for sample rows + 100 blank rows
for (let r = 2; r <= 102; r++) {
  const completionCell = XLSX.utils.encode_cell({ r, c: 23 }); // col X
  const backlogCell    = XLSX.utils.encode_cell({ r, c: 24 }); // col Y
  const qtyCell        = `E${r + 1}`;
  const sumRange       = `G${r + 1}:W${r + 1}`;
  const deliveredCell  = `W${r + 1}`;

  wsMetalRaw[completionCell] = { f: `IF(${qtyCell}=0,"",ROUND(SUM(${sumRange})/${qtyCell}*100,1))`, t: "n" };
  wsMetalRaw[backlogCell]    = { f: `IF(${qtyCell}=0,"",${qtyCell}-${deliveredCell})`, t: "n" };
}

// Column widths
wsMetalRaw["!cols"] = [
  { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 8 }, { wch: 8 },
  ...Array(17).fill({ wch: 9 }),
  { wch: 13 }, { wch: 10 }, { wch: 16 }, { wch: 16 }, { wch: 22 },
];
wsMetalRaw["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 102, c: 27 } });
XLSX.utils.book_append_sheet(wb, wsMetalRaw, "أوامر معدني");

// ─── 2. WOODEN ORDERS ───────────────────────────────────────────────────────
const woodenHeaders = [
  "رقم الأمر\nOrder No",
  "الامتداد (بعد تنظيف VBC)\nExtension",
  "تاريخ الأمر\nOrder Date",
  "طلب التصنيع\nManufacture Req",
  "كود SAP\nSAP Code",
  "العميل\nClient",
  "المشروع الفرعي\nSub-Project",
  "المنتج\nProduct",
  "الفئة\nCategory",
  "وحدة القياس\nUOM",
  "الكمية\nQty",
  "المنجز\nDone",
  "المتبقي\nRemaining",
  "نسبة الإنجاز %\nCompletion %",
  "الحالة\nStatus",
  "تاريخ بدء الإنتاج\nProd Start",
  "تاريخ انتهاء الإنتاج\nProd End",
  "تاريخ الانتهاء الفعلي\nActual Finish",
];

const woodenSampleRows = [
  ["WO-2001", "=SUBSTITUTE(UPPER(A2),\"VBC\",\"\")", "2025-01-10", "MR-101", "SAP-001", "الكيان العسكري", "كراسي ضيوف", "كرسي خشبي", "أثاث", "قطعة", 100, 80, "", "", "تحت التصنيع", "2025-01-15", "2025-03-15", ""],
  ["WO-2002", "=SUBSTITUTE(UPPER(A3),\"VBC\",\"\")", "2025-02-01", "MR-102", "SAP-002", "فاينست",        "طاولات اجتماعات", "طاولة خشبية", "أثاث", "قطعة", 20, 20, "", "", "تم التسليم",  "2025-02-10", "2025-04-10", "2025-04-08"],
];

const woodenData = [woodenHeaders, ...woodenSampleRows];
const wsWooden = XLSX.utils.aoa_to_sheet(woodenData);

// Formulas for Remaining and Completion %
for (let r = 2; r <= 102; r++) {
  const remCell  = XLSX.utils.encode_cell({ r, c: 12 }); // col M
  const pctCell  = XLSX.utils.encode_cell({ r, c: 13 }); // col N
  const extCell  = XLSX.utils.encode_cell({ r, c: 1  }); // col B (Extension clean)
  const qtyRef   = `K${r + 1}`;
  const doneRef  = `L${r + 1}`;
  const aRef     = `A${r + 1}`;

  if (r >= 3) { // skip sample rows that already have it
    wsWooden[extCell] = { f: `IF(${aRef}="","",SUBSTITUTE(UPPER(${aRef}),"VBC",""))`, t: "s" };
  }
  wsWooden[remCell] = { f: `IF(${qtyRef}=0,"",${qtyRef}-${doneRef})`, t: "n" };
  wsWooden[pctCell] = { f: `IF(${qtyRef}=0,"",ROUND(${doneRef}/${qtyRef}*100,1))`, t: "n" };
}

wsWooden["!cols"] = [
  { wch: 12 }, { wch: 22 }, { wch: 13 }, { wch: 16 }, { wch: 12 },
  { wch: 18 }, { wch: 20 }, { wch: 22 }, { wch: 12 }, { wch: 8 },
  { wch: 8  }, { wch: 8  }, { wch: 10 }, { wch: 13 }, { wch: 16 },
  { wch: 14 }, { wch: 14 }, { wch: 16 },
];
wsWooden["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 102, c: 17 } });
XLSX.utils.book_append_sheet(wb, wsWooden, "أوامر خشبي");

// ─── 3. DASHBOARD ───────────────────────────────────────────────────────────
const dashRows = [
  ["لوحة التحكم — مصنعي إبداع", "", "", ""],
  ["Dashboard — Ebdaa Factories", "", "", ""],
  ["", "", "", ""],
  ["المؤشر", "المصنع المعدني", "المصنع الخشبي", "الإجمالي"],
  ["إجمالي الأوامر",       { f: "COUNTA('أوامر معدني'!A2:A10000)-1" }, { f: "COUNTA('أوامر خشبي'!A2:A10000)-1" }, { f: "B5+C5" }],
  ["الأوامر النشطة",       { f: "COUNTIF('أوامر معدني'!AA2:AA10000,\"تحت التصنيع\")" }, { f: "COUNTIF('أوامر خشبي'!O2:O10000,\"تحت التصنيع\")" }, { f: "B6+C6" }],
  ["الأوامر المكتملة",     { f: "COUNTIF('أوامر معدني'!AA2:AA10000,\"تم التسليم\")" }, { f: "COUNTIF('أوامر خشبي'!O2:O10000,\"تم التسليم\")" }, { f: "B7+C7" }],
  ["الأوامر المتوقفة",     { f: "COUNTIF('أوامر معدني'!AA2:AA10000,\"متوقف\")" }, { f: "COUNTIF('أوامر خشبي'!O2:O10000,\"متوقف\")" }, { f: "B8+C8" }],
  ["إجمالي المتأخرات (كمية)", { f: "SUMIF('أوامر معدني'!E2:E10000,\">0\",'أوامر معدني'!Y2:Y10000)" }, { f: "SUMIF('أوامر خشبي'!K2:K10000,\">0\",'أوامر خشبي'!M2:M10000)" }, { f: "B9+C9" }],
  ["متوسط نسبة الإنجاز %", { f: "IFERROR(AVERAGEIF('أوامر معدني'!E2:E10000,\">0\",'أوامر معدني'!X2:X10000),0)" }, { f: "IFERROR(AVERAGEIF('أوامر خشبي'!K2:K10000,\">0\",'أوامر خشبي'!N2:N10000),0)" }, { f: "IFERROR((B10+C10)/2,0)" }],
  ["", "", "", ""],
  ["المشاريع المشتركة (عملاء في المصنعين)", "", "", ""],
  ["", "", "", ""],
  ["العميل", "أوامر معدني", "أوامر خشبي", "إجمالي"],
];

const wsDash = XLSX.utils.aoa_to_sheet(dashRows);
wsDash["!cols"] = [{ wch: 35 }, { wch: 18 }, { wch: 18 }, { wch: 14 }];
wsDash["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 20, c: 3 } });
XLSX.utils.book_append_sheet(wb, wsDash, "لوحة التحكم");

// ─── 4. SHARED PROJECTS ─────────────────────────────────────────────────────
const sharedHeaders = [
  "العميل\nClient",
  "عدد أوامر معدني\nMetal Orders",
  "عدد أوامر خشبي\nWooden Orders",
  "إجمالي الأوامر\nTotal Orders",
  "متوسط إنجاز معدني %\nMetal Completion %",
  "متوسط إنجاز خشبي %\nWooden Completion %",
  "ملاحظات\nNotes",
];
const sharedNote = [
  ["ملاحظة: أضف هنا العملاء الذين لهم أوامر في كلا المصنعين.", "", "", "", "", "", ""],
  ["Note: Add clients who appear in both Metal and Wooden factories.", "", "", "", "", "", ""],
  ["يمكنك استخدام VLOOKUP أو QUERY للمقارنة التلقائية.", "", "", "", "", "", ""],
];
const wsShared = XLSX.utils.aoa_to_sheet([sharedHeaders, ...sharedNote]);
wsShared["!cols"] = [{ wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 25 }];
XLSX.utils.book_append_sheet(wb, wsShared, "مشاريع مشتركة");

// ─── 5. STAGE TRACKER ───────────────────────────────────────────────────────
const stageHeaders = [
  "رقم MOM\nMO Number",
  "التاريخ\nDate",
  "اسم المرحلة\nStage Name",
  "الكمية الداخلة\nInput Qty",
  "الكمية الخارجة\nOutput Qty",
  "الفاقد\nWaste",
  "المشغّل\nOperator",
  "ملاحظات\nNotes",
];
const stageRows = [
  ["MOM-1001", "2025-01-15", "ليزر / Laser", 50, 50, { f: "D2-E2" }, "محمد", ""],
  ["MOM-1001", "2025-01-17", "بانش / Punch", 50, 48, { f: "D3-E3" }, "أحمد", "قطعتان مرفوضتان"],
  ["MOM-1001", "2025-01-20", "تجليخ / Polishing", 48, 47, { f: "D4-E4" }, "سعيد", ""],
];
const wsStage = XLSX.utils.aoa_to_sheet([stageHeaders, ...stageRows]);
wsStage["!cols"] = [{ wch: 14 }, { wch: 13 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 22 }];
XLSX.utils.book_append_sheet(wb, wsStage, "متابعة المراحل");

// ─── WRITE FILE ─────────────────────────────────────────────────────────────
const outPath = ".local/outputs/Ebdaa-Sheets-Template.xlsx";
XLSX.writeFile(wb, outPath);
console.log("✓ Written:", outPath);
