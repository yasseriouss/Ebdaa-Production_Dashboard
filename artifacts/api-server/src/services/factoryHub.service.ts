import { readFileSync } from "node:fs";
import path from "node:path";
import { db } from "@workspace/db";
import {
  fhNewProjectAutosaveTable,
  fhReferenceSnapshotsTable,
  fhWoodWorkOrdersTable,
  fhWorkOrderAnalysisSessionsTable,
} from "@workspace/db";
import {
  CreateFhWoodWorkOrderBody,
  UpdateFhWoodWorkOrderBody,
  PutFhReferenceSnapshotBody,
  CreateFhAnalysisSessionBody,
  UpdateFhAnalysisSessionBody,
  PutFhNewProjectAutosaveBody,
} from "@workspace/api-zod";
import { eq } from "@workspace/db";
import { maybeSyncHubWoodOrderToWooden } from "./factoryHubWoodenBridge";
import type { RequestAuth } from "../lib/requestAuth";
import { DEFAULT_ANONYMOUS_AUTH } from "../lib/requestAuth";
import {
  assertScopedFactoryDepartment,
  assertScopedRowHasSomeAssignment,
  combineWhere,
  factoryDepartmentRowScopeWhere,
} from "../lib/dataScopeFilter";

const dataDir = path.join(process.cwd(), "src", "data");

function nowIso() {
  return new Date().toISOString();
}

function canSeed(): boolean {
  if (process.env["FH_ALLOW_SEED"] === "true" || process.env["FH_ALLOW_SEED"] === "1") return true;
  return process.env["NODE_ENV"] !== "production";
}

function parseJsonRecord(value: string): Record<string, unknown> {
  const o = JSON.parse(value) as unknown;
  if (o !== null && typeof o === "object" && !Array.isArray(o)) return o as Record<string, unknown>;
  throw new Error("invalid_json");
}

function fhWoodScope(auth: RequestAuth) {
  return factoryDepartmentRowScopeWhere(
    auth,
    fhWoodWorkOrdersTable.factoryId,
    fhWoodWorkOrdersTable.departmentId,
  );
}

function scopeFromPayload(payload: Record<string, unknown>): {
  factoryId: string | null;
  departmentId: string | null;
} {
  const factoryId =
    typeof payload["factory_id"] === "string" && payload["factory_id"] !== "" ? payload["factory_id"] : null;
  const departmentId =
    typeof payload["department_id"] === "string" && payload["department_id"] !== ""
      ? payload["department_id"]
      : null;
  return { factoryId, departmentId };
}

