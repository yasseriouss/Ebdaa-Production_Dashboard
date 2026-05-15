import { db } from "@workspace/db";
import {
  woodenWorkOrdersTable,
  woodenProductionStagesTable,
} from "@workspace/db";
import { eq, isNull, and, or, ilike } from "@workspace/db";

export const WOODEN_STAGES = [
  { name: "القطع", order: 1 },
  { name: "التجميع", order: 2 },
  { name: "التشطيب", order: 3 },
  { name: "التغليف", order: 4 },
];

function stripVbc(val: string | null | undefined): string {
  if (!val) return "";
  return val.replace(/\bvbc\b/gi, "").replace(/\s+/g, " ").trim();
}

export class WoodenService {
  static async listOrders(query: { status?: string; client?: string; search?: string }) {
    let whereClause = isNull(woodenWorkOrdersTable.deletedAt);

    if (query.status) {
      whereClause = and(whereClause, eq(woodenWorkOrdersTable.status, query.status))!;
    }

    if (query.client) {
      whereClause = and(whereClause, ilike(woodenWorkOrdersTable.client, `%${query.client}%`))!;
    }

    if (query.search) {
      whereClause = and(
        whereClause,
        or(
          ilike(woodenWorkOrdersTable.orderNo, `%${query.search}%`),
          ilike(woodenWorkOrdersTable.product, `%${query.search}%`),
          ilike(woodenWorkOrdersTable.client, `%${query.search}%`),
          ilike(woodenWorkOrdersTable.subProject, `%${query.search}%`),
        ),
      )!;
    }

    return await db
      .select()
      .from(woodenWorkOrdersTable)
      .where(whereClause)
      .orderBy(woodenWorkOrdersTable.id);
  }

