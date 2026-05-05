import { Router } from "express";
import { db } from "@workspace/db";
import {
  metalWorkOrdersTable,
  metalProductionStagesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListMetalOrdersQueryParams,
  CreateMetalOrderBody,
  UpdateMetalOrderBody,
  ListMetalStagesQueryParams,
  UpdateMetalStageBody,
  CreateMetalStageBody,
} from "@workspace/api-zod";

const router = Router();

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

// List metal work orders
router.get("/orders", async (req, res) => {
  try {
    const query = ListMetalOrdersQueryParams.parse(req.query);
    let orders = await db.select().from(metalWorkOrdersTable).orderBy(metalWorkOrdersTable.id);
    if (query.status) orders = orders.filter(o => o.status === query.status);
    if (query.client) orders = orders.filter(o => o.client?.toLowerCase().includes(query.client!.toLowerCase()));
    if (query.search) {
      const s = query.search.toLowerCase();
      orders = orders.filter(o =>
        o.moNumber.toLowerCase().includes(s) ||
        o.product.toLowerCase().includes(s) ||
        (o.client?.toLowerCase().includes(s) ?? false) ||
        (o.project?.toLowerCase().includes(s) ?? false)
      );
    }
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Failed to fetch metal orders" });
  }
});

// Create metal work order
router.post("/orders", async (req, res) => {
  try {
    const body = CreateMetalOrderBody.parse(req.body);
    const [order] = await db.insert(metalWorkOrdersTable).values({
      moNumber: body.moNumber,
      project: body.project,
      client: body.client,
      product: body.product,
      qty: String(body.qty),
      unit: body.unit,
      deliveredQty: body.deliveredQty !== undefined ? String(body.deliveredQty) : "0",
      completionPct: body.completionPct !== undefined ? String(body.completionPct) : "0",
      backlogQty: body.backlogQty !== undefined ? String(body.backlogQty) : "0",
      backlogStatus: body.backlogStatus,
      notes: body.notes,
      status: body.status,
    }).returning();

    await db.insert(metalProductionStagesTable).values(
      METAL_STAGES.map(s => ({
        metalOrderId: order.id,
        moNumber: order.moNumber,
        stageName: s.name,
        stageOrder: s.order,
        qtyTarget: order.qty,
        qtyDone: "0",
        status: "لم يتم البدء",
      }))
    );
    res.status(201).json(order);
  } catch {
    res.status(500).json({ error: "Failed to create metal order" });
  }
});

// Get single metal order with stages
router.get("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [order] = await db.select().from(metalWorkOrdersTable).where(eq(metalWorkOrdersTable.id, id));
    if (!order) { res.status(404).json({ error: "Not found" }); return; }
    const stages = await db.select().from(metalProductionStagesTable)
      .where(eq(metalProductionStagesTable.metalOrderId, id))
      .orderBy(metalProductionStagesTable.stageOrder);
    res.json({ ...order, stages });
  } catch {
    res.status(500).json({ error: "Failed to fetch metal order" });
  }
});

// Update metal work order
router.put("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = UpdateMetalOrderBody.parse(req.body);
    const up: {
      moNumber?: string; project?: string; client?: string; product?: string; qty?: string;
      unit?: string; deliveredQty?: string; completionPct?: string; backlogQty?: string;
      backlogStatus?: string; notes?: string; status?: string; updatedAt: Date;
    } = { updatedAt: new Date() };

    if (body.moNumber !== undefined) up.moNumber = body.moNumber;
    if (body.project !== undefined) up.project = body.project;
    if (body.client !== undefined) up.client = body.client;
    if (body.product !== undefined) up.product = body.product;
    if (body.qty !== undefined) up.qty = String(body.qty);
    if (body.unit !== undefined) up.unit = body.unit;
    if (body.deliveredQty !== undefined) up.deliveredQty = String(body.deliveredQty);
    if (body.completionPct !== undefined) up.completionPct = String(body.completionPct);
    if (body.backlogQty !== undefined) up.backlogQty = String(body.backlogQty);
    if (body.backlogStatus !== undefined) up.backlogStatus = body.backlogStatus;
    if (body.notes !== undefined) up.notes = body.notes;
    if (body.status !== undefined) up.status = body.status;

    const [order] = await db.update(metalWorkOrdersTable).set(up).where(eq(metalWorkOrdersTable.id, id)).returning();
    if (!order) { res.status(404).json({ error: "Not found" }); return; }
    res.json(order);
  } catch {
    res.status(500).json({ error: "Failed to update metal order" });
  }
});

