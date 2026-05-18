import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { getLibsqlUrl } from "./libsql-url";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx") as typeof import("xlsx");

const thisDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(thisDir, "..", "..", "..");
const exportsDir = path.resolve(repoRoot, "exports");

function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(/[\\/?*[\]:]/g, "_").slice(0, 31);
  return cleaned || "sheet";
}

function rowsToSheet(rows: Record<string, unknown>[]): import("xlsx").WorkSheet {
  if (rows.length === 0) {
    return XLSX.utils.aoa_to_sheet([["(empty table)"]]);
  }
  return XLSX.utils.json_to_sheet(rows);
}

async function main(): Promise<void> {
  const client = createClient({ url: getLibsqlUrl() });

  const tablesRs = await client.execute(
    `SELECT name FROM sqlite_master
     WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
     ORDER BY name`,
  );
  const tableNames = tablesRs.rows.map((r) => String(r.name));

  const workbook = XLSX.utils.book_new();
  const indexRows: { table: string; rows: number; sheet: string }[] = [];

  for (const table of tableNames) {
    const dataRs = await client.execute(`SELECT * FROM "${table.replace(/"/g, '""')}"`);
    const rows = dataRs.rows.map((row) => {
      const out: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row)) {
        out[key] = value === null ? "" : value;
      }
      return out;
    });

    const sheetName = sanitizeSheetName(table);
    XLSX.utils.book_append_sheet(workbook, rowsToSheet(rows), sheetName);
    indexRows.push({ table, rows: rows.length, sheet: sheetName });
  }

  const readme = [
    ["Factory Data Hub — full database export"],
    ["Generated", new Date().toISOString()],
    ["Database", getLibsqlUrl()],
    [],
    ["Instructions"],
    ["• One worksheet per table; do not rename worksheets (sheet tab = table name)."],
    ["• Keep column headers unchanged; `id` columns are required for updates."],
    ["• Empty cells import as NULL where applicable."],
    ["• `auth_users.password_hash` is sensitive — avoid editing unless resetting passwords."],
    ["• Return this file after edits for re-import."],
    [],
    ["Table", "Row count", "Excel sheet"],
    ...indexRows.map((r) => [r.table, r.rows, r.sheet]),
  ];
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(readme), "_README");

  fs.mkdirSync(exportsDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const outPath = path.join(exportsDir, `factory-db-export-${stamp}.xlsx`);
  XLSX.writeFile(workbook, outPath);

  console.log(`Exported ${tableNames.length} tables → ${outPath}`);
  for (const r of indexRows) {
    console.log(`  ${r.table}: ${r.rows} rows`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
