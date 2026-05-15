import { db } from "@workspace/db";
import {
  metalWorkOrdersTable,
  metalProductionStagesTable,
} from "@workspace/db";
import { eq, isNull, and, or, ilike } from "drizzle-orm";

export const METAL_STAGES = [
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

export class MetalService {
  static async listOrders(query: { status?: string; client?: string; search?: string }) {
    let whereClause = isNull(metalWorkOrdersTable.deletedAt);

    if (query.status) {
      whereClause = and(whereClause, eq(metalWorkOrdersTable.status, query.status))!;
    }

    if (query.client) {
      whereClause = and(whereClause, ilike(metalWorkOrdersTable.client, `%${query.client}%`))!;
    }

    if (query.search) {
      whereClause = and(
        whereClause,
        or(
          ilike(metalWorkOrdersTable.moNumber, `%${query.search}%`),
          ilike(metalWorkOrdersTable.product, `%${query.search}%`),
          ilike(metalWorkOrdersTable.client, `%${query.search}%`),
          ilike(metalWorkOrdersTable.project, `%${query.search}%`),
        ),
      )!;
    }

    return await db
      .select()
      .from(metalWorkOrdersTable)
      .where(whereClause)
      .orderBy(metalWorkOrdersTable.id);
  }

  static async createOrder(body: Record<string, unknown>) {
    return await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(metalWorkOrdersTable)
        .values({
          moNumber: String(body.moNumber),
          project: String(body.project),
          client: String(body.client),
          product: String(body.product),
          qty: String(body.qty),
          unit: body.unit !== undefined ? String(body.unit) : "Unit",
          deliveredQty: body.deliveredQty !== undefined ? String(body.deliveredQty) : "0",
          completionPct: body.completionPct !== undefined ? String(body.completionPct) : "0",
          backlogQty: body.backlogQty !== undefined ? String(body.backlogQty) : "0",
          notes: body.notes !== undefined ? String(body.notes) : undefined,
          status: body.status !== undefined ? String(body.status) : "تحت التصنيع",
        })
        .returning();

      await tx.insert(metalProductionStagesTable).values(
        METAL_STAGES.map((s) => ({
          metalOrderId: order.id,
          moNumber: order.moNumber,
          stageName: s.name,
          stageOrder: s.order,
          qtyTarget: order.qty,
          qtyDone: "0",
          status: "لم يتم البدء",
        })),
      );

      return order;
    });
  }

  static async getOrder(id: string) {
    const [order] = await db
      .select()
      .from(metalWorkOrdersTable)
      .where(and(eq(metalWorkOrdersTable.id, id), isNull(metalWorkOrdersTable.deletedAt)));

    if (!order) return null;

    const stages = await db
      .select()
      .from(metalProductionStagesTable)
      .where(and(eq(metalProductionStagesTable.metalOrderId, id), isNull(metalProductionStagesTable.deletedAt)))
      .orderBy(metalProductionStagesTable.stageOrder);

    return { ...order, stages };
  }

  static async updateOrder(id: string, body: Record<string, unknown>) {
    const up: Record<string, string | undefined> = { updatedAt: new Date().toISOString() };
    if (body.moNumber !== undefined) up.moNumber = String(body.moNumber);
    if (body.project !== undefined) up.project = String(body.project);
    if (body.client !== undefined) up.client = String(body.client);
    if (body.product !== undefined) up.product = String(body.product);
    if (body.qty !== undefined) up.qty = String(body.qty);
    if (body.unit !== undefined) up.unit = String(body.unit);
    if (body.deliveredQty !== undefined) up.deliveredQty = String(body.deliveredQty);
    if (body.completionPct !== undefined) up.completionPct = String(body.completionPct);
    if (body.backlogQty !== undefined) up.backlogQty = String(body.backlogQty);
    if (body.notes !== undefined) up.notes = String(body.notes);
    if (body.status !== undefined) up.status = String(body.status);

    const [order] = await db
      .update(metalWorkOrdersTable)
      .set(up)
      .where(and(eq(metalWorkOrdersTable.id, id), isNull(metalWorkOrdersTable.deletedAt)))
      .returning();

    return order;
  }

  static async deleteOrder(id: string) {
    return await db.transaction(async (tx) => {
      const now = new Date().toISOString();
      const [order] = await tx
        .update(metalWorkOrdersTable)
        .set({ deletedAt: now })
        .where(eq(metalWorkOrdersTable.id, id))
        .returning();

      if (order) {
        await tx
          .update(metalProductionStagesTable)
          .set({ deletedAt: now })
          .where(eq(metalProductionStagesTable.metalOrderId, id));
      }

      return order;
    });
  }

  static async getStagesSummary() {
    const stages = await db
      .select()
      .from(metalProductionStagesTable)
      .where(isNull(metalProductionStagesTable.deletedAt));

    const summaryMap = new Map<string, Record<string, unknown>>();
    for (const s of stages) {
      if (!summaryMap.has(s.stageName)) {
        summaryMap.set(s.stageName, {
          stageName: s.stageName,
          stageOrder: s.stageOrder,
          totalWip: 0,
          totalDone: 0,
          orderCount: 0,
        });
      }
      const entry = summaryMap.get(s.stageName)!;
      const target = parseFloat(s.qtyTarget || "0");
      const done = parseFloat(s.qtyDone || "0");
      entry.totalWip = (entry.totalWip as number) + Math.max(0, target - done);
      entry.totalDone = (entry.totalDone as number) + done;
      entry.orderCount = (entry.orderCount as number) + 1;
    }
    return Array.from(summaryMap.values()).sort(
      (a, b) => (a.stageOrder as number) - (b.stageOrder as number),
    );
  }

  static async listStages(query: { moNumber?: string; stageName?: string }) {
    let whereClause = isNull(metalProductionStagesTable.deletedAt);
    if (query.moNumber) whereClause = and(whereClause, eq(metalProductionStagesTable.moNumber, query.moNumber))!;
    if (query.stageName) whereClause = and(whereClause, eq(metalProductionStagesTable.stageName, query.stageName))!;

    return await db
      .select()
      .from(metalProductionStagesTable)
      .where(whereClause)
      .orderBy(metalProductionStagesTable.metalOrderId, metalProductionStagesTable.stageOrder);
  }

  static async createStage(body: Record<string, unknown>) {
    const [stage] = await db
      .insert(metalProductionStagesTable)
      .values({
        metalOrderId: String(body.metalOrderId),
        moNumber: String(body.moNumber),
        stageName: String(body.stageName),
        stageOrder: Number(body.stageOrder),
        qtyTarget: body.qtyTarget !== undefined ? String(body.qtyTarget) : "0",
        qtyDone: body.qtyDone !== undefined ? String(body.qtyDone) : "0",
        status: body.status !== undefined ? String(body.status) : "لم يتم البدء",
      })
      .returning();
    return stage;
  }

  static async getStage(id: string) {
    const [stage] = await db
      .select()
      .from(metalProductionStagesTable)
      .where(and(eq(metalProductionStagesTable.id, id), isNull(metalProductionStagesTable.deletedAt)));
    return stage;
  }

  static async updateStage(id: string, body: Record<string, unknown>) {
    const up: Record<string, string> = { updatedAt: new Date().toISOString() };
    if (body.qtyDone !== undefined) up.qtyDone = String(body.qtyDone);
    if (body.status !== undefined) up.status = String(body.status);
    const [stage] = await db
      .update(metalProductionStagesTable)
      .set(up)
      .where(and(eq(metalProductionStagesTable.id, id), isNull(metalProductionStagesTable.deletedAt)))
      .returning();
    if (stage) {
      await MetalService.syncMetalOrderHeaderFromStages(stage.metalOrderId);
    }
    return stage;
  }

  /** يحدّث نسبة الإنجاز (ومؤشرات مبسّطة) من مراحل الإنتاج */
  static async syncMetalOrderHeaderFromStages(metalOrderId: string) {
    const [order] = await db
      .select()
      .from(metalWorkOrdersTable)
      .where(and(eq(metalWorkOrdersTable.id, metalOrderId), isNull(metalWorkOrdersTable.deletedAt)));

    if (!order) return;

    const stages = await db
      .select()
      .from(metalProductionStagesTable)
      .where(
        and(eq(metalProductionStagesTable.metalOrderId, metalOrderId), isNull(metalProductionStagesTable.deletedAt)),
      )
      .orderBy(metalProductionStagesTable.stageOrder);

    if (stages.length === 0) return;

    let sumPct = 0;
    const orderQty = parseFloat(String(order.qty ?? 0));
    for (const s of stages) {
      const t = parseFloat(String(s.qtyTarget ?? 0)) || orderQty;
      const d = parseFloat(String(s.qtyDone ?? 0));
      sumPct += t > 0 ? Math.min(100, (d / t) * 100) : 0;
    }

    const completionPct = Math.round(sumPct / stages.length);
    const now = new Date().toISOString();
    await db
      .update(metalWorkOrdersTable)
      .set({
        completionPct: String(completionPct),
        updatedAt: now,
      })
      .where(eq(metalWorkOrdersTable.id, metalOrderId));
  }

  static async deleteStage(id: string) {
    const [stage] = await db
      .update(metalProductionStagesTable)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(metalProductionStagesTable.id, id))
      .returning();
    return stage;
  }
}
