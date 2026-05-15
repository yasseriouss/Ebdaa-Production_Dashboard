/**
 * ETL: Postgres (Neon / Supabase / أي `postgresql://`) → SQLite/LibSQL المعرّف في `@workspace/db`.
 *
 * المتغيرات:
 *   SOURCE_DATABASE_URL — مطلوب (سلسلة اتصال Postgres).
 *   ETL_APPLY — ضع `1` أو `true` لتنفيذ الإدخال؛ بدون ذلك يعمل **جافًا** (يعرض الأعداد فقط).
 *   ETL_WIPE_SQLITE — ضع `1` لحذف بيانات الجداول المدعومة في SQLite قبل النسخ (خطير على بياناتك المحلية).
 *   LIBSQL_URL / SQLITE_FILE — كما في حزمة `lib/db` (هدف الكتابة).
 *
 * التشغيل:
 *   pnpm --filter @workspace/scripts run etl:pg-to-libsql
 */

import { Client } from "pg";
import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  metalWorkOrdersTable,
  metalProductionStagesTable,
  metalStageLogTable,
  woodenWorkOrdersTable,
  woodenProductionStagesTable,
  sharedProjectsTable,
  factoriesTable,
  departmentsTable,
  tasksTable,
  employeesTable,
} from "@workspace/db/schema";

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

function truthy(v: string | undefined): boolean {
  return v === "1" || v?.toLowerCase() === "true" || v?.toLowerCase() === "yes";
}

function pick(r: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (r[k] !== undefined && r[k] !== null) return r[k];
    const lower = k.toLowerCase();
    if (r[lower] !== undefined && r[lower] !== null) return r[lower];
  }
  return undefined;
}

