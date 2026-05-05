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
  // Remove the word VBC (case-insensitive) and trim
  return val.replace(/\bvbc\b/gi, "").replace(/\s+/g, " ").trim();
}

// List wooden work orders
router.get("/orders", async (req, res) => {
  try {
    const query = ListWoodenOrdersQueryParams.parse(req.query);
    let orders = await db.select().from(woodenWorkOrdersTable).orderBy(woodenWorkOrdersTable.id);

    if (query.status) {
      orders = orders.filter(o => o.status?.toLowerCase() === query.status!.toLowerCase());
    }
    if (query.client) {
      orders = orders.filter(o => o.client?.toLowerCase().includes(query.client!.toLowerCase()));
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      orders = orders.filter(o =>
        o.orderNo.toLowerCase().includes(s) ||
        o.product.toLowerCase().includes(s) ||
        o.client?.toLowerCase().includes(s) ||
        o.subProject?.toLowerCase().includes(s)
      );
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch wooden orders" });
  }
});

// Create wooden work order
router.post("/orders", async (req, res) => {
  try {
    const body = CreateWoodenOrderBody.parse(req.body);
    const cleanExtension = stripVbc(body.extension);
    const [order] = await db.insert(woodenWorkOrdersTable).values({
      ...body,
      extension: cleanExtension,
      qty: String(body.qty),
      done: body.done !== undefined ? String(body.done) : "0",
      rem: body.rem !== undefined ? String(body.rem) : String(body.qty),
    }).returning();

    const stagesToInsert = WOODEN_STAGES.map(s => ({
      woodenOrderId: order.id,
      stageName: s.name,
      stageOrder: s.order,
      qtyDone: "0",
      status: "لم يتم البدء",
    }));
    await db.insert(woodenProductionStagesTable).values(stagesToInsert);

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to create wooden order" });
  }
});

// Get single wooden order with stages
router.get("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [order] = await db.select().from(woodenWorkOrdersTable).where(eq(woodenWorkOrdersTable.id, id));
    if (!order) return res.status(404).json({ error: "Not found" });

    const stages = await db.select().from(woodenProductionStagesTable)
      .where(eq(woodenProductionStagesTable.woodenOrderId, id))
      .orderBy(woodenProductionStagesTable.stageOrder);

    res.json({ ...order, stages });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch wooden order" });
  }
});

// Update wooden work order
router.put("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = UpdateWoodenOrderBody.parse(req.body);
    const updateData: Record<string, unknown> = { ...body, updatedAt: new Date() };
    if (body.extension !== undefined) updateData.extension = stripVbc(body.extension);
    if (body.qty !== undefined) updateData.qty = String(body.qty);
    if (body.done !== undefined) updateData.done = String(body.done);
    if (body.rem !== undefined) updateData.rem = String(body.rem);

    const [order] = await db.update(woodenWorkOrdersTable)
      .set(updateData as Parameters<typeof db.update>[0])
      .where(eq(woodenWorkOrdersTable.id, id))
      .returning();
    if (!order) return res.status(404).json({ error: "Not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to update wooden order" });
  }
});

// Delete wooden work order
router.delete("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(woodenWorkOrdersTable).where(eq(woodenWorkOrdersTable.id, id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete wooden order" });
  }
});

// List wooden stages
router.get("/stages", async (req, res) => {
  try {
    const query = ListWoodenStagesQueryParams.parse(req.query);
    let stages = await db.select().from(woodenProductionStagesTable)
      .orderBy(woodenProductionStagesTable.woodenOrderId, woodenProductionStagesTable.stageOrder);

    if (query.orderId) {
      stages = stages.filter(s => s.woodenOrderId === Number(query.orderId));
    }

    res.json(stages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch wooden stages" });
  }
});

// Get single wooden stage
router.get("/stages/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [stage] = await db.select().from(woodenProductionStagesTable).where(eq(woodenProductionStagesTable.id, id));
    if (!stage) return res.status(404).json({ error: "Not found" });
    res.json(stage);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch wooden stage" });
  }
});

// Update wooden stage
router.put("/stages/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = UpdateWoodenStageBody.parse(req.body);
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.qtyDone !== undefined) updateData.qtyDone = String(body.qtyDone);
    if (body.status !== undefined) updateData.status = body.status;

    const [stage] = await db.update(woodenProductionStagesTable)
      .set(updateData as Parameters<typeof db.update>[0])
      .where(eq(woodenProductionStagesTable.id, id))
      .returning();
    if (!stage) return res.status(404).json({ error: "Not found" });
    res.json(stage);
  } catch (err) {
    res.status(500).json({ error: "Failed to update wooden stage" });
  }
});

// Delete wooden stage
router.delete("/stages/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(woodenProductionStagesTable).where(eq(woodenProductionStagesTable.id, id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete wooden stage" });
  }
});

export default router;
