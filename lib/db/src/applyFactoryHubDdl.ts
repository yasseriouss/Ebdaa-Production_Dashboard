import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getLibsqlUrl } from "./libsql-url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, "../drizzle/0004_factory_hub_tables.sql");

async function main() {
  const client = createClient({
    url: getLibsqlUrl(),
    authToken: process.env.LIBSQL_AUTH_TOKEN?.trim() || undefined,
  });
  const sql = readFileSync(sqlPath, "utf8");
  for (const stmt of sql.split(";").map((s) => s.trim()).filter(Boolean)) {
    await client.execute(stmt);
  }
  console.log("Applied factory hub tables migration SQL.");
  client.close();
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
