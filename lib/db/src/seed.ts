import path from "path";
import { readFileSync, existsSync } from "fs";
import { seedCapacity } from "./seedCapacity";
import { fileURLToPath } from "url";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const XLSX = require("xlsx") as typeof import("xlsx");
import { eq, sql } from "drizzle-orm";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../../..");
const ASSETS_DIR = path.join(REPO_ROOT, "attached_assets");
const GEM_WOOD_ORDER_JSON_PATHS = [
  path.join(REPO_ROOT, "Data/gem_Claude/wood_work_orders (2).json"),
  path.join(REPO_ROOT, "Data/gem_Claude/wood_work_orders (3).json"),
];

function safeStr(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val).trim();
}
function safeNum(val: unknown, fallback = 0): number {
  const n = parseFloat(String(val ?? ""));
  return isNaN(n) ? fallback : n;
}
function stripVbc(val: unknown): string {
  return safeStr(val).replace(/\bvbc\b/gi, "").replace(/\s+/g, " ").trim();
}
function excelDateToStr(serial: unknown): string {
  const n = safeNum(serial, 0);
  if (n <= 0) return "";
  const date = new Date(Math.round((n - 25569) * 86400 * 1000));
  return date.toISOString().split("T")[0];
}

interface MetalOrderRow {
  moNumber: string;
  project: string;
  client: string;
  product: string;
  qty: string;
  unit: string;
  notes: string;
  status: string;
}

interface WoodenOrderRow {
  orderNo: string;
  extension: string;
  client: string;
  orderDate: string;
  subProject: string;
  product: string;
  qty: number;
  done: number;
  rem: number;
  status: string;
  notes: string;
  prodDateEnd: string;
}

/** Normalize Arabic text for fuzzy matching (trim + unify hamza variants) */
function normalizeArabic(s: string): string {
  return s.trim().replace(/[أإآ]/g, "ا");
}

/** Normalize wooden order status from English/Arabic to Arabic */
function parseWoodenStatus(raw: string): string {
  const s = raw.toLowerCase().trim();
  if (!s) return "تحت التصنيع";
  if (s === "delivered" || s === "done") return "تم التسليم";
  if (s === "production") return "تحت التصنيع";
  if (s === "hold" || s === "cancel") return "متوقف";
  // Arabic pass-through
  if (raw.includes("تم التسليم")) return "تم التسليم";
  if (raw.includes("تحت التصنيع")) return "تحت التصنيع";
  if (raw.includes("متوقف")) return "متوقف";
  if (raw.includes("لم يتم")) return "لم يتم البدء";
  return "تحت التصنيع";
}

function parseMoStatus(note: string): string {
  const n = note.toLowerCase();
  if (n.includes("تم الانتهاء") || n.includes("تم التسليم") || n.includes("تم تغليف كامل")) return "تم الانتهاء";
  if (n.includes("لم يتم البدء")) return "لم يتم البدء";
  if (n.includes("متوقف")) return "متوقف";
  return "تحت التصنيع";
}

function loadMetalOrders(): MetalOrderRow[] {
  try {
    const wb = XLSX.readFile(path.join(ASSETS_DIR, "metal_orders_1777969762141.xlsx"));
    const ws = wb.Sheets["MO"] || wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as unknown[][];

    // Find header row (has "MO" in column 3)
    let headerIdx = 8; // default from inspection
    for (let i = 0; i < Math.min(15, rows.length); i++) {
      const r = rows[i] as unknown[];
      if (safeStr(r[3]).toUpperCase().includes("MO") && safeStr(r[5]).toLowerCase().includes("product")) {
        headerIdx = i;
        break;
      }
    }

    const results: MetalOrderRow[] = [];
    const seen = new Set<string>();

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const row = rows[i] as unknown[];
      const moNum = stripVbc(safeStr(row[3]));
      if (!moNum || moNum === "" || moNum.toLowerCase() === "mo") continue;

      const client = stripVbc(safeStr(row[4]));
      const product = safeStr(row[5]);
      const qty = safeNum(row[6], 1);
      const unit = safeStr(row[7]) || "Unit";
      const notes = safeStr(row[8]);

      if (!product) continue;
      if (!seen.has(moNum)) {
        seen.add(moNum);
        results.push({
          moNumber: moNum,
          project: client,
          client,
          product,
          qty: String(qty),
          unit,
          notes,
          status: parseMoStatus(notes),
        });
      }
    }
    console.log(`  Parsed ${results.length} unique metal orders from Excel`);
    return results;
  } catch (e) {
    console.warn("  Could not parse metal_orders.xlsx, using fallback data:", String(e));
    return [];
  }
}

