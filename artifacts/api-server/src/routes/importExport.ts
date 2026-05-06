import { Router } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";
import { db } from "@workspace/db";
import {
  metalWorkOrdersTable,
  metalProductionStagesTable,
  metalStageLogTable,
  woodenWorkOrdersTable,
  woodenProductionStagesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const METAL_STAGES = [
  { name: "الليزر", order: 1 },
  { name: "المقص", order: 2 },
  { name: "الكويل", order: 3 },
  { name: "البانش", order: 4 },
  { name: "مكابس و تكويع", order: 5 },
  { name: "المثقاب", order: 6 },
  { name: "التخليع", order: 7 },
  { name: "التنايات", order: 8 },
  { name: "لحام CO2", order: 9 },
  { name: "تجليخ", order: 10 },
  { name: "لحام بنطة", order: 11 },
  { name: "لحام نحاس", order: 12 },
  { name: "لحام أرجون استالنس", order: 13 },
  { name: "تشطيب استالنس", order: 14 },
  { name: "الدهان", order: 15 },
  { name: "التجميع", order: 16 },
  { name: "التسليم", order: 17 },
];

const WOODEN_STAGES = [
  { name: "القطع", order: 1 },
  { name: "التجميع", order: 2 },
  { name: "التشطيب", order: 3 },
  { name: "التغليف", order: 4 },
];

function stripVbc(val: unknown): string {
  if (!val) return "";
  return String(val).replace(/\bvbc\b/gi, "").replace(/\s+/g, " ").trim();
}

/** Normalize Arabic text for fuzzy matching: trim + unify hamza variants */
function normalizeArabic(s: string): string {
  return s.trim().replace(/[أإآ]/g, "ا");
}

/** Normalize wooden status: English/Arabic → Arabic */
function parseWoodenStatus(raw: string): string {
  const s = raw.toLowerCase().trim();
  if (!s) return "تحت التصنيع";
  if (s === "delivered" || s === "done") return "تم التسليم";
  if (s === "production") return "تحت التصنيع";
  if (s === "hold" || s === "cancel") return "متوقف";
  if (raw.includes("تم التسليم")) return "تم التسليم";
  if (raw.includes("تحت التصنيع")) return "تحت التصنيع";
  if (raw.includes("متوقف")) return "متوقف";
  if (raw.includes("لم يتم")) return "لم يتم البدء";
  return "تحت التصنيع";
}

/** Convert Excel date serial to ISO string */
function excelDateToStr(serial: unknown): string {
  const n = parseFloat(String(serial ?? ""));
  if (isNaN(n) || n <= 0) return "";
  const date = new Date(Math.round((n - 25569) * 86400 * 1000));
  return date.toISOString().split("T")[0];
}

function safeStr(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val).trim();
}

function safeNum(val: unknown): string {
  if (val === null || val === undefined) return "0";
  const n = parseFloat(String(val));
  return isNaN(n) ? "0" : String(n);
}

// ---- IMPORT: Metal work orders ----
// mode=merge (default): update existing rows on conflict | mode=replace: delete all then insert
router.post("/metal-orders", upload.single("file"), async (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }

  const mode = (req.query.mode as string) || "merge";

  try {
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = wb.SheetNames.find(s => s === "MO") || wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as unknown[][];

    let rowsImported = 0, rowsSkipped = 0;
    const errors: string[] = [];

    // replace mode: delete all existing metal orders (cascades to stages)
    if (mode === "replace") {
      await db.delete(metalWorkOrdersTable);
    }

    let headerRow = -1;
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i] as unknown[];
      if (row.some(c => String(c).toUpperCase().includes("MO"))) {
        headerRow = i;
        break;
      }
    }
    if (headerRow === -1) headerRow = 0;

    const headers = (data[headerRow] as unknown[]).map(h => safeStr(h).toLowerCase());

    for (let i = headerRow + 1; i < data.length; i++) {
      const row = data[i] as unknown[];
      const moNum = safeStr(row[headers.indexOf("mo")] || row[1]);
      const product = safeStr(row[headers.findIndex(h => h.includes("product"))] || row[3] || row[4]);

      if (!moNum || moNum === "mo" || moNum === "") { rowsSkipped++; continue; }

      const qtyIdx = headers.findIndex(h => h.includes("qty"));
      const clientIdx = headers.findIndex(h => h.includes("project") || h.includes("client"));

      const orderValues = {
        moNumber: moNum,
        project: safeStr(clientIdx >= 0 ? row[clientIdx] : row[4]),
        client: safeStr(clientIdx >= 0 ? row[clientIdx] : row[4]),
        product: product || safeStr(row[3]),
        qty: safeNum(qtyIdx >= 0 ? row[qtyIdx] : row[5]),
        unit: safeStr(row[6]),
        deliveredQty: "0",
        completionPct: "0",
        backlogQty: "0",
        status: "لم يتم البدء",
      };

      try {
        const [order] = await db.insert(metalWorkOrdersTable).values(orderValues)
          .onConflictDoUpdate({
            target: metalWorkOrdersTable.moNumber,
            set: { product: orderValues.product, qty: orderValues.qty, client: orderValues.client, project: orderValues.project, unit: orderValues.unit, updatedAt: new Date() },
          })
          .returning();

        if (order) {
          // Upsert stages — on conflict (order+stage unique) update qtyTarget; preserve qtyDone/status
          for (const s of METAL_STAGES) {
            await db.insert(metalProductionStagesTable).values({
              metalOrderId: order.id,
              moNumber: order.moNumber,
              stageName: s.name,
              stageOrder: s.order,
              qtyTarget: order.qty,
              qtyDone: "0",
              status: "لم يتم البدء",
            }).onConflictDoUpdate({
              target: [metalProductionStagesTable.metalOrderId, metalProductionStagesTable.stageName],
              set: { qtyTarget: order.qty, stageOrder: s.order },
            });
          }
          rowsImported++;
        } else {
          rowsSkipped++;
        }
      } catch (e) {
        errors.push(`Row ${i + 1}: ${String(e)}`);
        rowsSkipped++;
      }
    }

    res.json({ success: true, rowsImported, rowsSkipped, errors });
  } catch (err) {
    res.status(500).json({ success: false, rowsImported: 0, rowsSkipped: 0, errors: [String(err)] });
  }
});

