import { db } from "@workspace/db";
import {
  metalWorkOrdersTable,
  woodenWorkOrdersTable,
} from "@workspace/db";
import { isNull, and } from "drizzle-orm";

export class DashboardService {
  static async getStats() {
    const metalOrders = await db.select().from(metalWorkOrdersTable).where(isNull(metalWorkOrdersTable.deletedAt));
    const woodenOrders = await db.select().from(woodenWorkOrdersTable).where(isNull(woodenWorkOrdersTable.deletedAt));

    const metalClients = new Set(metalOrders.map(o => o.client).filter(Boolean));
    const woodenClients = new Set(woodenOrders.map(o => o.client).filter(Boolean));
    const sharedClients = new Set([...metalClients].filter(c => woodenClients.has(c)));

    const metalStatusMap = new Map<string, number>();
    for (const o of metalOrders) {
      const s = o.status || "لم يتم البدء";
      metalStatusMap.set(s, (metalStatusMap.get(s) || 0) + 1);
    }
    const woodenStatusMap = new Map<string, number>();
    for (const o of woodenOrders) {
      const s = o.status || "غير محدد";
      woodenStatusMap.set(s, (woodenStatusMap.get(s) || 0) + 1);
    }

    const metalCompleted = metalOrders.filter(o => o.status === "تم الانتهاء" || o.status === "تم التسليم");
    const metalActive = metalOrders.filter(o => o.status === "تحت التصنيع" || o.status === "في المخزن");
    const metalOverdue = metalOrders.filter(o => o.status === "متوقف");

    const woodenCompleted = woodenOrders.filter(o => o.status === "تم التسليم" || o.status === "Delivered");
    const woodenOverdue = woodenOrders.filter(o => o.status === "متوقف" || o.status === "Hold");
    const woodenActive = woodenOrders.filter(
      o => o.status !== "تم التسليم" && o.status !== "Delivered" && o.status !== "متوقف" && o.status !== "Hold",
    );

    const metalAvgCompletion = metalOrders.length > 0
      ? metalOrders.reduce((acc, o) => acc + parseFloat(o.completionPct || "0"), 0) / metalOrders.length
      : 0;

    const woodenAvgCompletion = woodenOrders.length > 0
      ? woodenOrders.reduce((acc, o) => {
          const total = parseFloat(o.qty || "0");
          const done = parseFloat(o.done || "0");
          return acc + (total > 0 ? (done / total) * 100 : 0);
        }, 0) / woodenOrders.length
      : 0;

    const metalBacklog = metalOrders.reduce((acc, o) => acc + parseFloat(o.backlogQty || "0"), 0);
    const woodenBacklog = woodenOrders.reduce((acc, o) => acc + parseFloat(o.rem || "0"), 0);

    return {
      factoriesCount: 2,
      metalTotalOrders: metalOrders.length,
      metalActiveOrders: metalActive.length,
      metalCompletedOrders: metalCompleted.length,
      metalOverdueOrders: metalOverdue.length,
      metalAvgCompletionPct: Math.round(metalAvgCompletion * 10) / 10,
      woodenTotalOrders: woodenOrders.length,
      woodenActiveOrders: woodenActive.length,
      woodenCompletedOrders: woodenCompleted.length,
      woodenAvgCompletionPct: Math.round(woodenAvgCompletion * 10) / 10,
      sharedProjectsCount: sharedClients.size,
      metalStatusBreakdown: Array.from(metalStatusMap.entries()).map(([status, count]) => ({ status, count })),
      woodenStatusBreakdown: Array.from(woodenStatusMap.entries()).map(([status, count]) => ({ status, count })),
      metalBacklogTotal: Math.round(metalBacklog),
      woodenBacklogTotal: Math.round(woodenBacklog),
      woodenOverdueOrders: woodenOverdue.length,
    };
  }