// Delete metal work order
router.delete("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(metalWorkOrdersTable).where(eq(metalWorkOrdersTable.id, id));
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete metal order" });
  }
});

// Stage bottleneck summary
router.get("/stages/summary", async (_req, res) => {
  try {
    const stages = await db.select().from(metalProductionStagesTable);
    const summaryMap = new Map<string, { stageName: string; stageOrder: number; totalWip: number; totalDone: number; orderCount: number }>();
    for (const s of stages) {
      if (!summaryMap.has(s.stageName)) {
        summaryMap.set(s.stageName, { stageName: s.stageName, stageOrder: s.stageOrder, totalWip: 0, totalDone: 0, orderCount: 0 });
      }
      const entry = summaryMap.get(s.stageName)!;
      const target = parseFloat(s.qtyTarget || "0");
      const done = parseFloat(s.qtyDone || "0");
      entry.totalWip += Math.max(0, target - done);
      entry.totalDone += done;
      entry.orderCount++;
    }
    res.json(Array.from(summaryMap.values()).sort((a, b) => a.stageOrder - b.stageOrder));
  } catch {
    res.status(500).json({ error: "Failed to fetch stage summary" });
  }
});

// List metal stages
router.get("/stages", async (req, res) => {
  try {
    const query = ListMetalStagesQueryParams.parse(req.query);
    let stages = await db.select().from(metalProductionStagesTable)
      .orderBy(metalProductionStagesTable.metalOrderId, metalProductionStagesTable.stageOrder);
    if (query.moNumber) stages = stages.filter(s => s.moNumber === query.moNumber);
    if (query.stageName) stages = stages.filter(s => s.stageName === query.stageName);
    res.json(stages);
  } catch {
    res.status(500).json({ error: "Failed to fetch metal stages" });
  }
});

// Create metal stage (manual)
router.post("/stages", async (req, res) => {
  try {
    const body = CreateMetalStageBody.parse(req.body);
    const [stage] = await db.insert(metalProductionStagesTable).values({
      metalOrderId: body.metalOrderId,
      moNumber: body.moNumber,
      stageName: body.stageName,
      stageOrder: body.stageOrder,
      qtyTarget: body.qtyTarget !== undefined ? String(body.qtyTarget) : "0",
      qtyDone: body.qtyDone !== undefined ? String(body.qtyDone) : "0",
      status: body.status ?? "لم يتم البدء",
    }).returning();
    res.status(201).json(stage);
  } catch {
    res.status(500).json({ error: "Failed to create metal stage" });
  }
});

// Get single metal stage
router.get("/stages/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [stage] = await db.select().from(metalProductionStagesTable).where(eq(metalProductionStagesTable.id, id));
    if (!stage) { res.status(404).json({ error: "Not found" }); return; }
    res.json(stage);
  } catch {
    res.status(500).json({ error: "Failed to fetch metal stage" });
  }
});

// Update metal stage
router.put("/stages/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = UpdateMetalStageBody.parse(req.body);
    const up: { qtyDone?: string; status?: string; updatedAt: Date } = { updatedAt: new Date() };
    if (body.qtyDone !== undefined) up.qtyDone = String(body.qtyDone);
    if (body.status !== undefined) up.status = body.status;
    const [stage] = await db.update(metalProductionStagesTable).set(up).where(eq(metalProductionStagesTable.id, id)).returning();
    if (!stage) { res.status(404).json({ error: "Not found" }); return; }
    res.json(stage);
  } catch {
    res.status(500).json({ error: "Failed to update metal stage" });
  }
});

// Delete metal stage
router.delete("/stages/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(metalProductionStagesTable).where(eq(metalProductionStagesTable.id, id));
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete metal stage" });
  }
});

export default router;