function gemExportDateToStr(val: unknown): string {
  const s = safeStr(val).toLowerCase();
  if (!s || s === "nan" || s === "none" || s === "null") return "";
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return "";
  return s.slice(0, 10);
}

/** Derive list status from Gem-style quantities when no explicit status string exists */
function woodenStatusFromQuantities(qty: number, done: number, rem: number): string {
  if (qty > 0 && rem <= 0 && done >= qty) return "تم التسليم";
  if (done <= 0 && rem > 0) return "لم يتم البدء";
  if (qty <= 0 && rem <= 0 && done <= 0) return "لم يتم البدء";
  return "تحت التصنيع";
}

function normalizeWoodenOrderKey(orderNo: string): string {
  return orderNo.replace(/\bvbc[-\s]*/gi, "").replace(/\s+/g, " ").trim().toLowerCase();
}

interface GemWoodWorkOrderJson {
  work_order_id?: string;
  project_name?: string;
  product_name?: string;
  quantities?: { total_required?: unknown; completed?: unknown; remaining?: unknown };
  dates?: { receive_date?: unknown; delivery_date?: unknown };
}

/** Real wooden work orders exported under Data/gem_Claude (merged across files by work_order_id) */
function loadWoodenOrdersFromGemExports(): WoodenOrderRow[] {
  const byId = new Map<string, WoodenOrderRow>();
  for (const filePath of GEM_WOOD_ORDER_JSON_PATHS) {
    if (!existsSync(filePath)) continue;
    try {
      const raw = JSON.parse(readFileSync(filePath, "utf8")) as { work_orders?: GemWoodWorkOrderJson[] };
      const list = raw.work_orders ?? [];
      for (const wo of list) {
        const orderId = safeStr(wo.work_order_id);
        if (!orderId) continue;
        const project = stripVbc(safeStr(wo.project_name));
        const productName = stripVbc(safeStr(wo.product_name));
        if (!productName) continue;
        const qty = Math.round(safeNum(wo.quantities?.total_required, 0));
        const done = Math.round(safeNum(wo.quantities?.completed, 0));
        const rem = Math.round(safeNum(wo.quantities?.remaining, 0));
        const recv = gemExportDateToStr(wo.dates?.receive_date);
        const deliv = gemExportDateToStr(wo.dates?.delivery_date);
        const label = project || productName;
        byId.set(orderId, {
          orderNo: orderId,
          extension: "",
          client: label,
          orderDate: recv,
          subProject: label,
          product: productName || "منتج خشبي",
          qty,
          done,
          rem,
          status: woodenStatusFromQuantities(qty, done, rem),
          notes: "",
          prodDateEnd: deliv,
        });
      }
      console.log(`  Parsed Gem wooden JSON: ${path.relative(REPO_ROOT, filePath)} (${list.length} work_orders in file)`);
    } catch (e) {
      console.warn(`  Could not parse Gem wooden JSON ${filePath}:`, String(e));
    }
  }
  const out = [...byId.values()];
  if (out.length > 0) console.log(`  Gem wooden JSON total: ${out.length} unique work orders`);
  return out;
}

function mergeWoodenOrderRows(excel: WoodenOrderRow[], gem: WoodenOrderRow[]): WoodenOrderRow[] {
  const map = new Map<string, WoodenOrderRow>();
  for (const r of excel) map.set(normalizeWoodenOrderKey(r.orderNo), r);
  for (const r of gem) map.set(normalizeWoodenOrderKey(r.orderNo), r);
  return [...map.values()];
}