  static async getGanttData(query: { factory?: string; dateFrom?: string; dateTo?: string }) {
    const ganttItems: any[] = [];
    const filterFrom = query.dateFrom ? new Date(query.dateFrom) : null;
    const filterTo = query.dateTo ? new Date(query.dateTo) : null;

    function inRange(itemStart: Date, itemEnd: Date): boolean {
      if (filterFrom && itemEnd < filterFrom) return false;
      if (filterTo && itemStart > filterTo) return false;
      return true;
    }

    if (!query.factory || query.factory === "all" || query.factory === "metal") {
      const metalOrders = await db.select().from(metalWorkOrdersTable).where(isNull(metalWorkOrdersTable.deletedAt));
      for (const o of metalOrders) {
        const start = o.createdAt ? new Date(o.createdAt) : new Date("2025-01-01");
        const qty = parseFloat(o.qty || "0");
        const durationDays = Math.max(30, Math.min(120, Math.round(qty * 0.5)));
        const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
        if (!inRange(start, end)) continue;

        ganttItems.push({
          id: `metal-${o.id}`,
          factory: "metal",
          moNumber: o.moNumber,
          client: o.client || "",
          project: o.project || "",
          product: o.product,
          startDate: start.toISOString().split("T")[0],
          endDate: end.toISOString().split("T")[0],
          completionPct: parseFloat(o.completionPct || "0"),
          status: o.status || "لم يتم البدء",
        });
      }
    }

    if (!query.factory || query.factory === "all" || query.factory === "wooden") {
      const woodenOrders = await db.select().from(woodenWorkOrdersTable).where(isNull(woodenWorkOrdersTable.deletedAt));
      for (const o of woodenOrders) {
        const start = o.orderDate ? new Date(o.orderDate) : (o.createdAt ? new Date(o.createdAt) : new Date("2025-01-01"));
        const end = o.prodDateEnd ? new Date(o.prodDateEnd) : new Date(start.getTime() + 60 * 24 * 60 * 60 * 1000);
        const total = parseFloat(o.qty || "1");
        const done = parseFloat(o.done || "0");
        if (!inRange(start, end)) continue;

        ganttItems.push({
          id: `wooden-${o.id}`,
          factory: "wooden",
          moNumber: o.orderNo,
          client: o.client || "",
          project: o.subProject || "",
          product: o.product,
          startDate: start.toISOString().split("T")[0],
          endDate: end.toISOString().split("T")[0],
          completionPct: total > 0 ? Math.round((done / total) * 100 * 10) / 10 : 0,
          status: o.status || "تحت التصنيع",
        });
      }
    }
    return ganttItems;
  }

  static async getClients() {
    const metalOrders = await db.select().from(metalWorkOrdersTable).where(isNull(metalWorkOrdersTable.deletedAt));
    const woodenOrders = await db.select().from(woodenWorkOrdersTable).where(isNull(woodenWorkOrdersTable.deletedAt));

    const clientMap = new Map<string, any>();
    for (const o of metalOrders) {
      const c = o.client || "غير محدد";
      if (!clientMap.has(c)) clientMap.set(c, { metalOrders: 0, woodenOrders: 0, totalCompletion: 0, count: 0 });
      const entry = clientMap.get(c)!;
      entry.metalOrders++;
      entry.totalCompletion += parseFloat(o.completionPct || "0");
      entry.count++;
    }
    for (const o of woodenOrders) {
      const c = o.client || "غير محدد";
      if (!clientMap.has(c)) clientMap.set(c, { metalOrders: 0, woodenOrders: 0, totalCompletion: 0, count: 0 });
      const entry = clientMap.get(c)!;
      entry.woodenOrders++;
      const total = parseFloat(o.qty || "1");
      const done = parseFloat(o.done || "0");
      entry.totalCompletion += total > 0 ? (done / total) * 100 : 0;
      entry.count++;
    }
    return Array.from(clientMap.entries()).map(([client, data]) => ({
      client,
      metalOrders: data.metalOrders,
      woodenOrders: data.woodenOrders,
      totalOrders: data.metalOrders + data.woodenOrders,
      completionPct: data.count > 0 ? Math.round((data.totalCompletion / data.count) * 10) / 10 : 0,
    })).sort((a, b) => b.totalOrders - a.totalOrders).slice(0, 15);
  }

