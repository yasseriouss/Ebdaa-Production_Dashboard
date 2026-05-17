import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { getLibsqlUrl } from "./libsql-url";
import { isAlreadyExistsMigrationError, stampMigrationsIfEmpty } from "./migrationRepair";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsPath = path.resolve(__dirname, "../drizzle");

async function runMigrate() {
  console.log("Running migrations...");
  const client = createClient({ url: getLibsqlUrl() });
  const db = drizzle(client, { schema });

  let stamped = await stampMigrationsIfEmpty(client);

  const apply = async () => {
    await migrate(db, { migrationsFolder: migrationsPath });
  };

  try {
    await apply();
    console.log("Migrations applied successfully!");
  } catch (error) {
    if (isAlreadyExistsMigrationError(error)) {
      if (!stamped) stamped = await stampMigrationsIfEmpty(client);
      if (stamped) {
        await apply();
        console.log("Migrations applied successfully!");
        return;
      }
    }
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    client.close();
  }
}

void runMigrate();