function loadWoodenOrdersFromExcel(): WoodenOrderRow[] {
  try {
    const wb = XLSX.readFile(path.join(ASSETS_DIR, "wooden_orders_1777969762147.xlsx"));
    // Sheet4 columns: Order, Date, Project(=client), Sub-Project, Product, QTY, Done, Rem, Status, notes, expected_finish, req_finish
    const ws = wb.Sheets["Sheet4"] || wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as unknown[][];

    // Insert every data row as-is — no aggregation
    const results: WoodenOrderRow[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] as unknown[];
      const rawOrderNo = safeStr(row[0]);
      if (!rawOrderNo || rawOrderNo === "") continue;

      // Sheet4 layout: col0=Order, col1=Date, col2=Project(client), col3=Sub-Project,
      // col4=Product, col5=QTY, col6=Done, col7=Rem, col8=Status, col9=Notes, col10=expected_finish
      // Extension: strip VBC from orderNo; keep orderNo without VBC prefix
      const hasVbc = /vbc/i.test(rawOrderNo);
      const orderNoClean = rawOrderNo.replace(/\bvbc[-\s]*/gi, "").replace(/\s+/g, " ").trim();
      const extension = hasVbc ? rawOrderNo.replace(/\bvbc[-\s]*/gi, "").trim() : "";

      const product = safeStr(row[4]);
      if (!product) continue; // skip completely blank rows

      const qty = safeNum(row[5], 0);
      const done = safeNum(row[6], 0);
      const rem = safeNum(row[7], 0);

      const projectCol = stripVbc(safeStr(row[2]));
      const subProjectCol = stripVbc(safeStr(row[3]));
      results.push({
        orderNo: orderNoClean,
        extension,
        // "Project" col is often empty in Sheet4; fall back to Sub-Project as client identifier
        client: projectCol || subProjectCol,
        orderDate: excelDateToStr(row[1]),           // col1 = Date
        subProject: subProjectCol,
        product: stripVbc(product) || "منتج خشبي",
        qty,
        done,
        rem,
        status: parseWoodenStatus(safeStr(row[8])),
        notes: safeStr(row[9]),
        prodDateEnd: excelDateToStr(row[10]),
      });
    }

    console.log(`  Parsed ${results.length} wooden order rows from Excel`);
    return results;
  } catch (e) {
    console.warn("  Could not parse wooden_orders.xlsx:", String(e));
    return [];
  }
}

function loadWoodenOrders(): WoodenOrderRow[] {
  const fromExcel = loadWoodenOrdersFromExcel();
  const fromGem = loadWoodenOrdersFromGemExports();
  const merged = mergeWoodenOrderRows(fromExcel, fromGem);
  if (fromGem.length > 0) {
    console.log(
      `  Wooden orders merged: ${fromExcel.length} Excel + ${fromGem.length} Gem JSON -> ${merged.length} unique (Gem wins on duplicate order key)`
    );
  }
  return merged;
}

interface StageEntry { status: string; qty: number }

/** Build a map of { moNumber -> { normalizedStageName -> { status, qty } } } from the daily production Excel.
 *  Sheet layout: Row 0 = sheet title, Row 1 = column headers, Row 2+ = data rows.
 *  Key insight: status column is the one containing "موقف" in row 1.
 *  qtyDone = column just before status column (or col 6 when no status column).
 */
function loadMetalDailyStageStatuses(): Map<string, Map<string, StageEntry>> {
  const result = new Map<string, Map<string, StageEntry>>();
  try {
    const wb = XLSX.readFile(path.join(ASSETS_DIR, "Metal_daily_Production_1777969955661.xlsx"));
    for (const sheetName of wb.SheetNames) {
      if (sheetName === "Sheet1" || sheetName.startsWith("_xlnm")) continue;
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as unknown[][];
      if (rows.length < 3) continue;

      // Row 1 = actual column headers (row 0 is the Arabic title)
      const headerRow = rows[1] as unknown[];
      // Find "موقف" (status) column index
      let statusColIdx = headerRow.findIndex((h, idx) => idx > 3 && String(h).includes("موقف"));
      // QtyDone is the column immediately before the status column (col 6 fallback)
      const qtyDoneColIdx = statusColIdx >= 0 ? statusColIdx - 1 : 6;
      if (statusColIdx < 0) statusColIdx = -1;

      // Normalize sheet name for matching: trim whitespace + unify hamza
      const normalizedSheet = normalizeArabic(sheetName.trim());

      // Data starts at row 2
      for (let i = 2; i < rows.length; i++) {
        const row = rows[i] as unknown[];
        const moNum = safeStr(row[2]);
        if (!moNum || moNum === "M.O" || moNum === "") continue;
        const statusRaw = statusColIdx >= 0 ? safeStr(row[statusColIdx]) : "";
        const qty = safeNum(row[qtyDoneColIdx], 0);
        if (!result.has(moNum)) result.set(moNum, new Map());
        const stageMap = result.get(moNum)!;
        if (stageMap.has(normalizedSheet)) {
          // Accumulate qty across sub-assemblies; keep most recent non-empty status
          const prev = stageMap.get(normalizedSheet)!;
          stageMap.set(normalizedSheet, { status: statusRaw || prev.status, qty: prev.qty + qty });
        } else {
          stageMap.set(normalizedSheet, { status: statusRaw, qty });
        }
      }
    }
    console.log(`  Parsed stage data for ${result.size} MO numbers from daily production Excel`);
  } catch (e) {
    console.warn("  Could not parse Metal_daily_Production.xlsx:", String(e));
  }
  return result;
}