// ---- IMPORT: Metal daily production (17 sheets = 17 stages) ----
router.post("/metal-daily", upload.single("file"), async (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }

  try {
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    let rowsImported = 0, rowsSkipped = 0;
    const errors: string[] = [];

    for (const sheetName of wb.SheetNames) {
      if (sheetName.startsWith("_xlnm") || sheetName === "Sheet1") continue;

      const ws = wb.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as unknown[][];
      if (data.length < 3) continue;

      // Row 0 = Arabic title, Row 1 = actual column headers, Row 2+ = data
      const headerRow = data[1] as unknown[];
      // Detect "موقف" (status) column and qtyDone column dynamically
      let statusColIdx = headerRow.findIndex((h, idx) => idx > 3 && String(h).includes("موقف"));
      const qtyDoneColIdx = statusColIdx >= 0 ? statusColIdx - 1 : 6;
      if (statusColIdx < 0) statusColIdx = -1;

      // Normalize sheet name for fuzzy stage matching
      const normalizedSheet = normalizeArabic(sheetName.trim());

      // Accumulate qty+status per MO across sub-assembly rows
      const moMap = new Map<string, { qty: number; status: string }>();
      for (let i = 2; i < data.length; i++) {
        const row = data[i] as unknown[];
        const moNum = safeStr(row[2]);
        if (!moNum || moNum === "M.O" || moNum === "") { rowsSkipped++; continue; }
        const qty = parseFloat(safeNum(row[qtyDoneColIdx]));
        const statusRaw = statusColIdx >= 0 ? safeStr(row[statusColIdx]) : "";
        if (moMap.has(moNum)) {
          const prev = moMap.get(moNum)!;
          moMap.set(moNum, { qty: prev.qty + qty, status: statusRaw || prev.status });
        } else {
          moMap.set(moNum, { qty, status: statusRaw });
        }
      }

      for (const [moNum, { qty, status }] of moMap) {
        const statusFinal = status || "تحت التصنيع";
        try {
          const [order] = await db
            .select()
            .from(metalWorkOrdersTable)
            .where(eq(metalWorkOrdersTable.moNumber, moNum));

          if (!order) { rowsSkipped++; continue; }

          const allStages = await db
            .select()
            .from(metalProductionStagesTable)
            .where(eq(metalProductionStagesTable.metalOrderId, order.id));

          // Match by normalized stage name (handles leading/trailing spaces and hamza)
          const matchedStage = allStages.find(s => normalizeArabic(s.stageName) === normalizedSheet);

          if (matchedStage) {
            await db
              .update(metalProductionStagesTable)
              .set({ qtyDone: String(qty), status: statusFinal, updatedAt: new Date() })
              .where(eq(metalProductionStagesTable.id, matchedStage.id));
            rowsImported++;
          } else {
            rowsSkipped++;
          }
        } catch (e) {
          errors.push(`Sheet ${sheetName} MO ${moNum}: ${String(e)}`);
          rowsSkipped++;
        }
      }
    }

    res.json({ success: true, rowsImported, rowsSkipped, errors });
  } catch (err) {
    res.status(500).json({ success: false, rowsImported: 0, rowsSkipped: 0, errors: [String(err)] });
  }
});