  static async getCompletionTrend() {
    const metalOrders = await db.select().from(metalWorkOrdersTable).where(isNull(metalWorkOrdersTable.deletedAt));
    const woodenOrders = await db.select().from(woodenWorkOrdersTable).where(isNull(woodenWorkOrdersTable.deletedAt));

    const months: any[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const period = d.toLocaleDateString("ar-EG", { year: "numeric", month: "short" });
      months.push({ period, metalCompletion: 0, metalCount: 0, woodenCompletion: 0, woodenCount: 0 });
    }

    for (const o of metalOrders) {
      const created = o.createdAt ? new Date(o.createdAt) : null;
      if (!created) continue;
      const period = created.toLocaleDateString("ar-EG", { year: "numeric", month: "short" });
      const bucket = months.find(m => m.period === period);
      if (bucket) {
        bucket.metalCompletion += parseFloat(o.completionPct || "0");
        bucket.metalCount++;
      }
    }
    for (const o of woodenOrders) {
      const created = o.createdAt ? new Date(o.createdAt) : null;
      if (!created) continue;
      const period = created.toLocaleDateString("ar-EG", { year: "numeric", month: "short" });
      const bucket = months.find(m => m.period === period);
      if (bucket) {
        const t = parseFloat(o.qty || "1"); const d = parseFloat(o.done || "0");
        bucket.woodenCompletion += t > 0 ? (d / t) * 100 : 0;
        bucket.woodenCount++;
      }
    }
    return months.map(m => ({
      period: m.period,
      metalCompletionPct: m.metalCount > 0 ? Math.round((m.metalCompletion / m.metalCount) * 10) / 10 : 0,
      woodenCompletionPct: m.woodenCount > 0 ? Math.round((m.woodenCompletion / m.woodenCount) * 10) / 10 : 0,
    }));
  }

  static async getSharedProjects() {
    const metalOrders = await db.select().from(metalWorkOrdersTable).where(isNull(metalWorkOrdersTable.deletedAt));
    const woodenOrders = await db.select().from(woodenWorkOrdersTable).where(isNull(woodenWorkOrdersTable.deletedAt));

    const metalByClient = new Map<string, any[]>();
    const woodenByClient = new Map<string, any[]>();

    for (const o of metalOrders) {
      const c = o.client || "";
      if (!metalByClient.has(c)) metalByClient.set(c, []);
      metalByClient.get(c)!.push(o);
    }
    for (const o of woodenOrders) {
      const c = o.client || "";
      if (!woodenByClient.has(c)) woodenByClient.set(c, []);
      woodenByClient.get(c)!.push(o);
    }

    const sharedClients = [...metalByClient.keys()].filter(c => c && woodenByClient.has(c) && woodenByClient.get(c)!.length > 0);

    return sharedClients.map(client => {
      const mOrders = metalByClient.get(client) || [];
      const wOrders = woodenByClient.get(client) || [];
      const metalCompletion = mOrders.length > 0
        ? mOrders.reduce((a, o) => a + parseFloat(o.completionPct || "0"), 0) / mOrders.length
        : 0;
      const woodenCompletion = wOrders.length > 0
        ? wOrders.reduce((a, o) => {
            const t = parseFloat(o.qty || "1"); const d = parseFloat(o.done || "0");
            return a + (t > 0 ? (d / t) * 100 : 0);
          }, 0) / wOrders.length
        : 0;
      return {
        client,
        metalOrderCount: mOrders.length,
        woodenOrderCount: wOrders.length,
        metalOrders: mOrders,
        woodenOrders: wOrders,
        metalCompletionPct: Math.round(metalCompletion * 10) / 10,
        woodenCompletionPct: Math.round(woodenCompletion * 10) / 10,
        combinedCompletionPct: Math.round(((metalCompletion + woodenCompletion) / 2) * 10) / 10,
      };
    });
  }
}