const FALLBACK_METAL_ORDERS: MetalOrderRow[] = [
  { moNumber: "MOM 1102", project: "الكيان العسكري", client: "الكيان العسكري", product: "سرير معدني + لوكر", qty: "2306", unit: "Unit", notes: "تغليف 1640", status: "تحت التصنيع" },
  { moNumber: "MOM 1114", project: "شركه الغزال", client: "شركه الغزال", product: "سرير زوجي", qty: "5000", unit: "Unit", notes: "تم التغليف كامل", status: "تم الانتهاء" },
  { moNumber: "MOMS 1116", project: "مستشفى وادي النيل", client: "مستشفى وادي النيل", product: "معدات مطبخية", qty: "30", unit: "Unit", notes: "بيتم تشطيب", status: "تحت التصنيع" },
  { moNumber: "MOMS 1104", project: "باروس", client: "باروس", product: "معدات مطبخية خاصة", qty: "4", unit: "Unit", notes: "", status: "تحت التصنيع" },
  { moNumber: "MOM 1117", project: "VBC", client: "VBC", product: "دولاب + سرير", qty: "66", unit: "Unit", notes: "لم يتم البدء", status: "لم يتم البدء" },
  { moNumber: "MOM 1090", project: "فاينست", client: "فاينست", product: "خلية عمل خاصة", qty: "1", unit: "Unit", notes: "", status: "تحت التصنيع" },
  { moNumber: "MOM 1098", project: "الأبنية التعليمية", client: "الأبنية التعليمية", product: "ديسك طالب", qty: "50000", unit: "Unit", notes: "منضده+مقعد", status: "تحت التصنيع" },
  { moNumber: "MOM 1106", project: "جامعه المنصوره", client: "جامعه المنصوره", product: "لوكر 12 عين", qty: "1", unit: "Unit", notes: "تم التجميع", status: "تم الانتهاء" },
  { moNumber: "MOM 1101", project: "فرش مقر جدة و الرياض", client: "فرش مقر جدة", product: "شاسيه معدن مكتب مدير", qty: "4", unit: "Unit", notes: "تم الانتهاء", status: "تم الانتهاء" },
  { moNumber: "MOMS 1141", project: "holiday inn", client: "holiday inn", product: "بار متحرك", qty: "1", unit: "Unit", notes: "تشطيب نهائي", status: "تم الانتهاء" },
  { moNumber: "MOMS 1129", project: "Villaggio", client: "Villaggio", product: "تروللى راكات للزجاج", qty: "1", unit: "Unit", notes: "", status: "تحت التصنيع" },
  { moNumber: "MOMS 1135", project: "casa maza", client: "casa maza", product: "جريل 80-50-13", qty: "1", unit: "Unit", notes: "تم الانتهاء", status: "تم الانتهاء" },
];