  static async createOrder(body: Record<string, unknown>) {
    return await db.transaction(async (tx) => {
      const qtyStr = String(body.qty ?? "0");
      const doneStr = body.done !== undefined ? String(body.done) : "0";
      const remStr = body.rem !== undefined ? String(body.rem) : qtyStr;

      const [order] = await tx
        .insert(woodenWorkOrdersTable)
        .values({
          orderNo: String(body.orderNo),
          extension: stripVbc(body.extension !== undefined ? String(body.extension) : ""),
          orderDate: String(body.orderDate ?? ""),
          client: String(body.client),
          subProject: String(body.subProject ?? ""),
          product: String(body.product),
          qty: qtyStr,
          done: doneStr,
          rem: remStr,
          status: body.status !== undefined ? String(body.status) : "تحت التصنيع",
          prodDateEnd: body.prodDateEnd !== undefined && body.prodDateEnd !== null ? String(body.prodDateEnd) : null,
        })
        .returning();

      await tx.insert(woodenProductionStagesTable).values(
        WOODEN_STAGES.map((s) => ({
          woodenOrderId: order.id,
          stageName: s.name,
          stageOrder: s.order,
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
      .from(woodenWorkOrdersTable)
      .where(and(eq(woodenWorkOrdersTable.id, id), isNull(woodenWorkOrdersTable.deletedAt)));

    if (!order) return null;

    const stages = await db
      .select()
      .from(woodenProductionStagesTable)
      .where(and(eq(woodenProductionStagesTable.woodenOrderId, id), isNull(woodenProductionStagesTable.deletedAt)))
      .orderBy(woodenProductionStagesTable.stageOrder);

    return { ...order, stages };
  }

  static async updateOrder(id: string, body: Record<string, unknown>) {
    const up: Record<string, string | null> = { updatedAt: new Date().toISOString() };
    if (body.extension !== undefined) up.extension = stripVbc(String(body.extension));
    if (body.orderDate !== undefined) up.orderDate = String(body.orderDate);
    if (body.client !== undefined) up.client = String(body.client);
    if (body.subProject !== undefined) up.subProject = String(body.subProject);
    if (body.product !== undefined) up.product = String(body.product);
    if (body.qty !== undefined) up.qty = String(body.qty);
    if (body.done !== undefined) up.done = String(body.done);
    if (body.rem !== undefined) up.rem = String(body.rem);
    if (body.status !== undefined) up.status = String(body.status);
    if (body.prodDateEnd !== undefined) {
      up.prodDateEnd = body.prodDateEnd === null || body.prodDateEnd === "" ? null : String(body.prodDateEnd);
    }

    const [order] = await db
      .update(woodenWorkOrdersTable)
      .set(up)
      .where(and(eq(woodenWorkOrdersTable.id, id), isNull(woodenWorkOrdersTable.deletedAt)))
      .returning();

    return order;
  }

  static async deleteOrder(id: string) {
    return await db.transaction(async (tx) => {
      const now = new Date().toISOString();
      const [order] = await tx
        .update(woodenWorkOrdersTable)
        .set({ deletedAt: now })
        .where(eq(woodenWorkOrdersTable.id, id))
        .returning();

      if (order) {
        await tx
          .update(woodenProductionStagesTable)
          .set({ deletedAt: now })
          .where(eq(woodenProductionStagesTable.woodenOrderId, id));
      }

      return order;
    });
  }

  static async listStages(query: { orderId?: string }) {
    let whereClause = isNull(woodenProductionStagesTable.deletedAt);
    if (query.orderId) whereClause = and(whereClause, eq(woodenProductionStagesTable.woodenOrderId, query.orderId))!;

    return await db
      .select()
      .from(woodenProductionStagesTable)
      .where(whereClause)
      .orderBy(woodenProductionStagesTable.woodenOrderId, woodenProductionStagesTable.stageOrder);
  }

  /** WIP / done per stage (same shape as metal summary) — pressure uses order qty vs stage qty done */
  static async getStagesSummary() {
    const rows = await db
      .select({
        stageName: woodenProductionStagesTable.stageName,
        stageOrder: woodenProductionStagesTable.stageOrder,
        qtyDone: woodenProductionStagesTable.qtyDone,
        status: woodenProductionStagesTable.status,
        orderQty: woodenWorkOrdersTable.qty,
      })
      .from(woodenProductionStagesTable)
      .innerJoin(
        woodenWorkOrdersTable,
        eq(woodenProductionStagesTable.woodenOrderId, woodenWorkOrdersTable.id),
      )
      .where(
        and(isNull(woodenProductionStagesTable.deletedAt), isNull(woodenWorkOrdersTable.deletedAt)),
      );

    const summaryMap = new Map<
      string,
      { stageName: string; stageOrder: number; totalWip: number; totalDone: number; orderCount: number }
    >();
    for (const s of rows) {
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
      const target = parseFloat(s.orderQty || "0");
      const done = parseFloat(s.qtyDone || "0");
      const wip = s.status === "تم الانتهاء" ? 0 : Math.max(0, target - done);
      entry.totalWip += wip;
      entry.totalDone += done;
      entry.orderCount += 1;
    }
    return Array.from(summaryMap.values()).sort((a, b) => a.stageOrder - b.stageOrder);
  }

  static async createStage(body: Record<string, unknown>) {
    const [stage] = await db
      .insert(woodenProductionStagesTable)
      .values({
        woodenOrderId: String(body.woodenOrderId),
        stageName: String(body.stageName),
        stageOrder: Number(body.stageOrder),
        qtyDone: body.qtyDone !== undefined ? String(body.qtyDone) : "0",
        status: body.status !== undefined ? String(body.status) : "لم يتم البدء",
      })
      .returning();
    return stage;
  }

  static async getStage(id: string) {
    const [stage] = await db
      .select()
      .from(woodenProductionStagesTable)
      .where(and(eq(woodenProductionStagesTable.id, id), isNull(woodenProductionStagesTable.deletedAt)));
    return stage;
  }

  static async updateStage(id: string, body: Record<string, unknown>) {
    const up: Record<string, string> = { updatedAt: new Date().toISOString() };
    if (body.qtyDone !== undefined) up.qtyDone = String(body.qtyDone);
    if (body.status !== undefined) up.status = String(body.status);
    const [stage] = await db
      .update(woodenProductionStagesTable)
      .set(up)
      .where(and(eq(woodenProductionStagesTable.id, id), isNull(woodenProductionStagesTable.deletedAt)))
      .returning();
    if (stage) {
      await WoodenService.syncWoodenOrderHeaderFromStages(stage.woodenOrderId);
    }
    return stage;
  }

  /** يحدّث حقول الأمر (منجز / متبقي) من مراحل الإنتاج حتى تنعكس التعديلات في القوائم وبطاقات التفاصيل */
  static async syncWoodenOrderHeaderFromStages(woodenOrderId: string) {
    const [order] = await db
      .select()
      .from(woodenWorkOrdersTable)
      .where(and(eq(woodenWorkOrdersTable.id, woodenOrderId), isNull(woodenWorkOrdersTable.deletedAt)));

    if (!order) return;

    const stages = await db
      .select()
      .from(woodenProductionStagesTable)
      .where(
        and(eq(woodenProductionStagesTable.woodenOrderId, woodenOrderId), isNull(woodenProductionStagesTable.deletedAt)),
      );

    const qty = parseFloat(String(order.qty ?? 0));
    if (qty <= 0 || stages.length === 0) return;

    const dList = stages.map((s) => parseFloat(String(s.qtyDone ?? 0)));
    const done = Math.min(qty, ...dList);
    const rem = Math.max(0, qty - done);
    const now = new Date().toISOString();

    await db
      .update(woodenWorkOrdersTable)
      .set({ done: String(done), rem: String(rem), updatedAt: now })
      .where(eq(woodenWorkOrdersTable.id, woodenOrderId));
  }

  static async deleteStage(id: string) {
    const [stage] = await db
      .update(woodenProductionStagesTable)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(woodenProductionStagesTable.id, id))
      .returning();
    return stage;
  }
}