// ---- IMPORT: Wooden work orders ----
// mode=merge (default): update existing rows on conflict | mode=replace: delete all then insert
router.post("/wooden-orders", upload.single("file"), async (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }

  const mode = (req.query.mode as string) || "merge";

  try {
    if (mode === "replace") {
      await db.delete(woodenWorkOrdersTable);
    }

    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = wb.SheetNames.find(s => s === "Sheet4") || wb.SheetNames.find(s => s === "Sheet1") || wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as unknown[][];

    let rowsImported = 0, rowsSkipped = 0;
    const errors: string[] = [];

    let headerRow = -1;
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i] as unknown[];
      if (row.some(c => String(c).toLowerCase().includes("order"))) {
        headerRow = i;
        break;
      }
    }
    if (headerRow === -1) headerRow = 0;

    // Normalize headers: lowercase + trim (handles " QTY", " Rem" with leading spaces)
    const headers = (data[headerRow] as unknown[]).map(h => safeStr(h).toLowerCase().trim());

    // Detect all column indices by header name (works for both Sheet1 and Sheet4)
    const orderNoIdx = headers.indexOf("order");
    const dateIdx = headers.indexOf("date");
    const extensionIdx = headers.indexOf("extension");
    const projectIdx = Math.max(headers.indexOf("project"), headers.indexOf("client"));
    const subProjectIdx = headers.findIndex(h => h.startsWith("sub") && h.includes("project") || h === "sub-project");
    const productIdx = headers.findIndex(h => h === "product" || (h.includes("product") && !h.includes("sub")));
    const qtyIdx = headers.findIndex(h => h === "qty");
    const doneIdx = headers.findIndex(h => h === "done");
    const remIdx = headers.findIndex(h => h === "rem");
    const statusIdx = headers.indexOf("status");
    const notesIdx = headers.findIndex(h => h === "notes" || h === "ملاحظات");
    const prodDateEndIdx = headers.findIndex(h => h.includes("expected") || h.includes("finish"));
    const prodDateStartIdx = headers.findIndex(h => h.includes("production date") && !h.includes("end") && !h.includes("finish"));
    const categoryIdx = headers.indexOf("category");
    const uomIdx = headers.indexOf("uom");
    const sapIdx = headers.findIndex(h => h.includes("sap"));

    for (let i = headerRow + 1; i < data.length; i++) {
      const row = data[i] as unknown[];
      const orderNo = safeStr(orderNoIdx >= 0 ? row[orderNoIdx] : row[0]);
      if (!orderNo || orderNo === "order" || orderNo === "") { rowsSkipped++; continue; }

      const extension = stripVbc(safeStr(extensionIdx >= 0 ? row[extensionIdx] : ""));
      const product = safeStr(productIdx >= 0 ? row[productIdx] : "");
      if (!product) { rowsSkipped++; continue; }

      const rawStatus = safeStr(statusIdx >= 0 ? row[statusIdx] : "");
      const rawDate = dateIdx >= 0 ? row[dateIdx] : null;

      const woodenValues = {
          orderNo,
          extension,
          // orderDate: if the raw value is an Excel serial number convert it, otherwise use as string
          orderDate: rawDate ? excelDateToStr(rawDate) || safeStr(rawDate) : "",
          manufactureRequest: "",
          sapCode: safeStr(sapIdx >= 0 ? row[sapIdx] : ""),
          client: safeStr(projectIdx >= 0 ? row[projectIdx] : "") || safeStr(subProjectIdx >= 0 ? row[subProjectIdx] : ""),
          subProject: safeStr(subProjectIdx >= 0 ? row[subProjectIdx] : ""),
          product,
          category: safeStr(categoryIdx >= 0 ? row[categoryIdx] : ""),
          uom: safeStr(uomIdx >= 0 ? row[uomIdx] : ""),
          qty: safeNum(qtyIdx >= 0 ? row[qtyIdx] : 0),
          done: safeNum(doneIdx >= 0 ? row[doneIdx] : 0),
          rem: safeNum(remIdx >= 0 ? row[remIdx] : 0),
          status: parseWoodenStatus(rawStatus),
          prodDateStart: prodDateStartIdx >= 0 ? excelDateToStr(row[prodDateStartIdx]) : "",
          prodDateEnd: prodDateEndIdx >= 0 ? excelDateToStr(row[prodDateEndIdx]) : "",
          prodDateFinished: "",
        };

      try {
        const [order] = await db.insert(woodenWorkOrdersTable).values(woodenValues)
          .onConflictDoUpdate({
            target: woodenWorkOrdersTable.orderNo,
            set: { product: woodenValues.product, qty: woodenValues.qty, done: woodenValues.done, rem: woodenValues.rem, client: woodenValues.client, subProject: woodenValues.subProject, status: woodenValues.status, updatedAt: new Date() },
          })
          .returning();

        if (order) {
          // Upsert stages — on conflict (order+stage unique) update stageOrder; preserve qtyDone/status
          for (const s of WOODEN_STAGES) {
            await db.insert(woodenProductionStagesTable).values({
              woodenOrderId: order.id,
              stageName: s.name,
              stageOrder: s.order,
              qtyDone: "0",
              status: "لم يتم البدء",
            }).onConflictDoUpdate({
              target: [woodenProductionStagesTable.woodenOrderId, woodenProductionStagesTable.stageName],
              set: { stageOrder: s.order },
            });
          }
          rowsImported++;
        } else {
          rowsSkipped++;
        }
      } catch (e) {
        errors.push(`Row ${i + 1}: ${String(e)}`);
        rowsSkipped++;
      }
    }

    res.json({ success: true, rowsImported, rowsSkipped, errors });
  } catch (err) {
    res.status(500).json({ success: false, rowsImported: 0, rowsSkipped: 0, errors: [String(err)] });
  }
});

