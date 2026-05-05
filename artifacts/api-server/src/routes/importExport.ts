import { Router } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { db } from "@workspace/db";
import {
  metalWorkOrdersTable,
  metalProductionStagesTable,
  woodenWorkOrdersTable,
  woodenProductionStagesTable,
} from "@workspace/db";

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

function safeStr(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val).trim();
}

function safeNum(val: unknown): string {
  if (val === null || val === undefined) return "0";
  const n = parseFloat(String(val));
  return isNaN(n) ? "0" : String(n);
}

// Import metal orders
router.post("/metal-orders", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = wb.SheetNames.find(s => s === "MO") || wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as unknown[][];

    let rowsImported = 0;
    let rowsSkipped = 0;
    const errors: string[] = [];

    // Find header row (look for "MO" or similar)
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

      try {
        const [order] = await db.insert(metalWorkOrdersTable).values({
          moNumber: moNum,
          project: safeStr(row[0]),
          client: safeStr(row[clientIdx] || row[0]),
          product: product || safeStr(row[3]),
          qty: safeNum(qtyIdx >= 0 ? row[qtyIdx] : row[5]),
          unit: safeStr(row[6]),
          deliveredQty: "0",
          completionPct: "0",
          backlogQty: "0",
          status: "لم يتم البدء",
        }).onConflictDoNothing().returning();

        if (order) {
          const stagesToInsert = METAL_STAGES.map(s => ({
            metalOrderId: order.id,
            moNumber: order.moNumber,
            stageName: s.name,
            stageOrder: s.order,
            qtyTarget: order.qty,
            qtyDone: "0",
            status: "لم يتم البدء",
          }));
          await db.insert(metalProductionStagesTable).values(stagesToInsert).onConflictDoNothing();
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

// Import metal daily production
router.post("/metal-daily", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    let rowsImported = 0;
    let rowsSkipped = 0;
    const errors: string[] = [];

    // Each sheet is a production stage
    for (const sheetName of wb.SheetNames) {
      if (sheetName.startsWith("_xlnm") || sheetName === "Sheet1") continue;

      const ws = wb.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as unknown[][];

      for (let i = 1; i < data.length; i++) {
        const row = data[i] as unknown[];
        const moNum = safeStr(row[0]);
        if (!moNum || moNum === "M.O" || moNum === "") { rowsSkipped++; continue; }

        const qtyDone = safeNum(row[1]);
        const statusRaw = safeStr(row[row.length - 1]);

        // Find the stage in the database
        const stageOrder = METAL_STAGES.findIndex(s => s.name === sheetName) + 1 || 1;

        try {
          // Find orders with this MO number
          const orders = await db.select().from(metalWorkOrdersTable);
          const order = orders.find(o => o.moNumber === moNum);

          if (order) {
            const stages = await db.select().from(metalProductionStagesTable);
            const stage = stages.find(s => s.metalOrderId === order.id && s.stageName === sheetName);

            if (stage) {
              await db.update(metalProductionStagesTable)
                .set({ qtyDone, status: statusRaw || "تحت التصنيع", updatedAt: new Date() })
                .where(stage.id === stage.id ? (r => true) : (r => false));
              rowsImported++;
            } else {
              rowsSkipped++;
            }
          } else {
            rowsSkipped++;
          }
        } catch (e) {
          errors.push(`Sheet ${sheetName} Row ${i + 1}: ${String(e)}`);
          rowsSkipped++;
        }
      }
    }

    res.json({ success: true, rowsImported, rowsSkipped, errors });
  } catch (err) {
    res.status(500).json({ success: false, rowsImported: 0, rowsSkipped: 0, errors: [String(err)] });
  }
});

// Import wooden orders
router.post("/wooden-orders", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    // Try Sheet1 first, then first sheet
    const sheetName = wb.SheetNames.find(s => s === "Sheet1") || wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as unknown[][];

    let rowsImported = 0;
    let rowsSkipped = 0;
    const errors: string[] = [];

    // Find header row
    let headerRow = -1;
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i] as unknown[];
      if (row.some(c => String(c).toLowerCase().includes("order"))) {
        headerRow = i;
        break;
      }
    }
    if (headerRow === -1) headerRow = 0;

    const headers = (data[headerRow] as unknown[]).map(h => safeStr(h).toLowerCase());

    for (let i = headerRow + 1; i < data.length; i++) {
      const row = data[i] as unknown[];
      const orderNo = safeStr(row[headers.indexOf("order")] || row[0]);
      if (!orderNo || orderNo === "order" || orderNo === "") { rowsSkipped++; continue; }

      const extension = stripVbc(safeStr(row[headers.indexOf("extension")] || row[1]));
      const product = safeStr(row[headers.findIndex(h => h.includes("product"))] || row[7]);
      if (!product) { rowsSkipped++; continue; }

      const qtyIdx = headers.findIndex(h => h === "qty");
      const doneIdx = headers.findIndex(h => h === "done");
      const remIdx = headers.findIndex(h => h === "rem");
      const statusIdx = headers.findIndex(h => h === "status");
      const clientIdx = headers.findIndex(h => h === "client");
      const categoryIdx = headers.findIndex(h => h === "category");
      const uomIdx = headers.findIndex(h => h === "uom");

      try {
        const [order] = await db.insert(woodenWorkOrdersTable).values({
          orderNo,
          extension,
          orderDate: safeStr(row[2]),
          manufactureRequest: safeStr(row[3]),
          sapCode: safeStr(row[4]),
          client: safeStr(clientIdx >= 0 ? row[clientIdx] : row[5]),
          subProject: safeStr(row[6]),
          product,
          category: safeStr(categoryIdx >= 0 ? row[categoryIdx] : row[8]),
          uom: safeStr(uomIdx >= 0 ? row[uomIdx] : row[9]),
          qty: safeNum(qtyIdx >= 0 ? row[qtyIdx] : row[10]),
          done: safeNum(doneIdx >= 0 ? row[doneIdx] : row[11]),
          rem: safeNum(remIdx >= 0 ? row[remIdx] : row[12]),
          status: safeStr(statusIdx >= 0 ? row[statusIdx] : "Production"),
          prodDateStart: safeStr(row[14]),
          prodDateEnd: safeStr(row[15]),
          prodDateFinished: safeStr(row[16]),
        }).onConflictDoNothing().returning();

        if (order) {
          const stagesToInsert = WOODEN_STAGES.map(s => ({
            woodenOrderId: order.id,
            stageName: s.name,
            stageOrder: s.order,
            qtyDone: "0",
            status: "لم يتم البدء",
          }));
          await db.insert(woodenProductionStagesTable).values(stagesToInsert).onConflictDoNothing();
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

// Export metal orders as XLSX
router.get("/metal-orders", async (req, res) => {
  try {
    const format = String(req.query.format || "xlsx");
    const orders = await db.select().from(metalWorkOrdersTable).orderBy(metalWorkOrdersTable.id);

    if (format === "xlsx") {
      const wsData = [
        ["رقم MO", "المشروع", "العميل", "المنتج", "الكمية", "الوحدة", "المُسلَّم", "نسبة الإنجاز%", "المتأخرات", "حالة المتأخرات", "ملاحظات", "الحالة"],
        ...orders.map(o => [o.moNumber, o.project, o.client, o.product, o.qty, o.unit, o.deliveredQty, o.completionPct, o.backlogQty, o.backlogStatus, o.notes, o.status]),
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, "أوامر المصنع المعدني");
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="metal-orders.xlsx"`);
      res.send(buf);
    } else {
      // PDF: simple HTML-based approach using text
      const rows = orders.map(o =>
        `${o.moNumber} | ${o.client || ""} | ${o.product} | الكمية: ${o.qty} | ${o.status || ""}`
      ).join("\n");
      const content = `أوامر المصنع المعدني - إبداع للأثاث\n${"=".repeat(60)}\n\n${rows}`;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="metal-orders.txt"`);
      res.send(content);
    }
  } catch (err) {
    res.status(500).json({ error: "Export failed" });
  }
});

// Export wooden orders as XLSX
router.get("/wooden-orders", async (req, res) => {
  try {
    const format = String(req.query.format || "xlsx");
    const orders = await db.select().from(woodenWorkOrdersTable).orderBy(woodenWorkOrdersTable.id);

    if (format === "xlsx") {
      const wsData = [
        ["رقم الأمر", "المبنى", "التاريخ", "طلب التصنيع", "SAP Code", "العميل", "المشروع الفرعي", "المنتج", "الفئة", "الوحدة", "الكمية", "المنجز", "المتبقي", "الحالة"],
        ...orders.map(o => [o.orderNo, o.extension, o.orderDate, o.manufactureRequest, o.sapCode, o.client, o.subProject, o.product, o.category, o.uom, o.qty, o.done, o.rem, o.status]),
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, "أوامر المصنع الخشبي");
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="wooden-orders.xlsx"`);
      res.send(buf);
    } else {
      const rows = orders.map(o =>
        `${o.orderNo} | ${o.client || ""} | ${o.product} | الكمية: ${o.qty} | ${o.status || ""}`
      ).join("\n");
      const content = `أوامر المصنع الخشبي - إبداع للأثاث\n${"=".repeat(60)}\n\n${rows}`;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="wooden-orders.txt"`);
      res.send(content);
    }
  } catch (err) {
    res.status(500).json({ error: "Export failed" });
  }
});

export default router;