function str(v: unknown, fallback = ""): string {
  if (v === null || v === undefined) return fallback;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function strNull(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  return str(v);
}

async function wipeSqlite(): Promise<void> {
  await db.delete(employeesTable);
  await db.delete(tasksTable);
  await db.delete(metalStageLogTable);
  await db.delete(metalProductionStagesTable);
  await db.delete(woodenProductionStagesTable);
  await db.delete(departmentsTable);
  await db.delete(factoriesTable);
  await db.delete(metalWorkOrdersTable);
  await db.delete(woodenWorkOrdersTable);
  await db.delete(sharedProjectsTable);
}

async function fetchAll(pg: Client, sqlLiteral: string): Promise<Record<string, unknown>[]> {
  const res = await pg.query(sqlLiteral);
  return res.rows as Record<string, unknown>[];
}

async function main(): Promise<void> {
  const sourceUrl = process.env.SOURCE_DATABASE_URL?.trim();
  if (!sourceUrl) {
    console.log(
      [
        "pg-to-libsql-etl: set SOURCE_DATABASE_URL to a Postgres connection string.",
        "Optional: ETL_APPLY=1 to write, ETL_WIPE_SQLITE=1 to clear target tables first.",
        "Target SQLite is configured via LIBSQL_URL / SQLITE_FILE (see docs/DATABASE.md).",
      ].join("\n"),
    );
    return;
  }

  const apply = truthy(process.env.ETL_APPLY);
  const wipe = truthy(process.env.ETL_WIPE_SQLITE);

  const pg = new Client({ connectionString: sourceUrl });
  await pg.connect();
  console.log("[ETL] Connected to Postgres source.");

  await db.run(sql.raw("PRAGMA foreign_keys = OFF"));
  if (wipe && apply) {
    console.log("[ETL] Wiping target SQLite tables…");
    await wipeSqlite();
  } else if (wipe && !apply) {
    console.log("[ETL] ETL_WIPE_SQLITE set but ETL_APPLY is off — skipping wipe.");
  }

  // --- Shared projects (no FK to orders) ---
  const spRows = await fetchAll(pg, `SELECT * FROM shared_projects`);
  console.log(`[ETL] shared_projects: ${spRows.length} rows from Postgres`);
  if (apply) {
    for (const batch of chunk(spRows, 200)) {
      await db
        .insert(sharedProjectsTable)
        .values(
          batch.map((r) => ({
            id: str(pick(r, "id")),
            name: str(pick(r, "name")),
            description: strNull(pick(r, "description")),
            client: strNull(pick(r, "client")),
            status: str(pick(r, "status"), "active"),
            createdAt: str(pick(r, "created_at", "createdAt"), new Date().toISOString()),
          })),
        )
        .onConflictDoNothing();
    }
  }

  // --- Metal work orders ---
  const moRows = await fetchAll(pg, `SELECT * FROM metal_work_orders`);
  console.log(`[ETL] metal_work_orders: ${moRows.length} rows from Postgres`);
  if (apply) {
    for (const batch of chunk(moRows, 100)) {
      await db
        .insert(metalWorkOrdersTable)
        .values(
          batch.map((r) => ({
            id: str(pick(r, "id")),
            moNumber: str(pick(r, "mo_number", "moNumber")),
            project: str(pick(r, "project")),
            client: str(pick(r, "client")),
            product: str(pick(r, "product")),
            qty: str(pick(r, "qty")),
            unit: str(pick(r, "unit"), "Unit"),
            status: str(pick(r, "status"), "تحت التصنيع"),
            completionPct: str(pick(r, "completion_pct", "completionPct"), "0"),
            deliveredQty: str(pick(r, "delivered_qty", "deliveredQty"), "0"),
            backlogQty: str(pick(r, "backlog_qty", "backlogQty"), "0"),
            notes: strNull(pick(r, "notes")),
            createdAt: str(pick(r, "created_at", "createdAt"), new Date().toISOString()),
            updatedAt: str(pick(r, "updated_at", "updatedAt"), new Date().toISOString()),
            deletedAt: strNull(pick(r, "deleted_at", "deletedAt")),
          })),
        )
        .onConflictDoNothing();
    }
  }

  // --- Wooden work orders ---
  const woRows = await fetchAll(pg, `SELECT * FROM wooden_work_orders`);
  console.log(`[ETL] wooden_work_orders: ${woRows.length} rows from Postgres`);
  if (apply) {
    for (const batch of chunk(woRows, 100)) {
      await db
        .insert(woodenWorkOrdersTable)
        .values(
          batch.map((r) => ({
            id: str(pick(r, "id")),
            orderNo: str(pick(r, "order_no", "orderNo")),
            extension: str(pick(r, "extension"), ""),
            client: str(pick(r, "client")),
            orderDate: str(pick(r, "order_date", "orderDate")),
            subProject: str(pick(r, "sub_project", "subProject")),
            product: str(pick(r, "product")),
            qty: str(pick(r, "qty")),
            done: str(pick(r, "done"), "0"),
            rem: str(pick(r, "rem"), "0"),
            status: str(pick(r, "status"), "تحت التصنيع"),
            prodDateEnd: strNull(pick(r, "prod_date_end", "prodDateEnd")),
            createdAt: str(pick(r, "created_at", "createdAt"), new Date().toISOString()),
            updatedAt: str(pick(r, "updated_at", "updatedAt"), new Date().toISOString()),
            deletedAt: strNull(pick(r, "deleted_at", "deletedAt")),
          })),
        )
        .onConflictDoNothing();
    }
  }

  // --- Factories → departments → tasks ---
  const facRows = await fetchAll(pg, `SELECT * FROM factories`);
  console.log(`[ETL] factories: ${facRows.length} rows`);
  if (apply) {
    for (const b of chunk(facRows, 200)) {
      await db
        .insert(factoriesTable)
        .values(b.map((r) => ({ id: str(pick(r, "id")), name: str(pick(r, "name")) })))
        .onConflictDoNothing();
    }
  }

  const depRows = await fetchAll(pg, `SELECT * FROM departments`);
  console.log(`[ETL] departments: ${depRows.length} rows`);
  if (apply) {
    for (const b of chunk(depRows, 200)) {
      await db
        .insert(departmentsTable)
        .values(
          b.map((r) => ({
            id: str(pick(r, "id")),
            factoryId: str(pick(r, "factory_id", "factoryId")),
            name: str(pick(r, "name")),
            processStep: Number(pick(r, "process_step", "processStep") ?? 0),
          })),
        )
        .onConflictDoNothing();
    }
  }

  const taskRows = await fetchAll(pg, `SELECT * FROM tasks`);
  console.log(`[ETL] tasks: ${taskRows.length} rows`);
  if (apply) {
    for (const b of chunk(taskRows, 200)) {
      await db
        .insert(tasksTable)
        .values(
          b.map((r) => ({
            id: str(pick(r, "id")),
            departmentId: str(pick(r, "department_id", "departmentId")),
            name: str(pick(r, "name")),
            type: str(pick(r, "type")),
            unitOfMeasure: str(pick(r, "unit_of_measure", "unitOfMeasure")),
            cycleTimeSeconds: Number(pick(r, "cycle_time_seconds", "cycleTimeSeconds") ?? 0),
            setupTimeMinutes: Number(pick(r, "setup_time_minutes", "setupTimeMinutes") ?? 0),
            batchSize: Number(pick(r, "batch_size", "batchSize") ?? 0),
            efficiencyFactor: str(pick(r, "efficiency_factor", "efficiencyFactor")),
            maxCapacityPerHour: str(pick(r, "max_capacity_per_hour", "maxCapacityPerHour")),
            hourlyOperatingCost: str(pick(r, "hourly_operating_cost", "hourlyOperatingCost")),
            laborRequired: Number(pick(r, "labor_required", "laborRequired") ?? 0),
          })),
        )
        .onConflictDoNothing();
    }
  }

  // --- Production stages (after orders) ---
  const mpsRows = await fetchAll(pg, `SELECT * FROM metal_production_stages`);
  console.log(`[ETL] metal_production_stages: ${mpsRows.length} rows`);
  if (apply) {
    for (const b of chunk(mpsRows, 200)) {
      await db
        .insert(metalProductionStagesTable)
        .values(
          b.map((r) => ({
            id: str(pick(r, "id")),
            metalOrderId: str(pick(r, "metal_order_id", "metalOrderId")),
            moNumber: str(pick(r, "mo_number", "moNumber")),
            stageName: str(pick(r, "stage_name", "stageName")),
            stageOrder: Number(pick(r, "stage_order", "stageOrder") ?? 0),
            qtyTarget: str(pick(r, "qty_target", "qtyTarget")),
            qtyDone: str(pick(r, "qty_done", "qtyDone"), "0"),
            status: str(pick(r, "status"), "لم يتم البدء"),
            notes: strNull(pick(r, "notes")),
            deletedAt: strNull(pick(r, "deleted_at", "deletedAt")),
            updatedAt: str(pick(r, "updated_at", "updatedAt"), new Date().toISOString()),
          })),
        )
        .onConflictDoNothing();
    }
  }

  const wpsRows = await fetchAll(pg, `SELECT * FROM wooden_production_stages`);
  console.log(`[ETL] wooden_production_stages: ${wpsRows.length} rows`);
  if (apply) {
    for (const b of chunk(wpsRows, 200)) {
      await db
        .insert(woodenProductionStagesTable)
        .values(
          b.map((r) => ({
            id: str(pick(r, "id")),
            woodenOrderId: str(pick(r, "wooden_order_id", "woodenOrderId")),
            stageName: str(pick(r, "stage_name", "stageName")),
            stageOrder: Number(pick(r, "stage_order", "stageOrder") ?? 0),
            qtyDone: str(pick(r, "qty_done", "qtyDone"), "0"),
            status: str(pick(r, "status"), "لم يتم البدء"),
            deletedAt: strNull(pick(r, "deleted_at", "deletedAt")),
            updatedAt: str(pick(r, "updated_at", "updatedAt"), new Date().toISOString()),
          })),
        )
        .onConflictDoNothing();
    }
  }

  const mslRows = await fetchAll(pg, `SELECT * FROM metal_stage_log`);
  console.log(`[ETL] metal_stage_log: ${mslRows.length} rows`);
  if (apply) {
    for (const b of chunk(mslRows, 200)) {
      await db
        .insert(metalStageLogTable)
        .values(
          b.map((r) => ({
            id: str(pick(r, "id")),
            metalOrderId: str(pick(r, "metal_order_id", "metalOrderId")),
            moNumber: str(pick(r, "mo_number", "moNumber")),
            logDate: str(pick(r, "log_date", "logDate")),
            stageName: str(pick(r, "stage_name", "stageName")),
            inputQty: str(pick(r, "input_qty", "inputQty"), "0"),
            outputQty: str(pick(r, "output_qty", "outputQty"), "0"),
            wasteQty: str(pick(r, "waste_qty", "wasteQty"), "0"),
            operator: strNull(pick(r, "operator")),
            notes: strNull(pick(r, "notes")),
            createdAt: str(pick(r, "created_at", "createdAt"), new Date().toISOString()),
            updatedAt: str(pick(r, "updated_at", "updatedAt"), new Date().toISOString()),
          })),
        )
        .onConflictDoNothing();
    }
  }

  const empRows = await fetchAll(pg, `SELECT * FROM employees`);
  console.log(`[ETL] employees: ${empRows.length} rows`);
  if (apply) {
    for (const b of chunk(empRows, 200)) {
      await db
        .insert(employeesTable)
        .values(
          b.map((r) => ({
            id: str(pick(r, "id")),
            name: str(pick(r, "name")),
            jobTitle: str(pick(r, "job_title", "jobTitle")),
            standardizedRole: str(pick(r, "standardized_role", "standardizedRole")),
            hireDate: strNull(pick(r, "hire_date", "hireDate")),
            departmentId: strNull(pick(r, "department_id", "departmentId")),
            factoryId: str(pick(r, "factory_id", "factoryId")),
          })),
        )
        .onConflictDoNothing();
    }
  }

  await db.run(sql.raw("PRAGMA foreign_keys = ON"));
  await pg.end();

  if (!apply) {
    console.log("[ETL] Dry run only. Set ETL_APPLY=1 to insert into SQLite.");
  } else {
    console.log("[ETL] Done. Applied inserts to LibSQL/SQLite.");
  }
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
