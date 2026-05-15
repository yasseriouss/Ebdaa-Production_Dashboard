/** Applies auth / audit DDL idempotently (CREATE IF NOT EXISTS). Use when journal migrations cannot replay from scratch. */
import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getLibsqlUrl } from "./libsql-url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const client = createClient({ url: getLibsqlUrl() });
  const sqlPath = path.join(__dirname, "../drizzle/0005_auth_audit_tables.sql");
  const sql = readFileSync(sqlPath, "utf8");
  for (const stmt of sql.split(";").map((s) => s.trim()).filter(Boolean)) {
    await client.execute(stmt);
  }
  console.log("Applied auth/audit tables (IF NOT EXISTS).");
  client.close();
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