export class FactoryHubService {
  static async listWoodWorkOrders(auth: RequestAuth) {
    const scope = fhWoodScope(auth);
    const rows = scope
      ? await db.select().from(fhWoodWorkOrdersTable).where(scope)
      : await db.select().from(fhWoodWorkOrdersTable);
    return rows.map((r) => ({
      workOrderId: r.workOrderId,
      payload: parseJsonRecord(r.payload),
      factoryId: r.factoryId ?? null,
      departmentId: r.departmentId ?? null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  static async getWoodWorkOrder(workOrderId: string, auth: RequestAuth) {
    const whereBase = eq(fhWoodWorkOrdersTable.workOrderId, workOrderId);
    const whereClause = combineWhere(whereBase, fhWoodScope(auth));
    const [row] = await db.select().from(fhWoodWorkOrdersTable).where(whereClause);
    if (!row) return null;
    return {
      workOrderId: row.workOrderId,
      payload: parseJsonRecord(row.payload),
      factoryId: row.factoryId ?? null,
      departmentId: row.departmentId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  static async upsertWoodWorkOrder(workOrderIdParam: string | undefined, rawBody: unknown, auth: RequestAuth) {
    const payload = (
      workOrderIdParam ? UpdateFhWoodWorkOrderBody : CreateFhWoodWorkOrderBody
    ).parse(rawBody) as Record<string, unknown>;

    const id =
      workOrderIdParam ?? (typeof payload["work_order_id"] === "string" ? payload["work_order_id"] : "");
    if (!id) {
      const err = new Error("missing_work_order_id");
      (err as Error & { status: number }).status = 400;
      throw err;
    }

    if (workOrderIdParam && workOrderIdParam !== id) {
      const err = new Error("work_order_id_mismatch");
      (err as Error & { status: number }).status = 400;
      throw err;
    }

    const json = JSON.stringify(payload);
    const ts = nowIso();

    const [globalRow] = await db
      .select()
      .from(fhWoodWorkOrdersTable)
      .where(eq(fhWoodWorkOrdersTable.workOrderId, id));
    const existing = await FactoryHubService.getWoodWorkOrder(id, auth);

    if (workOrderIdParam && !globalRow) {
      const err = new Error("not_found");
      (err as Error & { status: number }).status = 404;
      throw err;
    }
    if (globalRow && !existing) {
      const err = new Error("forbidden");
      (err as Error & { status: number }).status = 403;
      throw err;
    }

    let { factoryId, departmentId } = scopeFromPayload(payload);
    if (existing) {
      if (!("factory_id" in payload)) factoryId = existing.factoryId ?? null;
      if (!("department_id" in payload)) departmentId = existing.departmentId ?? null;
    }

    assertScopedRowHasSomeAssignment(auth, factoryId, departmentId);
    assertScopedFactoryDepartment(auth, factoryId, departmentId);

    if (globalRow) {
      await db
        .update(fhWoodWorkOrdersTable)
        .set({ payload: json, updatedAt: ts, factoryId, departmentId })
        .where(eq(fhWoodWorkOrdersTable.workOrderId, id));
    } else {
      await db.insert(fhWoodWorkOrdersTable).values({
        workOrderId: id,
        payload: json,
        createdAt: ts,
        updatedAt: ts,
        factoryId,
        departmentId,
      });
    }

    await maybeSyncHubWoodOrderToWooden(payload, auth);

    const next = await FactoryHubService.getWoodWorkOrder(id, auth);
    if (!next) throw new Error("persist_failed");
    return next;
  }

  static async deleteWoodWorkOrder(workOrderId: string, auth: RequestAuth) {
    const whereClause = combineWhere(eq(fhWoodWorkOrdersTable.workOrderId, workOrderId), fhWoodScope(auth))!;
    const [row] = await db
      .delete(fhWoodWorkOrdersTable)
      .where(whereClause)
      .returning({ workOrderId: fhWoodWorkOrdersTable.workOrderId });
    return row ?? null;
  }

  static async getReference(key: string) {
    const [row] = await db
      .select()
      .from(fhReferenceSnapshotsTable)
      .where(eq(fhReferenceSnapshotsTable.key, key));
    if (!row) return null;
    return {
      key: row.key,
      payload: parseJsonRecord(row.payload) as Record<string, unknown>,
      updatedAt: row.updatedAt,
    };
  }

  static async putReference(key: string, rawBody: unknown) {
    const { payload } = PutFhReferenceSnapshotBody.parse(rawBody);
    const ts = nowIso();
    const json = JSON.stringify(payload);
    await db
      .insert(fhReferenceSnapshotsTable)
      .values({ key, payload: json, updatedAt: ts })
      .onConflictDoUpdate({
        target: fhReferenceSnapshotsTable.key,
        set: { payload: json, updatedAt: ts },
      });
    const next = await FactoryHubService.getReference(key);
    if (!next) throw new Error("persist_failed");
    return next;
  }

  static async listAnalysisSessions() {
    const rows = await db.select().from(fhWorkOrderAnalysisSessionsTable);
    return rows.map((r) => ({
      id: r.id,
      payload: parseJsonRecord(r.payload),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  static async getAnalysisSession(id: string) {
    const [row] = await db
      .select()
      .from(fhWorkOrderAnalysisSessionsTable)
      .where(eq(fhWorkOrderAnalysisSessionsTable.id, id));
    if (!row) return null;
    return {
      id: row.id,
      payload: parseJsonRecord(row.payload),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  static async createAnalysisSession(rawBody: unknown) {
    const body = CreateFhAnalysisSessionBody.parse(rawBody) as Record<string, unknown>;
    const id = typeof body["id"] === "string" ? body["id"] : "";
    if (!id) {
      const err = new Error("missing_session_id");
      (err as Error & { status: number }).status = 400;
      throw err;
    }

    const existing = await FactoryHubService.getAnalysisSession(id);
    if (existing) {
      const err = new Error("session_exists");
      (err as Error & { status: number }).status = 409;
      throw err;
    }

    const json = JSON.stringify(body);
    const ts = nowIso();
    const createdAt = typeof body["createdAt"] === "string" ? String(body["createdAt"]) : ts;

    await db.insert(fhWorkOrderAnalysisSessionsTable).values({
      id,
      payload: json,
      createdAt,
      updatedAt: ts,
    });

    const next = await FactoryHubService.getAnalysisSession(id);
    if (!next) throw new Error("persist_failed");
    return next;
  }

  static async updateAnalysisSession(id: string, rawBody: unknown) {
    const body = UpdateFhAnalysisSessionBody.parse(rawBody) as Record<string, unknown>;
    body["id"] = id;
    const json = JSON.stringify(body);
    const ts = nowIso();

    const existing = await FactoryHubService.getAnalysisSession(id);
    if (!existing) return null;

    await db
      .update(fhWorkOrderAnalysisSessionsTable)
      .set({ payload: json, updatedAt: ts })
      .where(eq(fhWorkOrderAnalysisSessionsTable.id, id));

    return await FactoryHubService.getAnalysisSession(id);
  }

  static async deleteAnalysisSession(id: string) {
    const [row] = await db
      .delete(fhWorkOrderAnalysisSessionsTable)
      .where(eq(fhWorkOrderAnalysisSessionsTable.id, id))
      .returning({ id: fhWorkOrderAnalysisSessionsTable.id });
    return row ?? null;
  }

  static readonly AUTOSAVE_KEY = "default" as const;

  static async getNewProjectAutosave() {
    const [row] = await db
      .select()
      .from(fhNewProjectAutosaveTable)
      .where(eq(fhNewProjectAutosaveTable.singletonKey, FactoryHubService.AUTOSAVE_KEY));
    if (!row) return null;
    return {
      singletonKey: "default" as const,
      payload: parseJsonRecord(row.payload),
      updatedAt: row.updatedAt,
    };
  }

  static async putNewProjectAutosave(rawBody: unknown) {
    const body = PutFhNewProjectAutosaveBody.parse(rawBody) as Record<string, unknown>;
    const ts = nowIso();
    const json = JSON.stringify(body);
    await db
      .insert(fhNewProjectAutosaveTable)
      .values({ singletonKey: FactoryHubService.AUTOSAVE_KEY, payload: json, updatedAt: ts })
      .onConflictDoUpdate({
        target: fhNewProjectAutosaveTable.singletonKey,
        set: { payload: json, updatedAt: ts },
      });
    const next = await FactoryHubService.getNewProjectAutosave();
    if (!next) throw new Error("persist_failed");
    return next;
  }

  static async seedFromFixtures() {
    if (!canSeed()) {
      const err = new Error("forbidden");
      (err as Error & { status: number }).status = 403;
      throw err;
    }

    let woodOrdersUpserted = 0;
    const ordersPath = path.join(dataDir, "woodHubSeedOrders.json");
    const rawOrders = readFileSync(ordersPath, "utf8");
    const orders = JSON.parse(rawOrders) as unknown[];
    if (!Array.isArray(orders)) throw new Error("invalid_seed_orders");

    for (const o of orders) {
      if (o === null || typeof o !== "object") continue;
      const payload = o as Record<string, unknown>;
      const woid = typeof payload["work_order_id"] === "string" ? payload["work_order_id"] : "";
      if (!woid) continue;
      await FactoryHubService.upsertWoodWorkOrder(woid, payload, DEFAULT_ANONYMOUS_AUTH);
      woodOrdersUpserted += 1;
    }

    let referenceKeysWritten = 0;
    const refsPath = path.join(dataDir, "referenceBundleSeed.json");
    const rawRefs = readFileSync(refsPath, "utf8");
    const refs = JSON.parse(rawRefs) as Record<string, unknown>;
    for (const [key, val] of Object.entries(refs)) {
      await FactoryHubService.putReference(key, { payload: val as Record<string, unknown> });
      referenceKeysWritten += 1;
    }

    return { ok: true as const, woodOrdersUpserted, referenceKeysWritten };
  }
}