// ---- IMPORT: Full Ebdaa Sheets template (auto column mapping + duplicate detection) ----
//
// Accepts the official `Ebdaa-Sheets-Template.xlsx` directly. Reads sheets:
//   - "أوامر معدني"  → metal_work_orders + metal_production_stages
//   - "أوامر خشبي"  → wooden_work_orders + wooden_production_stages
//
// Column mapping uses ROW INDEX 1 (English DB keys: mo_number, project, qty, laser, ...)
// produced by the template, so it stays stable even if the Arabic header text changes.
// Duplicate MO# / Order No are detected against existing DB rows AND skipped (flagged in
// `duplicates`) so staff can review without overwriting in-flight production data.

const METAL_STAGE_KEY_TO_NAME: Record<string, string> = {
  laser: "الليزر",
  shear: "المقص",
  coil: "الكويل",
  punch: "البانش",
  press_form: "مكابس و تكويع",
  drill: "المثقاب",
  stripping: "التخليع",
  bending: "التنايات",
  co2_weld: "لحام CO2",
  polishing: "تجليخ",
  patch_weld: "لحام بنطة",
  brass_weld: "لحام نحاس",
  argon_weld: "لحام أرجون استالنس",
  stainless_finish: "تشطيب استالنس",
  painting: "الدهان",
  assembly: "التجميع",
  delivery: "التسليم",
};

type SectionResult = {
  sheetFound: boolean;
  rowsImported: number;
  rowsSkipped: number;
  duplicates: string[];
  errors: string[];
};

function emptySection(): SectionResult {
  return { sheetFound: false, rowsImported: 0, rowsSkipped: 0, duplicates: [], errors: [] };
}

/** Build a header → column index map from the template's row 1 (English DB keys). */
function buildKeyMap(headerRow: unknown[]): Map<string, number> {
  const map = new Map<string, number>();
  headerRow.forEach((cell, idx) => {
    // strip "(derived)" / "(optional)" suffixes the template adds
    const key = safeStr(cell).toLowerCase().replace(/\s*\(.*?\)\s*/g, "").trim();
    if (key) map.set(key, idx);
  });
  return map;
}

async function importMetalSection(rows: unknown[][]): Promise<SectionResult> {
  const result = emptySection();
  result.sheetFound = true;
  if (rows.length < 3) return result;

  const keyMap = buildKeyMap(rows[1]);
  const get = (row: unknown[], key: string) => {
    const idx = keyMap.get(key);
    return idx === undefined ? "" : safeStr(row[idx]);
  };

  // pre-fetch existing MO numbers for duplicate detection
  const existing = await db.select({ moNumber: metalWorkOrdersTable.moNumber }).from(metalWorkOrdersTable);
  const existingSet = new Set(existing.map(e => e.moNumber));

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    const moNumber = get(row, "mo_number");
    if (!moNumber) { result.rowsSkipped++; continue; }

    if (existingSet.has(moNumber)) {
      result.duplicates.push(moNumber);
      result.rowsSkipped++;
      continue;
    }

    try {
      const qty = safeNum(get(row, "qty"));
      const [order] = await db.insert(metalWorkOrdersTable).values({
        moNumber,
        project: get(row, "project"),
        client: get(row, "client"),
        product: get(row, "product") || moNumber,
        qty,
        unit: get(row, "unit"),
        deliveredQty: safeNum(get(row, "delivered_qty")),
        completionPct: safeNum(get(row, "completion_pct")),
        backlogQty: safeNum(get(row, "backlog_qty")),
        backlogStatus: get(row, "backlog_status"),
        notes: get(row, "notes"),
        status: get(row, "status") || "لم يتم البدء",
        factory: get(row, "factory") || "metal",
      }).returning();

      if (!order) { result.rowsSkipped++; continue; }
      existingSet.add(moNumber);

      // Insert all 17 stages, populating qtyDone from the inline per-stage columns
      for (const s of METAL_STAGES) {
        const tplKey = Object.entries(METAL_STAGE_KEY_TO_NAME).find(([, n]) => n === s.name)?.[0];
        const qtyDone = tplKey ? safeNum(get(row, tplKey)) : "0";
        const qtyDoneNum = parseFloat(qtyDone);
        const qtyTargetNum = parseFloat(qty);
        const stageStatus = qtyDoneNum <= 0
          ? "لم يتم البدء"
          : qtyDoneNum >= qtyTargetNum && qtyTargetNum > 0
            ? "مكتمل"
            : "تحت التصنيع";
        await db.insert(metalProductionStagesTable).values({
          metalOrderId: order.id,
          moNumber: order.moNumber,
          stageName: s.name,
          stageOrder: s.order,
          qtyTarget: qty,
          qtyDone,
          status: stageStatus,
        }).onConflictDoUpdate({
          target: [metalProductionStagesTable.metalOrderId, metalProductionStagesTable.stageName],
          set: { qtyTarget: qty, qtyDone, status: stageStatus, stageOrder: s.order, updatedAt: new Date() },
        });
      }
      result.rowsImported++;
    } catch (e) {
      result.errors.push(`Metal row ${i + 1} (${moNumber}): ${String(e)}`);
      result.rowsSkipped++;
    }
  }
  return result;
}

