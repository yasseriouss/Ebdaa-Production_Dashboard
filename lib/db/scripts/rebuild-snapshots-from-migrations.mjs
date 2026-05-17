/**
 * Rebuilds drizzle/meta/*_snapshot.json after migrations 0004+ by applying SQL
 * to a temp SQLite DB and introspecting with PRAGMAs (no interactive generate).
 */
import { createClient } from "@libsql/client";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPkgRoot = path.resolve(__dirname, "..");
const drizzleDir = path.join(dbPkgRoot, "drizzle");
const metaDir = path.join(drizzleDir, "meta");
const tempDbPath = path.join(drizzleDir, ".snapshot-build-temp.db");

const MIGRATIONS_IN_ORDER = [
  "0000_naive_hellfire_club.sql",
  "0001_fuzzy_tigra.sql",
  "0002_normal_the_enforcers.sql",
  "0003_foamy_killmonger.sql",
  "0004_factory_hub_tables.sql",
  "0005_auth_audit_tables.sql",
  "0006_production_row_scope.sql",
  "0007_metal_stage_log_sheet_shape.sql",
  "0008_production_soft_delete_timestamps.sql",
];

/** After applying this migration file, write drizzle/meta/{tag}_snapshot.json */
const EMIT_AFTER_FILE = new Map([
  ["0004_factory_hub_tables.sql", "0004"],
  ["0005_auth_audit_tables.sql", "0005"],
  ["0006_production_row_scope.sql", "0006"],
  ["0007_metal_stage_log_sheet_shape.sql", "0007"],
  ["0008_production_soft_delete_timestamps.sql", "0008"],
]);

function qIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

function readSqlFile(fileName) {
  const p = path.join(drizzleDir, fileName);
  return fs.readFileSync(p, "utf8");
}

function toStatements(sql) {
  const out = [];
  for (const chunk of sql.split(/--> statement-breakpoint/g)) {
    const cleaned = chunk
      .split("\n")
      .filter((line) => !/^\s*--/.test(line))
      .join("\n")
      .trim();
    if (!cleaned) continue;
    for (const part of cleaned.split(";")) {
      const st = part.trim();
      if (st) out.push(st);
    }
  }
  return out;
}

function mapFkAction(a) {
  if (!a || String(a).toUpperCase() === "NONE") return "no action";
  return String(a).toLowerCase().replace(/_/g, " ");
}

function drizzleDefault(colType, dflt) {
  if (dflt == null || dflt === "") return undefined;
  const t = String(colType).toLowerCase();
  const raw = String(dflt);
  if (t === "integer") {
    const n = Number(raw);
    if (!Number.isNaN(n) && raw.match(/^-?\d+$/)) return n;
  }
  return raw;
}

function fkConstraintName(tableFrom, columnsFrom, tableTo, columnsTo) {
  return `${tableFrom}_${columnsFrom.join("_")}_${tableTo}_${columnsTo.join("_")}_fk`;
}

function syntheticUniqueIndexName(table, colNames) {
  return `${table}_${colNames.join("_")}_unique`;
}

/** Matches drizzle schema column order so generate() does not emit reorder migrations. */
const COLUMN_ORDER_TS = {
  wooden_work_orders: [
    "id",
    "order_no",
    "extension",
    "client",
    "order_date",
    "sub_project",
    "product",
    "qty",
    "done",
    "rem",
    "status",
    "prod_date_end",
    "factory_id",
    "department_id",
    "created_at",
    "updated_at",
    "deleted_at",
  ],
  metal_work_orders: [
    "id",
    "mo_number",
    "project",
    "client",
    "product",
    "qty",
    "unit",
    "status",
    "completion_pct",
    "delivered_qty",
    "backlog_qty",
    "notes",
    "factory_id",
    "department_id",
    "created_at",
    "updated_at",
    "deleted_at",
  ],
};

function reorderTableColumns(tableName, columns) {
  const order = COLUMN_ORDER_TS[tableName];
  if (!order) return columns;
  const out = {};
  for (const k of order) {
    if (columns[k]) out[k] = columns[k];
  }
  for (const k of Object.keys(columns)) {
    if (!out[k]) out[k] = columns[k];
  }
  return out;
}

/** TS uses $defaultFn for updated_at; strip SQL defaults from meta for parity with TS. */
function applySnapshotColumnPatches(tableName, columns) {
  const stripUpdatedAtDefault = new Set([
    "wooden_work_orders",
    "wooden_production_stages",
    "metal_production_stages",
  ]);
  if (stripUpdatedAtDefault.has(tableName) && columns.updated_at?.default != null) {
    delete columns.updated_at.default;
  }
}

async function allRows(client, sql, args = []) {
  const r = await client.execute({ sql, args: args.length ? args : undefined });
  return r.rows.map((row) => {
    const o = {};
    for (const [k, v] of Object.entries(row)) {
      o[String(k).toLowerCase()] = v;
    }
    return o;
  });
}