const FALLBACK_WOODEN_ORDERS: WoodenOrderRow[] = [
  { orderNo: "10893", extension: "", client: "مزارين", orderDate: "2024-06-01", subProject: "ابواب مزارين 1", product: "باب جانب بيتش باين", qty: 857, done: 857, rem: 0, status: "تم التسليم", notes: "", prodDateEnd: "" },
  { orderNo: "11056", extension: "", client: "مزارين", orderDate: "2024-06-01", subProject: "ابواب مزارين 1", product: "باب حمام", qty: 707, done: 707, rem: 0, status: "تم التسليم", notes: "", prodDateEnd: "" },
  { orderNo: "11057", extension: "", client: "مزارين", orderDate: "2024-06-15", subProject: "ابواب مزارين 1", product: "باب داخلي حمام 0.8م", qty: 11, done: 11, rem: 0, status: "تم التسليم", notes: "", prodDateEnd: "" },
  { orderNo: "11060", extension: "", client: "مزارين", orderDate: "2024-06-15", subProject: "منتجع مزارين", product: "قطعة بيتش باين", qty: 6, done: 6, rem: 0, status: "تم التسليم", notes: "", prodDateEnd: "" },
  { orderNo: "10900", extension: "", client: "مزارين", orderDate: "2024-06-20", subProject: "عينات ابواب مزارين 1", product: "تجليدة استربات", qty: 3, done: 3, rem: 0, status: "تم التسليم", notes: "", prodDateEnd: "" },
  { orderNo: "11065", extension: "", client: "مزارين", orderDate: "2024-07-01", subProject: "ابواب مزارين 1", product: "باب ارو 90 سم", qty: 46, done: 46, rem: 0, status: "تم التسليم", notes: "", prodDateEnd: "" },
  { orderNo: "11070", extension: "", client: "مزارين", orderDate: "2024-08-01", subProject: "مزارين - غرف", product: "غرفة نوم كاملة", qty: 120, done: 80, rem: 40, status: "تحت التصنيع", notes: "جاري التصنيع", prodDateEnd: "2025-02-01" },
  { orderNo: "11080", extension: "", client: "مزارين", orderDate: "2024-09-01", subProject: "مزارين - صالات", product: "أثاث صالة", qty: 50, done: 20, rem: 30, status: "تحت التصنيع", notes: "", prodDateEnd: "2025-03-01" },
  { orderNo: "11090", extension: "غرف فندقية", client: "الكيان العسكري", orderDate: "2024-10-01", subProject: "غرف فندقية", product: "طقم غرفة فندق", qty: 80, done: 0, rem: 80, status: "تحت التصنيع", notes: "لم يتم البدء", prodDateEnd: "2025-04-01" },
  { orderNo: "11100", extension: "", client: "الكيان العسكري", orderDate: "2024-11-01", subProject: "الكيان - مكاتب", product: "مكتب تنفيذي", qty: 30, done: 15, rem: 15, status: "تحت التصنيع", notes: "", prodDateEnd: "2025-05-01" },
];