async function importWoodenSection(rows: unknown[][]): Promise<SectionResult> {
  const result = emptySection();
  result.sheetFound = true;
  if (rows.length < 3) return result;

  const keyMap = buildKeyMap(rows[1]);
  const get = (row: unknown[], key: string) => {
    const idx = keyMap.get(key);
    return idx === undefined ? "" : safeStr(row[idx]);
  };
  // Date getter: if the cell is a numeric Excel serial, convert to ISO; otherwise pass through trimmed string.
  const getDate = (row: unknown[], key: string) => {
    const idx = keyMap.get(key);
    if (idx === undefined) return "";
    const raw = row[idx];
    if (raw === null || raw === undefined || raw === "") return "";
    const iso = excelDateToStr(raw);
    return iso || safeStr(raw);
  };

  const existing = await db.select({ orderNo: woodenWorkOrdersTable.orderNo }).from(woodenWorkOrdersTable);
  const existingSet = new Set(existing.map(e => e.orderNo));

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    const orderNo = get(row, "order_no");
    if (!orderNo) { result.rowsSkipped++; continue; }

    if (existingSet.has(orderNo)) {
      result.duplicates.push(orderNo);
      result.rowsSkipped++;
      continue;
    }

    try {
      const product = get(row, "product");
      if (!product) { result.rowsSkipped++; continue; }

      const [order] = await db.insert(woodenWorkOrdersTable).values({
        orderNo,
        extension: stripVbc(get(row, "extension")),
        orderDate: getDate(row, "order_date"),
        manufactureRequest: get(row, "manufacture_request"),
        sapCode: get(row, "sap_code"),
        client: get(row, "client"),
        subProject: get(row, "sub_project"),
        product,
        category: get(row, "category"),
        uom: get(row, "uom"),
        qty: safeNum(get(row, "qty")),
        done: safeNum(get(row, "done")),
        rem: safeNum(get(row, "rem")),
        status: parseWoodenStatus(get(row, "status")),
        prodDateStart: getDate(row, "prod_date_start"),
        prodDateEnd: getDate(row, "prod_date_end"),
        prodDateFinished: getDate(row, "prod_date_finished"),
      }).returning();

      if (!order) { result.rowsSkipped++; continue; }
      existingSet.add(orderNo);

      for (const s of WOODEN_STAGES) {
        await db.insert(woodenProductionStagesTable).values({
          woodenOrderId: order.id,
          stageName: s.name,
          stageOrder: s.order,
          qtyDone: "0",
          status: "لم يتم البدء",
        }).onConflictDoUpdate({
          target: [woodenProductionStagesTable.woodenOrderId, woodenProductionStagesTable.stageName],
          set: { stageOrder: s.order },
        });
      }
      result.rowsImported++;
    } catch (e) {
      result.errors.push(`Wooden row ${i + 1} (${orderNo}): ${String(e)}`);
      result.rowsSkipped++;
    }
  }
  return result;
}

type StageLogResult = {
  sheetFound: boolean;
  rowsImported: number;
  rowsSkipped: number;
  errors: string[];
};

function emptyStageLog(): StageLogResult {
  return { sheetFound: false, rowsImported: 0, rowsSkipped: 0, errors: [] };
}

/** Strip leading "ال" + normalize hamza for fuzzy stage-name matching */
function canonicalStageKey(s: string): string {
  return normalizeArabic(s).replace(/^ال/, "").trim().toLowerCase();
}

/** Map an English stage token (e.g. "Laser") to the canonical Arabic stage name. */
const ENGLISH_STAGE_TO_AR: Record<string, string> = {
  laser: "الليزر",
  shear: "المقص",
  coil: "الكويل",
  punch: "البانش",
  "press_form": "مكابس و تكويع",
  "press form": "مكابس و تكويع",
  press: "مكابس و تكويع",
  drill: "المثقاب",
  stripping: "التخليع",
  bending: "التنايات",
  "co2_weld": "لحام CO2",
  "co2 weld": "لحام CO2",
  co2: "لحام CO2",
  polishing: "تجليخ",
  "patch_weld": "لحام بنطة",
  "patch weld": "لحام بنطة",
  "brass_weld": "لحام نحاس",
  "brass weld": "لحام نحاس",
  "argon_weld": "لحام أرجون استالنس",
  "argon weld": "لحام أرجون استالنس",
  argon: "لحام أرجون استالنس",
  "stainless_finish": "تشطيب استالنس",
  "stainless finish": "تشطيب استالنس",
  stainless: "تشطيب استالنس",
  painting: "الدهان",
  assembly: "التجميع",
  delivery: "التسليم",
};