async function buildTablesObject(client) {
  const tablesList = await allRows(
    client,
    `SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`,
  );
  const tables = {};

  for (const { name: table } of tablesList) {
    if (String(table).startsWith("sqlite_")) continue;
    const tq = qIdent(table);
    const colsRaw = await allRows(client, `PRAGMA table_info(${tq})`);
    const colsByCid = new Map();
    const colRows = colsRaw
      .map((r) => ({
        cid: Number(r.cid),
        name: r.name,
        type: r.type,
        notnull: Number(r.notnull),
        dflt_value: r.dflt_value,
        pk: Number(r.pk),
      }))
      .sort((a, b) => a.cid - b.cid);
    for (const cr of colRows) colsByCid.set(cr.cid, cr.name);

    const pkCols = colRows.filter((c) => c.pk > 0).sort((a, b) => a.pk - b.pk);
    const singlePk = pkCols.length === 1;
    const compositePkCols = pkCols.length > 1 ? pkCols : [];

    const columns = {};
    for (const c of colRows) {
      const typ = String(c.type || "text").toLowerCase();
      const drizzleType =
        typ === "" ? "text" : typ === "int" ? "integer" : typ === "double" ? "real" : typ;

      const entry = {
        name: c.name,
        type: drizzleType,
        primaryKey: Boolean(singlePk && c.pk > 0),
        notNull: Boolean(c.notnull),
        autoincrement: false,
      };
      const def = drizzleDefault(drizzleType, c.dflt_value);
      if (def !== undefined) entry.default = def;
      columns[c.name] = entry;
    }

    const columnsMeta = reorderTableColumns(table, columns);
    applySnapshotColumnPatches(table, columnsMeta);

    const compositePrimaryKeys = {};
    if (compositePkCols.length) {
      const colNames = compositePkCols.map((c) => c.name);
      const pkName = `${table}_${colNames.join("_")}_pk`;
      compositePrimaryKeys[pkName] = { name: pkName, columns: colNames };
    }

    const fkRows = await allRows(client, `PRAGMA foreign_key_list(${tq})`);
    const fkById = new Map();
    for (const row of fkRows) {
      const id = Number(row.id);
      if (!fkById.has(id)) fkById.set(id, []);
      fkById.get(id).push(row);
    }
    const foreignKeys = {};
    for (const group of fkById.values()) {
      group.sort((a, b) => Number(a.seq) - Number(b.seq));
      const tableTo = group[0].table;
      const columnsFrom = group.map((g) => g.from);
      const columnsTo = group.map((g) => g.to);
      const name = fkConstraintName(table, columnsFrom, tableTo, columnsTo);
      foreignKeys[name] = {
        name,
        tableFrom: table,
        tableTo,
        columnsFrom,
        columnsTo,
        onDelete: mapFkAction(group[0].on_delete),
        onUpdate: mapFkAction(group[0].on_update),
      };
    }

    const indexList = await allRows(client, `PRAGMA index_list(${tq})`);
    const indexes = {};

    for (const idx of indexList) {
      const idxName = idx.name;
      if (idxName.startsWith("sqlite_autoindex_")) {
        if (idx.origin === "u") {
          const info = await allRows(client, `PRAGMA index_info(${qIdent(idxName)})`);
          const colNames = info
            .sort((a, b) => Number(a.seqno) - Number(b.seqno))
            .map((i) => {
              const cid = Number(i.cid);
              if (cid < 0) return null;
              return colsByCid.get(cid);
            })
            .filter(Boolean);
          const friendly = syntheticUniqueIndexName(table, colNames);
          indexes[friendly] = {
            name: friendly,
            columns: colNames,
            isUnique: true,
          };
        }
        continue;
      }

      const isUnique = Number(idx.unique) === 1;
      const info = await allRows(client, `PRAGMA index_info(${qIdent(idxName)})`);
      const colNames = info
        .sort((a, b) => Number(a.seqno) - Number(b.seqno))
        .map((i) => {
          const cid = Number(i.cid);
          if (cid < 0) return null;
          return colsByCid.get(cid);
        })
        .filter(Boolean);
      indexes[idxName] = {
        name: idxName,
        columns: colNames,
        isUnique,
      };
    }

    tables[table] = {
      name: table,
      columns: columnsMeta,
      indexes,
      foreignKeys,
      compositePrimaryKeys,
      uniqueConstraints: {},
      checkConstraints: {},
    };
  }

  return tables;
}

async function snapshotPayload(client) {
  return {
    tables: await buildTablesObject(client),
    views: {},
    enums: {},
    _meta: { schemas: {}, tables: {}, columns: {} },
    internal: { indexes: {} },
  };
}

async function main() {
  try {
    fs.rmSync(tempDbPath, { force: true });
  } catch {
    /* noop */
  }

  const url = pathToFileURL(tempDbPath).href;
  const client = createClient({ url });

  const snap0003 = JSON.parse(fs.readFileSync(path.join(metaDir, "0003_snapshot.json"), "utf8"));
  let prevId = snap0003.id;

  for (const file of MIGRATIONS_IN_ORDER) {
    const sql = readSqlFile(file);
    for (const st of toStatements(sql)) {
      await client.execute(st);
    }
    const tag = EMIT_AFTER_FILE.get(file);
    if (!tag) continue;

    const id = crypto.randomUUID();
    const payload = await snapshotPayload(client);
    const body = {
      version: "6",
      dialect: "sqlite",
      id,
      prevId,
      ...payload,
    };
    prevId = id;

    const outPath = path.join(metaDir, `${tag}_snapshot.json`);
    fs.writeFileSync(outPath, `${JSON.stringify(body, null, 2)}\n`, "utf8");
    console.warn("wrote", path.relative(dbPkgRoot, outPath));
  }

  try {
    fs.rmSync(tempDbPath, { force: true });
  } catch {
    /* noop */
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
