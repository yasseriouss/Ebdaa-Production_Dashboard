import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { getLibsqlUrl } from "./libsql-url";

const client = createClient({ url: getLibsqlUrl() });
const db = drizzle(client, { schema });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrate() {
  console.log("Running migrations...");
  try {
    const migrationsPath = path.resolve(__dirname, "../drizzle");
    await migrate(db, { migrationsFolder: migrationsPath });
    console.log("Migrations applied successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

void runMigrate();