/**
 * Resolve a raw stage cell ("ليزر / Laser", "Punch", "البانش") to the
 * canonical Arabic stage name used by metal_production_stages.
 * Returns null if no match is found.
 */
function resolveStageName(raw: string): string | null {
  if (!raw) return null;
  const parts = raw.split("/").map(p => p.trim()).filter(Boolean);
  // 1) try Arabic side(s) — match against METAL_STAGES by canonical key
  for (const part of parts) {
    const key = canonicalStageKey(part);
    const hit = METAL_STAGES.find(s => canonicalStageKey(s.name) === key);
    if (hit) return hit.name;
  }
  // 2) try English side(s) via lookup map
  for (const part of parts) {
    const en = part.toLowerCase().trim();
    if (ENGLISH_STAGE_TO_AR[en]) return ENGLISH_STAGE_TO_AR[en];
  }
  return null;
}

async function importStageLogSection(rows: unknown[][]): Promise<StageLogResult> {
  const result = emptyStageLog();
  result.sheetFound = true;
  if (rows.length < 3) return result;

  const keyMap = buildKeyMap(rows[1]);
  const get = (row: unknown[], key: string) => {
    const idx = keyMap.get(key);
    return idx === undefined ? "" : safeStr(row[idx]);
  };
  const getRaw = (row: unknown[], key: string): unknown => {
    const idx = keyMap.get(key);
    return idx === undefined ? "" : row[idx];
  };

  // Cache MO# → metal_order_id lookups so we don't re-query for repeated MOs
  const orderIdCache = new Map<string, number | null>();

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    const moNumber = get(row, "mo_number");
    if (!moNumber) { result.rowsSkipped++; continue; }

    const stageRaw = get(row, "stage_name");
    const stageName = resolveStageName(stageRaw);
    if (!stageName) {
      result.rowsSkipped++;
      result.errors.push(`Row ${i + 1}: unknown stage "${stageRaw}"`);
      continue;
    }

    // Date may be an Excel serial number OR a yyyy-mm-dd string. Only treat as
    // a serial when it's actually numeric — a string like "2025-01-15" must not
    // be parseFloat'd into 2025 (which would map to 1905-07-17).
    const rawDate = getRaw(row, "date");
    let isoDate = "";
    if (typeof rawDate === "number") {
      isoDate = excelDateToStr(rawDate);
    } else if (rawDate) {
      isoDate = safeStr(rawDate);
    }
    if (!isoDate) { result.rowsSkipped++; continue; }

    try {
      let orderId = orderIdCache.get(moNumber);
      if (orderId === undefined) {
        const [order] = await db
          .select({ id: metalWorkOrdersTable.id })
          .from(metalWorkOrdersTable)
          .where(eq(metalWorkOrdersTable.moNumber, moNumber));
        orderId = order ? order.id : null;
        orderIdCache.set(moNumber, orderId);
      }
      if (orderId === null) { result.rowsSkipped++; continue; }

      await db.insert(metalStageLogTable).values({
        metalOrderId: orderId,
        moNumber,
        logDate: isoDate,
        stageName,
        inputQty: safeNum(get(row, "input_qty")),
        outputQty: safeNum(get(row, "output_qty")),
        wasteQty: safeNum(get(row, "waste_qty")),
        operator: get(row, "operator"),
        notes: get(row, "notes"),
      }).onConflictDoUpdate({
        target: [metalStageLogTable.metalOrderId, metalStageLogTable.logDate, metalStageLogTable.stageName],
        set: {
          inputQty: safeNum(get(row, "input_qty")),
          outputQty: safeNum(get(row, "output_qty")),
          wasteQty: safeNum(get(row, "waste_qty")),
          operator: get(row, "operator"),
          notes: get(row, "notes"),
          updatedAt: new Date(),
        },
      });
      result.rowsImported++;
    } catch (e) {
      result.errors.push(`Stage log row ${i + 1} (${moNumber}): ${String(e)}`);
      result.rowsSkipped++;
    }
  }
  return result;
}

