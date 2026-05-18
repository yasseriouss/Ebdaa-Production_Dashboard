import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const drizzleDir = path.resolve(__dirname, "../drizzle");
const journalPath = path.join(drizzleDir, "meta", "_journal.json");

type Journal = { entries: Array<{ tag: string; when: number }> };

function readJournal(): Journal {
  const raw = fs.readFileSync(journalPath, "utf8");
  return JSON.parse(raw) as Journal;
}

export function migrationFileHash(tag: string): string {
  const filePath = path.join(drizzleDir, `${tag}.sql`);
  const body = fs.readFileSync(filePath, "utf8");
  return crypto.createHash("sha256").update(body).digest("hex");
}

type LibsqlClient = {
  execute: (sql: string, args?: unknown[]) => Promise<{ rows: unknown[] }>;
};

async function tableNames(client: LibsqlClient): Promise<Set<string>> {
  const rs = await client.execute("SELECT name FROM sqlite_master WHERE type = 'table'");
  const rows = rs.rows as Array<{ name?: string }>;
  return new Set(rows.map((r) => r.name).filter(Boolean) as string[]);
}

async function tableHasColumn(client: LibsqlClient, table: string, column: string): Promise<boolean> {
  const safe = /^[a-z_][a-z0-9_]*$/i;
  if (!safe.test(table)) throw new Error("invalid_table");
  const rs = await client.execute(`PRAGMA table_info(${table})`);
  const rows = rs.rows as Array<{ name?: string }>;
  return rows.some((r) => r.name === column);
}

async function indexExists(client: LibsqlClient, indexName: string): Promise<boolean> {
  const rs = await client.execute("SELECT 1 FROM sqlite_master WHERE type = 'index' AND name = ? LIMIT 1", [
    indexName,
  ]);
  return rs.rows.length > 0;
}

async function migrationsAppliedCount(client: LibsqlClient): Promise<number | null> {
  const meta = await client.execute(
    "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = '__drizzle_migrations' LIMIT 1",
  );
  if (meta.rows.length === 0) return null;
  const c = await client.execute('SELECT COUNT(*) AS c FROM "__drizzle_migrations"');
  const row = (c.rows[0] ?? {}) as { c?: number | bigint };
  return Number(row.c ?? 0);
}

/**
 * Highest journal index [0..entries.length-1] for this DB, or -1 if no baseline / fresh file.
 */
export async function detectStampIndex(client: LibsqlClient): Promise<number> {
  const tables = await tableNames(client);
  if (!tables.has("metal_work_orders")) return -1;

  if (tables.has("metal_stage_log") && (await tableHasColumn(client, "metal_stage_log", "metal_order_id"))) {
    return 7;
  }
  if (tables.has("wooden_work_orders") && (await tableHasColumn(client, "wooden_work_orders", "factory_id"))) {
    return 6;
  }
  if (tables.has("auth_users")) return 5;
  if (tables.has("fh_wood_work_orders")) return 4;
  if (tables.has("employees")) return 3;
  if (await indexExists(client, "metal_order_stage_unq")) return 2;
  if (tables.has("metal_production_stages") && (await tableHasColumn(client, "metal_production_stages", "notes"))) {
    return 1;
  }
  return 0;
}

export function isAlreadyExistsMigrationError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes("already exists");
}

/**
 * If the migrations ledger is empty but the database clearly has schema, stamp the latest
 * detected migration so `migrate()` only runs subsequent SQL files.
 */
export async function stampMigrationsIfEmpty(client: LibsqlClient): Promise<boolean> {
  const count = await migrationsAppliedCount(client);
  if (count === null || count > 0) return false;

  const idx = await detectStampIndex(client);
  if (idx < 0) return false;

  const journal = readJournal();
  const entry = journal.entries[idx];
  if (!entry) return false;

  const hash = migrationFileHash(entry.tag);
  await client.execute('INSERT INTO "__drizzle_migrations" ("hash", "created_at") VALUES (?, ?)', [
    hash,
    entry.when,
  ]);
  console.warn(`[migrate] Repaired __drizzle_migrations: stamped ${entry.tag} (index ${idx})`);
  return true;
}

/** Adds scope columns when `fh_wood_work_orders` predates migration 0006. */
export async function ensureFhWoodWorkOrdersScopeColumns(client: LibsqlClient): Promise<void> {
  const tables = await tableNames(client);
  if (!tables.has("fh_wood_work_orders")) return;
  if (!(await tableHasColumn(client, "fh_wood_work_orders", "factory_id"))) {
    await client.execute(
      "ALTER TABLE `fh_wood_work_orders` ADD `factory_id` text REFERENCES `factories`(`id`)",
    );
    console.warn("[migrate] Repaired fh_wood_work_orders: added factory_id");
  }
  if (!(await tableHasColumn(client, "fh_wood_work_orders", "department_id"))) {
    await client.execute(
      "ALTER TABLE `fh_wood_work_orders` ADD `department_id` text REFERENCES `departments`(`id`)",
    );
    console.warn("[migrate] Repaired fh_wood_work_orders: added department_id");
  }
}
