import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm";
import { getLibsqlUrl } from "./libsql-url";

const client = createClient({ url: getLibsqlUrl() });
const db = drizzle(client);

const DDL = `
CREATE TABLE IF NOT EXISTS factories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  factory_id TEXT REFERENCES factories(id),
  name TEXT NOT NULL,
  process_step INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  department_id TEXT REFERENCES departments(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  unit_of_measure TEXT NOT NULL,
  cycle_time_seconds REAL NOT NULL,
  setup_time_minutes REAL NOT NULL,
  batch_size INTEGER NOT NULL,
  efficiency_factor TEXT NOT NULL,
  max_capacity_per_hour TEXT NOT NULL,
  hourly_operating_cost TEXT NOT NULL,
  labor_required INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  standardized_role TEXT NOT NULL,
  hire_date TEXT,
  department_id TEXT REFERENCES departments(id),
  factory_id TEXT NOT NULL REFERENCES factories(id)
);

CREATE TABLE IF NOT EXISTS metal_work_orders (
  id TEXT PRIMARY KEY,
  mo_number TEXT NOT NULL UNIQUE,
  project TEXT NOT NULL,
  client TEXT NOT NULL,
  product TEXT NOT NULL,
  qty TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'Unit',
  status TEXT NOT NULL,
  completion_pct TEXT NOT NULL DEFAULT '0',
  delivered_qty TEXT NOT NULL DEFAULT '0',
  backlog_qty TEXT NOT NULL DEFAULT '0',
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS metal_production_stages (
  id TEXT PRIMARY KEY,
  metal_order_id TEXT REFERENCES metal_work_orders(id),
  mo_number TEXT NOT NULL,
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  qty_target TEXT NOT NULL,
  qty_done TEXT NOT NULL DEFAULT '0',
  status TEXT NOT NULL,
  notes TEXT,
  deleted_at TEXT,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_metal_stage_order_name ON metal_production_stages(metal_order_id, stage_name);

CREATE TABLE IF NOT EXISTS metal_stage_log (
  id TEXT PRIMARY KEY,
  metal_order_id TEXT REFERENCES metal_work_orders(id),
  mo_number TEXT NOT NULL,
  log_date TEXT NOT NULL,
  stage_name TEXT NOT NULL,
  input_qty TEXT DEFAULT '0',
  output_qty TEXT DEFAULT '0',
  waste_qty TEXT DEFAULT '0',
  operator TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_metal_stage_log_unique ON metal_stage_log(metal_order_id, log_date, stage_name);

CREATE TABLE IF NOT EXISTS wooden_work_orders (
  id TEXT PRIMARY KEY,
  order_no TEXT NOT NULL UNIQUE,
  extension TEXT NOT NULL DEFAULT '',
  client TEXT NOT NULL,
  order_date TEXT NOT NULL,
  sub_project TEXT NOT NULL,
  product TEXT NOT NULL,
  qty TEXT NOT NULL,
  done TEXT NOT NULL DEFAULT '0',
  rem TEXT NOT NULL DEFAULT '0',
  status TEXT NOT NULL,
  prod_date_end TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS wooden_production_stages (
  id TEXT PRIMARY KEY,
  wooden_order_id TEXT REFERENCES wooden_work_orders(id),
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  qty_done TEXT NOT NULL DEFAULT '0',
  status TEXT NOT NULL,
  deleted_at TEXT,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wooden_stage_order_name ON wooden_production_stages(wooden_order_id, stage_name);

CREATE TABLE IF NOT EXISTS shared_projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  client TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL
);
`;

async function init() {
  console.log("Creating tables...");
  const statements = DDL.split(";").map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of statements) {
    await db.run(sql.raw(stmt));
  }
  console.log("All tables created.");
  client.close();
}

init().catch(console.error);