router.post("/sheets-template", upload.single("file"), async (req, res) => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
  try {
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const metalSheet = wb.SheetNames.find(s => s.includes("معدني"));
    const woodenSheet = wb.SheetNames.find(s => s.includes("خشبي"));
    const stageLogSheet = wb.SheetNames.find(s => s.includes("متابعة"));

    const metal = metalSheet
      ? await importMetalSection(XLSX.utils.sheet_to_json(wb.Sheets[metalSheet], { header: 1, defval: "" }) as unknown[][])
      : emptySection();
    const wooden = woodenSheet
      ? await importWoodenSection(XLSX.utils.sheet_to_json(wb.Sheets[woodenSheet], { header: 1, defval: "" }) as unknown[][])
      : emptySection();
    // stage log import runs after metal so MO IDs exist for first-time imports
    const stageLog = stageLogSheet
      ? await importStageLogSection(XLSX.utils.sheet_to_json(wb.Sheets[stageLogSheet], { header: 1, defval: "" }) as unknown[][])
      : emptyStageLog();

    const errors: string[] = [];
    if (!metalSheet) errors.push('Sheet "أوامر معدني" not found in workbook');
    if (!woodenSheet) errors.push('Sheet "أوامر خشبي" not found in workbook');
    if (!stageLogSheet) errors.push('Sheet "متابعة المراحل" not found in workbook');

    res.json({
      success: errors.length === 0 || metal.rowsImported > 0 || wooden.rowsImported > 0 || stageLog.rowsImported > 0,
      metal,
      wooden,
      stageLog,
      errors,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      metal: emptySection(),
      wooden: emptySection(),
      stageLog: emptyStageLog(),
      errors: [String(err)],
    });
  }
});

// ---- Helper: Build PDF buffer using pdfkit with DejaVu font (Unicode-capable) ----
function buildPdf(title: string, headers: string[], rows: string[][]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const DEJAVU = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
      const DEJAVU_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

      const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 40 });
      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageWidth = doc.page.width;
      const margin = 40;
      const colWidth = Math.floor((pageWidth - margin * 2) / headers.length);
      const lineH = 18;

      // Title
      doc.font(DEJAVU_BOLD).fontSize(13).fillColor("#000000")
        .text(title, margin, 40, { width: pageWidth - margin * 2, lineBreak: false });

      // Date
      doc.font(DEJAVU).fontSize(8).fillColor("#666666")
        .text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, margin, 58);

      let y = 76;

      // Header row background
      doc.rect(margin, y - 2, pageWidth - margin * 2, lineH).fill("#222222");

      // Header cells (English labels)
      headers.forEach((h, i) => {
        doc.font(DEJAVU_BOLD).fontSize(8).fillColor("#FFD700")
          .text(h.substring(0, 14), margin + i * colWidth + 3, y, { width: colWidth - 4, lineBreak: false });
      });
      y += lineH + 4;

      // Data rows — Arabic text preserved using DejaVu (partial coverage)
      for (const [rowIdx, row] of rows.entries()) {
        if (y > doc.page.height - margin - lineH) {
          doc.addPage({ size: "A4", layout: "landscape", margin: 40 });
          y = 40;
        }
        if (rowIdx % 2 === 0) {
          doc.rect(margin, y - 2, pageWidth - margin * 2, lineH).fill("#f0f0f0");
        }
        row.forEach((cell, i) => {
          const text = (cell || "-").substring(0, 30);
          doc.font(DEJAVU).fontSize(7).fillColor("#111111")
            .text(text, margin + i * colWidth + 3, y, { width: colWidth - 4, lineBreak: false });
        });
        y += lineH;
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// ---- EXPORT: Metal orders ----
// xlsx format mirrors the Sheets template "أوامر معدني" sheet exactly:
//   row 0 = Arabic headers, row 1 = English DB keys, rows 2+ = data
// Includes all 17 stage columns (qtyDone per stage joined from metal_production_stages).
const METAL_EXPORT_AR_HEADERS = [
  "رقم MOM","المشروع","العميل","المنتج","الكمية","الوحدة",
  "ليزر","بانش","تخليع","تجليخ","لحام أرجون","لحام بنطة","لحام نحاس","لحام CO₂",
  "التنايات","مكابس وتكويع","المثقاب","المقص","الكويل","التجميع","تشطيب إستانلس","الدهان","التسليم",
  "نسبة الإنجاز %","متأخرات","حالة المتأخرات","الحالة","ملاحظات","الكمية المسلّمة","المصنع","تاريخ التسليم المتوقع",
];
const METAL_EXPORT_KEYS = [
  "mo_number","project","client","product","qty","unit",
  "laser","punch","stripping","polishing","argon_weld","patch_weld","brass_weld","co2_weld",
  "bending","press_form","drill","shear","coil","assembly","stainless_finish","painting","delivery",
  "completion_pct(derived)","backlog_qty(derived)","backlog_status","status","notes","delivered_qty","factory","expected_delivery_date(optional)",
];
// Order of stage keys in the export, matched to METAL_STAGE_KEY_TO_NAME.
const METAL_EXPORT_STAGE_KEYS = [
  "laser","punch","stripping","polishing","argon_weld","patch_weld","brass_weld","co2_weld",
  "bending","press_form","drill","shear","coil","assembly","stainless_finish","painting","delivery",
];

router.get("/metal-orders", async (req, res) => {
  try {
    const format = String(req.query.format || "xlsx");
    const orders = await db.select().from(metalWorkOrdersTable).orderBy(metalWorkOrdersTable.id);

    if (format === "xlsx") {
      // Fetch all stages once, then group by metalOrderId
      const allStages = await db.select().from(metalProductionStagesTable);
      const stagesByOrder = new Map<number, Map<string, string>>();
      for (const s of allStages) {
        if (!stagesByOrder.has(s.metalOrderId)) stagesByOrder.set(s.metalOrderId, new Map());
        stagesByOrder.get(s.metalOrderId)!.set(s.stageName, String(s.qtyDone ?? "0"));
      }

      const wsData: unknown[][] = [METAL_EXPORT_AR_HEADERS, METAL_EXPORT_KEYS];
      for (const o of orders) {
        const stageQty = stagesByOrder.get(o.id) || new Map<string, string>();
        const stageCells = METAL_EXPORT_STAGE_KEYS.map(k => stageQty.get(METAL_STAGE_KEY_TO_NAME[k]) ?? "0");
        wsData.push([
          o.moNumber, o.project || "", o.client || "", o.product, o.qty, o.unit || "",
          ...stageCells,
          o.completionPct || "0", o.backlogQty || "0", o.backlogStatus || "",
          o.status || "", o.notes || "", o.deliveredQty || "0", o.factory || "metal", "",
        ]);
      }
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wsData), "أوامر معدني");
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="metal-orders.xlsx"`);
      res.send(buf); return;
    }

    // PDF export
    const pdfBytes = await buildPdf(
      "Ebdaa Factory Management - Metal Work Orders",
      ["MO#", "Client", "Product", "Qty", "Delivered", "Completion%", "Status"],
      orders.map(o => [o.moNumber, o.client || "", o.product, o.qty, o.deliveredQty || "0", `${o.completionPct || 0}%`, o.status || ""])
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="metal-orders.pdf"`);
    res.send(pdfBytes);
  } catch (err) {
    res.status(500).json({ error: "Export failed" });
  }
});

