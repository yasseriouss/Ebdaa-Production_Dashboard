import { Router } from "express";
import { db } from "@workspace/db";
import { metalWorkOrdersTable, woodenWorkOrdersTable } from "@workspace/db";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const metalOrders = await db.select().from(metalWorkOrdersTable);
    const woodenOrders = await db.select().from(woodenWorkOrdersTable);

    const metalByClient = new Map<string, typeof metalOrders>();
    const woodenByClient = new Map<string, typeof woodenOrders>();

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

    const sharedClients = [...metalByClient.keys()].filter(
      c => c && woodenByClient.has(c) && woodenByClient.get(c)!.length > 0
    );

    const result = sharedClients.map(client => {
      const mOrders = metalByClient.get(client) || [];
      const wOrders = woodenByClient.get(client) || [];

      const metalCompletion = mOrders.length > 0
        ? mOrders.reduce((a, o) => a + parseFloat(o.completionPct || "0"), 0) / mOrders.length
        : 0;

      const woodenCompletion = wOrders.length > 0
        ? wOrders.reduce((a, o) => {
            const t = parseFloat(o.qty || "1");
            const d = parseFloat(o.done || "0");
            return a + (t > 0 ? (d / t) * 100 : 0);
          }, 0) / wOrders.length
        : 0;

      const combinedCompletion = (metalCompletion + woodenCompletion) / 2;

      return {
        client,
        metalOrderCount: mOrders.length,
        woodenOrderCount: wOrders.length,
        metalOrders: mOrders,
        woodenOrders: wOrders,
        metalCompletionPct: Math.round(metalCompletion * 10) / 10,
        woodenCompletionPct: Math.round(woodenCompletion * 10) / 10,
        combinedCompletionPct: Math.round(combinedCompletion * 10) / 10,
      };
    });

    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch shared projects" });
  }
});

export default router;