async function seed() {
  await seedCapacity();
  console.log("Seeding work orders...");
  const existing = await db.select().from(metalWorkOrdersTable);
  if (existing.length > 0) {
    console.log(`Already seeded (${existing.length} metal orders). Skipping.`);
    return;
  }

  // Load from real Excel files; fallback only when files are absent from attached_assets
  console.log("Loading data from attached Excel files...");
  const metalOrders = loadMetalOrders();
  if (metalOrders.length === 0) {
    console.warn(
      "  WARNING: No metal orders parsed from Excel. Using fallback dataset " +
      "(place Metal_Work_Orders.xlsx in attached_assets/ to seed from real data)."
    );
    metalOrders.push(...FALLBACK_METAL_ORDERS);
  }

  const woodenOrders = loadWoodenOrders();
  if (woodenOrders.length === 0) {
    console.warn(
      "  WARNING: No wooden orders parsed from Excel. Using fallback dataset " +
      "(place Wooden_Work_Orders.xlsx in attached_assets/ to seed from real data)."
    )
    woodenOrders.push(...FALLBACK_WOODEN_ORDERS);
  }

  const dailyStageStatuses = loadMetalDailyStageStatuses();

  console.log(`Seeding ${metalOrders.length} metal work orders...`);
  for (const orderData of metalOrders) {
    const [order] = await db.insert(metalWorkOrdersTable).values({
      moNumber: orderData.moNumber,
      project: orderData.project,
      client: orderData.client,
      product: orderData.product,
      qty: orderData.qty,
      unit: orderData.unit,
      deliveredQty: "0",
      completionPct: "0",
      backlogQty: "0",
      notes: orderData.notes,
      status: orderData.status,
    }).onConflictDoUpdate({
      target: metalWorkOrdersTable.moNumber,
      set: { project: sql`excluded.project`, client: sql`excluded.client`, product: sql`excluded.product`, qty: sql`excluded.qty`, unit: sql`excluded.unit`, notes: sql`excluded.notes`, status: sql`excluded.status` },
    }).returning();

    const moStageData = dailyStageStatuses.get(orderData.moNumber) ?? new Map<string, StageEntry>();

    const stagesToInsert = METAL_STAGES.map(s => {
      // Normalize stage name to match the normalized sheet names in the production map
      const entry = moStageData.get(normalizeArabic(s.name));
      let status = "لم يتم البدء";
      let qtyDone = "0";
      if (entry && (entry.status || entry.qty > 0)) {
        const r = (entry.status || "").toLowerCase().trim();
        if (r.includes("تم") || r.includes("done") || r.includes("finish") || r.includes("انتهاء")) {
          status = "تم الانتهاء";
        } else if (r.includes("جاري") || r.includes("تحت") || r.includes("progress") || r.includes("wip") || entry.qty > 0) {
          status = "تحت التصنيع";
        } else if (r) {
          status = "تحت التصنيع"; // any non-empty status = in progress
        }
        // Use real accumulated qty from Excel; fall back to order qty when fully done
        qtyDone = entry.qty > 0 ? String(entry.qty) : (status === "تم الانتهاء" ? orderData.qty : "0");
      } else if (orderData.status === "تم الانتهاء") {
        status = "تم الانتهاء";
        qtyDone = orderData.qty;
      }
      return { metalOrderId: order.id, moNumber: order.moNumber, stageName: s.name, stageOrder: s.order, qtyTarget: orderData.qty, qtyDone, status };
    });
    await db.insert(metalProductionStagesTable).values(stagesToInsert)
      .onConflictDoUpdate({
        target: [metalProductionStagesTable.metalOrderId, metalProductionStagesTable.stageName],
        set: { qtyDone: sql`excluded.qty_done`, status: sql`excluded.status` },
      });
  }

  // Update completionPct based on stage data for each metal order
  const allOrders = await db.select().from(metalWorkOrdersTable);
  const allStages = await db.select().from(metalProductionStagesTable);
  for (const order of allOrders) {
    const orderStages = allStages.filter(s => s.metalOrderId === order.id);
    if (orderStages.length === 0) continue;
    const doneCount = orderStages.filter(s => s.status === "تم الانتهاء").length;
    const pct = Math.round((doneCount / orderStages.length) * 100);
    const doneQty = orderStages.reduce((sum, s) => sum + parseFloat(s.qtyDone || "0"), 0) / orderStages.length;
    await db.update(metalWorkOrdersTable).set({
      completionPct: String(pct),
      deliveredQty: String(Math.round(doneQty)),
      backlogQty: String(Math.max(0, parseFloat(order.qty) - Math.round(doneQty))),
    }).where(eq(metalWorkOrdersTable.id, order.id));
  }

  console.log(`Seeding ${woodenOrders.length} wooden work orders...`);
  for (const orderData of woodenOrders) {
    const [order] = await db.insert(woodenWorkOrdersTable).values({
      orderNo: orderData.orderNo,
      extension: orderData.extension || "",
      client: orderData.client || "",
      orderDate: orderData.orderDate || "",
      subProject: orderData.subProject,
      product: orderData.product,
      qty: String(orderData.qty),
      done: String(orderData.done),
      rem: String(orderData.rem),
      status: orderData.status,
      prodDateEnd: orderData.prodDateEnd || "",
    }).onConflictDoUpdate({
      target: woodenWorkOrdersTable.orderNo,
      set: {
        client: sql`excluded.client`,
        subProject: sql`excluded.sub_project`,
        product: sql`excluded.product`,
        qty: sql`excluded.qty`,
        done: sql`excluded.done`,
        rem: sql`excluded.rem`,
        status: sql`excluded.status`,
        prodDateEnd: sql`excluded.prod_date_end`,
      },
    }).returning();

    const qty = orderData.qty;
    const done = orderData.done;
    const pct = qty > 0 ? done / qty : 0;

    const stagesToInsert = WOODEN_STAGES.map((s, i) => {
      const stageProgress = Math.max(0, Math.min(1, pct * WOODEN_STAGES.length - i));
      const qtyDone = Math.round(qty * Math.min(1, stageProgress));
      const status = stageProgress >= 1 ? "تم الانتهاء" : stageProgress > 0 ? "تحت التصنيع" : "لم يتم البدء";
      return { woodenOrderId: order.id, stageName: s.name, stageOrder: s.order, qtyDone: String(qtyDone), status };
    });
    await db.insert(woodenProductionStagesTable).values(stagesToInsert)
      .onConflictDoUpdate({
        target: [woodenProductionStagesTable.woodenOrderId, woodenProductionStagesTable.stageName],
        set: { qtyDone: sql`excluded.qty_done`, status: sql`excluded.status` },
      });
  }

  console.log(`Done! ${metalOrders.length} metal orders, ${woodenOrders.length} wooden orders seeded (Excel + Gem JSON where present).`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
