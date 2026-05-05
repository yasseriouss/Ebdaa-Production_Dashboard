import { Router } from "express";
import { db } from "@workspace/db";
import {
  woodenWorkOrdersTable,
  woodenProductionStagesTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListWoodenOrdersQueryParams,
  CreateWoodenOrderBody,
  UpdateWoodenOrderBody,
  ListWoodenStagesQueryParams,
  UpdateWoodenStageBody,
  CreateWoodenStageBody,
} from "@workspace/api-zod";

const router = Router();

const WOODEN_STAGES = [
  { name: "القطع", order: 1 },
  { name: "التجميع", order: 2 },
  { name: "التشطيب", order: 3 },
  { name: "التغليف", order: 4 },
];

function stripVbc(val: string | null | undefined): string {
  if (!val) return "";
  return val.replace(/\bvbc\b/gi, "").replace(/\s+/g, " ").trim();
}

// List wooden work orders
router.get("/orders", async (req, res) => {
  try {
    const query = ListWoodenOrdersQueryParams.parse(req.query);
    let orders = await db.select().from(woodenWorkOrdersTable).orderBy(woodenWorkOrdersTable.id);
    if (query.status) orders = orders.filter(o => o.status?.toLowerCase() === query.status!.toLowerCase());
    if (query.client) orders = orders.filter(o => o.client?.toLowerCase().includes(query.client!.toLowerCase()));
    if (query.search) {
      const s = query.search.toLowerCase();
      orders = orders.filter(o =>
        o.orderNo.toLowerCase().includes(s) ||
        o.product.toLowerCase().includes(s) ||
        (o.client?.toLowerCase().includes(s) ?? false) ||
        (o.subProject?.toLowerCase().includes(s) ?? false)
      );
    }
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Failed to fetch wooden orders" });
  }
});

// Create wooden work order
router.post("/orders", async (req, res) => {
  try {
    const body = CreateWoodenOrderBody.parse(req.body);
    const [order] = await db.insert(woodenWorkOrdersTable).values({
      orderNo: body.orderNo,
      extension: stripVbc(body.extension),
      orderDate: body.orderDate,
      manufactureRequest: body.manufactureRequest,
      sapCode: body.sapCode,
      client: body.client,
      subProject: body.subProject,
      product: body.product,
      category: body.category,
      uom: body.uom,
      qty: String(body.qty),
      done: body.done !== undefined ? String(body.done) : "0",
      rem: body.rem !== undefined ? String(body.rem) : String(body.qty),
      status: body.status,
      prodDateStart: body.prodDateStart,
      prodDateEnd: body.prodDateEnd,
      prodDateFinished: body.prodDateFinished,
    }).returning();

    await db.insert(woodenProductionStagesTable).values(
      WOODEN_STAGES.map(s => ({
        woodenOrderId: order.id,
        stageName: s.name,
        stageOrder: s.order,
        qtyDone: "0",
        status: "لم يتم البدء",
      }))
    );

    res.status(201).json(order);
  } catch {
    res.status(500).json({ error: "Failed to create wooden order" });
  }
});

// Get single wooden order with stages
router.get("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [order] = await db.select().from(woodenWorkOrdersTable).where(eq(woodenWorkOrdersTable.id, id));
    if (!order) { res.status(404).json({ error: "Not found" }); return; }

    const stages = await db.select().from(woodenProductionStagesTable)
      .where(eq(woodenProductionStagesTable.woodenOrderId, id))
      .orderBy(woodenProductionStagesTable.stageOrder);

    res.json({ ...order, stages });
  } catch {
    res.status(500).json({ error: "Failed to fetch wooden order" });
  }
});

