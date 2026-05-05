import { Router } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";
import { db } from "@workspace/db";
import {
  metalWorkOrdersTable,
  metalProductionStagesTable,
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
router.get("/metal-orders", async (req, res) => {
  try {
    const format = String(req.query.format || "xlsx");
    const orders = await db.select().from(metalWorkOrdersTable).orderBy(metalWorkOrdersTable.id);

    if (format === "xlsx") {
      const wsData = [
        ["رقم MO", "المشروع", "العميل", "المنتج", "الكمية", "الوحدة", "المُسلَّم", "نسبة الإنجاز%", "المتأخرات", "الحالة"],
        ...orders.map(o => [o.moNumber, o.project || "", o.client || "", o.product, o.qty, o.unit || "", o.deliveredQty || "0", o.completionPct || "0", o.backlogQty || "0", o.status || ""]),
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wsData), "Metal Orders");
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
router.get("/wooden-orders", async (req, res) => {
  try {
    const format = String(req.query.format || "xlsx");
    const orders = await db.select().from(woodenWorkOrdersTable).orderBy(woodenWorkOrdersTable.id);

    if (format === "xlsx") {
      const wsData = [
        ["Order No", "Extension", "Client", "Sub-Project", "Product", "Category", "Qty", "Done", "Rem", "Status"],
        ...orders.map(o => [o.orderNo, o.extension || "", o.client || "", o.subProject || "", o.product, o.category || "", o.qty, o.done || "0", o.rem || "0", o.status || ""]),
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wsData), "Wooden Orders");
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