// ---- EXPORT: Wooden orders ----
// xlsx format mirrors the Sheets template "أوامر خشبي" sheet exactly:
//   row 0 = Arabic headers, row 1 = English DB keys, rows 2+ = data
// Includes all production date fields (start, end, finished).
const WOODEN_EXPORT_AR_HEADERS = [
  "رقم الأمر","الامتداد (بعد تنظيف VBC)","تاريخ الأمر","طلب التصنيع","كود SAP",
  "العميل","المشروع الفرعي","المنتج","الفئة","وحدة القياس",
  "الكمية","المنجز","المتبقي","نسبة الإنجاز %","الحالة",
  "تاريخ بدء الإنتاج","تاريخ انتهاء الإنتاج","تاريخ الانتهاء الفعلي",
];
const WOODEN_EXPORT_KEYS = [
  "order_no","extension","order_date","manufacture_request","sap_code",
  "client","sub_project","product","category","uom",
  "qty","done","rem(derived)","completion_pct(derived)","status",
  "prod_date_start","prod_date_end","prod_date_finished",
];

router.get("/wooden-orders", async (req, res) => {
  try {
    const format = String(req.query.format || "xlsx");
    const orders = await db.select().from(woodenWorkOrdersTable).orderBy(woodenWorkOrdersTable.id);

    if (format === "xlsx") {
      const wsData: unknown[][] = [WOODEN_EXPORT_AR_HEADERS, WOODEN_EXPORT_KEYS];
      for (const o of orders) {
        const qtyN = parseFloat(String(o.qty ?? 0));
        const doneN = parseFloat(String(o.done ?? 0));
        const pct = qtyN > 0 ? Math.round((doneN / qtyN) * 100) : 0;
        wsData.push([
          o.orderNo, o.extension || "", o.orderDate || "", o.manufactureRequest || "", o.sapCode || "",
          o.client || "", o.subProject || "", o.product, o.category || "", o.uom || "",
          o.qty, o.done || "0", o.rem || "0", pct, o.status || "",
          o.prodDateStart || "", o.prodDateEnd || "", o.prodDateFinished || "",
        ]);
      }
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wsData), "أوامر خشبي");
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="wooden-orders.xlsx"`);
      res.send(buf); return;
    }

    // PDF export
    const pdfBytes = await buildPdf(
      "Ebdaa Factory Management - Wooden Work Orders",
      ["Order No", "Client", "Product", "Qty", "Done", "Rem", "Status"],
      orders.map(o => [o.orderNo, o.client || "", o.product, o.qty, o.done || "0", o.rem || "0", o.status || ""])
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="wooden-orders.pdf"`);
    res.send(pdfBytes);
  } catch (err) {
    res.status(500).json({ error: "Export failed" });
  }
});

export default router;