// Update wooden work order
router.put("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = UpdateWoodenOrderBody.parse(req.body);

    const up: {
      extension?: string; orderDate?: string; manufactureRequest?: string; sapCode?: string;
      client?: string; subProject?: string; product?: string; category?: string; uom?: string;
      qty?: string; done?: string; rem?: string; status?: string; prodDateStart?: string;
      prodDateEnd?: string; prodDateFinished?: string; updatedAt: Date;
    } = { updatedAt: new Date() };

    if (body.extension !== undefined) up.extension = stripVbc(body.extension);
    if (body.orderDate !== undefined) up.orderDate = body.orderDate;
    if (body.manufactureRequest !== undefined) up.manufactureRequest = body.manufactureRequest;
    if (body.sapCode !== undefined) up.sapCode = body.sapCode;
    if (body.client !== undefined) up.client = body.client;
    if (body.subProject !== undefined) up.subProject = body.subProject;
    if (body.product !== undefined) up.product = body.product;
    if (body.category !== undefined) up.category = body.category;
    if (body.uom !== undefined) up.uom = body.uom;
    if (body.qty !== undefined) up.qty = String(body.qty);
    if (body.done !== undefined) up.done = String(body.done);
    if (body.rem !== undefined) up.rem = String(body.rem);
    if (body.status !== undefined) up.status = body.status;
    if (body.prodDateStart !== undefined) up.prodDateStart = body.prodDateStart;
    if (body.prodDateEnd !== undefined) up.prodDateEnd = body.prodDateEnd;
    if (body.prodDateFinished !== undefined) up.prodDateFinished = body.prodDateFinished;

    const [order] = await db.update(woodenWorkOrdersTable).set(up).where(eq(woodenWorkOrdersTable.id, id)).returning();
    if (!order) { res.status(404).json({ error: "Not found" }); return; }
    res.json(order);
  } catch {
    res.status(500).json({ error: "Failed to update wooden order" });
  }
});

// Delete wooden work order
router.delete("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(woodenWorkOrdersTable).where(eq(woodenWorkOrdersTable.id, id));
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete wooden order" });
  }
});

// Create wooden stage (manual)
router.post("/stages", async (req, res) => {
  try {
    const body = CreateWoodenStageBody.parse(req.body);
    const [stage] = await db.insert(woodenProductionStagesTable).values({
      woodenOrderId: body.woodenOrderId,
      stageName: body.stageName,
      stageOrder: body.stageOrder,
      qtyDone: body.qtyDone !== undefined ? String(body.qtyDone) : "0",
      status: body.status ?? "لم يتم البدء",
    }).returning();
    res.status(201).json(stage);
  } catch {
    res.status(500).json({ error: "Failed to create wooden stage" });
  }
});

// List wooden stages
router.get("/stages", async (req, res) => {
  try {
    const query = ListWoodenStagesQueryParams.parse(req.query);
    let stages = await db.select().from(woodenProductionStagesTable)
      .orderBy(woodenProductionStagesTable.woodenOrderId, woodenProductionStagesTable.stageOrder);
    if (query.orderId) stages = stages.filter(s => s.woodenOrderId === Number(query.orderId));
    res.json(stages);
  } catch {
    res.status(500).json({ error: "Failed to fetch wooden stages" });
  }
});

// Get single wooden stage
router.get("/stages/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [stage] = await db.select().from(woodenProductionStagesTable).where(eq(woodenProductionStagesTable.id, id));
    if (!stage) { res.status(404).json({ error: "Not found" }); return; }
    res.json(stage);
  } catch {
    res.status(500).json({ error: "Failed to fetch wooden stage" });
  }
});

// Update wooden stage
router.put("/stages/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = UpdateWoodenStageBody.parse(req.body);
    const up: { qtyDone?: string; status?: string; updatedAt: Date } = { updatedAt: new Date() };
    if (body.qtyDone !== undefined) up.qtyDone = String(body.qtyDone);
    if (body.status !== undefined) up.status = body.status;

    const [stage] = await db.update(woodenProductionStagesTable).set(up).where(eq(woodenProductionStagesTable.id, id)).returning();
    if (!stage) { res.status(404).json({ error: "Not found" }); return; }
    res.json(stage);
  } catch {
    res.status(500).json({ error: "Failed to update wooden stage" });
  }
});

// Delete wooden stage
router.delete("/stages/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(woodenProductionStagesTable).where(eq(woodenProductionStagesTable.id, id));
    res.status(204).send();
  } catch {
    res.status(500).json({ error: "Failed to delete wooden stage" });
  }
});

export default router;
